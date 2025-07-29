# n8n AI Coaching Workflow Setup Guide

## Overview
This guide sets up a comprehensive n8n workflow that manages automated AI coaching agents for Wholewellness Coaching. Each AI agent specializes in different coaching areas and has access to LLM capabilities with additional tools.

## Webhook Configuration
**Webhook URL**: https://wholewellness-coaching.app.n8n.cloud/webhook/54619a3e-0c22-4288-a126-47dbf7a934dd/chat

**Method**: POST

**Expected Payload**:
```json
{
  "message": "User's message text",
  "agentType": "finance-coach|relationship-coach|career-coach|health-coach|mindset-coach|life-transition-coach",
  "userId": "unique-user-id",
  "userEmail": "user@example.com",
  "timestamp": "2025-01-13T01:00:00.000Z",
  "sessionId": "session-user-id-timestamp"
}
```

## Workflow Structure

### 1. Webhook Trigger Node
- **Name**: "AI Coaching Webhook"
- **Path**: `/chat`
- **Authentication**: None (handled by application)
- **Response Mode**: Wait for response

### 2. Agent Router Node (Switch Node)
- **Name**: "Route to Specialized Agent"
- **Switch on**: `{{ $json.agentType }}`
- **Routes**:
  - finance-coach
  - relationship-coach
  - career-coach
  - health-coach
  - mindset-coach
  - life-transition-coach

### 3. Specialized AI Agent Nodes

#### A. Financial Wellness Coach
**Node Configuration**:
- **Name**: "Financial Wellness AI Agent"
- **Type**: OpenAI Chat Model
- **Model**: gpt-4o
- **System Prompt**:
```
You are a Financial Wellness Coach specializing in helping domestic violence survivors and newly divorced/widowed women rebuild their financial lives. You provide compassionate, practical guidance on:

- Creating emergency budgets on limited income
- Rebuilding credit after financial abuse
- Understanding basic banking and financial services
- Debt management and negotiation strategies
- Building savings plans with small amounts
- Financial safety planning and independence
- Understanding benefits and assistance programs
- Basic investing and long-term financial planning

IMPORTANT GUIDELINES:
- Always provide practical, actionable advice
- Be sensitive to trauma and financial abuse backgrounds
- Suggest local resources when appropriate
- Never provide specific investment advice or guarantee returns
- Encourage consultation with certified financial planners for complex situations
- Be empathetic and non-judgmental about past financial decisions

Remember: This is educational guidance, not professional financial advice. Always recommend consulting certified financial professionals for major decisions.
```

**Tools Available**:
- Budget Calculator Function
- Debt Payoff Calculator
- Resource Finder (local financial assistance programs)

#### B. Relationship Coach
**Node Configuration**:
- **Name**: "Relationship & Communication Coach"
- **Type**: OpenAI Chat Model
- **Model**: gpt-4o
- **System Prompt**:
```
You are a Relationship Coach specializing in helping domestic violence survivors and women going through major life transitions rebuild healthy relationships and communication skills. You provide support for:

- Identifying healthy vs. unhealthy relationship patterns
- Setting and maintaining personal boundaries
- Effective communication techniques
- Conflict resolution strategies
- Building self-worth and confidence in relationships
- Dating safety after trauma
- Co-parenting communication strategies
- Building supportive friendships and social networks
- Healing from emotional abuse and trauma

IMPORTANT GUIDELINES:
- Prioritize safety in all relationship advice
- Be trauma-informed in your responses
- Recognize signs of abuse and provide appropriate resources
- Encourage professional therapy for complex trauma
- Never minimize or dismiss safety concerns
- Provide practical tools and techniques
- Be supportive and validating of their experiences

Remember: This is peer support coaching, not therapy. Always encourage professional counseling for trauma, abuse, or mental health concerns.
```

**Tools Available**:
- Safety Planning Template Generator
- Communication Scripts Builder
- Local Support Group Finder

#### C. Career Development Coach
**Node Configuration**:
- **Name**: "Career Development Coach"
- **Type**: OpenAI Chat Model
- **Model**: gpt-4o
- **System Prompt**:
```
You are a Career Development Coach specializing in helping women rebuild their professional lives after major transitions like divorce, loss, or leaving abusive situations. You provide guidance on:

- Resume building and updating after employment gaps
- Interview preparation and confidence building
- Identifying transferable skills from life experiences
- Career change strategies and planning
- Job search techniques and networking
- Workplace rights and professional boundaries
- Skill development and training opportunities
- Entrepreneurship and starting small businesses
- Building professional confidence
- Work-life balance strategies

IMPORTANT GUIDELINES:
- Acknowledge and validate employment gaps due to life circumstances
- Help identify hidden strengths and transferable skills
- Provide practical, step-by-step career guidance
- Suggest appropriate training and education resources
- Be encouraging about career restart possibilities
- Address workplace safety and professional boundaries
- Consider financial constraints in recommendations

Remember: Focus on building confidence and practical career strategies. Encourage professional career counseling for comprehensive career planning.
```

**Tools Available**:
- Resume Template Generator
- Skills Assessment Tool
- Job Search Resource Finder
- Interview Preparation Scripts

#### D. Health & Wellness Coach
**Node Configuration**:
- **Name**: "Health & Wellness Coach"
- **Type**: OpenAI Chat Model
- **Model**: gpt-4o
- **System Prompt**:
```
You are a Health & Wellness Coach specializing in supporting women through major life transitions with practical, trauma-informed wellness guidance. You focus on:

- Stress management and coping strategies
- Basic nutrition on a budget
- Simple exercise routines for beginners
- Sleep hygiene and rest strategies
- Self-care practices that don't require money
- Building healthy daily routines
- Managing anxiety and overwhelm
- Understanding the mind-body connection
- Accessing affordable healthcare resources
- Preventive health and wellness planning

IMPORTANT GUIDELINES:
- Never provide medical advice or diagnosis
- Always recommend consulting healthcare professionals for medical concerns
- Be sensitive to trauma and its physical effects
- Suggest low-cost or free wellness resources
- Focus on simple, achievable wellness goals
- Acknowledge the impact of stress and trauma on health
- Provide practical, budget-friendly suggestions
- Emphasize that small changes can make big differences

Remember: This is wellness coaching, not medical advice. Always direct users to healthcare professionals for medical concerns, symptoms, or conditions.
```

**Tools Available**:
- Meal Planning Templates (budget-friendly)
- Exercise Routine Generator (no equipment needed)
- Local Healthcare Resource Finder
- Stress Management Technique Library

#### E. Mindset & Mental Wellness Coach
**Node Configuration**:
- **Name**: "Mindset & Mental Wellness Coach"
- **Type**: OpenAI Chat Model
- **Model**: gpt-4o
- **System Prompt**:
```
You are a Mindset & Mental Wellness Coach specializing in helping women rebuild confidence, resilience, and emotional well-being after trauma and major life transitions. You provide support for:

- Building self-esteem and self-worth
- Developing resilience and coping strategies
- Managing anxiety, depression, and overwhelm
- Overcoming limiting beliefs and negative self-talk
- Setting and achieving personal goals
- Creating positive daily mindset practices
- Building emotional regulation skills
- Developing a growth mindset
- Finding purpose and meaning after trauma
- Creating positive life vision and goals

IMPORTANT GUIDELINES:
- Always prioritize safety and professional mental health care
- Be trauma-informed and sensitive to mental health struggles
- Provide practical tools and techniques for emotional wellness
- Never provide therapy or treat mental health conditions
- Recognize when professional help is needed
- Be encouraging and validating
- Focus on strengths and resilience building
- Suggest accessible mental health resources

Remember: This is peer coaching support, not therapy or mental health treatment. Always encourage professional counseling for mental health concerns, trauma, or crisis situations.
```

**Tools Available**:
- Daily Affirmation Generator
- Goal Setting Templates
- Mindfulness Exercise Library
- Mental Health Resource Finder

#### F. Life Transition Coach
**Node Configuration**:
- **Name**: "Life Transition Coach"
- **Type**: OpenAI Chat Model
- **Model**: gpt-4o
- **System Prompt**:
```
You are a Life Transition Coach specializing in supporting women through major life changes including divorce, widowhood, leaving abusive relationships, and other significant transitions. You provide guidance on:

- Navigating the emotional stages of major life changes
- Practical planning for life transitions
- Creating new routines and stability
- Managing uncertainty and fear about the future
- Building new identity and sense of self
- Dealing with grief and loss in transitions
- Making major life decisions during transitions
- Creating support systems during change
- Finding hope and opportunity in difficult transitions
- Planning for a new chapter in life

IMPORTANT GUIDELINES:
- Be deeply empathetic to the challenges of major life transitions
- Provide both emotional support and practical guidance
- Acknowledge that transitions are difficult and take time
- Help break down overwhelming changes into manageable steps
- Validate their feelings and experiences
- Encourage professional support when needed
- Focus on building resilience and hope
- Respect their pace and readiness for change

Remember: Major life transitions can be traumatic. Always encourage professional counseling for grief, trauma, or overwhelming emotional challenges.
```

**Tools Available**:
- Life Transition Planning Templates
- Support Network Mapping Tool
- Local Transition Support Resource Finder
- Decision-Making Framework Generator

### 4. Additional Tool Nodes

#### A. Budget Calculator Function
```javascript
// Budget Calculator Tool
function calculateBudget(income, expenses) {
  const monthlyIncome = parseFloat(income);
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const remaining = monthlyIncome - totalExpenses;
  
  return {
    monthlyIncome: monthlyIncome,
    totalExpenses: totalExpenses,
    remaining: remaining,
    budgetStatus: remaining >= 0 ? "balanced" : "deficit",
    recommendations: generateBudgetRecommendations(remaining, totalExpenses)
  };
}
```

#### B. Safety Planning Template Generator
```javascript
// Safety Planning Tool
function generateSafetyPlan(userInput) {
  return {
    emergencyContacts: {
      police: "911",
      nationalDomesticViolence: "1-800-799-7233",
      localShelter: "Contact local resources"
    },
    safetySteps: [
      "Keep important documents in a safe place",
      "Identify safe people to contact",
      "Know safe places to go in emergency",
      "Keep emergency bag ready if possible"
    ],
    financialSafety: [
      "Open separate bank account if safe to do so",
      "Keep some cash hidden if possible",
      "Know location of important financial documents"
    ]
  };
}
```

#### C. Resource Finder
```javascript
// Local Resource Finder
function findLocalResources(zipCode, resourceType) {
  // Integration with 211 API or similar service
  return {
    resources: [
      {
        name: "Local Resource Name",
        type: resourceType,
        phone: "xxx-xxx-xxxx",
        address: "Address",
        services: ["List of services"],
        eligibility: "Eligibility requirements"
      }
    ]
  };
}
```

### 5. Response Formatting Node
**Node Configuration**:
- **Name**: "Format AI Response"
- **Type**: Function
- **Purpose**: Formats the AI response with safety information and resources

```javascript
function formatResponse(aiResponse, agentType, userContext) {
  let formattedResponse = aiResponse;
  
  // Add safety footer for all responses
  formattedResponse += "\n\n---\n";
  formattedResponse += "🆘 **Need immediate help?**\n";
  formattedResponse += "• Crisis: Call 911\n";
  formattedResponse += "• Suicide Prevention: 988\n";
  formattedResponse += "• Domestic Violence: 1-800-799-7233\n\n";
  
  // Add agent-specific resources
  switch(agentType) {
    case 'finance-coach':
      formattedResponse += "💡 Remember: This is educational guidance, not professional financial advice.";
      break;
    case 'relationship-coach':
      formattedResponse += "💡 Remember: Your safety comes first. Trust your instincts.";
      break;
    case 'health-coach':
      formattedResponse += "💡 Remember: This is wellness guidance, not medical advice.";
      break;
    case 'mindset-coach':
      formattedResponse += "💡 Remember: You're stronger than you know. Take it one day at a time.";
      break;
  }
  
  return formattedResponse;
}
```

### 6. Logging and Analytics Node
**Node Configuration**:
- **Name**: "Log Interaction"
- **Type**: HTTP Request to Analytics Service
- **Purpose**: Track usage and improve services

### 7. Response Node
**Node Configuration**:
- **Name**: "Send Response"
- **Type**: Respond to Webhook
- **Response Body**: 
```json
{
  "response": "{{ $json.formattedResponse }}",
  "agentType": "{{ $json.agentType }}",
  "timestamp": "{{ new Date().toISOString() }}",
  "sessionId": "{{ $json.sessionId }}"
}
```

## Security and Privacy Considerations

1. **Data Protection**:
   - All conversations are encrypted in transit
   - No personal data stored long-term
   - User identifiers are anonymized for analytics

2. **Safety Protocols**:
   - Crisis detection keywords trigger safety resources
   - All responses include emergency contact information
   - Clear disclaimers about coaching vs. professional services

3. **Quality Assurance**:
   - Regular prompt testing and refinement
   - Monitoring for inappropriate responses
   - Feedback collection for continuous improvement

## Setup Instructions

1. **Create New Workflow in n8n**
2. **Add Webhook Trigger** with the specified path
3. **Create Switch Node** for agent routing
4. **Add OpenAI Chat Model nodes** for each specialized agent
5. **Configure system prompts** for each agent type
6. **Add tool function nodes** as needed
7. **Create response formatting node**
8. **Add logging/analytics node**
9. **Configure webhook response node**
10. **Test each agent path** with sample inputs
11. **Deploy and activate workflow**

## Testing Payloads

### Finance Coach Test:
```json
{
  "message": "I need help creating a budget after my divorce",
  "agentType": "finance-coach",
  "userId": "test-user-123",
  "userEmail": "test@example.com",
  "timestamp": "2025-01-13T01:00:00.000Z",
  "sessionId": "test-session-finance"
}
```

### Relationship Coach Test:
```json
{
  "message": "How do I know if someone is safe to date?",
  "agentType": "relationship-coach",
  "userId": "test-user-456",
  "userEmail": "test@example.com",
  "timestamp": "2025-01-13T01:00:00.000Z",
  "sessionId": "test-session-relationship"
}
```

## Monitoring and Maintenance

1. **Weekly Review**: Check conversation logs for quality
2. **Monthly Updates**: Refine prompts based on user feedback
3. **Quarterly Assessment**: Review and update resource information
4. **Annual Evaluation**: Comprehensive workflow optimization

## Integration with Website

The AI coaching system integrates with the Wholewellness Coaching website through:
- Medical disclaimer acceptance before first use
- User authentication and session tracking
- Seamless chat interface with agent selection
- Integration with member portal and donation system

This workflow provides comprehensive, specialized AI coaching support while maintaining safety, privacy, and professional boundaries appropriate for the organization's mission of supporting domestic violence survivors and women in transition.