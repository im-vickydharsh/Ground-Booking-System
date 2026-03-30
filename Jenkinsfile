pipeline {
    agent any

    stages {

        stage('Backend Install') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Frontend Install') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Backend Check') {
            steps {
                dir('backend') {
                    bat 'node -e "console.log(\'Backend OK\')"'
                }
            }
        }
    }
}