transplant
==========

A tool for transplanting commits between Mercurial repositories.


Requirements
------------

* Python 2.7 + pip
* Mercurial
* Properly configured SSH access to source and destination repositories


Installation
------------

1. Run `pip install -r requirements.txt`
2. Run `python transplant.py`


Usage
-----

Request:

    curl -X POST http://127.0.0.1:5000/transplant \
        -d src=transplant-src \
        -d dst=transplant-dst \
        -d rev=577f6e912b81


Response:

    {
      "tip": "26c63d4f1aa7"
    }

Testing
-------

Run `python transplant_test.py`


Docker
------

1. Build the image:
    ```
    docker build -t laggyluke/transplant .
    ```

2. Create a named container with persistent volumes:
    ```
    docker run -v /var/lib/transplant --name transplant-volumes busybox /bin/true
    ```

3. Put the RSA private key into `TRANSPLANT_ID_RSA` env var, e.g.:
    ```
    TRANSPLANT_ID_RSA=$(cat ~/.ssh/id_rsa)
    ```

4. Run the image using volumes from step 2 and RSA key from step 3:
    ```
    docker run -i -t -p 5000:5000 --rm \
        --volumes-from=transplant-volumes \
        --env TRANSPLANT_ID_RSA="$TRANSPLANT_ID_RSA" \
        laggyluke/transplant
    ```

5. The app is available on [http://localhost:5000/](http://localhost:5000/).
