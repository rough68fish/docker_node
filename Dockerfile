FROM node:lts
WORKDIR /app
COPY package*.json ./
# Install app dependencies
RUN npm install
COPY demo_app.js ./
COPY public ./public
EXPOSE 8080
CMD ["node", "demo_app.js"]