resource "aws_iam_role_policy" "ecs_database_secret" {
  name = "${var.project_name}-${var.environment}-leer-clave-postgresql"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = aws_db_instance.main.master_user_secret[0].secret_arn
      }
    ]
  })
}
