resource "aws_wafv2_web_acl" "frontend" {
  name  = "${var.project_name}-${var.environment}-frontend"
  scope = "CLOUDFRONT"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-${var.environment}-frontend"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend"
  }
}
