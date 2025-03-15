import fs from 'fs';
import path from 'path';
import { ChatEntry } from '../models/chatEntry';

export const logChatHistory = (sessionId: string, model: string, chatHistory: ChatEntry[]) => {
  const logDir = path.join(__dirname, '../../ext_logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
  const logFileName = `${sessionId}_${timestamp}.json`;
  const logFilePath = path.join(logDir, logFileName);
  const logData = {
    sessionId,
    model,
    chatHistory,
  };
  fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
};