import fs from 'fs';
import path from 'path';
import { ChatEntry } from '../models/chatEntry';

export const logChatHistory = (sessionId: string, model: string, chatHistory: ChatEntry[], logFileName?: string) => {
  const logDir = path.join(__dirname, '../../ext_logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  // If logFileName is not provided, create a new one
  if (!logFileName) {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
    logFileName = `${sessionId}_${timestamp}.json`;
  }

  const logFilePath = path.join(logDir, logFileName);
  const logData = {
    sessionId,
    model,
    chatHistory,
  };
  fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));

  return logFileName; // Return the log file name so it can be saved in the session
};