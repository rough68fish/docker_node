import { Ollama } from 'ollama';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

console.log('Starting DON Chat demo app...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('dirname:', __dirname);

const app = express();
const port = 8080;

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
}

let chatHistory: ChatEntry[] = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req: Request, res: Response) => {
  const chatHtml = chatHistory.map(entry => `
    <p><strong>${entry.role === 'user' ? 'You' : 'DON'}:</strong> ${entry.content}</p>
  `).join('');

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
        ${chatHtml}
      </div>
      <div class="input-container">
        <form action="/ask" method="post" onsubmit="showLoading()">
          <input type="text" id="question" name="question" placeholder="Type your question here...">
          <button type="submit">Ask</button>
        </form>
        <form action="/clear" method="post" style="margin-left: 10px;">
          <button type="submit">Clear Chat</button>
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

app.post('/ask', async (req: Request, res: Response) => {
  const question = req.body.question;
  chatHistory.push({ role: 'user', content: question });

  try {
    const ollama = new Ollama({ host: 'http://host.docker.internal:11434' });
    const response = await ollama.chat({
      model: 'nous-hermes2',
      messages: chatHistory,
    });
    const answer = response.message.content;
    chatHistory.push({ role: 'assistant', content: answer });

    const chatHtml = chatHistory.map(entry => `
      <p><strong>${entry.role === 'user' ? 'You' : 'DON'}:</strong> ${entry.content}</p>
    `).join('');

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
          ${chatHtml}
        </div>
        <div class="input-container">
          <form action="/ask" method="post" onsubmit="showLoading()">
            <input type="text" id="question" name="question" placeholder="Type your question here...">
            <button type="submit">Ask</button>
          </form>
          <form action="/clear" method="post" style="margin-left: 10px;">
            <button type="submit">Clear Chat</button>
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

app.post('/clear', (req: Request, res: Response) => {
  chatHistory = [];
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});