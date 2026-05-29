# Remote state storage in GCS.
#
# Before first `terraform init`, create the state bucket manually:
#   gsutil mb -l us-central1 gs://valentines-creator-tfstate
#   gsutil versioning set on gs://valentines-creator-tfstate
#
# Then uncomment the block below and run `terraform init`.

# terraform {
#   backend "gcs" {
#     bucket = "valentines-creator-tfstate"
#     prefix = "creator"
#   }
# }
