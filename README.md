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
3. Run `npm install`
2. Run `npm run bower-install`


Usage
-----

1. Run `python transplant.py`
2. Run `gulp`
3. Open [http://localhost:5000](http://localhost:5000/).


Testing
-------

Run `python transplant_test.py`


REST API
-------

The endpoint for performing transplants is '/transplant'. It expects a
json structure to be posted with three fields:

* The 'src' field is the source repository.
* The 'dst' field is the destination repository.
* The 'commits' field is an array of revisions to be transplanted between
repository. Each revision must be an object containing an 'id' field which
is the changeset id.

Example json structure:

    {
      "src": "transplant-src",
      "dst": "transplant-dst",
      "commits": [
        {
          "id": "530deede29af"
        }
      ]
    }

The 'Content-Type' header must be set to 'application/json'.
