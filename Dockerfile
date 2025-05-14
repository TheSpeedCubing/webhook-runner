FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package.json ./
COPY src ./src
COPY config.yml ./

RUN npm install --production

EXPOSE 80

CMD ["node", "src/index.js"]
