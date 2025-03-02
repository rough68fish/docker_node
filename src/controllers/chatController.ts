import { Request, Response } from 'express';
import { ChatEntry } from '../models/chatEntry';
import fs from 'fs';
import path from 'path';
import { Ollama } from 'ollama';

const settingsPath = path.join(__dirname, '../../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

let chatHistory: ChatEntry[] = [];

export const getChat = (req: Request, res: Response) => {
  const chatHtml = chatHistory.map(entry => `
    <p><strong>${entry.role === 'user' ? 'You' : 'DON'}:</strong> ${entry.content}</p>
  `).join('');

  res.render('chat', { chatHtml, stylePath: settings.stylePath });
};

export const postAsk = async (req: Request, res: Response) => {
  const question = req.body.question;
  chatHistory.push({ role: 'user', content: question });

  try {
    const ollama = new Ollama({ host: settings.ollamaHost });
    const response = await ollama.chat({
      model: settings.model,
      messages: chatHistory,
    });
    const answer = response.message.content;
    chatHistory.push({ role: 'assistant', content: answer });

    const chatHtml = chatHistory.map(entry => `
      <p><strong>${entry.role === 'user' ? 'You' : 'DON'}:</strong> ${entry.content}</p>
    `).join('');

    res.render('chat', { chatHtml, stylePath: settings.stylePath });
  } catch (error) {
    res.send(`
      <p>Error communicating with Ollama: ${error}</p>
      <a href="/">Try again</a>
    `);
  }
};

export const postClear = (req: Request, res: Response) => {
  chatHistory = [];
  res.redirect('/');
};

const getModelOptions = (ollamaResponse: any, settings: any) => {
  return ollamaResponse.models.map((model: any) => ({
    name: model.name,
    selected: model.name === settings.model ? 'selected' : ''
  }));
};

export const getSettings = async (req: Request, res: Response) => {
  const lightSelected = settings.stylePath === '/styles.css' ? 'selected' : '';
  const darkSelected = settings.stylePath === '/styles-dark.css' ? 'selected' : '';

  try {
    const ollama = new Ollama({ host: settings.ollamaHost });
    const response = await ollama.list();
    const modelOptions = getModelOptions(response, settings); 
    res.render('settings', { lightSelected, darkSelected, stylePath: settings.stylePath, modelOptions });
  } catch (error) {
    res.send(`
      <p>Error retrieving models from Ollama: ${error}</p>
      <a href="/">Go back</a>
    `);
  }
};

export const postSettings = (req: Request, res: Response) => {
  const newStylePath = req.body.style;
  const newModel = req.body.model;
  settings.stylePath = newStylePath;
  settings.model = newModel;
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  res.redirect('/');
};