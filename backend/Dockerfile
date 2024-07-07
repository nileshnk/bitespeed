FROM node:18.5-alpine as builder

WORKDIR  /usr/src/app

COPY package*.json .

RUN npm install --production

COPY . .

RUN npm run build

FROM node:18.5-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./

EXPOSE 3000

ENTRYPOINT ["node","./index.js"]
