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

The endpoint for performing transplants is `/transplant`.
It expects a JSON structure to be posted with three fields:

* The `src` field is the source repository.
* The `dst` field is the destination repository.
* The `items` field is an array of items to be transplanted from source to destination repository.

Each item can be:

1. A single commit, e.g.

    ```json
    {
        "commit": "530deede29af",
        "message": "(optional) override commit message"
    }
    ```

2. A [revset](http://www.selenic.com/hg/help/revsets) that will be squashed, e.g.

    ```json
    {
        "revset": "4c6efadbb0e0 + 035d8c4536cc + 4095850df1d8",
        "message": "(optional) sqhashed commits message"
    }
    ```

Full example:

```json
{
    "src": "mozilla-central",
    "dst": "mozilla-aurora",
    "items": [
        {
            "commit": "530deede29af"
        },
        {
            "commit": "89056c67ff86",
            "message": "new commit message"
        },
        {
            "revset": "c4b79128d2ef::a72b444f86ac",
            "message": "transplanted commits between c4b79128d2ef and a72b444f86ac"
        }
    ]
}
```

The `Content-Type` request header must be set to `application/json`.
