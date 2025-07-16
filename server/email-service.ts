import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { storage } from './supabase-client-storage';
import { google } from 'googleapis';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private gmailApi: any = null;

  constructor() {
    // Transporter will be initialized on first use
  }

  private async ensureTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = await this.createEmailTransporter();
    }
    return this.transporter;
  }

  private async createGmailAPI() {
    if (!this.gmailApi) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      );

      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      this.gmailApi = google.gmail({ version: 'v1', auth: oauth2Client });
    }
    return this.gmailApi;
  }

  private async sendViaGmailAPI(to: string, subject: string, html: string, text: string, from?: string): Promise<void> {
    const gmail = await this.createGmailAPI();
    const senderEmail = from || process.env.FROM_EMAIL || 'noreply@wholewellness-coaching.org';

    const message = [
      `From: ${senderEmail}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
  }

  private async createEmailTransporter(): Promise<nodemailer.Transporter> {
    // Prioritize SMTP with App Password for reliability
    if (process.env.SMTP_PASS) {
      console.log('Using SMTP with App Password authentication');
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    
    // Try OAuth2 if SMTP not available
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
      try {
        console.log('Using OAuth2 authentication');
        return await this.createOAuthTransporter();
      } catch (error) {
        console.warn('OAuth2 failed:', error.message);
        throw new Error('Email authentication failed. Please configure Gmail App Password or OAuth2 credentials.');
      }
    }
    
    throw new Error('No email authentication configured. Please set SMTP_PASS or OAuth2 credentials.');
  }

  private async sendEmailWithFallback(to: string, subject: string, html: string, text: string, from?: string): Promise<void> {
    // Try Gmail API first (most reliable with OAuth2)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
      try {
        console.log('Sending email via Gmail API');
        await this.sendViaGmailAPI(to, subject, html, text, from);
        console.log(`Email sent successfully via Gmail API to: ${to}`);
        return;
      } catch (error) {
        console.warn('Gmail API failed, falling back to SMTP:', error.message);
      }
    }

    // Fallback to SMTP transporter
    const transporter = await this.ensureTransporter();
    await transporter.sendMail({
      from: from || process.env.FROM_EMAIL || 'noreply@wholewellness-coaching.org',
      to: to,
      subject: subject,
      html: html,
      text: text,
    });
    console.log(`Email sent successfully via SMTP to: ${to}`);
  }

  private async createOAuthTransporter(): Promise<nodemailer.Transporter> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Get fresh access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    const accessToken = credentials.access_token;

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userEmail: string, firstName: string): Promise<void> {
    const template = this.getWelcomeEmailTemplate(firstName);
    
    try {
      await this.sendEmailWithFallback(
        userEmail,
        template.subject,
        template.html,
        template.text,
        'welcome@wholewellness-coaching.org'
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<void> {
    const template = this.getPasswordResetEmailTemplate(resetToken);
    
    try {
      await this.sendEmailWithFallback(
        userEmail,
        template.subject,
        template.html,
        template.text,
        'noreply@wholewellness-coaching.org'
      );
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Send account verification email
  async sendVerificationEmail(userEmail: string, verificationToken: string): Promise<void> {
    const template = this.getVerificationEmailTemplate(verificationToken);
    
    try {
      await this.sendEmailWithFallback(
        userEmail,
        template.subject,
        template.html,
        template.text,
        'verify@wholewellness-coaching.org'
      );
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  // Generate secure reset token
  generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Generate verification token
  generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Welcome email template
  private getWelcomeEmailTemplate(firstName: string): EmailTemplate {
    const subject = 'Welcome to Whole Wellness Coaching - Your Journey Starts Here';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Whole Wellness Coaching</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey to wellness starts here</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Hello ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining our community of women supporting each other on their wellness journeys. 
            We're excited to be part of your path to healing, growth, and empowerment.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>🤖 <strong>Try our AI Coaches</strong> - Get instant support with weight loss or relationship guidance</li>
              <li>📅 <strong>Book a Session</strong> - Connect with our professional coaches for personalized support</li>
              <li>💝 <strong>Explore Resources</strong> - Access our library of wellness tools and guides</li>
              <li>🤝 <strong>Join Our Community</strong> - Connect with other women on similar journeys</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL || 'https://wholewellness-coaching.org'}/ai-coaching" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Your Journey
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            <strong>Remember:</strong> You are not alone. Our community is here to support you every step of the way. 
            If you have any questions or need assistance, please don't hesitate to reach out.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #666; margin: 0; font-size: 12px;">
            Whole Wellness Coaching | Supporting women on their journey to wellness<br>
            <a href="${process.env.BASE_URL || 'https://wholewellnesscoaching.org'}" style="color: #667eea;">wholewellnesscoaching.org</a>
          </p>
        </div>
      </div>
    `;
    
    const text = `
      Welcome to Whole Wellness Coaching, ${firstName}!
      
      Thank you for joining our community of women supporting each other on their wellness journeys. 
      We're excited to be part of your path to healing, growth, and empowerment.
      
      What's Next?
      • Try our AI Coaches - Get instant support with weight loss or relationship guidance
      • Book a Session - Connect with our professional coaches for personalized support
      • Explore Resources - Access our library of wellness tools and guides
      • Join Our Community - Connect with other women on similar journeys
      
      Visit: ${process.env.BASE_URL || 'https://wholewellnesscoaching.org'}/ai-coaching
      
      Remember: You are not alone. Our community is here to support you every step of the way.
      
      Whole Wellness Coaching
      Supporting women on their journey to wellness
    `;
    
    return { subject, html, text };
  }

  // Password reset email template
  private getPasswordResetEmailTemplate(resetToken: string): EmailTemplate {
    const subject = 'Reset Your Whole Wellness Coaching Password';
    const resetUrl = `${process.env.BASE_URL || 'https://wholewellnesscoaching.org'}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password for your Whole Wellness Coaching account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Your Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            This link will expire in 1 hour for security purposes. If you didn't request this reset, 
            please ignore this email and your password will remain unchanged.
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #666; margin: 0; font-size: 12px;">
            Whole Wellness Coaching | Supporting women on their journey to wellness
          </p>
        </div>
      </div>
    `;
    
    const text = `
      Password Reset Request
      
      We received a request to reset your password for your Whole Wellness Coaching account.
      
      Reset your password: ${resetUrl}
      
      This link will expire in 1 hour for security purposes. If you didn't request this reset, 
      please ignore this email and your password will remain unchanged.
      
      Whole Wellness Coaching
      Supporting women on their journey to wellness
    `;
    
    return { subject, html, text };
  }

  // Account verification email template
  private getVerificationEmailTemplate(verificationToken: string): EmailTemplate {
    const subject = 'Verify Your Whole Wellness Coaching Account';
    const verifyUrl = `${process.env.BASE_URL || 'https://wholewellnesscoaching.org'}/verify-email?token=${verificationToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Verify Your Account</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="color: #666; line-height: 1.6;">
            Thank you for signing up for Whole Wellness Coaching! To complete your registration, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Your Account
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            This verification link will expire in 24 hours. If you didn't create this account, 
            please ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verifyUrl}" style="color: #667eea; word-break: break-all;">${verifyUrl}</a>
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #666; margin: 0; font-size: 12px;">
            Whole Wellness Coaching | Supporting women on their journey to wellness
          </p>
        </div>
      </div>
    `;
    
    const text = `
      Verify Your Account
      
      Thank you for signing up for Whole Wellness Coaching! To complete your registration, 
      please verify your email address: ${verifyUrl}
      
      This verification link will expire in 24 hours. If you didn't create this account, 
      please ignore this email.
      
      Whole Wellness Coaching
      Supporting women on their journey to wellness
    `;
    
    return { subject, html, text };
  }
}

export const emailService = new EmailService();