import { Ollama } from 'ollama';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DON Chat</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="title-bar">DON Chat</div>
      <div class="chat-container" id="chat-container">
        <!-- Chat messages will be appended here -->
      </div>
      <div class="input-container">
        <form action="/ask" method="post" onsubmit="showLoading()">
          <input type="text" id="question" name="question" placeholder="Type your question here...">
          <button type="submit">Ask</button>
        </form>
      </div>
      <div id="loading">⏳ Loading...</div>
      <script>
        function showLoading() {
          document.getElementById('loading').style.display = 'block';
        }
      </script>
    </body>
    </html>
  `);
});

app.post('/ask', async (req, res) => {
  const question = req.body.question;

  try {
    const ollama = new Ollama({ host: 'http://host.docker.internal:11434' });
    const response = await ollama.chat({
      model: 'nous-hermes2',
      messages: [{ role: 'user', content: question }],
    });
    const answer = response.message.content;
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DON Chat</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <div class="title-bar">DON Chat</div>
        <div class="chat-container" id="chat-container">
          <p><strong>You:</strong> ${question}</p>
          <p><strong>DON:</strong> ${answer}</p>
        </div>
        <div class="input-container">
          <form action="/ask" method="post" onsubmit="showLoading()">
            <input type="text" id="question" name="question" placeholder="Type your question here...">
            <button type="submit">Ask</button>
          </form>
        </div>
        <div id="loading">⏳ Loading...</div>
        <script>
          function showLoading() {
            document.getElementById('loading').style.display = 'block';
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.send(`
      <p>Error communicating with Ollama: ${error}</p>
      <a href="/">Try again</a>
    `);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});