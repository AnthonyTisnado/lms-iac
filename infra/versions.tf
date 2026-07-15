terraform {
  required_version = ">= 1.8.0"

  backend "s3" {
    bucket       = "lmsiac-terraform-state-964775859379"
    key          = "dev/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}
