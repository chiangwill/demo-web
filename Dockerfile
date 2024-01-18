From python:3.11.2

ENV PYTHONUNBUFFERED 1

RUN mkdir /demo

WORKDIR /demo

COPY requirements.txt /demo/

RUN pip install -r requirements.txt

COPY . /code/
