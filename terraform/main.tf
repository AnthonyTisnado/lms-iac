terraform {
  required_version = ">= 1.10.0, < 2.0.0"
  backend "s3" {}
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 6.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.7" }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-2"
  validation {
    condition     = var.aws_region == "us-east-2"
    error_message = "El laboratorio FLOW se ejecuta solo en us-east-2."
  }
}
provider "aws" {
  region              = var.aws_region
  allowed_account_ids = ["637423561860"]
  default_tags { tags = { Proyecto = "grupo8", Ambiente = "dev", Laboratorio = "lab09" } }
}
locals { name = "lab09-grupo8-dev" }

data "archive_file" "handler" {
  type        = "zip"
  output_path = "${path.module}/handler.zip"
  source {
    filename = "index.py"
    content  = <<-PY
      import json
      def handler(event, context):
          return {"statusCode": 200, "headers": {"content-type": "application/json"}, "body": json.dumps({"proyecto": "LMS", "grupo": 8, "estado": "ok"})}
    PY
  }
}
resource "aws_iam_role" "lambda" {
  name               = "${local.name}-lambda"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "lambda.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.name}"
  retention_in_days = 1
}
resource "aws_iam_role_policy" "logs" {
  name   = "${local.name}-logs"
  role   = aws_iam_role.lambda.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Action = ["logs:CreateLogStream", "logs:PutLogEvents"], Resource = "${aws_cloudwatch_log_group.lambda.arn}:*" }] })
}
resource "aws_lambda_function" "health" {
  function_name    = local.name
  role             = aws_iam_role.lambda.arn
  runtime          = "python3.12"
  handler          = "index.handler"
  filename         = data.archive_file.handler.output_path
  source_code_hash = data.archive_file.handler.output_base64sha256
  memory_size      = 128
  timeout          = 3
  depends_on       = [aws_iam_role_policy.logs]
}
resource "aws_cognito_user_pool" "lab" {
  name                = local.name
  user_pool_tier      = "LITE"
  deletion_protection = "INACTIVE"
  admin_create_user_config { allow_admin_create_user_only = true }
}
resource "aws_cognito_user_pool_client" "lab" {
  name                = local.name
  user_pool_id        = aws_cognito_user_pool.lab.id
  generate_secret     = false
  explicit_auth_flows = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}
resource "aws_apigatewayv2_api" "lab" {
  name          = local.name
  protocol_type = "HTTP"
}
resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.lab.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.health.invoke_arn
  payload_format_version = "2.0"
}
resource "aws_apigatewayv2_route" "health" {
  api_id             = aws_apigatewayv2_api.lab.id
  route_key          = "GET /health"
  authorization_type = "AWS_IAM"
  target             = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}
resource "aws_apigatewayv2_stage" "dev" {
  api_id      = aws_apigatewayv2_api.lab.id
  name        = "dev"
  auto_deploy = true
  default_route_settings {
    throttling_burst_limit = 2
    throttling_rate_limit  = 1
  }
}
resource "aws_lambda_permission" "api" {
  statement_id  = "AllowLabApi"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.health.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lab.execution_arn}/*/GET/health"
}
output "api_endpoint" { value = "${aws_apigatewayv2_stage.dev.invoke_url}/health" }
output "lambda_name" { value = aws_lambda_function.health.function_name }
output "cognito_pool_id" { value = aws_cognito_user_pool.lab.id }
