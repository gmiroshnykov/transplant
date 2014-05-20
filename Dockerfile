FROM ubuntu:12.04

ENV HOME /root
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update --yes
RUN apt-get install --yes python-dev python-setuptools mercurial openssh-client
RUN easy_install pip

RUN mkdir -p /root/.ssh
RUN ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

ADD . /app
RUN pip install -r /app/requirements.txt

ENV TRANSPLANT_WORKDIR /var/lib/transplant
VOLUME ["/var/lib/transplant"]
WORKDIR /app

CMD ["./docker-run.sh"]

EXPOSE 5000
