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
# COPY views since they are not compiled by tsc
COPY src/views ./dist/views
COPY settings.json ./settings.json
# Create logs directory
RUN mkdir -p /app/ext_logs
# Build app
RUN npx tsc
# Clean up
RUN rm -rf src
RUN rm ./tsconfig.json
RUN rm package*.json
# Expose port
EXPOSE 8080
# Run the app
CMD ["node", "dist/app.js"]