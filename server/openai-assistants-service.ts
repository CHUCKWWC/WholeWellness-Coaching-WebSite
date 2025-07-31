import OpenAI from "openai";
import { AI_COACHES, getCoachById } from "./ai-coaches-config";

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
  try {
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    console.log('OpenAI Assistants API initialized successfully');
  } catch (error) {
    console.error('OpenAI initialization failed:', error);
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  threadId: string;
  runId?: string;
}

export class OpenAIAssistantsService {
  private threads: Map<string, string> = new Map(); // sessionId -> threadId mapping

  async createThread(): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const thread = await openai.beta.threads.create();
    return thread.id;
  }

  async getOrCreateThread(sessionId: string): Promise<string> {
    let threadId = this.threads.get(sessionId);
    
    if (!threadId) {
      threadId = await this.createThread();
      this.threads.set(sessionId, threadId);
    }
    
    return threadId;
  }

  async sendMessage(
    coachId: string, 
    message: string, 
    sessionId: string,
    tone?: string
  ): Promise<ChatResponse> {
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const coach = getCoachById(coachId);
    if (!coach) {
      throw new Error(`Coach not found: ${coachId}`);
    }

    const threadId = await this.getOrCreateThread(sessionId);
    // Add tone instruction to the message if specified
    let enhancedMessage = message;
    if (tone) {
      const toneInstructions = {
        supportive: "Please respond in a warm, empathetic, and encouraging tone.",
        motivational: "Please respond in an energetic, inspiring, and goal-focused tone.",
        analytical: "Please provide a data-driven, logical response with clear solutions.",
        gentle: "Please use calm, patient language with a nurturing approach."
      };
      
      enhancedMessage = `${toneInstructions[tone as keyof typeof toneInstructions] || ''}\n\n${message}`;
    }

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: enhancedMessage
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: coach.assistantId
    });
    
    if (!run || !run.id) {
      throw new Error('Invalid run object returned from OpenAI');
    }

    // Wait for completion
    const runId = run.id;
    let runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
    
    while (runStatus.status !== 'completed') {
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
        throw new Error(`Assistant run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
    }

    // Get messages
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0];
    
    if (!lastMessage || lastMessage.role !== 'assistant') {
      throw new Error('No assistant response found');
    }

    const responseContent = lastMessage.content[0];
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return {
      response: responseContent.text.value,
      threadId: threadId,
      runId: run.id
    };
  }

  async getThreadMessages(threadId: string): Promise<ChatMessage[]> {
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const messages = await openai.beta.threads.messages.list(threadId);
    
    return messages.data.reverse().map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content[0].type === 'text' ? msg.content[0].text.value : ''
    }));
  }

  clearThread(sessionId: string): void {
    this.threads.delete(sessionId);
  }
}

export const assistantsService = new OpenAIAssistantsService();