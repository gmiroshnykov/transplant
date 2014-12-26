transplant
==========

A library for transplanting commits between Mercurial repositories.


Usage
-----

```python
from transplant import Transplant

transplant = Transplant()

src_dir = '/path/to/source/repository'
dst_dir = '/path/to/destination/repository'
items = [
    # simply transplant the commit as is
    {
        'commit': '2a3953d2df3e'
    },

    # change commit's message during the transplant
    {
        'commit': '2a3953d2df3e',
        'message': 'A new message'
    },

    # transplant multiple commits and squash them into one
    {
        'commits': ['2a3953d2df3e', '301ab7ec92c1', 'cd11bfc5ac0e'],
        'message': 'A new message for squashed commits'
    }
]

try:
    result = transplant.transplant(src_dir, dst_dir, items)
    # result == {'tip': '33dbd06d2fb1'}
except e:
    # transplant failed
```
