FROM python:3.4-alpine
MAINTAINER Atlassian Labs "https://botlab.hipch.at"

RUN apk update && apk upgrade && \
    apk add --no-cache gcc musl-dev libffi-dev openssl-dev bash git g++ make nodejs

WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY requirements.txt /usr/src/app
RUN pip install --no-cache-dir -r requirements.txt

COPY . /usr/src/app
RUN npm build

EXPOSE 3022

ENV PORT 3022
ENV MONGO_URL mongodb://localhost:27017/alias
ENV REDIS_URL redis://localhost:6379/alias
ENV NODE_ENV production

CMD ["gunicorn", "app:app", "-k aiohttp.worker.GunicornWebWorker", "--reload"]