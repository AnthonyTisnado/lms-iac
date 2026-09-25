# Infraestructura LMSIAC

Esta carpeta contiene la infraestructura de AWS definida con Terraform.

## Primer uso

1. Copia `terraform.tfvars.example` como `terraform.tfvars`.
2. Configura tus credenciales de AWS fuera del repositorio.
3. Ejecuta `terraform init`.
4. Revisa los cambios con `terraform plan` antes de aplicar.

No guardes claves ni contrasenas dentro de archivos de Terraform.
