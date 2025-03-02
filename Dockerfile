FROM node:lts
# Create app directory
WORKDIR /app
# Install app dependencies
COPY package*.json ./
RUN npm install
# Bundle app source
COPY demo_app.js ./
COPY public ./public
# Expose port
EXPOSE 8080
# Run the app
CMD ["node", "demo_app.js"]