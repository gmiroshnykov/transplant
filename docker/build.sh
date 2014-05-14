#!/usr/bin/env bash

if [ ! -f docker/id_rsa ]; then
  echo "Error: docker/id_rsa not found."
  echo "Please generate it using ssh-keygen or copy an existing one."
  echo "The corresponding SSH public key should be added to your Mercurial server(s)."
  exit 1
fi

docker build -t laggyluke/transplant .
