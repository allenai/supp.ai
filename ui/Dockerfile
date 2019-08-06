FROM node:10.16.1-alpine

WORKDIR /usr/local/src/skiff/app/ui/

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-development}

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

ENTRYPOINT [ "yarn" ]
CMD [ "start" ]
