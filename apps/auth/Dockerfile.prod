# install dev dependencies needed for building the app
FROM node:18 as build

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run test && npm run test:e2e 

RUN npm run build


# use node-alpine image, copy build artifacts and omit dev dependencies used during build stage
FROM node:18-alpine as prod

WORKDIR /app

COPY --from=build package*.json ./
COPY --from=build /dist ./dist

RUN npm ci --omit=dev

USER node

CMD [ "node", "dist/main.js" ]