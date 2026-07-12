resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-postgresql"

  engine         = "postgres"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  storage_type       = "gp3"
  storage_encrypted  = true

  db_name                     = var.database_name
  username                    = var.database_username
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = true

  skip_final_snapshot = true

  tags = {
    Name = "${var.project_name}-${var.environment}-postgresql"
  }
}
