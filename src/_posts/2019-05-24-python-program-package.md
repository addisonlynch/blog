---
layout: post
title: Python - From Program to Package
author: Addison Lynch
description: Making the most of Python's packaging system.
categories: [code]
tags: [python]
date:   2019-05-24 21:03:36 +0530
---

Say you're working on a Python project. An interface to the Bureau of Labor Statistics Public Data APIs, for instance. You're used to installing most of your Python packages using tools like [pip](https://medium.com/r/?url=https%3A%2F%2Fpypi.org%2Fproject%2Fpip%2F) or [Anaconda](https://medium.com/r/?url=https%3A%2F%2Fconda.io%2Fdocs%2F) (``pip install pandas`` seems easy enough, right?), and you wonder how you might package your code as such.

<!-- more -->

As it turns out, Python's wide-ranging set of tools makes this process quite easy. There are several core components to a well-constructed Python package:

* Your code (obviously)
* Tests
* Documentation
* Trinkets

As such, this is a four-part series on how to properly build and maintain a Python package.
We'll also touch on some more complex best practices for Python packages, including:

* Linting
* Advanced testing techniques/optimizations
* Continuous Integration (CI)
* Working with collaborators

The series will use the test project **pybls**, which is a wrapper around the [Bureau of Labor Statistics Public Data API](https://medium.com/r/?url=https%3A%2F%2Fwww.bls.gov%2Fdata%2F%23api).

# Part 1: Initializing & Configuring Your Package

Let's first build a minimal document structure for pybls:

```
pybls
-- pybls
----- __init__.py
-- setup.py
-- README.rst
```

There are a few components here worth noting:

## __init__.py

The ``__init__.py`` file initializes pybls as a Python package. It must be included in all directories and sub-directories in your package. For a more detailed explanation of Python modules and packages, see the Python documentation on modules and packages.

## setup.py

The ``setup.py`` file is a script that will serve as the configuration file for the pybls package. It will contain a trove of settings for your project, including:

* Version
* Description & classifiers (tags)
* Author information
* Installation procedures & required dependencies

This information will be used by the ``setuptools`` package (Python's build system).

```python
from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))

def parse_requirements(filename):
    with open(filename) as f:
        required = f.read().splitlines()
        return required

# Get the long description from the relevant file
with codecs.open('README.rst', encoding='utf-8') as f:
    long_description = f.read()

setup(
    name="pyBLS",
    version=find_version('pyBLS', '__init__.py'),
    description="Python wrapper for the Bureau of Labor Statistics "
                "Public Data API",
    long_description=long_description,

    # The project URL.
    url='https://github.com/addisonlynch/pyBLS',
    download_url='https://github.com/addisonlynch/pyBLS/releases',

    # Author details
    author='Addison Lynch',
    author_email='ahlshop@gmail.com',
    test_suite='pytest',

    # Choose your license
    license='Apache',

    classifiers=[
        # How mature is this project? Common values are
        # 3 - Alpha
        # 4 - Beta
        # 5 - Production/Stable
        'Development Status :: 4 - Beta',

        # Indicate who your project is intended for
        'Intended Audience :: Developers',
        'Intended Audience :: Financial and Insurance Industry',
        'Topic :: Office/Business :: Financial :: Investment',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Operating System :: OS Independent',

        # Pick your license as you wish (should match "license" above)
        'License :: OSI Approved :: Apache Software License',

        # Specify the Python versions you support here. In particular, ensure
        # that you indicate whether you support Python 2, Python 3 or both.
        'Programming Language :: Python',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6'
    ],

    # What does your project relate to?
    keywords='BLS labor Statistics',

    # You can just specify the packages manually here if your project is
    # simple. Or you can use find_packages.
    packages=find_packages(exclude=["contrib", "docs", "tests*"]),

    # List run-time dependencies here. These will be installed by pip when your
    # project is installed.
    install_requires=parse_requirements("requirements.txt"),
    setup_requires=['pytest-runner'],
    tests_require="pytest",
    # If there are data files included in your packages that need to be
    # installed, specify them here. If using Python 2.6 or less, then these
    # have to be included in MANIFEST.in as well.
    package_data={
        'pyBLS': [],
    },


)
```

The recommended way to list the dependencies for your project is within a text file named ``requirements.txt`` with each dependency listed on its own line. For example, we'll use:

```
pandas
requests
```

Since ``pybls`` requires both pandas and requests to execute its code. After creating this file, the document structure now looks as follows:

```
pybls
-- pybls
----- __init__.py
-- requirements.txt
-- setup.py
-- README.rst
```

Now that we've setup our package, it's time to add the code.

# Part 2: Adding Your Code

We'll use an object-oriented approach to pybls. Here's a skeleton implementation that will be useful for demonstration purposes:

```python
def get_series(series=None, start=None, end=None,
                   catalog=None, calculations=None, annual_average=None,
                   retry_count=3, pause=0.001, session=None, api_key=None):
    if api_key is None and os.getenv("BLS_API_KEY") is None:
        return BLSv1Reader(series=series, start=start, end=end,
                           retry_count=retry_count, pause=pause,
                           session=session).fetch()
    else:
        return BLSv2Reader(series=series, start=start, end=end,
                           catalog=catalog, calculations=calculations,
                           annual_average=annual_average,
                           retry_count=retry_count, pause=pause,
                           session=session).fetch()
```

Ignore the mumbo jumbo. We're focused on get_series, which will return a given dataset from the BLS API. We'll place this file (data.py) within the nested pybls directory:

```
pybls
-- pybls
----- __init__.py
----- data.py
-- requirements.txt
-- setup.py
-- README.rst
```

# Part 3: Writing and Implementing Tests

[Test-driven development](https://medium.com/r/?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FTest-driven_development) is a software development methodology which favors the writing of tests first, then code to pass those tests.

Though we've already written our code, it's important to remember that **one of the essential components of a well-written Python package is exhaustive tests**. 

To handle testing, we'll use [pytest](https://medium.com/r/?url=https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dpytest%26rlz%3D1C1CHBF_enUS741US741%26oq%3Dpytest%26aqs%3Dchrome..69i57j69i60l5.494j0j4%26sourceid%3Dchrome%26ie%3DUTF-8), a testing framework that is widely used throughout the Python community. We chose ``pytest`` over other options such as ``unittest`` for its simplicity and scalable design.

Here are a few simple tests to run on the example project:

```python
import pytest

from pyBLS.v1 import BLSv1Reader
from pyBLS.utils.exceptions import BLSSeriesError


class TestBLS(object):

    def setup_class(self):
        self.good_series_1 = ["MPU4900012"]

    def test_invalid_series_name_single(self):

        with pytest.raises(BLSSeriesError):
            BLSv1Reader("BADSERIES").fetch()

    def test_invalid_series_name_batch(self):

        with pytest.raises(BLSSeriesError):
            BLSv1Reader(["MPU4900012", "BADSERIES"]).fetch()

    def test_invalid_date_1(self):
        with pytest.raises(ValueError):
            BLSv1Reader(self.good_series_1, start="BAD").fetch()
```

So we've written some tests which ensure that the proper errors are raised when bad information is passed to get_series. To run the tests, we can simply use the command:

```bash
pytest pybls
```

from the root directory of our package. ``pytest`` will collect and run our tests. Our directory structure now looks as follows:

```
pybls
-- pybls
---- __init__.py
---- data.py
---- tests
------ test_data.py
-- requirements.txt
-- setup.py
-- README.rst
```

# Part 4: Documentation

Your package's documentation should be as exhaustive as your tests, and as descriptive as need be for those who are first looking at your project.

[Sphinx](https://medium.com/r/?url=http%3A%2F%2Fwww.sphinx-doc.org%2Fen%2Fmaster%2F) is a great tool for writing documentation for Python packages. Sphinx, like our README.rst file, uses reStructuredText markup, an easy-to-use syntax which supports features such as embedded code (which runs, too!) and autodocumentation.

> See the [Sphinx documentation](https://medium.com/r/?url=http%3A%2F%2Fwww.sphinx-doc.org%2Fen%2Fmaster%2Fusage%2Fquickstart.html) for a more detailed set of instructions.

Sphinx can be installed with:

```bash
pip install sphinx
```

To create our documentation, we'll first create a ``docs`` directory within our root ``pybls`` directory. We then run the command ``sphinx-quickstart``. The directory structure will now appear as:

```
pybls
-- docs
---- source
------ conf.py
------ index.rst
-- pybls
---- __init__.py
---- data.py
---- tests
------ test_data.py
-- requirements.txt
-- setup.py
-- README.rst
```

``conf.py`` stores much of the information about the documentation (it is similar to ``setup.py``).