FROM jenkins/jenkins:2.568.1-lts-jdk21

USER root

RUN apt-get update && apt-get install -y --no-install-recommends maven && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://releases.hashicorp.com/terraform/1.15.8/terraform_1.15.8_linux_amd64.zip -o /tmp/terraform.zip && unzip /tmp/terraform.zip -d /usr/local/bin && rm /tmp/terraform.zip

USER jenkins
