variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region (us-central1 is cheapest)"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (staging|prod)"
  type        = string
  default     = "prod"
}

variable "bucket_name" {
  description = "Cloud Storage bucket for uploads + frontend"
  type        = string
  default     = "valentines-creator-prod"
}

variable "upload_ttl_days" {
  description = "Days before uploaded images are auto-deleted"
  type        = number
  default     = 30
}

variable "valentine_page_url" {
  description = "Base URL of the public Valentine page"
  type        = string
  default     = "https://d-solve.de"
}

variable "frontend_url" {
  description = "Base URL of the creator frontend (for CORS)"
  type        = string
  default     = "https://creator.d-solve.de"
}

variable "function_max_instances" {
  description = "Max concurrent Cloud Function instances (cost guard)"
  type        = number
  default     = 50
}
