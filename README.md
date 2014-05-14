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

1. Build the image: `docker/build.sh`
2. Run the image: `docker/run.sh`
3. The app is available on `localhost:49000` via port forwarding.
