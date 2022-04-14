FROM node:16-buster-slim

EXPOSE 3000

WORKDIR /app

ENV CHOKIDAR_USEPOLLING=true

COPY package.json /app
RUN npm install

COPY . .

CMD ["npm", "start"]
