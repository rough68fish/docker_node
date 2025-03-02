FROM node:lts
# Create app directory
WORKDIR /app
# Install app dependencies
COPY package*.json ./
RUN npm install
# Bundle app source
COPY tsconfig.json ./
COPY src ./src
COPY public ./dist/public
COPY settings.json ./settings.json
# Build app
RUN npx tsc
# Expose port
EXPOSE 8080
# Run the app
CMD ["node", "dist/demo_app.js"]