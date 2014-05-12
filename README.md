Transplant
==========

A tool to transplant commits from one Mercurial repository to another.


Requirements
------------

* Node.js 0.10+
* Mercurial
* Properly configured SSH access to source and destination repositories


Installation
------------

1. Run `npm install`.
2. Copy `config.example.js` to `config.js` and customize it as required.


Usage
-----

Start the server:

    npm start

Next, in another terminal:

    curl -i http://localhost:5000/transplant \
        -d src=transplant-src \
        -d dst=transplant-dst \
        -d rev=bd37dee7f3fb


Known issues
------------

* No error handling


Test branch
-----------

This is a test branch with a test pull request.
