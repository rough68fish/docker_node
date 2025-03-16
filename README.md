# Docker Ollama Node (DON) Project

This project demonstrates how to set up a Node.js application using Docker. It includes instructions for building and running the application in a Docker container. The sample application is a basic chat interface that connects to an Ollama model running locally on the host machine.

## Prerequisites

- Ollama installed
  - model nous-hermes2 installed
- Docker installed on your machine
- Node installed on your machine
  - working npm
- Basic knowledge of Node.js and Docker

### Installing Ollama and nous-hermes2

Note: currently only works with Ollama. If you have a model installed that isn't nous-hermes2 the app will work but you will need to go to the settings page and select an installed model from the list before starting to chat.

- Download and install Ollama [https://ollama.com/](https://ollama.com/)

after its installed run the nous-hemes2 model:

```
C:\Users\nunya>ollama run nous-hermes2
pulling manifest
pulling 416e45a35835... 100% ▕████████████████████████████████████████████████████████▏ 6.1 GB
pulling c71d239df917... 100% ▕████████████████████████████████████████████████████████▏  11 KB
pulling a47b02e00552... 100% ▕████████████████████████████████████████████████████████▏  106 B
pulling 1691af48af21... 100% ▕████████████████████████████████████████████████████████▏  261 B
pulling f02dd72bb242... 100% ▕████████████████████████████████████████████████████████▏   59 B
pulling 4f5cf7e1adf4... 100% ▕████████████████████████████████████████████████████████▏  558 B
verifying sha256 digest
writing manifest
success
>>> do you know node
Yes, I am familiar with Node.js. It's a JavaScript runtime environment that executes JavaScript code on a server.
It is designed for building scalable network applications, such as web servers or real-time applications using its
Event-driven architecture and non-blocking input/output (I/O) model.

Would you like more information on how to use Node.js or any specific Node.js-based application?

```

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
docker build -t don_app .
```

### 5. Run the Docker Container

```sh
docker run -it --rm --name don_app_container -p 8080:8080 -vC:\Users\nunya\DON_Logs:/app/ext_logs don_app
```

or

```sh
docker run -d --rm --name don_app_container -p 8080:8080 -vC:\Users\nunya\DON_Logs:/app/ext_logs don_app
```

Explanation of the `docker run` command:

- **`docker run`**: This is the command to run a container from a Docker image.
- **`-it`**: This option combines two flags:
  - `-i` (interactive): Keeps STDIN open even if not attached.
  - `-t` (tty): Allocates a pseudo-TTY, which allows you to interact with the container via the terminal.
- **`-d`**: Run the container in detached mode (in the background).
- **`--rm`**: Automatically removes the container when it exits. This is useful for temporary containers that you don't want to keep around after they stop.
- **`--name don_app_container`**: Assign the name don_app_container to the container.
- **`-p 8080:8080`**: This option maps a port on the host to a port on the container:
  - The first `8080` is the port on the host machine.
  - The second `8080` is the port inside the container.
  This means that you can access the application running inside the container on port 8080 of the host machine.
- **`-v C:\Users\nunya\DON_Logs:/app/ext_logs`**: This option mounts a volume from the host to the container:
  - `C:\Users\nunya\DON_Logs` is the directory on the host machine.
  - `/app/ext_logs` is the directory inside the container.
  This means that any files written to `/app/ext_logs` inside the container will be stored in `C:\Users\nunya\DON_Logs` on the host machine, allowing for data persistence even after the container is removed.
- **`don_app`**: This is the name of the Docker image to run. The container will be created from this image.

### 6. Access the Application

Open your browser and navigate to `http://localhost:8080`.

### 7. Cleanup the image and container

```sh
docker stop don_app_container
docker rmi don_app
```

Stop the conainter the --rm in the docker run command should remove the don_app_container automatically eliminating the need to issue the command:
 
```sh
docker rm don_app_container
```

Remove the don_app image.

## Dockerfile

The `Dockerfile` contains the instructions to build the Docker image:

```Dockerfile
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

This project is licensed under the MIT License. See the [LICENSE](https://mit-license.org/) file for details.