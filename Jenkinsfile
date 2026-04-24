pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git 'https://github.com/TanayBPatel/aws.git'
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh 'docker-compose down || true'
            }
        }

        stage('Build & Run') {
            steps {
                sh 'docker-compose up --build -d'
            }
        }
    }
}
