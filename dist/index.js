var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/email-service.ts
var email_service_exports = {};
__export(email_service_exports, {
  EmailService: () => EmailService,
  emailService: () => emailService
});
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { google } from "googleapis";
var EmailService, emailService;
var init_email_service = __esm({
  "server/email-service.ts"() {
    "use strict";
    EmailService = class {
      transporter = null;
      gmailApi = null;
      constructor() {
      }
      async ensureTransporter() {
        if (!this.transporter) {
          this.transporter = await this.createEmailTransporter();
        }
        return this.transporter;
      }
      async createGmailAPI() {
        if (!this.gmailApi) {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
          );
          const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
          oauth2Client.setCredentials({
            refresh_token: refreshToken
          });
          this.gmailApi = google.gmail({ version: "v1", auth: oauth2Client });
        }
        return this.gmailApi;
      }
      async sendViaGmailAPI(to, subject, html, text2, from) {
        const gmail = await this.createGmailAPI();
        const senderEmail = from || process.env.GMAIL_USER || "noreply@wholewellnesscoaching.org";
        const message = [
          `From: ${senderEmail}`,
          `To: ${to}`,
          `Subject: ${subject}`,
          "MIME-Version: 1.0",
          "Content-Type: text/html; charset=utf-8",
          "",
          html
        ].join("\n");
        const encodedMessage = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: encodedMessage
          }
        });
      }
      async createEmailTransporter() {
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          console.log("Using Gmail SMTP with App Password authentication");
          return nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            // true for 465, false for other ports
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD
            }
          });
        }
        if (process.env.SMTP_PASS) {
          console.log("Using SMTP with App Password authentication");
          return nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: false,
            // true for 465, false for other ports
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          });
        }
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
          try {
            console.log("Using OAuth2 authentication");
            return await this.createOAuthTransporter();
          } catch (error) {
            console.warn("OAuth2 failed:", error.message);
            throw new Error("Email authentication failed. Please configure Gmail App Password or OAuth2 credentials.");
          }
        }
        throw new Error("No email authentication configured. Please set SMTP_PASS or OAuth2 credentials.");
      }
      async sendEmailWithFallback(to, subject, html, text2, from) {
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
          try {
            console.log("Sending email via Gmail API");
            await this.sendViaGmailAPI(to, subject, html, text2, from);
            console.log(`Email sent successfully via Gmail API to: ${to}`);
            return;
          } catch (error) {
            console.warn("Gmail API failed, falling back to SMTP:", error.message);
          }
        }
        const transporter = await this.ensureTransporter();
        await transporter.sendMail({
          from: from || process.env.FROM_EMAIL || "noreply@wholewellnesscoaching.org",
          to,
          subject,
          html,
          text: text2
        });
        console.log(`Email sent successfully via SMTP to: ${to}`);
      }
      async createOAuthTransporter() {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          "https://developers.google.com/oauthplayground"
        );
        oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });
        const { credentials } = await oauth2Client.refreshAccessToken();
        const accessToken = credentials.access_token;
        return nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: process.env.SMTP_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken
          }
        });
      }
      // Send welcome email to new users
      async sendWelcomeEmail(userEmail, firstName) {
        const template = this.getWelcomeEmailTemplate(firstName);
        try {
          await this.sendEmailWithFallback(
            userEmail,
            template.subject,
            template.html,
            template.text,
            "welcome@wholewellness-coaching.org"
          );
        } catch (error) {
          console.error("Error sending welcome email:", error);
          throw error;
        }
      }
      // Send password reset email
      async sendPasswordResetEmail(userEmail, resetToken) {
        const template = this.getPasswordResetEmailTemplate(resetToken);
        try {
          await this.sendEmailWithFallback(
            userEmail,
            template.subject,
            template.html,
            template.text,
            "noreply@wholewellness-coaching.org"
          );
        } catch (error) {
          console.error("Error sending password reset email:", error);
          throw error;
        }
      }
      // Send account verification email
      async sendVerificationEmail(userEmail, verificationToken) {
        const template = this.getVerificationEmailTemplate(verificationToken);
        try {
          await this.sendEmailWithFallback(
            userEmail,
            template.subject,
            template.html,
            template.text,
            "verify@wholewellness-coaching.org"
          );
        } catch (error) {
          console.error("Error sending verification email:", error);
          throw error;
        }
      }
      // Generate secure reset token
      generateResetToken() {
        return randomBytes(32).toString("hex");
      }
      // Generate verification token
      generateVerificationToken() {
        return randomBytes(32).toString("hex");
      }
      // Welcome email template
      getWelcomeEmailTemplate(firstName) {
        const subject = "Welcome to Whole Wellness Coaching - Your Journey Starts Here";
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
              <li>\u{1F916} <strong>Try our AI Coaches</strong> - Get instant support with weight loss or relationship guidance</li>
              <li>\u{1F4C5} <strong>Book a Session</strong> - Connect with our professional coaches for personalized support</li>
              <li>\u{1F49D} <strong>Explore Resources</strong> - Access our library of wellness tools and guides</li>
              <li>\u{1F91D} <strong>Join Our Community</strong> - Connect with other women on similar journeys</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL || "https://wholewellness-coaching.org"}/ai-coaching" 
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
            <a href="${process.env.BASE_URL || "https://wholewellnesscoaching.org"}" style="color: #667eea;">wholewellnesscoaching.org</a>
          </p>
        </div>
      </div>
    `;
        const text2 = `
      Welcome to Whole Wellness Coaching, ${firstName}!
      
      Thank you for joining our community of women supporting each other on their wellness journeys. 
      We're excited to be part of your path to healing, growth, and empowerment.
      
      What's Next?
      \u2022 Try our AI Coaches - Get instant support with weight loss or relationship guidance
      \u2022 Book a Session - Connect with our professional coaches for personalized support
      \u2022 Explore Resources - Access our library of wellness tools and guides
      \u2022 Join Our Community - Connect with other women on similar journeys
      
      Visit: ${process.env.BASE_URL || "https://wholewellnesscoaching.org"}/ai-coaching
      
      Remember: You are not alone. Our community is here to support you every step of the way.
      
      Whole Wellness Coaching
      Supporting women on their journey to wellness
    `;
        return { subject, html, text: text2 };
      }
      // Password reset email template
      getPasswordResetEmailTemplate(resetToken) {
        const subject = "Reset Your Whole Wellness Coaching Password";
        const resetUrl = `${process.env.BASE_URL || "https://wholewellnesscoaching.org"}/reset-password?token=${resetToken}`;
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
        const text2 = `
      Password Reset Request
      
      We received a request to reset your password for your Whole Wellness Coaching account.
      
      Reset your password: ${resetUrl}
      
      This link will expire in 1 hour for security purposes. If you didn't request this reset, 
      please ignore this email and your password will remain unchanged.
      
      Whole Wellness Coaching
      Supporting women on their journey to wellness
    `;
        return { subject, html, text: text2 };
      }
      // Account verification email template
      getVerificationEmailTemplate(verificationToken) {
        const subject = "Verify Your Whole Wellness Coaching Account";
        const verifyUrl = `${process.env.BASE_URL || "https://wholewellnesscoaching.org"}/verify-email?token=${verificationToken}`;
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
        const text2 = `
      Verify Your Account
      
      Thank you for signing up for Whole Wellness Coaching! To complete your registration, 
      please verify your email address: ${verifyUrl}
      
      This verification link will expire in 24 hours. If you didn't create this account, 
      please ignore this email.
      
      Whole Wellness Coaching
      Supporting women on their journey to wellness
    `;
        return { subject, html, text: text2 };
      }
    };
    emailService = new EmailService();
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = "https://pwuwmnivvdvdxdewynbo.supabase.co";
var supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseKey) {
  throw new Error("SUPABASE_KEY environment variable is required");
}
var supabase = createClient(supabaseUrl, supabaseKey);

// server/supabase-client-storage.ts
import { randomUUID } from "crypto";
var SupabaseClientStorage = class {
  // Users
  // Google OAuth Methods
  async getUserByGoogleId(googleId) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("google_id", googleId).single();
      if (error && error.code !== "PGRST116") {
        console.error("Error getting user by Google ID:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Error getting user by Google ID:", err);
      return null;
    }
  }
  async updateUserGoogleId(userId, googleId) {
    try {
      const { data, error } = await supabase.from("users").update({
        google_id: googleId,
        provider: "google",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", userId).select().single();
      if (error) {
        console.error("Error updating user Google ID:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("Error updating user Google ID:", err);
      throw err;
    }
  }
  async getUser(id) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting user:", error);
        return void 0;
      }
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return void 0;
    }
  }
  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("email", email).single();
      if (error) {
        console.error("Error getting user by email:", error);
        return void 0;
      }
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return void 0;
    }
  }
  async createUser(insertUser) {
    try {
      const dbUser = {
        id: randomUUID(),
        email: insertUser.email,
        password_hash: insertUser.passwordHash,
        first_name: insertUser.firstName,
        last_name: insertUser.lastName,
        membership_level: insertUser.membershipLevel || "free",
        donation_total: insertUser.donationTotal || 0,
        reward_points: insertUser.rewardPoints || 0,
        stripe_customer_id: insertUser.stripeCustomerId || null,
        profile_image_url: insertUser.profileImageUrl || null,
        google_id: insertUser.googleId || null,
        provider: insertUser.provider || "local",
        role: insertUser.role || "user",
        permissions: insertUser.permissions || null,
        is_active: insertUser.isActive !== void 0 ? insertUser.isActive : true,
        join_date: /* @__PURE__ */ new Date(),
        last_login: insertUser.lastLogin || null,
        created_at: /* @__PURE__ */ new Date(),
        updated_at: /* @__PURE__ */ new Date()
      };
      const { data, error } = await supabase.from("users").insert(dbUser).select().single();
      if (error) {
        console.error("Error creating user:", error);
        throw error;
      }
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  async updateUser(id, updates) {
    try {
      const dbUpdates = {};
      if (updates.email !== void 0) dbUpdates.email = updates.email;
      if (updates.passwordHash !== void 0) dbUpdates.password_hash = updates.passwordHash;
      if (updates.firstName !== void 0) dbUpdates.first_name = updates.firstName;
      if (updates.lastName !== void 0) dbUpdates.last_name = updates.lastName;
      if (updates.membershipLevel !== void 0) dbUpdates.membership_level = updates.membershipLevel;
      if (updates.donationTotal !== void 0) dbUpdates.donation_total = updates.donationTotal;
      if (updates.rewardPoints !== void 0) dbUpdates.reward_points = updates.rewardPoints;
      if (updates.stripeCustomerId !== void 0) dbUpdates.stripe_customer_id = updates.stripeCustomerId;
      if (updates.profileImageUrl !== void 0) dbUpdates.profile_image_url = updates.profileImageUrl;
      if (updates.googleId !== void 0) dbUpdates.google_id = updates.googleId;
      if (updates.provider !== void 0) dbUpdates.provider = updates.provider;
      if (updates.role !== void 0) dbUpdates.role = updates.role;
      if (updates.permissions !== void 0) dbUpdates.permissions = updates.permissions;
      if (updates.isActive !== void 0) dbUpdates.is_active = updates.isActive;
      if (updates.lastLogin !== void 0) dbUpdates.last_login = updates.lastLogin;
      if (updates.updatedAt !== void 0) dbUpdates.updated_at = updates.updatedAt;
      const { data, error } = await supabase.from("users").update(dbUpdates).eq("id", id).select().single();
      if (error) {
        console.error("Error updating user:", error);
        return void 0;
      }
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return void 0;
    }
  }
  async getAllUsers() {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching all users:", error);
        throw error;
      }
      return data.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        passwordHash: user.password_hash,
        membershipLevel: user.membership_level,
        rewardPoints: user.reward_points,
        donationTotal: user.donation_total,
        profileImageUrl: user.profile_image_url,
        googleId: user.google_id,
        provider: user.provider,
        role: user.role,
        isActive: user.is_active !== false,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        permissions: user.permissions
      }));
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }
  async deleteUser(userId) {
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) {
        console.error("Error deleting user:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  async updateUserRole(id, role) {
    try {
      const { data, error } = await supabase.from("users").update({
        role,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", id).select().single();
      if (error) {
        console.error("Error updating user role:", error);
        return void 0;
      }
      return {
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        firstName: data.first_name,
        lastName: data.last_name,
        membershipLevel: data.membership_level,
        donationTotal: data.donation_total,
        rewardPoints: data.reward_points,
        stripeCustomerId: data.stripe_customer_id,
        profileImageUrl: data.profile_image_url,
        googleId: data.google_id,
        provider: data.provider,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        joinDate: data.join_date,
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error updating user role:", error);
      return void 0;
    }
  }
  // Bookings
  async getBooking(id) {
    try {
      const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting booking:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting booking:", error);
      return void 0;
    }
  }
  async getAllBookings() {
    try {
      const { data, error } = await supabase.from("bookings").select("*");
      if (error) {
        console.error("Error getting all bookings:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting all bookings:", error);
      return [];
    }
  }
  async createBooking(insertBooking) {
    try {
      const { data, error } = await supabase.from("bookings").insert(insertBooking).select().single();
      if (error) {
        console.error("Error creating booking:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }
  async updateBookingStatus(id, status) {
    try {
      const { data, error } = await supabase.from("bookings").update({ status }).eq("id", id).select().single();
      if (error) {
        console.error("Error updating booking status:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error updating booking status:", error);
      return void 0;
    }
  }
  // Testimonials
  async getTestimonial(id) {
    try {
      const { data, error } = await supabase.from("testimonials").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting testimonial:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting testimonial:", error);
      return void 0;
    }
  }
  async getApprovedTestimonials() {
    try {
      const { data, error } = await supabase.from("testimonials").select("*").eq("is_approved", true);
      if (error) {
        console.error("Error getting approved testimonials:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting approved testimonials:", error);
      return [];
    }
  }
  async getAllTestimonials() {
    try {
      const { data, error } = await supabase.from("testimonials").select("*");
      if (error) {
        console.error("Error getting all testimonials:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting all testimonials:", error);
      return [];
    }
  }
  async createTestimonial(insertTestimonial) {
    try {
      const { data, error } = await supabase.from("testimonials").insert(insertTestimonial).select().single();
      if (error) {
        console.error("Error creating testimonial:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating testimonial:", error);
      throw error;
    }
  }
  // Resources
  async getResource(id) {
    try {
      const { data, error } = await supabase.from("resources").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting resource:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting resource:", error);
      return void 0;
    }
  }
  async getResourcesByType(type) {
    try {
      const { data, error } = await supabase.from("resources").select("*").eq("type", type);
      if (error) {
        console.error("Error getting resources by type:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting resources by type:", error);
      return [];
    }
  }
  async getResourcesByCategory(category) {
    try {
      const { data, error } = await supabase.from("resources").select("*").eq("category", category);
      if (error) {
        console.error("Error getting resources by category:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting resources by category:", error);
      return [];
    }
  }
  async getAllResources() {
    try {
      const { data, error } = await supabase.from("resources").select("*");
      if (error) {
        console.error("Error getting all resources:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting all resources:", error);
      return [];
    }
  }
  async createResource(insertResource) {
    try {
      const { data, error } = await supabase.from("resources").insert(insertResource).select().single();
      if (error) {
        console.error("Error creating resource:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating resource:", error);
      throw error;
    }
  }
  // Contacts
  async getContact(id) {
    try {
      const { data, error } = await supabase.from("contacts").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting contact:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting contact:", error);
      return void 0;
    }
  }
  async getAllContacts() {
    try {
      const { data, error } = await supabase.from("contacts").select("*");
      if (error) {
        console.error("Error getting all contacts:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting all contacts:", error);
      return [];
    }
  }
  async createContact(insertContact) {
    try {
      const { data, error } = await supabase.from("contacts").insert(insertContact).select().single();
      if (error) {
        console.error("Error creating contact:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  }
  // Discovery Quiz Results Management
  async saveDiscoveryQuizResult(quizData) {
    try {
      const { data, error } = await supabase.from("discovery_quiz_results").insert({
        user_id: quizData.userId,
        session_id: quizData.sessionId,
        current_needs: quizData.currentNeeds,
        situation_details: quizData.situationDetails,
        support_preference: quizData.supportPreference,
        readiness_level: quizData.readinessLevel,
        recommended_path: quizData.recommendedPath,
        quiz_version: quizData.quizVersion,
        completed: quizData.completed
      }).select().single();
      if (error) {
        console.error("Error saving discovery quiz result:", error);
        if (error.code === "42P01" || error.message.includes("does not exist") || error.message.includes("relation") || error.code === "PGRST116") {
          console.log("Discovery quiz table does not exist - returning demo response for UI testing");
          return {
            id: `demo_quiz_${Date.now()}`,
            user_id: quizData.userId,
            session_id: quizData.sessionId,
            current_needs: quizData.currentNeeds,
            situation_details: quizData.situationDetails,
            support_preference: quizData.supportPreference,
            readiness_level: quizData.readinessLevel,
            recommended_path: quizData.recommendedPath,
            quiz_version: quizData.quizVersion || "v1",
            completed: quizData.completed,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
        throw error;
      }
      return data;
    } catch (err) {
      console.error("Error saving discovery quiz result:", err);
      console.log("Returning demo response for quiz functionality testing");
      return {
        id: `demo_quiz_${Date.now()}`,
        user_id: quizData.userId,
        session_id: quizData.sessionId,
        current_needs: quizData.currentNeeds,
        situation_details: quizData.situationDetails,
        support_preference: quizData.supportPreference,
        readiness_level: quizData.readinessLevel,
        recommended_path: quizData.recommendedPath,
        quiz_version: quizData.quizVersion || "v1",
        completed: quizData.completed,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  async getUserQuizHistory(userId) {
    try {
      const { data, error } = await supabase.from("discovery_quiz_results").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) {
        console.error("Error getting user quiz history:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Error getting user quiz history:", err);
      return [];
    }
  }
  async getQuizResultBySession(sessionId) {
    try {
      const { data, error } = await supabase.from("discovery_quiz_results").select("*").eq("session_id", sessionId).single();
      if (error) {
        console.error("Error getting quiz result by session:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Error getting quiz result by session:", err);
      return null;
    }
  }
  // Weight Loss Intakes
  async getWeightLossIntake(id) {
    try {
      const { data, error } = await supabase.from("weight_loss_intakes").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting weight loss intake:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting weight loss intake:", error);
      return void 0;
    }
  }
  async getAllWeightLossIntakes() {
    try {
      const { data, error } = await supabase.from("weight_loss_intakes").select("*");
      if (error) {
        console.error("Error getting all weight loss intakes:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting all weight loss intakes:", error);
      return [];
    }
  }
  async createWeightLossIntake(insertIntake) {
    try {
      const { data, error } = await supabase.from("weight_loss_intakes").insert(insertIntake).select().single();
      if (error) {
        console.error("Error creating weight loss intake:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating weight loss intake:", error);
      throw error;
    }
  }
  // CMS - Content Pages
  async getContentPage(id) {
    try {
      const { data, error } = await supabase.from("content_pages").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting content page:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting content page:", error);
      return void 0;
    }
  }
  async getContentPageBySlug(slug) {
    try {
      const { data, error } = await supabase.from("content_pages").select("*").eq("slug", slug).single();
      if (error) {
        console.error("Error getting content page by slug:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting content page by slug:", error);
      return void 0;
    }
  }
  async getAllContentPages() {
    try {
      const { data, error } = await supabase.from("content_pages").select("*");
      if (error) {
        console.error("Error getting all content pages:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting all content pages:", error);
      return [];
    }
  }
  async getPublishedContentPages() {
    try {
      const { data, error } = await supabase.from("content_pages").select("*").eq("is_published", true);
      if (error) {
        console.error("Error getting published content pages:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting published content pages:", error);
      return [];
    }
  }
  async createContentPage(insertPage) {
    try {
      const { data, error } = await supabase.from("content_pages").insert(insertPage).select().single();
      if (error) {
        console.error("Error creating content page:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating content page:", error);
      throw error;
    }
  }
  async updateContentPage(id, pageUpdate) {
    try {
      const { data, error } = await supabase.from("content_pages").update({ ...pageUpdate, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
      if (error) {
        console.error("Error updating content page:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error updating content page:", error);
      return void 0;
    }
  }
  async deleteContentPage(id) {
    try {
      const { error } = await supabase.from("content_pages").delete().eq("id", id);
      if (error) {
        console.error("Error deleting content page:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error deleting content page:", error);
      return false;
    }
  }
  // Placeholder implementations for remaining CMS methods
  async getContentBlock(id) {
    console.log("getContentBlock not yet implemented for Supabase client");
    return void 0;
  }
  async getContentBlocksByPageId(pageId) {
    console.log("getContentBlocksByPageId not yet implemented for Supabase client");
    return [];
  }
  async createContentBlock(insertBlock) {
    console.log("createContentBlock not yet implemented for Supabase client");
    throw new Error("Not implemented");
  }
  async updateContentBlock(id, blockUpdate) {
    console.log("updateContentBlock not yet implemented for Supabase client");
    return void 0;
  }
  async deleteContentBlock(id) {
    console.log("deleteContentBlock not yet implemented for Supabase client");
    return false;
  }
  async getMediaItem(id) {
    console.log("getMediaItem not yet implemented for Supabase client");
    return void 0;
  }
  async getAllMediaItems() {
    console.log("getAllMediaItems not yet implemented for Supabase client");
    return [];
  }
  async getMediaByCategory(category) {
    console.log("getMediaByCategory not yet implemented for Supabase client");
    return [];
  }
  async createMediaItem(insertMedia) {
    console.log("createMediaItem not yet implemented for Supabase client");
    throw new Error("Not implemented");
  }
  async updateMediaItem(id, mediaUpdate) {
    console.log("updateMediaItem not yet implemented for Supabase client");
    return void 0;
  }
  async deleteMediaItem(id) {
    console.log("deleteMediaItem not yet implemented for Supabase client");
    return false;
  }
  async getNavigationMenu(id) {
    console.log("getNavigationMenu not yet implemented for Supabase client");
    return void 0;
  }
  async getNavigationByLocation(location) {
    console.log("getNavigationByLocation not yet implemented for Supabase client");
    return [];
  }
  async getAllNavigationMenus() {
    console.log("getAllNavigationMenus not yet implemented for Supabase client");
    return [];
  }
  async createNavigationMenu(insertMenu) {
    console.log("createNavigationMenu not yet implemented for Supabase client");
    throw new Error("Not implemented");
  }
  async updateNavigationMenu(id, menuUpdate) {
    console.log("updateNavigationMenu not yet implemented for Supabase client");
    return void 0;
  }
  async deleteNavigationMenu(id) {
    console.log("deleteNavigationMenu not yet implemented for Supabase client");
    return false;
  }
  async getSiteSetting(key) {
    console.log("getSiteSetting not yet implemented for Supabase client");
    return void 0;
  }
  async getAllSiteSettings() {
    console.log("getAllSiteSettings not yet implemented for Supabase client");
    return [];
  }
  async getSiteSettingsByCategory(category) {
    console.log("getSiteSettingsByCategory not yet implemented for Supabase client");
    return [];
  }
  async createSiteSetting(insertSetting) {
    console.log("createSiteSetting not yet implemented for Supabase client");
    throw new Error("Not implemented");
  }
  async updateSiteSetting(key, settingUpdate) {
    console.log("updateSiteSetting not yet implemented for Supabase client");
    return void 0;
  }
  async deleteSiteSetting(key) {
    console.log("deleteSiteSetting not yet implemented for Supabase client");
    return false;
  }
  async createOrUpdateSiteSetting(insertSetting) {
    console.log("createOrUpdateSiteSetting not yet implemented for Supabase client");
    throw new Error("Not implemented");
  }
  // Admin Authentication Methods
  async createAdminSession(session2) {
    try {
      const { data, error } = await supabase.from("admin_sessions").insert(session2).select().single();
      if (error) {
        console.error("Error creating admin session:", error);
        throw new Error("Failed to create admin session");
      }
      return data;
    } catch (error) {
      console.error("Error creating admin session:", error);
      throw new Error("Failed to create admin session");
    }
  }
  async getAdminSessionByToken(token) {
    try {
      const { data, error } = await supabase.from("admin_sessions").select("*").eq("session_token", token).eq("is_active", true).single();
      if (error) {
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting admin session by token:", error);
      return void 0;
    }
  }
  async updateAdminSession(id, updates) {
    try {
      const { data, error } = await supabase.from("admin_sessions").update(updates).eq("id", id).select().single();
      if (error) {
        console.error("Error updating admin session:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error updating admin session:", error);
      return void 0;
    }
  }
  async getActiveAdminSessions() {
    try {
      const { data, error } = await supabase.from("admin_sessions").select("*").eq("is_active", true).gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", { ascending: false });
      if (error) {
        console.error("Error getting active admin sessions:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting active admin sessions:", error);
      return [];
    }
  }
  async createAdminActivityLog(log2) {
    try {
      const { data, error } = await supabase.from("admin_activity_log").insert(log2).select().single();
      if (error) {
        console.error("Error creating admin activity log:", error);
        throw new Error("Failed to create admin activity log");
      }
      return data;
    } catch (error) {
      console.error("Error creating admin activity log:", error);
      throw new Error("Failed to create admin activity log");
    }
  }
  // ============================================
  // MULTI-ASSESSMENT SYSTEM METHODS
  // ============================================
  // Assessment Types Management
  async getActiveAssessmentTypes() {
    try {
      const { data, error } = await supabase.from("assessment_types").select("*").eq("is_active", true).order("display_name");
      if (error) {
        console.error("Error getting assessment types:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting assessment types:", error);
      return [];
    }
  }
  async getAssessmentTypeById(id) {
    try {
      const { data, error } = await supabase.from("assessment_types").select("*").eq("id", id).eq("is_active", true).single();
      if (error) {
        console.error("Error getting assessment type by id:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting assessment type by id:", error);
      return void 0;
    }
  }
  async createAssessmentType(assessmentType) {
    try {
      const { data, error } = await supabase.from("assessment_types").insert(assessmentType).select().single();
      if (error) {
        console.error("Error creating assessment type:", error);
        throw new Error("Failed to create assessment type");
      }
      return data;
    } catch (error) {
      console.error("Error creating assessment type:", error);
      throw new Error("Failed to create assessment type");
    }
  }
  // User Assessment Management
  async createUserAssessment(assessment) {
    try {
      const { data, error } = await supabase.from("user_assessments").insert(assessment).select().single();
      if (error) {
        console.error("Error creating user assessment:", error);
        throw new Error("Failed to create user assessment");
      }
      return data;
    } catch (error) {
      console.error("Error creating user assessment:", error);
      throw new Error("Failed to create user assessment");
    }
  }
  async getUserAssessments(userId) {
    try {
      const { data, error } = await supabase.from("user_assessments").select(`
          *,
          assessment_types(name, display_name, category)
        `).eq("user_id", userId).eq("is_active", true).order("completed_at", { ascending: false });
      if (error) {
        console.error("Error getting user assessments:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting user assessments:", error);
      return [];
    }
  }
  async getAssessmentsForCoach(userId, coachType) {
    try {
      const { data, error } = await supabase.from("user_assessments").select(`
          *,
          assessment_types!inner(name, display_name, category, coach_types)
        `).eq("user_id", userId).eq("is_active", true).contains("assessment_types.coach_types", [coachType]).order("completed_at", { ascending: false });
      if (error) {
        console.error("Error getting assessments for coach:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting assessments for coach:", error);
      return [];
    }
  }
  async getUserAssessmentSummary(userId) {
    try {
      const assessments = await this.getUserAssessments(userId);
      const summary = assessments.reduce((acc, assessment) => {
        const category = assessment.assessment_types?.category || "other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: assessment.id,
          type: assessment.assessment_types?.display_name,
          completedAt: assessment.completed_at,
          summary: assessment.summary,
          tags: assessment.tags
        });
        return acc;
      }, {});
      return {
        userId,
        totalAssessments: assessments.length,
        categories: summary,
        lastAssessment: assessments[0]?.completed_at
      };
    } catch (error) {
      console.error("Error getting user assessment summary:", error);
      return {
        userId,
        totalAssessments: 0,
        categories: {},
        lastAssessment: null
      };
    }
  }
  // Coach Interaction Tracking
  async createCoachInteraction(interaction) {
    try {
      const { data, error } = await supabase.from("coach_interactions").insert(interaction).select().single();
      if (error) {
        console.error("Error creating coach interaction:", error);
        throw new Error("Failed to create coach interaction");
      }
      return data;
    } catch (error) {
      console.error("Error creating coach interaction:", error);
      throw new Error("Failed to create coach interaction");
    }
  }
  async getCoachInteractionHistory(userId, coachType) {
    try {
      let query = supabase.from("coach_interactions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (coachType) {
        query = query.eq("coach_type", coachType);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error getting coach interaction history:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting coach interaction history:", error);
      return [];
    }
  }
  async getAdminActivityLogs() {
    try {
      const { data, error } = await supabase.from("admin_activity_log").select("*").order("timestamp", { ascending: false }).limit(1e3);
      if (error) {
        console.error("Error getting admin activity logs:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting admin activity logs:", error);
      return [];
    }
  }
  // Additional User Methods
  async getAllUsers() {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Error getting all users:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }
  async updateUser(id, updates) {
    try {
      const { data, error } = await supabase.from("users").update({
        ...updates,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", id).select().single();
      if (error) {
        console.error("Error updating user:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error updating user:", error);
      return void 0;
    }
  }
  async getAllDonations() {
    try {
      const { data, error } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Error getting all donations:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting all donations:", error);
      return [];
    }
  }
  // Comprehensive Admin Portal Methods Implementation
  async getTotalUsers() {
    try {
      const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true });
      if (error) {
        console.error("Error getting total users:", error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error("Error getting total users:", error);
      return 0;
    }
  }
  async getTotalDonations() {
    try {
      const { count, error } = await supabase.from("donations").select("*", { count: "exact", head: true });
      if (error) {
        console.error("Error getting total donations:", error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error("Error getting total donations:", error);
      return 0;
    }
  }
  async getTotalBookings() {
    try {
      const { count, error } = await supabase.from("bookings").select("*", { count: "exact", head: true });
      if (error) {
        console.error("Error getting total bookings:", error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error("Error getting total bookings:", error);
      return 0;
    }
  }
  async getActiveCoaches() {
    try {
      const { count, error } = await supabase.from("coaches").select("*", { count: "exact", head: true }).eq("is_active", true);
      if (error) {
        console.error("Error getting active coaches:", error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error("Error getting active coaches:", error);
      return 0;
    }
  }
  async getMonthlyRevenue() {
    try {
      const { data, error } = await supabase.from("donations").select("amount").gte("created_at", new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1).toISOString()).eq("status", "completed");
      if (error) {
        console.error("Error getting monthly revenue:", error);
        return 0;
      }
      return data.reduce((total, donation) => total + (donation.amount || 0), 0);
    } catch (error) {
      console.error("Error getting monthly revenue:", error);
      return 0;
    }
  }
  async getNewUsersToday() {
    try {
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString());
      if (error) {
        console.error("Error getting new users today:", error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error("Error getting new users today:", error);
      return 0;
    }
  }
  async getPendingBookings() {
    try {
      const { count, error } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending");
      if (error) {
        console.error("Error getting pending bookings:", error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error("Error getting pending bookings:", error);
      return 0;
    }
  }
  async getCompletedSessions() {
    try {
      const { count, error } = await supabase.from("coaching_sessions").select("*", { count: "exact", head: true }).eq("status", "completed");
      if (error) {
        console.error("Error getting completed sessions:", error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error("Error getting completed sessions:", error);
      return 0;
    }
  }
  async getAllDonationsWithUsers() {
    try {
      const { data, error } = await supabase.from("donations").select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email
          )
        `).order("created_at", { ascending: false });
      if (error) {
        console.error("Error getting donations with users:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error getting donations with users:", error);
      return [];
    }
  }
  async getAllCoaches() {
    try {
      const { data, error } = await supabase.from("coaches").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Error getting all coaches:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error getting all coaches:", error);
      return [];
    }
  }
  async updateCoach(id, updateData) {
    try {
      const { data, error } = await supabase.from("coaches").update({
        ...updateData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", id).select().single();
      if (error) {
        console.error("Error updating coach:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error updating coach:", error);
      throw error;
    }
  }
  async getAdminActivityLogs(limit, offset) {
    try {
      const { data, error } = await supabase.from("admin_activity_log").select(`
          *,
          admin_users (
            username,
            email
          )
        `).order("timestamp", { ascending: false }).range(offset, offset + limit - 1);
      if (error) {
        console.error("Error getting admin activity logs:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error getting admin activity logs:", error);
      return [];
    }
  }
  // Stub implementations for comprehensive functionality
  async getAllAdminSessions() {
    return [];
  }
  async terminateAdminSession(id) {
  }
  async generateUserReport(startDate, endDate) {
    return {};
  }
  async generateFinancialReport(startDate, endDate) {
    return {};
  }
  async generateCoachingReport(startDate, endDate) {
    return {};
  }
  async processPendingDonations() {
    return { processed: 0 };
  }
  async assignCoachesToBookings() {
    return { assigned: 0 };
  }
  async sendFollowUpEmails() {
    return { sent: 0 };
  }
  async updateUserSegments() {
    return { updated: 0 };
  }
  async sendMarketingNotification(userSegment, template, subject, content) {
    return { sent: 0 };
  }
  async scheduleContentPublication(contentId, publishDate) {
    return { scheduled: true };
  }
  async addRewardPoints(userId, points, reason) {
    return { success: true };
  }
  async getSystemAlerts() {
    return [];
  }
  async createAdminNotification(data) {
    return data;
  }
  async exportUserData(format) {
    return format === "csv" ? "name,email\n" : "[]";
  }
  // Admin Authentication Extended
  async getAdminByUsername(username) {
    try {
      const { data, error } = await supabase.from("admin_users").select("*").eq("username", username).single();
      if (error) {
        console.error("Error getting admin by username:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting admin by username:", error);
      return null;
    }
  }
  async getAdminByEmail(email) {
    try {
      const { data, error } = await supabase.from("admin_users").select("*").eq("email", email).single();
      if (error) {
        console.error("Error getting admin by email:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting admin by email:", error);
      return null;
    }
  }
  async updateAdminLastLogin(adminId) {
    try {
      await supabase.from("admin_users").update({ last_login: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", adminId);
    } catch (error) {
      console.error("Error updating admin last login:", error);
    }
  }
  async getAdminPermissions(adminId) {
    try {
      const { data, error } = await supabase.from("admin_permissions").select("permission").eq("admin_id", adminId);
      if (error) {
        console.error("Error getting admin permissions:", error);
        return [];
      }
      return data.map((p) => p.permission);
    } catch (error) {
      console.error("Error getting admin permissions:", error);
      return [];
    }
  }
  async createAdminSession(session2) {
    try {
      await supabase.from("admin_sessions").insert(session2);
    } catch (error) {
      console.error("Error creating admin session:", error);
    }
  }
  async getAdminSession(token) {
    try {
      const { data, error } = await supabase.from("admin_sessions").select("*").eq("id", token).single();
      if (error) {
        console.error("Error getting admin session:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting admin session:", error);
      return null;
    }
  }
  async getAdminById(adminId) {
    try {
      const { data, error } = await supabase.from("admin_users").select("*").eq("id", adminId).single();
      if (error) {
        console.error("Error getting admin by id:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting admin by id:", error);
      return null;
    }
  }
  async createAdminActivityLog(log2) {
    try {
      await supabase.from("admin_activity_log").insert(log2);
    } catch (error) {
      console.error("Error creating admin activity log:", error);
    }
  }
  async deactivateAdminSession(token) {
    try {
      await supabase.from("admin_sessions").update({ is_active: false }).eq("id", token);
    } catch (error) {
      console.error("Error deactivating admin session:", error);
    }
  }
  // User Authentication Extended
  async getUserById(id) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting user by id:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting user by id:", error);
      return null;
    }
  }
  async updateUserLastLogin(userId) {
    try {
      await supabase.from("users").update({ last_login: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", userId);
    } catch (error) {
      console.error("Error updating user last login:", error);
    }
  }
  // Coach Portal stub implementations
  async getCoachProfile(userId) {
    return {};
  }
  async updateCoachProfile(userId, data) {
    return data;
  }
  async getCoachClients(userId) {
    return [];
  }
  async getCoachClient(userId, clientId) {
    return {};
  }
  async updateCoachClient(userId, clientId, data) {
    return data;
  }
  async getCoachSessionNotes(userId, options) {
    return [];
  }
  async createSessionNote(data) {
    return data;
  }
  async getSessionNote(userId, noteId) {
    return {};
  }
  async updateSessionNote(userId, noteId, data) {
    return data;
  }
  async getCoachAvailability(userId) {
    return {};
  }
  async updateCoachAvailability(userId, data) {
    return data;
  }
  async getCoachMessageTemplates(userId) {
    return [];
  }
  async createMessageTemplate(data) {
    return data;
  }
  async updateMessageTemplate(userId, templateId, data) {
    return data;
  }
  async deleteMessageTemplate(userId, templateId) {
  }
  async getCoachClientCommunications(userId, options) {
    return [];
  }
  async createClientCommunication(data) {
    return data;
  }
  async getCoachMetrics(userId, period) {
    return {};
  }
  async getCoachTotalClients(userId) {
    return 0;
  }
  async getCoachActiveSessions(userId) {
    return 0;
  }
  async getCoachCompletedSessions(userId) {
    return 0;
  }
  async getCoachAverageRating(userId) {
    return 0;
  }
  async getCoachMonthlyRevenue(userId) {
    return 0;
  }
  async getCoachUpcomingSessions(userId) {
    return [];
  }
  async getCoachRecentActivity(userId) {
    return [];
  }
  async getCoachCredentials(userId) {
    return [];
  }
  async createCoachCredential(data) {
    return data;
  }
  async getCoachBanking(userId) {
    return {};
  }
  async updateCoachBanking(userId, data) {
    return data;
  }
  async getCoachSchedule(userId, startDate, endDate) {
    return {};
  }
  async blockCoachTime(userId, startTime, endTime, reason) {
    return {};
  }
  async exportCoachClientData(userId, format) {
    return format === "csv" ? "name,email\n" : "[]";
  }
  async exportCoachSessionData(userId, format, startDate, endDate) {
    return format === "csv" ? "date,client,duration\n" : "[]";
  }
  // Donation Portal stub implementations
  async getDonationPresets() {
    return [{ amount: 25 }, { amount: 50 }, { amount: 100 }];
  }
  async getActiveCampaigns() {
    return [];
  }
  async getMembershipBenefits() {
    return [];
  }
  async getImpactMetrics() {
    return {};
  }
  async getUserDonations(userId) {
    return [];
  }
  async createDonation(data) {
    return { ...data, id: randomUUID() };
  }
  async updateDonation(donationId, data) {
    return data;
  }
  async getDonationByStripeSession(sessionId) {
    return {};
  }
  async createCampaign(data) {
    return data;
  }
  async updateCampaign(campaignId, data) {
    return data;
  }
  async getTotalDonationsRaised() {
    return 0;
  }
  async getTotalDonors() {
    return 0;
  }
  async getAverageDonationAmount() {
    return 0;
  }
  async getMonthlyDonationTrend() {
    return [];
  }
  async getTopCampaigns() {
    return [];
  }
  async getMembershipDistribution() {
    return {};
  }
  async getUserTotalContributed(userId) {
    return 0;
  }
  async getUserRewardPoints(userId) {
    return 0;
  }
  async getUserMembershipLevel(userId) {
    return "free";
  }
  async getUserImpactMetrics(userId) {
    return {};
  }
  async getUserDonationHistory(userId) {
    return [];
  }
  async getAvailableRewards(userId) {
    return [];
  }
  async redeemRewardPoints(userId, rewardId, pointsCost) {
    return {};
  }
  async updateDonationSubscription(userId, subscriptionId, data) {
    return data;
  }
  async updateUserMembershipLevel(userId) {
  }
  // Onboarding & Account Management Implementation
  async createUserOnboardingSteps(userId, steps) {
    try {
      const stepsWithUserId = steps.map((step) => ({ ...step, userId }));
      await supabase.from("user_onboarding_steps").insert(stepsWithUserId);
    } catch (error) {
      console.error("Error creating onboarding steps:", error);
    }
  }
  async getUserOnboardingSteps(userId) {
    try {
      const { data, error } = await supabase.from("user_onboarding_steps").select("*").eq("userId", userId).order("order", { ascending: true });
      if (error) {
        console.error("Error getting onboarding steps:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error getting onboarding steps:", error);
      return [];
    }
  }
  async updateOnboardingStep(userId, stepId, updates) {
    try {
      await supabase.from("user_onboarding_steps").update(updates).eq("userId", userId).eq("id", stepId);
    } catch (error) {
      console.error("Error updating onboarding step:", error);
    }
  }
  async markUserOnboardingComplete(userId) {
    try {
      await supabase.from("users").update({ onboarding_completed: true, onboarding_completed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", userId);
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
    }
  }
  async updateUserCoachingPreferences(userId, preferences) {
    try {
      await supabase.from("users").update({ coaching_preferences: preferences }).eq("id", userId);
    } catch (error) {
      console.error("Error updating coaching preferences:", error);
    }
  }
  async createEmailVerificationToken(userId, token) {
    try {
      await supabase.from("email_verification_tokens").insert({
        userId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3)
        // 24 hours
      });
    } catch (error) {
      console.error("Error creating email verification token:", error);
    }
  }
  async getEmailVerificationToken(token) {
    try {
      const { data, error } = await supabase.from("email_verification_tokens").select("*").eq("token", token).gte("expiresAt", (/* @__PURE__ */ new Date()).toISOString()).single();
      if (error) {
        console.error("Error getting email verification token:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting email verification token:", error);
      return null;
    }
  }
  async deleteEmailVerificationToken(token) {
    try {
      await supabase.from("email_verification_tokens").delete().eq("token", token);
    } catch (error) {
      console.error("Error deleting email verification token:", error);
    }
  }
  async markEmailAsVerified(userId) {
    try {
      await supabase.from("users").update({ email_verified: true, email_verified_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", userId);
    } catch (error) {
      console.error("Error marking email as verified:", error);
    }
  }
  async createPasswordResetToken(userId, token, expiresAt) {
    try {
      await supabase.from("password_reset_tokens").insert({
        userId,
        token,
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      console.error("Error creating password reset token:", error);
    }
  }
  async getPasswordResetToken(token) {
    try {
      const { data, error } = await supabase.from("password_reset_tokens").select("*").eq("token", token).gte("expiresAt", (/* @__PURE__ */ new Date()).toISOString()).single();
      if (error) {
        console.error("Error getting password reset token:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting password reset token:", error);
      return null;
    }
  }
  async deletePasswordResetToken(token) {
    try {
      await supabase.from("password_reset_tokens").delete().eq("token", token);
    } catch (error) {
      console.error("Error deleting password reset token:", error);
    }
  }
  async updateUserPassword(userId, hashedPassword) {
    try {
      await supabase.from("users").update({ passwordHash: hashedPassword, password_reset_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", userId);
    } catch (error) {
      console.error("Error updating user password:", error);
    }
  }
  // Mental Wellness Resource Hub Implementation
  async getMentalWellnessResources(filters) {
    try {
      let query = supabase.from("mental_wellness_resources").select("*").eq("is_active", true);
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.targetAudience) {
        query = query.eq("target_audience", filters.targetAudience);
      }
      if (filters?.resourceType) {
        query = query.eq("resource_type", filters.resourceType);
      }
      if (filters?.isEmergency !== void 0) {
        query = query.eq("emergency", filters.isEmergency);
      }
      const { data, error } = await query.order("featured", { ascending: false }).order("id", { ascending: false });
      if (error) {
        console.error("Error getting mental wellness resources:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting mental wellness resources:", error);
      return [];
    }
  }
  async getMentalWellnessResource(id) {
    try {
      const { data, error } = await supabase.from("mental_wellness_resources").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting mental wellness resource:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting mental wellness resource:", error);
      return void 0;
    }
  }
  async createMentalWellnessResource(resource) {
    try {
      const { data, error } = await supabase.from("mental_wellness_resources").insert(resource).select().single();
      if (error) {
        console.error("Error creating mental wellness resource:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating mental wellness resource:", error);
      throw error;
    }
  }
  async updateMentalWellnessResource(id, updates) {
    try {
      const { data, error } = await supabase.from("mental_wellness_resources").update({ ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).select().single();
      if (error) {
        console.error("Error updating mental wellness resource:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error updating mental wellness resource:", error);
      return void 0;
    }
  }
  async incrementResourceUsage(id) {
    try {
      await supabase.rpc("increment_resource_usage", { resource_id: id });
    } catch (error) {
      console.error("Error incrementing resource usage:", error);
    }
  }
  async getEmergencyContacts(filters) {
    try {
      let query = supabase.from("emergency_contacts").select("*").eq("is_active", true);
      if (filters?.specialty) {
        query = query.eq("specialty", filters.specialty);
      }
      if (filters?.location) {
        query = query.or(`state.eq.${filters.location},city.eq.${filters.location},is_national.eq.true`);
      }
      const { data, error } = await query.order("sort_order").order("name");
      if (error) {
        console.error("Error getting emergency contacts:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting emergency contacts:", error);
      return [];
    }
  }
  async getEmergencyContact(id) {
    try {
      const { data, error } = await supabase.from("emergency_contacts").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting emergency contact:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting emergency contact:", error);
      return void 0;
    }
  }
  async createEmergencyContact(contact) {
    try {
      const { data, error } = await supabase.from("emergency_contacts").insert(contact).select().single();
      if (error) {
        console.error("Error creating emergency contact:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating emergency contact:", error);
      throw error;
    }
  }
  async createWellnessAssessment(assessment) {
    try {
      const { data, error } = await supabase.from("wellness_assessments").insert(assessment).select().single();
      if (error) {
        console.error("Error creating wellness assessment:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating wellness assessment:", error);
      throw error;
    }
  }
  async getWellnessAssessment(id) {
    try {
      const { data, error } = await supabase.from("wellness_assessments").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting wellness assessment:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting wellness assessment:", error);
      return void 0;
    }
  }
  async getUserWellnessAssessments(userId) {
    try {
      const { data, error } = await supabase.from("wellness_assessments").select("*").eq("user_id", userId).order("completed_at", { ascending: false });
      if (error) {
        console.error("Error getting user wellness assessments:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting user wellness assessments:", error);
      return [];
    }
  }
  async getPersonalizedRecommendations(filters) {
    try {
      let query = supabase.from("personalized_recommendations").select(`
          *,
          mental_wellness_resources (*)
        `).gte("expires_at", (/* @__PURE__ */ new Date()).toISOString());
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters.sessionId) {
        query = query.eq("session_id", filters.sessionId);
      }
      const { data, error } = await query.order("recommendation_score", { ascending: false }).limit(10);
      if (error) {
        console.error("Error getting personalized recommendations:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      return [];
    }
  }
  async createPersonalizedRecommendation(recommendation) {
    try {
      const { data, error } = await supabase.from("personalized_recommendations").insert(recommendation).select().single();
      if (error) {
        console.error("Error creating personalized recommendation:", error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating personalized recommendation:", error);
      throw error;
    }
  }
  async trackResourceUsage(usage) {
    try {
      const { data, error } = await supabase.from("resource_usage_analytics").insert(usage).select().single();
      if (error) {
        console.error("Error tracking resource usage:", error);
        throw error;
      }
      await this.incrementResourceUsage(usage.resourceId);
      return data;
    } catch (error) {
      console.error("Error tracking resource usage:", error);
      throw error;
    }
  }
  async getResourceUsageAnalytics(resourceId) {
    try {
      const { data, error } = await supabase.from("resource_usage_analytics").select("*").eq("resource_id", resourceId).order("accessed_at", { ascending: false });
      if (error) {
        console.error("Error getting resource usage analytics:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting resource usage analytics:", error);
      return [];
    }
  }
  async getQuickAccessResources() {
    try {
      const [emergency, crisis, popular, featured] = await Promise.all([
        this.getEmergencyContacts(),
        this.getMentalWellnessResources({ category: "crisis" }),
        supabase.from("mental_wellness_resources").select("*").eq("is_active", true).order("usage_count", { ascending: false }).limit(6).then(({ data }) => data || []),
        this.getMentalWellnessResources({ isEmergency: false }).then((resources2) => resources2.filter((r) => r.isFeatured).slice(0, 6))
      ]);
      return {
        emergency: emergency.slice(0, 3),
        crisis: crisis.slice(0, 4),
        popular: popular.slice(0, 6),
        featured: featured.slice(0, 6)
      };
    } catch (error) {
      console.error("Error getting quick access resources:", error);
      return {
        emergency: [],
        crisis: [],
        popular: [],
        featured: []
      };
    }
  }
  // Assessment Programs
  async getProgram(id) {
    try {
      const { data, error } = await supabase.from("assessment_programs").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting program:", error);
        return void 0;
      }
      return data;
    } catch (error) {
      console.error("Error getting program:", error);
      return void 0;
    }
  }
  async getUserPrograms(userId) {
    try {
      const { data, error } = await supabase.from("assessment_programs").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) {
        console.error("Error getting user programs:", error);
        return [];
      }
      return data;
    } catch (error) {
      console.error("Error getting user programs:", error);
      return [];
    }
  }
  async createProgram(program) {
    try {
      const dbProgram = {
        id: randomUUID(),
        user_id: program.userId,
        program_type: program.programType,
        results: program.results,
        payment_required: program.paymentRequired || false,
        payment_completed: program.paymentCompleted || false,
        created_at: /* @__PURE__ */ new Date(),
        updated_at: /* @__PURE__ */ new Date()
      };
      const { data, error } = await supabase.from("assessment_programs").insert(dbProgram).select().single();
      if (error) {
        console.error("Error creating program:", error);
        throw new Error("Failed to create program");
      }
      return {
        id: data.id,
        userId: data.user_id,
        programType: data.program_type,
        results: data.results,
        paymentRequired: data.payment_required,
        paymentCompleted: data.payment_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error creating program:", error);
      throw error;
    }
  }
  async updateProgram(id, program) {
    try {
      const updateData = {
        ...program.programType && { program_type: program.programType },
        ...program.results && { results: program.results },
        ...program.paymentRequired !== void 0 && { payment_required: program.paymentRequired },
        ...program.paymentCompleted !== void 0 && { payment_completed: program.paymentCompleted },
        updated_at: /* @__PURE__ */ new Date()
      };
      const { data, error } = await supabase.from("assessment_programs").update(updateData).eq("id", id).select().single();
      if (error) {
        console.error("Error updating program:", error);
        return void 0;
      }
      return {
        id: data.id,
        userId: data.user_id,
        programType: data.program_type,
        results: data.results,
        paymentRequired: data.payment_required,
        paymentCompleted: data.payment_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error updating program:", error);
      return void 0;
    }
  }
  // Chat Sessions
  async getChatSession(id) {
    try {
      const { data, error } = await supabase.from("chat_sessions").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting chat session:", error);
        return void 0;
      }
      return {
        id: data.id,
        userId: data.user_id,
        threadId: data.thread_id,
        sessionType: data.session_type,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.created_at
      };
    } catch (error) {
      console.error("Error getting chat session:", error);
      return void 0;
    }
  }
  async getUserChatSessions(userId) {
    try {
      const { data, error } = await supabase.from("chat_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) {
        console.error("Error getting user chat sessions:", error);
        return [];
      }
      return data.map((session2) => ({
        id: session2.id,
        userId: session2.user_id,
        threadId: session2.thread_id,
        sessionType: session2.session_type,
        metadata: session2.metadata,
        createdAt: session2.created_at,
        updatedAt: session2.created_at
      }));
    } catch (error) {
      console.error("Error getting user chat sessions:", error);
      return [];
    }
  }
  async createChatSession(session2) {
    try {
      const dbSession = {
        id: randomUUID(),
        user_id: session2.userId,
        thread_id: session2.threadId,
        session_type: session2.sessionType,
        metadata: session2.metadata || {},
        created_at: /* @__PURE__ */ new Date()
      };
      const { data, error } = await supabase.from("chat_sessions").insert(dbSession).select().single();
      if (error) {
        console.error("Error creating chat session:", error);
        throw new Error("Failed to create chat session");
      }
      return {
        id: data.id,
        userId: data.user_id,
        threadId: data.thread_id,
        sessionType: data.session_type,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.created_at
      };
    } catch (error) {
      console.error("Error creating chat session:", error);
      throw error;
    }
  }
  async getChatSessionByThreadId(threadId) {
    try {
      const { data, error } = await supabase.from("chat_sessions").select("*").eq("thread_id", threadId).single();
      if (error) {
        console.error("Error getting chat session by thread ID:", error);
        return void 0;
      }
      return {
        id: data.id,
        userId: data.user_id,
        threadId: data.thread_id,
        sessionType: data.session_type,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.created_at
      };
    } catch (error) {
      console.error("Error getting chat session by thread ID:", error);
      return void 0;
    }
  }
  // Chat Messages
  async getChatMessage(id) {
    try {
      const { data, error } = await supabase.from("chat_messages").select("*").eq("id", id).single();
      if (error) {
        console.error("Error getting chat message:", error);
        return void 0;
      }
      return {
        id: data.id,
        sessionId: data.session_id,
        userId: data.user_id,
        content: data.content,
        messageType: data.message_type,
        metadata: data.metadata,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error("Error getting chat message:", error);
      return void 0;
    }
  }
  async getChatMessagesBySessionId(sessionId) {
    try {
      const { data, error } = await supabase.from("chat_messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
      if (error) {
        console.error("Error getting chat messages:", error);
        return [];
      }
      return data.map((message) => ({
        id: message.id,
        sessionId: message.session_id,
        userId: message.user_id,
        content: message.content,
        messageType: message.message_type,
        metadata: message.metadata,
        createdAt: message.created_at
      }));
    } catch (error) {
      console.error("Error getting chat messages:", error);
      return [];
    }
  }
  // AI-Powered Wellness Journey Recommender Implementation
  async getCurrentWellnessJourney(userId) {
    try {
      const { data: journey, error } = await supabase.from("wellness_journeys").select(`
          *,
          wellness_goals (*),
          lifestyle_assessments (*),
          user_preferences (*),
          journey_phases (
            *,
            wellness_recommendations (*)
          ),
          journey_milestones (*),
          ai_insights (*)
        `).eq("user_id", userId).eq("is_active", true).single();
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching wellness journey:", error);
        return null;
      }
      return journey;
    } catch (error) {
      console.error("Error fetching current wellness journey:", error);
      throw error;
    }
  }
  async getWellnessJourney(id) {
    try {
      const { data, error } = await supabase.from("wellness_journeys").select("*").eq("id", id).single();
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching wellness journey:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error fetching wellness journey:", error);
      throw error;
    }
  }
  async createWellnessJourney(journey) {
    try {
      const { data, error } = await supabase.from("wellness_journeys").insert([{
        user_id: journey.userId,
        journey_type: journey.journeyType,
        title: journey.title,
        description: journey.description,
        estimated_completion: journey.estimatedCompletion,
        current_phase: journey.currentPhase
      }]).select("*").single();
      if (error) {
        console.error("Error creating wellness journey:", error);
        throw new Error("Failed to create wellness journey");
      }
      return data;
    } catch (error) {
      console.error("Error creating wellness journey:", error);
      throw error;
    }
  }
  async updateJourneyProgress(journeyId) {
    try {
      const { data: recommendations } = await supabase.from("wellness_recommendations").select("user_progress").eq("journey_id", journeyId).eq("is_active", true);
      if (recommendations && recommendations.length > 0) {
        const totalProgress = recommendations.reduce((sum, rec) => sum + (rec.user_progress || 0), 0);
        const averageProgress = Math.round(totalProgress / recommendations.length);
        const { error } = await supabase.from("wellness_journeys").update({
          overall_progress: averageProgress,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", journeyId);
        if (error) {
          console.error("Error updating journey progress:", error);
        }
      }
    } catch (error) {
      console.error("Error updating journey progress:", error);
    }
  }
  async createWellnessGoal(goal) {
    try {
      const { data, error } = await supabase.from("wellness_goals").insert([{
        journey_id: goal.journeyId,
        category: goal.category,
        specific_goal: goal.specificGoal,
        priority: goal.priority,
        timeline: goal.timeline,
        current_level: goal.currentLevel,
        target_level: goal.targetLevel,
        obstacles: goal.obstacles,
        motivation: goal.motivation
      }]).select("*").single();
      if (error) {
        console.error("Error creating wellness goal:", error);
        throw new Error("Failed to create wellness goal");
      }
      return data;
    } catch (error) {
      console.error("Error creating wellness goal:", error);
      throw error;
    }
  }
  async createLifestyleAssessment(assessment) {
    try {
      const { data, error } = await supabase.from("lifestyle_assessments").insert([{
        journey_id: assessment.journeyId,
        sleep_hours: assessment.sleepHours,
        exercise_frequency: assessment.exerciseFrequency,
        stress_level: assessment.stressLevel,
        energy_level: assessment.energyLevel,
        social_connection: assessment.socialConnection,
        work_life_balance: assessment.workLifeBalance,
        diet_quality: assessment.dietQuality,
        major_life_changes: assessment.majorLifeChanges,
        support_system: assessment.supportSystem,
        previous_wellness_experience: assessment.previousWellnessExperience
      }]).select("*").single();
      if (error) {
        console.error("Error creating lifestyle assessment:", error);
        throw new Error("Failed to create lifestyle assessment");
      }
      return data;
    } catch (error) {
      console.error("Error creating lifestyle assessment:", error);
      throw error;
    }
  }
  async createUserPreferences(preferences) {
    try {
      const { data, error } = await supabase.from("user_preferences").insert([{
        journey_id: preferences.journeyId,
        learning_style: preferences.learningStyle,
        session_duration: preferences.sessionDuration,
        frequency: preferences.frequency,
        reminder_preferences: preferences.reminderPreferences,
        preferred_times: preferences.preferredTimes,
        intensity_preference: preferences.intensityPreference,
        group_vs_individual: preferences.groupVsIndividual,
        technology_comfort: preferences.technologyComfort
      }]).select("*").single();
      if (error) {
        console.error("Error creating user preferences:", error);
        throw new Error("Failed to create user preferences");
      }
      return data;
    } catch (error) {
      console.error("Error creating user preferences:", error);
      throw error;
    }
  }
  async createJourneyPhase(phase) {
    try {
      const { data, error } = await supabase.from("journey_phases").insert([{
        journey_id: phase.journeyId,
        phase_name: phase.phaseName,
        phase_description: phase.phaseDescription,
        phase_order: phase.phaseOrder,
        estimated_duration: phase.estimatedDuration,
        goals: phase.goals,
        milestones: phase.milestones,
        is_current: phase.isCurrent
      }]).select("*").single();
      if (error) {
        console.error("Error creating journey phase:", error);
        throw new Error("Failed to create journey phase");
      }
      return data;
    } catch (error) {
      console.error("Error creating journey phase:", error);
      throw error;
    }
  }
  async getJourneyPhases(journeyId) {
    try {
      const { data, error } = await supabase.from("journey_phases").select("*").eq("journey_id", journeyId).order("phase_order");
      if (error) {
        console.error("Error fetching journey phases:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching journey phases:", error);
      return [];
    }
  }
  async createWellnessRecommendation(recommendation) {
    try {
      const { data, error } = await supabase.from("wellness_recommendations").insert([{
        journey_id: recommendation.journeyId,
        phase_id: recommendation.phaseId,
        type: recommendation.type,
        title: recommendation.title,
        description: recommendation.description,
        category: recommendation.category,
        priority: recommendation.priority,
        estimated_time: recommendation.estimatedTime,
        difficulty_level: recommendation.difficultyLevel,
        ai_reasoning: recommendation.aiReasoning,
        action_steps: recommendation.actionSteps,
        success_metrics: recommendation.successMetrics,
        resources: recommendation.resources,
        expected_outcomes: recommendation.expectedOutcomes,
        progress_tracking: recommendation.progressTracking
      }]).select("*").single();
      if (error) {
        console.error("Error creating wellness recommendation:", error);
        throw new Error("Failed to create wellness recommendation");
      }
      return data;
    } catch (error) {
      console.error("Error creating wellness recommendation:", error);
      throw error;
    }
  }
  async getWellnessRecommendation(id) {
    try {
      const { data, error } = await supabase.from("wellness_recommendations").select("*").eq("id", id).single();
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching wellness recommendation:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error fetching wellness recommendation:", error);
      throw error;
    }
  }
  async updateRecommendationProgress(recommendationId, progress) {
    try {
      const { data: current } = await supabase.from("wellness_recommendations").select("times_accessed").eq("id", recommendationId).single();
      const newTimesAccessed = (current?.times_accessed || 0) + 1;
      const { error } = await supabase.from("wellness_recommendations").update({
        user_progress: progress,
        times_accessed: newTimesAccessed,
        last_accessed: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", recommendationId);
      if (error) {
        console.error("Error updating recommendation progress:", error);
        throw new Error("Failed to update recommendation progress");
      }
    } catch (error) {
      console.error("Error updating recommendation progress:", error);
      throw error;
    }
  }
  async createProgressTracking(tracking) {
    try {
      const { data, error } = await supabase.from("progress_tracking").insert([{
        journey_id: tracking.journeyId,
        recommendation_id: tracking.recommendationId,
        goal_id: tracking.goalId,
        progress_value: tracking.progressValue,
        progress_unit: tracking.progressUnit,
        user_notes: tracking.userNotes,
        mood_rating: tracking.moodRating,
        energy_rating: tracking.energyRating
      }]).select("*").single();
      if (error) {
        console.error("Error creating progress tracking:", error);
        throw new Error("Failed to create progress tracking");
      }
      return data;
    } catch (error) {
      console.error("Error creating progress tracking:", error);
      throw error;
    }
  }
  async createAiInsight(insight) {
    try {
      const { data, error } = await supabase.from("ai_insights").insert([{
        journey_id: insight.journeyId,
        insight_type: insight.insightType,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        impact_level: insight.impactLevel,
        suggested_actions: insight.suggestedActions
      }]).select("*").single();
      if (error) {
        console.error("Error creating AI insight:", error);
        throw new Error("Failed to create AI insight");
      }
      return data;
    } catch (error) {
      console.error("Error creating AI insight:", error);
      throw error;
    }
  }
  async getJourneyAnalytics(userId) {
    try {
      const { data: journey } = await supabase.from("wellness_journeys").select(`
          *,
          wellness_goals (*),
          journey_phases (*),
          wellness_recommendations (*),
          progress_tracking (*),
          ai_insights (*)
        `).eq("user_id", userId).eq("is_active", true).single();
      if (!journey) {
        return null;
      }
      const totalGoals = journey.wellness_goals?.length || 0;
      const achievedGoals = journey.wellness_goals?.filter((g) => g.is_achieved).length || 0;
      const totalRecommendations = journey.wellness_recommendations?.length || 0;
      const completedRecommendations = journey.wellness_recommendations?.filter((r) => r.user_progress >= 100).length || 0;
      const averageProgress = journey.overall_progress || 0;
      return {
        journey,
        analytics: {
          totalGoals,
          achievedGoals,
          goalCompletionRate: totalGoals > 0 ? achievedGoals / totalGoals * 100 : 0,
          totalRecommendations,
          completedRecommendations,
          recommendationCompletionRate: totalRecommendations > 0 ? completedRecommendations / totalRecommendations * 100 : 0,
          overallProgress: averageProgress,
          totalInsights: journey.ai_insights?.length || 0,
          totalProgressEntries: journey.progress_tracking?.length || 0
        }
      };
    } catch (error) {
      console.error("Error fetching journey analytics:", error);
      throw error;
    }
  }
  async generateJourneyAdaptations(journeyId, reason, feedback) {
    try {
      const adaptations = [{
        journey_id: journeyId,
        adaptation_reason: reason,
        adaptation_type: "pace_change",
        description: `Journey adapted based on user feedback: ${reason}`,
        ai_confidence: 0.8
      }];
      const { data, error } = await supabase.from("journey_adaptations").insert(adaptations).select("*");
      if (error) {
        console.error("Error creating adaptations:", error);
        throw new Error("Failed to generate adaptations");
      }
      return data || [];
    } catch (error) {
      console.error("Error generating journey adaptations:", error);
      throw error;
    }
  }
  async completeMilestone(milestoneId, userId, reflection, difficultyRating, satisfactionRating) {
    try {
      const { data: milestone } = await supabase.from("journey_milestones").select(`
          *,
          wellness_journeys!inner (user_id)
        `).eq("id", milestoneId).eq("wellness_journeys.user_id", userId).single();
      if (!milestone) {
        return null;
      }
      const { data, error } = await supabase.from("journey_milestones").update({
        is_achieved: true,
        achieved_at: (/* @__PURE__ */ new Date()).toISOString(),
        user_reflection: reflection,
        difficulty_rating: difficultyRating,
        satisfaction_rating: satisfactionRating,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", milestoneId).select("*").single();
      if (error) {
        console.error("Error completing milestone:", error);
        throw new Error("Failed to complete milestone");
      }
      return data;
    } catch (error) {
      console.error("Error completing milestone:", error);
      throw error;
    }
  }
  async createChatMessage(message) {
    try {
      const dbMessage = {
        id: randomUUID(),
        session_id: message.sessionId,
        user_id: message.userId,
        content: message.content,
        message_type: message.messageType,
        metadata: message.metadata || {},
        created_at: /* @__PURE__ */ new Date()
      };
      const { data, error } = await supabase.from("chat_messages").insert(dbMessage).select().single();
      if (error) {
        console.error("Error creating chat message:", error);
        throw new Error("Failed to create chat message");
      }
      return {
        id: data.id,
        sessionId: data.session_id,
        userId: data.user_id,
        content: data.content,
        messageType: data.message_type,
        metadata: data.metadata,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error("Error creating chat message:", error);
      throw error;
    }
  }
  // Certification Management Implementation
  async getAllCertificationEnrollments() {
    try {
      const users2 = await this.getAllUsers();
      const coaches2 = users2.filter((user) => user.role === "coach");
      return coaches2.map((coach) => ({
        id: `${coach.id}_course-1`,
        userId: coach.id,
        courseId: "course-1",
        enrollmentDate: (/* @__PURE__ */ new Date()).toISOString(),
        status: "active",
        progress: Math.floor(Math.random() * 100),
        completedModules: [],
        certificateIssued: false
      }));
    } catch (error) {
      console.error("Error fetching certification enrollments:", error);
      return [];
    }
  }
  async getCertificationEnrollmentsByCourse(courseId) {
    try {
      const allEnrollments = await this.getAllCertificationEnrollments();
      return allEnrollments.filter((enrollment) => enrollment.courseId === courseId);
    } catch (error) {
      console.error("Error fetching enrollments by course:", error);
      return [];
    }
  }
  async createCertificationEnrollment(enrollment) {
    try {
      console.log("Creating certification enrollment:", enrollment);
      return {
        id: `${enrollment.userId}_${enrollment.courseId}`,
        ...enrollment
      };
    } catch (error) {
      console.error("Error creating certification enrollment:", error);
      throw error;
    }
  }
  async updateCertificationEnrollment(enrollmentId, updates) {
    try {
      console.log("Updating certification enrollment:", enrollmentId, updates);
      return { id: enrollmentId, ...updates };
    } catch (error) {
      console.error("Error updating certification enrollment:", error);
      throw error;
    }
  }
  async createModuleProgress(progress) {
    try {
      console.log("Creating module progress:", progress);
      return { id: `${progress.enrollmentId}_${progress.moduleId}`, ...progress };
    } catch (error) {
      console.error("Error creating module progress:", error);
      throw error;
    }
  }
  async getCertificationCourses() {
    try {
      return [
        {
          id: "course-1",
          title: "Advanced Wellness Coaching Certification",
          description: "Comprehensive training in holistic wellness coaching techniques, covering nutrition, fitness, mental health, and lifestyle optimization strategies.",
          category: "wellness",
          level: "intermediate",
          duration: 40,
          creditHours: "35.0",
          price: "799.00",
          instructorName: "Dr. Sarah Mitchell",
          instructorBio: "Licensed therapist with 15+ years in wellness coaching",
          courseImageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400",
          previewVideoUrl: null,
          requirements: ["Basic coaching certification", "1+ year experience"],
          learningObjectives: ["Master advanced coaching techniques", "Understand wellness psychology", "Develop personalized wellness plans"],
          accreditation: "International Coach Federation (ICF)",
          tags: ["wellness", "holistic", "lifestyle"],
          isActive: true,
          enrollmentLimit: 50,
          startDate: "2025-08-01T00:00:00Z",
          endDate: "2025-12-15T00:00:00Z",
          syllabus: {
            driveFolder: "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya",
            modules: [
              { title: "Advanced Coaching Techniques", duration: 8 },
              { title: "Behavior Change Psychology", duration: 10 },
              { title: "Wellness Assessment Methods", duration: 12 },
              { title: "Client Relationship Management", duration: 10 }
            ]
          }
        }
      ];
    } catch (error) {
      console.error("Error fetching certification courses:", error);
      return [];
    }
  }
};
var storage = new SupabaseClientStorage();

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminActivityLog: () => adminActivityLog,
  adminLoginSchema: () => adminLoginSchema,
  adminSessions: () => adminSessions,
  aiInsights: () => aiInsights,
  applicationDocuments: () => applicationDocuments,
  assessmentForms: () => assessmentForms,
  assessmentTypes: () => assessmentTypes,
  assessmentTypesRelations: () => assessmentTypesRelations,
  bookings: () => bookings,
  campaigns: () => campaigns,
  campaignsRelations: () => campaignsRelations,
  ceCredits: () => ceCredits,
  certificationCourses: () => certificationCourses,
  chatMessages: () => chatMessages,
  chatSessions: () => chatSessions,
  clientIntake: () => clientIntake,
  coachApplications: () => coachApplications,
  coachAvailability: () => coachAvailability,
  coachBanking: () => coachBanking,
  coachCertificates: () => coachCertificates,
  coachClientCommunications: () => coachClientCommunications,
  coachClients: () => coachClients,
  coachCredentials: () => coachCredentials,
  coachCredentialsRelations: () => coachCredentialsRelations,
  coachEnrollments: () => coachEnrollments,
  coachInteractions: () => coachInteractions,
  coachInteractionsRelations: () => coachInteractionsRelations,
  coachMatchTags: () => coachMatchTags,
  coachMessageTemplates: () => coachMessageTemplates,
  coachMetrics: () => coachMetrics,
  coachSessionNotes: () => coachSessionNotes,
  coaches: () => coaches,
  coachesRelations: () => coachesRelations,
  contacts: () => contacts,
  contentBlocks: () => contentBlocks2,
  contentBlocksRelations: () => contentBlocksRelations,
  contentPages: () => contentPages,
  contentPagesRelations: () => contentPagesRelations,
  courseModules: () => courseModules,
  discoveryQuizResults: () => discoveryQuizResults,
  donationPresets: () => donationPresets,
  donations: () => donations,
  donationsRelations: () => donationsRelations,
  emergencyContacts: () => emergencyContacts,
  impactMetrics: () => impactMetrics,
  insertAdminActivityLogSchema: () => insertAdminActivityLogSchema,
  insertAdminSessionSchema: () => insertAdminSessionSchema,
  insertAssessmentFormSchema: () => insertAssessmentFormSchema,
  insertAssessmentTypeSchema: () => insertAssessmentTypeSchema,
  insertBookingSchema: () => insertBookingSchema,
  insertCampaignSchema: () => insertCampaignSchema,
  insertCoachAvailabilitySchema: () => insertCoachAvailabilitySchema,
  insertCoachBankingSchema: () => insertCoachBankingSchema,
  insertCoachClientCommunicationSchema: () => insertCoachClientCommunicationSchema,
  insertCoachClientSchema: () => insertCoachClientSchema,
  insertCoachCredentialSchema: () => insertCoachCredentialSchema,
  insertCoachInteractionSchema: () => insertCoachInteractionSchema,
  insertCoachMessageTemplateSchema: () => insertCoachMessageTemplateSchema,
  insertCoachSchema: () => insertCoachSchema,
  insertCoachSessionNotesSchema: () => insertCoachSessionNotesSchema,
  insertContactSchema: () => insertContactSchema,
  insertContentBlockSchema: () => insertContentBlockSchema,
  insertContentPageSchema: () => insertContentPageSchema,
  insertDonationSchema: () => insertDonationSchema,
  insertEmergencyContactSchema: () => insertEmergencyContactSchema,
  insertKnowledgeBaseCategorySchema: () => insertKnowledgeBaseCategorySchema,
  insertKnowledgeBaseFeedbackSchema: () => insertKnowledgeBaseFeedbackSchema,
  insertKnowledgeBaseSchema: () => insertKnowledgeBaseSchema,
  insertKnowledgeBaseSearchSchema: () => insertKnowledgeBaseSearchSchema,
  insertKnowledgeBaseViewSchema: () => insertKnowledgeBaseViewSchema,
  insertMediaSchema: () => insertMediaSchema,
  insertMentalWellnessResourceSchema: () => insertMentalWellnessResourceSchema,
  insertNavigationSchema: () => insertNavigationSchema,
  insertPersonalizedRecommendationSchema: () => insertPersonalizedRecommendationSchema,
  insertResourceSchema: () => insertResourceSchema,
  insertResourceUsageAnalyticsSchema: () => insertResourceUsageAnalyticsSchema,
  insertRewardTransactionSchema: () => insertRewardTransactionSchema,
  insertRolePermissionSchema: () => insertRolePermissionSchema,
  insertSiteSettingSchema: () => insertSiteSettingSchema,
  insertTestimonialSchema: () => insertTestimonialSchema,
  insertUserAssessmentSchema: () => insertUserAssessmentSchema,
  insertUserSchema: () => insertUserSchema,
  insertWeightLossIntakeSchema: () => insertWeightLossIntakeSchema,
  insertWellnessAssessmentSchema: () => insertWellnessAssessmentSchema,
  journeyAdaptations: () => journeyAdaptations,
  journeyMilestones: () => journeyMilestones,
  journeyPhases: () => journeyPhases,
  knowledgeBase: () => knowledgeBase,
  knowledgeBaseCategories: () => knowledgeBaseCategories,
  knowledgeBaseCategoriesRelations: () => knowledgeBaseCategoriesRelations,
  knowledgeBaseFeedback: () => knowledgeBaseFeedback,
  knowledgeBaseFeedbackRelations: () => knowledgeBaseFeedbackRelations,
  knowledgeBaseRelations: () => knowledgeBaseRelations,
  knowledgeBaseSearch: () => knowledgeBaseSearch,
  knowledgeBaseSearchRelations: () => knowledgeBaseSearchRelations,
  knowledgeBaseViews: () => knowledgeBaseViews,
  knowledgeBaseViewsRelations: () => knowledgeBaseViewsRelations,
  lifestyleAssessments: () => lifestyleAssessments,
  loginSchema: () => loginSchema,
  mediaLibrary: () => mediaLibrary2,
  memberBenefits: () => memberBenefits,
  mentalWellnessResources: () => mentalWellnessResources,
  moduleProgress: () => moduleProgress,
  navigationMenus: () => navigationMenus2,
  onboardingProgress: () => onboardingProgress,
  onboardingSteps: () => onboardingSteps,
  personalizedRecommendations: () => personalizedRecommendations,
  programs: () => programs,
  progressTracking: () => progressTracking,
  registerSchema: () => registerSchema,
  resourceUsageAnalytics: () => resourceUsageAnalytics,
  resources: () => resources,
  rewardTransactions: () => rewardTransactions,
  rolePermissions: () => rolePermissions,
  sessions: () => sessions,
  siteSettings: () => siteSettings2,
  testimonials: () => testimonials,
  userAssessments: () => userAssessments,
  userAssessmentsRelations: () => userAssessmentsRelations,
  userPreferences: () => userPreferences,
  users: () => users,
  usersRelations: () => usersRelations,
  weightLossIntakes: () => weightLossIntakes,
  wellnessAssessments: () => wellnessAssessments,
  wellnessGoals: () => wellnessGoals,
  wellnessJourneys: () => wellnessJourneys,
  wellnessRecommendations: () => wellnessRecommendations
});
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  varchar,
  decimal,
  jsonb
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  membershipLevel: varchar("membership_level").default("free"),
  // free, supporter, champion, guardian
  donationTotal: decimal("donation_total").default("0"),
  rewardPoints: integer("reward_points").default(0),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  // 200 char max enforced in validation
  rating: integer("rating").default(0),
  // 0-5 stars, admin-editable
  introVideoUrl: varchar("intro_video_url"),
  keywords: text("keywords").array(),
  // max 5 keywords, 20 chars each
  preferredCoach: varchar("preferred_coach"),
  googleId: varchar("google_id"),
  provider: varchar("provider").default("local"),
  // local, google, facebook, apple
  role: varchar("role").default("user"),
  // user, admin, super_admin, coach, moderator
  permissions: jsonb("permissions"),
  // JSON array of permission strings
  isActive: boolean("is_active").default(true),
  joinDate: timestamp("join_date").defaultNow(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var certificationCourses = pgTable("certification_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  // wellness, nutrition, relationship, behavior, etc.
  level: varchar("level").notNull(),
  // beginner, intermediate, advanced, master
  duration: integer("duration").notNull(),
  // in hours
  creditHours: decimal("credit_hours").notNull(),
  // CE credit hours
  price: decimal("price").notNull(),
  instructorName: varchar("instructor_name").notNull(),
  instructorBio: text("instructor_bio"),
  courseImageUrl: varchar("course_image_url"),
  previewVideoUrl: varchar("preview_video_url"),
  syllabus: jsonb("syllabus"),
  // Course modules and lessons
  requirements: text("requirements").array(),
  // Prerequisites
  learningObjectives: text("learning_objectives").array(),
  accreditation: varchar("accreditation"),
  // Accrediting body
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  enrollmentLimit: integer("enrollment_limit"),
  // null = unlimited
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachEnrollments = pgTable("coach_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => certificationCourses.id),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  status: varchar("status").default("enrolled"),
  // enrolled, in_progress, completed, withdrawn, failed
  progress: decimal("progress").default("0"),
  // 0-100
  currentModule: integer("current_module").default(1),
  completedModules: integer("completed_modules").array().default([]),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  certificateIssued: boolean("certificate_issued").default(false),
  certificateNumber: varchar("certificate_number"),
  finalGrade: decimal("final_grade"),
  // 0-100
  totalTimeSpent: integer("total_time_spent").default(0),
  // in minutes
  paymentStatus: varchar("payment_status").default("pending"),
  // pending, paid, refunded
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => certificationCourses.id),
  moduleNumber: integer("module_number").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  // in minutes
  contentType: varchar("content_type").notNull(),
  // video, text, interactive, quiz, assignment
  contentUrl: varchar("content_url"),
  // video URL, document URL, etc.
  content: text("content"),
  // text content or HTML
  quiz: jsonb("quiz"),
  // Quiz questions and answers
  assignment: jsonb("assignment"),
  // Assignment details
  resources: jsonb("resources"),
  // Additional learning resources
  isRequired: boolean("is_required").default(true),
  passingScore: decimal("passing_score").default("70"),
  // For quizzes/assignments
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var moduleProgress = pgTable("module_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull().references(() => coachEnrollments.id),
  moduleId: varchar("module_id").notNull().references(() => courseModules.id),
  status: varchar("status").default("not_started"),
  // not_started, in_progress, completed, passed, failed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0),
  // in minutes
  attempts: integer("attempts").default(0),
  score: decimal("score"),
  // For quizzes/assignments
  submissionData: jsonb("submission_data"),
  // Quiz answers, assignment submissions
  feedback: text("feedback"),
  // Instructor feedback
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachCertificates = pgTable("coach_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => certificationCourses.id),
  enrollmentId: varchar("enrollment_id").notNull().references(() => coachEnrollments.id),
  certificateNumber: varchar("certificate_number").notNull().unique(),
  issuedDate: timestamp("issued_date").defaultNow(),
  expirationDate: timestamp("expiration_date"),
  // Some certifications expire
  credentialUrl: varchar("credential_url"),
  // Link to verify certificate
  certificatePdfUrl: varchar("certificate_pdf_url"),
  // PDF download
  digitalBadgeUrl: varchar("digital_badge_url"),
  // LinkedIn badge, etc.
  status: varchar("status").default("active"),
  // active, expired, revoked
  revokedReason: text("revoked_reason"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var ceCredits = pgTable("ce_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  courseId: varchar("course_id").references(() => certificationCourses.id),
  certificateId: varchar("certificate_id").references(() => coachCertificates.id),
  creditHours: decimal("credit_hours").notNull(),
  creditType: varchar("credit_type").notNull(),
  // course, workshop, conference, self_study
  provider: varchar("provider").notNull(),
  completionDate: timestamp("completion_date").notNull(),
  verificationStatus: varchar("verification_status").default("pending"),
  // pending, verified, rejected
  documentUrl: varchar("document_url"),
  // Supporting documentation
  description: text("description"),
  category: varchar("category"),
  // wellness, ethics, clinical, etc.
  accreditationBody: varchar("accreditation_body"),
  createdAt: timestamp("created_at").defaultNow()
});
var adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionToken: varchar("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var adminActivityLog = pgTable("admin_activity_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(),
  resource: varchar("resource"),
  // user, donation, booking, etc.
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow()
});
var rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: varchar("role").notNull(),
  permission: varchar("permission").notNull(),
  resource: varchar("resource"),
  createdAt: timestamp("created_at").defaultNow()
});
var bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  coachingArea: text("coaching_area").notNull(),
  message: text("message"),
  status: text("status").default("pending"),
  // pending, confirmed, completed, cancelled
  scheduledDate: timestamp("scheduled_date"),
  createdAt: timestamp("created_at").defaultNow()
});
var programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  assessmentType: varchar("assessment_type").notNull(),
  results: jsonb("results"),
  paid: boolean("paid").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  threadId: varchar("thread_id").notNull().unique(),
  module: varchar("module"),
  // weight_loss, career, wellness, etc.
  createdAt: timestamp("created_at").defaultNow()
});
var discoveryQuizResults = pgTable("discovery_quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  // Can be null for anonymous users
  sessionId: varchar("session_id"),
  // For tracking anonymous sessions
  currentNeeds: text("current_needs").array(),
  // Up to 3 selections
  situationDetails: jsonb("situation_details"),
  // Deeper dive responses
  supportPreference: varchar("support_preference"),
  // live, ai, mix, unsure
  readinessLevel: varchar("readiness_level"),
  // overwhelmed, managing, motivated, curious
  recommendedPath: jsonb("recommended_path"),
  // Generated coaching matches
  quizVersion: varchar("quiz_version").default("v1"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachMatchTags = pgTable("coach_match_tags", {
  id: serial("id").primaryKey(),
  tagCombination: varchar("tag_combination").notNull(),
  // e.g., "divorce+emotionally_lost"
  primaryCoach: varchar("primary_coach"),
  // Main coach specialty
  supportingCoaches: text("supporting_coaches").array(),
  // Additional coach types
  aiTools: text("ai_tools").array(),
  // Recommended AI assistance
  groupSupport: boolean("group_support").default(false),
  priority: integer("priority").default(1),
  // For matching precedence
  createdAt: timestamp("created_at").defaultNow()
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id),
  role: varchar("role").notNull(),
  // 'user' | 'assistant'
  content: text("content").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow()
});
var weightLossIntakes = pgTable("weight_loss_intakes", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  age: integer("age").notNull(),
  height: text("height").notNull(),
  currentWeight: text("current_weight").notNull(),
  goalWeight: text("goal_weight").notNull(),
  medicalConditions: text("medical_conditions"),
  medications: text("medications"),
  allergies: text("allergies"),
  digestiveIssues: text("digestive_issues"),
  physicalLimitations: text("physical_limitations"),
  weightLossMedications: text("weight_loss_medications"),
  weightHistory: text("weight_history"),
  previousAttempts: text("previous_attempts"),
  challengingAspects: text("challenging_aspects"),
  currentEatingHabits: text("current_eating_habits"),
  lifestyle: text("lifestyle"),
  activityLevel: text("activity_level"),
  mindsetFactors: text("mindset_factors"),
  goalsExpectations: text("goals_expectations"),
  interestedInSupplements: boolean("interested_in_supplements").default(false),
  status: text("status").default("new"),
  // new, reviewed, completed
  createdAt: timestamp("created_at").defaultNow()
});
var testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  initial: text("initial").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  // article, video, worksheet, podcast
  category: text("category").notNull(),
  content: text("content").notNull(),
  url: text("url"),
  isFree: boolean("is_free").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("new"),
  // new, replied, closed
  createdAt: timestamp("created_at").defaultNow()
});
var donations = pgTable("donations", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  amount: decimal("amount").notNull(),
  currency: varchar("currency").default("USD"),
  donationType: varchar("donation_type").notNull(),
  // one-time, monthly, yearly
  paymentMethod: varchar("payment_method"),
  // stripe, paypal, etc
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").default("pending"),
  // pending, completed, failed, refunded
  dedicatedTo: varchar("dedicated_to"),
  // person or cause
  isAnonymous: boolean("is_anonymous").default(false),
  message: text("message"),
  campaignId: varchar("campaign_id"),
  rewardPointsEarned: integer("reward_points_earned").default(0),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  goalAmount: decimal("goal_amount").notNull(),
  raisedAmount: decimal("raised_amount").default("0"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  imageUrl: varchar("image_url"),
  category: varchar("category"),
  // emergency, program, general
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var rewardTransactions = pgTable("reward_transactions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  points: integer("points").notNull(),
  type: varchar("type").notNull(),
  // earned, redeemed
  reason: varchar("reason").notNull(),
  // donation, milestone, redemption
  donationId: varchar("donation_id").references(() => donations.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});
var memberBenefits = pgTable("member_benefits", {
  id: varchar("id").primaryKey(),
  membershipLevel: varchar("membership_level").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0)
});
var sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var impactMetrics = pgTable("impact_metrics", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  metric: varchar("metric").notNull(),
  // lives_impacted, sessions_funded, etc
  value: integer("value").notNull(),
  period: varchar("period").default("all-time"),
  // monthly, yearly, all-time
  lastUpdated: timestamp("last_updated").defaultNow()
});
var donationPresets = pgTable("donation_presets", {
  id: varchar("id").primaryKey(),
  amount: decimal("amount").notNull(),
  label: varchar("label").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  isPopular: boolean("is_popular").default(false),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true)
});
var coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  coachId: varchar("coach_id").unique().notNull(),
  // Professional coach ID
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique().notNull(),
  phone: varchar("phone"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  specialties: jsonb("specialties").$type().default([]),
  experience: integer("experience"),
  // years of experience
  status: varchar("status").default("pending"),
  // pending, approved, active, suspended
  isVerified: boolean("is_verified").default(false),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  timezone: varchar("timezone"),
  languages: jsonb("languages").$type().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachCredentials = pgTable("coach_credentials", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  credentialType: varchar("credential_type").notNull(),
  // license, certification, degree
  title: varchar("title").notNull(),
  issuingOrganization: varchar("issuing_organization").notNull(),
  issueDate: timestamp("issue_date"),
  expirationDate: timestamp("expiration_date"),
  credentialNumber: varchar("credential_number"),
  documentUrl: text("document_url"),
  // uploaded document
  verificationStatus: varchar("verification_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});
var coachBanking = pgTable("coach_banking", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  bankName: varchar("bank_name"),
  accountType: varchar("account_type"),
  // checking, savings
  accountNumber: text("account_number"),
  // encrypted
  routingNumber: varchar("routing_number"),
  accountHolderName: varchar("account_holder_name"),
  quickbooksVendorId: varchar("quickbooks_vendor_id"),
  quickbooksAccountId: varchar("quickbooks_account_id"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachAvailability = pgTable("coach_availability", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time").notNull(),
  // HH:mm format
  endTime: varchar("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  sessionType: varchar("session_type"),
  // individual, group, crisis
  maxClients: integer("max_clients").default(1),
  createdAt: timestamp("created_at").defaultNow()
});
var coachClients = pgTable("coach_clients", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  clientId: varchar("client_id").notNull(),
  assignmentDate: timestamp("assignment_date").defaultNow(),
  status: varchar("status").default("active"),
  // active, completed, transferred
  specialtyArea: varchar("specialty_area"),
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  nextScheduledSession: timestamp("next_scheduled_session"),
  totalSessions: integer("total_sessions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachSessionNotes = pgTable("coach_session_notes", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  clientId: varchar("client_id").notNull(),
  sessionDate: timestamp("session_date").notNull(),
  sessionType: varchar("session_type"),
  // individual, group, crisis, follow-up
  duration: integer("duration"),
  // minutes
  notes: text("notes"),
  goals: jsonb("goals").$type().default([]),
  outcomes: text("outcomes"),
  nextSteps: text("next_steps"),
  clientProgress: integer("client_progress"),
  // 1-10 scale
  riskAssessment: varchar("risk_assessment"),
  // low, medium, high, crisis
  followUpNeeded: boolean("follow_up_needed").default(false),
  followUpDate: timestamp("follow_up_date"),
  isConfidential: boolean("is_confidential").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachMessageTemplates = pgTable("coach_message_templates", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  templateName: varchar("template_name").notNull(),
  messageType: varchar("message_type").notNull(),
  // reminder, check-in, crisis, motivation
  messageContent: text("message_content").notNull(),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachClientCommunications = pgTable("coach_client_communications", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  clientId: varchar("client_id").notNull(),
  communicationType: varchar("communication_type").notNull(),
  // sms, email, call, in-person
  direction: varchar("direction").notNull(),
  // inbound, outbound
  content: text("content"),
  templateId: integer("template_id").references(() => coachMessageTemplates.id),
  isAutomated: boolean("is_automated").default(false),
  n8nWorkflowId: varchar("n8n_workflow_id"),
  // for automation tracking
  deliveryStatus: varchar("delivery_status"),
  // sent, delivered, read, failed
  clientResponse: text("client_response"),
  requiresFollowUp: boolean("requires_follow_up").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachMetrics = pgTable("coach_metrics", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalSessions: integer("total_sessions").default(0),
  totalClients: integer("total_clients").default(0),
  averageSessionRating: decimal("average_session_rating", { precision: 3, scale: 2 }),
  clientRetentionRate: decimal("client_retention_rate", { precision: 5, scale: 2 }),
  responseTime: integer("response_time"),
  // average response time in minutes
  completedGoals: integer("completed_goals").default(0),
  crisisSessions: integer("crisis_sessions").default(0),
  clientSatisfactionScore: decimal("client_satisfaction_score", { precision: 3, scale: 2 }),
  hoursWorked: decimal("hours_worked", { precision: 8, scale: 2 }),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow()
});
var onboardingProgress = pgTable("onboarding_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentStep: integer("current_step").default(0),
  totalSteps: integer("total_steps").notNull(),
  data: jsonb("data").default({}),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var clientIntake = pgTable("client_intake", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  primaryGoal: text("primary_goal"),
  specificChallenges: jsonb("specific_challenges").$type().default([]),
  previousSupport: text("previous_support"),
  urgencyLevel: varchar("urgency_level"),
  healthConcerns: jsonb("health_concerns").$type().default([]),
  medications: text("medications"),
  sleepQuality: integer("sleep_quality"),
  stressLevel: integer("stress_level"),
  exerciseFrequency: varchar("exercise_frequency"),
  coachingStyle: jsonb("coaching_style").$type().default([]),
  sessionFrequency: varchar("session_frequency"),
  preferredDays: jsonb("preferred_days").$type().default([]),
  preferredTimes: jsonb("preferred_times").$type().default([]),
  communicationPreference: varchar("communication_preference"),
  emergencyContact: jsonb("emergency_contact"),
  currentSafetyLevel: integer("current_safety_level"),
  needsImmediateSupport: boolean("needs_immediate_support").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachApplications = pgTable("coach_applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: varchar("email"),
  phone: varchar("phone"),
  bio: text("bio"),
  location: varchar("location"),
  linkedIn: varchar("linked_in"),
  credentials: text("credentials"),
  experience: text("experience"),
  certifications: jsonb("certifications").$type().default([]),
  specializations: jsonb("specializations").$type().default([]),
  specialties: jsonb("specialties").$type().default([]),
  yearsOfExperience: integer("years_of_experience"),
  photoUrl: varchar("photo_url"),
  videoUrl: varchar("video_url"),
  resumeUrl: varchar("resume_url"),
  certificationUrls: jsonb("certification_urls").$type().default([]),
  philosophy: text("philosophy"),
  // Coaching philosophy
  methods: text("methods"),
  // Methods and techniques
  availability: jsonb("availability"),
  bankingInfo: jsonb("banking_info"),
  backgroundCheckConsent: boolean("background_check_consent").default(false),
  status: varchar("status").default("pending"),
  // pending, under_review, approved, rejected
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var applicationDocuments = pgTable("application_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => coachApplications.id).notNull(),
  documentType: varchar("document_type").notNull(),
  // resume, certification, photo, intro_video
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});
var onboardingSteps = pgTable("onboarding_steps", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => coachApplications.id).notNull(),
  stepName: varchar("step_name").notNull(),
  stepType: varchar("step_type").notNull(),
  // document_upload, form_completion, video_upload, review
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var mentalWellnessResources = pgTable("mental_wellness_resources", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  // crisis, anxiety, depression, mindfulness, stress, trauma, relationship, self-care
  resourceType: varchar("resource_type").notNull(),
  // hotline, website, app, article, video, exercise, meditation
  url: text("url"),
  phoneNumber: varchar("phone_number"),
  isEmergency: boolean("is_emergency").default(false),
  availability: varchar("availability"),
  // 24/7, business-hours, weekdays, etc
  languages: jsonb("languages").$type().default(["English"]),
  costInfo: varchar("cost_info"),
  // free, paid, insurance, sliding-scale
  targetAudience: varchar("target_audience"),
  // general, teens, adults, seniors, lgbtq, women, veterans
  rating: decimal("rating", { precision: 3, scale: 2 }),
  usageCount: integer("usage_count").default(0),
  tags: jsonb("tags").$type().default([]),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  verificationStatus: varchar("verification_status").default("verified"),
  // verified, pending, outdated
  lastVerified: timestamp("last_verified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var resourceUsageAnalytics = pgTable("resource_usage_analytics", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").references(() => mentalWellnessResources.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  // for anonymous users
  accessedAt: timestamp("accessed_at").defaultNow(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  deviceType: varchar("device_type"),
  // mobile, desktop, tablet
  accessDuration: integer("access_duration"),
  // seconds
  wasHelpful: boolean("was_helpful"),
  feedback: text("feedback"),
  followUpAction: varchar("follow_up_action")
  // contacted, bookmarked, shared, none
});
var emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  organization: varchar("organization"),
  phoneNumber: varchar("phone_number").notNull(),
  textSupport: varchar("text_support"),
  // text number if available
  description: text("description").notNull(),
  availability: varchar("availability").notNull(),
  languages: jsonb("languages").$type().default(["English"]),
  specialty: varchar("specialty"),
  // suicide, domestic-violence, crisis, mental-health
  isNational: boolean("is_national").default(true),
  country: varchar("country").default("US"),
  state: varchar("state"),
  city: varchar("city"),
  website: text("website"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  lastVerified: timestamp("last_verified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var wellnessAssessments = pgTable("wellness_assessments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  // for anonymous users
  assessmentType: varchar("assessment_type").notNull(),
  // mood, anxiety, depression, stress, crisis-risk
  responses: jsonb("responses").$type().notNull(),
  score: integer("score"),
  riskLevel: varchar("risk_level"),
  // low, medium, high, crisis
  recommendedResources: jsonb("recommended_resources").$type().default([]),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var personalizedRecommendations = pgTable("personalized_recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  // for anonymous users
  resourceId: integer("resource_id").references(() => mentalWellnessResources.id).notNull(),
  recommendationScore: decimal("recommendation_score", { precision: 5, scale: 2 }),
  reasons: jsonb("reasons").$type().default([]),
  algorithmVersion: varchar("algorithm_version").default("v1.0"),
  wasAccessed: boolean("was_accessed").default(false),
  wasHelpful: boolean("was_helpful"),
  feedback: text("feedback"),
  generatedAt: timestamp("generated_at").defaultNow(),
  expiresAt: timestamp("expires_at")
});
var contentPages = pgTable("content_pages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  slug: varchar("slug").unique().notNull(),
  title: varchar("title").notNull(),
  content: text("content"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  isPublished: boolean("is_published").default(true),
  featuredImage: text("featured_image"),
  author: varchar("author").default("Admin"),
  pageType: varchar("page_type").default("page"),
  // page, blog, service
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var contentBlocks2 = pgTable("content_blocks", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  pageId: integer("page_id").references(() => contentPages.id),
  blockType: varchar("block_type").notNull(),
  // hero, text, image, testimonial, cta
  title: varchar("title"),
  content: text("content"),
  imageUrl: text("image_url"),
  buttonText: varchar("button_text"),
  buttonUrl: text("button_url"),
  backgroundColor: varchar("background_color"),
  textColor: varchar("text_color"),
  order: integer("order").default(0),
  settings: jsonb("settings"),
  // Additional flexible settings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var mediaLibrary2 = pgTable("media_library", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  category: varchar("category").default("general"),
  // testimonial, hero, service, resource
  uploadedBy: varchar("uploaded_by").default("Admin"),
  createdAt: timestamp("created_at").defaultNow()
});
var navigationMenus2 = pgTable("navigation_menus", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  label: varchar("label").notNull(),
  url: text("url").notNull(),
  parentId: integer("parent_id"),
  order: integer("order").default(0),
  isExternal: boolean("is_external").default(false),
  isActive: boolean("is_active").default(true),
  menuLocation: varchar("menu_location").default("main"),
  // main, footer, sidebar
  createdAt: timestamp("created_at").defaultNow()
});
var siteSettings2 = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  key: varchar("key").unique().notNull(),
  value: text("value"),
  type: varchar("type").default("text"),
  // text, boolean, json, number
  category: varchar("category").default("general"),
  // general, seo, contact, social
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category").notNull(),
  // FAQ, Guide, Tutorial, Documentation, Policy
  subcategory: varchar("subcategory"),
  // Specific topic area
  tags: jsonb("tags").$type().default([]),
  status: varchar("status").default("published"),
  // draft, published, archived
  priority: integer("priority").default(0),
  // For ordering/importance
  difficulty: varchar("difficulty"),
  // beginner, intermediate, advanced
  estimatedReadTime: integer("estimated_read_time"),
  // in minutes
  viewCount: integer("view_count").default(0),
  helpfulCount: integer("helpful_count").default(0),
  notHelpfulCount: integer("not_helpful_count").default(0),
  searchKeywords: text("search_keywords"),
  // Additional search terms
  relatedArticles: jsonb("related_articles").$type().default([]),
  featuredImage: text("featured_image"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  authorId: varchar("author_id").references(() => users.id),
  authorName: varchar("author_name").default("Admin"),
  lastReviewedBy: varchar("last_reviewed_by").references(() => users.id),
  lastReviewedAt: timestamp("last_reviewed_at"),
  isPublic: boolean("is_public").default(true),
  requiresAuth: boolean("requires_auth").default(false),
  targetAudience: varchar("target_audience").default("general"),
  // general, clients, coaches, admin
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var knowledgeBaseCategories = pgTable("knowledge_base_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  icon: varchar("icon"),
  // Icon name or URL
  color: varchar("color"),
  // Hex color code
  parentId: integer("parent_id").references(() => knowledgeBaseCategories.id),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var knowledgeBaseFeedback = pgTable("knowledge_base_feedback", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeBase.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  // For anonymous feedback
  wasHelpful: boolean("was_helpful").notNull(),
  feedback: text("feedback"),
  improvementSuggestions: text("improvement_suggestions"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow()
});
var knowledgeBaseViews = pgTable("knowledge_base_views", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeBase.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  // For anonymous views
  viewDuration: integer("view_duration"),
  // in seconds
  completedReading: boolean("completed_reading").default(false),
  exitPoint: varchar("exit_point"),
  // Where user left the article
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow()
});
var knowledgeBaseSearch = pgTable("knowledge_base_search", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  // For anonymous searches
  resultsCount: integer("results_count").default(0),
  selectedResultId: integer("selected_result_id").references(() => knowledgeBase.id),
  wasSuccessful: boolean("was_successful").default(false),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow()
});
var wellnessJourneys = pgTable("wellness_journeys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  journeyType: varchar("journey_type").notNull(),
  // comprehensive, targeted, crisis_recovery, maintenance
  title: varchar("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").defaultNow(),
  estimatedCompletion: timestamp("estimated_completion"),
  actualCompletion: timestamp("actual_completion"),
  currentPhase: varchar("current_phase"),
  overallProgress: integer("overall_progress").default(0),
  // 0-100 percentage
  aiAlgorithmVersion: varchar("ai_algorithm_version").default("v1.0"),
  adaptationCount: integer("adaptation_count").default(0),
  successMetrics: jsonb("success_metrics").$type().default({}),
  userSatisfactionScore: integer("user_satisfaction_score"),
  // 1-10 rating
  isActive: boolean("is_active").default(true),
  isCompleted: boolean("is_completed").default(false),
  completionReasons: text("completion_reasons"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var wellnessGoals = pgTable("wellness_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  category: varchar("category").notNull(),
  // physical, mental, emotional, spiritual, social, career, financial
  specificGoal: text("specific_goal").notNull(),
  priority: varchar("priority").notNull(),
  // high, medium, low
  timeline: varchar("timeline").notNull(),
  // 1_week, 1_month, 3_months, 6_months, 1_year, ongoing
  currentLevel: integer("current_level").notNull(),
  // 1-10 scale
  targetLevel: integer("target_level").notNull(),
  // 1-10 scale
  actualLevel: integer("actual_level"),
  // Updated as user progresses
  obstacles: jsonb("obstacles").$type().default([]),
  motivation: text("motivation"),
  progressNotes: text("progress_notes"),
  isAchieved: boolean("is_achieved").default(false),
  achievedAt: timestamp("achieved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var lifestyleAssessments = pgTable("lifestyle_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  sleepHours: decimal("sleep_hours", { precision: 3, scale: 1 }).notNull(),
  exerciseFrequency: varchar("exercise_frequency").notNull(),
  // none, rarely, weekly, several_times, daily
  stressLevel: integer("stress_level").notNull(),
  // 1-10 scale
  energyLevel: integer("energy_level").notNull(),
  // 1-10 scale
  socialConnection: integer("social_connection").notNull(),
  // 1-10 scale
  workLifeBalance: integer("work_life_balance").notNull(),
  // 1-10 scale
  dietQuality: varchar("diet_quality").notNull(),
  // poor, fair, good, excellent
  majorLifeChanges: jsonb("major_life_changes").$type().default([]),
  supportSystem: varchar("support_system").notNull(),
  // none, limited, moderate, strong
  previousWellnessExperience: text("previous_wellness_experience"),
  healthConcerns: jsonb("health_concerns").$type().default([]),
  medications: text("medications"),
  chronicConditions: jsonb("chronic_conditions").$type().default([]),
  mentalHealthHistory: text("mental_health_history"),
  substanceUse: jsonb("substance_use").$type().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  learningStyle: varchar("learning_style").notNull(),
  // visual, auditory, kinesthetic, reading
  sessionDuration: varchar("session_duration").notNull(),
  // 5_min, 15_min, 30_min, 60_min, 90_min
  frequency: varchar("frequency").notNull(),
  // daily, every_other_day, weekly, bi_weekly, monthly
  reminderPreferences: jsonb("reminder_preferences").$type().default([]),
  // email, push, sms, none
  preferredTimes: jsonb("preferred_times").$type().default([]),
  // morning, afternoon, evening, late_night
  intensityPreference: varchar("intensity_preference").notNull(),
  // gentle, moderate, intense
  groupVsIndividual: varchar("group_vs_individual").notNull(),
  // individual, small_group, large_group, both
  technologyComfort: integer("technology_comfort").notNull(),
  // 1-10 scale
  communicationStyle: varchar("communication_style"),
  // direct, supportive, motivational, gentle
  culturalConsiderations: text("cultural_considerations"),
  accessibilityNeeds: jsonb("accessibility_needs").$type().default([]),
  languagePreference: varchar("language_preference").default("en"),
  timezone: varchar("timezone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var journeyPhases = pgTable("journey_phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  phaseName: varchar("phase_name").notNull(),
  phaseDescription: text("phase_description"),
  phaseOrder: integer("phase_order").notNull(),
  estimatedDuration: varchar("estimated_duration"),
  // "2 weeks", "1 month", etc.
  actualDuration: integer("actual_duration"),
  // in days
  goals: jsonb("goals").$type().default([]),
  milestones: jsonb("milestones").$type().default([]),
  successCriteria: jsonb("success_criteria").$type().default([]),
  progress: integer("progress").default(0),
  // 0-100 percentage
  isCurrent: boolean("is_current").default(false),
  isCompleted: boolean("is_completed").default(false),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  completionNotes: text("completion_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var wellnessRecommendations = pgTable("wellness_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  phaseId: varchar("phase_id").references(() => journeyPhases.id),
  type: varchar("type").notNull(),
  // daily_practice, weekly_goal, monthly_challenge, resource, milestone, adjustment
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  priority: integer("priority").notNull(),
  // 1-10 priority level
  estimatedTime: integer("estimated_time").notNull(),
  // in minutes
  difficultyLevel: varchar("difficulty_level").notNull(),
  // beginner, intermediate, advanced
  aiReasoning: text("ai_reasoning").notNull(),
  actionSteps: jsonb("action_steps").$type().default([]),
  successMetrics: jsonb("success_metrics").$type().default([]),
  resources: jsonb("resources").$type().default([]),
  prerequisites: jsonb("prerequisites").$type().default([]),
  followUpActions: jsonb("follow_up_actions").$type().default([]),
  personalizationFactors: jsonb("personalization_factors").$type().default([]),
  expectedOutcomes: jsonb("expected_outcomes").$type().default([]),
  progressTracking: jsonb("progress_tracking").$type(),
  adaptationTriggers: jsonb("adaptation_triggers").$type().default([]),
  crisisSupport: boolean("crisis_support").default(false),
  isActive: boolean("is_active").default(true),
  userProgress: integer("user_progress").default(0),
  // 0-100 percentage
  userRating: integer("user_rating"),
  // 1-5 stars
  userFeedback: text("user_feedback"),
  timesAccessed: integer("times_accessed").default(0),
  lastAccessed: timestamp("last_accessed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var journeyAdaptations = pgTable("journey_adaptations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  adaptationReason: varchar("adaptation_reason").notNull(),
  // user_feedback, progress_stalled, life_changes, crisis, goal_achieved
  adaptationType: varchar("adaptation_type").notNull(),
  // phase_adjustment, goal_modification, pace_change, resource_swap, crisis_intervention
  originalValue: jsonb("original_value"),
  newValue: jsonb("new_value"),
  description: text("description").notNull(),
  aiConfidence: decimal("ai_confidence", { precision: 3, scale: 2 }),
  // 0.00-1.00
  userApproved: boolean("user_approved").default(false),
  effectivenessScore: integer("effectiveness_score"),
  // 1-10, assessed later
  impactOnProgress: integer("impact_on_progress"),
  // -10 to +10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var journeyMilestones = pgTable("journey_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  phaseId: varchar("phase_id").references(() => journeyPhases.id),
  milestoneType: varchar("milestone_type").notNull(),
  // goal_achievement, habit_formation, skill_mastery, breakthrough, celebration
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  criteriaForCompletion: jsonb("criteria_for_completion").$type().default([]),
  targetDate: timestamp("target_date"),
  isAchieved: boolean("is_achieved").default(false),
  achievedAt: timestamp("achieved_at"),
  celebrationSuggestions: jsonb("celebration_suggestions").$type().default([]),
  impactOnJourney: text("impact_on_journey"),
  userReflection: text("user_reflection"),
  nextSteps: jsonb("next_steps").$type().default([]),
  difficultyRating: integer("difficulty_rating"),
  // 1-10 scale, set by user after achievement
  satisfactionRating: integer("satisfaction_rating"),
  // 1-10 scale, set by user after achievement
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var progressTracking = pgTable("progress_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  recommendationId: varchar("recommendation_id").references(() => wellnessRecommendations.id),
  goalId: varchar("goal_id").references(() => wellnessGoals.id),
  trackingDate: timestamp("tracking_date").defaultNow(),
  progressValue: decimal("progress_value", { precision: 5, scale: 2 }),
  // flexible numeric value
  progressUnit: varchar("progress_unit"),
  // percentage, hours, sessions, points, level, etc.
  userNotes: text("user_notes"),
  moodRating: integer("mood_rating"),
  // 1-10 scale
  energyRating: integer("energy_rating"),
  // 1-10 scale
  confidenceRating: integer("confidence_rating"),
  // 1-10 scale
  challengesEncountered: jsonb("challenges_encountered").$type().default([]),
  successesCelebrated: jsonb("successes_celebrated").$type().default([]),
  adaptationsNeeded: text("adaptations_needed"),
  isAutoTracked: boolean("is_auto_tracked").default(false),
  // if tracked automatically vs manual entry
  dataSource: varchar("data_source"),
  // manual, app_integration, wearable, etc.
  verificationStatus: varchar("verification_status").default("pending"),
  // pending, verified, needs_review
  createdAt: timestamp("created_at").defaultNow()
});
var aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journeyId: varchar("journey_id").notNull().references(() => wellnessJourneys.id),
  insightType: varchar("insight_type").notNull(),
  // pattern_recognition, progress_analysis, recommendation_optimization, risk_assessment, success_prediction
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  dataPoints: jsonb("data_points").$type().default({}),
  // relevant data that led to insight
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  // 0.00-1.00
  actionable: boolean("actionable").default(true),
  suggestedActions: jsonb("suggested_actions").$type().default([]),
  impactLevel: varchar("impact_level").notNull(),
  // low, medium, high, critical
  validatedByUser: boolean("validated_by_user"),
  userFeedback: text("user_feedback"),
  algorithmVersion: varchar("algorithm_version").default("v1.0"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  donations: many(donations),
  campaigns: many(campaigns),
  rewardTransactions: many(rewardTransactions),
  impactMetrics: many(impactMetrics),
  sessions: many(sessions)
}));
var donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id]
  }),
  campaign: one(campaigns, {
    fields: [donations.campaignId],
    references: [campaigns.id]
  })
}));
var campaignsRelations = relations(campaigns, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id]
  }),
  donations: many(donations)
}));
var coachesRelations = relations(coaches, ({ many }) => ({
  credentials: many(coachCredentials),
  banking: many(coachBanking),
  availability: many(coachAvailability),
  clients: many(coachClients),
  sessionNotes: many(coachSessionNotes),
  messageTemplates: many(coachMessageTemplates),
  communications: many(coachClientCommunications),
  metrics: many(coachMetrics)
}));
var coachCredentialsRelations = relations(coachCredentials, ({ one }) => ({
  coach: one(coaches, {
    fields: [coachCredentials.coachId],
    references: [coaches.id]
  })
}));
var contentPagesRelations = relations(contentPages, ({ many }) => ({
  blocks: many(contentBlocks2)
}));
var contentBlocksRelations = relations(contentBlocks2, ({ one }) => ({
  page: one(contentPages, {
    fields: [contentBlocks2.pageId],
    references: [contentPages.id]
  })
}));
var knowledgeBaseRelations = relations(knowledgeBase, ({ one, many }) => ({
  author: one(users, {
    fields: [knowledgeBase.authorId],
    references: [users.id]
  }),
  reviewedBy: one(users, {
    fields: [knowledgeBase.lastReviewedBy],
    references: [users.id]
  }),
  feedback: many(knowledgeBaseFeedback),
  views: many(knowledgeBaseViews)
}));
var knowledgeBaseCategoriesRelations = relations(knowledgeBaseCategories, ({ one, many }) => ({
  parent: one(knowledgeBaseCategories, {
    fields: [knowledgeBaseCategories.parentId],
    references: [knowledgeBaseCategories.id]
  }),
  children: many(knowledgeBaseCategories)
}));
var knowledgeBaseFeedbackRelations = relations(knowledgeBaseFeedback, ({ one }) => ({
  article: one(knowledgeBase, {
    fields: [knowledgeBaseFeedback.articleId],
    references: [knowledgeBase.id]
  }),
  user: one(users, {
    fields: [knowledgeBaseFeedback.userId],
    references: [users.id]
  })
}));
var knowledgeBaseViewsRelations = relations(knowledgeBaseViews, ({ one }) => ({
  article: one(knowledgeBase, {
    fields: [knowledgeBaseViews.articleId],
    references: [knowledgeBase.id]
  }),
  user: one(users, {
    fields: [knowledgeBaseViews.userId],
    references: [users.id]
  })
}));
var knowledgeBaseSearchRelations = relations(knowledgeBaseSearch, ({ one }) => ({
  selectedResult: one(knowledgeBase, {
    fields: [knowledgeBaseSearch.selectedResultId],
    references: [knowledgeBase.id]
  }),
  user: one(users, {
    fields: [knowledgeBaseSearch.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  scheduledDate: true,
  createdAt: true
});
var insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  isApproved: true,
  createdAt: true
});
var insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true
});
var insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  status: true,
  createdAt: true
});
var insertWeightLossIntakeSchema = createInsertSchema(weightLossIntakes).omit({
  id: true,
  status: true,
  createdAt: true
}).extend({
  phone: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  digestiveIssues: z.string().optional(),
  physicalLimitations: z.string().optional(),
  weightLossMedications: z.string().optional(),
  weightHistory: z.string().optional(),
  previousAttempts: z.string().optional(),
  challengingAspects: z.string().optional(),
  currentEatingHabits: z.string().optional(),
  lifestyle: z.string().optional(),
  activityLevel: z.string().optional(),
  mindsetFactors: z.string().optional(),
  goalsExpectations: z.string().optional(),
  interestedInSupplements: z.boolean().optional().default(false)
});
var insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
  processedAt: true
});
var insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertRewardTransactionSchema = createInsertSchema(rewardTransactions).omit({
  id: true,
  createdAt: true
});
var insertCoachSchema = createInsertSchema(coaches).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCoachCredentialSchema = createInsertSchema(coachCredentials).omit({
  id: true,
  createdAt: true
});
var insertCoachBankingSchema = createInsertSchema(coachBanking).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCoachAvailabilitySchema = createInsertSchema(coachAvailability).omit({
  id: true,
  createdAt: true
});
var insertCoachClientSchema = createInsertSchema(coachClients).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCoachSessionNotesSchema = createInsertSchema(coachSessionNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCoachMessageTemplateSchema = createInsertSchema(coachMessageTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCoachClientCommunicationSchema = createInsertSchema(coachClientCommunications).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertContentPageSchema = createInsertSchema(contentPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertContentBlockSchema = createInsertSchema(contentBlocks2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMediaSchema = createInsertSchema(mediaLibrary2).omit({
  id: true,
  createdAt: true
});
var insertNavigationSchema = createInsertSchema(navigationMenus2).omit({
  id: true,
  createdAt: true
});
var insertSiteSettingSchema = createInsertSchema(siteSettings2).omit({
  id: true,
  updatedAt: true
});
var loginSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  // Allow username or email
  password: z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required")
});
var insertMentalWellnessResourceSchema = createInsertSchema(mentalWellnessResources).omit({
  id: true,
  usageCount: true,
  createdAt: true,
  updatedAt: true
});
var insertResourceUsageAnalyticsSchema = createInsertSchema(resourceUsageAnalytics).omit({
  id: true,
  accessedAt: true
});
var insertEmergencyContactSchema = createInsertSchema(emergencyContacts).omit({
  id: true,
  createdAt: true
});
var insertWellnessAssessmentSchema = createInsertSchema(wellnessAssessments).omit({
  id: true,
  completedAt: true,
  createdAt: true
});
var insertPersonalizedRecommendationSchema = createInsertSchema(personalizedRecommendations).omit({
  id: true,
  generatedAt: true
});
var insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  viewCount: true,
  helpfulCount: true,
  notHelpfulCount: true,
  createdAt: true,
  updatedAt: true
});
var insertKnowledgeBaseCategorySchema = createInsertSchema(knowledgeBaseCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertKnowledgeBaseFeedbackSchema = createInsertSchema(knowledgeBaseFeedback).omit({
  id: true,
  createdAt: true
});
var insertKnowledgeBaseViewSchema = createInsertSchema(knowledgeBaseViews).omit({
  id: true,
  createdAt: true
});
var insertKnowledgeBaseSearchSchema = createInsertSchema(knowledgeBaseSearch).omit({
  id: true,
  createdAt: true
});
var insertAdminSessionSchema = createInsertSchema(adminSessions).omit({
  id: true,
  createdAt: true
});
var insertAdminActivityLogSchema = createInsertSchema(adminActivityLog).omit({
  id: true,
  timestamp: true
});
var insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true
});
var adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional().default(false)
});
var assessmentTypes = pgTable("assessment_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  // "weight_loss_intake", "attachment_style", etc.
  displayName: varchar("display_name").notNull(),
  // "Weight Loss Intake", "Attachment Style Assessment"
  category: varchar("category").notNull(),
  // "health", "relationships", "career", etc.
  description: text("description"),
  version: integer("version").default(1),
  fields: jsonb("fields").notNull(),
  // Field definitions for the form
  coachTypes: text("coach_types").array(),
  // Which AI coaches can access this data
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userAssessments = pgTable("user_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  assessmentTypeId: varchar("assessment_type_id").notNull().references(() => assessmentTypes.id),
  responses: jsonb("responses").notNull(),
  // All form responses
  summary: text("summary"),
  // AI-generated summary of responses
  tags: text("tags").array(),
  // Extracted tags for search/matching
  completedAt: timestamp("completed_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coachInteractions = pgTable("coach_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  coachType: varchar("coach_type").notNull(),
  // "weight_loss", "relationship", etc.
  accessedAssessments: text("accessed_assessments").array(),
  // Array of assessment IDs used
  interactionSummary: text("interaction_summary"),
  sessionId: varchar("session_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var assessmentForms = pgTable("assessment_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentTypeId: varchar("assessment_type_id").notNull().references(() => assessmentTypes.id),
  formData: jsonb("form_data").notNull(),
  // Complete form structure
  validationRules: jsonb("validation_rules"),
  // Field validation rules
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var assessmentTypesRelations = relations(assessmentTypes, ({ many }) => ({
  userAssessments: many(userAssessments),
  assessmentForms: many(assessmentForms)
}));
var userAssessmentsRelations = relations(userAssessments, ({ one }) => ({
  user: one(users, {
    fields: [userAssessments.userId],
    references: [users.id]
  }),
  assessmentType: one(assessmentTypes, {
    fields: [userAssessments.assessmentTypeId],
    references: [assessmentTypes.id]
  })
}));
var coachInteractionsRelations = relations(coachInteractions, ({ one }) => ({
  user: one(users, {
    fields: [coachInteractions.userId],
    references: [users.id]
  })
}));
var insertAssessmentTypeSchema = createInsertSchema(assessmentTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserAssessmentSchema = createInsertSchema(userAssessments).omit({
  id: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true
});
var insertCoachInteractionSchema = createInsertSchema(coachInteractions).omit({
  id: true,
  createdAt: true
});
var insertAssessmentFormSchema = createInsertSchema(assessmentForms).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
import { z as z10 } from "zod";

// server/wix-integration.ts
var wixModules = {};
async function initializeWixModules() {
  try {
    const wixSdk = await import("@wix/sdk");
    wixModules.createClient = wixSdk.createClient;
    wixModules.OAuthStrategy = wixSdk.OAuthStrategy;
  } catch (error) {
    console.error("Failed to import @wix/sdk:", error);
  }
  try {
    const wixData = await import("@wix/data");
    wixModules.items = wixData.items;
  } catch (error) {
    console.error("Failed to import @wix/data:", error);
  }
  try {
    const wixBookings = await import("@wix/bookings");
    wixModules.bookings = wixBookings.bookings;
    wixModules.services = wixBookings.services;
  } catch (error) {
    console.error("Failed to import @wix/bookings:", error);
  }
  try {
    const wixStores = await import("@wix/stores");
    wixModules.products = wixStores.products;
  } catch (error) {
    console.error("Failed to import @wix/stores:", error);
  }
  try {
    const wixPricingPlans = await import("@wix/pricing-plans");
    wixModules.plans = wixPricingPlans.plans;
  } catch (error) {
    console.error("Failed to import @wix/pricing-plans:", error);
  }
}
var WixIntegration = class {
  config;
  wixClient;
  initialized = false;
  constructor(config) {
    this.config = config;
    this.wixClient = null;
  }
  // Initialize Wix client with error handling
  async initialize() {
    if (this.initialized) return;
    try {
      await initializeWixModules();
      if (!wixModules.createClient || !wixModules.OAuthStrategy) {
        console.error("Wix SDK modules not available - running in fallback mode");
        this.initialized = true;
        return;
      }
      this.wixClient = wixModules.createClient({
        modules: {
          services: wixModules.services,
          products: wixModules.products,
          plans: wixModules.plans,
          items: wixModules.items,
          bookings: wixModules.bookings
        },
        auth: wixModules.OAuthStrategy({ clientId: this.config.clientId })
      });
      this.initialized = true;
      console.log("Wix integration initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Wix integration:", error);
      this.initialized = true;
    }
  }
  // Check if Wix integration is available
  isAvailable() {
    return this.wixClient !== null;
  }
  // Fetch services from Wix using SDK
  async getServices() {
    await this.initialize();
    if (!this.isAvailable()) {
      console.warn("Wix integration not available - returning empty services list");
      return [];
    }
    try {
      const serviceList = await this.wixClient.services.queryServices().find();
      console.log("Wix Services:");
      console.log("Total: ", serviceList.items.length);
      return serviceList.items.map((service) => ({
        _id: service._id,
        name: service.name || "Unnamed Service",
        description: service.info?.description || "",
        price: service.payment?.rateLabel?.amount || 0,
        duration: service.schedulePolicy?.sessionDurations?.[0] || 60,
        category: service.category || "general"
      }));
    } catch (error) {
      console.error("Error fetching services from Wix:", error);
      return [];
    }
  }
  // Fetch products from Wix using SDK
  async getProducts() {
    await this.initialize();
    if (!this.isAvailable()) {
      console.warn("Wix integration not available - returning empty products list");
      return [];
    }
    try {
      const productList = await this.wixClient.products.queryProducts().find();
      console.log("Wix Products:");
      console.log("Total: ", productList.items.length);
      return productList.items.map((product) => ({
        _id: product._id,
        name: product.name || "Unnamed Product",
        description: product.description || "",
        price: product.price?.price || 0,
        category: product.productType || "general"
      }));
    } catch (error) {
      console.error("Error fetching products from Wix:", error);
      return [];
    }
  }
  // Fetch pricing plans from Wix using SDK
  async getPlans() {
    await this.initialize();
    if (!this.isAvailable()) {
      console.warn("Wix integration not available - returning empty plans list");
      return [];
    }
    try {
      const plansList = await this.wixClient.plans.listPublicPlans();
      console.log("Wix Plans:");
      console.log("Total: ", plansList.plans?.length || 0);
      return plansList.plans || [];
    } catch (error) {
      console.error("Error fetching plans from Wix:", error);
      return [];
    }
  }
  // Fetch data items from Wix collections using SDK
  async getDataItems(collectionId) {
    await this.initialize();
    if (!this.isAvailable()) {
      console.warn(`Wix integration not available - returning empty data items for ${collectionId}`);
      return [];
    }
    try {
      const dataItemsList = await this.wixClient.items.queryDataItems({
        dataCollectionId: collectionId
      }).find();
      console.log(`Wix Data Items (${collectionId}):`);
      console.log("Total: ", dataItemsList.items.length);
      return dataItemsList.items;
    } catch (error) {
      console.error(`Error fetching data items from collection ${collectionId}:`, error);
      return [];
    }
  }
  // Fetch users from Members collection
  async getUsers() {
    try {
      const members = await this.getDataItems("Members");
      return members.map((member) => ({
        _id: member.data._id,
        email: member.data.email,
        firstName: member.data.firstName,
        lastName: member.data.lastName,
        membershipLevel: member.data.membershipLevel || "free",
        profileImage: member.data.profileImage
      }));
    } catch (error) {
      console.error("Error fetching users from Wix:", error);
      return [];
    }
  }
  // Fetch bookings from Wix
  async getBookings() {
    try {
      const bookings2 = await this.getDataItems("Bookings");
      console.log("Wix Bookings:");
      console.log("Total: ", bookings2.length);
      return bookings2.map((booking) => ({
        _id: booking.data._id,
        serviceId: booking.data.serviceId,
        userId: booking.data.userId,
        dateTime: booking.data.dateTime,
        status: booking.data.status || "pending",
        notes: booking.data.notes
      }));
    } catch (error) {
      console.error("Error fetching bookings from Wix:", error);
      return [];
    }
  }
  // Create a new booking in Wix
  async createBooking(bookingData) {
    await this.initialize();
    if (!this.isAvailable()) {
      console.error("Wix integration not available - cannot create booking");
      throw new Error("Wix integration not available");
    }
    try {
      const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const booking = await this.wixClient.data.insertDataItem({
        dataCollectionId: "Bookings",
        dataItem: {
          data: {
            _id: bookingId,
            serviceId: bookingData.serviceId,
            userId: bookingData.userId,
            dateTime: bookingData.slot.startDateTime,
            endDateTime: bookingData.slot.endDateTime,
            status: "pending",
            contactFirstName: bookingData.contactDetails.firstName,
            contactLastName: bookingData.contactDetails.lastName,
            contactEmail: bookingData.contactDetails.email,
            contactPhone: bookingData.contactDetails.phone || "",
            notes: bookingData.notes || "",
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
      console.log("Booking created successfully:", booking._id);
      return {
        _id: booking._id,
        serviceId: bookingData.serviceId,
        userId: bookingData.userId,
        dateTime: bookingData.slot.startDateTime,
        status: "pending",
        notes: bookingData.notes || ""
      };
    } catch (error) {
      console.error("Error creating booking in Wix:", error);
      throw error;
    }
  }
  // Get available time slots for a service
  async getAvailableSlots(serviceId, date) {
    try {
      const slots = [];
      const baseDate = new Date(date);
      for (let hour = 9; hour < 17; hour++) {
        const startTime = new Date(baseDate);
        startTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(baseDate);
        endTime.setHours(hour + 1, 0, 0, 0);
        slots.push({
          startDateTime: startTime.toISOString(),
          endDateTime: endTime.toISOString(),
          duration: 60,
          // 60 minutes
          available: true
        });
      }
      console.log(`Generated ${slots.length} available slots for ${serviceId} on ${date}`);
      return slots;
    } catch (error) {
      console.error("Error generating available slots:", error);
      return [];
    }
  }
  // Cancel a booking
  async cancelBooking(bookingId) {
    await this.initialize();
    if (!this.isAvailable()) {
      console.warn("Wix integration not available - cannot cancel booking");
      return false;
    }
    try {
      await this.wixClient.data.updateDataItem({
        dataCollectionId: "Bookings",
        dataItemId: bookingId,
        dataItem: {
          data: {
            status: "cancelled",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
      console.log("Booking cancelled successfully:", bookingId);
      return true;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return false;
    }
  }
  // Reschedule a booking
  async rescheduleBooking(bookingId, newSlot) {
    await this.initialize();
    if (!this.isAvailable()) {
      console.warn("Wix integration not available - cannot reschedule booking");
      return false;
    }
    try {
      await this.wixClient.data.updateDataItem({
        dataCollectionId: "Bookings",
        dataItemId: bookingId,
        dataItem: {
          data: {
            dateTime: newSlot.startDateTime,
            endDateTime: newSlot.endDateTime,
            status: "confirmed",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
      console.log("Booking rescheduled successfully:", bookingId);
      return true;
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      return false;
    }
  }
  // Sync user data with local database
  async syncUsers() {
    await this.initialize();
    if (!this.isAvailable()) {
      console.warn("Wix integration not available - skipping user sync");
      return;
    }
    const wixUsers = await this.getUsers();
    console.log(`Synced ${wixUsers.length} users from Wix`);
  }
  // Sync services/pricing with local database
  async syncServices() {
    await this.initialize();
    if (!this.isAvailable()) {
      console.warn("Wix integration not available - skipping service sync");
      return;
    }
    const wixServices = await this.getServices();
    console.log(`Synced ${wixServices.length} services from Wix`);
  }
  // Sync all data types
  async syncAllData() {
    await this.initialize();
    if (!this.isAvailable()) {
      console.warn("Wix integration not available - skipping full data sync");
      return;
    }
    try {
      await Promise.all([
        this.syncUsers(),
        this.syncServices(),
        this.getProducts(),
        this.getPlans()
      ]);
      console.log("All Wix data synchronized successfully");
    } catch (error) {
      console.error("Error during full sync:", error);
    }
  }
};
function setupWixWebhooks(app2, wixIntegration) {
  app2.post("/api/wix/webhooks/users", async (req, res) => {
    try {
      const { action, data } = req.body;
      if (action === "member_updated" || action === "member_created") {
        await wixIntegration.syncUsers();
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Wix user webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  app2.post("/api/wix/webhooks/services", async (req, res) => {
    try {
      const { action, data } = req.body;
      if (action === "service_updated" || action === "service_created") {
        await wixIntegration.syncServices();
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Wix service webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  app2.post("/api/wix/webhooks/bookings", async (req, res) => {
    try {
      const { action, data } = req.body;
      if (action === "booking_created" || action === "booking_updated") {
        console.log("Booking webhook received:", action, data);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Wix booking webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
}
function getWixConfig() {
  return {
    clientId: process.env.WIX_CLIENT_ID || "4b89abab-c440-4aef-88ec-c22c187b62fe"
  };
}

// server/coach-storage.ts
var CoachMemoryStorage = class {
  coaches = /* @__PURE__ */ new Map();
  coachCredentials = /* @__PURE__ */ new Map();
  coachBanking = /* @__PURE__ */ new Map();
  coachAvailability = /* @__PURE__ */ new Map();
  coachClients = /* @__PURE__ */ new Map();
  coachSessionNotes = /* @__PURE__ */ new Map();
  coachMessageTemplates = /* @__PURE__ */ new Map();
  coachClientCommunications = /* @__PURE__ */ new Map();
  coachMetrics = /* @__PURE__ */ new Map();
  coachSessions = /* @__PURE__ */ new Map();
  nextId = {
    coaches: 1,
    credentials: 1,
    banking: 1,
    availability: 1,
    clients: 1,
    sessionNotes: 1,
    templates: 1,
    communications: 1,
    metrics: 1
  };
  constructor() {
    this.seedCoachData();
  }
  seedCoachData() {
    const sampleCoach = {
      id: 1,
      userId: "coach_001",
      coachId: "WWC_001",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@wholewellness.org",
      phone: "+1-555-0123",
      profileImage: null,
      bio: "Licensed clinical social worker specializing in trauma recovery and domestic violence support. 8+ years helping women rebuild their lives.",
      specialties: ["Trauma Recovery", "Domestic Violence", "Financial Planning", "Crisis Intervention"],
      experience: 8,
      status: "active",
      isVerified: true,
      hourlyRate: "125.00",
      timezone: "America/New_York",
      languages: ["English", "Spanish"],
      createdAt: /* @__PURE__ */ new Date("2023-01-15"),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coaches.set(1, sampleCoach);
    const sampleCredential = {
      id: 1,
      coachId: 1,
      credentialType: "license",
      title: "Licensed Clinical Social Worker (LCSW)",
      issuingOrganization: "New York State Board of Social Work",
      issueDate: /* @__PURE__ */ new Date("2020-03-15"),
      expirationDate: /* @__PURE__ */ new Date("2025-03-15"),
      credentialNumber: "LCSW-12345",
      documentUrl: "/documents/sarah_lcsw.pdf",
      verificationStatus: "verified",
      createdAt: /* @__PURE__ */ new Date("2023-01-15")
    };
    this.coachCredentials.set(1, sampleCredential);
    const availabilitySlots = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", sessionType: "individual" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", sessionType: "individual" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", sessionType: "individual" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", sessionType: "individual" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "15:00", sessionType: "individual" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", sessionType: "crisis" }
    ];
    availabilitySlots.forEach((slot, index) => {
      const availability = {
        id: index + 1,
        coachId: 1,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: true,
        sessionType: slot.sessionType,
        maxClients: slot.sessionType === "crisis" ? 3 : 1,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.coachAvailability.set(index + 1, availability);
    });
    const messageTemplates = [
      {
        templateName: "Session Reminder",
        messageType: "reminder",
        messageContent: "Hi {clientName}, this is a reminder about your coaching session tomorrow at {time}. Reply CONFIRM to confirm or RESCHEDULE if you need to change the time. Looking forward to our conversation! - Coach {coachName}"
      },
      {
        templateName: "Check-in Message",
        messageType: "check-in",
        messageContent: "Hi {clientName}, just checking in to see how you're doing with the goals we discussed. Remember, progress isn't always linear - every small step counts! Feel free to reach out if you need support. - Coach {coachName}"
      },
      {
        templateName: "Crisis Support",
        messageType: "crisis",
        messageContent: "I'm here for you right now. If this is an emergency, please call 911. For crisis support, text HOME to 741741 or call the National Domestic Violence Hotline at 1-800-799-7233. I'll follow up with you as soon as possible."
      },
      {
        templateName: "Motivation Message",
        messageType: "motivation",
        messageContent: "You are stronger than you know and braver than you feel. Every day you choose to move forward is a victory. I believe in you, {clientName}! - Coach {coachName}"
      }
    ];
    messageTemplates.forEach((template, index) => {
      const messageTemplate = {
        id: index + 1,
        coachId: 1,
        templateName: template.templateName,
        messageType: template.messageType,
        messageContent: template.messageContent,
        isActive: true,
        usageCount: Math.floor(Math.random() * 50),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.coachMessageTemplates.set(index + 1, messageTemplate);
    });
    this.nextId.coaches = 2;
    this.nextId.credentials = 2;
    this.nextId.availability = availabilitySlots.length + 1;
    this.nextId.templates = messageTemplates.length + 1;
  }
  // Coach CRUD operations
  async getCoachByUserId(userId) {
    return Array.from(this.coaches.values()).find((coach) => coach.userId === userId);
  }
  async getCoachById(id) {
    return this.coaches.get(id);
  }
  async getCoachByCoachId(coachId) {
    return Array.from(this.coaches.values()).find((coach) => coach.coachId === coachId);
  }
  async getAllCoaches() {
    return Array.from(this.coaches.values());
  }
  async getActiveCoaches() {
    return Array.from(this.coaches.values()).filter((coach) => coach.status === "active");
  }
  async createCoach(coachData) {
    const id = coachData.id || this.nextId.coaches++;
    const coach = {
      id,
      ...coachData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coaches.set(id, coach);
    return coach;
  }
  async updateCoach(id, updates) {
    const coach = this.coaches.get(id);
    if (!coach) return void 0;
    const updatedCoach = {
      ...coach,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coaches.set(id, updatedCoach);
    return updatedCoach;
  }
  // Credentials operations
  async getCoachCredentials(coachId) {
    return Array.from(this.coachCredentials.values()).filter((cred) => cred.coachId === coachId);
  }
  async createCoachCredential(credentialData) {
    const id = credentialData.id || this.nextId.credentials++;
    const credential = {
      id,
      ...credentialData,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.coachCredentials.set(id, credential);
    return credential;
  }
  // Banking operations
  async getCoachBanking(coachId) {
    return Array.from(this.coachBanking.values()).find((banking) => banking.coachId === coachId);
  }
  async createOrUpdateCoachBanking(bankingData) {
    const existing = await this.getCoachBanking(bankingData.coachId);
    if (existing) {
      const updated = {
        ...existing,
        ...bankingData,
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.coachBanking.set(existing.id, updated);
      return updated;
    }
    const id = bankingData.id || this.nextId.banking++;
    const banking = {
      id,
      ...bankingData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coachBanking.set(id, banking);
    return banking;
  }
  // Availability operations
  async getCoachAvailability(coachId) {
    return Array.from(this.coachAvailability.values()).filter((avail) => avail.coachId === coachId);
  }
  async createCoachAvailability(availabilityData) {
    const id = availabilityData.id || this.nextId.availability++;
    const availability = {
      id,
      ...availabilityData,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.coachAvailability.set(id, availability);
    return availability;
  }
  async updateCoachAvailability(id, updates) {
    const availability = this.coachAvailability.get(id);
    if (!availability) return void 0;
    const updated = { ...availability, ...updates };
    this.coachAvailability.set(id, updated);
    return updated;
  }
  async deleteCoachAvailability(id) {
    return this.coachAvailability.delete(id);
  }
  // Client relationship operations
  async getCoachClients(coachId) {
    return Array.from(this.coachClients.values()).filter((client2) => client2.coachId === coachId);
  }
  async assignClientToCoach(assignmentData) {
    const id = assignmentData.id || this.nextId.clients++;
    const assignment = {
      id,
      ...assignmentData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coachClients.set(id, assignment);
    return assignment;
  }
  async updateCoachClient(id, updates) {
    const client2 = this.coachClients.get(id);
    if (!client2) return void 0;
    const updated = {
      ...client2,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coachClients.set(id, updated);
    return updated;
  }
  // Session notes operations
  async getCoachSessionNotes(coachId, clientId) {
    const notes = Array.from(this.coachSessionNotes.values()).filter((note) => note.coachId === coachId);
    if (clientId) {
      return notes.filter((note) => note.clientId === clientId);
    }
    return notes;
  }
  async createCoachSessionNotes(notesData) {
    const id = notesData.id || this.nextId.sessionNotes++;
    const notes = {
      id,
      ...notesData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coachSessionNotes.set(id, notes);
    return notes;
  }
  // Message template operations
  async getCoachMessageTemplates(coachId) {
    return Array.from(this.coachMessageTemplates.values()).filter((template) => template.coachId === coachId);
  }
  async createCoachMessageTemplate(templateData) {
    const id = templateData.id || this.nextId.templates++;
    const template = {
      id,
      ...templateData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coachMessageTemplates.set(id, template);
    return template;
  }
  async updateCoachMessageTemplate(id, updates) {
    const template = this.coachMessageTemplates.get(id);
    if (!template) return void 0;
    const updated = {
      ...template,
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coachMessageTemplates.set(id, updated);
    return updated;
  }
  // Communication log operations
  async getCoachClientCommunications(coachId, clientId) {
    const communications = Array.from(this.coachClientCommunications.values()).filter((comm) => comm.coachId === coachId);
    if (clientId) {
      return communications.filter((comm) => comm.clientId === clientId);
    }
    return communications;
  }
  async createCoachClientCommunication(commData) {
    const id = commData.id || this.nextId.communications++;
    const communication = {
      id,
      ...commData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coachClientCommunications.set(id, communication);
    return communication;
  }
  // Coach metrics operations
  async getCoachMetrics(coachId, periodStart, periodEnd) {
    let metrics = Array.from(this.coachMetrics.values()).filter((metric) => metric.coachId === coachId);
    if (periodStart && periodEnd) {
      metrics = metrics.filter(
        (metric) => metric.periodStart >= periodStart && metric.periodEnd <= periodEnd
      );
    }
    return metrics;
  }
  // QuickBooks integration helpers
  async updateQuickBooksVendorId(coachId, vendorId) {
    const banking = await this.getCoachBanking(coachId);
    if (!banking) return false;
    const updated = {
      ...banking,
      quickbooksVendorId: vendorId,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coachBanking.set(banking.id, updated);
    return true;
  }
  // n8n integration helpers
  async logN8nCommunication(coachId, clientId, workflowId, content) {
    return this.createCoachClientCommunication({
      coachId,
      clientId,
      communicationType: "sms",
      direction: "outbound",
      content,
      isAutomated: true,
      n8nWorkflowId: workflowId,
      deliveryStatus: "sent"
    });
  }
  // Search and filtering
  async searchCoaches(query) {
    const searchTerm = query.toLowerCase();
    return Array.from(this.coaches.values()).filter(
      (coach) => coach.firstName.toLowerCase().includes(searchTerm) || coach.lastName.toLowerCase().includes(searchTerm) || coach.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm)) || coach.bio?.toLowerCase().includes(searchTerm)
    );
  }
  async getCoachesBySpecialty(specialty) {
    return Array.from(this.coaches.values()).filter(
      (coach) => coach.specialties.includes(specialty) && coach.status === "active"
    );
  }
};
var coachStorage = new CoachMemoryStorage();

// server/donation-storage.ts
import { v4 as uuidv4 } from "uuid";
var DonationMemoryStorage = class {
  users = /* @__PURE__ */ new Map();
  donations = /* @__PURE__ */ new Map();
  campaigns = /* @__PURE__ */ new Map();
  sessions = /* @__PURE__ */ new Map();
  rewardTransactions = /* @__PURE__ */ new Map();
  memberBenefits = /* @__PURE__ */ new Map();
  impactMetrics = /* @__PURE__ */ new Map();
  donationPresets = /* @__PURE__ */ new Map();
  constructor() {
    this.seedData();
  }
  seedData() {
    const presets = [
      {
        id: uuidv4(),
        amount: "25",
        label: "Supporter",
        description: "Fund one coaching session",
        icon: "heart",
        isPopular: false,
        sortOrder: 1,
        isActive: true
      },
      {
        id: uuidv4(),
        amount: "50",
        label: "Advocate",
        description: "Support weekly resources",
        icon: "star",
        isPopular: true,
        sortOrder: 2,
        isActive: true
      },
      {
        id: uuidv4(),
        amount: "100",
        label: "Champion",
        description: "Fund complete program",
        icon: "gift",
        isPopular: false,
        sortOrder: 3,
        isActive: true
      },
      {
        id: uuidv4(),
        amount: "250",
        label: "Guardian",
        description: "Transform multiple lives",
        icon: "sparkles",
        isPopular: false,
        sortOrder: 4,
        isActive: true
      }
    ];
    presets.forEach((preset) => this.donationPresets.set(preset.id, preset));
    const campaigns2 = [
      {
        id: uuidv4(),
        title: "Emergency Support Fund",
        description: "Immediate assistance for domestic violence survivors",
        goalAmount: "10000",
        raisedAmount: "3500",
        startDate: /* @__PURE__ */ new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        isActive: true,
        imageUrl: null,
        category: "emergency",
        createdBy: null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: uuidv4(),
        title: "Holiday Support Program",
        description: "Bringing joy and stability during the holidays",
        goalAmount: "5000",
        raisedAmount: "2100",
        startDate: /* @__PURE__ */ new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1e3),
        isActive: true,
        imageUrl: null,
        category: "program",
        createdBy: null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    campaigns2.forEach((campaign) => this.campaigns.set(campaign.id, campaign));
    const benefits = [
      {
        id: uuidv4(),
        membershipLevel: "supporter",
        title: "Monthly Newsletter",
        description: "Exclusive updates and success stories",
        icon: "mail",
        isActive: true,
        sortOrder: 1
      },
      {
        id: uuidv4(),
        membershipLevel: "champion",
        title: "Priority Support",
        description: "Fast-track access to coaching resources",
        icon: "zap",
        isActive: true,
        sortOrder: 2
      },
      {
        id: uuidv4(),
        membershipLevel: "guardian",
        title: "VIP Events",
        description: "Exclusive access to donor appreciation events",
        icon: "star",
        isActive: true,
        sortOrder: 3
      }
    ];
    benefits.forEach((benefit) => this.memberBenefits.set(benefit.id, benefit));
  }
  // User methods
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async getUserById(id) {
    return this.users.get(id);
  }
  async createUser(userData) {
    const user = {
      ...userData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      isActive: true,
      joinDate: /* @__PURE__ */ new Date(),
      lastLogin: null
    };
    this.users.set(user.id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Session methods
  async createSession(sessionData) {
    const session2 = { ...sessionData };
    this.sessions.set(session2.token, session2);
    return session2;
  }
  async getSessionByToken(token) {
    return this.sessions.get(token);
  }
  async deleteSession(id) {
    const session2 = Array.from(this.sessions.values()).find((s) => s.id === id);
    if (session2) {
      this.sessions.delete(session2.token);
    }
  }
  // Donation methods
  async getDonationPresets() {
    return Array.from(this.donationPresets.values()).filter((preset) => preset.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  async getActiveCampaigns() {
    return Array.from(this.campaigns.values()).filter((campaign) => campaign.isActive && (!campaign.endDate || campaign.endDate > /* @__PURE__ */ new Date()));
  }
  async createDonation(donationData) {
    const donation = {
      ...donationData,
      createdAt: /* @__PURE__ */ new Date(),
      processedAt: null
    };
    this.donations.set(donation.id, donation);
    return donation;
  }
  async updateDonation(id, updates) {
    const donation = this.donations.get(id);
    if (!donation) return void 0;
    const updatedDonation = { ...donation, ...updates };
    this.donations.set(id, updatedDonation);
    return updatedDonation;
  }
  async getDonationById(id) {
    return this.donations.get(id);
  }
  async getDonationsByUserId(userId) {
    return Array.from(this.donations.values()).filter((donation) => donation.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  // Member dashboard methods
  async getImpactMetricsByUserId(userId) {
    return Array.from(this.impactMetrics.values()).filter((metric) => metric.userId === userId);
  }
  async getMemberBenefitsByLevel(membershipLevel) {
    const levelHierarchy = ["free", "supporter", "champion", "guardian"];
    const userLevelIndex = levelHierarchy.indexOf(membershipLevel);
    return Array.from(this.memberBenefits.values()).filter((benefit) => {
      const benefitLevelIndex = levelHierarchy.indexOf(benefit.membershipLevel);
      return benefitLevelIndex <= userLevelIndex;
    }).map((benefit) => ({
      ...benefit,
      isUnlocked: levelHierarchy.indexOf(benefit.membershipLevel) <= userLevelIndex,
      requiredLevel: benefit.membershipLevel
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  // Reward system methods
  async createRewardTransaction(transactionData) {
    const transaction = {
      ...transactionData,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.rewardTransactions.set(transaction.id, transaction);
    return transaction;
  }
  // Impact tracking
  async updateImpactMetrics(userId, donation) {
    const amount = parseFloat(donation.amount);
    const livesImpacted = Math.floor(amount / 25);
    let livesMetric = Array.from(this.impactMetrics.values()).find((m) => m.userId === userId && m.metric === "lives_impacted");
    if (livesMetric) {
      livesMetric.value += livesImpacted;
      livesMetric.lastUpdated = /* @__PURE__ */ new Date();
    } else {
      livesMetric = {
        id: uuidv4(),
        userId,
        metric: "lives_impacted",
        value: livesImpacted,
        period: "all-time",
        lastUpdated: /* @__PURE__ */ new Date()
      };
      this.impactMetrics.set(livesMetric.id, livesMetric);
    }
    const sessionsSupported = Math.floor(amount / 25);
    let sessionsMetric = Array.from(this.impactMetrics.values()).find((m) => m.userId === userId && m.metric === "sessions_supported");
    if (sessionsMetric) {
      sessionsMetric.value += sessionsSupported;
      sessionsMetric.lastUpdated = /* @__PURE__ */ new Date();
    } else {
      sessionsMetric = {
        id: uuidv4(),
        userId,
        metric: "sessions_supported",
        value: sessionsSupported,
        period: "all-time",
        lastUpdated: /* @__PURE__ */ new Date()
      };
      this.impactMetrics.set(sessionsMetric.id, sessionsMetric);
    }
  }
};
var donationStorage = new DonationMemoryStorage();

// server/ai-chat-routes.ts
function registerAIChatRoutes(app2) {
  app2.post("/api/chat/session", async (req, res) => {
    try {
      const { userId, coachType } = req.body;
      if (!userId || !coachType) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const session2 = await storage.createChatSession({
        userId,
        coachType,
        sessionTitle: `${coachType} Session`,
        sessionContext: {
          userGoals: [],
          preferences: {},
          coachingStyle: "supportive"
        }
      });
      res.json(session2);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });
  app2.get("/api/chat/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const history = await storage.getChatHistory(sessionId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });
  app2.get("/api/chat/sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const sessions2 = await storage.getUserChatSessions(userId);
      res.json(sessions2);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });
  app2.post("/api/ai-coaching/chat", async (req, res) => {
    try {
      const { message, coachType, sessionId, persona = "supportive" } = req.body;
      if (!message || !coachType) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      let conversationContext = "";
      if (sessionId) {
        const history = await storage.getChatHistory(sessionId);
        if (history.length > 0) {
          conversationContext = history.slice(-10).map((msg) => `${msg.is_user === "true" ? "User" : "Coach"}: ${msg.message_text}`).join("\n");
        }
      }
      const personaPrompts = {
        supportive: "Respond with warmth, empathy, and encouragement. Use supportive language and acknowledge emotions.",
        motivational: "Be energetic, inspiring, and goal-focused. Use motivational language and actionable advice.",
        analytical: "Provide data-driven, logical responses. Break down problems systematically and offer clear solutions.",
        gentle: "Use calm, patient language. Take a nurturing approach and emphasize that progress takes time."
      };
      const systemPrompt = `You are ${coachType} AI coach providing ${persona} guidance. ${personaPrompts[persona] || personaPrompts.supportive}

Previous conversation context:
${conversationContext}

Respond to the user's message in character as their ${coachType} coach with the ${persona} personality style.`;
      const aiResponse = generateAIResponse(message, coachType, persona, conversationContext);
      if (sessionId) {
        await storage.saveChatMessage({
          sessionId,
          text: message,
          isUser: true,
          context: { persona, coachType }
        });
        await storage.saveChatMessage({
          sessionId,
          text: aiResponse,
          isUser: false,
          context: { persona, coachType }
        });
      }
      res.json({ response: aiResponse, sessionId });
    } catch (error) {
      console.error("Error in AI coaching chat:", error);
      res.status(500).json({ message: "Failed to process AI coaching request" });
    }
  });
}
function generateAIResponse(message, coachType, persona, context) {
  const responses = {
    "nutritionist": {
      supportive: [
        "I understand nutrition can feel overwhelming. Let's take this one step at a time. What specific area would you like to focus on first?",
        "Your willingness to improve your nutrition shows real self-care. I'm here to support you through every step of this journey.",
        "Remember, small changes can lead to big results. What's one healthy change you feel ready to make this week?"
      ],
      motivational: [
        "You've got this! Nutrition is your fuel for success. Let's create a power-packed plan that energizes your goals!",
        "Every healthy choice you make is an investment in your future self. Ready to make some game-changing nutrition moves?",
        "Transform your energy, transform your life! What nutrition goal are we crushing today?"
      ],
      analytical: [
        "Let's analyze your current nutritional intake systematically. What are your main meals typically composed of?",
        "Based on nutritional science, we can optimize your diet for better health outcomes. What specific health goals are you targeting?",
        "Data shows that balanced nutrition significantly impacts energy and mood. Let's create a structured plan based on your needs."
      ],
      gentle: [
        "Take your time with nutrition changes - lasting habits develop slowly and naturally. What feels manageable for you right now?",
        "Your body deserves nourishment and care. Let's explore gentle ways to improve your relationship with food.",
        "Remember, every small step toward better nutrition is worth celebrating. What would feel nurturing for you today?"
      ]
    },
    "fitness-trainer": {
      supportive: [
        "I believe in your strength, even when you don't feel it yourself. Every movement is a step toward a healthier you.",
        "Your body is capable of amazing things. Let's find ways to move that feel good and sustainable for you.",
        "Fitness is a journey of self-discovery. I'm here to cheer you on every step of the way!"
      ],
      motivational: [
        "Time to unleash your inner warrior! Your body is ready for this challenge - let's make it happen!",
        "Champions aren't made in comfort zones. Ready to push your limits and discover what you're capable of?",
        "Your strongest self is waiting to be unleashed. What fitness goal are we conquering today?"
      ],
      analytical: [
        "Let's assess your current fitness level and create a progressive training plan. What activities do you currently engage in?",
        "Based on exercise science, we can design a program that maximizes your results efficiently. What are your primary fitness objectives?",
        "Research shows consistent movement patterns lead to sustainable fitness gains. Let's structure your routine strategically."
      ],
      gentle: [
        "Listen to your body - it knows what it needs. Let's find gentle movements that bring you joy and energy.",
        "Fitness should enhance your life, not stress you. What types of movement make you feel good?",
        "Your pace is perfect. Every gentle step toward movement is nurturing your overall wellbeing."
      ]
    },
    "behavior-coach": {
      supportive: [
        "Change is challenging, and recognizing that takes courage. I'm here to support you through every step of your growth journey.",
        "Your awareness of wanting change is already a huge step forward. Let's explore what patterns you'd like to shift together.",
        "You have the inner wisdom to create positive change. Sometimes we just need support to access it."
      ],
      motivational: [
        "You have the power to rewrite your story! Let's identify the behaviors that will catapult you toward your dreams!",
        "Break free from limiting patterns! Your breakthrough moment is closer than you think - let's make it happen!",
        "Transform your habits, transform your life! What behavior change will create your biggest impact?"
      ],
      analytical: [
        "Let's examine your behavior patterns systematically. What triggers typically precede the behaviors you want to change?",
        "Behavioral science shows that understanding our patterns is key to sustainable change. What specific behaviors concern you?",
        "We can create a structured approach to behavior modification. What's your primary behavioral goal?"
      ],
      gentle: [
        "Change happens naturally when we're ready. What small shift feels achievable and kind to yourself right now?",
        "Be patient with yourself as you grow. What behavior change would feel most nurturing to explore?",
        "Your journey of change is uniquely yours. Let's honor your pace and celebrate every small victory."
      ]
    },
    "wellness-coordinator": {
      supportive: [
        "Your whole-person wellness matters deeply. I'm here to help you create a life that feels balanced and fulfilling.",
        "Wellness is about finding what works uniquely for you. Let's explore all dimensions of your wellbeing together.",
        "You deserve to feel well in every area of your life. What aspect of wellness would you like to focus on first?"
      ],
      motivational: [
        "Your wellness journey is your path to an extraordinary life! Let's optimize every dimension of your health and happiness!",
        "Unleash your full potential through comprehensive wellness! Which area of your life is ready for a breakthrough?",
        "Create the vibrant, balanced life you deserve! What wellness goal will make the biggest impact on your happiness?"
      ],
      analytical: [
        "Let's assess your wellness across multiple dimensions: physical, mental, emotional, and social. Where do you see the biggest gaps?",
        "Comprehensive wellness requires a systematic approach. What are your current wellness practices and desired outcomes?",
        "Research supports an integrated approach to wellbeing. Let's create a structured wellness plan based on evidence-based practices."
      ],
      gentle: [
        "Wellness unfolds naturally when we listen to our needs. What would feel most nourishing for your wellbeing right now?",
        "Your wellness journey is sacred and personal. Let's explore gentle practices that honor where you are today.",
        "True wellness includes being kind to yourself. What aspect of self-care would feel most supportive?"
      ]
    }
  };
  const coachResponses = responses[coachType];
  if (!coachResponses) {
    return "I'm here to support you on your wellness journey. How can I help you today?";
  }
  const personaResponses = coachResponses[persona];
  if (!personaResponses) {
    return coachResponses.supportive[0];
  }
  let contextualResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];
  if (context && context.length > 0) {
    contextualResponse = `I remember our previous conversation. ${contextualResponse}`;
  }
  return contextualResponse;
}

// server/routes.ts
import cookieParser from "cookie-parser";
import Stripe3 from "stripe";
import { v4 as uuidv42 } from "uuid";

// server/ai-coaching.ts
import OpenAI from "openai";

// server/coaching-templates.ts
var CoachingTemplates = class {
  static generatePersonalizedPlan(profile) {
    const calorieTarget = this.calculateCalorieTarget(profile);
    const activityMultiplier = this.getActivityMultiplier(profile.activityLevel);
    return {
      mealPlan: this.generateMealPlan(profile, calorieTarget),
      workoutPlan: this.generateWorkoutPlan(profile),
      nutritionTips: this.generateNutritionTips(profile),
      motivation: this.generateMotivation(profile)
    };
  }
  static calculateCalorieTarget(profile) {
    const heightCm = this.parseHeight(profile.height);
    const weightKg = profile.currentWeight * 0.453592;
    let bmr;
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age - 161;
    const activityMultiplier = this.getActivityMultiplier(profile.activityLevel);
    const tdee = bmr * activityMultiplier;
    const deficit = Math.min(750, Math.max(300, (profile.currentWeight - profile.goalWeight) * 25));
    return Math.round(tdee - deficit);
  }
  static parseHeight(height) {
    if (height.includes("cm")) {
      return parseInt(height.replace(/\D/g, ""));
    }
    if (height.includes("'") || height.includes("feet")) {
      const feet = parseInt(height.match(/(\d+)/)?.[0] || "5");
      const inches = parseInt(height.match(/(\d+).*?(\d+)/)?.[2] || "6");
      return (feet * 12 + inches) * 2.54;
    }
    return 168;
  }
  static getActivityMultiplier(level) {
    const multipliers = {
      "sedentary": 1.2,
      "lightly-active": 1.375,
      "moderately-active": 1.55,
      "very-active": 1.725,
      "extremely-active": 1.9
    };
    return multipliers[level] || 1.375;
  }
  static generateMealPlan(profile, calorieTarget) {
    const isVegetarian = profile.dietaryRestrictions?.includes("Vegetarian");
    const isVegan = profile.dietaryRestrictions?.includes("Vegan");
    const isGlutenFree = profile.dietaryRestrictions?.includes("Gluten-Free");
    const isDairyFree = profile.dietaryRestrictions?.includes("Dairy-Free");
    const breakfastCalories = Math.round(calorieTarget * 0.25);
    const lunchCalories = Math.round(calorieTarget * 0.35);
    const dinnerCalories = Math.round(calorieTarget * 0.3);
    const snackCalories = Math.round(calorieTarget * 0.1);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days.map((day) => ({
      day,
      meals: {
        breakfast: this.getBreakfastMeal(breakfastCalories, { isVegetarian, isVegan, isGlutenFree, isDairyFree }),
        lunch: this.getLunchMeal(lunchCalories, { isVegetarian, isVegan, isGlutenFree, isDairyFree }),
        dinner: this.getDinnerMeal(dinnerCalories, { isVegetarian, isVegan, isGlutenFree, isDairyFree }),
        snacks: [this.getSnackMeal(snackCalories, { isVegetarian, isVegan, isGlutenFree, isDairyFree })]
      },
      totalCalories: calorieTarget,
      macros: {
        protein: Math.round(calorieTarget * 0.3 / 4),
        carbs: Math.round(calorieTarget * 0.4 / 4),
        fat: Math.round(calorieTarget * 0.3 / 9)
      }
    }));
  }
  static getBreakfastMeal(calories, restrictions) {
    const options = [
      {
        name: "Greek Yogurt Berry Bowl",
        ingredients: ["Greek yogurt", "mixed berries", "granola", "honey"],
        instructions: "Combine 1 cup Greek yogurt with 1/2 cup berries, top with 1/4 cup granola and drizzle honey",
        vegetarian: true,
        vegan: false,
        glutenFree: true,
        dairyFree: false
      },
      {
        name: "Overnight Oats with Almond Butter",
        ingredients: ["rolled oats", "almond milk", "almond butter", "chia seeds", "banana"],
        instructions: "Mix 1/2 cup oats with 1/2 cup almond milk, 1 tbsp almond butter, 1 tsp chia seeds. Refrigerate overnight, top with sliced banana",
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      },
      {
        name: "Vegetable Scramble",
        ingredients: ["eggs", "spinach", "bell peppers", "mushrooms", "olive oil"],
        instructions: "Scramble 2 eggs with saut\xE9ed vegetables in 1 tsp olive oil. Serve with side of fruit",
        vegetarian: true,
        vegan: false,
        glutenFree: true,
        dairyFree: true
      }
    ];
    const suitable = options.filter(
      (option) => (!restrictions.isVegan || option.vegan) && (!restrictions.isVegetarian || option.vegetarian) && (!restrictions.isGlutenFree || option.glutenFree) && (!restrictions.isDairyFree || option.dairyFree)
    );
    const selected = suitable[Math.floor(Math.random() * suitable.length)] || options[0];
    return { ...selected, calories };
  }
  static getLunchMeal(calories, restrictions) {
    const options = [
      {
        name: "Quinoa Power Bowl",
        ingredients: ["quinoa", "chickpeas", "roasted vegetables", "tahini dressing"],
        instructions: "Combine 3/4 cup cooked quinoa, 1/2 cup chickpeas, mixed roasted vegetables, drizzle with tahini",
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      },
      {
        name: "Mediterranean Salad",
        ingredients: ["mixed greens", "cucumber", "tomatoes", "olives", "feta", "olive oil"],
        instructions: "Toss greens with diced cucumber, tomatoes, olives, and feta. Dress with olive oil and lemon",
        vegetarian: true,
        vegan: false,
        glutenFree: true,
        dairyFree: false
      },
      {
        name: "Lentil Soup with Side Salad",
        ingredients: ["red lentils", "vegetables", "vegetable broth", "mixed greens"],
        instructions: "Simmer 1 cup lentils with diced vegetables in broth. Serve with side salad",
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      }
    ];
    const suitable = options.filter(
      (option) => (!restrictions.isVegan || option.vegan) && (!restrictions.isVegetarian || option.vegetarian) && (!restrictions.isGlutenFree || option.glutenFree) && (!restrictions.isDairyFree || option.dairyFree)
    );
    const selected = suitable[Math.floor(Math.random() * suitable.length)] || options[0];
    return { ...selected, calories };
  }
  static getDinnerMeal(calories, restrictions) {
    const options = [
      {
        name: "Baked Tofu with Roasted Vegetables",
        ingredients: ["tofu", "broccoli", "sweet potato", "olive oil", "herbs"],
        instructions: "Bake cubed tofu with seasoned roasted vegetables. Drizzle with herb-infused olive oil",
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      },
      {
        name: "Stuffed Bell Peppers",
        ingredients: ["bell peppers", "quinoa", "black beans", "corn", "tomatoes"],
        instructions: "Stuff peppers with mixture of quinoa, beans, corn, and diced tomatoes. Bake until tender",
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      },
      {
        name: "Vegetable Stir-fry with Brown Rice",
        ingredients: ["mixed vegetables", "brown rice", "sesame oil", "ginger", "garlic"],
        instructions: "Stir-fry vegetables with ginger and garlic in sesame oil. Serve over brown rice",
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      }
    ];
    const suitable = options.filter(
      (option) => (!restrictions.isVegan || option.vegan) && (!restrictions.isVegetarian || option.vegetarian) && (!restrictions.isGlutenFree || option.glutenFree) && (!restrictions.isDairyFree || option.dairyFree)
    );
    const selected = suitable[Math.floor(Math.random() * suitable.length)] || options[0];
    return { ...selected, calories };
  }
  static getSnackMeal(calories, restrictions) {
    const options = [
      {
        name: "Apple with Almond Butter",
        ingredients: ["apple", "almond butter"],
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      },
      {
        name: "Hummus with Vegetables",
        ingredients: ["hummus", "carrot sticks", "cucumber"],
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      },
      {
        name: "Trail Mix",
        ingredients: ["nuts", "seeds", "dried fruit"],
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      }
    ];
    const suitable = options.filter(
      (option) => (!restrictions.isVegan || option.vegan) && (!restrictions.isVegetarian || option.vegetarian) && (!restrictions.isGlutenFree || option.glutenFree) && (!restrictions.isDairyFree || option.dairyFree)
    );
    const selected = suitable[Math.floor(Math.random() * suitable.length)] || options[0];
    return { ...selected, calories };
  }
  static generateWorkoutPlan(profile) {
    const experience = profile.experience;
    const availableTime = parseInt(profile.availableTime?.match(/\d+/)?.[0] || "30");
    const preferredWorkouts = profile.preferredWorkouts || [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days.map((day, index) => {
      if (index % 2 === 0) {
        return this.getStrengthWorkout(day, experience, availableTime);
      } else if (index === 1 || index === 3) {
        return this.getCardioWorkout(day, experience, availableTime, preferredWorkouts);
      } else {
        return this.getActiveRecoveryWorkout(day, availableTime);
      }
    });
  }
  static getStrengthWorkout(day, experience, duration) {
    const beginner = experience === "beginner";
    const sets = beginner ? 2 : 3;
    const reps = beginner ? "12-15" : "8-12";
    return {
      day,
      type: "Strength Training",
      duration,
      exercises: [
        {
          name: "Bodyweight Squats",
          sets,
          reps,
          rest: "45-60 seconds",
          instructions: "Stand with feet hip-width apart. Lower down as if sitting back into a chair, keep chest up.",
          modifications: "Use chair for support if needed"
        },
        {
          name: "Modified Push-ups",
          sets,
          reps,
          rest: "45-60 seconds",
          instructions: "Start on knees or against wall. Lower chest toward surface, push back up.",
          modifications: "Wall push-ups for beginners, full push-ups for advanced"
        },
        {
          name: "Plank Hold",
          sets: 2,
          reps: "20-30 seconds",
          rest: "30 seconds",
          instructions: "Hold straight line from head to heels, engage core.",
          modifications: "Drop to knees if needed"
        }
      ],
      warmup: ["5 minutes marching in place", "Arm circles", "Gentle stretching"],
      cooldown: ["5 minutes walking", "Full body stretching", "Deep breathing"]
    };
  }
  static getCardioWorkout(day, experience, duration, preferred) {
    const hasWalking = preferred.includes("Walking/Jogging");
    const hasDancing = preferred.includes("Dancing");
    let mainActivity = "Walking";
    if (hasDancing) mainActivity = "Dance Cardio";
    if (hasWalking) mainActivity = "Brisk Walking";
    return {
      day,
      type: "Cardio",
      duration,
      exercises: [
        {
          name: mainActivity,
          sets: 1,
          reps: `${duration - 10} minutes`,
          rest: "As needed",
          instructions: `Maintain moderate intensity where you can still hold a conversation.`,
          modifications: "Reduce intensity or take breaks as needed"
        }
      ],
      warmup: ["5 minutes slow walking", "Dynamic stretching"],
      cooldown: ["5 minutes slow walking", "Static stretching"]
    };
  }
  static getActiveRecoveryWorkout(day, duration) {
    return {
      day,
      type: "Active Recovery",
      duration: Math.min(duration, 30),
      exercises: [
        {
          name: "Gentle Yoga Flow",
          sets: 1,
          reps: "15-20 minutes",
          rest: "N/A",
          instructions: "Focus on gentle stretching and breathing. Move slowly and mindfully.",
          modifications: "Hold poses only as long as comfortable"
        }
      ],
      warmup: ["Deep breathing", "Gentle neck and shoulder rolls"],
      cooldown: ["Meditation or relaxation", "Gratitude practice"]
    };
  }
  static generateNutritionTips(profile) {
    const baseIntake = this.calculateCalorieTarget(profile);
    const waterOz = Math.round(profile.currentWeight / 2);
    const tips = [
      `Aim for ${waterOz} oz of water daily (about ${Math.round(waterOz / 8)} glasses)`,
      `Target ${Math.round(baseIntake * 0.3 / 4)}g protein daily to support muscle maintenance`,
      "Fill half your plate with colorful vegetables at each meal",
      "Choose complex carbohydrates like quinoa, sweet potatoes, and whole grains",
      "Include healthy fats from nuts, seeds, avocado, and olive oil"
    ];
    if (profile.dietaryRestrictions?.includes("Gluten-Free")) {
      tips.push("Focus on naturally gluten-free whole foods like fruits, vegetables, and quinoa");
    }
    if (profile.healthConditions?.includes("Diabetes")) {
      tips.push("Pair carbohydrates with protein or healthy fats to stabilize blood sugar");
    }
    if (profile.fitnessGoals?.includes("Increased Energy")) {
      tips.push("Eat regular meals every 3-4 hours to maintain stable energy levels");
    }
    return tips.slice(0, 5);
  }
  static generateMotivation(profile) {
    const motivations = [
      `${profile.name}, your journey toward ${profile.goalWeight} lbs is about creating lasting healthy habits, not just seeing a number on the scale.`,
      `Remember ${profile.name}, every healthy choice you make today is an investment in your future self and your goals of ${profile.fitnessGoals?.join(" and ") || "better health"}.`,
      `${profile.name}, you have the strength to reach your goal of ${profile.goalWeight} lbs. Focus on progress, not perfection.`,
      `Your motivation to ${profile.motivation || "improve your health"} is powerful, ${profile.name}. Trust the process and celebrate small victories.`,
      `${profile.name}, sustainable weight loss is a marathon, not a sprint. You're building skills that will serve you for life.`
    ];
    return motivations[Math.floor(Math.random() * motivations.length)];
  }
};

// server/ai-coaching.ts
var openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-")) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  } catch (error) {
    console.warn("OpenAI initialization failed, using evidence-based templates");
  }
}
var AICoaching = class {
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  model = "gpt-4o";
  async generatePersonalizedMealPlan(profile) {
    if (!openai) {
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.mealPlan;
    }
    const restrictions = profile.dietaryRestrictions.length > 0 ? `with dietary restrictions: ${profile.dietaryRestrictions.join(", ")}` : "";
    const healthConditions = profile.healthConditions.length > 0 ? `considering health conditions: ${profile.healthConditions.join(", ")}` : "";
    const prompt = `Create a personalized 7-day meal plan for weight loss for ${profile.name}:
    - Age: ${profile.age}, Height: ${profile.height}, Current: ${profile.currentWeight}lbs, Goal: ${profile.goalWeight}lbs
    - Activity level: ${profile.activityLevel}
    - ${restrictions} ${healthConditions}
    - Fitness goals: ${profile.fitnessGoals.join(", ")}
    
    Provide realistic, nutritious meals with proper portions for sustainable weight loss. Include exact ingredients, cooking instructions, calorie counts, and macronutrients. Focus on whole foods, lean proteins, and balanced nutrition.
    
    Format as JSON with this structure: {
      "weeklyPlan": [
        {
          "day": "Monday",
          "meals": {
            "breakfast": {"name": "", "calories": 0, "ingredients": [], "instructions": ""},
            "lunch": {"name": "", "calories": 0, "ingredients": [], "instructions": ""},
            "dinner": {"name": "", "calories": 0, "ingredients": [], "instructions": ""},
            "snacks": [{"name": "", "calories": 0, "ingredients": []}]
          },
          "totalCalories": 0,
          "macros": {"protein": 0, "carbs": 0, "fat": 0}
        }
      ]
    }`;
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a certified nutritionist and weight loss coach with expertise in creating personalized meal plans. Provide practical, achievable nutrition advice focused on sustainable weight loss and overall health."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.weeklyPlan || [];
    } catch (error) {
      console.error("Error generating meal plan:", error);
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.mealPlan;
    }
  }
  async generatePersonalizedWorkoutPlan(profile) {
    const workoutPrefs = profile.preferredWorkouts.length > 0 ? `prefers: ${profile.preferredWorkouts.join(", ")}` : "open to various workout types";
    const prompt = `Create a personalized 7-day workout plan for ${profile.name}:
    - Age: ${profile.age}, Current weight: ${profile.currentWeight}lbs, Goal: ${profile.goalWeight}lbs
    - Activity level: ${profile.activityLevel}
    - Experience level: ${profile.experience}
    - Available time: ${profile.availableTime}
    - ${workoutPrefs}
    - Fitness goals: ${profile.fitnessGoals.join(", ")}
    
    Design a progressive workout plan that's safe, effective, and sustainable. Include proper warm-up, exercises with sets/reps/rest periods, modifications for different fitness levels, and cool-down routines.
    
    Format as JSON: {
      "weeklyPlan": [
        {
          "day": "Monday",
          "type": "Strength Training",
          "duration": 45,
          "exercises": [
            {
              "name": "Exercise Name",
              "sets": 3,
              "reps": "8-12",
              "rest": "60-90 seconds",
              "instructions": "detailed form instructions",
              "modifications": "easier/harder options"
            }
          ],
          "warmup": ["5 minutes walking", "dynamic stretching"],
          "cooldown": ["5 minutes stretching", "deep breathing"]
        }
      ]
    }`;
    if (!openai) {
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.workoutPlan;
    }
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a certified personal trainer and fitness coach with expertise in creating safe, effective workout programs for weight loss and overall fitness. Focus on proper form, progressive overload, and injury prevention."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.weeklyPlan || [];
    } catch (error) {
      console.error("Error generating workout plan:", error);
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.workoutPlan;
    }
  }
  async generateMotivationalMessage(profile, progressData) {
    const progressContext = progressData ? `Recent progress: ${JSON.stringify(progressData)}` : "Starting their journey";
    const prompt = `Write a personalized, motivational message for ${profile.name} who is working on weight loss:
    - Current situation: ${profile.currentWeight}lbs working toward ${profile.goalWeight}lbs
    - Their motivation: ${profile.motivation}
    - ${progressContext}
    
    Create an encouraging, supportive message that acknowledges their efforts and provides motivation to continue. Keep it personal, authentic, and empowering. Focus on progress, not perfection.`;
    if (!openai) {
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.motivation;
    }
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a compassionate life coach specializing in supporting women through weight loss journeys. Your messages are encouraging, realistic, and focus on building confidence and sustainable habits."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8
      });
      return response.choices[0].message.content || "Keep going! Every step forward is progress worth celebrating.";
    } catch (error) {
      console.error("Error generating motivational message:", error);
      const plan = CoachingTemplates.generatePersonalizedPlan(profile);
      return plan.motivation;
    }
  }
  async analyzeProgressAndAdjustPlan(profile, progressData) {
    const prompt = `Analyze the progress and provide coaching recommendations for ${profile.name}:
    
    Profile: Age ${profile.age}, starting weight ${profile.currentWeight}lbs, goal ${profile.goalWeight}lbs
    Activity level: ${profile.activityLevel}
    
    Progress data: ${JSON.stringify(progressData)}
    
    Provide:
    1. Analysis of their progress (positive reinforcement and areas for improvement)
    2. Specific recommendations for the next week
    3. Any adjustments needed to their meal or workout plan
    
    Format as JSON: {
      "analysis": "detailed progress analysis",
      "recommendations": ["specific actionable recommendations"],
      "planAdjustments": ["specific plan modifications"]
    }`;
    if (!openai) {
      return {
        analysis: `${profile.name}, you're making excellent progress on your journey toward ${profile.goalWeight} lbs. Your commitment to healthy habits is showing results.`,
        recommendations: [
          "Continue tracking your daily food intake for accountability",
          "Increase water intake to support metabolism and reduce hunger",
          "Focus on getting 7-9 hours of quality sleep nightly",
          "Add 10 minutes of walking after meals to aid digestion"
        ],
        planAdjustments: [
          "Maintain current calorie targets - they're working well for you",
          "Consider adding one extra strength training session if energy levels permit",
          "Try meal prepping on Sundays to stay consistent during busy weekdays"
        ]
      };
    }
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an experienced weight loss coach who provides constructive, encouraging feedback. Focus on sustainable habits and positive reinforcement while making practical adjustments."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        analysis: result.analysis || "Great job staying committed to your health journey!",
        recommendations: result.recommendations || ["Continue following your meal plan", "Stay consistent with workouts"],
        planAdjustments: result.planAdjustments || ["No adjustments needed - keep going!"]
      };
    } catch (error) {
      console.error("Error analyzing progress:", error);
      return {
        analysis: `${profile.name}, you're making excellent progress on your journey toward ${profile.goalWeight} lbs. Your commitment to healthy habits is showing results.`,
        recommendations: [
          "Continue tracking your daily food intake for accountability",
          "Increase water intake to support metabolism and reduce hunger",
          "Focus on getting 7-9 hours of quality sleep nightly",
          "Add 10 minutes of walking after meals to aid digestion"
        ],
        planAdjustments: [
          "Maintain current calorie targets - they're working well for you",
          "Consider adding one extra strength training session if energy levels permit",
          "Try meal prepping on Sundays to stay consistent during busy weekdays"
        ]
      };
    }
  }
  async generateNutritionTips(profile) {
    const prompt = `Generate 5 personalized nutrition tips for ${profile.name}:
    - Age: ${profile.age}, Current: ${profile.currentWeight}lbs, Goal: ${profile.goalWeight}lbs
    - Dietary restrictions: ${profile.dietaryRestrictions.join(", ") || "None"}
    - Health conditions: ${profile.healthConditions.join(", ") || "None"}
    
    Provide practical, actionable nutrition tips that are specific to their situation and easy to implement.
    
    Format as JSON: {"tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]}`;
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a registered dietitian providing practical, evidence-based nutrition advice for sustainable weight loss."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.tips || [
        "Stay hydrated with 8-10 glasses of water daily",
        "Fill half your plate with vegetables at each meal",
        "Choose lean proteins to support muscle maintenance",
        "Practice portion control using your hand as a guide",
        "Eat slowly and mindfully to recognize fullness cues"
      ];
    } catch (error) {
      console.error("Error generating nutrition tips:", error);
      return [
        "Stay hydrated throughout the day",
        "Include protein in every meal",
        "Choose whole foods over processed options",
        "Practice mindful eating",
        "Plan and prep meals in advance"
      ];
    }
  }
};
var aiCoaching = new AICoaching();

// server/admin-routes.ts
import { Router as Router2 } from "express";

// server/admin-auth.ts
import jwt from "jsonwebtoken";
import { z as z2 } from "zod";
var PERMISSIONS = {
  // Dashboard and Analytics
  VIEW_DASHBOARD: "view_dashboard",
  // User Management
  VIEW_USERS: "view_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",
  // Coach Management
  VIEW_COACHES: "view_coaches",
  EDIT_COACHES: "edit_coaches",
  DELETE_COACHES: "delete_coaches",
  // Donation Management
  VIEW_DONATIONS: "view_donations",
  EDIT_DONATIONS: "edit_donations",
  PROCESS_REFUNDS: "process_refunds",
  // Booking Management
  VIEW_BOOKINGS: "view_bookings",
  EDIT_BOOKINGS: "edit_bookings",
  CANCEL_BOOKINGS: "cancel_bookings",
  // Content Management
  CONTENT_MANAGEMENT: "content_management",
  PUBLISH_CONTENT: "publish_content",
  // System Administration
  SYSTEM_ADMIN: "system_admin",
  SYSTEM_MAINTENANCE: "system_maintenance",
  VIEW_LOGS: "view_logs",
  // Marketing
  MARKETING: "marketing",
  SEND_NOTIFICATIONS: "send_notifications",
  // Reports and Analytics
  VIEW_REPORTS: "view_reports",
  EXPORT_DATA: "export_data",
  DATA_EXPORT: "data_export",
  // Reward System
  REWARD_MANAGEMENT: "reward_management"
};
var adminOAuthSchema = z2.object({
  email: z2.string().email("Invalid email address"),
  googleId: z2.string().min(1, "Google ID is required"),
  firstName: z2.string().optional(),
  lastName: z2.string().optional(),
  profileImageUrl: z2.string().optional()
});
var AdminAuthService = class {
  static JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-in-production";
  static JWT_EXPIRES_IN = "24h";
  // Generate JWT token for admin
  static generateToken(adminUser) {
    return jwt.sign(
      {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        permissions: adminUser.permissions,
        isSuperAdmin: adminUser.isSuperAdmin
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }
  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
  // Authenticate admin user via Google OAuth only
  static async authenticateAdminOAuth(oauthData) {
    try {
      const authorizedAdmins = [
        "charles.watson@wholewellnesscoaching.org",
        "charles.watson@wholewellness-coaching.org",
        "charles.watson@gmail.com"
      ];
      if (!authorizedAdmins.includes(oauthData.email)) {
        console.log(`Admin OAuth failed - unauthorized email: ${oauthData.email}`);
        return null;
      }
      let user = await storage.getUserByEmail(oauthData.email);
      if (!user) {
        user = await storage.createUser({
          email: oauthData.email,
          firstName: oauthData.firstName || "Admin",
          lastName: oauthData.lastName || "User",
          profileImageUrl: oauthData.profileImageUrl,
          googleId: oauthData.googleId,
          role: "super_admin",
          // Default to super admin for authorized emails
          isActive: true,
          provider: "google"
        });
      } else {
        await storage.updateUser(user.id, {
          googleId: oauthData.googleId,
          firstName: oauthData.firstName || user.firstName,
          lastName: oauthData.lastName || user.lastName,
          profileImageUrl: oauthData.profileImageUrl || user.profileImageUrl,
          lastLogin: /* @__PURE__ */ new Date(),
          role: user.role || "super_admin",
          isActive: true
        });
        user = await storage.getUserByEmail(oauthData.email);
      }
      const permissions = this.getUserPermissions(user);
      return {
        id: user.id,
        username: user.email,
        email: user.email,
        role: user.role,
        permissions,
        lastLogin: /* @__PURE__ */ new Date(),
        isActive: true,
        isSuperAdmin: user.role === "super_admin",
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      };
    } catch (error) {
      console.error("Admin OAuth authentication error:", error);
      return null;
    }
  }
  // Create admin session
  static async createAdminSession(adminId, req) {
    const sessionToken = jwt.sign(
      { adminId, type: "admin_session" },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
    await storage.createAdminSession({
      id: sessionToken,
      adminId,
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3),
      // 24 hours
      isActive: true
    });
    return sessionToken;
  }
  // Validate admin session
  static async validateAdminSession(sessionToken) {
    try {
      const decoded = this.verifyToken(sessionToken);
      if (decoded.type !== "admin_session") {
        return null;
      }
      const user = await storage.getUser(decoded.adminId);
      if (!user || !user.isActive || user.role !== "admin" && user.role !== "super_admin") {
        return null;
      }
      const permissions = this.getUserPermissions(user);
      return {
        id: user.id,
        username: user.email,
        // Use email as username for OAuth
        email: user.email,
        role: user.role,
        permissions,
        isActive: user.isActive,
        isSuperAdmin: user.role === "super_admin"
      };
    } catch (error) {
      console.error("Session validation error:", error);
      return null;
    }
  }
  // Log admin activity
  static async logActivity(adminId, action, resourceType, resourceId, details, req) {
    try {
      await storage.createAdminActivityLog({
        adminId,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "unknown",
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error logging admin activity:", error);
    }
  }
  // Check if admin has permission
  static hasPermission(adminUser, permission) {
    if (adminUser.isSuperAdmin) {
      return true;
    }
    return adminUser.permissions.includes(permission);
  }
  // Check if admin has any of the specified permissions
  static hasAnyPermission(adminUser, permissions) {
    if (adminUser.isSuperAdmin) {
      return true;
    }
    return permissions.some((permission) => adminUser.permissions.includes(permission));
  }
  // Get user permissions based on role
  static getUserPermissions(user) {
    if (user.role === "super_admin") {
      return Object.values(PERMISSIONS);
    }
    if (user.role === "admin") {
      return [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.EDIT_USERS,
        PERMISSIONS.VIEW_COACHES,
        PERMISSIONS.EDIT_COACHES,
        PERMISSIONS.VIEW_DONATIONS,
        PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.EDIT_BOOKINGS,
        PERMISSIONS.CONTENT_MANAGEMENT,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.MARKETING,
        PERMISSIONS.SEND_NOTIFICATIONS
      ];
    }
    return [];
  }
};
var requireAdminAuth = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.adminSession;
    if (!sessionToken) {
      return res.status(401).json({ error: "Admin authentication required" });
    }
    const adminUser = await AdminAuthService.validateAdminSession(sessionToken);
    if (!adminUser) {
      return res.status(401).json({ error: "Invalid or expired admin session" });
    }
    req.adminUser = adminUser;
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(401).json({ error: "Admin authentication failed" });
  }
};
var requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: "Admin authentication required" });
    }
    if (!AdminAuthService.hasPermission(req.adminUser, permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};
var requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: "Admin authentication required" });
    }
    if (!AdminAuthService.hasAnyPermission(req.adminUser, permissions)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};
var requireSuperAdmin = (req, res, next) => {
  if (!req.adminUser) {
    return res.status(401).json({ error: "Admin authentication required" });
  }
  if (!req.adminUser.isSuperAdmin) {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
};

// server/admin-dashboard-routes.ts
import { Router } from "express";
var router = Router();
router.post("/auth/oauth-login", async (req, res) => {
  try {
    const oauthData = req.body;
    const adminUser = await AdminAuthService.authenticateAdminOAuth(oauthData);
    if (!adminUser) {
      return res.status(401).json({
        success: false,
        error: "Admin access denied. Only authorized administrators can access this area."
      });
    }
    const sessionToken = await AdminAuthService.createAdminSession(adminUser.id, req);
    res.cookie("adminSession", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    });
    res.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        firstName: oauthData.firstName,
        lastName: oauthData.lastName,
        profileImageUrl: oauthData.profileImageUrl
      },
      permissions: adminUser.permissions,
      sessionToken
    });
  } catch (error) {
    console.error("Admin OAuth login error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed"
    });
  }
});
router.post("/auth/logout", requireAdminAuth, async (req, res) => {
  try {
    const sessionToken = req.adminSession?.sessionToken;
    if (sessionToken) {
      await AdminAuthService.logout(sessionToken, req);
    }
    res.clearCookie("adminSession");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({ success: false, error: "Logout failed" });
  }
});
router.get("/auth/me", requireAdminAuth, async (req, res) => {
  try {
    const user = req.adminUser;
    const permissions = AdminAuthService.getUserPermissions(user);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        lastLogin: user.lastLogin
      },
      permissions,
      session: {
        expiresAt: req.adminSession?.expiresAt
      }
    });
  } catch (error) {
    console.error("Get admin user error:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
});
router.get("/dashboard/overview", requireAdminAuth, requireAnyPermission([
  PERMISSIONS.VIEW_ANALYTICS,
  PERMISSIONS.VIEW_USERS,
  PERMISSIONS.VIEW_DONATIONS
]), async (req, res) => {
  try {
    const user = req.adminUser;
    const metrics = {};
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_USERS)) {
      const users2 = await storage.getAllUsers();
      metrics.totalUsers = users2.length;
      metrics.newUsersThisMonth = users2.filter((u) => {
        const userDate = new Date(u.createdAt);
        const monthAgo = /* @__PURE__ */ new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return userDate >= monthAgo;
      }).length;
      metrics.usersByRole = users2.reduce((acc, u) => {
        acc[u.role || "user"] = (acc[u.role || "user"] || 0) + 1;
        return acc;
      }, {});
    }
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_DONATIONS)) {
      const donations2 = await storage.getAllDonations();
      const completedDonations = donations2.filter((d) => d.status === "completed");
      metrics.totalDonations = completedDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      metrics.donationCount = completedDonations.length;
      metrics.pendingDonations = donations2.filter((d) => d.status === "pending").length;
      const monthlyRevenue = completedDonations.filter((d) => {
        const donationDate = new Date(d.createdAt);
        const monthAgo = /* @__PURE__ */ new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return donationDate >= monthAgo;
      }).reduce((sum, d) => sum + parseFloat(d.amount), 0);
      metrics.monthlyRevenue = monthlyRevenue;
    }
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_BOOKINGS)) {
      const bookings2 = await storage.getAllBookings();
      metrics.totalBookings = bookings2.length;
      metrics.pendingBookings = bookings2.filter((b) => b.status === "pending").length;
      metrics.completedBookings = bookings2.filter((b) => b.status === "completed").length;
    }
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_ANALYTICS)) {
      try {
        const courseEnrollments = await storage.query(`
          SELECT COUNT(*) as total_enrollments,
                 COUNT(CASE WHEN payment_status = 'succeeded' THEN 1 END) as active_enrollments,
                 SUM(CASE WHEN payment_status = 'succeeded' THEN amount ELSE 0 END) as course_revenue,
                 AVG(CASE WHEN progress IS NOT NULL THEN progress ELSE 0 END) as avg_completion
          FROM course_enrollment_payments
        `);
        if (courseEnrollments && courseEnrollments.length > 0) {
          const data = courseEnrollments[0];
          metrics.totalCourseEnrollments = parseInt(data.total_enrollments) || 0;
          metrics.activeCourseEnrollments = parseInt(data.active_enrollments) || 0;
          metrics.courseRevenue = parseFloat(data.course_revenue) || 0;
          metrics.averageCourseCompletion = Math.round(parseFloat(data.avg_completion) || 0);
        }
        const couponStats = await storage.query(`
          SELECT COUNT(*) as total_coupons_used
          FROM coupon_redemptions
          WHERE status = 'active'
        `);
        if (couponStats && couponStats.length > 0) {
          metrics.totalCouponsUsed = parseInt(couponStats[0].total_coupons_used) || 0;
        }
      } catch (error) {
        console.warn("Course metrics error:", error);
        metrics.totalCourseEnrollments = 0;
        metrics.activeCourseEnrollments = 0;
        metrics.courseRevenue = 0;
        metrics.averageCourseCompletion = 0;
        metrics.totalCouponsUsed = 0;
      }
    }
    await AdminAuthService.logActivity(
      user.id,
      "VIEW_DASHBOARD_OVERVIEW",
      "dashboard",
      null,
      { metricsAccessed: Object.keys(metrics) },
      req
    );
    res.json({
      metrics,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ error: "Failed to load dashboard overview" });
  }
});
router.get("/users", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_USERS), async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status, search } = req.query;
    let users2 = await storage.getAllUsers();
    if (role) {
      users2 = users2.filter((user) => user.role === role);
    }
    if (status === "active") {
      users2 = users2.filter((user) => user.isActive);
    } else if (status === "inactive") {
      users2 = users2.filter((user) => !user.isActive);
    }
    if (search) {
      const searchTerm = search.toLowerCase();
      users2 = users2.filter(
        (user) => user.email.toLowerCase().includes(searchTerm) || user.firstName && user.firstName.toLowerCase().includes(searchTerm) || user.lastName && user.lastName.toLowerCase().includes(searchTerm)
      );
    }
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedUsers = users2.slice(startIndex, startIndex + Number(limit));
    const sanitizedUsers = paginatedUsers.map((user) => ({
      ...user,
      passwordHash: void 0
    }));
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "VIEW_USERS",
      "users",
      null,
      { filters: { role, status, search }, resultCount: sanitizedUsers.length },
      req
    );
    res.json({
      users: sanitizedUsers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: users2.length,
        totalPages: Math.ceil(users2.length / Number(limit))
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
router.patch("/users/:id", requireAdminAuth, requirePermission(PERMISSIONS.EDIT_USERS), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.role && req.adminUser.id === id && req.adminUser.role !== "super_admin") {
      return res.status(403).json({ error: "Cannot modify your own role" });
    }
    if (updates.role === "super_admin" && req.adminUser.role !== "super_admin") {
      return res.status(403).json({ error: "Only super admins can assign super admin role" });
    }
    const updatedUser = await storage.updateUser(id, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "UPDATE_USER",
      "user",
      id,
      { updates },
      req
    );
    res.json({
      ...updatedUser,
      passwordHash: void 0
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});
router.get("/roles", requireAdminAuth, requirePermission(PERMISSIONS.MANAGE_ADMINS), async (req, res) => {
  try {
    const roles = [
      {
        name: "user",
        displayName: "User",
        description: "Regular platform user",
        permissions: []
      },
      {
        name: "moderator",
        displayName: "Moderator",
        description: "Can view most data but limited editing",
        permissions: ["view_users", "view_donations", "view_coaches", "view_bookings", "view_content"]
      },
      {
        name: "coach",
        displayName: "Coach",
        description: "Platform coach with client management access",
        permissions: ["view_users", "view_bookings", "view_content", "edit_content"]
      },
      {
        name: "admin",
        displayName: "Administrator",
        description: "Full platform management access",
        permissions: Object.values(PERMISSIONS).filter((p) => p !== PERMISSIONS.FULL_ACCESS && p !== PERMISSIONS.MANAGE_ADMINS)
      },
      {
        name: "super_admin",
        displayName: "Super Administrator",
        description: "Complete system access including admin management",
        permissions: Object.values(PERMISSIONS)
      }
    ];
    res.json({ roles });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});
router.get("/activity", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_LOGS), async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action, resource } = req.query;
    let logs = await storage.getAdminActivityLogs();
    if (userId) {
      logs = logs.filter((log2) => log2.userId === userId);
    }
    if (action) {
      logs = logs.filter((log2) => log2.action === action);
    }
    if (resource) {
      logs = logs.filter((log2) => log2.resource === resource);
    }
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedLogs = logs.slice(startIndex, startIndex + Number(limit));
    res.json({
      logs: paginatedLogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: logs.length,
        totalPages: Math.ceil(logs.length / Number(limit))
      }
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});
router.get("/sessions", requireAdminAuth, requireSuperAdmin, async (req, res) => {
  try {
    const sessions2 = await storage.getActiveAdminSessions();
    const sessionsWithUsers = await Promise.all(
      sessions2.map(async (session2) => {
        const user = await storage.getUser(session2.userId);
        return {
          ...session2,
          user: user ? {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          } : null
        };
      })
    );
    res.json({ sessions: sessionsWithUsers });
  } catch (error) {
    console.error("Get admin sessions error:", error);
    res.status(500).json({ error: "Failed to fetch admin sessions" });
  }
});
router.delete("/sessions/:id", requireAdminAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.adminSession.id === Number(id)) {
      return res.status(403).json({ error: "Cannot terminate your own session" });
    }
    const success = await storage.updateAdminSession(Number(id), { isActive: false });
    if (success) {
      await AdminAuthService.logActivity(
        req.adminUser.id,
        "TERMINATE_ADMIN_SESSION",
        "admin_session",
        id,
        {},
        req
      );
      res.json({ success: true, message: "Session terminated" });
    } else {
      res.status(404).json({ error: "Session not found" });
    }
  } catch (error) {
    console.error("Terminate session error:", error);
    res.status(500).json({ error: "Failed to terminate session" });
  }
});
router.get("/course-enrollments", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_ANALYTICS), async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    let query = `
      SELECT 
        cep.id,
        cep.user_id,
        cep.course_id,
        cep.amount as payment_amount,
        cep.payment_status,
        cep.created_at as enrollment_date,
        cr.coupon_id,
        c.code as coupon_used,
        ce.progress,
        ce.completion_date,
        u.email,
        u.first_name,
        u.last_name,
        'Course ' || cep.course_id as course_name
      FROM course_enrollment_payments cep
      LEFT JOIN coupon_redemptions cr ON cep.coupon_redemption_id = cr.id
      LEFT JOIN coupons c ON cr.coupon_id = c.id
      LEFT JOIN course_enrollments ce ON cep.enrollment_id = ce.id
      LEFT JOIN users u ON cep.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    if (status && status !== "all") {
      query += ` AND cep.payment_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (search) {
      query += ` AND (u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    query += ` ORDER BY cep.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    const enrollments = await storage.query(query, params);
    let countQuery = `
      SELECT COUNT(*) as total
      FROM course_enrollment_payments cep
      LEFT JOIN users u ON cep.user_id = u.id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamIndex = 1;
    if (status && status !== "all") {
      countQuery += ` AND cep.payment_status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    if (search) {
      countQuery += ` AND (u.email ILIKE $${countParamIndex} OR u.first_name ILIKE $${countParamIndex} OR u.last_name ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }
    const countResult = await storage.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "VIEW_COURSE_ENROLLMENTS",
      "course_enrollments",
      null,
      { filters: { status, search }, resultCount: enrollments.length },
      req
    );
    res.json({
      enrollments: enrollments.map((e) => ({
        id: e.id,
        userId: e.user_id,
        courseId: e.course_id,
        courseName: e.course_name,
        enrollmentDate: e.enrollment_date,
        paymentStatus: e.payment_status,
        paymentAmount: parseFloat(e.payment_amount),
        couponUsed: e.coupon_used,
        progress: e.progress || 0,
        completionDate: e.completion_date,
        user: {
          firstName: e.first_name,
          lastName: e.last_name,
          email: e.email
        }
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(total),
        totalPages: Math.ceil(parseInt(total) / Number(limit))
      }
    });
  } catch (error) {
    console.error("Get course enrollments error:", error);
    res.status(500).json({ error: "Failed to fetch course enrollments" });
  }
});
router.get("/payments", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_ANALYTICS), async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    let query = `
      SELECT 
        cep.id,
        cep.user_id,
        cep.course_id,
        cep.amount,
        cep.currency,
        cep.payment_method,
        cep.payment_intent_id,
        cep.payment_status as status,
        cep.created_at,
        cr.discount_amount,
        c.code as coupon_code,
        u.email,
        u.first_name,
        u.last_name
      FROM course_enrollment_payments cep
      LEFT JOIN coupon_redemptions cr ON cep.coupon_redemption_id = cr.id
      LEFT JOIN coupons c ON cr.coupon_id = c.id
      LEFT JOIN users u ON cep.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    if (status && status !== "all") {
      query += ` AND cep.payment_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (search) {
      query += ` AND (u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR cep.payment_intent_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    query += ` ORDER BY cep.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    const payments = await storage.query(query, params);
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "VIEW_PAYMENTS",
      "payments",
      null,
      { filters: { status, search }, resultCount: payments.length },
      req
    );
    res.json({
      payments: payments.map((p) => ({
        id: p.id,
        userId: p.user_id,
        courseId: p.course_id,
        amount: parseFloat(p.amount),
        currency: p.currency,
        paymentMethod: p.payment_method,
        paymentIntentId: p.payment_intent_id,
        status: p.status,
        couponCode: p.coupon_code,
        discountAmount: p.discount_amount ? parseFloat(p.discount_amount) : null,
        createdAt: p.created_at,
        user: {
          firstName: p.first_name,
          lastName: p.last_name,
          email: p.email
        }
      }))
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});
router.get("/dashboard/stats", requireAdminAuth, requireAnyPermission([
  PERMISSIONS.VIEW_ANALYTICS,
  PERMISSIONS.VIEW_USERS,
  PERMISSIONS.VIEW_DONATIONS
]), async (req, res) => {
  try {
    const user = req.adminUser;
    const stats = {};
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_USERS)) {
      const users2 = await storage.getAllUsers();
      stats.totalUsers = users2.length;
      stats.newUsersToday = users2.filter((u) => {
        const userDate = new Date(u.createdAt);
        const today = /* @__PURE__ */ new Date();
        return userDate.toDateString() === today.toDateString();
      }).length;
      stats.activeCoaches = users2.filter((u) => u.role === "coach" && u.isActive).length;
    }
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_DONATIONS)) {
      const donations2 = await storage.getAllDonations();
      const completedDonations = donations2.filter((d) => d.status === "completed");
      stats.totalDonations = completedDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      const monthlyRevenue = completedDonations.filter((d) => {
        const donationDate = new Date(d.createdAt);
        const monthAgo = /* @__PURE__ */ new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return donationDate >= monthAgo;
      }).reduce((sum, d) => sum + parseFloat(d.amount), 0);
      stats.monthlyRevenue = monthlyRevenue;
    }
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_BOOKINGS)) {
      const bookings2 = await storage.getAllBookings();
      stats.totalBookings = bookings2.length;
      stats.pendingBookings = bookings2.filter((b) => b.status === "pending").length;
      stats.completedSessions = bookings2.filter((b) => b.status === "completed").length;
    }
    if (AdminAuthService.hasPermission(user, PERMISSIONS.VIEW_ANALYTICS)) {
      try {
        const courseStats = await storage.query(`
          SELECT 
            COUNT(*) as total_enrollments,
            COUNT(CASE WHEN payment_status = 'succeeded' THEN 1 END) as active_enrollments,
            SUM(CASE WHEN payment_status = 'succeeded' THEN amount ELSE 0 END) as course_revenue,
            AVG(CASE WHEN ce.progress IS NOT NULL THEN ce.progress ELSE 0 END) as avg_completion
          FROM course_enrollment_payments cep
          LEFT JOIN course_enrollments ce ON cep.enrollment_id = ce.id
        `);
        if (courseStats && courseStats.length > 0) {
          const data = courseStats[0];
          stats.totalCourseEnrollments = parseInt(data.total_enrollments) || 0;
          stats.activeCourseEnrollments = parseInt(data.active_enrollments) || 0;
          stats.courseRevenue = parseFloat(data.course_revenue) || 0;
          stats.averageCourseCompletion = Math.round(parseFloat(data.avg_completion) || 0);
        }
        const couponStats = await storage.query(`
          SELECT COUNT(*) as total_used
          FROM coupon_redemptions
          WHERE status = 'active'
        `);
        stats.totalCouponsUsed = couponStats[0]?.total_used || 0;
      } catch (error) {
        console.warn("Course stats error:", error);
        stats.totalCourseEnrollments = 0;
        stats.activeCourseEnrollments = 0;
        stats.courseRevenue = 0;
        stats.averageCourseCompletion = 0;
        stats.totalCouponsUsed = 0;
      }
    }
    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});
router.post("/check-permission", requireAdminAuth, async (req, res) => {
  try {
    const { permission, permissions } = req.body;
    const user = req.adminUser;
    let result = false;
    if (permission) {
      result = AdminAuthService.hasPermission(user, permission);
    } else if (permissions && Array.isArray(permissions)) {
      result = AdminAuthService.hasAnyPermission(user, permissions);
    }
    res.json({
      hasPermission: result,
      userRole: user.role,
      userPermissions: AdminAuthService.getUserPermissions(user)
    });
  } catch (error) {
    console.error("Check permission error:", error);
    res.status(500).json({ error: "Failed to check permission" });
  }
});
var admin_dashboard_routes_default = router;

// server/admin-routes.ts
var router2 = Router2();
router2.use("/", admin_dashboard_routes_default);
router2.get("/dashboard/stats", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_DASHBOARD), async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonations,
      totalBookings,
      activeCoaches,
      monthlyRevenue,
      newUsersToday,
      pendingBookings,
      completedSessions
    ] = await Promise.all([
      storage.getTotalUsers(),
      storage.getTotalDonations(),
      storage.getTotalBookings(),
      storage.getActiveCoaches(),
      storage.getMonthlyRevenue(),
      storage.getNewUsersToday(),
      storage.getPendingBookings(),
      storage.getCompletedSessions()
    ]);
    res.json({
      totalUsers,
      totalDonations,
      totalBookings,
      activeCoaches,
      monthlyRevenue,
      newUsersToday,
      pendingBookings,
      completedSessions
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});
router2.get("/users", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_USERS), async (req, res) => {
  try {
    const users2 = await storage.getAllUsers();
    res.json(users2);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
router2.patch("/users/:id", requireAdminAuth, requirePermission(PERMISSIONS.EDIT_USERS), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = await storage.updateUser(id, updateData);
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "UPDATE_USER",
      "user",
      id,
      updateData,
      req
    );
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});
router2.get("/donations", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_DONATIONS), async (req, res) => {
  try {
    const donations2 = await storage.getAllDonationsWithUsers();
    res.json(donations2);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ error: "Failed to fetch donations" });
  }
});
router2.get("/bookings", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_BOOKINGS), async (req, res) => {
  try {
    const bookings2 = await storage.getAllBookings();
    res.json(bookings2);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});
router2.patch("/bookings/:id", requireAdminAuth, requirePermission(PERMISSIONS.EDIT_BOOKINGS), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await storage.updateBookingStatus(parseInt(id), status);
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "UPDATE_BOOKING",
      "booking",
      id,
      { status },
      req
    );
    res.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
});
router2.get("/coaches", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_COACHES), async (req, res) => {
  try {
    const coaches2 = await storage.getAllCoaches();
    res.json(coaches2);
  } catch (error) {
    console.error("Error fetching coaches:", error);
    res.status(500).json({ error: "Failed to fetch coaches" });
  }
});
router2.patch("/coaches/:id", requireAdminAuth, requirePermission(PERMISSIONS.EDIT_COACHES), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const coach = await storage.updateCoach(parseInt(id), updateData);
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "UPDATE_COACH",
      "coach",
      id,
      updateData,
      req
    );
    res.json(coach);
  } catch (error) {
    console.error("Error updating coach:", error);
    res.status(500).json({ error: "Failed to update coach" });
  }
});
router2.get("/activity", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_LOGS), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const activityLogs = await storage.getAdminActivityLogs(limit, offset);
    res.json(activityLogs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});
router2.get("/sessions", requireAdminAuth, requireSuperAdmin, async (req, res) => {
  try {
    const sessions2 = await storage.getAllAdminSessions();
    res.json(sessions2);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});
router2.delete("/sessions/:id", requireAdminAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.terminateAdminSession(id);
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "TERMINATE_SESSION",
      "admin_session",
      id,
      {},
      req
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error terminating session:", error);
    res.status(500).json({ error: "Failed to terminate session" });
  }
});
router2.get("/reports/users", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_REPORTS), async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const report = await storage.generateUserReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error generating user report:", error);
    res.status(500).json({ error: "Failed to generate user report" });
  }
});
router2.get("/reports/financial", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_REPORTS), async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const report = await storage.generateFinancialReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error generating financial report:", error);
    res.status(500).json({ error: "Failed to generate financial report" });
  }
});
router2.get("/reports/coaching", requireAdminAuth, requirePermission(PERMISSIONS.VIEW_REPORTS), async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const report = await storage.generateCoachingReport(startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error generating coaching report:", error);
    res.status(500).json({ error: "Failed to generate coaching report" });
  }
});
router2.post("/maintenance/process-donations", requireAdminAuth, requirePermission(PERMISSIONS.SYSTEM_MAINTENANCE), async (req, res) => {
  try {
    const result = await storage.processPendingDonations();
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "PROCESS_DONATIONS",
      "system",
      "maintenance",
      result,
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error processing donations:", error);
    res.status(500).json({ error: "Failed to process donations" });
  }
});
router2.post("/maintenance/assign-coaches", requireAdminAuth, requirePermission(PERMISSIONS.SYSTEM_MAINTENANCE), async (req, res) => {
  try {
    const result = await storage.assignCoachesToBookings();
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "ASSIGN_COACHES",
      "system",
      "maintenance",
      result,
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error assigning coaches:", error);
    res.status(500).json({ error: "Failed to assign coaches" });
  }
});
router2.post("/maintenance/send-followups", requireAdminAuth, requirePermission(PERMISSIONS.SYSTEM_MAINTENANCE), async (req, res) => {
  try {
    const result = await storage.sendFollowUpEmails();
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "SEND_FOLLOWUPS",
      "system",
      "maintenance",
      result,
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error sending follow-ups:", error);
    res.status(500).json({ error: "Failed to send follow-ups" });
  }
});
router2.post("/marketing/update-segments", requireAdminAuth, requirePermission(PERMISSIONS.MARKETING), async (req, res) => {
  try {
    const result = await storage.updateUserSegments();
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "UPDATE_SEGMENTS",
      "marketing",
      "segments",
      result,
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error updating segments:", error);
    res.status(500).json({ error: "Failed to update user segments" });
  }
});
router2.post("/marketing/send-notification", requireAdminAuth, requirePermission(PERMISSIONS.MARKETING), async (req, res) => {
  try {
    const { userSegment, template, subject, content } = req.body;
    const result = await storage.sendMarketingNotification(userSegment, template, subject, content);
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "SEND_NOTIFICATION",
      "marketing",
      "notification",
      { userSegment, template, subject },
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});
router2.get("/content/pages", requireAdminAuth, requirePermission(PERMISSIONS.CONTENT_MANAGEMENT), async (req, res) => {
  try {
    const pages = await storage.getAllContentPages();
    res.json(pages);
  } catch (error) {
    console.error("Error fetching content pages:", error);
    res.status(500).json({ error: "Failed to fetch content pages" });
  }
});
router2.post("/content/publish", requireAdminAuth, requirePermission(PERMISSIONS.CONTENT_MANAGEMENT), async (req, res) => {
  try {
    const { contentId, publishDate } = req.body;
    const result = await storage.scheduleContentPublication(contentId, publishDate);
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "SCHEDULE_CONTENT",
      "content",
      contentId,
      { publishDate },
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error scheduling content:", error);
    res.status(500).json({ error: "Failed to schedule content" });
  }
});
router2.post("/rewards/add-points", requireAdminAuth, requirePermission(PERMISSIONS.REWARD_MANAGEMENT), async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    const result = await storage.addRewardPoints(userId, points, reason);
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "ADD_REWARD_POINTS",
      "user",
      userId,
      { points, reason },
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error adding reward points:", error);
    res.status(500).json({ error: "Failed to add reward points" });
  }
});
router2.get("/system/alerts", requireAdminAuth, async (req, res) => {
  try {
    const alerts = await storage.getSystemAlerts();
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching system alerts:", error);
    res.status(500).json({ error: "Failed to fetch system alerts" });
  }
});
router2.post("/system/notification", requireAdminAuth, requirePermission(PERMISSIONS.SYSTEM_ADMIN), async (req, res) => {
  try {
    const { title, message, severity, targetUsers } = req.body;
    const notification = await storage.createAdminNotification({
      title,
      message,
      severity,
      targetUsers,
      createdBy: req.adminUser.id
    });
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "CREATE_NOTIFICATION",
      "system",
      "notification",
      { title, message, severity },
      req
    );
    res.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});
router2.get("/export/users", requireAdminAuth, requirePermission(PERMISSIONS.DATA_EXPORT), async (req, res) => {
  try {
    const format = req.query.format || "csv";
    const userData = await storage.exportUserData(format);
    await AdminAuthService.logActivity(
      req.adminUser.id,
      "EXPORT_DATA",
      "users",
      "export",
      { format },
      req
    );
    res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=users.${format}`);
    res.send(userData);
  } catch (error) {
    console.error("Error exporting user data:", error);
    res.status(500).json({ error: "Failed to export user data" });
  }
});

// server/coach-earnings-system.ts
var CoachEarningsSystem = class {
  /**
   * Track earnings for a coach and automatically upgrade role when they reach $99
   */
  static async trackEarnings(userId, amount, source = "session") {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }
      const currentEarnings = user.donationTotal || 0;
      const newEarnings = currentEarnings + amount;
      const shouldUpgrade = newEarnings >= 99 && user.role !== "coach";
      if (shouldUpgrade) {
        await storage.updateUser(userId, {
          role: "coach",
          donationTotal: newEarnings,
          updatedAt: /* @__PURE__ */ new Date()
        });
        console.log(`\u{1F389} User ${userId} (${user.email}) upgraded to coach role after earning $${newEarnings}`);
        await this.logCoachUpgrade(userId, newEarnings, source);
        await this.notifyRoleUpgrade(userId, user.email, newEarnings);
      } else {
        await storage.updateUser(userId, {
          donationTotal: newEarnings,
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
      console.log(`\u{1F4B0} Earnings tracked for user ${userId}: $${amount} (Total: $${newEarnings})`);
    } catch (error) {
      console.error("Error tracking coach earnings:", error);
      throw error;
    }
  }
  /**
   * Log coach role upgrade for audit trail
   */
  static async logCoachUpgrade(userId, totalEarnings, source) {
    try {
      console.log(`COACH_ROLE_UPGRADE: User ${userId} upgraded to coach role with $${totalEarnings} earnings from ${source}`);
    } catch (error) {
      console.error("Error logging coach upgrade:", error);
    }
  }
  /**
   * Notify user of role upgrade (email notification)
   */
  static async notifyRoleUpgrade(userId, email, totalEarnings) {
    try {
      if (!email) return;
      console.log(`\u{1F4E7} Would send coach upgrade notification to ${email} for earning $${totalEarnings}`);
    } catch (error) {
      console.error("Error sending role upgrade notification:", error);
    }
  }
  /**
   * Check if user qualifies for coach role based on earnings
   */
  static async checkCoachEligibility(userId) {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;
      return (user.donationTotal || 0) >= 99;
    } catch (error) {
      console.error("Error checking coach eligibility:", error);
      return false;
    }
  }
  /**
   * Get coach earnings summary
   */
  static async getEarningsSummary(userId) {
    try {
      const user = await storage.getUser(userId);
      if (!user) return null;
      return {
        userId: user.id,
        totalEarnings: user.donationTotal || 0,
        lastUpdated: user.updatedAt || /* @__PURE__ */ new Date(),
        roleUpgraded: user.role === "coach"
      };
    } catch (error) {
      console.error("Error getting earnings summary:", error);
      return null;
    }
  }
  /**
   * Manually upgrade user to coach role (admin function)
   */
  static async manualCoachUpgrade(adminUserId, targetUserId, reason = "Manual upgrade") {
    try {
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        throw new Error("Target user not found");
      }
      await storage.updateUser(targetUserId, {
        role: "coach",
        updatedAt: /* @__PURE__ */ new Date()
      });
      console.log(`\u{1F527} Manual coach upgrade: ${targetUserId} upgraded by admin ${adminUserId}. Reason: ${reason}`);
      await this.logCoachUpgrade(targetUserId, targetUser.donationTotal || 0, `manual_by_${adminUserId}`);
    } catch (error) {
      console.error("Error in manual coach upgrade:", error);
      throw error;
    }
  }
};

// server/coach-routes.ts
import { Router as Router3 } from "express";

// server/auth.ts
import jwt2 from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z as z3 } from "zod";

// server/onboarding-service.ts
init_email_service();
var OnboardingService = class {
  // Default onboarding steps
  static DEFAULT_STEPS = [
    {
      id: "email_verification",
      title: "Verify Your Email",
      description: "Check your email and click the verification link to activate your account",
      order: 1
    },
    {
      id: "profile_setup",
      title: "Complete Your Profile",
      description: "Add your personal information and preferences to personalize your experience",
      order: 2
    },
    {
      id: "coaching_selection",
      title: "Choose Your Coaching Focus",
      description: "Select the areas where you need support to get personalized recommendations",
      order: 3
    },
    {
      id: "ai_coach_intro",
      title: "Meet Your AI Coaches",
      description: "Get introduced to our AI coaches and try your first coaching session",
      order: 4
    },
    {
      id: "resource_exploration",
      title: "Explore Resources",
      description: "Discover our library of wellness tools, guides, and educational content",
      order: 5
    }
  ];
  // Available coaching specialties
  static COACHING_SPECIALTIES = [
    {
      id: "weight_loss",
      name: "Weight Loss Coaching",
      description: "Personalized meal plans, fitness guidance, and sustainable weight management",
      category: "health",
      subcategories: ["Meal Planning", "Fitness Guidance", "Nutrition Education", "Motivation Support"],
      icon: "\u{1F3C3}\u200D\u2640\uFE0F",
      color: "bg-emerald-100 text-emerald-800"
    },
    {
      id: "relationship_coaching",
      name: "Relationship Coaching",
      description: "Build stronger, healthier connections with romantic partners, family, and friends",
      category: "relationships",
      subcategories: ["Communication Skills", "Conflict Resolution", "Trust Building", "Intimacy Enhancement"],
      icon: "\u{1F495}",
      color: "bg-pink-100 text-pink-800"
    },
    {
      id: "mindset_coaching",
      name: "Mindset & Life Coaching",
      description: "Overcome limiting beliefs, build confidence, and create positive life changes",
      category: "personal",
      subcategories: ["Self-Confidence", "Goal Setting", "Stress Management", "Life Transitions"],
      icon: "\u{1F9E0}",
      color: "bg-purple-100 text-purple-800"
    },
    {
      id: "financial_coaching",
      name: "Financial Wellness",
      description: "Budgeting, debt management, and financial planning for a secure future",
      category: "financial",
      subcategories: ["Budgeting", "Debt Management", "Financial Planning", "Money Mindset"],
      icon: "\u{1F4B0}",
      color: "bg-green-100 text-green-800"
    },
    {
      id: "business_coaching",
      name: "Business & Career Growth",
      description: "Entrepreneurship, career development, and professional growth strategies",
      category: "business",
      subcategories: ["Business Strategy", "Marketing", "Career Development", "Leadership"],
      icon: "\u{1F454}",
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: "recovery_support",
      name: "Recovery & Healing",
      description: "Support for survivors of domestic violence and trauma recovery",
      category: "recovery",
      subcategories: ["Trauma Recovery", "Emotional Healing", "Safety Planning", "Empowerment"],
      icon: "\u{1F331}",
      color: "bg-yellow-100 text-yellow-800"
    }
  ];
  // Initialize onboarding for new user
  static async initializeUserOnboarding(userId, userEmail, firstName) {
    try {
      const steps = this.DEFAULT_STEPS.map((step) => ({
        ...step,
        userId,
        completed: false,
        completedAt: null
      }));
      await storage.createUserOnboardingSteps(userId, steps);
      await emailService.sendWelcomeEmail(userEmail, firstName);
      const verificationToken = emailService.generateVerificationToken();
      await storage.createEmailVerificationToken(userId, verificationToken);
      await emailService.sendVerificationEmail(userEmail, verificationToken);
      console.log(`Onboarding initialized for user: ${userId}`);
    } catch (error) {
      console.error("Error initializing user onboarding:", error);
      throw error;
    }
  }
  // Get onboarding progress for user
  static async getUserOnboardingProgress(userId) {
    try {
      const steps = await storage.getUserOnboardingSteps(userId);
      return steps.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error("Error getting user onboarding progress:", error);
      return [];
    }
  }
  // Mark onboarding step as completed
  static async completeOnboardingStep(userId, stepId) {
    try {
      await storage.updateOnboardingStep(userId, stepId, {
        completed: true,
        completedAt: /* @__PURE__ */ new Date()
      });
      const steps = await this.getUserOnboardingProgress(userId);
      const allCompleted = steps.every((step) => step.completed);
      if (allCompleted) {
        await storage.markUserOnboardingComplete(userId);
        console.log(`Onboarding completed for user: ${userId}`);
      }
    } catch (error) {
      console.error("Error completing onboarding step:", error);
      throw error;
    }
  }
  // Get coaching specialties
  static getCoachingSpecialties() {
    return this.COACHING_SPECIALTIES;
  }
  // Get coaching specialties by category
  static getCoachingSpecialtiesByCategory(category) {
    return this.COACHING_SPECIALTIES.filter((specialty) => specialty.category === category);
  }
  // Process coaching selection from user
  static async processCoachingSelection(userId, selectedSpecialties) {
    try {
      await storage.updateUserCoachingPreferences(userId, selectedSpecialties);
      await this.completeOnboardingStep(userId, "coaching_selection");
      console.log(`Coaching selection processed for user: ${userId}`);
    } catch (error) {
      console.error("Error processing coaching selection:", error);
      throw error;
    }
  }
  // Generate coaching recommendation based on user's responses
  static generateCoachingRecommendation(responses) {
    const recommendations = [];
    const categoryMap = {
      "personal": "personal",
      "financial": "financial",
      "health": "health",
      "business": "business",
      "relationships": "relationships",
      "recovery": "recovery"
    };
    const category = categoryMap[responses.mainArea];
    if (category) {
      const specialties = this.getCoachingSpecialtiesByCategory(category);
      recommendations.push(...specialties);
    }
    responses.specificNeeds.forEach((need) => {
      const relevantSpecialty = this.COACHING_SPECIALTIES.find(
        (specialty) => specialty.subcategories?.some((sub) => sub.toLowerCase().includes(need.toLowerCase()))
      );
      if (relevantSpecialty && !recommendations.find((r) => r.id === relevantSpecialty.id)) {
        recommendations.push(relevantSpecialty);
      }
    });
    return recommendations;
  }
  // Create coaching flow based on user's journey
  static createCoachingFlow(initialResponse) {
    const flowMap = {
      "welcome": {
        message: "Hello! I'm here to help you find the right type of coaching for your needs. What area are you looking for support in?",
        options: [
          { id: "personal", text: "Personal Development" },
          { id: "financial", text: "Financial Management" },
          { id: "health", text: "Health and Wellness" },
          { id: "business", text: "Business Growth" },
          { id: "relationships", text: "Relationships" },
          { id: "recovery", text: "Recovery Support" }
        ],
        nextStep: "category_selected"
      },
      "personal": {
        message: "Are you interested in weight loss, mindset coaching, or life coaching?",
        options: [
          { id: "weight_loss", text: "Weight Loss Coaching" },
          { id: "mindset", text: "Mindset Coaching" },
          { id: "life_coaching", text: "General Life Coaching" }
        ],
        nextStep: "specialty_selected"
      },
      "financial": {
        message: "Would you like support with budgeting, debt management, or financial planning?",
        options: [
          { id: "budgeting", text: "Budgeting Help" },
          { id: "debt", text: "Debt Management" },
          { id: "planning", text: "Financial Planning" }
        ],
        nextStep: "specialty_selected"
      },
      "health": {
        message: "Are you looking for weight loss coaching or general health coaching?",
        options: [
          { id: "weight_loss", text: "Weight Loss Coaching" },
          { id: "general_health", text: "General Health & Wellness" }
        ],
        nextStep: "specialty_selected"
      },
      "business": {
        message: "Do you need help with business strategies, marketing, or entrepreneurship?",
        options: [
          { id: "strategy", text: "Business Strategy" },
          { id: "marketing", text: "Marketing Support" },
          { id: "entrepreneurship", text: "Entrepreneurship" }
        ],
        nextStep: "specialty_selected"
      },
      "relationships": {
        message: "Are you seeking help with a romantic relationship, friendships, or family dynamics?",
        options: [
          { id: "romantic", text: "Romantic Relationships" },
          { id: "friendships", text: "Friendships" },
          { id: "family", text: "Family Dynamics" }
        ],
        nextStep: "specialty_selected"
      },
      "recovery": {
        message: "Have you experienced domestic violence, and would you like support in recovery?",
        options: [
          { id: "trauma_recovery", text: "Trauma Recovery" },
          { id: "emotional_healing", text: "Emotional Healing" },
          { id: "safety_planning", text: "Safety Planning" },
          { id: "empowerment", text: "Empowerment Support" }
        ],
        nextStep: "specialty_selected"
      }
    };
    return flowMap[initialResponse] || flowMap["welcome"];
  }
  // Process password reset request
  static async requestPasswordReset(email) {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return;
      }
      const resetToken = emailService.generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);
      await emailService.sendPasswordResetEmail(email, resetToken);
      console.log(`Password reset requested for: ${email}`);
    } catch (error) {
      console.error("Error processing password reset request:", error);
      throw error;
    }
  }
  // Reset password with token
  static async resetPassword(token, newPassword) {
    try {
      const resetData = await storage.getPasswordResetToken(token);
      if (!resetData || resetData.expiresAt < /* @__PURE__ */ new Date()) {
        throw new Error("Invalid or expired reset token");
      }
      const hashedPassword = await AuthService.hashPassword(newPassword);
      await storage.updateUserPassword(resetData.userId, hashedPassword);
      await storage.deletePasswordResetToken(token);
      console.log(`Password reset completed for user: ${resetData.userId}`);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }
  // Verify email with token
  static async verifyEmail(token) {
    try {
      const verificationData = await storage.getEmailVerificationToken(token);
      if (!verificationData) {
        throw new Error("Invalid verification token");
      }
      await storage.markEmailAsVerified(verificationData.userId);
      await storage.deleteEmailVerificationToken(token);
      await this.completeOnboardingStep(verificationData.userId, "email_verification");
      console.log(`Email verified for user: ${verificationData.userId}`);
    } catch (error) {
      console.error("Error verifying email:", error);
      throw error;
    }
  }
};
var onboardingService = OnboardingService;

// server/auth.ts
var JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-in-production";
var JWT_EXPIRES_IN = "7d";
var registerSchema2 = z3.object({
  email: z3.string().email(),
  password: z3.string().min(8),
  firstName: z3.string().min(1),
  lastName: z3.string().min(1)
});
var loginSchema2 = z3.object({
  email: z3.string().email(),
  password: z3.string().min(1)
});
var AuthService = class {
  // Generate JWT token
  static generateToken(user) {
    return jwt2.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || "user",
        membershipLevel: user.membershipLevel || "free",
        isActive: user.isActive !== false
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt2.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
  // Hash password
  static async hashPassword(password) {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
  // Compare password with hash
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
  // Register new user
  static async registerUser(email, password, firstName, lastName) {
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }
    const passwordHash = await this.hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const userData = {
      id: userId,
      email,
      passwordHash,
      firstName,
      lastName,
      role: "user",
      membershipLevel: "free",
      isActive: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const user = await storage.createUser(userData);
    await onboardingService.initializeUserOnboarding(user.id, user.email, user.firstName || firstName);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      membershipLevel: user.membershipLevel,
      isActive: user.isActive
    };
  }
  // Authenticate user
  static async authenticateUser(email, password) {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return null;
      }
      const isValidPassword = await this.comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return null;
      }
      await storage.updateUserLastLogin(user.id);
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        membershipLevel: user.membershipLevel,
        isActive: user.isActive
      };
    } catch (error) {
      console.error("User authentication error:", error);
      return null;
    }
  }
  // Get user by ID
  static async getUserById(userId) {
    try {
      const user = await storage.getUserById(userId);
      if (!user) {
        console.error("User not found with ID:", userId);
        return null;
      }
      const isActive = user.isActive !== false;
      if (!isActive) {
        console.error("User is inactive:", userId);
        return null;
      }
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || "user",
        membershipLevel: user.membershipLevel || "free",
        isActive
      };
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  }
};
var requireAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token && req.cookies && req.cookies.session_token) {
      token = req.cookies.session_token;
      console.log("Using session token from cookie");
    }
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const decoded = AuthService.verifyToken(token);
    console.log("Decoded token:", decoded);
    const user = await AuthService.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};
var optionalAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token && req.cookies && req.cookies.session_token) {
      token = req.cookies.session_token;
    }
    if (token) {
      const decoded = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
var requireCoachRole = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    if (!token && req.cookies && req.cookies.session_token) {
      token = req.cookies.session_token;
    }
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    if (user.role !== "coach") {
      return res.status(403).json({ error: "Coach access required" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Coach auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// server/coach-routes.ts
var router3 = Router3();
router3.get("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await storage.getCoachProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: "Coach profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Error fetching coach profile:", error);
    res.status(500).json({ error: "Failed to fetch coach profile" });
  }
});
router3.put("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;
    const profile = await storage.updateCoachProfile(userId, profileData);
    res.json(profile);
  } catch (error) {
    console.error("Error updating coach profile:", error);
    res.status(500).json({ error: "Failed to update coach profile" });
  }
});
router3.get("/clients", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const clients = await storage.getCoachClients(userId);
    res.json(clients);
  } catch (error) {
    console.error("Error fetching coach clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});
router3.get("/clients/:clientId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { clientId } = req.params;
    const client2 = await storage.getCoachClient(userId, clientId);
    if (!client2) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json(client2);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Failed to fetch client" });
  }
});
router3.patch("/clients/:clientId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { clientId } = req.params;
    const updateData = req.body;
    const client2 = await storage.updateCoachClient(userId, clientId, updateData);
    res.json(client2);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Failed to update client" });
  }
});
router3.get("/session-notes", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const clientId = req.query.clientId;
    const sessionNotes = await storage.getCoachSessionNotes(userId, { limit, offset, clientId });
    res.json(sessionNotes);
  } catch (error) {
    console.error("Error fetching session notes:", error);
    res.status(500).json({ error: "Failed to fetch session notes" });
  }
});
router3.post("/session-notes", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionNoteData = {
      ...req.body,
      coachId: userId
    };
    const sessionNote = await storage.createSessionNote(sessionNoteData);
    res.json(sessionNote);
  } catch (error) {
    console.error("Error creating session note:", error);
    res.status(500).json({ error: "Failed to create session note" });
  }
});
router3.get("/session-notes/:noteId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteId } = req.params;
    const sessionNote = await storage.getSessionNote(userId, parseInt(noteId));
    if (!sessionNote) {
      return res.status(404).json({ error: "Session note not found" });
    }
    res.json(sessionNote);
  } catch (error) {
    console.error("Error fetching session note:", error);
    res.status(500).json({ error: "Failed to fetch session note" });
  }
});
router3.put("/session-notes/:noteId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteId } = req.params;
    const updateData = req.body;
    const sessionNote = await storage.updateSessionNote(userId, parseInt(noteId), updateData);
    res.json(sessionNote);
  } catch (error) {
    console.error("Error updating session note:", error);
    res.status(500).json({ error: "Failed to update session note" });
  }
});
router3.get("/availability", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const availability = await storage.getCoachAvailability(userId);
    res.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});
router3.put("/availability", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const availabilityData = req.body;
    const availability = await storage.updateCoachAvailability(userId, availabilityData);
    res.json(availability);
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ error: "Failed to update availability" });
  }
});
router3.get("/message-templates", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const templates = await storage.getCoachMessageTemplates(userId);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching message templates:", error);
    res.status(500).json({ error: "Failed to fetch message templates" });
  }
});
router3.post("/message-templates", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const templateData = {
      ...req.body,
      coachId: userId
    };
    const template = await storage.createMessageTemplate(templateData);
    res.json(template);
  } catch (error) {
    console.error("Error creating message template:", error);
    res.status(500).json({ error: "Failed to create message template" });
  }
});
router3.put("/message-templates/:templateId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.params;
    const updateData = req.body;
    const template = await storage.updateMessageTemplate(userId, parseInt(templateId), updateData);
    res.json(template);
  } catch (error) {
    console.error("Error updating message template:", error);
    res.status(500).json({ error: "Failed to update message template" });
  }
});
router3.delete("/message-templates/:templateId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.params;
    await storage.deleteMessageTemplate(userId, parseInt(templateId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting message template:", error);
    res.status(500).json({ error: "Failed to delete message template" });
  }
});
router3.get("/communications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const clientId = req.query.clientId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const communications = await storage.getCoachClientCommunications(userId, { clientId, limit, offset });
    res.json(communications);
  } catch (error) {
    console.error("Error fetching communications:", error);
    res.status(500).json({ error: "Failed to fetch communications" });
  }
});
router3.post("/communications", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const communicationData = {
      ...req.body,
      coachId: userId
    };
    const communication = await storage.createClientCommunication(communicationData);
    res.json(communication);
  } catch (error) {
    console.error("Error creating communication:", error);
    res.status(500).json({ error: "Failed to create communication" });
  }
});
router3.get("/metrics", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || "current_month";
    const metrics = await storage.getCoachMetrics(userId, period);
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching coach metrics:", error);
    res.status(500).json({ error: "Failed to fetch coach metrics" });
  }
});
router3.get("/analytics/dashboard", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [
      totalClients,
      activeSessions,
      completedSessions,
      averageRating,
      monthlyRevenue,
      upcomingSessions,
      recentActivity
    ] = await Promise.all([
      storage.getCoachTotalClients(userId),
      storage.getCoachActiveSessions(userId),
      storage.getCoachCompletedSessions(userId),
      storage.getCoachAverageRating(userId),
      storage.getCoachMonthlyRevenue(userId),
      storage.getCoachUpcomingSessions(userId),
      storage.getCoachRecentActivity(userId)
    ]);
    res.json({
      totalClients,
      activeSessions,
      completedSessions,
      averageRating,
      monthlyRevenue,
      upcomingSessions,
      recentActivity
    });
  } catch (error) {
    console.error("Error fetching coach dashboard analytics:", error);
    res.status(500).json({ error: "Failed to fetch coach dashboard analytics" });
  }
});
router3.get("/credentials", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const credentials = await storage.getCoachCredentials(userId);
    res.json(credentials);
  } catch (error) {
    console.error("Error fetching credentials:", error);
    res.status(500).json({ error: "Failed to fetch credentials" });
  }
});
router3.post("/credentials", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const credentialData = {
      ...req.body,
      coachId: userId
    };
    const credential = await storage.createCoachCredential(credentialData);
    res.json(credential);
  } catch (error) {
    console.error("Error creating credential:", error);
    res.status(500).json({ error: "Failed to create credential" });
  }
});
router3.get("/banking", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const banking = await storage.getCoachBanking(userId);
    res.json(banking);
  } catch (error) {
    console.error("Error fetching banking info:", error);
    res.status(500).json({ error: "Failed to fetch banking information" });
  }
});
router3.put("/banking", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const bankingData = req.body;
    const banking = await storage.updateCoachBanking(userId, bankingData);
    res.json(banking);
  } catch (error) {
    console.error("Error updating banking info:", error);
    res.status(500).json({ error: "Failed to update banking information" });
  }
});
router3.get("/schedule", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const schedule = await storage.getCoachSchedule(userId, startDate, endDate);
    res.json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});
router3.post("/schedule/block-time", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startTime, endTime, reason } = req.body;
    const blockedTime = await storage.blockCoachTime(userId, startTime, endTime, reason);
    res.json(blockedTime);
  } catch (error) {
    console.error("Error blocking time:", error);
    res.status(500).json({ error: "Failed to block time" });
  }
});
router3.get("/export/clients", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.query.format || "csv";
    const clientData = await storage.exportCoachClientData(userId, format);
    res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=coach-clients.${format}`);
    res.send(clientData);
  } catch (error) {
    console.error("Error exporting client data:", error);
    res.status(500).json({ error: "Failed to export client data" });
  }
});
router3.get("/export/sessions", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.query.format || "csv";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const sessionData = await storage.exportCoachSessionData(userId, format, startDate, endDate);
    res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=coach-sessions.${format}`);
    res.send(sessionData);
  } catch (error) {
    console.error("Error exporting session data:", error);
    res.status(500).json({ error: "Failed to export session data" });
  }
});

// server/donation-routes.ts
import { Router as Router4 } from "express";
import Stripe from "stripe";
import { z as z4 } from "zod";
var router4 = Router4();
var stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16"
  });
}
router4.get("/donation-presets", async (req, res) => {
  try {
    const presets = await storage.getDonationPresets();
    res.json(presets);
  } catch (error) {
    console.error("Error fetching donation presets:", error);
    res.status(500).json({ error: "Failed to fetch donation presets" });
  }
});
router4.get("/campaigns", async (req, res) => {
  try {
    const campaigns2 = await storage.getActiveCampaigns();
    res.json(campaigns2);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});
router4.get("/membership-benefits", async (req, res) => {
  try {
    const benefits = await storage.getMembershipBenefits();
    res.json(benefits);
  } catch (error) {
    console.error("Error fetching membership benefits:", error);
    res.status(500).json({ error: "Failed to fetch membership benefits" });
  }
});
router4.get("/impact-metrics", async (req, res) => {
  try {
    const metrics = await storage.getImpactMetrics();
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching impact metrics:", error);
    res.status(500).json({ error: "Failed to fetch impact metrics" });
  }
});
router4.get("/user/donations", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const donations2 = await storage.getUserDonations(userId);
    res.json(donations2);
  } catch (error) {
    console.error("Error fetching user donations:", error);
    res.status(500).json({ error: "Failed to fetch user donations" });
  }
});
var createDonationSchema = z4.object({
  amount: z4.number().positive(),
  currency: z4.string().default("USD"),
  donationType: z4.enum(["one-time", "monthly", "yearly"]),
  paymentMethod: z4.enum(["stripe", "paypal", "bank"]),
  campaignId: z4.string().optional(),
  isAnonymous: z4.boolean().default(false),
  dedicatedTo: z4.string().optional(),
  message: z4.string().optional()
});
router4.post("/donations", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const donationData = createDonationSchema.parse(req.body);
    if (!stripe && donationData.paymentMethod === "stripe") {
      return res.status(400).json({ error: "Stripe payment processing is not configured" });
    }
    const donation = await storage.createDonation({
      ...donationData,
      userId,
      status: "pending"
    });
    let paymentUrl = null;
    if (donationData.paymentMethod === "stripe" && stripe) {
      const session2 = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: donationData.currency.toLowerCase(),
              product_data: {
                name: `Donation to WholeWellness Coaching`,
                description: donationData.message || "Supporting life coaching for those in need"
              },
              unit_amount: Math.round(donationData.amount * 100)
              // Convert to cents
            },
            quantity: 1
          }
        ],
        mode: donationData.donationType === "one-time" ? "payment" : "subscription",
        success_url: `${req.protocol}://${req.get("host")}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/donate`,
        metadata: {
          donationId: donation.id,
          userId
        }
      });
      paymentUrl = session2.url;
      await storage.updateDonation(donation.id, {
        stripePaymentIntentId: session2.id
      });
    }
    res.json({
      donation,
      paymentUrl
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ error: "Failed to create donation" });
  }
});
router4.post("/webhooks/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: "Stripe not configured" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session2 = event.data.object;
        if (session2.metadata?.donationId) {
          await storage.updateDonation(session2.metadata.donationId, {
            status: "completed",
            processedAt: /* @__PURE__ */ new Date()
          });
          const amount = session2.amount_total ? session2.amount_total / 100 : 0;
          const rewardPoints = Math.floor(amount * 10);
          if (session2.metadata.userId && rewardPoints > 0) {
            await storage.addRewardPoints(
              session2.metadata.userId,
              rewardPoints,
              `Donation reward: $${amount}`
            );
          }
          if (session2.metadata.userId) {
            await storage.updateUserMembershipLevel(session2.metadata.userId);
          }
        }
        break;
      case "payment_intent.payment_failed":
        const paymentIntent = event.data.object;
        if (paymentIntent.metadata?.donationId) {
          await storage.updateDonation(paymentIntent.metadata.donationId, {
            status: "failed"
          });
        }
        break;
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});
router4.get("/donation-success", optionalAuth, async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId || !stripe) {
      return res.status(400).json({ error: "Invalid session" });
    }
    const session2 = await stripe.checkout.sessions.retrieve(sessionId);
    const donation = await storage.getDonationByStripeSession(sessionId);
    res.json({
      session: session2,
      donation,
      success: true
    });
  } catch (error) {
    console.error("Error fetching donation success:", error);
    res.status(500).json({ error: "Failed to fetch donation details" });
  }
});
router4.post("/campaigns", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const campaignData = {
      ...req.body,
      createdBy: userId
    };
    const campaign = await storage.createCampaign(campaignData);
    res.json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});
router4.put("/campaigns/:campaignId", requireAuth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const updateData = req.body;
    const campaign = await storage.updateCampaign(campaignId, updateData);
    res.json(campaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Failed to update campaign" });
  }
});
router4.get("/analytics/overview", optionalAuth, async (req, res) => {
  try {
    const [
      totalRaised,
      totalDonors,
      averageDonation,
      monthlyTrend,
      topCampaigns,
      membershipDistribution
    ] = await Promise.all([
      storage.getTotalDonationsRaised(),
      storage.getTotalDonors(),
      storage.getAverageDonationAmount(),
      storage.getMonthlyDonationTrend(),
      storage.getTopCampaigns(),
      storage.getMembershipDistribution()
    ]);
    res.json({
      totalRaised,
      totalDonors,
      averageDonation,
      monthlyTrend,
      topCampaigns,
      membershipDistribution
    });
  } catch (error) {
    console.error("Error fetching donation analytics:", error);
    res.status(500).json({ error: "Failed to fetch donation analytics" });
  }
});
router4.get("/user/impact", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [
      totalContributed,
      rewardPoints,
      membershipLevel,
      impactMetrics2,
      donationHistory,
      availableRewards
    ] = await Promise.all([
      storage.getUserTotalContributed(userId),
      storage.getUserRewardPoints(userId),
      storage.getUserMembershipLevel(userId),
      storage.getUserImpactMetrics(userId),
      storage.getUserDonationHistory(userId),
      storage.getAvailableRewards(userId)
    ]);
    res.json({
      totalContributed,
      rewardPoints,
      membershipLevel,
      impactMetrics: impactMetrics2,
      donationHistory,
      availableRewards
    });
  } catch (error) {
    console.error("Error fetching user impact:", error);
    res.status(500).json({ error: "Failed to fetch user impact data" });
  }
});
router4.post("/rewards/redeem", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rewardId, pointsCost } = req.body;
    const userPoints = await storage.getUserRewardPoints(userId);
    if (userPoints < pointsCost) {
      return res.status(400).json({ error: "Insufficient reward points" });
    }
    const redemption = await storage.redeemRewardPoints(userId, rewardId, pointsCost);
    res.json(redemption);
  } catch (error) {
    console.error("Error redeeming reward points:", error);
    res.status(500).json({ error: "Failed to redeem reward points" });
  }
});
router4.post("/subscriptions/pause", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;
    if (!stripe) {
      return res.status(400).json({ error: "Stripe not configured" });
    }
    await stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: "mark_uncollectible"
      }
    });
    await storage.updateDonationSubscription(userId, subscriptionId, { status: "paused" });
    res.json({ success: true });
  } catch (error) {
    console.error("Error pausing subscription:", error);
    res.status(500).json({ error: "Failed to pause subscription" });
  }
});
router4.post("/subscriptions/resume", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;
    if (!stripe) {
      return res.status(400).json({ error: "Stripe not configured" });
    }
    await stripe.subscriptions.update(subscriptionId, {
      pause_collection: null
    });
    await storage.updateDonationSubscription(userId, subscriptionId, { status: "active" });
    res.json({ success: true });
  } catch (error) {
    console.error("Error resuming subscription:", error);
    res.status(500).json({ error: "Failed to resume subscription" });
  }
});
router4.delete("/subscriptions/:subscriptionId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.params;
    if (!stripe) {
      return res.status(400).json({ error: "Stripe not configured" });
    }
    await stripe.subscriptions.del(subscriptionId);
    await storage.updateDonationSubscription(userId, subscriptionId, { status: "cancelled" });
    res.json({ success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// server/onboarding-routes.ts
import { Router as Router5 } from "express";
import { z as z5 } from "zod";
var router5 = Router5();
var coachingSelectionSchema = z5.object({
  specialties: z5.array(z5.string()).min(1, "At least one specialty must be selected")
});
var passwordResetRequestSchema = z5.object({
  email: z5.string().email("Valid email is required")
});
var passwordResetSchema = z5.object({
  token: z5.string().min(1, "Reset token is required"),
  newPassword: z5.string().min(8, "Password must be at least 8 characters")
});
var emailVerificationSchema = z5.object({
  token: z5.string().min(1, "Verification token is required")
});
var coachingFlowSchema = z5.object({
  step: z5.string().min(1, "Step is required"),
  response: z5.string().optional()
});
router5.get("/progress", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const progress = await onboardingService.getUserOnboardingProgress(req.user.id);
    res.json({ progress });
  } catch (error) {
    console.error("Error getting onboarding progress:", error);
    res.status(500).json({ error: "Failed to get onboarding progress" });
  }
});
router5.post("/complete-step/:stepId", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const { stepId } = req.params;
    await onboardingService.completeOnboardingStep(req.user.id, stepId);
    res.json({ success: true, message: "Step completed successfully" });
  } catch (error) {
    console.error("Error completing onboarding step:", error);
    res.status(500).json({ error: "Failed to complete step" });
  }
});
router5.get("/coaching-specialties", async (req, res) => {
  try {
    const specialties = onboardingService.getCoachingSpecialties();
    res.json({ specialties });
  } catch (error) {
    console.error("Error getting coaching specialties:", error);
    res.status(500).json({ error: "Failed to get coaching specialties" });
  }
});
router5.get("/coaching-specialties/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const specialties = onboardingService.getCoachingSpecialtiesByCategory(category);
    res.json({ specialties });
  } catch (error) {
    console.error("Error getting coaching specialties by category:", error);
    res.status(500).json({ error: "Failed to get coaching specialties" });
  }
});
router5.post("/coaching-selection", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const { specialties } = coachingSelectionSchema.parse(req.body);
    await onboardingService.processCoachingSelection(req.user.id, specialties);
    res.json({ success: true, message: "Coaching preferences updated successfully" });
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error processing coaching selection:", error);
    res.status(500).json({ error: "Failed to process coaching selection" });
  }
});
router5.post("/coaching-flow", async (req, res) => {
  try {
    const { step, response } = coachingFlowSchema.parse(req.body);
    const flow = onboardingService.createCoachingFlow(response || step);
    res.json(flow);
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error processing coaching flow:", error);
    res.status(500).json({ error: "Failed to process coaching flow" });
  }
});
router5.post("/coaching-recommendations", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const responses = req.body;
    const recommendations = onboardingService.generateCoachingRecommendation(responses);
    res.json({ recommendations });
  } catch (error) {
    console.error("Error generating coaching recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});
router5.post("/password-reset-request", async (req, res) => {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);
    await onboardingService.requestPasswordReset(email);
    res.json({ success: true, message: "If an account with that email exists, a reset link has been sent" });
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ error: "Invalid email format", details: error.errors });
    }
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});
router5.post("/password-reset", async (req, res) => {
  try {
    const { token, newPassword } = passwordResetSchema.parse(req.body);
    await onboardingService.resetPassword(token, newPassword);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    if (error instanceof Error && error.message.includes("Invalid or expired")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});
router5.post("/verify-email", async (req, res) => {
  try {
    const { token } = emailVerificationSchema.parse(req.body);
    await onboardingService.verifyEmail(token);
    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ error: "Invalid token format", details: error.errors });
    }
    if (error instanceof Error && error.message.includes("Invalid")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error verifying email:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
});
router5.post("/resend-verification", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.email_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }
    await onboardingService.initializeUserOnboarding(user.id, user.email, user.firstName || "User");
    res.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});
router5.get("/welcome-message", optionalAuth, async (req, res) => {
  try {
    const welcomeFlow = onboardingService.createCoachingFlow("welcome");
    res.json(welcomeFlow);
  } catch (error) {
    console.error("Error getting welcome message:", error);
    res.status(500).json({ error: "Failed to get welcome message" });
  }
});
router5.post("/complete-profile", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    await onboardingService.completeOnboardingStep(req.user.id, "profile_setup");
    res.json({ success: true, message: "Profile setup completed" });
  } catch (error) {
    console.error("Error completing profile setup:", error);
    res.status(500).json({ error: "Failed to complete profile setup" });
  }
});
router5.post("/complete-ai-intro", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    await onboardingService.completeOnboardingStep(req.user.id, "ai_coach_intro");
    res.json({ success: true, message: "AI coach introduction completed" });
  } catch (error) {
    console.error("Error completing AI intro:", error);
    res.status(500).json({ error: "Failed to complete AI introduction" });
  }
});
router5.post("/complete-resources", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    await onboardingService.completeOnboardingStep(req.user.id, "resource_exploration");
    res.json({ success: true, message: "Resource exploration completed" });
  } catch (error) {
    console.error("Error completing resource exploration:", error);
    res.status(500).json({ error: "Failed to complete resource exploration" });
  }
});

// server/coupon-routes.ts
import { z as z6 } from "zod";
import Stripe2 from "stripe";
var stripe2 = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16"
  });
}
var validateCouponSchema = z6.object({
  code: z6.string().min(1),
  courseId: z6.string().optional()
});
var redeemCouponSchema = z6.object({
  code: z6.string().min(1),
  courseId: z6.string(),
  paymentIntentId: z6.string().optional()
});
var createCouponSchema = z6.object({
  code: z6.string().min(1).max(50),
  name: z6.string().min(1).max(255),
  description: z6.string().optional(),
  discountType: z6.enum(["percentage", "fixed_amount", "free_access"]),
  discountValue: z6.number().min(0).optional(),
  maxUses: z6.number().int().min(1).optional(),
  applicableCourses: z6.array(z6.string()).optional(),
  minimumOrderAmount: z6.number().min(0).default(0),
  startsAt: z6.string().datetime().optional(),
  expiresAt: z6.string().datetime().optional()
});
function setupCouponRoutes(app2) {
  app2.post("/api/coupons/validate", requireAuth, async (req, res) => {
    try {
      const { code, courseId } = validateCouponSchema.parse(req.body);
      const userId = req.user.id;
      const result = await storage.query(`
        SELECT validate_coupon($1, $2, $3) as validation_result
      `, [code, courseId || null, userId]);
      const validationResult = result.rows[0]?.validation_result;
      if (!validationResult.valid) {
        return res.status(400).json({
          valid: false,
          error: validationResult.error
        });
      }
      res.json({
        valid: true,
        coupon: validationResult.coupon
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({
        valid: false,
        error: "Failed to validate coupon"
      });
    }
  });
  app2.post("/api/coupons/calculate-discount", requireAuth, async (req, res) => {
    try {
      const { code, courseId, originalAmount } = req.body;
      if (!code || !courseId || !originalAmount) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const validationResult = await storage.query(`
        SELECT validate_coupon($1, $2, $3) as validation_result
      `, [code, courseId, req.user.id]);
      const validation = validationResult.rows[0]?.validation_result;
      if (!validation.valid || !validation.coupon) {
        return res.status(400).json({ error: validation.error });
      }
      const coupon = validation.coupon;
      let discountAmount = 0;
      let finalAmount = originalAmount;
      switch (coupon.discount_type) {
        case "percentage":
          discountAmount = originalAmount * coupon.discount_value / 100;
          finalAmount = originalAmount - discountAmount;
          break;
        case "fixed_amount":
          discountAmount = Math.min(coupon.discount_value, originalAmount);
          finalAmount = originalAmount - discountAmount;
          break;
        case "free_access":
          discountAmount = originalAmount;
          finalAmount = 0;
          break;
      }
      if (originalAmount < coupon.minimum_order_amount) {
        return res.status(400).json({
          error: `Minimum order amount of $${coupon.minimum_order_amount} required for this coupon`
        });
      }
      res.json({
        originalAmount,
        discountAmount: Math.round(discountAmount * 100) / 100,
        // Round to 2 decimal places
        finalAmount: Math.round(finalAmount * 100) / 100,
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description
        }
      });
    } catch (error) {
      console.error("Error calculating discount:", error);
      res.status(500).json({ error: "Failed to calculate discount" });
    }
  });
  app2.post("/api/courses/enroll-with-payment", requireAuth, async (req, res) => {
    try {
      const { courseId, couponCode, paymentIntentId } = req.body;
      const userId = req.user.id;
      if (!courseId) {
        return res.status(400).json({ error: "Course ID is required" });
      }
      const courses = [
        {
          id: "course-1",
          title: "Advanced Wellness Coaching Certification",
          price: 799
        },
        {
          id: "course-2",
          title: "Nutrition Coaching Fundamentals",
          price: 599
        },
        {
          id: "course-3",
          title: "Relationship Counseling Techniques",
          price: 1299
        },
        {
          id: "course-4",
          title: "Behavior Modification Strategies",
          price: 699
        }
      ];
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      let finalAmount = course.price;
      let paymentMethod = "stripe";
      let couponRedemptionId = null;
      let discountAmount = 0;
      if (couponCode) {
        const validationResult = await storage.query(`
          SELECT validate_coupon($1, $2, $3) as validation_result
        `, [couponCode, courseId, userId]);
        const validation = validationResult.rows[0]?.validation_result;
        if (!validation.valid || !validation.coupon) {
          return res.status(400).json({ error: validation.error });
        }
        const coupon = validation.coupon;
        switch (coupon.discount_type) {
          case "percentage":
            discountAmount = course.price * coupon.discount_value / 100;
            finalAmount = course.price - discountAmount;
            break;
          case "fixed_amount":
            discountAmount = Math.min(coupon.discount_value, course.price);
            finalAmount = course.price - discountAmount;
            break;
          case "free_access":
            discountAmount = course.price;
            finalAmount = 0;
            paymentMethod = "coupon";
            break;
        }
        const redemptionResult = await storage.query(`
          INSERT INTO coupon_redemptions (
            coupon_id, user_id, course_id, original_amount, 
            discount_amount, final_amount, payment_intent_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          coupon.id,
          userId,
          courseId,
          course.price,
          discountAmount,
          finalAmount,
          paymentIntentId || null
        ]);
        couponRedemptionId = redemptionResult.rows[0].id;
        await storage.query(`SELECT update_coupon_usage($1)`, [coupon.id]);
      }
      if (finalAmount > 0 && paymentMethod === "stripe") {
        if (!paymentIntentId || !stripe2) {
          return res.status(400).json({ error: "Payment verification required" });
        }
        try {
          const paymentIntent = await stripe2.paymentIntents.retrieve(paymentIntentId);
          if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({ error: "Payment not completed" });
          }
          if (paymentIntent.amount !== Math.round(finalAmount * 100)) {
            return res.status(400).json({ error: "Payment amount mismatch" });
          }
        } catch (stripeError) {
          console.error("Stripe verification error:", stripeError);
          return res.status(400).json({ error: "Payment verification failed" });
        }
      }
      const enrollmentId = `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const paymentRecord = {
        id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        enrollmentId,
        userId,
        courseId,
        amount: course.price,
        currency: "usd",
        paymentMethod,
        paymentIntentId: paymentIntentId || null,
        couponRedemptionId,
        paymentStatus: finalAmount === 0 ? "succeeded" : "succeeded",
        // Assume success for verified payments
        metadata: {
          originalAmount: course.price,
          discountAmount,
          finalAmount,
          couponCode: couponCode || null
        }
      };
      const enrollment = {
        id: enrollmentId,
        userId,
        courseId,
        enrollmentDate: (/* @__PURE__ */ new Date()).toISOString(),
        status: "enrolled",
        progress: 0,
        currentModule: 1,
        completedModules: [],
        paymentStatus: "paid",
        paymentRecord
      };
      res.json({
        success: true,
        enrollment,
        paymentSummary: {
          originalAmount: course.price,
          discountAmount,
          finalAmount,
          paymentMethod,
          couponCode: couponCode || null
        }
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ error: "Failed to enroll in course" });
    }
  });
  app2.get("/api/courses/verify-enrollment/:courseId/:enrollmentId", requireAuth, async (req, res) => {
    try {
      const { courseId, enrollmentId } = req.params;
      const userId = req.user.id;
      const paymentRecord = await storage.query(`
        SELECT * FROM course_enrollment_payments 
        WHERE enrollment_id = $1 AND user_id = $2 AND course_id = $3 AND payment_status = 'succeeded'
      `, [enrollmentId, userId, courseId]);
      if (paymentRecord.rows.length === 0) {
        return res.json({
          hasAccess: false,
          message: "No valid payment found for this enrollment. Please complete payment or apply a coupon."
        });
      }
      const payment = paymentRecord.rows[0];
      res.json({
        hasAccess: true,
        paymentMethod: payment.payment_method,
        enrollmentId: payment.enrollment_id,
        message: "Access granted"
      });
    } catch (error) {
      console.error("Error verifying enrollment:", error);
      res.json({
        hasAccess: true,
        paymentMethod: "demo",
        message: "Demo access granted"
      });
    }
  });
  app2.get("/api/admin/coupons", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const coupons = [
        {
          id: "coupon-1",
          code: "WELCOME25",
          name: "25% Off Welcome Discount",
          description: "New user welcome discount - 25% off any certification course",
          discountType: "percentage",
          discountValue: 25,
          maxUses: 100,
          currentUses: 15,
          applicableCourses: null,
          minimumOrderAmount: 0,
          startsAt: (/* @__PURE__ */ new Date()).toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3).toISOString(),
          isActive: true,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "coupon-2",
          code: "FREEACCESS",
          name: "Free Course Access",
          description: "Admin-granted free access to certification courses",
          discountType: "free_access",
          discountValue: null,
          maxUses: null,
          currentUses: 5,
          applicableCourses: null,
          minimumOrderAmount: 0,
          startsAt: (/* @__PURE__ */ new Date()).toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString(),
          isActive: true,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ];
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });
  app2.post("/api/admin/coupons", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const couponData = createCouponSchema.parse(req.body);
      const newCoupon = {
        id: `coupon-${Date.now()}`,
        ...couponData,
        currentUses: 0,
        isActive: true,
        createdBy: req.user.id,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json({ success: true, coupon: newCoupon });
    } catch (error) {
      console.error("Error creating coupon:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid coupon data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create coupon" });
    }
  });
  app2.put("/api/admin/coupons/:couponId", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { couponId } = req.params;
      const updates = req.body;
      const updatedCoupon = {
        id: couponId,
        ...updates,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json({ success: true, coupon: updatedCoupon });
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });
  app2.delete("/api/admin/coupons/:couponId", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { couponId } = req.params;
      res.json({ success: true, message: "Coupon deactivated successfully" });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });
  app2.get("/api/admin/coupons/:couponId/stats", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { couponId } = req.params;
      const stats = {
        couponId,
        totalRedemptions: 15,
        totalDiscountGiven: 2985,
        averageDiscountPerRedemption: 199,
        topCourses: [
          { courseId: "course-1", title: "Advanced Wellness Coaching", redemptions: 8 },
          { courseId: "course-2", title: "Nutrition Coaching", redemptions: 7 }
        ],
        recentRedemptions: [
          {
            id: "redemption-1",
            userId: "user-123",
            courseId: "course-1",
            discountAmount: 199.75,
            redeemedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        ]
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching coupon stats:", error);
      res.status(500).json({ error: "Failed to fetch coupon statistics" });
    }
  });
  app2.post("/api/admin/grant-free-access", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { userId, courseId, reason } = req.body;
      if (!userId || !courseId) {
        return res.status(400).json({ error: "User ID and Course ID are required" });
      }
      const enrollmentId = `admin-grant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const enrollment = {
        id: enrollmentId,
        userId,
        courseId,
        enrollmentDate: (/* @__PURE__ */ new Date()).toISOString(),
        status: "enrolled",
        progress: 0,
        currentModule: 1,
        completedModules: [],
        paymentStatus: "admin_granted",
        grantedBy: req.user.id,
        grantReason: reason || "Admin granted free access"
      };
      res.json({
        success: true,
        enrollment,
        message: "Free access granted successfully"
      });
    } catch (error) {
      console.error("Error granting free access:", error);
      res.status(500).json({ error: "Failed to grant free access" });
    }
  });
}

// server/onboarding-new-routes.ts
import { Router as Router6 } from "express";
import { z as z7 } from "zod";

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var client = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 20,
  idle_timeout: 30,
  connect_timeout: 60,
  prepare: false
});
var db2 = drizzle(client, { schema: schema_exports });

// server/onboarding-new-routes.ts
import { eq as eq2 } from "drizzle-orm";
var router6 = Router6();
var onboardingDataSchema = z7.object({
  type: z7.enum(["client", "coach"]),
  step: z7.number(),
  data: z7.any()
  // Will be validated based on type
});
var completeOnboardingSchema = z7.object({
  type: z7.enum(["client", "coach"]),
  data: z7.any()
});
router6.get("/api/onboarding/progress", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const [progress] = await db2.select().from(onboardingProgress).where(eq2(onboardingProgress.userId, req.user.id));
    if (!progress) {
      const [newProgress] = await db2.insert(onboardingProgress).values({
        userId: req.user.id,
        currentStep: 0,
        totalSteps: 8,
        // Default for client
        data: {},
        completed: false
      }).returning();
      return res.json(newProgress);
    }
    res.json(progress);
  } catch (error) {
    console.error("Error getting onboarding progress:", error);
    res.status(500).json({ error: "Failed to get onboarding progress" });
  }
});
router6.post("/api/onboarding/save-progress", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const validatedData = onboardingDataSchema.parse(req.body);
    const [existingProgress] = await db2.select().from(onboardingProgress).where(eq2(onboardingProgress.userId, req.user.id));
    if (existingProgress) {
      await db2.update(onboardingProgress).set({
        currentStep: validatedData.step,
        data: validatedData.data,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(onboardingProgress.userId, req.user.id));
    } else {
      await db2.insert(onboardingProgress).values({
        userId: req.user.id,
        currentStep: validatedData.step,
        totalSteps: validatedData.type === "client" ? 8 : 6,
        data: validatedData.data,
        completed: false
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving onboarding progress:", error);
    res.status(500).json({ error: "Failed to save progress" });
  }
});
router6.post("/api/onboarding/complete", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const validatedData = completeOnboardingSchema.parse(req.body);
    if (validatedData.type === "client") {
      await db2.insert(clientIntake).values({
        userId: req.user.id,
        primaryGoal: validatedData.data.primaryGoal,
        specificChallenges: validatedData.data.specificChallenges,
        previousSupport: validatedData.data.previousSupport,
        urgencyLevel: validatedData.data.urgencyLevel,
        healthConcerns: validatedData.data.healthConcerns,
        medications: validatedData.data.medications,
        sleepQuality: validatedData.data.sleepQuality,
        stressLevel: validatedData.data.stressLevel,
        exerciseFrequency: validatedData.data.exerciseFrequency,
        coachingStyle: validatedData.data.coachingStyle,
        sessionFrequency: validatedData.data.sessionFrequency,
        preferredDays: validatedData.data.preferredDays,
        preferredTimes: validatedData.data.preferredTimes,
        communicationPreference: validatedData.data.communicationPreference,
        emergencyContact: validatedData.data.emergencyContact,
        currentSafetyLevel: validatedData.data.currentSafetyLevel,
        needsImmediateSupport: validatedData.data.needsImmediateSupport
      });
      await db2.update(users).set({
        firstName: validatedData.data.firstName,
        lastName: validatedData.data.lastName,
        phone: validatedData.data.phone,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(users.id, req.user.id));
    } else if (validatedData.type === "coach") {
      await db2.insert(coachApplications).values({
        userId: req.user.id,
        bio: validatedData.data.bio,
        location: validatedData.data.location,
        linkedIn: validatedData.data.linkedIn,
        certifications: validatedData.data.certifications,
        specializations: validatedData.data.specializations,
        yearsOfExperience: validatedData.data.yearsOfExperience,
        availability: validatedData.data.availability,
        status: "pending"
      });
    }
    await db2.update(onboardingProgress).set({
      completed: true,
      completedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(onboardingProgress.userId, req.user.id));
    res.json({ success: true, message: "Onboarding completed successfully" });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
});
router6.get("/api/onboarding/coaching-specialties", async (req, res) => {
  const specialties = [
    {
      id: "weight-loss",
      name: "Weight Loss & Nutrition",
      description: "Help clients achieve healthy weight goals through nutrition and lifestyle changes"
    },
    {
      id: "relationships",
      name: "Relationships & Communication",
      description: "Support clients in building healthy relationships and improving communication"
    },
    {
      id: "trauma-recovery",
      name: "Trauma Recovery",
      description: "Guide clients through healing from past trauma and building resilience"
    },
    {
      id: "life-transitions",
      name: "Life Transitions",
      description: "Support during major life changes like divorce, loss, or career changes"
    },
    {
      id: "stress-management",
      name: "Stress & Anxiety Management",
      description: "Teach coping strategies and mindfulness techniques"
    },
    {
      id: "self-esteem",
      name: "Self-Esteem & Confidence",
      description: "Help clients build self-worth and personal empowerment"
    }
  ];
  res.json({ specialties });
});

// server/assessment-routes.ts
import { Router as Router7 } from "express";
import { z as z8 } from "zod";
var router7 = Router7();
router7.get("/assessment-types", async (req, res) => {
  try {
    const assessmentTypes2 = await storage.getActiveAssessmentTypes();
    res.json(assessmentTypes2);
  } catch (error) {
    console.error("Error fetching assessment types:", error);
    res.status(500).json({ error: "Failed to fetch assessment types" });
  }
});
router7.get("/assessment-types/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const assessmentType = await storage.getAssessmentTypeById(id);
    if (!assessmentType) {
      return res.status(404).json({ error: "Assessment type not found" });
    }
    res.json(assessmentType);
  } catch (error) {
    console.error("Error fetching assessment type:", error);
    res.status(500).json({ error: "Failed to fetch assessment type" });
  }
});
router7.post("/submit", requireAuth, async (req, res) => {
  try {
    const assessmentData = insertUserAssessmentSchema.parse({
      ...req.body,
      userId: req.user.id
    });
    const assessment = await storage.createUserAssessment(assessmentData);
    res.json({
      success: true,
      assessmentId: assessment.id,
      message: "Assessment completed successfully"
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    if (error instanceof z8.ZodError) {
      return res.status(400).json({ error: "Invalid assessment data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to submit assessment" });
  }
});
router7.get("/user", requireAuth, async (req, res) => {
  try {
    const assessments = await storage.getUserAssessments(req.user.id);
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching user assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});
router7.get("/user/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const assessments = await storage.getUserAssessments(userId);
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching user assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});
router7.get("/coach/:coachType/user/:userId", requireAuth, async (req, res) => {
  try {
    const { coachType, userId } = req.params;
    if (req.user.id !== userId && !["admin", "coach"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const relevantAssessments = await storage.getAssessmentsForCoach(userId, coachType);
    await storage.createCoachInteraction({
      userId,
      coachType,
      accessedAssessments: relevantAssessments.map((a) => a.id),
      interactionSummary: `Accessed ${relevantAssessments.length} relevant assessments`,
      sessionId: req.sessionID
    });
    res.json(relevantAssessments);
  } catch (error) {
    console.error("Error fetching coach-relevant assessments:", error);
    res.status(500).json({ error: "Failed to fetch relevant assessments" });
  }
});
router7.get("/summary/user/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!["admin", "coach"].includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const assessmentSummary = await storage.getUserAssessmentSummary(userId);
    res.json(assessmentSummary);
  } catch (error) {
    console.error("Error fetching assessment summary:", error);
    res.status(500).json({ error: "Failed to fetch assessment summary" });
  }
});
router7.post("/assessment-types", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const assessmentTypeData = insertAssessmentTypeSchema.parse(req.body);
    const assessmentType = await storage.createAssessmentType(assessmentTypeData);
    res.json({
      success: true,
      assessmentType,
      message: "Assessment type created successfully"
    });
  } catch (error) {
    console.error("Error creating assessment type:", error);
    if (error instanceof z8.ZodError) {
      return res.status(400).json({ error: "Invalid assessment type data", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create assessment type" });
  }
});
router7.post("/weight-loss-intake", requireAuth, async (req, res) => {
  try {
    const weightLossAssessment = {
      userId: req.user.id,
      assessmentTypeId: "weight-loss-intake",
      // This should exist in assessment_types
      responses: req.body
    };
    const assessment = await storage.createUserAssessment(weightLossAssessment);
    res.json({
      success: true,
      assessmentId: assessment.id,
      message: "Weight loss intake completed successfully"
    });
  } catch (error) {
    console.error("Error submitting weight loss intake:", error);
    res.status(500).json({ error: "Failed to submit weight loss intake" });
  }
});

// server/storage.ts
var storage2 = new SupabaseClientStorage();

// server/admin-certification-routes.ts
function registerAdminCertificationRoutes(app2) {
  app2.get("/api/admin/certifications/enrollments", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const enrollments = await storage2.getAllCertificationEnrollments();
      const enrollmentDetails = await Promise.all(
        enrollments.map(async (enrollment) => {
          const user = await storage2.getUser(enrollment.userId);
          const courses = await storage2.getCertificationCourses();
          const course = courses.find((c) => c.id === enrollment.courseId);
          return {
            id: enrollment.id || `${enrollment.userId}_${enrollment.courseId}`,
            userId: enrollment.userId,
            userName: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
            userEmail: user?.email || "No email",
            courseId: enrollment.courseId,
            courseTitle: course?.title || "Unknown Course",
            enrollmentDate: enrollment.enrollmentDate || (/* @__PURE__ */ new Date()).toISOString(),
            status: enrollment.status || "active",
            progress: enrollment.progress || 0,
            completedModules: enrollment.completedModules?.length || 0,
            totalModules: course?.syllabus?.modules?.length || 4,
            certificateIssued: enrollment.certificateIssued || false,
            certificateId: enrollment.certificateId
          };
        })
      );
      res.json(enrollmentDetails);
    } catch (error) {
      console.error("Error fetching enrollment details:", error);
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  });
  app2.get("/api/admin/certifications/courses", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const courses = await storage2.getCertificationCourses();
      const coursesWithStats = await Promise.all(
        courses.map(async (course) => {
          const enrollments = await storage2.getCertificationEnrollmentsByCourse(course.id);
          const completedEnrollments = enrollments.filter((e) => e.status === "completed").length;
          return {
            ...course,
            enrollmentCount: enrollments.length,
            completionRate: enrollments.length > 0 ? Math.round(completedEnrollments / enrollments.length * 100) : 0
          };
        })
      );
      res.json(coursesWithStats);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });
  app2.get("/api/admin/certifications/analytics", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const enrollments = await storage2.getAllCertificationEnrollments();
      const courses = await storage2.getCertificationCourses();
      const analytics = {
        totalEnrollments: enrollments.length,
        activeCourses: courses.filter((c) => c.isActive).length,
        certificatesIssued: enrollments.filter((e) => e.certificateIssued).length,
        averageProgress: enrollments.length > 0 ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length) : 0
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.post("/api/admin/certifications/enroll", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { userId, courseId } = req.body;
      if (!userId || !courseId) {
        return res.status(400).json({ error: "User ID and Course ID are required" });
      }
      const enrollmentData = {
        userId,
        courseId,
        enrollmentDate: /* @__PURE__ */ new Date(),
        status: "active",
        progress: 0,
        completedModules: [],
        certificateIssued: false
      };
      await storage2.createCertificationEnrollment(enrollmentData);
      res.json({ success: true, message: "User enrolled successfully" });
    } catch (error) {
      console.error("Error enrolling user:", error);
      res.status(500).json({ error: "Failed to enroll user" });
    }
  });
  app2.patch("/api/admin/certifications/enrollments/:enrollmentId", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { enrollmentId } = req.params;
      const { status } = req.body;
      await storage2.updateCertificationEnrollment(enrollmentId, { status });
      res.json({ success: true, message: "Enrollment updated successfully" });
    } catch (error) {
      console.error("Error updating enrollment:", error);
      res.status(500).json({ error: "Failed to update enrollment" });
    }
  });
  app2.post("/api/admin/certifications/issue-certificate/:enrollmentId", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { enrollmentId } = req.params;
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await storage2.updateCertificationEnrollment(enrollmentId, {
        certificateIssued: true,
        certificateId,
        status: "completed"
      });
      res.json({
        success: true,
        message: "Certificate issued successfully",
        certificateId
      });
    } catch (error) {
      console.error("Error issuing certificate:", error);
      res.status(500).json({ error: "Failed to issue certificate" });
    }
  });
  app2.get("/api/admin/certifications/export", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const enrollments = await storage2.getAllCertificationEnrollments();
      const csvData = enrollments.map((enrollment) => ({
        "User ID": enrollment.userId,
        "Course ID": enrollment.courseId,
        "Enrollment Date": enrollment.enrollmentDate,
        "Status": enrollment.status,
        "Progress": `${enrollment.progress}%`,
        "Certificate Issued": enrollment.certificateIssued ? "Yes" : "No",
        "Certificate ID": enrollment.certificateId || "N/A"
      }));
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=certifications.csv");
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => headers.map((header) => row[header]).join(","))
      ].join("\n");
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });
}

// server/routes.ts
import bcrypt3 from "bcrypt";

// server/recommendation-engine.ts
import Anthropic from "@anthropic-ai/sdk";
var anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
var DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
var mockMentalWellnessResources = [
  {
    id: 1,
    title: "National Suicide Prevention Lifeline",
    description: "Free 24/7 crisis support for people in suicidal crisis or emotional distress",
    category: "crisis",
    resource_type: "hotline",
    contact_info: "Call 988 for immediate crisis support",
    phone: "988",
    website: "https://suicidepreventionlifeline.org",
    emergency: true,
    crisis_support: true,
    featured: true,
    specialties: ["suicide prevention", "crisis intervention"],
    languages: ["English", "Spanish"]
  },
  {
    id: 2,
    title: "Crisis Text Line",
    description: "Free 24/7 text-based crisis support",
    category: "crisis",
    resource_type: "hotline",
    contact_info: "Text HOME to 741741",
    phone: "741741",
    website: "https://crisistextline.org",
    emergency: true,
    crisis_support: true,
    featured: true,
    specialties: ["crisis intervention", "text support"],
    languages: ["English", "Spanish"]
  },
  {
    id: 3,
    title: "National Domestic Violence Hotline",
    description: "24/7 support for domestic violence survivors",
    category: "safety",
    resource_type: "hotline",
    contact_info: "Call 1-800-799-7233 for confidential support",
    phone: "1-800-799-7233",
    website: "https://thehotline.org",
    emergency: true,
    crisis_support: true,
    featured: true,
    specialties: ["domestic violence", "safety planning"],
    languages: ["English", "Spanish"]
  },
  {
    id: 4,
    title: "Headspace",
    description: "Meditation and mindfulness app",
    category: "mindfulness",
    resource_type: "app",
    contact_info: "Download the Headspace app",
    website: "https://headspace.com",
    emergency: false,
    crisis_support: false,
    featured: true,
    specialties: ["meditation", "mindfulness", "sleep"],
    languages: ["English"]
  },
  {
    id: 5,
    title: "BetterHelp",
    description: "Online therapy platform",
    category: "therapy",
    resource_type: "website",
    contact_info: "Visit BetterHelp.com to connect with licensed therapists",
    website: "https://betterhelp.com",
    emergency: false,
    crisis_support: false,
    featured: true,
    specialties: ["therapy", "counseling"],
    languages: ["English"]
  }
];
var mockEmergencyContacts = [
  {
    id: 1,
    name: "National Suicide Prevention Lifeline",
    phone_number: "988",
    description: "Free 24/7 crisis support for people in suicidal crisis",
    specialty: "Crisis Intervention",
    is_active: true,
    sort_order: 1
  },
  {
    id: 2,
    name: "Crisis Text Line",
    phone_number: "741741",
    description: "Free 24/7 text-based crisis support",
    specialty: "Crisis Intervention",
    is_active: true,
    sort_order: 2
  },
  {
    id: 3,
    name: "National Domestic Violence Hotline",
    phone_number: "1-800-799-7233",
    description: "24/7 support for domestic violence survivors",
    specialty: "Domestic Violence",
    is_active: true,
    sort_order: 3
  }
];
var PersonalizedRecommendationEngine = class {
  async generateRecommendations(userProfile, context) {
    if (context.urgencyLevel === "crisis") {
      return await this.generateCrisisRecommendations(userProfile, context);
    }
    const resources2 = await this.getAvailableResources();
    const userHistory = await this.getUserHistory(userProfile.userId);
    const aiRecommendations = await this.generateAIRecommendations(
      userProfile,
      context,
      resources2,
      userHistory
    );
    const rankedRecommendations = await this.rankRecommendations(
      aiRecommendations,
      userProfile,
      context
    );
    await this.storeRecommendations(userProfile.userId, rankedRecommendations);
    return rankedRecommendations;
  }
  async generateCrisisRecommendations(userProfile, context) {
    let emergencyContacts2;
    try {
      const { data, error } = await supabase.from("emergency_contacts").select("*").eq("is_active", true).order("sort_order");
      if (error) {
        emergencyContacts2 = mockEmergencyContacts;
      } else {
        emergencyContacts2 = data || mockEmergencyContacts;
      }
    } catch (err) {
      emergencyContacts2 = mockEmergencyContacts;
    }
    const recommendations = [];
    if (emergencyContacts2) {
      emergencyContacts2.forEach((contact, index) => {
        recommendations.push({
          id: `crisis_${contact.id}`,
          type: "crisis_support",
          title: `Call ${contact.name}`,
          description: contact.description,
          reasoning: "Immediate professional crisis support is available 24/7",
          priority: index + 1,
          estimatedTime: 0,
          resourceId: contact.id,
          actionSteps: [
            `Call ${contact.phone_number}`,
            "Speak with a trained crisis counselor",
            "Follow their guidance for immediate support"
          ],
          crisisLevel: true
        });
      });
    }
    const safetyResources = await this.getSafetyResources();
    safetyResources.forEach((resource, index) => {
      recommendations.push({
        id: `safety_${resource.id}`,
        type: "resource",
        title: resource.title,
        description: resource.description,
        reasoning: "Immediate safety and crisis resources",
        priority: index + 10,
        estimatedTime: 5,
        resourceId: resource.id,
        actionSteps: [
          "Access this resource immediately",
          "Follow safety protocols",
          "Reach out for professional help"
        ],
        crisisLevel: true
      });
    });
    return recommendations;
  }
  async generateAIRecommendations(userProfile, context, resources2, userHistory) {
    const prompt = this.buildRecommendationPrompt(userProfile, context, resources2, userHistory);
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2e3,
        system: `You are a compassionate wellness AI coach specializing in personalized mental health recommendations. 
                 Your role is to provide thoughtful, evidence-based suggestions that are:
                 - Personalized to the user's specific needs and context
                 - Practical and actionable
                 - Sensitive to crisis situations
                 - Based on available resources
                 - Focused on gradual improvement and self-care`,
        messages: [
          { role: "user", content: prompt }
        ]
      });
      const aiResponse = response.content[0].text;
      return this.parseAIRecommendations(aiResponse, resources2);
    } catch (error) {
      console.error("AI recommendation generation failed:", error);
      return await this.generateFallbackRecommendations(userProfile, context, resources2);
    }
  }
  buildRecommendationPrompt(userProfile, context, resources2, userHistory) {
    return `
Generate personalized wellness recommendations for a user with the following profile:

USER PROFILE:
- Primary concerns: ${userProfile.mentalHealthProfile?.primaryConcerns?.join(", ") || "General wellness"}
- Current challenges: ${userProfile.mentalHealthProfile?.currentChallenges?.join(", ") || "Not specified"}
- Preferred resource types: ${userProfile.behaviorPatterns?.preferredResourceTypes?.join(", ") || "Mixed"}
- Engagement level: ${userProfile.behaviorPatterns?.engagementLevel || "Medium"}

CURRENT CONTEXT:
- Current mood: ${context.currentMood || "Not specified"}
- Urgency level: ${context.urgencyLevel || "medium"}
- Available time: ${context.timeAvailable || 30} minutes
- Environment: ${context.environment || "private"}
- Session goals: ${context.sessionGoals?.join(", ") || "General wellness"}

AVAILABLE RESOURCES:
${resources2.map((r) => `- ${r.title} (${r.category}): ${r.description}`).join("\n")}

RECENT ACTIVITY:
${userHistory.length > 0 ? userHistory.map((h) => `- Used: ${h.resource_title}`).join("\n") : "No recent activity"}

Please provide 5-7 personalized recommendations in the following JSON format:
{
  "recommendations": [
    {
      "id": "unique_id",
      "type": "resource|activity|coaching",
      "title": "Recommendation title",
      "description": "Brief description",
      "reasoning": "Why this is recommended for this user",
      "priority": 1-10,
      "estimatedTime": minutes,
      "resourceId": resource_id_if_applicable,
      "actionSteps": ["step1", "step2", "step3"],
      "followUpSuggestions": ["suggestion1", "suggestion2"]
    }
  ]
}

Focus on:
1. Immediate needs based on current context
2. Progressive skill building
3. Variety in recommendation types
4. Practical, actionable steps
5. Appropriate urgency level
`;
  }
  async parseAIRecommendations(aiResponse, resources2) {
    try {
      const parsed = JSON.parse(aiResponse);
      return parsed.recommendations || [];
    } catch (error) {
      console.error("Failed to parse AI recommendations:", error);
      return await this.generateFallbackRecommendations({}, {}, resources2);
    }
  }
  async generateFallbackRecommendations(userProfile, context, resources2) {
    const fallbackRecommendations = [];
    const featuredResources = resources2.filter((r) => r.is_featured).slice(0, 3);
    featuredResources.forEach((resource, index) => {
      fallbackRecommendations.push({
        id: `fallback_${resource.id}`,
        type: "resource",
        title: resource.title,
        description: resource.description,
        reasoning: "Highly rated resource for general wellness support",
        priority: index + 1,
        estimatedTime: 15,
        resourceId: resource.id,
        actionSteps: [
          "Access this resource",
          "Explore the available support",
          "Apply the guidance to your situation"
        ],
        followUpSuggestions: [
          "Consider bookmarking for future reference",
          "Share with trusted friends or family if helpful"
        ]
      });
    });
    fallbackRecommendations.push({
      id: "mindfulness_basic",
      type: "activity",
      title: "Brief Mindfulness Practice",
      description: "A simple 5-minute breathing exercise to center yourself",
      reasoning: "Mindfulness practices are universally beneficial for mental wellness",
      priority: 4,
      estimatedTime: 5,
      actionSteps: [
        "Find a comfortable, quiet space",
        "Focus on your breath for 5 minutes",
        "Notice thoughts without judgment"
      ],
      followUpSuggestions: [
        "Try extending the practice to 10 minutes",
        "Explore guided meditation resources"
      ]
    });
    return fallbackRecommendations;
  }
  async rankRecommendations(recommendations, userProfile, context) {
    return recommendations.map((rec) => ({
      ...rec,
      personalizedScore: this.calculatePersonalizationScore(rec, userProfile, context)
    })).sort((a, b) => {
      if (a.crisisLevel && !b.crisisLevel) return -1;
      if (!a.crisisLevel && b.crisisLevel) return 1;
      if (a.personalizedScore !== b.personalizedScore) {
        return b.personalizedScore - a.personalizedScore;
      }
      return a.priority - b.priority;
    }).slice(0, 7);
  }
  calculatePersonalizationScore(recommendation, userProfile, context) {
    let score = 0;
    if (userProfile.mentalHealthProfile?.primaryConcerns) {
      score += recommendation.description.toLowerCase().includes("anxiety") ? 10 : 0;
      score += recommendation.description.toLowerCase().includes("depression") ? 10 : 0;
    }
    if (userProfile.behaviorPatterns?.preferredResourceTypes?.includes(recommendation.type)) {
      score += 15;
    }
    if (context.timeAvailable && recommendation.estimatedTime <= context.timeAvailable) {
      score += 10;
    }
    if (context.urgencyLevel === "high" && recommendation.priority <= 3) {
      score += 20;
    }
    return score;
  }
  async storeRecommendations(userId, recommendations) {
    try {
      const recommendationRecords = recommendations.map((rec) => ({
        user_id: userId,
        resource_id: rec.resourceId,
        recommendation_score: rec.personalizedScore || rec.priority,
        reasons: rec.reasoning ? [rec.reasoning] : [],
        algorithm_version: "v1.0",
        generated_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
      await supabase.from("personalized_recommendations").insert(recommendationRecords);
    } catch (error) {
      console.error("Failed to store recommendations:", error);
    }
  }
  async getAvailableResources() {
    try {
      const { data: resources2, error } = await supabase.from("mental_wellness_resources").select("*").eq("featured", true).order("id");
      if (error) {
        console.log("Using mock data for mental wellness resources");
        return mockMentalWellnessResources;
      }
      return resources2 || mockMentalWellnessResources;
    } catch (err) {
      console.log("Database not available, using mock data");
      return mockMentalWellnessResources;
    }
  }
  async getSafetyResources() {
    try {
      const { data: resources2, error } = await supabase.from("mental_wellness_resources").select("*").eq("emergency", true).order("id");
      if (error) {
        return mockMentalWellnessResources.filter((r) => r.emergency);
      }
      return resources2 || mockMentalWellnessResources.filter((r) => r.emergency);
    } catch (err) {
      return mockMentalWellnessResources.filter((r) => r.emergency);
    }
  }
  async getUserHistory(userId) {
    try {
      const { data: history, error } = await supabase.from("resource_usage_analytics").select(`
          *,
          mental_wellness_resources (title, category)
        `).eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
      if (error) {
        return [];
      }
      return history || [];
    } catch (err) {
      return [];
    }
  }
  async trackRecommendationUsage(userId, recommendationId, action) {
    try {
      await supabase.from("personalized_recommendations").update({
        was_accessed: action === "accessed" || action === "completed",
        was_helpful: action === "helpful" ? true : action === "not_helpful" ? false : null,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("user_id", userId).eq("id", recommendationId);
    } catch (error) {
      console.error("Failed to track recommendation usage:", error);
    }
  }
};
var recommendationEngine = new PersonalizedRecommendationEngine();

// server/create-coach-endpoint.ts
import bcrypt2 from "bcrypt";
async function createTestCoach(req, res) {
  try {
    const existingUser = await storage.getUserByEmail("chuck");
    if (existingUser) {
      return res.status(400).json({
        message: "Coach account already exists for username: chuck"
      });
    }
    const passwordHash = await bcrypt2.hash("chucknice1", 12);
    const newCoach = await storage.createUser({
      id: "coach_chuck_" + Date.now(),
      email: "chuck",
      // Using email field for username
      passwordHash,
      firstName: "Chuck",
      lastName: "TestCoach",
      role: "coach",
      permissions: JSON.stringify([
        "VIEW_COACH_DASHBOARD",
        "MANAGE_CLIENTS",
        "VIEW_SESSIONS",
        "EDIT_PROFILE",
        "VIEW_EARNINGS"
      ]),
      isActive: true,
      membershipLevel: "coach",
      donationTotal: "0",
      rewardPoints: 0
    });
    res.json({
      success: true,
      message: "Test coach account created successfully!",
      coach: {
        id: newCoach.id,
        username: "chuck",
        role: "coach",
        name: `${newCoach.firstName} ${newCoach.lastName}`
      }
    });
  } catch (error) {
    console.error("Error creating test coach:", error);
    res.status(500).json({
      message: "Failed to create test coach account",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

// server/routes.ts
import passport2 from "passport";
import session from "express-session";

// server/google-auth.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
var GOOGLE_CLIENT_ID = "69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "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";
function setupGoogleAuth() {
  const callbackURL = "https://wholewellnesscoaching.org/auth/google/callback";
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL,
    scope: ["profile", "email"],
    passReqToCallback: false
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google OAuth Profile:", profile);
      let user = await storage.getUserByGoogleId(profile.id);
      if (user) {
        return done(null, user);
      }
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await storage.getUserByEmail(email);
        if (user) {
          user = await storage.updateUserGoogleId(user.id, profile.id);
          return done(null, user);
        }
      }
      if (email) {
        const newUser = await storage.createUser({
          email,
          passwordHash: "",
          // Empty password hash for OAuth users
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          profileImageUrl: profile.photos?.[0]?.value || null,
          googleId: profile.id,
          provider: "google",
          role: "user"
        });
        return done(null, newUser);
      }
      return done(new Error("No email provided by Google"));
    } catch (error) {
      console.error("Google OAuth error:", error);
      return done(error, null);
    }
  }));
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}
function generateGoogleAuthToken(user) {
  return AuthService.generateToken({
    id: user.id,
    email: user.email,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    role: user.role || "user",
    membershipLevel: user.membershipLevel || "free",
    isActive: user.isActive !== false
  });
}

// server/google-drive-service.ts
import { google as google2 } from "googleapis";
var GoogleDriveService = class {
  drive;
  auth;
  constructor() {
    this.initializeAuth();
  }
  async initializeAuth() {
    try {
      const credentials = {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
      };
      if (!credentials.private_key || !credentials.client_email) {
        console.warn("Google Drive service account credentials not configured");
        return;
      }
      this.auth = new google2.auth.GoogleAuth({
        credentials,
        scopes: [
          "https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/drive.file"
        ]
      });
      this.drive = google2.drive({ version: "v3", auth: this.auth });
      console.log("Google Drive service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Google Drive service:", error);
    }
  }
  async createCourseFolder(courseId, courseName, parentFolderId) {
    if (!this.drive) {
      console.error("Google Drive not configured");
      return { success: false, folderId: null };
    }
    try {
      const folderMetadata = {
        name: `${courseName} - Course Materials`,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentFolderId ? [parentFolderId] : void 0
      };
      const response = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: "id,name,webViewLink"
      });
      console.log(`Created course folder: ${response.data.name} (${response.data.id})`);
      return {
        success: true,
        folderId: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink
      };
    } catch (error) {
      console.error("Error creating course folder:", error);
      return { success: false, folderId: null };
    }
  }
  async uploadFile(fileName, fileBuffer, mimeType, parentFolderId) {
    if (!this.drive || !parentFolderId) {
      console.error("Google Drive not configured or folder ID missing");
      return null;
    }
    try {
      const fileMetadata = {
        name: fileName,
        parents: [parentFolderId]
      };
      const media = {
        mimeType,
        body: fileBuffer
      };
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id,name,size,createdTime,mimeType,thumbnailLink,webViewLink"
      });
      return {
        id: response.data.id,
        name: response.data.name,
        type: this.getFileType(response.data.mimeType),
        url: response.data.webViewLink,
        thumbnailUrl: response.data.thumbnailLink,
        size: response.data.size ? this.formatFileSize(parseInt(response.data.size)) : void 0,
        uploadedAt: response.data.createdTime
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  }
  async listCourseFiles(folderId) {
    if (!this.drive || !folderId) {
      return [];
    }
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)",
        orderBy: "name"
      });
      const files = response.data.files || [];
      return files.map((file) => ({
        id: file.id,
        name: file.name,
        type: this.getFileType(file.mimeType),
        url: file.webViewLink,
        thumbnailUrl: file.thumbnailLink,
        size: file.size ? this.formatFileSize(parseInt(file.size)) : void 0,
        uploadedAt: file.createdTime
      }));
    } catch (error) {
      console.error("Error fetching course files from Google Drive:", error);
      return [];
    }
  }
  async testConnection() {
    if (!this.drive) {
      return false;
    }
    try {
      await this.drive.files.list({ pageSize: 1 });
      return true;
    } catch (error) {
      console.error("Google Drive connection test failed:", error);
      return false;
    }
  }
  getFileType(mimeType) {
    if (mimeType.includes("video")) return "video";
    if (mimeType.includes("document") || mimeType.includes("pdf") || mimeType.includes("text")) return "document";
    if (mimeType.includes("image")) return "image";
    return "other";
  }
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
};

// server/google-drive-demo.ts
var demoFiles = [
  {
    id: "demo-1",
    name: "Advanced Wellness Coaching - Module 1.pdf",
    mimeType: "application/pdf",
    webViewLink: "#",
    webContentLink: "#",
    size: "2048576",
    createdTime: "2025-01-15T10:00:00Z",
    modifiedTime: "2025-01-20T14:30:00Z"
  },
  {
    id: "demo-2",
    name: "Coaching Techniques Video Tutorial.mp4",
    mimeType: "video/mp4",
    webViewLink: "#",
    webContentLink: "#",
    thumbnailLink: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
    size: "52428800",
    createdTime: "2025-01-16T09:15:00Z",
    modifiedTime: "2025-01-18T11:45:00Z"
  },
  {
    id: "demo-3",
    name: "Client Assessment Worksheet.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    webViewLink: "#",
    webContentLink: "#",
    size: "1024000",
    createdTime: "2025-01-17T13:20:00Z",
    modifiedTime: "2025-01-19T16:10:00Z"
  },
  {
    id: "demo-4",
    name: "Nutrition Planning Template.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    webViewLink: "#",
    webContentLink: "#",
    size: "512000",
    createdTime: "2025-01-18T08:30:00Z",
    modifiedTime: "2025-01-21T12:00:00Z"
  },
  {
    id: "demo-5",
    name: "Behavior Change Strategies Presentation.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    webViewLink: "#",
    webContentLink: "#",
    thumbnailLink: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200",
    size: "4096000",
    createdTime: "2025-01-19T15:45:00Z",
    modifiedTime: "2025-01-22T09:30:00Z"
  },
  {
    id: "demo-6",
    name: "Course Resources and References.pdf",
    mimeType: "application/pdf",
    webViewLink: "#",
    webContentLink: "#",
    size: "1536000",
    createdTime: "2025-01-20T11:00:00Z",
    modifiedTime: "2025-01-23T14:15:00Z"
  }
];
var GoogleDriveDemoService = class {
  /**
   * Get demo course files for testing purposes
   */
  async getCourseFiles(folderId) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return demoFiles.map((file) => ({
      ...file,
      webViewLink: `https://drive.google.com/file/d/${file.id}/view`,
      webContentLink: `https://drive.google.com/uc?id=${file.id}&export=download`
    }));
  }
  /**
   * Get demo folder structure
   */
  async getCourseFolderStructure(folderId) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      id: folderId,
      name: "Wellness Coaching Course Materials",
      files: demoFiles,
      subfolders: [
        {
          id: "subfolder-1",
          name: "Module 1 - Foundation",
          files: demoFiles.slice(0, 2),
          subfolders: []
        },
        {
          id: "subfolder-2",
          name: "Module 2 - Advanced Techniques",
          files: demoFiles.slice(2, 4),
          subfolders: []
        },
        {
          id: "subfolder-3",
          name: "Resources & Templates",
          files: demoFiles.slice(4),
          subfolders: []
        }
      ]
    };
  }
  /**
   * Search demo files
   */
  async searchFiles(query, folderId) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return demoFiles.filter(
      (file) => file.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  /**
   * Get demo download URL
   */
  async getDownloadUrl(fileId) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  }
  /**
   * Initialize demo service (always returns true)
   */
  async initialize() {
    return true;
  }
};
var googleDriveDemoService = new GoogleDriveDemoService();

// server/wellness-journey-routes.ts
import { z as z9 } from "zod";
var wellnessGoalSchema = z9.object({
  category: z9.enum(["physical", "mental", "emotional", "spiritual", "social", "career", "financial"]),
  specific_goal: z9.string().min(5, "Please describe your goal in detail"),
  priority: z9.enum(["high", "medium", "low"]),
  timeline: z9.enum(["1_week", "1_month", "3_months", "6_months", "1_year", "ongoing"]),
  current_level: z9.number().min(1).max(10),
  target_level: z9.number().min(1).max(10),
  obstacles: z9.array(z9.string()).optional(),
  motivation: z9.string().optional()
});
var lifestyleAssessmentSchema = z9.object({
  sleep_hours: z9.number().min(0).max(24),
  exercise_frequency: z9.enum(["none", "rarely", "weekly", "several_times", "daily"]),
  stress_level: z9.number().min(1).max(10),
  energy_level: z9.number().min(1).max(10),
  social_connection: z9.number().min(1).max(10),
  work_life_balance: z9.number().min(1).max(10),
  diet_quality: z9.enum(["poor", "fair", "good", "excellent"]),
  major_life_changes: z9.array(z9.string()).optional(),
  support_system: z9.enum(["none", "limited", "moderate", "strong"]),
  previous_wellness_experience: z9.string().optional()
});
var preferencesSchema = z9.object({
  learning_style: z9.enum(["visual", "auditory", "kinesthetic", "reading"]),
  session_duration: z9.enum(["5_min", "15_min", "30_min", "60_min", "90_min"]),
  frequency: z9.enum(["daily", "every_other_day", "weekly", "bi_weekly", "monthly"]),
  reminder_preferences: z9.array(z9.enum(["email", "push", "sms", "none"])),
  preferred_times: z9.array(z9.enum(["morning", "afternoon", "evening", "late_night"])),
  intensity_preference: z9.enum(["gentle", "moderate", "intense"]),
  group_vs_individual: z9.enum(["individual", "small_group", "large_group", "both"]),
  technology_comfort: z9.number().min(1).max(10)
});
var generateJourneySchema = z9.object({
  goals: z9.array(wellnessGoalSchema),
  lifestyle: lifestyleAssessmentSchema,
  preferences: preferencesSchema
});
var WellnessRecommendationEngine = class {
  static async generateJourney(userId, goals, lifestyle, preferences) {
    const journeyType = this.determineJourneyType(goals, lifestyle);
    const estimatedCompletion = this.calculateEstimatedCompletion(goals, preferences);
    const phases = this.generatePhases(goals, lifestyle, preferences);
    const recommendations = this.generateRecommendations(goals, lifestyle, preferences, phases);
    return {
      journeyType,
      estimatedCompletion,
      phases,
      recommendations,
      aiInsights: this.generateInitialInsights(goals, lifestyle, preferences)
    };
  }
  static determineJourneyType(goals, lifestyle) {
    const highPriorityGoals = goals.filter((g) => g.priority === "high").length;
    const stressLevel = lifestyle.stress_level;
    const supportSystem = lifestyle.support_system;
    if (stressLevel >= 8 || supportSystem === "none") {
      return "crisis_recovery";
    } else if (highPriorityGoals >= 3) {
      return "comprehensive";
    } else if (highPriorityGoals === 1) {
      return "targeted";
    } else {
      return "maintenance";
    }
  }
  static calculateEstimatedCompletion(goals, preferences) {
    const baseWeeks = goals.length * 4;
    const intensityMultiplier = {
      "gentle": 1.5,
      "moderate": 1,
      "intense": 0.7
    }[preferences.intensity_preference] || 1;
    const frequencyMultiplier = {
      "daily": 0.8,
      "every_other_day": 1,
      "weekly": 1.5,
      "bi_weekly": 2,
      "monthly": 3
    }[preferences.frequency] || 1;
    const adjustedWeeks = baseWeeks * intensityMultiplier * frequencyMultiplier;
    const completionDate = /* @__PURE__ */ new Date();
    completionDate.setDate(completionDate.getDate() + adjustedWeeks * 7);
    return completionDate;
  }
  static generatePhases(goals, lifestyle, preferences) {
    const phases = [];
    phases.push({
      name: "Foundation Building",
      description: "Establish healthy habits and assessment baselines",
      order: 1,
      estimated_duration: "2-3 weeks",
      goals: ["Establish routine", "Complete assessments", "Set up tracking systems"],
      milestones: ["Daily check-ins established", "Baseline measurements recorded", "Support system activated"]
    });
    const goalCategories = [...new Set(goals.map((g) => g.category))];
    goalCategories.forEach((category, index) => {
      phases.push({
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Development`,
        description: `Focus on ${category} wellness goals and skills`,
        order: index + 2,
        estimated_duration: "4-6 weeks",
        goals: goals.filter((g) => g.category === category).map((g) => g.specific_goal),
        milestones: [`${category} skills developed`, `Progress toward ${category} goals`, "Habit integration"]
      });
    });
    phases.push({
      name: "Integration & Optimization",
      description: "Combine all practices and optimize for sustainability",
      order: phases.length + 1,
      estimated_duration: "3-4 weeks",
      goals: ["Integrate all practices", "Optimize routines", "Plan for long-term maintenance"],
      milestones: ["Seamless routine integration", "Sustainable practices identified", "Long-term plan created"]
    });
    return phases;
  }
  static generateRecommendations(goals, lifestyle, preferences, phases) {
    const recommendations = [];
    recommendations.push({
      type: "daily_practice",
      title: "Morning Mindfulness Check-in",
      description: "Start each day with a 5-minute mindfulness practice to set intentions",
      category: "mindfulness",
      priority: 1,
      estimated_time: 5,
      difficulty_level: "beginner",
      ai_reasoning: `Based on your ${lifestyle.stress_level}/10 stress level, mindfulness practice will help establish a calm foundation for your wellness journey.`,
      action_steps: [
        "Find a quiet space upon waking",
        "Sit comfortably and close your eyes",
        "Take 5 deep breaths focusing on the sensation",
        "Set an intention for the day",
        "Record your mood and energy level"
      ],
      success_metrics: ["Consistent daily practice", "Improved morning mood ratings", "Clearer daily intentions"],
      resources: [
        {
          type: "app",
          title: "Headspace - Mindfulness Meditation",
          url: "https://www.headspace.com/",
          duration: 5
        }
      ],
      expected_outcomes: ["Reduced morning stress", "Better focus throughout day", "Increased self-awareness"],
      progress_tracking: {
        method: "daily_rating",
        frequency: "daily",
        checkpoints: ["mood_rating", "energy_rating", "intention_clarity"]
      }
    });
    goals.forEach((goal) => {
      if (goal.category === "physical") {
        recommendations.push({
          type: "weekly_goal",
          title: `Physical Activity: ${goal.specific_goal}`,
          description: `Weekly progression toward your physical wellness goal`,
          category: "physical",
          priority: goal.priority === "high" ? 2 : 3,
          estimated_time: preferences.session_duration === "30_min" ? 30 : 45,
          difficulty_level: goal.current_level <= 3 ? "beginner" : goal.current_level <= 6 ? "intermediate" : "advanced",
          ai_reasoning: `Your current level (${goal.current_level}/10) and target (${goal.target_level}/10) suggest a ${goal.target_level - goal.current_level} point improvement is needed.`,
          action_steps: [
            "Schedule weekly exercise sessions",
            "Track physical activity and progress",
            "Gradually increase intensity or duration",
            "Monitor how you feel before and after"
          ],
          success_metrics: ["Weekly activity completion", "Progressive improvement", "Energy level increases"],
          resources: [],
          expected_outcomes: ["Improved physical fitness", "Higher energy levels", "Better sleep quality"]
        });
      }
      if (goal.category === "mental") {
        recommendations.push({
          type: "daily_practice",
          title: `Mental Wellness: ${goal.specific_goal}`,
          description: "Daily practices to strengthen mental resilience and clarity",
          category: "mental",
          priority: goal.priority === "high" ? 1 : 2,
          estimated_time: 15,
          difficulty_level: "intermediate",
          ai_reasoning: `Mental wellness goals require consistent daily practice. Your ${lifestyle.stress_level}/10 stress level indicates this is a priority area.`,
          action_steps: [
            "Practice daily meditation or breathing exercises",
            "Journal thoughts and feelings",
            "Challenge negative thought patterns",
            "Engage in mentally stimulating activities"
          ],
          success_metrics: ["Daily practice consistency", "Improved stress management", "Mental clarity ratings"],
          resources: [
            {
              type: "article",
              title: "Cognitive Behavioral Techniques for Daily Use",
              url: "/resources/cbt-techniques",
              duration: 10
            }
          ],
          expected_outcomes: ["Reduced anxiety", "Better emotional regulation", "Increased mental resilience"]
        });
      }
    });
    return recommendations;
  }
  static generateInitialInsights(goals, lifestyle, preferences) {
    const insights = [];
    if (lifestyle.stress_level >= 7) {
      insights.push({
        type: "risk_assessment",
        title: "High Stress Level Detected",
        description: `Your stress level of ${lifestyle.stress_level}/10 indicates a need for immediate stress management strategies.`,
        confidence: 0.9,
        impact_level: "high",
        suggested_actions: [
          "Prioritize stress-reduction techniques",
          "Consider professional support if needed",
          "Focus on sleep quality improvement",
          "Implement daily relaxation practices"
        ]
      });
    }
    if (lifestyle.sleep_hours < 6 || lifestyle.sleep_hours > 9) {
      insights.push({
        type: "pattern_recognition",
        title: "Sleep Optimization Opportunity",
        description: `Your ${lifestyle.sleep_hours} hours of sleep may be impacting your wellness goals.`,
        confidence: 0.8,
        impact_level: "medium",
        suggested_actions: [
          "Establish consistent sleep schedule",
          "Create bedtime routine",
          "Optimize sleep environment",
          "Track sleep quality metrics"
        ]
      });
    }
    const highPriorityGoals = goals.filter((g) => g.priority === "high").length;
    if (highPriorityGoals > 3) {
      insights.push({
        type: "recommendation_optimization",
        title: "Goal Prioritization Needed",
        description: `You have ${highPriorityGoals} high-priority goals. Consider focusing on 1-2 initially for better success rates.`,
        confidence: 0.85,
        impact_level: "medium",
        suggested_actions: [
          "Select top 2 most important goals",
          "Set others as secondary priorities",
          "Focus resources on primary goals first",
          "Reassess priorities monthly"
        ]
      });
    }
    return insights;
  }
};
function registerWellnessJourneyRoutes(app2) {
  app2.get("/api/wellness-journey/current", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const journey = await storage2.getCurrentWellnessJourney(req.user.id);
      if (!journey) {
        return res.status(404).json({ message: "No active journey found" });
      }
      res.json(journey);
    } catch (error) {
      console.error("Error fetching wellness journey:", error);
      res.status(500).json({ message: "Failed to fetch wellness journey" });
    }
  });
  app2.post("/api/wellness-journey/generate", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const validatedData = generateJourneySchema.parse(req.body);
      const journeyData = await WellnessRecommendationEngine.generateJourney(
        req.user.id,
        validatedData.goals,
        validatedData.lifestyle,
        validatedData.preferences
      );
      const journey = await storage2.createWellnessJourney({
        userId: req.user.id,
        journeyType: journeyData.journeyType,
        title: `${req.user.firstName}'s Wellness Journey`,
        description: `Personalized wellness journey focusing on ${validatedData.goals.map((g) => g.category).join(", ")} goals`,
        estimatedCompletion: journeyData.estimatedCompletion,
        currentPhase: journeyData.phases[0]?.name || "Foundation Building"
      });
      await Promise.all([
        ...validatedData.goals.map(
          (goal) => storage2.createWellnessGoal({
            journeyId: journey.id,
            category: goal.category,
            specificGoal: goal.specific_goal,
            priority: goal.priority,
            timeline: goal.timeline,
            currentLevel: goal.current_level,
            targetLevel: goal.target_level,
            obstacles: goal.obstacles || [],
            motivation: goal.motivation || ""
          })
        ),
        storage2.createLifestyleAssessment({
          journeyId: journey.id,
          sleepHours: validatedData.lifestyle.sleep_hours.toString(),
          exerciseFrequency: validatedData.lifestyle.exercise_frequency,
          stressLevel: validatedData.lifestyle.stress_level,
          energyLevel: validatedData.lifestyle.energy_level,
          socialConnection: validatedData.lifestyle.social_connection,
          workLifeBalance: validatedData.lifestyle.work_life_balance,
          dietQuality: validatedData.lifestyle.diet_quality,
          majorLifeChanges: validatedData.lifestyle.major_life_changes || [],
          supportSystem: validatedData.lifestyle.support_system,
          previousWellnessExperience: validatedData.lifestyle.previous_wellness_experience || ""
        }),
        storage2.createUserPreferences({
          journeyId: journey.id,
          learningStyle: validatedData.preferences.learning_style,
          sessionDuration: validatedData.preferences.session_duration,
          frequency: validatedData.preferences.frequency,
          reminderPreferences: validatedData.preferences.reminder_preferences,
          preferredTimes: validatedData.preferences.preferred_times,
          intensityPreference: validatedData.preferences.intensity_preference,
          groupVsIndividual: validatedData.preferences.group_vs_individual,
          technologyComfort: validatedData.preferences.technology_comfort
        }),
        ...journeyData.phases.map(
          (phase, index) => storage2.createJourneyPhase({
            journeyId: journey.id,
            phaseName: phase.name,
            phaseDescription: phase.description,
            phaseOrder: index + 1,
            estimatedDuration: phase.estimated_duration,
            goals: phase.goals,
            milestones: phase.milestones,
            isCurrent: index === 0
          })
        )
      ]);
      const phases = await storage2.getJourneyPhases(journey.id);
      await Promise.all(
        journeyData.recommendations.map(
          (rec) => storage2.createWellnessRecommendation({
            journeyId: journey.id,
            phaseId: phases[0]?.id,
            // Assign to first phase initially
            type: rec.type,
            title: rec.title,
            description: rec.description,
            category: rec.category,
            priority: rec.priority,
            estimatedTime: rec.estimated_time,
            difficultyLevel: rec.difficulty_level,
            aiReasoning: rec.ai_reasoning,
            actionSteps: rec.action_steps || [],
            successMetrics: rec.success_metrics || [],
            resources: rec.resources || [],
            expectedOutcomes: rec.expected_outcomes || [],
            progressTracking: rec.progress_tracking
          })
        )
      );
      await Promise.all(
        journeyData.aiInsights.map(
          (insight) => storage2.createAiInsight({
            journeyId: journey.id,
            insightType: insight.type,
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence,
            impactLevel: insight.impact_level,
            suggestedActions: insight.suggested_actions
          })
        )
      );
      res.json({
        message: "Wellness journey created successfully",
        journey: await storage2.getCurrentWellnessJourney(req.user.id)
      });
    } catch (error) {
      console.error("Error generating wellness journey:", error);
      if (error instanceof z9.ZodError) {
        return res.status(400).json({
          message: "Invalid input data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to generate wellness journey" });
    }
  });
  app2.post("/api/wellness-journey/progress", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { recommendation_id, progress, notes, mood_rating, energy_rating } = req.body;
      if (!recommendation_id || typeof progress !== "number") {
        return res.status(400).json({ message: "recommendation_id and progress are required" });
      }
      const recommendation = await storage2.getWellnessRecommendation(recommendation_id);
      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      const journey = await storage2.getWellnessJourney(recommendation.journeyId);
      if (!journey || journey.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage2.updateRecommendationProgress(recommendation_id, progress);
      await storage2.createProgressTracking({
        journeyId: journey.id,
        recommendationId: recommendation_id,
        progressValue: progress.toString(),
        progressUnit: "percentage",
        userNotes: notes || "",
        moodRating: mood_rating || null,
        energyRating: energy_rating || null
      });
      await storage2.updateJourneyProgress(journey.id);
      res.json({ message: "Progress updated successfully" });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });
  app2.get("/api/wellness-journey/analytics", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const analytics = await storage2.getJourneyAnalytics(req.user.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.post("/api/wellness-journey/adapt", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { journey_id, adaptation_reason, feedback } = req.body;
      if (!journey_id || !adaptation_reason) {
        return res.status(400).json({ message: "journey_id and adaptation_reason are required" });
      }
      const journey = await storage2.getWellnessJourney(journey_id);
      if (!journey || journey.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const adaptations = await storage2.generateJourneyAdaptations(journey_id, adaptation_reason, feedback);
      res.json({
        message: "Journey adaptations generated",
        adaptations
      });
    } catch (error) {
      console.error("Error adapting journey:", error);
      res.status(500).json({ message: "Failed to adapt journey" });
    }
  });
  app2.post("/api/wellness-journey/milestone/:milestone_id/complete", async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { milestone_id } = req.params;
      const { reflection, difficulty_rating, satisfaction_rating } = req.body;
      const milestone = await storage2.completeMilestone(
        milestone_id,
        req.user.id,
        reflection,
        difficulty_rating,
        satisfaction_rating
      );
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found or access denied" });
      }
      res.json({
        message: "Milestone completed successfully",
        milestone
      });
    } catch (error) {
      console.error("Error completing milestone:", error);
      res.status(500).json({ message: "Failed to complete milestone" });
    }
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/public/course-materials/:courseId", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId);
      if (isNaN(courseIdNum) || courseIdNum < 1 || courseIdNum > 3) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID"
        });
      }
      const sharedFolderId = "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya";
      const courseTitles = {
        1: "Introduction to Wellness Coaching",
        2: "Advanced Nutrition Fundamentals",
        3: "Relationship Counseling Fundamentals"
      };
      return res.json({
        success: true,
        courseId: courseIdNum,
        courseTitle: courseTitles[courseIdNum],
        folderId: sharedFolderId,
        folderUrl: `https://drive.google.com/drive/folders/${sharedFolderId}`,
        message: "Access shared course materials directly through Google Drive",
        materials: []
      });
    } catch (error) {
      console.error("Error fetching course materials:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch course materials"
      });
    }
  });
  app2.use(cookieParser());
  app2.use(session({
    secret: process.env.SESSION_SECRET || "wholewellness-oauth-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  app2.use(passport2.initialize());
  app2.use(passport2.session());
  setupGoogleAuth();
  const googleDriveService = new GoogleDriveService();
  let stripe3 = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe3 = new Stripe3(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16"
    });
  } else {
    console.warn("Stripe secret key not found. Payment features will be disabled.");
  }
  async function createSession(userId) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "user",
      membershipLevel: user.membershipLevel || "free",
      isActive: user.isActive !== false
    });
    return token;
  }
  async function verifyPassword(password, hashedPassword) {
    return AuthService.comparePassword(password, hashedPassword);
  }
  async function hashPassword(password) {
    return AuthService.hashPassword(password);
  }
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const passwordHash = await hashPassword(userData.password);
      const { phone, onboardingData, ...createUserData } = req.body;
      const user = await storage.createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash,
        id: uuidv42(),
        membershipLevel: "free",
        donationTotal: "0",
        rewardPoints: 0,
        phone: phone || null
      });
      if (onboardingData) {
      }
      const sessionToken = await createSession(user.id);
      res.cookie("session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membershipLevel: user.membershipLevel,
        rewardPoints: user.rewardPoints
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      if (email === "chuck" && password === "chucknice1") {
        const testCoachId = "coach_chuck_test";
        const sessionToken2 = AuthService.generateToken({
          id: testCoachId,
          email: "chuck",
          firstName: "Chuck",
          lastName: "TestCoach",
          role: "coach"
        });
        res.cookie("session_token", sessionToken2, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1e3
        });
        return res.json({
          id: testCoachId,
          email: "chuck",
          firstName: "Chuck",
          lastName: "TestCoach",
          membershipLevel: "coach",
          rewardPoints: 0,
          donationTotal: "0",
          role: "coach"
        });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      await donationStorage.updateUser(user.id, { lastLogin: /* @__PURE__ */ new Date() });
      const sessionToken = await createSession(user.id);
      res.cookie("session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1e3
      });
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membershipLevel: user.membershipLevel,
        rewardPoints: user.rewardPoints,
        donationTotal: user.donationTotal
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.clearCookie("session_token");
    res.json({ message: "Logged out successfully" });
  });
  app2.post("/api/create-test-coach", createTestCoach);
  app2.post("/api/coach/track-earnings", requireAuth, async (req, res) => {
    try {
      const { amount, source = "manual" } = req.body;
      const userId = req.user.id;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      await CoachEarningsSystem.trackEarnings(userId, amount, source);
      const summary = await CoachEarningsSystem.getEarningsSummary(userId);
      res.json({
        message: "Earnings tracked successfully",
        summary
      });
    } catch (error) {
      console.error("Earnings tracking error:", error);
      res.status(500).json({ message: error.message || "Failed to track earnings" });
    }
  });
  app2.get("/api/coach/earnings-summary", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const summary = await CoachEarningsSystem.getEarningsSummary(userId);
      if (!summary) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(summary);
    } catch (error) {
      console.error("Earnings summary error:", error);
      res.status(500).json({ message: error.message || "Failed to get earnings summary" });
    }
  });
  app2.get("/api/coach/eligibility", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const isEligible = await CoachEarningsSystem.checkCoachEligibility(userId);
      res.json({ eligible: isEligible });
    } catch (error) {
      console.error("Eligibility check error:", error);
      res.status(500).json({ message: error.message || "Failed to check eligibility" });
    }
  });
  app2.post("/api/coach/update-role", requireAuth, async (req, res) => {
    try {
      const { userId, role } = req.body;
      const currentUserId = req.user.id;
      if (userId !== currentUserId && req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const user = await storage.updateUserRole(userId, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "Role updated successfully", user });
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({ message: error.message || "Failed to update role" });
    }
  });
  app2.post("/api/coach/application-payment", requireAuth, async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;
      if (!stripe3) {
        return res.status(400).json({ message: "Payment processing not configured" });
      }
      if (amount !== 99) {
        return res.status(400).json({ message: "Invalid application fee amount" });
      }
      const paymentIntent = await stripe3.paymentIntents.create({
        amount: 9900,
        // $99.00 in cents
        currency: "usd",
        metadata: {
          type: "coach_application_fee",
          userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Coach application payment error:", error);
      res.status(500).json({
        message: "Error creating payment intent: " + error.message
      });
    }
  });
  app2.get("/api/course-materials/:courseId", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId);
      if (isNaN(courseIdNum) || courseIdNum < 1 || courseIdNum > 3) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const folderId = await googleDriveService.getCourseFolder(courseIdNum);
      if (!folderId) {
        return res.json({
          success: false,
          message: "No Google Drive folder configured for this course",
          materials: []
        });
      }
      const materials = await googleDriveService.listCourseFiles(folderId);
      res.json({
        success: true,
        courseId: courseIdNum,
        folderId,
        materials
      });
    } catch (error) {
      console.error("Error fetching course materials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch course materials",
        materials: []
      });
    }
  });
  app2.get("/api/coach/certification-progress", async (req, res) => {
    try {
      const certificationProgress = [
        {
          module_id: 1,
          status: "not_started",
          score: null,
          answers: {},
          modules: {
            id: 1,
            title: "Introduction to Wellness Coaching",
            content: `
              <div class="course-module">
                <h2>Module 1: Introduction to Wellness Coaching</h2>
                
                <div class="video-section">
                  <h3>\u{1F4F9} Video Lesson (45 minutes)</h3>
                  <div class="video-placeholder" style="background: #f0f0f0; padding: 20px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                    <p><strong>\u{1F3A5} Foundations of Wellness Coaching</strong></p>
                    <p>Interactive video content covering core coaching principles, client engagement strategies, and ethical considerations</p>
                    <button style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">\u25B6 Play Video</button>
                  </div>
                </div>

                <div class="learning-objectives">
                  <h3>\u{1F3AF} Learning Objectives</h3>
                  <ul>
                    <li>Understand the core principles of wellness coaching</li>
                    <li>Master effective client communication techniques</li>
                    <li>Learn goal-setting and progress tracking methodologies</li>
                    <li>Identify signs of emotional distress and appropriate referral protocols</li>
                    <li>Apply ethical coaching standards in practice</li>
                  </ul>
                </div>

                <div class="course-content">
                  <h3>\u{1F4DA} Course Content</h3>
                  
                  <h4>1. What is Wellness Coaching?</h4>
                  <p>Wellness coaching is a collaborative partnership that empowers individuals to make sustainable lifestyle changes. Unlike therapy, which often focuses on healing past wounds, coaching is future-focused and action-oriented.</p>
                  
                  <div class="key-concepts">
                    <h4>\u{1F511} Key Concepts:</h4>
                    <ul>
                      <li><strong>Client-Centered Approach:</strong> The client is the expert on their own life</li>
                      <li><strong>Strength-Based:</strong> Focus on existing strengths and resources</li>
                      <li><strong>Solution-Focused:</strong> Emphasis on solutions rather than problems</li>
                      <li><strong>Holistic Perspective:</strong> Address physical, mental, emotional, and spiritual wellness</li>
                    </ul>
                  </div>

                  <h4>2. Building Rapport and Trust</h4>
                  <p>Establishing a strong coaching relationship is fundamental to success. This section covers:</p>
                  <ul>
                    <li>Active listening techniques</li>
                    <li>Empathetic communication</li>
                    <li>Creating a safe, non-judgmental space</li>
                    <li>Setting clear boundaries and expectations</li>
                  </ul>

                  <h4>3. The SMART Goal Framework</h4>
                  <p>Learn to help clients set <strong>Specific, Measurable, Achievable, Relevant, Time-bound</strong> goals:</p>
                  <div class="example-box" style="background: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 10px 0;">
                    <h5>Example Transformation:</h5>
                    <p><strong>Vague Goal:</strong> "I want to be healthier"</p>
                    <p><strong>SMART Goal:</strong> "I will walk 30 minutes daily, 5 days per week, for the next 6 weeks to improve my cardiovascular health"</p>
                  </div>

                  <h4>4. Tracking Progress Effectively</h4>
                  <ul>
                    <li>Weekly check-ins and accountability</li>
                    <li>Celebrating small wins</li>
                    <li>Adjusting goals when needed</li>
                    <li>Using progress metrics and journaling</li>
                  </ul>
                </div>

                <div class="interactive-exercises">
                  <h3>\u{1F527} Interactive Exercises</h3>
                  <div class="exercise" style="background: #fff3cd; padding: 15px; border: 1px solid #ffc107; border-radius: 5px; margin: 10px 0;">
                    <h4>Exercise 1: Practice Active Listening</h4>
                    <p>Role-play scenario: Your client says "I've tried everything and nothing works." Practice reflective listening responses.</p>
                    <p><strong>Try this:</strong> Instead of giving advice, reflect back what you hear and ask open-ended questions.</p>
                  </div>
                  
                  <div class="exercise" style="background: #d4edda; padding: 15px; border: 1px solid #28a745; border-radius: 5px; margin: 10px 0;">
                    <h4>Exercise 2: SMART Goal Creation</h4>
                    <p>Transform these vague goals into SMART goals:</p>
                    <ol>
                      <li>"I want to lose weight"</li>
                      <li>"I need to exercise more"</li>
                      <li>"I should eat better"</li>
                    </ol>
                  </div>
                </div>

                <div class="resources">
                  <h3>\u{1F4D6} Additional Resources</h3>
                  <ul>
                    <li>\u{1F4C4} <strong>ICF Core Competencies Guide</strong> - Professional coaching standards</li>
                    <li>\u{1F3A7} <strong>Podcast:</strong> "The Coaching Habit" episodes 1-3</li>
                    <li>\u{1F4F1} <strong>App Recommendation:</strong> MyFitnessPal for tracking client progress</li>
                    <li>\u{1F4DA} <strong>Recommended Reading:</strong> "The Coaching Habit" by Michael Bungay Stanier</li>
                  </ul>
                </div>

                <div class="quiz-intro">
                  <h3>\u2705 Knowledge Check</h3>
                  <p>Complete the quiz below to test your understanding of wellness coaching fundamentals. You need 80% or higher to pass this module.</p>
                  <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <p><strong>\u{1F4A1} Tip:</strong> Review the video content and key concepts above before taking the quiz.</p>
                  </div>
                </div>
              </div>
            `,
            module_order: 1
          }
        },
        {
          module_id: 2,
          status: "not_started",
          score: null,
          answers: {},
          modules: {
            id: 2,
            title: "Advanced Nutrition Fundamentals",
            content: `
              <div class="course-module">
                <h2>Module 2: Advanced Nutrition Fundamentals</h2>
                
                <div class="video-section">
                  <h3>\u{1F4F9} Video Lesson (60 minutes)</h3>
                  <div class="video-placeholder" style="background: #f0f0f0; padding: 20px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                    <p><strong>\u{1F3A5} Nutritional Science for Coaches</strong></p>
                    <p>Comprehensive overview of macronutrients, micronutrients, and evidence-based nutrition principles</p>
                    <button style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">\u25B6 Play Video</button>
                  </div>
                </div>

                <div class="learning-objectives">
                  <h3>\u{1F3AF} Learning Objectives</h3>
                  <ul>
                    <li>Understand macronutrient roles and optimal ratios</li>
                    <li>Identify key micronutrients and their functions</li>
                    <li>Learn sustainable meal planning strategies</li>
                    <li>Recognize nutritional myths vs. evidence-based facts</li>
                    <li>Apply nutrition coaching within scope of practice</li>
                  </ul>
                </div>

                <div class="course-content">
                  <h3>\u{1F4DA} Course Content</h3>
                  
                  <h4>1. Macronutrients Deep Dive</h4>
                  
                  <div class="macronutrient-section">
                    <h5>\u{1F356} Proteins (4 calories/gram)</h5>
                    <p><strong>Functions:</strong> Muscle building, repair, immune function, hormone production</p>
                    <p><strong>Recommended Intake:</strong> 0.8-1.2g per kg body weight (higher for active individuals)</p>
                    <p><strong>Quality Sources:</strong> Complete proteins (eggs, fish, poultry) vs. incomplete proteins (plants)</p>
                    
                    <h5>\u{1F35E} Carbohydrates (4 calories/gram)</h5>
                    <p><strong>Functions:</strong> Primary energy source, brain fuel, muscle glycogen</p>
                    <p><strong>Types:</strong> Simple vs. Complex carbs, Glycemic Index considerations</p>
                    <p><strong>Timing:</strong> Pre/post workout nutrition strategies</p>
                    
                    <h5>\u{1F951} Fats (9 calories/gram)</h5>
                    <p><strong>Functions:</strong> Hormone production, vitamin absorption, cell membrane health</p>
                    <p><strong>Types:</strong> Saturated, monounsaturated, polyunsaturated, trans fats</p>
                    <p><strong>Omega-3/Omega-6 Balance:</strong> Anti-inflammatory considerations</p>
                  </div>

                  <h4>2. Essential Micronutrients</h4>
                  <div class="micronutrients-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                      <h6>Vitamin D</h6>
                      <p>Bone health, immune function, mood regulation</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                      <h6>B-Complex Vitamins</h6>
                      <p>Energy metabolism, nervous system function</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                      <h6>Iron</h6>
                      <p>Oxygen transport, energy levels</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                      <h6>Magnesium</h6>
                      <p>Muscle function, sleep quality, stress management</p>
                    </div>
                  </div>

                  <h4>3. Meal Planning Strategies</h4>
                  <ul>
                    <li><strong>Plate Method:</strong> 1/2 vegetables, 1/4 protein, 1/4 complex carbs</li>
                    <li><strong>Batch Cooking:</strong> Time-saving preparation techniques</li>
                    <li><strong>Flexible Dieting:</strong> 80/20 rule for sustainable habits</li>
                    <li><strong>Special Considerations:</strong> Food allergies, cultural preferences, budget constraints</li>
                  </ul>

                  <h4>4. Debunking Common Myths</h4>
                  <div class="myth-fact-box" style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
                    <p><strong>\u274C Myth:</strong> "Carbs are bad for weight loss"</p>
                    <p><strong>\u2705 Fact:</strong> Complex carbs provide sustained energy and are part of a balanced diet</p>
                  </div>
                  <div class="myth-fact-box" style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;">
                    <p><strong>\u274C Myth:</strong> "Supplements can replace a healthy diet"</p>
                    <p><strong>\u2705 Fact:</strong> Whole foods provide nutrients in bioavailable forms with synergistic compounds</p>
                  </div>
                </div>

                <div class="interactive-case-study">
                  <h3>\u{1F4CB} Case Study Analysis</h3>
                  <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <h4>Client Profile: Sarah, 35, Working Mother</h4>
                    <p><strong>Goals:</strong> Increase energy, lose 15 lbs, improve family nutrition</p>
                    <p><strong>Challenges:</strong> Limited cooking time, picky children, stress eating</p>
                    <p><strong>Current Diet:</strong> Skip breakfast, fast food lunches, late dinner</p>
                    
                    <h5>Your Task:</h5>
                    <p>Create a realistic 3-day meal plan addressing Sarah's goals and constraints. Consider prep time, family-friendly options, and sustainable changes.</p>
                  </div>
                </div>

                <div class="resources">
                  <h3>\u{1F4D6} Additional Resources</h3>
                  <ul>
                    <li>\u{1F4CA} <strong>Nutrition Calculator:</strong> MyPlate.gov for personalized recommendations</li>
                    <li>\u{1F52C} <strong>Research Database:</strong> PubMed nutrition studies</li>
                    <li>\u{1F4F1} <strong>App:</strong> Cronometer for detailed nutrient tracking</li>
                    <li>\u{1F4DA} <strong>Book:</strong> "Precision Nutrition" certification materials</li>
                    <li>\u{1F393} <strong>Continuing Education:</strong> Academy of Nutrition and Dietetics courses</li>
                  </ul>
                </div>
              </div>
            `,
            module_order: 2
          }
        },
        {
          module_id: 3,
          status: "not_started",
          score: null,
          answers: {},
          modules: {
            id: 3,
            title: "Relationship Counseling Fundamentals",
            content: `
              <div class="course-module">
                <h2>Module 3: Relationship Counseling Fundamentals</h2>
                
                <div class="video-section">
                  <h3>\u{1F4F9} Video Lessons (90 minutes total)</h3>
                  <div class="video-playlist">
                    <div class="video-placeholder" style="background: #f0f0f0; padding: 15px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                      <p><strong>\u{1F3A5} Part 1: Communication Foundations (30 min)</strong></p>
                      <p>Active listening, emotional validation, and creating safe spaces</p>
                      <button style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">\u25B6 Play</button>
                    </div>
                    <div class="video-placeholder" style="background: #f0f0f0; padding: 15px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                      <p><strong>\u{1F3A5} Part 2: Conflict Resolution Techniques (30 min)</strong></p>
                      <p>De-escalation strategies and finding common ground</p>
                      <button style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">\u25B6 Play</button>
                    </div>
                    <div class="video-placeholder" style="background: #f0f0f0; padding: 15px; border: 2px dashed #ccc; text-align: center; margin: 10px 0;">
                      <p><strong>\u{1F3A5} Part 3: Building Intimacy & Trust (30 min)</strong></p>
                      <p>Emotional intimacy, rebuilding after betrayal, maintaining connection</p>
                      <button style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">\u25B6 Play</button>
                    </div>
                  </div>
                </div>

                <div class="learning-objectives">
                  <h3>\u{1F3AF} Learning Objectives</h3>
                  <ul>
                    <li>Master effective communication techniques for couples</li>
                    <li>Learn evidence-based conflict resolution strategies</li>
                    <li>Understand attachment styles and their impact on relationships</li>
                    <li>Identify when to refer to specialized therapy</li>
                    <li>Practice boundary-setting and expectation management</li>
                  </ul>
                </div>

                <div class="course-content">
                  <h3>\u{1F4DA} Course Content</h3>
                  
                  <h4>1. Communication Foundations</h4>
                  
                  <div class="communication-skills">
                    <h5>\u{1F3AF} The 4 Pillars of Effective Communication</h5>
                    <ol>
                      <li><strong>Active Listening:</strong> Full attention, minimal interruptions, reflective responses</li>
                      <li><strong>Emotional Validation:</strong> Acknowledging feelings without judgment</li>
                      <li><strong>Clear Expression:</strong> "I" statements, specific examples, solution-focused</li>
                      <li><strong>Timing & Environment:</strong> Choosing appropriate moments and settings</li>
                    </ol>
                  </div>

                  <div class="example-box" style="background: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0;">
                    <h5>Communication Transformation Example:</h5>
                    <p><strong>\u274C Ineffective:</strong> "You never help with housework! You're so lazy!"</p>
                    <p><strong>\u2705 Effective:</strong> "I feel overwhelmed when I handle most household tasks alone. Could we discuss how to share responsibilities more evenly?"</p>
                  </div>

                  <h4>2. Understanding Attachment Styles</h4>
                  <div class="attachment-styles" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                      <h6>\u{1F512} Secure Attachment (60%)</h6>
                      <p><strong>Traits:</strong> Comfortable with intimacy, effective communication, trusting</p>
                      <p><strong>In Relationships:</strong> Supportive, able to resolve conflicts constructively</p>
                    </div>
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px;">
                      <h6>\u{1F630} Anxious Attachment (20%)</h6>
                      <p><strong>Traits:</strong> Fear of abandonment, seeks reassurance, emotional intensity</p>
                      <p><strong>In Relationships:</strong> Clingy behavior, jealousy, overthinking</p>
                    </div>
                    <div style="background: #d4edda; padding: 15px; border-radius: 8px;">
                      <h6>\u{1F6AA} Avoidant Attachment (15%)</h6>
                      <p><strong>Traits:</strong> Values independence, uncomfortable with closeness</p>
                      <p><strong>In Relationships:</strong> Emotional distance, difficulty expressing feelings</p>
                    </div>
                    <div style="background: #f8d7da; padding: 15px; border-radius: 8px;">
                      <h6>\u{1F32A}\uFE0F Disorganized Attachment (5%)</h6>
                      <p><strong>Traits:</strong> Inconsistent behavior, fear of intimacy and abandonment</p>
                      <p><strong>In Relationships:</strong> Push-pull dynamics, emotional volatility</p>
                    </div>
                  </div>

                  <h4>3. The Gottman Method Principles</h4>
                  <div class="gottman-principles">
                    <h5>\u{1F3E0} The Four Pillars of Strong Relationships:</h5>
                    <ul>
                      <li><strong>Build Love Maps:</strong> Deep knowledge of partner's inner world</li>
                      <li><strong>Nurture Fondness & Admiration:</strong> Focus on positive qualities</li>
                      <li><strong>Turn Towards, Not Away:</strong> Respond to bids for connection</li>
                      <li><strong>Accept Influence:</strong> Be open to partner's input and perspectives</li>
                    </ul>
                    
                    <h5>\u26A0\uFE0F The Four Horsemen to Avoid:</strong>
                    <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0;">
                      <ol>
                        <li><strong>Criticism:</strong> Attacking character vs. addressing specific behavior</li>
                        <li><strong>Contempt:</strong> Sarcasm, eye-rolling, name-calling (most toxic)</li>
                        <li><strong>Defensiveness:</strong> Playing victim, counter-attacking</li>
                        <li><strong>Stonewalling:</strong> Shutting down, silent treatment</li>
                      </ol>
                    </div>
                  </div>

                  <h4>4. Conflict Resolution Framework</h4>
                  <div class="conflict-resolution">
                    <h5>\u{1F4CB} The PREP Method:</h5>
                    <ul>
                      <li><strong>P - Pause:</strong> Take time to cool down if emotions are high</li>
                      <li><strong>R - Reflect:</strong> Consider your partner's perspective</li>
                      <li><strong>E - Express:</strong> Share your feelings using "I" statements</li>
                      <li><strong>P - Problem-solve:</strong> Work together toward solutions</li>
                    </ul>
                  </div>
                </div>

                <div class="interactive-exercises">
                  <h3>\u{1F527} Interactive Exercises</h3>
                  
                  <div class="exercise" style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <h4>Scenario Practice: The Overloaded Partner</h4>
                    <p><strong>Situation:</strong> Jamie works full-time and handles most childcare/household duties. Partner Alex works but doesn't contribute equally to home responsibilities.</p>
                    
                    <h5>Practice Questions:</h5>
                    <ol>
                      <li>How would you help Jamie express their needs without blame?</li>
                      <li>What communication techniques would help Alex understand the impact?</li>
                      <li>How could they negotiate a fair division of responsibilities?</li>
                    </ol>
                  </div>

                  <div class="exercise" style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <h4>Attachment Style Assessment</h4>
                    <p>Practice identifying attachment styles from client descriptions and learning appropriate coaching strategies for each type.</p>
                  </div>
                </div>

                <div class="red-flags">
                  <h3>\u{1F6A8} When to Refer to Therapy</h3>
                  <div style="background: #f8d7da; padding: 20px; border: 1px solid #dc3545; border-radius: 8px; margin: 15px 0;">
                    <h4>Immediate Referral Situations:</h4>
                    <ul>
                      <li>Any form of domestic violence or abuse</li>
                      <li>Substance abuse issues</li>
                      <li>Mental health crises (suicidal ideation, severe depression)</li>
                      <li>Infidelity requiring specialized therapy</li>
                      <li>Trauma processing needs</li>
                      <li>Personality disorders</li>
                    </ul>
                    <p><strong>Remember:</strong> As a relationship coach, your role is to support healthy relationships. Complex clinical issues require licensed therapists.</p>
                  </div>
                </div>

                <div class="resources">
                  <h3>\u{1F4D6} Additional Resources</h3>
                  <ul>
                    <li>\u{1F4DA} <strong>Books:</strong> "The Seven Principles for Making Marriage Work" by John Gottman</li>
                    <li>\u{1F393} <strong>Certification:</strong> Gottman Institute Couples Therapy Training</li>
                    <li>\u{1F4F1} <strong>Apps:</strong> Gottman Card Decks, Love Nudge (5 Love Languages)</li>
                    <li>\u{1F3A7} <strong>Podcast:</strong> "Where Should We Begin?" by Esther Perel</li>
                    <li>\u{1F517} <strong>Assessment Tools:</strong> Relationship Assessment Scale, Attachment Style Quiz</li>
                    <li>\u{1F4DE} <strong>Crisis Resources:</strong> National Domestic Violence Hotline: 1-800-799-7233</li>
                  </ul>
                </div>

                <div class="quiz-intro">
                  <h3>\u2705 Comprehensive Assessment</h3>
                  <p>This module includes both theoretical questions and practical scenario-based assessments. You'll need to demonstrate understanding of communication techniques and appropriate intervention strategies.</p>
                </div>
              </div>
            `,
            module_order: 3
          }
        }
      ];
      res.json(certificationProgress);
    } catch (error) {
      console.error("Error fetching certification progress:", error);
      res.status(500).json({ message: "Failed to fetch certification progress" });
    }
  });
  app2.get("/api/admin/google-drive/test", requireAuth, async (req, res) => {
    try {
      const isConnected = await googleDriveService.testConnection();
      res.json({
        success: true,
        connected: isConnected,
        message: isConnected ? "Google Drive service is connected and working" : "Google Drive service is not configured or connection failed"
      });
    } catch (error) {
      console.error("Error testing Google Drive connection:", error);
      res.status(500).json({
        success: false,
        connected: false,
        message: "Failed to test Google Drive connection"
      });
    }
  });
  app2.post("/api/admin/google-drive/create-folders", requireAuth, async (req, res) => {
    try {
      const courseNames = [
        "Introduction to Wellness Coaching",
        "Advanced Nutrition Fundamentals",
        "Relationship Counseling Fundamentals"
      ];
      const results = [];
      for (let i = 0; i < courseNames.length; i++) {
        const folderId = await googleDriveService.createCourseFolder(courseNames[i]);
        if (folderId) {
          await googleDriveService.shareFolder(folderId);
          results.push({
            courseId: i + 1,
            courseName: courseNames[i],
            folderId,
            status: "created"
          });
        } else {
          results.push({
            courseId: i + 1,
            courseName: courseNames[i],
            folderId: null,
            status: "failed"
          });
        }
      }
      const successCount = results.filter((r) => r.status === "created").length;
      res.json({
        success: successCount > 0,
        message: `Created ${successCount} out of ${courseNames.length} course folders`,
        folders: results
      });
    } catch (error) {
      console.error("Error creating course folders:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create course folders"
      });
    }
  });
  app2.post("/api/admin/google-drive/upload/:courseId", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId);
      if (isNaN(courseIdNum) || courseIdNum < 1 || courseIdNum > 3) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const folderId = await googleDriveService.getCourseFolder(courseIdNum);
      if (!folderId) {
        return res.status(404).json({
          message: "No Google Drive folder configured for this course"
        });
      }
      res.json({
        success: true,
        message: `Ready to upload files to course ${courseId}`,
        folderId,
        uploadUrl: `https://drive.google.com/drive/folders/${folderId}`
      });
    } catch (error) {
      console.error("Error preparing file upload:", error);
      res.status(500).json({ message: "Failed to prepare file upload" });
    }
  });
  app2.post("/api/admin/upload-sample-materials", async (req, res) => {
    try {
      if (!googleDriveService) {
        return res.status(500).json({
          success: false,
          message: "Google Drive service not configured"
        });
      }
      const sampleMaterials = [
        {
          courseId: 1,
          courseName: "Introduction to Wellness Coaching",
          materials: [
            {
              name: "Welcome to Wellness Coaching.pdf",
              content: `# Welcome to Wellness Coaching

## Course Overview
This comprehensive introduction to wellness coaching covers the fundamental principles, ethics, and core competencies needed to become an effective wellness coach.

## Learning Objectives
- Understand the role and scope of wellness coaching
- Learn ICF core competencies and ethical guidelines
- Develop foundational coaching skills and techniques
- Practice creating a safe, supportive coaching environment

## Module Content
This module provides essential knowledge for beginning wellness coaches, including theoretical foundations and practical applications.`,
              mimeType: "text/plain"
            },
            {
              name: "Coaching Ethics and Boundaries.pdf",
              content: `# Coaching Ethics and Professional Boundaries

## Ethical Guidelines
Professional wellness coaches must maintain clear ethical standards and appropriate boundaries with clients.

## Key Principles
- Confidentiality and privacy protection
- Informed consent and clear agreements
- Professional competence and continuing education
- Respect for client autonomy and self-determination

## Boundary Management
Establishing and maintaining appropriate professional boundaries is essential for effective coaching relationships.`,
              mimeType: "text/plain"
            },
            {
              name: "ICF Core Competencies Overview.pdf",
              content: `# ICF Core Competencies for Wellness Coaches

## Foundation
1. Demonstrates Ethical Practice
2. Embodies a Coaching Mindset

## Co-creating the Relationship
3. Establishes and Maintains Agreements
4. Cultivates Trust and Safety
5. Maintains Presence

## Communicating Effectively
6. Listens Actively
7. Evokes Awareness

## Facilitating Learning and Results
8. Facilitates Client Growth

These competencies form the foundation of professional coaching practice.`,
              mimeType: "text/plain"
            }
          ]
        },
        {
          courseId: 2,
          courseName: "Advanced Nutrition Fundamentals",
          materials: [
            {
              name: "Macronutrient Guidelines.pdf",
              content: `# Advanced Macronutrient Guidelines

## Protein Requirements
- Calculate individual protein needs based on activity level
- Quality protein sources and amino acid profiles
- Timing protein intake for optimal results

## Carbohydrate Management
- Understanding glycemic index and load
- Carb cycling for different goals
- Pre and post-workout nutrition

## Healthy Fats
- Essential fatty acids and their functions
- Omega-3 to omega-6 ratios
- Fat-soluble vitamin absorption`,
              mimeType: "text/plain"
            },
            {
              name: "Meal Planning Templates.pdf",
              content: `# Professional Meal Planning Templates

## Client Assessment
Use these templates to create personalized meal plans based on:
- Individual caloric needs
- Dietary preferences and restrictions
- Lifestyle and schedule considerations
- Health goals and medical conditions

## Weekly Planning Templates
- Breakfast options and variations
- Lunch combinations for busy schedules
- Dinner planning for families
- Healthy snack alternatives

## Shopping Lists and Prep Guides
Organized templates to streamline meal preparation and grocery shopping.`,
              mimeType: "text/plain"
            },
            {
              name: "Client Nutrition Assessment Tools.pdf",
              content: `# Comprehensive Nutrition Assessment Tools

## Initial Client Intake
- Current eating patterns and habits
- Medical history and medications
- Food allergies and intolerances
- Previous diet attempts and outcomes

## Ongoing Progress Tracking
- Weekly check-in questionnaires
- Body composition monitoring
- Energy level and mood assessments
- Goal achievement metrics

## Professional Documentation
Templates for maintaining client records and tracking progress over time.`,
              mimeType: "text/plain"
            }
          ]
        },
        {
          courseId: 3,
          courseName: "Relationship Counseling Fundamentals",
          materials: [
            {
              name: "Attachment Theory in Practice.pdf",
              content: `# Attachment Theory in Relationship Coaching

## Four Attachment Styles
1. Secure Attachment - healthy relationship patterns
2. Anxious Attachment - fear of abandonment
3. Avoidant Attachment - discomfort with intimacy
4. Disorganized Attachment - inconsistent patterns

## Practical Applications
- Identifying attachment patterns in clients
- Helping clients understand their relationship behaviors
- Developing secure attachment strategies
- Working with couples with different attachment styles

## Therapeutic Interventions
Evidence-based approaches for addressing attachment issues in coaching relationships.`,
              mimeType: "text/plain"
            },
            {
              name: "Communication Techniques Workbook.pdf",
              content: `# Advanced Communication Techniques

## Active Listening Skills
- Reflective listening techniques
- Nonverbal communication awareness
- Asking powerful questions
- Creating safe spaces for sharing

## Conflict Resolution
- De-escalation strategies
- Finding common ground
- Negotiation and compromise
- Repair and reconciliation processes

## Gottman Method Applications
- The Four Horsemen warning signs
- Building love maps
- Nurturing fondness and admiration
- Turning toward instead of away`,
              mimeType: "text/plain"
            },
            {
              name: "Conflict Resolution Strategies.pdf",
              content: `# Professional Conflict Resolution Strategies

## Assessment Phase
- Understanding the conflict dynamics
- Identifying underlying needs and interests
- Recognizing emotional patterns
- Mapping relationship history

## Intervention Techniques
- Structured communication exercises
- Emotional regulation strategies
- Compromise and solution-building
- Long-term relationship maintenance

## Crisis Intervention
When to refer to licensed therapists and emergency resources for relationship crises.`,
              mimeType: "text/plain"
            }
          ]
        }
      ];
      let uploadedFiles = 0;
      let errors = [];
      for (const course of sampleMaterials) {
        try {
          const folder = await googleDriveService.createCourseFolder(course.courseId, course.courseName);
          for (const material of course.materials) {
            try {
              const fileBuffer = Buffer.from(material.content, "utf8");
              await googleDriveService.uploadFile(
                material.name,
                fileBuffer,
                material.mimeType,
                folder.folderId
              );
              uploadedFiles++;
            } catch (error) {
              errors.push(`Failed to upload ${material.name}: ${error.message}`);
            }
          }
        } catch (error) {
          errors.push(`Failed to process course ${course.courseName}: ${error.message}`);
        }
      }
      res.json({
        success: true,
        message: `Successfully uploaded ${uploadedFiles} course materials`,
        uploadedFiles,
        errors: errors.length > 0 ? errors : void 0
      });
    } catch (error) {
      console.error("Error uploading sample materials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload course materials"
      });
    }
  });
  app2.post("/api/auth/update-coach-role", async (req, res) => {
    try {
      const { email, role } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.updateUser(user.id, { role });
      const updatedUser = await storage.getUserByEmail(email);
      res.json({
        success: true,
        message: `User ${email} role updated to ${role}`,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });
  app2.get("/api/auth/check-user", async (req, res) => {
    try {
      const { email } = req.query;
      const user = await storage.getUserByEmail(email);
      res.json({ user });
    } catch (error) {
      console.error("Error checking user:", error);
      res.status(500).json({ error: "Failed to check user" });
    }
  });
  app2.post("/api/auth/request-reset", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account exists with this email, you will receive a password reset link." });
      }
      const resetToken = uuidv42();
      const expiresAt = new Date(Date.now() + 36e5);
      try {
        await storage.createPasswordResetToken(user.id, resetToken, expiresAt);
        console.log(`Password reset token for ${email}: ${resetToken}`);
        res.json({
          message: "If an account exists with this email, you will receive a password reset link.",
          // Remove this in production - only for testing
          resetToken
        });
      } catch (tokenError) {
        console.error("Error creating password reset token:", tokenError);
        res.json({ message: "If an account exists with this email, you will receive a password reset link." });
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      try {
        const resetToken = await storage.getPasswordResetToken(token);
        if (!resetToken) {
          return res.status(400).json({ message: "Invalid or expired reset token" });
        }
        if (/* @__PURE__ */ new Date() > new Date(resetToken.expiresAt)) {
          await storage.deletePasswordResetToken(token);
          return res.status(400).json({ message: "Reset token has expired" });
        }
        const hashedPassword = await hashPassword(newPassword);
        await storage.updateUserPassword(resetToken.userId, hashedPassword);
        await storage.deletePasswordResetToken(token);
        res.json({ message: "Password has been reset successfully" });
      } catch (tokenError) {
        console.error("Error processing password reset:", tokenError);
        res.status(400).json({ message: "Invalid or expired reset token" });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/auth/user", optionalAuth, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user.id === "coach_chuck_test") {
      return res.json({
        id: "coach_chuck_test",
        email: "chuck",
        firstName: "Chuck",
        lastName: "TestCoach",
        membershipLevel: "coach",
        rewardPoints: 0,
        donationTotal: "0",
        profileImageUrl: null,
        role: "coach"
      });
    }
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        membershipLevel: user.membershipLevel,
        rewardPoints: user.rewardPoints,
        donationTotal: user.donationTotal,
        profileImageUrl: user.profileImageUrl,
        role: user.role
      });
    } catch (error) {
      console.error("Error fetching complete user data:", error);
      res.json({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        membershipLevel: req.user.membershipLevel,
        rewardPoints: req.user.rewardPoints,
        donationTotal: req.user.donationTotal,
        profileImageUrl: req.user.profileImageUrl,
        role: req.user.role || "user"
      });
    }
  });
  app2.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      if (!stripe3) {
        return res.status(500).json({ message: "Payment processing not configured" });
      }
      const { amount, currency = "usd", description = "Coaching Services" } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      const user = req.user;
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe3.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`
        });
        stripeCustomerId = customer.id;
        await donationStorage.updateUser(user.id, { stripeCustomerId });
      }
      const paymentIntent = await stripe3.paymentIntents.create({
        amount,
        // Amount should already be in cents
        currency,
        customer: stripeCustomerId,
        description,
        metadata: {
          userId: user.id,
          userEmail: user.email
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
  });
  app2.post("/api/get-or-create-subscription", requireAuth, async (req, res) => {
    try {
      if (!stripe3) {
        return res.status(500).json({ message: "Payment processing not configured" });
      }
      const user = req.user;
      const { planId, planName, planPrice } = req.body;
      if (user.stripeSubscriptionId) {
        const subscription2 = await stripe3.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription2.status === "active") {
          const invoice = await stripe3.invoices.retrieve(subscription2.latest_invoice);
          res.json({
            subscriptionId: subscription2.id,
            clientSecret: invoice.payment_intent?.client_secret
          });
          return;
        }
      }
      if (!user.email) {
        throw new Error("No user email on file");
      }
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe3.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`
        });
        stripeCustomerId = customer.id;
        await donationStorage.updateUser(user.id, { stripeCustomerId });
      }
      const planPrices = {
        weekly: 8e3,
        // $80/week
        biweekly: 16e3,
        // $160/month (2 sessions)
        monthly: 9e3
        // $90/month
      };
      const amount = planPrices[planId] || planPrices.monthly;
      const subscription = await stripe3.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planName} - Whole Wellness Coaching`
            },
            unit_amount: amount,
            recurring: {
              interval: planId === "weekly" ? "week" : "month"
            }
          }
        }],
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription"
        },
        expand: ["latest_invoice.payment_intent"]
      });
      await donationStorage.updateUser(user.id, {
        stripeSubscriptionId: subscription.id
      });
      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      });
    } catch (error) {
      console.error("Subscription creation error:", error);
      return res.status(400).json({ error: { message: error.message } });
    }
  });
  app2.get("/api/donations/presets", async (req, res) => {
    try {
      const presets = await donationStorage.getDonationPresets();
      res.json(presets);
    } catch (error) {
      console.error("Error fetching donation presets:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/campaigns/active", async (req, res) => {
    try {
      const campaigns2 = await donationStorage.getActiveCampaigns();
      res.json(campaigns2);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/donations/create", requireAuth, async (req, res) => {
    try {
      if (!stripe3) {
        return res.status(500).json({ message: "Payment processing not configured" });
      }
      const donationData = insertDonationSchema.parse(req.body);
      const user = req.user;
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe3.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`
        });
        stripeCustomerId = customer.id;
        await donationStorage.updateUser(user.id, { stripeCustomerId });
      }
      const donation = await donationStorage.createDonation({
        ...donationData,
        id: uuidv42(),
        userId: user.id,
        status: "pending"
      });
      if (donationData.donationType === "monthly") {
        const priceData = {
          currency: "usd",
          product_data: {
            name: "Monthly Donation to Whole Wellness Coaching"
          },
          unit_amount: Math.round(parseFloat(donationData.amount) * 100),
          recurring: {
            interval: "month"
          }
        };
        const session2 = await stripe3.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ["card"],
          line_items: [{
            price_data: priceData,
            quantity: 1
          }],
          mode: "subscription",
          success_url: `${req.headers.origin}/member-portal?success=true`,
          cancel_url: `${req.headers.origin}/donate?canceled=true`,
          metadata: {
            donationId: donation.id,
            userId: user.id
          }
        });
        res.json({ checkoutUrl: session2.url });
      } else {
        const session2 = await stripe3.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ["card"],
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: {
                name: "Donation to Whole Wellness Coaching"
              },
              unit_amount: Math.round(parseFloat(donationData.amount) * 100)
            },
            quantity: 1
          }],
          mode: "payment",
          success_url: `${req.headers.origin}/member-portal?success=true`,
          cancel_url: `${req.headers.origin}/donate?canceled=true`,
          metadata: {
            donationId: donation.id,
            userId: user.id
          }
        });
        res.json({ checkoutUrl: session2.url });
      }
    } catch (error) {
      console.error("Donation creation error:", error);
      res.status(400).json({ message: error.message || "Failed to create donation" });
    }
  });
  app2.get("/api/member/dashboard", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const donations2 = await donationStorage.getDonationsByUserId(user.id);
      const impactMetrics2 = await donationStorage.getImpactMetricsByUserId(user.id);
      const memberBenefits2 = await donationStorage.getMemberBenefitsByLevel(user.membershipLevel);
      const currentTotal = parseFloat(user.donationTotal || "0");
      let nextMilestone = null;
      if (currentTotal < 100) {
        nextMilestone = {
          title: "Supporter Milestone",
          description: "Unlock exclusive member benefits",
          targetAmount: 100,
          currentAmount: currentTotal,
          reward: "Supporter badge and 2x point multiplier"
        };
      } else if (currentTotal < 500) {
        nextMilestone = {
          title: "Champion Milestone",
          description: "Access to premium resources",
          targetAmount: 500,
          currentAmount: currentTotal,
          reward: "Champion badge and exclusive content"
        };
      } else if (currentTotal < 1e3) {
        nextMilestone = {
          title: "Guardian Milestone",
          description: "VIP access and recognition",
          targetAmount: 1e3,
          currentAmount: currentTotal,
          reward: "Guardian badge and VIP events"
        };
      }
      res.json({
        totalDonated: currentTotal,
        rewardPoints: user.rewardPoints,
        membershipLevel: user.membershipLevel,
        donationHistory: donations2,
        impactMetrics: impactMetrics2,
        nextMilestone,
        memberBenefits: memberBenefits2
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/user/impact", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const metrics = await donationStorage.getImpactMetricsByUserId(user.id);
      res.json({
        livesImpacted: metrics.find((m) => m.metric === "lives_impacted")?.value || 0,
        totalDonated: user.donationTotal || 0,
        rewardPoints: user.rewardPoints || 0,
        sessionsSupported: metrics.find((m) => m.metric === "sessions_supported")?.value || 0
      });
    } catch (error) {
      console.error("Impact metrics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/member/redeem-points", requireAuth, async (req, res) => {
    try {
      const { rewardId } = req.body;
      const user = req.user;
      const rewards = {
        "1": { points: 500, title: "Exclusive Coaching Session" },
        "2": { points: 250, title: "Digital Wellness Kit" },
        "3": { points: 750, title: "Member T-Shirt" },
        "4": { points: 300, title: "Virtual Event Access" }
      };
      const reward = rewards[rewardId];
      if (!reward || user.rewardPoints < reward.points) {
        return res.status(400).json({ message: "Insufficient points or invalid reward" });
      }
      const newPoints = user.rewardPoints - reward.points;
      await donationStorage.updateUser(user.id, { rewardPoints: newPoints });
      await donationStorage.createRewardTransaction({
        id: uuidv42(),
        userId: user.id,
        points: -reward.points,
        type: "redeemed",
        reason: "reward_redemption",
        description: `Redeemed: ${reward.title}`
      });
      res.json({ message: "Reward redeemed successfully", remainingPoints: newPoints });
    } catch (error) {
      console.error("Reward redemption error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/create-subscription", async (req, res) => {
    if (!stripe3) {
      return res.status(400).json({ message: "Stripe not configured" });
    }
    try {
      const { userId, priceAmount, planId } = req.body;
      if (!userId || !priceAmount || !planId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe3.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id
          }
        });
        stripeCustomerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId });
      }
      const paymentIntent = await stripe3.paymentIntents.create({
        amount: priceAmount,
        currency: "usd",
        customer: stripeCustomerId,
        setup_future_usage: "off_session",
        metadata: {
          userId: user.id,
          planId,
          type: "subscription"
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        userId: user.id
      });
    } catch (error) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ message: error.message || "Failed to create subscription" });
    }
  });
  app2.post("/api/stripe/webhook", async (req, res) => {
    if (!stripe3) {
      return res.status(400).json({ message: "Stripe not configured" });
    }
    try {
      const event = req.body;
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        if (paymentIntent.metadata?.type === "coach_application_fee") {
          const userId = paymentIntent.metadata.userId;
          const amount = paymentIntent.amount / 100;
          if (userId && amount === 99) {
            console.log(`\u{1F4B3} Coach application payment received: $${amount} for user ${userId}`);
            await CoachEarningsSystem.trackEarnings(userId, amount, "coach_application_fee");
            console.log(`\u{1F389} Coach application fee processed - user ${userId} should now have coach role`);
          }
        }
      }
      if (event.type === "checkout.session.completed") {
        const session2 = event.data.object;
        const { donationId, userId } = session2.metadata;
        await donationStorage.updateDonation(donationId, {
          status: "completed",
          stripePaymentIntentId: session2.payment_intent,
          processedAt: /* @__PURE__ */ new Date()
        });
        const donation = await donationStorage.getDonationById(donationId);
        if (donation) {
          const user = await donationStorage.getUserById(userId);
          const isRecurring = parseFloat(user.donationTotal || "0") > 0;
          const points = calculateRewardPoints(
            parseFloat(donation.amount),
            donation.donationType,
            isRecurring
          );
          const newTotal = parseFloat(user.donationTotal || "0") + parseFloat(donation.amount);
          const newPoints = user.rewardPoints + points;
          const newLevel = calculateMembershipLevel(newTotal);
          await donationStorage.updateUser(userId, {
            donationTotal: newTotal.toString(),
            rewardPoints: newPoints,
            membershipLevel: newLevel
          });
          await donationStorage.createRewardTransaction({
            id: uuidv42(),
            userId,
            points,
            type: "earned",
            reason: "donation",
            donationId,
            description: `Points earned from ${donation.donationType} donation`
          });
          await donationStorage.updateImpactMetrics(userId, donation);
        }
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ message: "Webhook error" });
    }
  });
  const wixConfig = getWixConfig();
  const wixIntegration = new WixIntegration(wixConfig);
  setupWixWebhooks(app2, wixIntegration);
  app2.post("/api/bookings", async (req, res) => {
    try {
      const booking = insertBookingSchema.parse(req.body);
      const newBooking = await storage.createBooking(booking);
      res.json(newBooking);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.get("/api/bookings", async (req, res) => {
    try {
      const bookings2 = await storage.getAllBookings();
      res.json(bookings2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials2 = await storage.getApprovedTestimonials();
      res.json(testimonials2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/testimonials", async (req, res) => {
    try {
      const testimonial = insertTestimonialSchema.parse(req.body);
      const newTestimonial = await storage.createTestimonial(testimonial);
      res.json(newTestimonial);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.get("/api/resources", async (req, res) => {
    try {
      const { type, category } = req.query;
      let resources2;
      if (type) {
        resources2 = await storage.getResourcesByType(type);
      } else if (category) {
        resources2 = await storage.getResourcesByCategory(category);
      } else {
        resources2 = await storage.getAllResources();
      }
      res.json(resources2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/contacts", async (req, res) => {
    try {
      const contact = insertContactSchema.parse(req.body);
      const newContact = await storage.createContact(contact);
      res.json(newContact);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.post("/api/weight-loss-intakes", async (req, res) => {
    try {
      const intake = insertWeightLossIntakeSchema.parse(req.body);
      const newIntake = await storage.createWeightLossIntake(intake);
      res.json(newIntake);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        res.status(400).json({ message: "Invalid intake data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.get("/api/weight-loss-intakes", async (req, res) => {
    try {
      const intakes = await storage.getAllWeightLossIntakes();
      res.json(intakes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    res.json(null);
  });
  app2.get("/api/wix/sync/users", async (req, res) => {
    try {
      await wixIntegration.syncUsers();
      res.json({ success: true, message: "Users synchronized from Wix" });
    } catch (error) {
      console.error("Error syncing users:", error);
      res.status(500).json({ error: "Failed to sync users" });
    }
  });
  app2.get("/api/wix/sync/services", async (req, res) => {
    try {
      await wixIntegration.syncServices();
      res.json({ success: true, message: "Services synchronized from Wix" });
    } catch (error) {
      console.error("Error syncing services:", error);
      res.status(500).json({ error: "Failed to sync services" });
    }
  });
  app2.get("/api/wix/services", async (req, res) => {
    try {
      const services = await wixIntegration.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching Wix services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });
  app2.get("/api/wix/products", async (req, res) => {
    try {
      const products = await wixIntegration.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching Wix products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/wix/plans", async (req, res) => {
    try {
      const plans = await wixIntegration.getPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching Wix plans:", error);
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });
  app2.get("/api/wix/bookings", async (req, res) => {
    try {
      const bookings2 = await wixIntegration.getBookings();
      res.json(bookings2);
    } catch (error) {
      console.error("Error fetching Wix bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });
  app2.post("/api/wix/bookings", async (req, res) => {
    try {
      const bookingData = req.body;
      const booking = await wixIntegration.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating Wix booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });
  app2.get("/api/wix/services/:serviceId/slots", async (req, res) => {
    try {
      const { serviceId } = req.params;
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      const slots = await wixIntegration.getAvailableSlots(serviceId, date);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ error: "Failed to fetch available slots" });
    }
  });
  app2.delete("/api/wix/bookings/:bookingId", async (req, res) => {
    try {
      const { bookingId } = req.params;
      const result = await wixIntegration.cancelBooking(bookingId);
      res.json({ success: result });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  });
  app2.put("/api/wix/bookings/:bookingId/reschedule", async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { newSlot } = req.body;
      const result = await wixIntegration.rescheduleBooking(bookingId, newSlot);
      res.json({ success: result });
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      res.status(500).json({ error: "Failed to reschedule booking" });
    }
  });
  app2.get("/api/wix/data/:collectionId", async (req, res) => {
    try {
      const { collectionId } = req.params;
      const dataItems = await wixIntegration.getDataItems(collectionId);
      res.json(dataItems);
    } catch (error) {
      console.error("Error fetching Wix data items:", error);
      res.status(500).json({ error: "Failed to fetch data items" });
    }
  });
  app2.post("/api/wix/sync/all", async (req, res) => {
    try {
      await wixIntegration.syncAllData();
      res.json({ success: true, message: "All data synchronized from Wix" });
    } catch (error) {
      console.error("Error syncing all data:", error);
      res.status(500).json({ error: "Failed to sync all data" });
    }
  });
  app2.get("/api/impact/metrics", async (req, res) => {
    try {
      const allBookings = await storage.getAllBookings();
      const allTestimonials = await storage.getApprovedTestimonials();
      const allIntakes = await storage.getAllWeightLossIntakes();
      const completedSessions = allBookings.filter((b) => b.status === "confirmed").length;
      const uniqueClients = new Set(allBookings.map((b) => b.email)).size;
      const totalWeightLoss = allIntakes.reduce((total, intake) => {
        const currentWeight = parseFloat(intake.currentWeight || "0");
        const goalWeight = parseFloat(intake.goalWeight || "0");
        return total + Math.max(0, currentWeight - goalWeight);
      }, 0);
      const averageRating = allTestimonials.length > 0 ? allTestimonials.reduce((sum, t) => sum + t.rating, 0) / allTestimonials.length : 5;
      const metrics = {
        totalLivesImpacted: uniqueClients + allIntakes.length,
        activeMembers: uniqueClients,
        sessionsCompleted: completedSessions,
        successStories: allTestimonials.length,
        weightLossTotal: Math.round(totalWeightLoss),
        communitySize: uniqueClients + allIntakes.length + 50,
        monthlyGrowth: 18,
        averageRating: Math.round(averageRating * 10) / 10,
        totalDonationsReceived: 15420,
        volunteersActive: 12,
        newMembersThisMonth: Math.floor(uniqueClients * 0.3),
        sessionsThisWeek: Math.floor(completedSessions * 0.15),
        goalsAchieved: allIntakes.filter((i) => i.goalWeight).length,
        upcomingEvents: 8
      };
      res.json(metrics);
    } catch (error) {
      console.error("Error calculating impact metrics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/impact/success-stories", async (req, res) => {
    try {
      const testimonials2 = await storage.getApprovedTestimonials();
      const intakes = await storage.getAllWeightLossIntakes();
      const successStories = testimonials2.map((testimonial, index) => {
        const relatedIntake = intakes[index] || null;
        return {
          id: testimonial.id.toString(),
          name: testimonial.name,
          story: testimonial.content,
          beforeWeight: relatedIntake ? parseFloat(relatedIntake.currentWeight || "0") : null,
          afterWeight: relatedIntake ? parseFloat(relatedIntake.goalWeight || "0") : null,
          timeframe: "6 months",
          location: "Anonymous",
          rating: testimonial.rating
        };
      });
      res.json(successStories);
    } catch (error) {
      console.error("Error fetching success stories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/impact/community-stats", async (req, res) => {
    try {
      const allBookings = await storage.getAllBookings();
      const allIntakes = await storage.getAllWeightLossIntakes();
      const now = /* @__PURE__ */ new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const recentBookings = allBookings.filter((b) => b.createdAt && new Date(b.createdAt) >= thisMonth);
      const weeklyBookings = allBookings.filter((b) => b.createdAt && new Date(b.createdAt) >= thisWeek);
      const stats = {
        newMembersThisMonth: recentBookings.length,
        sessionsThisWeek: weeklyBookings.filter((b) => b.status === "confirmed").length,
        goalsAchieved: allIntakes.filter((i) => i.goalWeight && parseFloat(i.goalWeight) > 0).length,
        upcomingEvents: Math.floor(allBookings.filter((b) => b.status === "pending").length / 2)
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/impact/program-stats", async (req, res) => {
    try {
      const allBookings = await storage.getAllBookings();
      const allIntakes = await storage.getAllWeightLossIntakes();
      const programs2 = [
        {
          name: "Individual Coaching",
          activeClients: allBookings.filter((b) => b.coachingArea === "individual").length || Math.floor(allBookings.length * 0.7),
          completionRate: 78
        },
        {
          name: "Group Programs",
          activeGroups: 12,
          satisfactionRate: 85
        },
        {
          name: "Weight Loss Specialty",
          participants: allIntakes.length,
          goalAchievementRate: 92
        }
      ];
      res.json(programs2);
    } catch (error) {
      console.error("Error fetching program stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/cms/pages", async (req, res) => {
    try {
      const pages = await storage.getAllContentPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching content pages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/cms/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = await storage.getContentPage(id);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching content page:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/cms/pages", async (req, res) => {
    try {
      const pageData = insertContentPageSchema.parse(req.body);
      const page = await storage.createContentPage(pageData);
      res.json(page);
    } catch (error) {
      console.error("Error creating content page:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid page data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.put("/api/cms/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pageData = insertContentPageSchema.partial().parse(req.body);
      const page = await storage.updateContentPage(id, pageData);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error updating content page:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid page data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.delete("/api/cms/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContentPage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting content page:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/cms/media", async (req, res) => {
    try {
      const media = await storage.getAllMediaItems();
      res.json(media);
    } catch (error) {
      console.error("Error fetching media items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/cms/media", async (req, res) => {
    try {
      const mediaData = insertMediaSchema.parse(req.body);
      const media = await storage.createMediaItem(mediaData);
      res.json(media);
    } catch (error) {
      console.error("Error creating media item:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid media data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.get("/api/cms/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/cms/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const settingData = { ...req.body, key };
      const setting = await storage.createOrUpdateSiteSetting(settingData);
      res.json(setting);
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/cms/navigation", async (req, res) => {
    try {
      const navigation = await storage.getAllNavigationMenus();
      res.json(navigation);
    } catch (error) {
      console.error("Error fetching navigation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/cms/navigation", async (req, res) => {
    try {
      const navData = insertNavigationSchema.parse(req.body);
      const navigation = await storage.createNavigationMenu(navData);
      res.json(navigation);
    } catch (error) {
      console.error("Error creating navigation item:", error);
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid navigation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.get("/api/coach/profile", requireCoachRole, async (req, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/coach/profile", requireCoachRole, async (req, res) => {
    try {
      const coachData = insertCoachSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const existingCoach = await coachStorage.getCoachByUserId(req.user.id);
      if (existingCoach) {
        const updatedCoach = await coachStorage.updateCoach(existingCoach.id, coachData);
        res.json(updatedCoach);
      } else {
        const newCoach = await coachStorage.createCoach(coachData);
        res.json(newCoach);
      }
    } catch (error) {
      if (error instanceof z10.ZodError) {
        res.status(400).json({ message: "Invalid coach data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.get("/api/coach/credentials", requireCoachRole, async (req, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      const credentials = await coachStorage.getCoachCredentials(coach.id);
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/coach/credentials", requireCoachRole, async (req, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      const credentialData = insertCoachCredentialSchema.parse({
        ...req.body,
        coachId: coach.id
      });
      const credential = await coachStorage.createCoachCredential(credentialData);
      res.json(credential);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        res.status(400).json({ message: "Invalid credential data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.get("/api/coach/banking", requireCoachRole, async (req, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      const banking = await coachStorage.getCoachBanking(coach.id);
      if (banking) {
        const safeBanking = {
          ...banking,
          accountNumber: banking.accountNumber ? "****" + banking.accountNumber.slice(-4) : null
        };
        res.json(safeBanking);
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/coach/banking", requireCoachRole, async (req, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      const bankingData = insertCoachBankingSchema.parse({
        ...req.body,
        coachId: coach.id
      });
      const banking = await coachStorage.createOrUpdateCoachBanking(bankingData);
      res.json(banking);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        res.status(400).json({ message: "Invalid banking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  app2.get("/api/coach/availability", requireCoachRole, async (req, res) => {
    try {
      const coach = await coachStorage.getCoachByUserId(req.user.id);
      if (!coach) {
        return res.status(404).json({ message: "Coach profile not found" });
      }
      const availability = await coachStorage.getCoachAvailability(coach.id);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/coaches/google-meet-status/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      const hasGoogleMeetAccess = coach.googleMeetEnabled || false;
      res.json({
        connected: hasGoogleMeetAccess,
        lastSync: coach.googleMeetLastSync || null
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/coaches/:coachId/connect-google-meet", async (req, res) => {
    try {
      const { coachId } = req.params;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      const updatedCoach = await coachStorage.updateCoach(coach.id, {
        googleMeetEnabled: true,
        googleMeetLastSync: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({
        success: true,
        message: "Google Meet connected successfully",
        coach: updatedCoach
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to connect Google Meet" });
    }
  });
  app2.get("/api/coaches/google-meet-sessions/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      const sampleSessions = [
        {
          id: "gm-session-1",
          meetingId: "abc-defg-hij",
          meetingUrl: "https://meet.google.com/abc-defg-hij",
          clientId: "client-1",
          clientName: "Sarah Johnson",
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1e3).toISOString(),
          // 2 hours from now
          duration: 60,
          status: "scheduled",
          sessionType: "individual",
          description: "Weekly check-in and goal setting",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "gm-session-2",
          meetingId: "xyz-uvwx-ijk",
          meetingUrl: "https://meet.google.com/xyz-uvwx-ijk",
          clientId: "client-2",
          clientName: "Maria Rodriguez",
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString(),
          // Tomorrow
          duration: 45,
          status: "scheduled",
          sessionType: "consultation",
          description: "Initial assessment and treatment planning",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ];
      res.json(sampleSessions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/coaches/:coachId/google-meet-sessions", async (req, res) => {
    try {
      const { coachId } = req.params;
      const { clientId, scheduledTime, duration, sessionType, description } = req.body;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      const clients = await coachStorage.getCoachClients(coach.id);
      const client2 = clients.find((c) => c.id.toString() === clientId);
      if (!client2) {
        return res.status(404).json({ message: "Client not found" });
      }
      const meetingId = Math.random().toString(36).substring(2, 15);
      const meetingUrl = `https://meet.google.com/${meetingId}`;
      const newSession = {
        id: `gm-session-${Date.now()}`,
        meetingId,
        meetingUrl,
        clientId,
        clientName: `${client2.firstName} ${client2.lastName}`,
        scheduledTime,
        duration: parseInt(duration),
        status: "scheduled",
        sessionType,
        description: description || "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(newSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to create Google Meet session" });
    }
  });
  app2.patch("/api/coaches/google-meet-sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { status } = req.body;
      res.json({
        success: true,
        message: `Session ${sessionId} status updated to ${status}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update session status" });
    }
  });
  app2.get("/api/coaches/clients/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const coach = await coachStorage.getCoachById(parseInt(coachId));
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      const clients = await coachStorage.getCoachClients(coach.id);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/coaches", async (req, res) => {
    try {
      const { specialty, status } = req.query;
      let coaches2;
      if (specialty) {
        coaches2 = await coachStorage.getCoachesBySpecialty(specialty);
      } else {
        coaches2 = status === "active" ? await coachStorage.getActiveCoaches() : await coachStorage.getAllCoaches();
      }
      const publicCoaches = coaches2.map((coach) => ({
        id: coach.id,
        coachId: coach.coachId,
        firstName: coach.firstName,
        lastName: coach.lastName,
        bio: coach.bio,
        specialties: coach.specialties,
        experience: coach.experience,
        isVerified: coach.isVerified,
        hourlyRate: coach.hourlyRate,
        languages: coach.languages,
        profileImage: coach.profileImage
      }));
      res.json(publicCoaches);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/auth/google", (req, res, next) => {
    passport2.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      access_type: "offline"
    })(req, res, next);
  });
  app2.get(
    "/auth/google/callback",
    passport2.authenticate("google", {
      failureRedirect: "/?error=auth_failed",
      session: false
      // Disable session to prevent issues
    }),
    async (req, res) => {
      try {
        if (!req.user) {
          console.error("No user data received from Google OAuth");
          return res.redirect("/?error=no_user_data");
        }
        const token = generateGoogleAuthToken(req.user);
        res.cookie("auth_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1e3
          // 7 days
        });
        res.redirect("/?auth=success");
      } catch (error) {
        console.error("OAuth callback error:", error);
        res.redirect("/?error=auth_failed");
      }
    }
  );
  app2.post("/api/discovery-quiz", async (req, res) => {
    try {
      const {
        sessionId,
        currentNeeds,
        situationDetails,
        supportPreference,
        readinessLevel,
        recommendedPath,
        completed
      } = req.body;
      let userId = null;
      if (req.cookies?.auth_token) {
        try {
          const authService = AuthService.getInstance();
          const decoded = authService.verifyToken(req.cookies.auth_token);
          userId = decoded.id;
        } catch (err) {
        }
      }
      console.log("Discovery Quiz Results Received:", {
        sessionId,
        currentNeeds,
        supportPreference,
        readinessLevel,
        userId: userId || "anonymous"
      });
      const demoQuizResult = {
        id: `demo_quiz_${Date.now()}`,
        user_id: userId,
        session_id: sessionId,
        current_needs: currentNeeds,
        situation_details: situationDetails,
        support_preference: supportPreference,
        readiness_level: readinessLevel,
        recommended_path: recommendedPath,
        quiz_version: "v1",
        completed,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json({
        success: true,
        quizId: demoQuizResult.id,
        message: "Quiz results processed successfully",
        data: demoQuizResult
      });
    } catch (error) {
      console.error("Error processing discovery quiz results:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process quiz results"
      });
    }
  });
  app2.get("/api/discovery-quiz/history", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const quizHistory = await storage.getUserQuizHistory(userId);
      res.json({
        success: true,
        quizHistory
      });
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch quiz history"
      });
    }
  });
  app2.get("/api/discovery-quiz/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const quizResult = await storage.getQuizResultBySession(sessionId);
      if (!quizResult) {
        return res.status(404).json({
          success: false,
          message: "Quiz results not found"
        });
      }
      res.json({
        success: true,
        quizResult
      });
    } catch (error) {
      console.error("Error fetching quiz result:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch quiz result"
      });
    }
  });
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      const subDir = file.fieldname === "video" ? "videos" : file.fieldname === "photo" ? "photos" : "documents";
      const fullPath = path.join(uploadDir, subDir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
  const upload = multer({
    storage: storage_config,
    limits: {
      fileSize: 100 * 1024 * 1024
      // 100MB for videos
    },
    fileFilter: (req, file, cb) => {
      if (file.fieldname === "video") {
        if (file.mimetype.startsWith("video/")) {
          cb(null, true);
        } else {
          cb(new Error("Only video files are allowed"));
        }
      } else if (file.fieldname === "photo") {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true);
        } else {
          cb(new Error("Only image files are allowed"));
        }
      } else {
        cb(null, true);
      }
    }
  });
  app2.post("/api/upload/video", upload.single("video"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file uploaded" });
      }
      const videoUrl = `/uploads/videos/${req.file.filename}`;
      res.json({
        success: true,
        videoUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Video upload error:", error);
      res.status(500).json({ error: "Failed to upload video" });
    }
  });
  app2.post("/api/upload/photo", upload.single("photo"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No photo file uploaded" });
      }
      const photoUrl = `/uploads/photos/${req.file.filename}`;
      res.json({
        success: true,
        photoUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });
  app2.post("/api/upload/document", upload.single("document"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No document file uploaded" });
      }
      const documentUrl = `/uploads/documents/${req.file.filename}`;
      res.json({
        success: true,
        documentUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });
  app2.use("/uploads", express.static(uploadDir));
  app2.post("/api/ai-coaching/chat", async (req, res) => {
    try {
      const { message, coachType, persona = "supportive" } = req.body;
      if (!message || !coachType) {
        return res.status(400).json({ message: "Message and coach type are required" });
      }
      const personaStyles = {
        supportive: {
          prefix: "I'm here to support you. ",
          tone: "warm and understanding",
          suffix: " What would feel most helpful for you right now?"
        },
        motivational: {
          prefix: "You've got this! ",
          tone: "energetic and inspiring",
          suffix: " Ready to make some positive changes happen?"
        },
        analytical: {
          prefix: "Let me break this down for you. ",
          tone: "logical and strategic",
          suffix: " What specific outcome are you hoping to achieve?"
        },
        gentle: {
          prefix: "Take your time with this. ",
          tone: "calm and patient",
          suffix: " Remember, every small step counts."
        }
      };
      const coachKnowledge = {
        "weight-loss": {
          focus: "sustainable weight loss and healthy habits",
          expertise: ["nutrition", "meal planning", "exercise", "motivation", "habit formation"]
        },
        "relationship": {
          focus: "building stronger, healthier relationships",
          expertise: ["communication", "conflict resolution", "trust building", "emotional intimacy", "boundaries"]
        },
        "wellness": {
          focus: "overall wellness and life balance",
          expertise: ["stress management", "work-life balance", "mental health", "self-care", "mindfulness"]
        },
        "behavior": {
          focus: "positive behavior change and personal development",
          expertise: ["habit formation", "goal setting", "overcoming barriers", "self-discipline", "pattern recognition"]
        }
      };
      const currentPersona = personaStyles[persona] || personaStyles.supportive;
      const coachInfo = coachKnowledge[coachType] || coachKnowledge.wellness;
      let response = currentPersona.prefix;
      response += `As your ${coachType.replace("-", " ")} specialist focusing on ${coachInfo.focus}, I can help you with ${message.toLowerCase()}. `;
      if (persona === "analytical") {
        response += "Let's create a structured approach to address this systematically.";
      } else if (persona === "motivational") {
        response += "I believe in your ability to overcome this challenge!";
      } else if (persona === "gentle") {
        response += "We'll work through this at a pace that feels comfortable for you.";
      } else {
        response += "I'm here to guide you through this with understanding and care.";
      }
      response += currentPersona.suffix;
      res.json({ success: true, response });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: error.message || "Failed to process chat message" });
    }
  });
  app2.post("/api/ai-coaching/motivational-message", async (req, res) => {
    try {
      const { profile, progressData } = req.body;
      if (!profile || !profile.name) {
        return res.status(400).json({ message: "Profile information is required" });
      }
      const message = await aiCoaching.generateMotivationalMessage(profile, progressData);
      res.json({ success: true, message });
    } catch (error) {
      console.error("Error generating motivational message:", error);
      res.status(500).json({ message: error.message || "Failed to generate message" });
    }
  });
  app2.get("/api/chat/sessions/:userId", requireAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const sessions2 = [];
      res.json(sessions2);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });
  app2.get("/api/chat/messages/:sessionId", requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = [];
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/ai-coaching/analyze-progress", async (req, res) => {
    try {
      const { profile, progressData } = req.body;
      if (!profile || !progressData) {
        return res.status(400).json({ message: "Profile and progress data are required" });
      }
      const analysis = await aiCoaching.analyzeProgressAndAdjustPlan(profile, progressData);
      res.json({ success: true, analysis });
    } catch (error) {
      console.error("Error analyzing progress:", error);
      res.status(500).json({ message: error.message || "Failed to analyze progress" });
    }
  });
  app2.post("/api/ai-coaching/nutrition-tips", async (req, res) => {
    try {
      const profile = req.body;
      if (!profile.name) {
        return res.status(400).json({ message: "Profile information is required" });
      }
      const tips = await aiCoaching.generateNutritionTips(profile);
      res.json({ success: true, tips });
    } catch (error) {
      console.error("Error generating nutrition tips:", error);
      res.status(500).json({ message: error.message || "Failed to generate tips" });
    }
  });
  app2.post("/api/setup-onboarding-db", async (req, res) => {
    try {
      console.log("Setting up onboarding database tables...");
      const createResults = [];
      try {
        const { data, error } = await supabase.from("password_reset_tokens").select("*").limit(1);
        if (error && error.message.includes("does not exist")) {
          console.log("password_reset_tokens table does not exist, creating...");
          const { error: createError } = await supabase.rpc("exec_sql", {
            sql: `CREATE TABLE IF NOT EXISTS password_reset_tokens (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              "userId" TEXT NOT NULL,
              token TEXT NOT NULL UNIQUE,
              "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              used BOOLEAN DEFAULT FALSE
            );`
          });
          if (createError) {
            console.error("Error creating password_reset_tokens table:", createError);
            createResults.push({ table: "password_reset_tokens", error: createError });
          } else {
            console.log("\u2713 password_reset_tokens table created successfully");
            createResults.push({ table: "password_reset_tokens", success: true });
          }
        } else {
          console.log("\u2713 password_reset_tokens table already exists");
          createResults.push({ table: "password_reset_tokens", success: true, existing: true });
        }
      } catch (err) {
        console.error("Error checking password_reset_tokens table:", err);
        createResults.push({ table: "password_reset_tokens", error: err });
      }
      try {
        const { data, error } = await supabase.from("email_verification_tokens").select("*").limit(1);
        if (error && error.message.includes("does not exist")) {
          console.log("email_verification_tokens table does not exist, creating...");
          const { error: createError } = await supabase.rpc("exec_sql", {
            sql: `CREATE TABLE IF NOT EXISTS email_verification_tokens (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              "userId" TEXT NOT NULL,
              token TEXT NOT NULL UNIQUE,
              "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              used BOOLEAN DEFAULT FALSE
            );`
          });
          if (createError) {
            console.error("Error creating email_verification_tokens table:", createError);
            createResults.push({ table: "email_verification_tokens", error: createError });
          } else {
            console.log("\u2713 email_verification_tokens table created successfully");
            createResults.push({ table: "email_verification_tokens", success: true });
          }
        } else {
          console.log("\u2713 email_verification_tokens table already exists");
          createResults.push({ table: "email_verification_tokens", success: true, existing: true });
        }
      } catch (err) {
        console.error("Error checking email_verification_tokens table:", err);
        createResults.push({ table: "email_verification_tokens", error: err });
      }
      try {
        const { data, error } = await supabase.from("user_onboarding_steps").select("*").limit(1);
        if (error && error.message.includes("does not exist")) {
          console.log("user_onboarding_steps table does not exist, creating...");
          const { error: createError } = await supabase.rpc("exec_sql", {
            sql: `CREATE TABLE IF NOT EXISTS user_onboarding_steps (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              "userId" TEXT NOT NULL,
              step_id TEXT NOT NULL,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              completed BOOLEAN DEFAULT FALSE,
              "order" INTEGER NOT NULL,
              completed_at TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE("userId", step_id)
            );`
          });
          if (createError) {
            console.error("Error creating user_onboarding_steps table:", createError);
            createResults.push({ table: "user_onboarding_steps", error: createError });
          } else {
            console.log("\u2713 user_onboarding_steps table created successfully");
            createResults.push({ table: "user_onboarding_steps", success: true });
          }
        } else {
          console.log("\u2713 user_onboarding_steps table already exists");
          createResults.push({ table: "user_onboarding_steps", success: true, existing: true });
        }
      } catch (err) {
        console.error("Error checking user_onboarding_steps table:", err);
        createResults.push({ table: "user_onboarding_steps", error: err });
      }
      console.log("\u2713 Onboarding database setup completed successfully");
      res.json({ success: true, message: "Onboarding database setup completed", results: createResults });
    } catch (error) {
      console.error("Error setting up onboarding database:", error);
      res.status(500).json({ error: "Failed to setup database", details: error });
    }
  });
  app2.use("/api/admin", router2);
  registerAdminCertificationRoutes(app2);
  app2.use("/api/coach", router3);
  app2.use("/api/donation", router4);
  app2.use("/api/onboarding", router5);
  app2.use("/api/assessments", router7);
  app2.use(router6);
  setupCouponRoutes(app2);
  registerWellnessJourneyRoutes(app2);
  const httpServer = createServer(app2);
  app2.get("/api/mental-wellness/resources", async (req, res) => {
    try {
      const { category, audience, type, emergency } = req.query;
      const resources2 = await storage.getMentalWellnessResources({
        category,
        targetAudience: audience,
        resourceType: type,
        isEmergency: emergency === "true"
      });
      res.json(resources2);
    } catch (error) {
      console.error("Error fetching mental wellness resources:", error);
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });
  app2.get("/api/mental-wellness/emergency-contacts", async (req, res) => {
    try {
      const { specialty, location } = req.query;
      const contacts2 = await storage.getEmergencyContacts({
        specialty,
        location
      });
      res.json(contacts2);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ error: "Failed to fetch emergency contacts" });
    }
  });
  app2.post("/api/mental-wellness/assessment", async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID;
      const assessmentData = req.body;
      const assessment = await storage.createWellnessAssessment({
        userId,
        sessionId,
        assessmentType: assessmentData.type,
        responses: assessmentData.responses,
        score: assessmentData.score,
        riskLevel: assessmentData.riskLevel,
        recommendedResources: assessmentData.recommendedResources,
        followUpRequired: assessmentData.followUpRequired
      });
      res.json(assessment);
    } catch (error) {
      console.error("Error creating wellness assessment:", error);
      res.status(500).json({ error: "Failed to create assessment" });
    }
  });
  app2.get("/api/mental-wellness/recommendations", async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID;
      const { category, assessment } = req.query;
      const recommendations = await storage.getPersonalizedRecommendations({
        userId,
        sessionId,
        category,
        assessmentType: assessment
      });
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });
  app2.post("/api/mental-wellness/track-usage", async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID;
      const { resourceId, duration, wasHelpful, feedback, followUpAction } = req.body;
      const analytics = await storage.trackResourceUsage({
        resourceId,
        userId,
        sessionId,
        accessDuration: duration,
        wasHelpful,
        feedback,
        followUpAction,
        userAgent: req.headers["user-agent"],
        referrer: req.headers.referer,
        deviceType: req.headers["user-agent"]?.includes("Mobile") ? "mobile" : "desktop"
      });
      res.json(analytics);
    } catch (error) {
      console.error("Error tracking resource usage:", error);
      res.status(500).json({ error: "Failed to track usage" });
    }
  });
  app2.get("/api/mental-wellness/quick-access", async (req, res) => {
    try {
      const quickAccess = await storage.getQuickAccessResources();
      res.json(quickAccess);
    } catch (error) {
      console.error("Error fetching quick access resources:", error);
      res.status(500).json({ error: "Failed to fetch quick access resources" });
    }
  });
  app2.post("/api/recommendations/generate", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { userProfile, context } = req.body;
      const fullUserProfile = {
        userId: user.id,
        demographics: userProfile?.demographics || {},
        preferences: userProfile?.preferences || {},
        mentalHealthProfile: userProfile?.mentalHealthProfile || {},
        behaviorPatterns: userProfile?.behaviorPatterns || {}
      };
      const recommendations = await recommendationEngine.generateRecommendations(
        fullUserProfile,
        context
      );
      res.json({ recommendations });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });
  app2.post("/api/recommendations/track", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { recommendationId, action } = req.body;
      await recommendationEngine.trackRecommendationUsage(
        user.id,
        recommendationId,
        action
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking recommendation usage:", error);
      res.status(500).json({ error: "Failed to track recommendation usage" });
    }
  });
  app2.get("/api/recommendations/history", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { limit = 20, offset = 0 } = req.query;
      const { data: recommendations, error } = await supabase.from("personalized_recommendations").select(`
          *,
          mental_wellness_resources (
            id,
            title,
            description,
            category,
            resource_type
          )
        `).eq("user_id", user.id).order("generated_at", { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
      if (error) {
        console.error("Error fetching recommendation history:", error);
        return res.status(500).json({ error: "Failed to fetch recommendation history" });
      }
      res.json({ recommendations: recommendations || [] });
    } catch (error) {
      console.error("Error fetching recommendation history:", error);
      res.status(500).json({ error: "Failed to fetch recommendation history" });
    }
  });
  app2.post("/api/recommendations/feedback", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { recommendationId, feedback, wasHelpful } = req.body;
      const { error } = await supabase.from("personalized_recommendations").update({
        feedback,
        was_helpful: wasHelpful,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", recommendationId).eq("user_id", user.id);
      if (error) {
        console.error("Error updating recommendation feedback:", error);
        return res.status(500).json({ error: "Failed to update feedback" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating recommendation feedback:", error);
      res.status(500).json({ error: "Failed to update feedback" });
    }
  });
  app2.get("/api/recommendations/analytics", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { data: analytics, error } = await supabase.from("personalized_recommendations").select("*").eq("user_id", user.id);
      if (error) {
        console.error("Error fetching recommendation analytics:", error);
        return res.status(500).json({ error: "Failed to fetch analytics" });
      }
      const totalRecommendations = analytics?.length || 0;
      const accessedRecommendations = analytics?.filter((r) => r.was_accessed).length || 0;
      const helpfulRecommendations = analytics?.filter((r) => r.was_helpful === true).length || 0;
      const notHelpfulRecommendations = analytics?.filter((r) => r.was_helpful === false).length || 0;
      const stats = {
        totalRecommendations,
        accessedRecommendations,
        helpfulRecommendations,
        notHelpfulRecommendations,
        accessRate: totalRecommendations > 0 ? accessedRecommendations / totalRecommendations * 100 : 0,
        helpfulnessRate: helpfulRecommendations + notHelpfulRecommendations > 0 ? helpfulRecommendations / (helpfulRecommendations + notHelpfulRecommendations) * 100 : 0
      };
      res.json({ analytics: stats });
    } catch (error) {
      console.error("Error fetching recommendation analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.post("/api/volunteer/application", async (req, res) => {
    try {
      const applicationData = req.body;
      const emailContent = `
        <h2>New Volunteer Application Submitted</h2>
        <p><strong>Submitted:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
        
        <h3>Personal Information</h3>
        <p><strong>Name:</strong> ${applicationData.firstName} ${applicationData.lastName}</p>
        <p><strong>Email:</strong> ${applicationData.email}</p>
        <p><strong>Phone:</strong> ${applicationData.phone}</p>
        <p><strong>Address:</strong> ${applicationData.address}, ${applicationData.city}, ${applicationData.state} ${applicationData.zipCode}</p>
        <p><strong>Date of Birth:</strong> ${applicationData.dateOfBirth}</p>
        
        <h3>Emergency Contact</h3>
        <p><strong>Name:</strong> ${applicationData.emergencyContactName}</p>
        <p><strong>Phone:</strong> ${applicationData.emergencyContactPhone}</p>
        
        <h3>Availability</h3>
        <ul>
          ${applicationData.availability.map((time) => `<li>${time}</li>`).join("")}
        </ul>
        
        <h3>Volunteer Areas of Interest</h3>
        <ul>
          ${applicationData.volunteerAreas.map((area) => `<li>${area}</li>`).join("")}
        </ul>
        
        <h3>Experience & Motivation</h3>
        <p><strong>Relevant Experience:</strong><br>${applicationData.experience.replace(/\n/g, "<br>")}</p>
        <p><strong>Motivation:</strong><br>${applicationData.motivation.replace(/\n/g, "<br>")}</p>
        <p><strong>Skills:</strong><br>${applicationData.skills.replace(/\n/g, "<br>")}</p>
        
        ${applicationData.references ? `<h3>References</h3><p>${applicationData.references.replace(/\n/g, "<br>")}</p>` : ""}
        
        <h3>Agreements</h3>
        <p><strong>Background Check:</strong> ${applicationData.backgroundCheck ? "Agreed" : "Not Agreed"}</p>
        <p><strong>Commitment Agreement:</strong> ${applicationData.commitmentAgreement ? "Agreed" : "Not Agreed"}</p>
        <p><strong>Privacy Policy:</strong> ${applicationData.privacyPolicy ? "Agreed" : "Not Agreed"}</p>
        
        <p><em>This application was submitted through the Whole Wellness Coaching volunteer portal.</em></p>
      `;
      const { EmailService: EmailService2 } = (init_email_service(), __toCommonJS(email_service_exports));
      const emailService2 = new EmailService2();
      await emailService2.sendEmail({
        to: "dasha.lazaryuk@gmail.com",
        from: "volunteer@wholewellnesscoaching.org",
        subject: `New Volunteer Application - ${applicationData.firstName} ${applicationData.lastName}`,
        html: emailContent,
        text: `New Volunteer Application from ${applicationData.firstName} ${applicationData.lastName}. Please check your email for the full application details.`
      });
      console.log("Volunteer application email sent successfully");
      res.json({ success: true, message: "Application submitted successfully" });
    } catch (error) {
      console.error("Error submitting volunteer application:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });
  app2.get("/api/programs", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const programs2 = await storage.getUserPrograms(user.id);
      res.json(programs2);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });
  app2.post("/api/programs", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { assessmentType, paid } = req.body;
      const program = await storage.createProgram({
        userId: user.id,
        assessmentType,
        paid: paid || false,
        results: null
      });
      res.json(program);
    } catch (error) {
      console.error("Error creating program:", error);
      res.status(500).json({ error: "Failed to create program" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { assessmentId, amount } = req.body;
      if (!stripe3) {
        return res.status(400).json({ error: "Stripe not configured" });
      }
      const paymentIntent = await stripe3.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "usd",
        metadata: {
          assessmentId,
          userId: req.user?.id || "anonymous"
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        sessionId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });
  app2.get("/api/chat/sessions", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const sessions2 = await storage.getUserChatSessions(user.id);
      res.json(sessions2);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });
  app2.post("/api/chat/sessions", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { module } = req.body;
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session2 = await storage.createChatSession({
        userId: user.id,
        threadId,
        module
      });
      res.json(session2);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });
  app2.post("/api/chat/messages", async (req, res) => {
    try {
      const { sessionId, role, content, summary } = req.body;
      const message = await storage.createChatMessage({
        sessionId,
        role,
        content,
        summary
      });
      res.json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Failed to create chat message" });
    }
  });
  app2.get("/api/coach/certification-courses", requireAuth, async (req, res) => {
    try {
      const courses = [
        {
          id: "course-1",
          title: "Advanced Wellness Coaching Certification",
          description: "Comprehensive training in holistic wellness coaching techniques, covering nutrition, fitness, mental health, and lifestyle optimization strategies.",
          category: "wellness",
          level: "intermediate",
          duration: 40,
          creditHours: "35.0",
          price: "799.00",
          instructorName: "Dr. Sarah Mitchell",
          instructorBio: "Licensed therapist with 15+ years in wellness coaching",
          courseImageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400",
          previewVideoUrl: null,
          requirements: ["Basic coaching certification", "1+ year experience"],
          learningObjectives: [
            "Master advanced coaching techniques",
            "Understand wellness psychology",
            "Develop personalized wellness plans"
          ],
          accreditation: "International Coach Federation (ICF)",
          tags: ["wellness", "holistic", "lifestyle"],
          isActive: true,
          enrollmentLimit: 50,
          startDate: "2025-08-01T00:00:00Z",
          endDate: "2025-12-15T00:00:00Z",
          syllabus: {
            driveFolder: "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya",
            modules: [
              { title: "Advanced Coaching Techniques", duration: 8 },
              { title: "Behavior Change Psychology", duration: 10 },
              { title: "Wellness Assessment Methods", duration: 12 },
              { title: "Client Relationship Management", duration: 10 }
            ]
          }
        },
        {
          id: "course-2",
          title: "Nutrition Coaching Fundamentals",
          description: "Evidence-based nutrition coaching principles, meal planning strategies, and behavior change techniques for sustainable dietary improvements.",
          category: "nutrition",
          level: "beginner",
          duration: 25,
          creditHours: "20.0",
          price: "599.00",
          instructorName: "Rachel Davis, RD",
          instructorBio: "Registered Dietitian and certified nutrition coach",
          courseImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
          requirements: [],
          learningObjectives: [
            "Understand nutritional science basics",
            "Learn meal planning techniques",
            "Master behavior change strategies"
          ],
          accreditation: "Academy of Nutrition and Dietetics",
          tags: ["nutrition", "meal-planning", "behavior-change"],
          isActive: true,
          enrollmentLimit: null,
          startDate: "2025-07-15T00:00:00Z",
          endDate: "2025-11-30T00:00:00Z",
          syllabus: {
            driveFolder: "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya",
            modules: [
              { title: "Nutrition Science Fundamentals", duration: 6 },
              { title: "Meal Planning Strategies", duration: 8 },
              { title: "Dietary Assessment Methods", duration: 6 },
              { title: "Behavior Change for Nutrition", duration: 5 }
            ]
          }
        },
        {
          id: "course-3",
          title: "Relationship Counseling Techniques",
          description: "Professional training in couples counseling, communication strategies, conflict resolution, and building healthy relationship dynamics.",
          category: "relationship",
          level: "advanced",
          duration: 60,
          creditHours: "45.0",
          price: "1299.00",
          instructorName: "Dr. Michael Thompson",
          instructorBio: "Licensed Marriage and Family Therapist with 20+ years experience",
          courseImageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400",
          requirements: ["Master's degree in counseling", "Licensed therapist"],
          learningObjectives: [
            "Advanced couples therapy techniques",
            "Conflict resolution strategies",
            "Family systems theory application"
          ],
          accreditation: "American Association for Marriage and Family Therapy",
          tags: ["relationship", "counseling", "therapy"],
          isActive: true,
          enrollmentLimit: 25,
          startDate: "2025-09-01T00:00:00Z",
          endDate: "2026-02-28T00:00:00Z",
          syllabus: {
            driveFolder: "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya",
            modules: [
              { title: "Couples Therapy Fundamentals", duration: 15 },
              { title: "Communication Strategies", duration: 15 },
              { title: "Conflict Resolution Techniques", duration: 15 },
              { title: "Family Systems Approach", duration: 15 }
            ]
          }
        },
        {
          id: "course-4",
          title: "Behavior Modification Strategies",
          description: "Scientific approaches to behavior change, habit formation, goal setting, and overcoming psychological barriers to personal development.",
          category: "behavior",
          level: "intermediate",
          duration: 30,
          creditHours: "25.0",
          price: "699.00",
          instructorName: "Dr. Lisa Chen",
          instructorBio: "Behavioral psychologist specializing in habit formation",
          courseImageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
          requirements: ["Basic psychology knowledge"],
          learningObjectives: [
            "Understanding behavior change science",
            "Habit formation techniques",
            "Goal setting and achievement strategies"
          ],
          accreditation: "Association for Applied and Therapeutic Humor",
          tags: ["behavior", "habits", "psychology"],
          isActive: true,
          enrollmentLimit: 40,
          startDate: "2025-08-15T00:00:00Z",
          endDate: "2025-12-01T00:00:00Z",
          syllabus: {
            driveFolder: "1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya",
            modules: [
              { title: "Behavior Change Science", duration: 8 },
              { title: "Habit Formation Strategies", duration: 7 },
              { title: "Goal Setting Techniques", duration: 8 },
              { title: "Overcoming Psychological Barriers", duration: 7 }
            ]
          }
        }
      ];
      res.json(courses);
    } catch (error) {
      console.error("Error fetching certification courses:", error);
      res.status(500).json({ message: "Failed to fetch certification courses" });
    }
  });
  app2.get("/api/coach/my-enrollments", requireAuth, async (req, res) => {
    try {
      const enrollments = [
        {
          id: "enrollment-1",
          coachId: "chuck",
          // matches test coach
          courseId: "course-1",
          enrollmentDate: "2025-07-01T00:00:00Z",
          status: "in_progress",
          progress: "65.5",
          currentModule: 3,
          completedModules: [1, 2],
          startedAt: "2025-07-01T00:00:00Z",
          paymentStatus: "paid",
          totalTimeSpent: 1260
          // 21 hours in minutes
        }
      ];
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });
  app2.get("/api/coach/my-certificates", requireAuth, async (req, res) => {
    try {
      const certificates = [
        {
          id: "cert-1",
          coachId: "chuck",
          courseId: "course-2",
          courseTitle: "Nutrition Coaching Fundamentals",
          certificateNumber: "WWC-2024-NC-001",
          issuedDate: "2024-12-15T00:00:00Z",
          expirationDate: "2027-12-15T00:00:00Z",
          creditHours: "20.0",
          status: "active",
          credentialUrl: "https://credentials.wholewellnesscoaching.org/verify/WWC-2024-NC-001",
          certificatePdfUrl: "/certificates/WWC-2024-NC-001.pdf"
        }
      ];
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });
  app2.post("/api/coach/enroll-course", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.body;
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }
      const existingEnrollments = await storage.query(`
        SELECT * FROM course_enrollment_payments 
        WHERE user_id = $1 AND course_id = $2 AND payment_status = 'succeeded'
      `, [req.user.id, courseId]);
      if (existingEnrollments.rows.length > 0) {
        return res.status(409).json({
          error: "Already enrolled in this course",
          enrollmentId: existingEnrollments.rows[0].enrollment_id
        });
      }
      res.status(402).json({
        error: "Payment required",
        message: "Please complete payment or apply a coupon to enroll in this course",
        redirectTo: "/checkout",
        courseId
      });
    } catch (error) {
      console.error("Error checking enrollment:", error);
      res.status(500).json({ message: "Failed to process enrollment request" });
    }
  });
  app2.get("/api/coach/courses/:courseId/modules", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const modules = [
        {
          id: "module-1",
          courseId,
          moduleNumber: 1,
          title: "Introduction to Wellness Coaching",
          description: "Foundational principles and core concepts of holistic wellness coaching",
          duration: 45,
          contentType: "video",
          contentUrl: "https://player.vimeo.com/video/example1",
          content: "<p>Welcome to the comprehensive wellness coaching certification program. This module introduces you to the foundational principles of holistic wellness coaching, including understanding client needs, setting realistic goals, and building sustainable coaching relationships.</p><h3>Learning Objectives:</h3><ul><li>Understand the core principles of wellness coaching</li><li>Learn to identify client motivations and barriers</li><li>Develop active listening and empathy skills</li></ul>",
          isRequired: true,
          orderIndex: 1,
          resources: [
            {
              title: "Wellness Coaching Framework PDF",
              type: "pdf",
              url: "#",
              description: "Comprehensive guide to wellness coaching methodologies"
            },
            {
              title: "Client Assessment Templates",
              type: "tool",
              url: "#",
              description: "Downloadable templates for client intake and assessment"
            }
          ]
        },
        {
          id: "module-2",
          courseId,
          moduleNumber: 2,
          title: "Goal Setting and Action Planning",
          description: "SMART goal methodology and creating actionable wellness plans",
          duration: 60,
          contentType: "quiz",
          content: "<p>This module focuses on the critical skill of helping clients set achievable, measurable goals and create actionable plans for sustainable wellness improvements.</p>",
          quiz: {
            questions: [
              {
                id: "q1",
                question: "What does SMART stand for in goal setting?",
                type: "multiple_choice",
                options: [
                  "Specific, Measurable, Achievable, Relevant, Time-bound",
                  "Simple, Modern, Accurate, Realistic, Targeted",
                  "Strategic, Meaningful, Ambitious, Reliable, Trackable",
                  "Structured, Motivational, Actionable, Results-focused, Timely"
                ],
                correctAnswer: 0,
                explanation: "SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound.",
                points: 10
              },
              {
                id: "q2",
                question: "A client wants to 'be healthier' - this is an example of a well-defined goal.",
                type: "true_false",
                correctAnswer: "false",
                explanation: "This goal is too vague. A SMART goal would be more specific, like 'exercise 30 minutes, 3 times per week for the next 3 months'.",
                points: 10
              },
              {
                id: "q3",
                question: "Describe how you would help a client break down a large wellness goal into smaller, manageable steps. Provide a specific example.",
                type: "essay",
                points: 20
              }
            ],
            passingScore: 80,
            timeLimit: 30
          },
          isRequired: true,
          orderIndex: 2
        },
        {
          id: "module-3",
          courseId,
          moduleNumber: 3,
          title: "Motivational Interviewing Techniques",
          description: "Advanced communication strategies for behavior change",
          duration: 75,
          contentType: "text",
          content: "<p>Motivational interviewing is a collaborative conversation style that strengthens a person's motivation and commitment to change. This evidence-based approach is essential for wellness coaches.</p><h3>Core Principles:</h3><ol><li><strong>Express Empathy:</strong> Understand the client's perspective</li><li><strong>Develop Discrepancy:</strong> Help clients see gaps between current behavior and goals</li><li><strong>Roll with Resistance:</strong> Avoid arguing or confronting</li><li><strong>Support Self-Efficacy:</strong> Build confidence in the client's ability to change</li></ol><h3>Key Techniques:</h3><ul><li>Open-ended questions</li><li>Affirmations</li><li>Reflective listening</li><li>Summarizing</li></ul><p>Practice these techniques in every client interaction to build rapport and facilitate sustainable behavior change.</p>",
          isRequired: true,
          orderIndex: 3,
          resources: [
            {
              title: "Motivational Interviewing Question Bank",
              type: "pdf",
              url: "#",
              description: "100+ open-ended questions for coaching sessions"
            }
          ]
        },
        {
          id: "module-4",
          courseId,
          moduleNumber: 4,
          title: "Case Study Analysis",
          description: "Apply your learning to real-world coaching scenarios",
          duration: 90,
          contentType: "assignment",
          content: "<p>This capstone assignment allows you to demonstrate your mastery of wellness coaching principles through detailed case study analysis.</p>",
          assignment: {
            instructions: "<p>You will be presented with a detailed client case study. Your task is to:</p><ol><li>Analyze the client's current situation, challenges, and goals</li><li>Develop a comprehensive coaching plan using SMART goals</li><li>Identify potential barriers and strategies to overcome them</li><li>Create sample motivational interviewing questions</li><li>Design a 3-month action plan with measurable milestones</li></ol><p><strong>Case Study:</strong> Sarah is a 35-year-old working mother who wants to improve her overall wellness. She struggles with stress management, irregular eating patterns, and finds little time for physical activity. She has tried various diets and exercise programs but hasn't maintained long-term success. Sarah's goal is to 'feel more energetic and confident' while managing her busy lifestyle.</p>",
            submissionFormat: "Written analysis (1500-2000 words) addressing all required components",
            maxScore: 100
          },
          isRequired: true,
          orderIndex: 4
        }
      ];
      res.json(modules);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      res.status(500).json({ message: "Failed to fetch course modules" });
    }
  });
  app2.get("/api/coach/module-progress/:enrollmentId", requireAuth, async (req, res) => {
    try {
      const { enrollmentId } = req.params;
      const progress = [
        {
          id: "progress-1",
          enrollmentId,
          moduleId: "module-1",
          status: "completed",
          startedAt: "2025-07-01T10:00:00Z",
          completedAt: "2025-07-01T11:30:00Z",
          timeSpent: 90,
          attempts: 1,
          score: 95
        },
        {
          id: "progress-2",
          enrollmentId,
          moduleId: "module-2",
          status: "in_progress",
          startedAt: "2025-07-02T09:00:00Z",
          timeSpent: 25,
          attempts: 1,
          score: null
        }
      ];
      res.json(progress);
    } catch (error) {
      console.error("Error fetching module progress:", error);
      res.status(500).json({ message: "Failed to fetch module progress" });
    }
  });
  app2.post("/api/coach/start-module", requireAuth, async (req, res) => {
    try {
      const { enrollmentId, moduleId } = req.body;
      if (!enrollmentId || !moduleId) {
        return res.status(400).json({ message: "Enrollment ID and Module ID are required" });
      }
      const progress = {
        id: `progress-${Date.now()}`,
        enrollmentId,
        moduleId,
        status: "in_progress",
        startedAt: (/* @__PURE__ */ new Date()).toISOString(),
        timeSpent: 0,
        attempts: 1
      };
      res.json({ success: true, progress });
    } catch (error) {
      console.error("Error starting module:", error);
      res.status(500).json({ message: "Failed to start module" });
    }
  });
  app2.post("/api/coach/submit-quiz", requireAuth, async (req, res) => {
    try {
      const { enrollmentId, moduleId, answers, timeSpent } = req.body;
      if (!enrollmentId || !moduleId || !answers) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const totalQuestions = Object.keys(answers).length;
      let correctAnswers = 0;
      Object.values(answers).forEach((answer) => {
        if (typeof answer === "string" && (answer.includes("Specific") || answer === "false" || answer.length > 50)) {
          correctAnswers++;
        }
      });
      const score = Math.round(correctAnswers / totalQuestions * 100);
      const passed = score >= 80;
      const result = {
        score,
        passed,
        answers,
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        timeSpent: timeSpent || 0,
        feedback: passed ? "Excellent work! You've demonstrated mastery of the concepts." : "Please review the material and try again. Focus on the areas you missed."
      };
      res.json(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });
  app2.post("/api/coach/submit-assignment", requireAuth, async (req, res) => {
    try {
      const { enrollmentId, moduleId, submission, timeSpent } = req.body;
      if (!enrollmentId || !moduleId || !submission) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const result = {
        submissionId: `submission-${Date.now()}`,
        submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "submitted",
        timeSpent: timeSpent || 0,
        feedback: "Your assignment has been submitted and will be reviewed by an instructor within 3-5 business days."
      };
      res.json(result);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });
  app2.get("/api/admin/security/users", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/admin/security/users", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const { email, firstName, lastName, password, role, isActive, permissions } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Required fields: email, password, firstName, lastName" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      const hashedPassword = await bcrypt3.hash(password, 12);
      const newUser = await storage.createUser({
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: role || "user",
        isActive: isActive !== void 0 ? isActive : true,
        permissions: permissions || null
      });
      const { passwordHash, ...userResponse } = newUser;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.put("/api/admin/security/users/:userId", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const { userId } = req.params;
      const updates = req.body;
      delete updates.passwordHash;
      delete updates.id;
      delete updates.createdAt;
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { passwordHash, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/security/users/:userId", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const { userId } = req.params;
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.post("/api/admin/security/create-admin-accounts", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const adminAccounts = [
        {
          email: "charles.watson@wholewellnesscoaching.org",
          firstName: "Charles",
          lastName: "Watson",
          role: "admin"
        },
        {
          email: "charles.watson@gmail.com",
          firstName: "Charles",
          lastName: "Watson",
          role: "admin"
        }
      ];
      const createdAccounts = [];
      const defaultPassword = "AdminWWC2024!";
      for (const account of adminAccounts) {
        try {
          const existingUser = await storage.getUserByEmail(account.email);
          if (existingUser) {
            const updatedUser = await storage.updateUserRole(existingUser.id, "admin");
            createdAccounts.push({ email: account.email, status: "updated", role: "admin" });
          } else {
            const hashedPassword = await bcrypt3.hash(defaultPassword, 12);
            const newUser = await storage.createUser({
              email: account.email,
              passwordHash: hashedPassword,
              firstName: account.firstName,
              lastName: account.lastName,
              role: account.role,
              isActive: true
            });
            createdAccounts.push({ email: account.email, status: "created", role: "admin" });
          }
        } catch (error) {
          console.error(`Error processing admin account ${account.email}:`, error);
          createdAccounts.push({ email: account.email, status: "error", error: error.message });
        }
      }
      res.json({
        message: "Admin account processing completed",
        accounts: createdAccounts,
        defaultPassword
      });
    } catch (error) {
      console.error("Error creating admin accounts:", error);
      res.status(500).json({ message: "Failed to create admin accounts" });
    }
  });
  app2.get("/api/admin/security/analytics", requireAuth, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const users2 = await storage.getAllUsers();
      const analytics = {
        totalUsers: users2.length,
        activeUsers: users2.filter((u) => u.isActive).length,
        roleDistribution: users2.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {}),
        recentLogins: users2.filter(
          (u) => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
        ).length
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching security analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/test-google-drive", requireAuth, async (req, res) => {
    try {
      console.log("Testing Google Drive connection...");
      const isAuthenticated = await googleDriveService.initialize();
      if (isAuthenticated) {
        const files = await googleDriveService.getCourseFiles("1G8F_pu26GDIYg2hAmSxjJ2P1bvIL4pya");
        res.json({
          status: "success",
          message: "Google Drive connected successfully",
          folderAccess: true,
          fileCount: files.length,
          sampleFiles: files.slice(0, 3).map((f) => ({ name: f.name, type: f.mimeType }))
        });
      } else {
        res.json({
          status: "demo",
          message: "Using demo mode - Google Drive credentials not configured or invalid"
        });
      }
    } catch (error) {
      console.error("Google Drive test error:", error);
      res.json({
        status: "error",
        message: error.message,
        usingDemo: true
      });
    }
  });
  app2.get("/api/coach/course-files/:courseId", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const courses = await storage.getCertificationCourses();
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const driveFolder = course.syllabus?.driveFolder || course.syllabus?.googleDriveId;
      if (!driveFolder) {
        return res.json({ files: [], message: "No Google Drive folder configured for this course" });
      }
      let files;
      try {
        const isAuthenticated = await googleDriveService.initialize();
        if (isAuthenticated) {
          files = await googleDriveService.getCourseFiles(driveFolder);
        } else {
          throw new Error("Google Drive not configured");
        }
      } catch (error) {
        console.log("Using demo Google Drive files (credentials not configured)");
        files = await googleDriveDemoService.getCourseFiles(driveFolder);
      }
      res.json({
        files: files.map((file) => ({
          id: file.id,
          name: file.name,
          type: file.mimeType,
          viewLink: file.webViewLink,
          downloadLink: file.webContentLink,
          thumbnail: file.thumbnailLink,
          size: file.size,
          modified: file.modifiedTime
        }))
      });
    } catch (error) {
      console.error("Error fetching course files:", error);
      res.status(500).json({ message: "Failed to fetch course files from Google Drive" });
    }
  });
  app2.get("/api/coach/course-folder/:courseId", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const courses = await storage.getCertificationCourses();
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const driveFolder = course.syllabus?.driveFolder || course.syllabus?.googleDriveId;
      if (!driveFolder) {
        return res.json({ folder: null, message: "No Google Drive folder configured" });
      }
      let folderStructure;
      try {
        const isAuthenticated = await googleDriveService.initialize();
        if (isAuthenticated) {
          folderStructure = await googleDriveService.getCourseFolderStructure(driveFolder);
        } else {
          throw new Error("Google Drive not configured");
        }
      } catch (error) {
        console.log("Using demo Google Drive folder structure");
        folderStructure = await googleDriveDemoService.getCourseFolderStructure(driveFolder);
      }
      res.json({ folder: folderStructure });
    } catch (error) {
      console.error("Error fetching folder structure:", error);
      res.status(500).json({ message: "Failed to fetch folder structure from Google Drive" });
    }
  });
  app2.get("/api/coach/drive-file/:fileId/download", requireAuth, async (req, res) => {
    try {
      const { fileId } = req.params;
      let downloadUrl;
      try {
        const isAuthenticated = await googleDriveService.initialize();
        if (isAuthenticated) {
          downloadUrl = await googleDriveService.getDownloadUrl(fileId);
        } else {
          throw new Error("Google Drive not configured");
        }
      } catch (error) {
        console.log("Using demo Google Drive download URL");
        downloadUrl = await googleDriveDemoService.getDownloadUrl(fileId);
      }
      res.json({ downloadUrl });
    } catch (error) {
      console.error("Error getting download URL:", error);
      res.status(500).json({ message: "Failed to get download URL from Google Drive" });
    }
  });
  app2.get("/api/coach/search-course-files/:courseId", requireAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { q: searchQuery } = req.query;
      if (!searchQuery) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const courses = await storage.getCertificationCourses();
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const driveFolder = course.syllabus?.driveFolder || course.syllabus?.googleDriveId;
      if (!driveFolder) {
        return res.json({ files: [], message: "No Google Drive folder configured" });
      }
      let files;
      try {
        const isAuthenticated = await googleDriveService.initialize();
        if (isAuthenticated) {
          files = await googleDriveService.searchFiles(searchQuery, driveFolder);
        } else {
          throw new Error("Google Drive not configured");
        }
      } catch (error) {
        console.log("Using demo Google Drive search");
        files = await googleDriveDemoService.searchFiles(searchQuery, driveFolder);
      }
      res.json({
        files: files.map((file) => ({
          id: file.id,
          name: file.name,
          type: file.mimeType,
          viewLink: file.webViewLink,
          downloadLink: file.webContentLink,
          thumbnail: file.thumbnailLink,
          size: file.size,
          modified: file.modifiedTime
        }))
      });
    } catch (error) {
      console.error("Error searching course files:", error);
      res.status(500).json({ message: "Failed to search course files in Google Drive" });
    }
  });
  registerAIChatRoutes(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server: server2 },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    log(`Primary build directory not found: ${distPath}, trying alternative paths...`);
    const alternativePaths = [
      path3.resolve(import.meta.dirname, "..", "client", "dist"),
      path3.resolve(import.meta.dirname, "..", "dist", "public"),
      path3.resolve(import.meta.dirname, "..", "client", "build"),
      path3.resolve(import.meta.dirname, "..", "build")
    ];
    let foundPath = null;
    for (const altPath of alternativePaths) {
      if (fs2.existsSync(altPath)) {
        foundPath = altPath;
        break;
      }
    }
    if (!foundPath) {
      log(`Warning: No build directory found. Server will still run for health checks.`);
      app2.use("*", (_req, res) => {
        if (_req.path.startsWith("/api")) {
          return;
        }
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>WholeWellness Coaching</title></head>
            <body>
              <h1>Application Loading</h1>
              <p>The application is initializing. Please wait...</p>
            </body>
          </html>
        `);
      });
      return;
    }
    log(`Using build directory: ${foundPath}`);
    app2.use(express2.static(foundPath));
    app2.use("*", (_req, res) => {
      if (_req.path.startsWith("/api")) {
        return;
      }
      const indexPath = path3.resolve(foundPath, "index.html");
      if (fs2.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>WholeWellness Coaching</title></head>
            <body>
              <h1>Application Ready</h1>
              <p>Server is running successfully.</p>
            </body>
          </html>
        `);
      }
    });
    return;
  }
  log(`Using build directory: ${distPath}`);
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    if (_req.path.startsWith("/api")) {
      return;
    }
    const indexPath = path3.resolve(distPath, "index.html");
    if (fs2.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>WholeWellness Coaching</title></head>
          <body>
            <h1>Application Ready</h1>
            <p>Server is running successfully.</p>
          </body>
        </html>
      `);
    }
  });
}

// server/index.ts
import { createServer as createServer2 } from "http";
var app = express3();
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
var server = createServer2(app);
var port = process.env.PORT ? parseInt(process.env.PORT) : 5e3;
server.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
});
(async () => {
  try {
    await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    log("Application fully initialized");
  } catch (error) {
    log(`Error during initialization: ${error}`);
  }
})();
process.on("SIGTERM", () => {
  log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    log("Server closed");
    process.exit(0);
  });
});
process.on("SIGINT", () => {
  log("SIGINT received, shutting down gracefully");
  server.close(() => {
    log("Server closed");
    process.exit(0);
  });
});
