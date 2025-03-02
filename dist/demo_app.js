"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ollama_1 = require("ollama");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const path_2 = require("path");
const fs_1 = __importDefault(require("fs"));
console.log('Starting DON Chat demo app...');
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_2.dirname)(__filename);
console.log('dirname:', __dirname);
// Read settings from settings.json
const settingsPath = path_1.default.join(__dirname, '../settings.json');
const settings = JSON.parse(fs_1.default.readFileSync(settingsPath, 'utf-8'));
const app = (0, express_1.default)();
const port = 8080;
let chatHistory = [];
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.get('/', (req, res) => {
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
      <link rel="stylesheet" href="${settings.stylePath}">
    </head>
    <body>
      <div class="title-bar">
        DON Chat
        <a href="/settings" class="settings-icon">&#9881;</a>
      </div>
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
        function scrollToBottom() {
          const chatContainer = document.getElementById('chat-container');
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        window.onload = scrollToBottom;
      </script>
    </body>
    </html>
  `);
});
app.get('/settings', (req, res) => {
    const lightSelected = settings.stylePath === '/styles.css' ? 'selected' : '';
    const darkSelected = settings.stylePath === '/styles-dark.css' ? 'selected' : '';
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Settings</title>
      <link rel="stylesheet" href="${settings.stylePath}">
    </head>
    <body>
      <div class="title-bar">Settings</div>
      <form action="/settings" method="post">
        <label for="style">Select Style:</label>
        <select id="style" name="style">
          <option value="/styles.css" ${lightSelected}>Light</option>
          <option value="/styles-dark.css" ${darkSelected}>Dark</option>
        </select>
        <button type="submit">Save</button>
      </form>
    </body>
    </html>
  `);
});
app.post('/settings', (req, res) => {
    const newStylePath = req.body.style;
    settings.stylePath = newStylePath;
    fs_1.default.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    res.redirect('/');
});
app.post('/ask', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const question = req.body.question;
    chatHistory.push({ role: 'user', content: question });
    try {
        const ollama = new ollama_1.Ollama({ host: settings.ollamaHost });
        const response = yield ollama.chat({
            model: settings.model,
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
        <link rel="stylesheet" href="${settings.stylePath}">
      </head>
      <body>
        <div class="title-bar">
          DON Chat
          <a href="/settings" class="settings-icon">&#9881;</a>
        </div>
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
          function scrollToBottom() {
            const chatContainer = document.getElementById('chat-container');
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
          window.onload = scrollToBottom;
        </script>
      </body>
      </html>
    `);
    }
    catch (error) {
        res.send(`
      <p>Error communicating with Ollama: ${error}</p>
      <a href="/">Try again</a>
    `);
    }
}));
app.post('/clear', (req, res) => {
    chatHistory = [];
    res.redirect('/');
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
