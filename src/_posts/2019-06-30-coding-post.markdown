---
layout: post
title: Parametrization Using pytest
description: Harnessing the power of dependency injection and Python decorators.
author: Addison Lynch
categories: [code, finance]
date:   2019-05-23 21:03:36 +0530
---

There are plenty of instances in which boilerplate code is written. One of
these may involve checking the types of multiple function or method calls,
which can lead to situations like the following. Consider the [Stocks](https://iextrading.com/developer/docs/#stocks) endpoints of IEX as used in
``iexfinance``. There are many, many endpoints like Book, Chart, and Dividends.

<!--more-->

### Problem: Boilerplate Code

```python
import pandas as pd

class TestStocks(object):

    def setup_class(self):
        self.stock = Stock("AAPL", output_format="pandas")

    def test_book(self):
        data = self.stock.get_book()

        assert isinstance(data, pd.DataFrame)

    def test_chart(self):
        data = self.stock.get_chart()

        assert isinstance(data, pd.DataFrame)

    def test_company(self):
        data = self.stock.get_company()

        assert isinstance(data, pd.DataFrame)
```

It's clear here that we are running ``assert isinstance(data, pd.DataFrame)``
in each test method. What's the best way to clear this up? Surely we can write
this in less code.

## Solution: Parametrize with ``pytest.mark.parametrize``

With ``pytest.mark.parametrize``, we can store the value of each function call.
Let's use a more general example to display how this works. Consider the class
``foo``:

```python
class foo(object):

    def a(self):
        return 1

    def b(self):
        return 2

    def c(self):
        return 3
```

Say we'd like to test the functionality of ``a``, ``b``, and ``c``.

```python
import pandas as pd


methods = [
    ("a", 1),
    ("b", 2),
    ("c", 3)
]

class TestStocks(object):

    def setup_class(self):
        self.foo = foo()

    @pytest.mark.parametrize(methods)
    def test_format(self, methods):
        assert self.foo.getattr(methods[0]) == methods[1]
```

This uses a significant amount less code. For the example using pyTD:

```python
import pandas as pd

methods = [
    "get_book",
    "get_chart",
    "get_company"
]

class TestStock(object):

    def setup_class(self):
        self.stock = Stock("AAPL", output_format='pandas')

    @pytest.mark.parametrize(methods)
    def test_format(self, methods):
        assert isinstance(self.Stock.getattr(methods[0]), pd.DataFrame)
```

Though the amount of boilerplate code saved may not be immediately obvious in
this example, consider the fact that there are over 20 Stocks endpoints. Thus
in the end, we've saved ourselves more than 20 method definitions for a simple
formatting sanity check.

### What's really happening?

You might wonder. Under the hood, ``pytest.mark.parametrize`` is automatically-generating test methods to be run.