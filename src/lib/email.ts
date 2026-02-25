import { Resend } from "resend";

const FROM_EMAIL = process.env.EMAIL_FROM || "Mechatronics <noreply@mechatronics.com.gh>";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const resend = getResendClient();
    
    if (!resend) {
      console.log("📧 Email (dev mode - no API key):", {
        to: options.to,
        subject: options.subject,
      });
      return { success: true, id: "dev-mode" };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Email Templates
export const emailTemplates = {
  passwordReset: (resetUrl: string, name?: string) => ({
    subject: "Reset Your Password - Mechatronics",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Mechatronics</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1f2937; margin: 0 0 16px;">Reset Your Password</h2>
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
              Hi${name ? ` ${name}` : ""},<br><br>
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                Reset Password
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2026 Mechatronics. All rights reserved.<br>
              Accra, Ghana
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Reset Your Password\n\nHi${name ? ` ${name}` : ""},\n\nWe received a request to reset your password. Visit this link to create a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.\n\n© 2026 Mechatronics`,
  }),

  orderConfirmation: (orderRef: string, items: { name: string; quantity: number; price: string }[], total: string, customerName?: string) => ({
    subject: `Order Confirmation #${orderRef} - Mechatronics`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Mechatronics</h1>
          </div>
          <div style="padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✓</span>
              </div>
            </div>
            <h2 style="color: #1f2937; margin: 0 0 8px; text-align: center;">Order Confirmed!</h2>
            <p style="color: #6b7280; text-align: center; margin: 0 0 24px;">Order #${orderRef}</p>
            
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
              Hi${customerName ? ` ${customerName}` : ""},<br><br>
              Thank you for your order! We've received your payment and will begin processing your order shortly.
            </p>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h3 style="color: #1f2937; margin: 0 0 12px; font-size: 14px; text-transform: uppercase;">Order Summary</h3>
              ${items.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #374151;">${item.name} × ${item.quantity}</span>
                  <span style="color: #374151; font-weight: 600;">${item.price}</span>
                </div>
              `).join("")}
              <div style="display: flex; justify-content: space-between; padding: 12px 0 0; margin-top: 8px;">
                <span style="color: #1f2937; font-weight: 700;">Total</span>
                <span style="color: #4f46e5; font-weight: 700; font-size: 18px;">${total}</span>
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Our team will contact you within 24-48 hours to schedule installation. If you have any questions, please contact us at support@mechatronics.com.gh
            </p>
          </div>
          <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2026 Mechatronics. All rights reserved.<br>
              Accra, Ghana
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Order Confirmed!\n\nOrder #${orderRef}\n\nHi${customerName ? ` ${customerName}` : ""},\n\nThank you for your order! We've received your payment and will begin processing your order shortly.\n\nOrder Summary:\n${items.map(item => `${item.name} × ${item.quantity}: ${item.price}`).join("\n")}\n\nTotal: ${total}\n\nOur team will contact you within 24-48 hours to schedule installation.\n\n© 2026 Mechatronics`,
  }),

  alertNotification: (alertTitle: string, alertMessage: string, deviceName: string, severity: string, dashboardUrl: string) => ({
    subject: `[${severity.toUpperCase()}] ${alertTitle} - Mechatronics`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: ${severity === "critical" ? "#dc2626" : severity === "warning" ? "#f59e0b" : "#3b82f6"}; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Alert Notification</h1>
          </div>
          <div style="padding: 32px;">
            <div style="background: ${severity === "critical" ? "#fef2f2" : severity === "warning" ? "#fffbeb" : "#eff6ff"}; border-left: 4px solid ${severity === "critical" ? "#dc2626" : severity === "warning" ? "#f59e0b" : "#3b82f6"}; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
              <h3 style="color: #1f2937; margin: 0 0 8px;">${alertTitle}</h3>
              <p style="color: #6b7280; margin: 0;">${alertMessage}</p>
            </div>
            
            <div style="margin-bottom: 24px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0 0 4px; text-transform: uppercase;">Device</p>
              <p style="color: #1f2937; font-weight: 600; margin: 0;">${deviceName}</p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                View Dashboard
              </a>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2026 Mechatronics. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `[${severity.toUpperCase()}] ${alertTitle}\n\n${alertMessage}\n\nDevice: ${deviceName}\n\nView Dashboard: ${dashboardUrl}\n\n© 2026 Mechatronics`,
  }),

  welcomeEmail: (name: string, loginUrl: string) => ({
    subject: "Welcome to Mechatronics!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Mechatronics!</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1f2937; margin: 0 0 16px;">Hi ${name}! 👋</h2>
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
              Thank you for joining Mechatronics! We're excited to help you monitor your water, power, and temperature systems with our IoT solutions.
            </p>
            
            <h3 style="color: #1f2937; margin: 0 0 12px;">Getting Started:</h3>
            <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px; margin: 0 0 24px;">
              <li>Browse our product catalog</li>
              <li>Place an order for monitoring devices</li>
              <li>Our team will install and configure your devices</li>
              <li>Start monitoring from your dashboard</li>
            </ul>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
              If you have any questions, feel free to contact us at support@mechatronics.com.gh
            </p>
          </div>
          <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2026 Mechatronics. All rights reserved.<br>
              Accra, Ghana
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to Mechatronics!\n\nHi ${name}!\n\nThank you for joining Mechatronics! We're excited to help you monitor your water, power, and temperature systems with our IoT solutions.\n\nGetting Started:\n- Browse our product catalog\n- Place an order for monitoring devices\n- Our team will install and configure your devices\n- Start monitoring from your dashboard\n\nGo to Dashboard: ${loginUrl}\n\n© 2026 Mechatronics`,
  }),

  newsletterWelcome: (email: string, unsubscribeUrl: string) => ({
    subject: "Welcome to Mechatronics Newsletter!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📬 You're Subscribed!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
              Thank you for subscribing to the Mechatronics newsletter! You'll now receive updates on:
            </p>
            
            <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px; margin: 0 0 24px;">
              <li>New product launches</li>
              <li>IoT monitoring tips and best practices</li>
              <li>Exclusive offers and promotions</li>
              <li>Industry news and insights</li>
            </ul>
            
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
              You can unsubscribe at any time by clicking <a href="${unsubscribeUrl}" style="color: #4f46e5;">here</a>.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2026 Mechatronics. All rights reserved.<br>
              Accra, Ghana
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `You're Subscribed!\n\nThank you for subscribing to the Mechatronics newsletter!\n\nYou'll now receive updates on:\n- New product launches\n- IoT monitoring tips and best practices\n- Exclusive offers and promotions\n- Industry news and insights\n\nUnsubscribe: ${unsubscribeUrl}\n\n© 2026 Mechatronics`,
  }),

  teamInvitation: (companyName: string, inviterName: string, inviteUrl: string) => ({
    subject: `You've been invited to join ${companyName} on Mechatronics`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Team Invitation</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1f2937; margin: 0 0 16px;">You're Invited! 🎉</h2>
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
              <strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on Mechatronics, our IoT monitoring platform.
            </p>
            
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
              As a team member, you'll be able to:
            </p>
            <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px; margin: 0 0 24px;">
              <li>Monitor devices and view real-time data</li>
              <li>Receive alerts and notifications</li>
              <li>Access reports and analytics</li>
            </ul>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                Accept Invitation
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
          <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2026 Mechatronics. All rights reserved.<br>
              Accra, Ghana
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `You're Invited!\n\n${inviterName} has invited you to join ${companyName} on Mechatronics.\n\nAs a team member, you'll be able to:\n- Monitor devices and view real-time data\n- Receive alerts and notifications\n- Access reports and analytics\n\nAccept your invitation: ${inviteUrl}\n\nThis invitation will expire in 7 days.\n\n© 2026 Mechatronics`,
  }),
};
