#!/usr/bin/env bash
if [ "$TRANSPLANT_ID_RSA" == "" ]; then
  echo "ERROR: TRANSPLANT_ID_RSA not set"
  exit 1
fi

echo "$TRANSPLANT_ID_RSA" > ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa

python transplant.py
