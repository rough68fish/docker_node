import { Request, Response } from 'express';
import { SessionData } from 'express-session';

// Extend the express-session module to include custom properties in the session data
declare module 'express-session' {
  interface SessionData {
    chatHistory?: ChatEntry[];
    sessionId?: string;
  }
}

import { ChatEntry } from '../models/chatEntry';
import fs from 'fs';
import path from 'path';
import { Ollama } from 'ollama';
import { v4 as uuidv4 } from 'uuid';

// Load settings from the settings.json file
const settingsPath = path.join(__dirname, '../../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

// Handler to render the chat page with the current chat history
export const getChat = (req: Request, res: Response) => {
  const chatHistory = req.session.chatHistory || [];
  const chatHtml = chatHistory.map((entry: ChatEntry) => `
    <p><strong>${entry.role === 'user' ? 'You' : 'DON'}:</strong> ${entry.content}</p>
  `).join('');

  res.render('chat', { chatHtml, stylePath: settings.stylePath });
};

// Handler to process a new question from the user and get a response from Ollama
export const postAsk = async (req: Request, res: Response) => {
  const question = req.body.question;
  req.session.chatHistory = req.session.chatHistory || [];
  req.session.chatHistory.push({ role: 'user', content: question });

  if (!req.session.sessionId) {
    req.session.sessionId = uuidv4();
  }

  try {
    const ollama = new Ollama({ host: settings.ollamaHost });
    const response = await ollama.chat({
      model: settings.model,
      messages: req.session.chatHistory,
    });
    const answer = response.message.content;
    req.session.chatHistory.push({ role: 'assistant', content: answer });

    const chatHtml = req.session.chatHistory.map((entry: ChatEntry) => `
      <p><strong>${entry.role === 'user' ? 'You' : 'DON'}:</strong> ${entry.content}</p>
    `).join('');

    // Log chat history to JSON file
    const logDir = path.join(__dirname, '../../ext_logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
    const logFileName = `${req.session.sessionId}_${timestamp}.json`;
    const logFilePath = path.join(logDir, logFileName);
    const logData = {
      sessionId: req.session.sessionId,
      model: settings.model,
      chatHistory: req.session.chatHistory,
    };
    fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));

    res.render('chat', { chatHtml, stylePath: settings.stylePath });
  } catch (error) {
    res.send(`
      <p>Error communicating with Ollama: ${error}</p>
      <a href="/">Try again</a>
    `);
  }
};

// Handler to clear the chat history and session ID
export const postClear = (req: Request, res: Response) => {
  req.session.chatHistory = [];
  req.session.sessionId = undefined;
  res.redirect('/');
};

// Helper function to get model options for the settings page
const getModelOptions = (ollamaResponse: any, settings: any) => {
  return ollamaResponse.models.map((model: any) => ({
    name: model.name,
    selected: model.name === settings.model ? 'selected' : ''
  }));
};

// Handler to render the settings page with the current settings
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

// Handler to update the settings based on user input
export const postSettings = (req: Request, res: Response) => {
  const newStylePath = req.body.style;
  const newModel = req.body.model;
  settings.stylePath = newStylePath;
  settings.model = newModel;
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  res.redirect('/');
};