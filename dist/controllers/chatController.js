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
exports.postSettings = exports.getSettings = exports.postClear = exports.postAsk = exports.getChat = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ollama_1 = require("ollama");
const settingsPath = path_1.default.join(__dirname, '../../settings.json');
const settings = JSON.parse(fs_1.default.readFileSync(settingsPath, 'utf-8'));
let chatHistory = [];
const getChat = (req, res) => {
    const chatHtml = chatHistory.map(entry => `
    <p><strong>${entry.role === 'user' ? 'You' : 'DON'}:</strong> ${entry.content}</p>
  `).join('');
    res.render('chat', { chatHtml, stylePath: settings.stylePath });
};
exports.getChat = getChat;
const postAsk = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.render('chat', { chatHtml, stylePath: settings.stylePath });
    }
    catch (error) {
        res.send(`
      <p>Error communicating with Ollama: ${error}</p>
      <a href="/">Try again</a>
    `);
    }
});
exports.postAsk = postAsk;
const postClear = (req, res) => {
    chatHistory = [];
    res.redirect('/');
};
exports.postClear = postClear;
const getSettings = (req, res) => {
    const lightSelected = settings.stylePath === '/styles.css' ? 'selected' : '';
    const darkSelected = settings.stylePath === '/styles-dark.css' ? 'selected' : '';
    res.render('settings', { lightSelected, darkSelected, stylePath: settings.stylePath });
};
exports.getSettings = getSettings;
const postSettings = (req, res) => {
    const newStylePath = req.body.style;
    settings.stylePath = newStylePath;
    fs_1.default.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    res.redirect('/');
};
exports.postSettings = postSettings;
