FROM ubuntu:12.04

ENV HOME /root
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update --yes
RUN apt-get install --yes python-dev python-setuptools mercurial openssh-client
RUN easy_install pip

RUN mkdir -p /root/.ssh
ADD docker/id_rsa /root/.ssh/id_rsa
RUN chmod 400 /root/.ssh/id_rsa
RUN ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

ADD docker/hgrc /root/.hgrc

ADD . /app
RUN pip install -r /app/requirements.txt

WORKDIR /app
CMD ["python", "transplant.py"]
EXPOSE 5000
