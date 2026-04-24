pipeline {
    agent any

    stages {
        stage('Build & Run') {
            steps {
                sh '''
                docker-compose down || true
                docker-compose up --build -d
                '''
            }
        }
    }
}
