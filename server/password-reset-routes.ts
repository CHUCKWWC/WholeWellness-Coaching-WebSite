import { Request, Response } from 'express';
import { storage } from './supabase-client-storage';
import { AuthService } from './auth';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmail } from './email-service';

// Password reset request schema
const passwordResetRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

// Password reset schema
const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Request password reset
 * Generates a secure token and sends reset email to user
 */
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);

    // Check if user exists
    const user = await storage.getUserByEmail(email);

    // Always return success to prevent email enumeration attacks
    // But only send email if user actually exists
    if (user) {
      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Store hashed token in database
      await storage.updateUser(user.id, {
        resetToken: resetTokenHash,
        resetTokenExpiry: resetTokenExpiry,
      });

      // Construct reset URL
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;

      // Send reset email
      await sendEmail({
        to: email,
        subject: 'WholeWellness Coaching - Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c7a7b;">Password Reset Request</h2>
            <p>Hello ${user.firstName || 'there'},</p>
            <p>We received a request to reset your password for your WholeWellness Coaching account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2c7a7b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              For your security, this email was sent from a system that cannot receive replies.
            </p>
          </div>
        `,
        text: `
Password Reset Request

Hello ${user.firstName || 'there'},

We received a request to reset your password for your WholeWellness Coaching account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        `,
      });

      console.log(`Password reset email sent to ${email}`);
    } else {
      console.log(`Password reset requested for non-existent email: ${email}`);
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid email address',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to process password reset request',
    });
  }
}

/**
 * Reset password using token
 * Validates token and updates user's password
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = passwordResetSchema.parse(req.body);

    // Hash the provided token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token that hasn't expired
    const user = await storage.getUserByResetToken(resetTokenHash);

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        message: 'The password reset link is invalid or has expired. Please request a new one.',
      });
    }

    // Check if token has expired
    if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({
        error: 'Reset token expired',
        message: 'The password reset link has expired. Please request a new one.',
      });
    }

    // Hash new password
    const passwordHash = await AuthService.hashPassword(password);

    // Update user's password and clear reset token
    await storage.updateUser(user.id, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date(),
    });

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'WholeWellness Coaching - Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c7a7b;">Password Changed Successfully</h2>
          <p>Hello ${user.firstName || 'there'},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/login" style="background-color: #2c7a7b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Sign In
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            For your security, this email was sent from a system that cannot receive replies.
          </p>
        </div>
      `,
      text: `
Password Changed Successfully

Hello ${user.firstName || 'there'},

Your password has been successfully changed.

If you did not make this change, please contact our support team immediately.

You can now sign in at: ${process.env.FRONTEND_URL || 'http://localhost:5000'}/login
      `,
    });

    console.log(`Password reset successful for user ${user.email}`);

    res.json({
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid password format',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to reset password',
    });
  }
}

/**
 * Validate reset token
 * Check if a reset token is valid without using it
 */
export async function validateResetToken(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        valid: false,
        error: 'Reset token is required',
      });
    }

    // Hash the provided token
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token
    const user = await storage.getUserByResetToken(resetTokenHash);

    if (!user) {
      return res.json({
        valid: false,
        error: 'Invalid reset token',
      });
    }

    // Check if token has expired
    if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < new Date()) {
      return res.json({
        valid: false,
        error: 'Reset token has expired',
      });
    }

    res.json({
      valid: true,
      email: user.email, // Return email so we can show it on the reset page
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Failed to validate token',
    });
  }
}
