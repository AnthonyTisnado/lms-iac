resource "aws_iam_role_policy" "ecs_jwt_secret" {
  name = "${var.project_name}-${var.environment}-leer-clave-jwt"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = aws_secretsmanager_secret.jwt.arn
      }
    ]
  })
}
