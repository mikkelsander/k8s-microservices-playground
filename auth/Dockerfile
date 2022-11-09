FROM node:18-alpine

ENV NODE_ENV development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY --chown=node:node . .

RUN npm run build

USER node

CMD [ "node", "dist/main.js" ]