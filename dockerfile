FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN touch database.yml

CMD ["npm", "run","start:dev"]