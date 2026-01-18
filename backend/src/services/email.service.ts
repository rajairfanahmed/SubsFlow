import sgMail from '@sendgrid/mail';
import { config } from '../config';
import { logger, withRetry } from '../utils';
import { Notification } from '../models';
import { Types } from 'mongoose';

// Initialize SendGrid
sgMail.setApiKey(config.sendgrid.apiKey);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.fromEmail = config.sendgrid.fromEmail;
    this.fromName = config.sendgrid.fromName;
  }

  /**
   * Send a single email
   */
  async sendEmail(options: EmailOptions): Promise<SendEmailResult> {
    try {
      const msg = {
        to: options.to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      };

      const [response] = await withRetry(
        () => sgMail.send(msg),
        { maxAttempts: 3, baseDelayMs: 500, maxDelayMs: 5000 }
      );

      const messageId = response.headers['x-message-id'] as string;
      logger.info('Email sent successfully', { to: options.to, messageId });

      return { success: true, messageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Email send failed', { to: options.to, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send email using SendGrid dynamic template
   */
  async sendTemplateEmail(
    to: string,
    templateId: string,
    dynamicData: Record<string, unknown>
  ): Promise<SendEmailResult> {
    try {
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        templateId,
        dynamicTemplateData: {
          ...dynamicData,
          appName: config.app.name,
          appUrl: config.app.url,
        },
      };

      const [response] = await withRetry(
        () => sgMail.send(msg as any),
        { maxAttempts: 3, baseDelayMs: 500, maxDelayMs: 5000 }
      );

      const messageId = response.headers['x-message-id'] as string;
      logger.info('Template email sent', { to, templateId, messageId });

      return { success: true, messageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Template email failed', { to, templateId, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, name: string, verificationToken: string): Promise<SendEmailResult> {
    const verificationUrl = `${config.app.frontendUrl}/verify-email?token=${verificationToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to ${config.app.name}!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining ${config.app.name}. We're excited to have you on board!</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link: <br><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to ${config.app.name} - Verify Your Email`,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<SendEmailResult> {
    const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Reset Your Password</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link: <br><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `${config.app.name} - Password Reset Request`,
      html,
    });
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(
    email: string, 
    name: string, 
    planName: string,
    nextBillingDate: Date
  ): Promise<SendEmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Subscription Confirmed! 🎉</h1>
        <p>Hi ${name},</p>
        <p>Your subscription to <strong>${planName}</strong> is now active.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Next billing date:</strong> ${nextBillingDate.toLocaleDateString()}</p>
        </div>
        <p>You now have full access to all premium content. Start exploring!</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${config.app.frontendUrl}/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          You can manage your subscription anytime from your account settings.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `${config.app.name} - Your ${planName} Subscription is Active`,
      html,
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedEmail(
    email: string, 
    name: string, 
    amount: number,
    currency: string
  ): Promise<SendEmailResult> {
    const billingUrl = `${config.app.frontendUrl}/billing`;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DC2626;">Payment Failed</h1>
        <p>Hi ${name},</p>
        <p>We couldn't process your payment of <strong>${formattedAmount}</strong>.</p>
        <p>To avoid any interruption to your service, please update your payment method:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${billingUrl}" 
             style="background-color: #DC2626; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
        </p>
        <p>We'll automatically retry the payment in a few days.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `${config.app.name} - Action Required: Payment Failed`,
      html,
    });
  }

  /**
   * Send renewal reminder email
   */
  async sendRenewalReminderEmail(
    email: string, 
    name: string, 
    planName: string,
    renewalDate: Date,
    amount: number,
    currency: string
  ): Promise<SendEmailResult> {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Subscription Renewal Reminder</h1>
        <p>Hi ${name},</p>
        <p>This is a friendly reminder that your <strong>${planName}</strong> subscription 
           will renew on <strong>${renewalDate.toLocaleDateString()}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${planName}</p>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>Renewal Date:</strong> ${renewalDate.toLocaleDateString()}</p>
        </div>
        <p>No action needed — your subscription will automatically renew.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          You can manage or cancel your subscription anytime from your account settings.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `${config.app.name} - Subscription Renewal Reminder`,
      html,
    });
  }

  /**
   * Send trial ending email
   */
  async sendTrialEndingEmail(
    email: string, 
    name: string, 
    planName: string,
    trialEndDate: Date
  ): Promise<SendEmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #F59E0B;">Your Trial is Ending Soon</h1>
        <p>Hi ${name},</p>
        <p>Your free trial of <strong>${planName}</strong> ends on 
           <strong>${trialEndDate.toLocaleDateString()}</strong>.</p>
        <p>To continue enjoying all premium features, your subscription will automatically 
           begin after your trial ends.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${config.app.frontendUrl}/billing" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Manage Subscription
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          If you don't want to continue, you can cancel before your trial ends.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `${config.app.name} - Your Trial Ends Soon`,
      html,
    });
  }

  /**
   * Send subscription canceled confirmation
   */
  async sendSubscriptionCanceledEmail(
    email: string, 
    name: string, 
    planName: string,
    accessEndDate: Date
  ): Promise<SendEmailResult> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Subscription Canceled</h1>
        <p>Hi ${name},</p>
        <p>Your <strong>${planName}</strong> subscription has been canceled.</p>
        <p>You'll continue to have access until <strong>${accessEndDate.toLocaleDateString()}</strong>.</p>
        <p>We're sorry to see you go! If you change your mind, you can resubscribe anytime.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${config.app.frontendUrl}/pricing" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Resubscribe
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          We'd love to hear your feedback. Reply to this email to let us know how we can improve.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `${config.app.name} - Subscription Canceled`,
      html,
    });
  }

  /**
   * Record notification in database
   */
  async recordNotification(
    userId: string,
    type: string,
    subject: string,
    body: string,
    result: SendEmailResult,
    relatedEntity?: { type: 'subscription' | 'payment' | 'content'; id: Types.ObjectId }
  ): Promise<void> {
    await Notification.create({
      userId,
      type,
      channel: 'email',
      status: result.success ? 'sent' : 'failed',
      subject,
      body,
      sendgridMessageId: result.messageId,
      sentAt: result.success ? new Date() : undefined,
      failureReason: result.error,
      relatedEntity,
    });
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const emailService = new EmailService();
