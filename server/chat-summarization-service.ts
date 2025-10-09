import OpenAI from 'openai';
import type { 
  ChatSummary, 
  InsertChatSummary, 
  CrisisAlert, 
  InsertCrisisAlert 
} from '@shared/schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SummarizationResult {
  summary: string;
  keyTopics: string[];
  emotionalTone: 'positive' | 'neutral' | 'struggling' | 'crisis';
  actionItems: Array<{item: string; priority: 'high' | 'medium' | 'low'}>;
  insights: string;
  crisisDetected: boolean;
  crisisKeywords?: string[];
  crisisAssessment?: string;
}

const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'self harm', 'cutting', 'hurt myself', 'no reason to live',
  'abuse', 'violence', 'hitting me', 'afraid', 'scared for my life',
  'overdose', 'pills', 'hopeless', 'can\'t go on', 'better off dead'
];

export async function summarizeConversation(
  messages: ConversationMessage[],
  coachType: string
): Promise<SummarizationResult> {
  try {
    const conversationText = messages.map(m => 
      `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
    ).join('\n');

    // Crisis detection check (fast keyword scan first)
    const detectedKeywords = CRISIS_KEYWORDS.filter(keyword => 
      conversationText.toLowerCase().includes(keyword)
    );
    const crisisDetected = detectedKeywords.length > 0;

    const systemPrompt = `You are an expert mental health analyst. Analyze the following coaching conversation and provide:
1. A concise summary (2-3 sentences) of the main discussion
2. 3-5 key topics discussed (single words or short phrases)
3. The user's emotional tone (positive/neutral/struggling/crisis)
4. 1-3 specific action items the user should take (with priority: high/medium/low)
5. 1-2 insightful observations about the user's progress or patterns

${crisisDetected ? `⚠️ CRISIS KEYWORDS DETECTED: ${detectedKeywords.join(', ')}. If this indicates genuine risk, mark emotional tone as "crisis" and provide crisis assessment.` : ''}

Format your response as JSON:
{
  "summary": "...",
  "keyTopics": ["topic1", "topic2", ...],
  "emotionalTone": "positive/neutral/struggling/crisis",
  "actionItems": [{"item": "...", "priority": "high/medium/low"}, ...],
  "insights": "...",
  "crisisAssessment": "..." (only if crisis detected)
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Conversation with ${coachType} coach:\n\n${conversationText}` }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      summary: result.summary || 'No summary generated',
      keyTopics: result.keyTopics || [],
      emotionalTone: result.emotionalTone || 'neutral',
      actionItems: result.actionItems || [],
      insights: result.insights || '',
      crisisDetected: result.emotionalTone === 'crisis',
      crisisKeywords: crisisDetected ? detectedKeywords : undefined,
      crisisAssessment: result.crisisAssessment || undefined
    };
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    
    // Fallback basic analysis
    return {
      summary: 'Conversation summarization unavailable',
      keyTopics: ['wellness', 'coaching'],
      emotionalTone: 'neutral',
      actionItems: [],
      insights: 'Unable to generate insights',
      crisisDetected: false
    };
  }
}

export async function generateDigestSummary(
  summaries: ChatSummary[],
  userName: string
): Promise<string> {
  try {
    const summariesText = summaries.map(s => 
      `${s.coachType} - ${s.conversationDate}: ${s.summary}\nTopics: ${s.keyTopics?.join(', ')}\nTone: ${s.emotionalTone}`
    ).join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are a wellness coach providing an encouraging overview of a user\'s progress. Write 2-3 sentences highlighting patterns, growth areas, and positive momentum.' 
        },
        { 
          role: 'user', 
          content: `Create an encouraging digest overview for ${userName} based on these conversation summaries:\n\n${summariesText}` 
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content || 'Keep up the great work on your wellness journey!';
  } catch (error) {
    console.error('Error generating digest summary:', error);
    return 'Keep up the great work on your wellness journey!';
  }
}

export function assessCrisisSeverity(
  keywords: string[],
  aiAssessment: string
): 'low' | 'medium' | 'high' | 'critical' {
  const highRiskKeywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'overdose'];
  const hasHighRiskKeyword = keywords.some(k => highRiskKeywords.includes(k));
  
  if (hasHighRiskKeyword || aiAssessment.toLowerCase().includes('immediate risk')) {
    return 'critical';
  }
  
  if (keywords.length >= 3 || aiAssessment.toLowerCase().includes('concerning')) {
    return 'high';
  }
  
  if (keywords.length >= 2) {
    return 'medium';
  }
  
  return 'low';
}

export function extractActionItemsFromSummaries(summaries: ChatSummary[]): Array<{
  item: string;
  priority: 'high' | 'medium' | 'low';
  coach: string;
}> {
  const allActionItems: Array<{item: string; priority: 'high' | 'medium' | 'low'; coach: string}> = [];
  
  for (const summary of summaries) {
    if (summary.actionItems && Array.isArray(summary.actionItems)) {
      const items = (summary.actionItems as any[]).map(item => ({
        item: item.item || '',
        priority: item.priority || 'medium',
        coach: summary.coachType
      }));
      allActionItems.push(...items);
    }
  }
  
  // Deduplicate similar action items
  const uniqueItems = allActionItems.reduce((acc, item) => {
    const exists = acc.find(existing => 
      existing.item.toLowerCase() === item.item.toLowerCase()
    );
    if (!exists) {
      acc.push(item);
    }
    return acc;
  }, [] as typeof allActionItems);
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return uniqueItems.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

export function getCoachDisplayName(coachType: string): string {
  const names: Record<string, string> = {
    'charlene': 'Charlene (Mindfulness)',
    'lisa': 'Lisa (Behavior)',
    'dasha': 'Dasha (Wellness)',
    'charles': 'Charles (Relationships)',
    'bobby': 'Bobby (Mental Health)',
    'aria': 'Aria (Weight Loss)'
  };
  return names[coachType.toLowerCase()] || coachType;
}

export function formatDateForDigest(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function calculateNextDigestDate(
  frequency: string,
  preferredDay: string | null,
  preferredHour: number,
  timezone: string
): Date {
  const now = new Date();
  const next = new Date(now);
  
  if (frequency === 'daily') {
    next.setDate(next.getDate() + 1);
    next.setHours(preferredHour, 0, 0, 0);
  } else if (frequency === 'weekly') {
    const dayMap: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6
    };
    const targetDay = preferredDay ? dayMap[preferredDay.toLowerCase()] : 1; // default Monday
    const currentDay = next.getDay();
    const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntil);
    next.setHours(preferredHour, 0, 0, 0);
  } else if (frequency === 'biweekly') {
    next.setDate(next.getDate() + 14);
    next.setHours(preferredHour, 0, 0, 0);
  } else if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
    next.setDate(1); // First of next month
    next.setHours(preferredHour, 0, 0, 0);
  }
  
  return next;
}
