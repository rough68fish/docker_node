# Docker Node Project

This project demonstrates how to set up a Node.js application using Docker. It includes instructions for building and running the application in a Docker container. The sample application is a basic chat interface that connects to an Ollama model running locally on the host machine.

## Prerequisites

- Docker installed on your machine
- Node installed on your machine
  - working npm
- Basic knowledge of Node.js and Docker

## Project Structure

```
docker_node/
├── dist
├── node_modules (excluded via .gitignore)
├── public
├── src/
│   └── demo_app.ts
├── .gitignore
├── Dockerfile
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/docker_node.git
cd docker_node
```

### 2. Install the node dependencies locally (for local build)

```sh
npm install
```

### 3. Compile ts (for local build)

```sh
npx tsx
```

### 4. Build the Docker Image

```sh
docker build -t docker_node_app .
```

### 5. Run the Docker Container

```sh
docker run -p 8080:8080 docker_node_app
```

### 6. Access the Application

Open your browser and navigate to `http://localhost:8080`.

## Dockerfile

The `Dockerfile` contains the instructions to build the Docker image:

```Dockerfile
# Use the official Node.js image as the base image
FROM node:lts
# Set the working directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application code
COPY tsconfig.json ./
COPY src ./src
COPY public ./public
# Compile the typescript to js
RUN npx tsc
# Expose the port the app runs on
EXPOSE 8080
# Command to run the application
CMD ["node", "dist/demo_app.js"]
```

## .dockerignore

The `.dockerignore` file specifies which files and directories to ignore when building the Docker image:

```
node_modules
npm-debug.log
```

## Application Code

The main application code is located in the `src` directory. The `demo_app.ts` file contains a simple Node.js server. This server renders a chat interface to an Ollama model running locally.

## References and Aknowledgements 
[Ollama.js (GitHub)](https://github.com/ollama/ollama-js)
[Visual Studio Code - Source Control Overview](https://code.visualstudio.com/docs/sourcecontrol/overview)
[Using Ollama APIs to generate responses and much more (Geshan Manandhar)](https://geshan.com.np/blog/2025/02/ollama-api/)
[Begginers Guide to use Docker](https://medium.com/@deepakshakya/beginners-guide-to-use-docker-build-run-push-and-pull-4a132c094d75)
[Nous Hemes2 Model (DOC's Brain)](https://ollama.com/library/nous-hermes2)

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.