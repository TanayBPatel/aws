pipeline {
    agent any

    stages {

        stage('Setup Env') {
            steps {
                sh '''
                mkdir -p backend frontend

                # Backend .env
                echo "NODE_ENV=production" > backend/.env
                echo "PORT=5005" >> backend/.env
                echo "FRONTEND_URL=http://35.154.16.64" >> backend/.env
                echo "MONGODB_URI=mongodb+srv://sujalpatel23:123@cluster1.0hzznq3.mongodb.net/" >> backend/.env
                echo "JWT_SECRET=existing key" >> backend/.env
                echo "JWT_EXPIRE=30d" >> backend/.env

                # Frontend .env
                echo "VITE_API_URL=/api" > frontend/.env
                '''
            }
        }

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
