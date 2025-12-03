import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  
  if (!hostname) {
    throw new Error('REPLIT_CONNECTORS_HOSTNAME not configured');
  }
  
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch SendGrid credentials: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    connectionSettings = data.items?.[0];
    
    if (!connectionSettings || !connectionSettings.settings?.api_key || !connectionSettings.settings?.from_email) {
      throw new Error('SendGrid not connected. Please connect SendGrid in the Replit integrations panel.');
    }
    
    return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
  } catch (error) {
    console.error('SendGrid credentials error:', error);
    throw new Error(`SendGrid configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export interface DigestEmailData {
  userName: string;
  periodStart: string;
  periodEnd: string;
  conversationCount: number;
  summaries: Array<{
    coachName: string;
    date: string;
    summary: string;
    keyTopics: string[];
    emotionalTone: string;
    actionItems?: Array<{item: string; priority: string}>;
    insights?: string;
  }>;
  actionItems: Array<{item: string; priority: string; coach: string}>;
  insights: string[];
}

export async function sendDigestEmail(
  toEmail: string,
  data: DigestEmailData,
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const frequencyTitle = frequency.charAt(0).toUpperCase() + frequency.slice(1);
    
    const actionItemsHtml = data.actionItems.length > 0 
      ? `
        <div style="background: #f0f9ff; border-left: 4px solid #0891b2; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #0891b2; margin-top: 0;">📋 Action Items</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${data.actionItems.map(item => `
              <li style="margin: 8px 0;">
                <strong>${item.item}</strong> 
                <span style="color: #64748b; font-size: 0.9em;">(${item.coach} - ${item.priority} priority)</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` 
      : '';

    const insightsHtml = data.insights.length > 0
      ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #f59e0b; margin-top: 0;">💡 Key Insights</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${data.insights.map(insight => `<li style="margin: 8px 0;">${insight}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    const summariesHtml = data.summaries.map(summary => `
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="color: #0f766e; margin: 0;">${summary.coachName}</h3>
          <span style="color: #64748b; font-size: 0.9em;">${summary.date}</span>
        </div>
        <p style="color: #334155; line-height: 1.6; margin: 12px 0;">${summary.summary}</p>
        ${summary.keyTopics.length > 0 ? `
          <div style="margin: 12px 0;">
            <strong style="color: #475569;">Topics:</strong> 
            ${summary.keyTopics.map(topic => `
              <span style="display: inline-block; background: #e0f2f1; color: #0f766e; padding: 4px 12px; border-radius: 16px; margin: 4px; font-size: 0.85em;">${topic}</span>
            `).join('')}
          </div>
        ` : ''}
        ${summary.emotionalTone ? `
          <div style="margin: 12px 0;">
            <strong style="color: #475569;">Mood:</strong> 
            <span style="color: #64748b;">${summary.emotionalTone}</span>
          </div>
        ` : ''}
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #0f766e;">
          <h1 style="color: #0f766e; margin: 0;">WholeWellness</h1>
          <p style="color: #64748b; margin: 8px 0;">Your ${frequencyTitle} Wellness Digest</p>
        </div>

        <div style="padding: 30px 0;">
          <h2 style="color: #1e293b;">Hi ${data.userName},</h2>
          <p style="color: #475569; font-size: 1.1em;">
            Here's your ${frequency} summary of conversations with your AI wellness coaches from 
            <strong>${data.periodStart}</strong> to <strong>${data.periodEnd}</strong>.
          </p>
          <p style="background: #e0f2f1; padding: 16px; border-radius: 8px; color: #0f766e;">
            📊 <strong>${data.conversationCount}</strong> coaching conversations this period
          </p>
        </div>

        ${actionItemsHtml}
        ${insightsHtml}

        <div style="margin: 30px 0;">
          <h2 style="color: #1e293b; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Conversation Summaries
          </h2>
          ${summariesHtml}
        </div>

        <div style="text-align: center; padding: 30px 0; border-top: 2px solid #e5e7eb; margin-top: 40px;">
          <p style="color: #64748b; margin: 8px 0;">
            Keep up the great work on your wellness journey! 💪
          </p>
          <a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://wholewellnesscoaching.org'}/ai-coaching" 
             style="display: inline-block; background: #0f766e; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; margin: 16px 0; font-weight: 600;">
            Continue Coaching
          </a>
          <p style="color: #94a3b8; font-size: 0.85em; margin-top: 20px;">
            You're receiving this because you opted for ${frequency} wellness digests. 
            <a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://wholewellnesscoaching.org'}/settings" style="color: #0891b2;">Update preferences</a>
          </p>
        </div>

      </body>
      </html>
    `;

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: `Your ${frequencyTitle} Wellness Digest - ${data.periodStart} to ${data.periodEnd}`,
      html: htmlContent,
      text: `Hi ${data.userName},\n\nHere's your ${frequency} wellness digest from ${data.periodStart} to ${data.periodEnd}.\n\nYou had ${data.conversationCount} coaching conversations this period.\n\n${data.actionItems.length > 0 ? `ACTION ITEMS:\n${data.actionItems.map(item => `- ${item.item} (${item.coach} - ${item.priority} priority)`).join('\n')}\n\n` : ''}${data.summaries.map(s => `${s.coachName} (${s.date}):\n${s.summary}\nTopics: ${s.keyTopics.join(', ')}\n`).join('\n\n')}\n\nKeep up the great work!\n\nWholeWellness Team`,
    };

    await client.send(msg);
    console.log(`Digest email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending digest email:', error);
    return false;
  }
}

export async function sendCrisisAlertEmail(
  toEmail: string,
  userName: string,
  severity: string,
  assessment: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: `⚠️ Crisis Alert - ${userName} - ${severity.toUpperCase()} Severity`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 20px;">
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc2626; margin-top: 0;">⚠️ Crisis Alert</h2>
            <p><strong>User:</strong> ${userName}</p>
            <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
            <p><strong>AI Assessment:</strong></p>
            <p style="background: white; padding: 12px; border-radius: 4px;">${assessment}</p>
            <p style="margin-top: 20px;">
              <strong>Action Required:</strong> Please review this case immediately and reach out to the user to provide appropriate support.
            </p>
            <a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://wholewellnesscoaching.org'}/admin/crisis-alerts" 
               style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
              View Crisis Alerts Dashboard
            </a>
          </div>
          <div style="margin-top: 20px; padding: 16px; background: #f1f5f9; border-radius: 8px;">
            <p style="margin: 0; font-size: 0.9em; color: #64748b;">
              <strong>Resources:</strong><br>
              • National Suicide Prevention Lifeline: 988<br>
              • Crisis Text Line: Text HOME to 741741<br>
              • National Domestic Violence Hotline: 1-800-799-7233
            </p>
          </div>
        </body>
        </html>
      `,
      text: `CRISIS ALERT\n\nUser: ${userName}\nSeverity: ${severity.toUpperCase()}\n\nAI Assessment:\n${assessment}\n\nAction Required: Please review this case immediately and reach out to the user to provide appropriate support.\n\nResources:\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• National Domestic Violence Hotline: 1-800-799-7233`,
    };

    await client.send(msg);
    console.log(`Crisis alert email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending crisis alert email:', error);
    return false;
  }
}
