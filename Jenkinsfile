node ('master'){
  def nodeHome = tool name: 'nodeJS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
  // def workspace = pwd()
  env.PATH = "${nodeHome}/bin:${env.JENKINS_HOME}/bin:${env.PATH}"
  
  // env.PATH = "${tool 'Maven 3'}/bin:./:${env.PATH}"
  checkout scm
  stage('Process RSS Feed') {
    sh 'npm install'
    sh "node index.js ${env.SCAN_CUTOFF_DATE}"  
  }
}
