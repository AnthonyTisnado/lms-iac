pipeline {
    agent any

    stages {
        stage('Pruebas') {
            steps {
                dir('backend') {
                    sh 'mvn clean verify'
                }
            }
        }

        stage('Validar Terraform') {
            steps {
                dir('infra') {
                    sh 'terraform init -backend=false -input=false'
                    sh 'terraform validate'
                }
            }
        }
    }
}
