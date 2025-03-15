import { Request, Response } from 'express';
import { SessionData } from 'express-session';
import { Settings } from '../models/settings';
import { logChatHistory } from '../utils/logger';

// Extend the express-session module to include custom properties in the session data
declare module 'express-session' {
  interface SessionData {
    chatHistory?: ChatEntry[];
    sessionId?: string;
    settings?: Settings;
    logFileName?: string; // Add logFileName to session data
  }
}

import { ChatEntry } from '../models/chatEntry';
import fs from 'fs';
import path from 'path';
import { Ollama } from 'ollama';
import { v4 as uuidv4 } from 'uuid';

// Load default settings from the settings.json file
const settingsPath = path.join(__dirname, '../../settings.json');
const defaultSettings: Settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

// Handler to render the chat page with the current chat history
export const getChat = (req: Request, res: Response) => {
  const chatHistory = req.session.chatHistory || [];
  const chatHtml = chatHistory.map((entry: ChatEntry) => `
    <p><strong>${entry.role === 'user' ? 'You' : 'DON'}:</strong> ${entry.content}</p>
  `).join('');

  res.render('chat', { chatHtml, stylePath: req.session.settings?.stylePath || defaultSettings.stylePath });
};

// Handler to process a new question from the user and get a response from Ollama
export const postAsk = async (req: Request, res: Response) => {
  const question = req.body.question;
  const timestamp = new Date().toISOString();
  req.session.chatHistory = req.session.chatHistory || [];
  req.session.chatHistory.push({ role: 'user', content: question, timestamp });

  if (!req.session.sessionId) {
    req.session.sessionId = uuidv4();
  }

  try {
    const ollama = new Ollama({ host: defaultSettings.ollamaHost });
    const response = await ollama.chat({
      model: req.session.settings?.model || defaultSettings.model,
      messages: req.session.chatHistory,
    });
    const answer = response.message.content;
    const responseTimestamp = new Date().toISOString();
    req.session.chatHistory.push({ role: 'assistant', content: answer, timestamp: responseTimestamp });

    const chatHtml = req.session.chatHistory.map((entry: ChatEntry) => `
      <p><strong>${entry.role === 'user' ? 'You' : 'DON'}:</strong> ${entry.content}</p>
    `).join('');

    // Log chat history to JSON file and save the log file name in the session
    req.session.logFileName = logChatHistory(req.session.sessionId, req.session.settings?.model || defaultSettings.model, req.session.chatHistory, req.session.logFileName);

    res.render('chat', { chatHtml, stylePath: req.session.settings?.stylePath || defaultSettings.stylePath });
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
  req.session.logFileName = undefined; // Clear the log file name from the session
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
  const stylePath = req.session.settings?.stylePath || defaultSettings.stylePath;
  const model = req.session.settings?.model || defaultSettings.model;
  const lightSelected = stylePath === '/styles.css' ? 'selected' : '';
  const darkSelected = stylePath === '/styles-dark.css' ? 'selected' : '';

  try {
    const ollama = new Ollama({ host: defaultSettings.ollamaHost });
    const response = await ollama.list();
    const modelOptions = getModelOptions(response, { model }); 
    res.render('settings', { lightSelected, darkSelected, stylePath, modelOptions });
  } catch (error) {
    res.send(`
      <p>Error retrieving models from Ollama: ${error}</p>
      <a href="/">Go back</a>
    `);
  }
};

// Handler to update the settings based on user input
export const postSettings = (req: Request, res: Response) => {
  req.session.settings = req.session.settings || { ...defaultSettings };
  req.session.settings.stylePath = req.body.style;
  req.session.settings.model = req.body.model;
  res.redirect('/');
};