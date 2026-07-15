resource "aws_grafana_workspace" "main" {
  account_access_type      = "CURRENT_ACCOUNT"
  authentication_providers = ["AWS_SSO"]
  data_sources             = ["CLOUDWATCH"]
  description              = "Monitoreo del LMS"
  name                     = "${var.project_name}-${var.environment}-grafana"
  permission_type          = "SERVICE_MANAGED"
}
