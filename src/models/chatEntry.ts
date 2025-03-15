export interface ChatEntry {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    feedback?: 'flagged' | 'thumbsUp' | 'thumbsDown'; // Add feedback field
}