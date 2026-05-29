output "bucket_name" {
  description = "Cloud Storage bucket name"
  value       = google_storage_bucket.main.name
}

output "function_urls" {
  description = "Deployed Cloud Function URLs"
  value = {
    for k, fn in google_cloudfunctions2_function.fn :
    k => fn.service_config[0].uri
  }
}

output "upload_endpoint" {
  description = "POST endpoint for creating valentines"
  value       = google_cloudfunctions2_function.fn["uploadImages"].service_config[0].uri
}

output "resolver_endpoint" {
  description = "GET endpoint for resolving short URLs"
  value       = google_cloudfunctions2_function.fn["resolveUrl"].service_config[0].uri
}

output "frontend_url" {
  description = "Public frontend URL (Cloud Storage website)"
  value       = "https://storage.googleapis.com/${google_storage_bucket.main.name}/website/index.html"
}

output "firestore_database" {
  description = "Firestore database name"
  value       = google_firestore_database.main.name
}
