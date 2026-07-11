variable "aws_region" {
  description = "Region de AWS donde se crearan los recursos"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre corto del proyecto"
  type        = string
  default     = "lmsiac"
}

variable "environment" {
  description = "Ambiente de trabajo"
  type        = string
  default     = "dev"
}
