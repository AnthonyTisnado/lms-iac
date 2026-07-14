output "vpc_id" {
  description = "Identificador de la VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Subredes publicas para el balanceador"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Subredes privadas para ECS"
  value       = aws_subnet.private[*].id
}

output "data_subnet_ids" {
  description = "Subredes privadas para RDS"
  value       = aws_subnet.data[*].id
}

output "api_url" {
  description = "Direccion publica de API Gateway"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "cognito_user_pool_id" {
  description = "Identificador del grupo de usuarios de Cognito"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Identificador del cliente de Cognito"
  value       = aws_cognito_user_pool_client.frontend.id
}

output "ecr_backend_url" {
  description = "Direccion del repositorio ECR del backend"
  value       = aws_ecr_repository.backend.repository_url
}
