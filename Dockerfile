FROM node:8.12.0-alpine

WORKDIR /srv/node

COPY ./build /srv/node/build
COPY ./package.json /srv/node/package.json
COPY ./package-lock.json /srv/node/package-lock.json

RUN apk --update add --no-cache git \
  && npm install --production \
  && npm cache clean --force \
  && apk del git

CMD npm start
