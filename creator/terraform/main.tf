terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ---------------------------------------------------------------------------
# Enable required APIs
# ---------------------------------------------------------------------------
locals {
  apis = [
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "storage.googleapis.com",
    "firestore.googleapis.com",
    "cloudscheduler.googleapis.com",
    "eventarc.googleapis.com",
    "artifactregistry.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each           = toset(local.apis)
  service            = each.value
  disable_on_destroy = false
}

# ---------------------------------------------------------------------------
# Cloud Storage bucket (uploads + frontend hosting)
# ---------------------------------------------------------------------------
resource "google_storage_bucket" "main" {
  name                        = var.bucket_name
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true

  # Auto-delete old uploads to keep storage costs near zero
  lifecycle_rule {
    condition {
      age            = var.upload_ttl_days
      matches_prefix = ["uploads/"]
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = [var.frontend_url, var.valentine_page_url]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  depends_on = [google_project_service.apis]
}

# Public read for uploaded images + frontend (objects only, no listing)
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.main.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# ---------------------------------------------------------------------------
# Firestore (URL mappings + configs)
# ---------------------------------------------------------------------------
resource "google_firestore_database" "main" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.apis]
}

# TTL policies: Firestore auto-deletes docs once expiresAt passes
resource "google_firestore_field" "urls_ttl" {
  project    = var.project_id
  database   = google_firestore_database.main.name
  collection = "urls"
  field      = "expiresAt"

  ttl_config {}
}

resource "google_firestore_field" "configs_ttl" {
  project    = var.project_id
  database   = google_firestore_database.main.name
  collection = "configs"
  field      = "expiresAt"

  ttl_config {}
}

# ---------------------------------------------------------------------------
# Service account for Cloud Functions
# ---------------------------------------------------------------------------
resource "google_service_account" "functions" {
  account_id   = "valentines-functions"
  display_name = "Valentines Creator Functions"
}

resource "google_project_iam_member" "functions_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

resource "google_project_iam_member" "functions_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

# ---------------------------------------------------------------------------
# Source code bucket for function deployments
# ---------------------------------------------------------------------------
resource "google_storage_bucket" "source" {
  name                        = "${var.bucket_name}-source"
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true

  depends_on = [google_project_service.apis]
}

# ---------------------------------------------------------------------------
# Cloud Functions (Gen 2)
#
# Note: the source archives (zip files) are produced by scripts/deploy.sh and
# uploaded to the source bucket before `terraform apply`. Here we reference
# them by object name.
# ---------------------------------------------------------------------------
locals {
  common_env = {
    GCS_BUCKET         = google_storage_bucket.main.name
    FIRESTORE_DB       = "valentines-${var.environment}"
    VALENTINE_PAGE_URL = var.valentine_page_url
    FRONTEND_URL       = var.frontend_url
    UPLOAD_TTL_DAYS    = tostring(var.upload_ttl_days)
  }

  functions = {
    uploadImages = { entry = "uploadImages", memory = "512Mi", timeout = 60 }
    resolveUrl   = { entry = "resolveUrl", memory = "256Mi", timeout = 10 }
    getConfig    = { entry = "getConfig", memory = "256Mi", timeout = 10 }
  }
}

resource "google_storage_bucket_object" "source_archive" {
  for_each = local.functions
  name     = "${each.key}-${filemd5("${path.module}/../dist/${each.key}.zip")}.zip"
  bucket   = google_storage_bucket.source.name
  source   = "${path.module}/../dist/${each.key}.zip"
}

resource "google_cloudfunctions2_function" "fn" {
  for_each = local.functions

  name     = each.key
  location = var.region

  build_config {
    runtime     = "nodejs18"
    entry_point = each.value.entry
    source {
      storage_source {
        bucket = google_storage_bucket.source.name
        object = google_storage_bucket_object.source_archive[each.key].name
      }
    }
  }

  service_config {
    max_instance_count    = var.function_max_instances
    min_instance_count    = 0 # scale to zero when idle = free
    available_memory      = each.value.memory
    timeout_seconds       = each.value.timeout
    service_account_email = google_service_account.functions.email
    environment_variables = local.common_env
  }

  depends_on = [google_project_service.apis]
}

# Allow unauthenticated invocation (public endpoints)
resource "google_cloud_run_service_iam_member" "public" {
  for_each = local.functions

  location = var.region
  service  = google_cloudfunctions2_function.fn[each.key].name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
