FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

RUN apk add --no-cache poppler-utils

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
