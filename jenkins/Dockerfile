FROM jenkins/jenkins:2.568.1-lts-jdk21

USER root

RUN apt-get update && apt-get install -y --no-install-recommends maven && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://releases.hashicorp.com/terraform/1.15.8/terraform_1.15.8_linux_amd64.zip -o /tmp/terraform.zip && unzip /tmp/terraform.zip -d /usr/local/bin && rm /tmp/terraform.zip

RUN apt-get update && apt-get install -y --no-install-recommends python3-venv && python3 -m venv /opt/checkov && /opt/checkov/bin/pip install --no-cache-dir checkov && ln -s /opt/checkov/bin/checkov /usr/local/bin/checkov && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-29.6.1.tgz -o /tmp/docker.tgz && tar -xzf /tmp/docker.tgz -C /tmp docker/docker && mv /tmp/docker/docker /usr/local/bin/docker && rm -rf /tmp/docker /tmp/docker.tgz

RUN curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o /tmp/awscliv2.zip && unzip -q /tmp/awscliv2.zip -d /tmp && /tmp/aws/install && rm -rf /tmp/aws /tmp/awscliv2.zip

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt

RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

USER jenkins
