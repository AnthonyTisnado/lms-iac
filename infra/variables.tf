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

variable "vpc_cidr" {
  description = "Rango de direcciones de la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "database_name" {
  description = "Nombre de la base de datos del sistema"
  type        = string
  default     = "lmsiac"
}

variable "database_username" {
  description = "Usuario administrador de PostgreSQL"
  type        = string
  default     = "lmsiac_admin"
}
