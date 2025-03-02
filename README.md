# Docker Ollama Node (DON) Project

This project demonstrates how to set up a Node.js application using Docker. It includes instructions for building and running the application in a Docker container. The sample application is a basic chat interface that connects to an Ollama model running locally on the host machine.

## Prerequisites

- Docker installed on your machine
- Node installed on your machine
  - working npm
- Basic knowledge of Node.js and Docker

## Project Structure

```
docker_node/
├── node_modules (excluded via .gitignore)
├── public/
│   ├── styles-dark.css
│   └── styles.css
├── src/
│   ├── app.ts
│   ├── controllers/
│   │   └── chatController.ts
│   ├── models/
│   │   └── chatEntry.ts
│   ├── routes/
│   │   └── index.ts
│   └── views/
│       ├── chat.ejs
│       └── settings.ejs
├── .gitignore
├── Dockerfile
├── package-lock.json
├── package.json
├── README.md
├── settings.json
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

The main application code is located in the `src` directory. The project follows the Model-View-Controller (MVC) architecture, which separates the application into three main components:

1. **Model**: Represents the data and business logic of the application. In this project, the `ChatEntry` interface in [`src/models/chatEntry.ts`](src/models/chatEntry.ts) defines the structure of a chat entry.

2. **View**: Represents the presentation layer of the application. The views are EJS templates located in the [`src/views`](src/views) directory. The main views are:
   - [`chat.ejs`](src/views/chat.ejs): Renders the chat interface.
   - [`settings.ejs`](src/views/settings.ejs): Renders the settings page where users can select the chat model and style.

3. **Controller**: Handles the user input and updates the model and view accordingly. The main controller is [`chatController.ts`](src/controllers/chatController.ts), which includes the following methods:
   - `getChat`: Renders the chat interface with the current chat history.
   - `postAsk`: Handles the user's question, sends it to the Ollama model, and updates the chat history with the response.
   - `postClear`: Clears the chat history.
   - `getSettings`: Renders the settings page with the current style and model options.
   - `postSettings`: Updates the settings based on the user's selection.

### Features

- **Model Selection**: Users can select the chat model from the settings page. The available models are retrieved from the Ollama API and displayed in a dropdown menu. The selected model is saved in the `settings.json` file and used for subsequent chat interactions.

- **Styles**: Users can select the style (light or dark) from the settings page. The selected style is applied to the chat interface and saved in the `settings.json` file. The styles are defined in the CSS files located in the [`public`](public) directory:
  - [`styles.css`](public/styles.css): Light theme.
  - [`styles-dark.css`](public/styles-dark.css): Dark theme.

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