FROM node:18

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 8080

RUN npm install -g serve

RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]

CMD ["serve", "-s", "build", "-l", "8080"]
