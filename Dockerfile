FROM node:lts
WORKDIR /app
COPY demo_app.js ./
RUN npm i readline
EXPOSE 8080
CMD ["node", "demo_app.js"]