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

export interface WellnessPaymentReceiptData {
  userName: string;
  email: string;
  amount: number;
  planName: string;
  transactionId?: string;
  nextBillingDate?: string;
}

export async function sendWellnessPaymentReceipt(
  toEmail: string,
  data: WellnessPaymentReceiptData
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'https://wholewellnesscoaching.org';

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: `🎉 Welcome to WholeWellness - Payment Confirmed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #7c3aed;">
            <h1 style="color: #7c3aed; margin: 0;">🎉 Welcome to WholeWellness!</h1>
            <p style="color: #64748b; margin: 8px 0;">Your wellness journey starts now</p>
          </div>

          <div style="padding: 30px 0;">
            <h2 style="color: #1e293b;">Hi ${data.userName},</h2>
            <p style="color: #475569; font-size: 1.1em;">
              Thank you for joining the WholeWellness community! Your payment has been processed successfully.
            </p>
            
            <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #7c3aed; margin-top: 0;">Payment Receipt</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Plan:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.planName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Amount:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #7c3aed;">$${(data.amount / 100).toFixed(2)}</td>
                </tr>
                ${data.transactionId ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Transaction ID:</td>
                  <td style="padding: 8px 0; text-align: right; font-size: 0.85em;">${data.transactionId}</td>
                </tr>
                ` : ''}
                ${data.nextBillingDate ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Next billing:</td>
                  <td style="padding: 8px 0; text-align: right;">${data.nextBillingDate}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <h3 style="color: #10b981; margin-top: 0;">🚀 What's Next?</h3>
              <p style="margin-bottom: 0;">Complete your wellness intake to get personalized coaching recommendations. This only takes about 5 minutes!</p>
            </div>

            <div style="text-align: center; padding: 20px 0;">
              <a href="${baseUrl}/onboarding?source=payment" 
                 style="display: inline-block; background: #7c3aed; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1em;">
                Start My Wellness Intake
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 30px 0; border-top: 2px solid #e5e7eb; margin-top: 40px;">
            <p style="color: #64748b; margin: 8px 0;">
              Questions? Reply to this email or visit our <a href="${baseUrl}/contact" style="color: #7c3aed;">Help Center</a>
            </p>
            <p style="color: #94a3b8; font-size: 0.85em;">
              © ${new Date().getFullYear()} WholeWellness Coaching. All rights reserved.
            </p>
          </div>

        </body>
        </html>
      `,
      text: `Welcome to WholeWellness, ${data.userName}!\n\nThank you for joining! Your payment of $${(data.amount / 100).toFixed(2)} for ${data.planName} has been processed successfully.\n\nWhat's Next?\nComplete your wellness intake to get personalized coaching recommendations: ${baseUrl}/onboarding?source=payment\n\nQuestions? Visit ${baseUrl}/contact\n\nWholeWellness Team`,
    };

    await client.send(msg);
    console.log(`Welcome/payment receipt email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    return false;
  }
}

export async function sendIntakeReminderEmail(
  toEmail: string,
  userName: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'https://wholewellnesscoaching.org';

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: `🌟 ${userName}, complete your wellness intake to unlock personalized coaching`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #7c3aed;">
            <h1 style="color: #7c3aed; margin: 0;">WholeWellness</h1>
            <p style="color: #64748b; margin: 8px 0;">Your personalized journey awaits</p>
          </div>

          <div style="padding: 30px 0;">
            <h2 style="color: #1e293b;">Hi ${userName},</h2>
            <p style="color: #475569; font-size: 1.1em;">
              We noticed you haven't completed your wellness intake yet. Take 5 minutes now to unlock:
            </p>
            
            <ul style="color: #475569; padding-left: 20px;">
              <li style="margin: 12px 0;">✨ Personalized AI coaching tailored to your goals</li>
              <li style="margin: 12px 0;">📊 Custom wellness assessments and tracking</li>
              <li style="margin: 12px 0;">🎯 Matched recommendations for professional coaches</li>
              <li style="margin: 12px 0;">💪 Progress tracking and milestone celebrations</li>
            </ul>

            <div style="text-align: center; padding: 24px 0;">
              <a href="${baseUrl}/onboarding" 
                 style="display: inline-block; background: #7c3aed; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1em;">
                Complete My Intake Now
              </a>
            </div>

            <p style="color: #64748b; text-align: center; font-size: 0.9em;">
              Takes less than 5 minutes • Start your transformation today
            </p>
          </div>

          <div style="text-align: center; padding: 30px 0; border-top: 2px solid #e5e7eb; margin-top: 40px;">
            <p style="color: #64748b; margin: 8px 0;">
              Questions? <a href="${baseUrl}/contact" style="color: #7c3aed;">Contact us</a>
            </p>
            <p style="color: #94a3b8; font-size: 0.85em;">
              © ${new Date().getFullYear()} WholeWellness Coaching. All rights reserved.
            </p>
          </div>

        </body>
        </html>
      `,
      text: `Hi ${userName},\n\nWe noticed you haven't completed your wellness intake yet.\n\nTake 5 minutes to unlock:\n• Personalized AI coaching\n• Custom wellness assessments\n• Matched coach recommendations\n• Progress tracking\n\nComplete your intake: ${baseUrl}/onboarding\n\nWholeWellness Team`,
    };

    await client.send(msg);
    console.log(`Intake reminder email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending intake reminder email:', error);
    return false;
  }
}
