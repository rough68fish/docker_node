export interface ChatEntry {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string; // Add timestamp field
}
