export interface ChatEntry {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    feedback?: 'flagged' | 'thumbsUp' | 'thumbsDown';
    flagReason?: 'inaccurate' | 'hallucination' | 'biased' | 'offensive' | 'other';
}