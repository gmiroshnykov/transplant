from setuptools import setup, find_packages
from codecs import open
from os import path

here = path.abspath(path.dirname(__file__))

with open(path.join(here, 'DESCRIPTION.rst'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='transplant',
    version='0.0.1',
    description='A library for transplanting commits between Mercurial repositories',
    long_description=long_description,
    url='https://github.com/laggyluke/transplant',
    author='George Miroshnykov',
    author_email='gmiroshnykov@mozilla.com',
    license='MPL',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: Mozilla Public License 2.0 (MPL 2.0)',
        'Topic :: Software Development :: Version Control',
        'Programming Language :: Python :: 2',
    ],
    keywords='transplant mercurial',
    packages=find_packages(exclude=['tests*']),
    install_requires=[],
    extras_require = {
        'test': ['nose'],
    },
)
