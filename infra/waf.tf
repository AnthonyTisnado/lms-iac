resource "aws_wafv2_web_acl" "frontend" {
  name  = "${var.project_name}-${var.environment}-frontend"
  scope = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "reglas-comunes"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "reglas-comunes"
      sampled_requests_enabled   = true
    }
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
