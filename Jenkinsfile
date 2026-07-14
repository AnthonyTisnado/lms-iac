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
    }
}
