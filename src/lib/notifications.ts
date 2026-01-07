// Notification service for SMS, Email, and Push notifications

const MNOTIFY_API_KEY = process.env.MNOTIFY_API_KEY || "";
const MNOTIFY_SENDER_ID = process.env.MNOTIFY_SENDER_ID || "Mechatronics";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = process.env.SMTP_PORT || "587";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "noreply@mechatronics.com";

export interface SmsParams {
  to: string;
  message: string;
  senderId?: string;
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface NotificationResult {
  success: boolean;
  provider: string;
  providerRef?: string;
  error?: string;
}

// SMS via mNotify (Ghana)
export async function sendSms(params: SmsParams): Promise<NotificationResult> {
  try {
    const response = await fetch("https://apps.mnotify.net/smsapi", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        key: MNOTIFY_API_KEY,
        to: params.to.replace(/\s+/g, ""),
        msg: params.message,
        sender_id: params.senderId || MNOTIFY_SENDER_ID,
      }),
    });

    const result = await response.text();
    
    // mNotify returns "1000" for success
    if (result.includes("1000")) {
      return {
        success: true,
        provider: "mnotify",
        providerRef: result,
      };
    }

    return {
      success: false,
      provider: "mnotify",
      error: `mNotify error: ${result}`,
    };
  } catch (error) {
    return {
      success: false,
      provider: "mnotify",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Email via SMTP (using fetch to a mail API or nodemailer-like service)
export async function sendEmail(params: EmailParams): Promise<NotificationResult> {
  try {
    // For production, you'd use nodemailer or a service like SendGrid/Mailgun
    // This is a simplified implementation using Resend API as an example
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: params.from || SMTP_FROM,
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          provider: "resend",
          providerRef: result.id,
        };
      }

      return {
        success: false,
        provider: "resend",
        error: result.message || "Email send failed",
      };
    }

    // Fallback: log email (for development)
    console.log("📧 Email would be sent:", {
      to: params.to,
      subject: params.subject,
      html: params.html.substring(0, 200) + "...",
    });

    return {
      success: true,
      provider: "console",
      providerRef: "dev-mode",
    };
  } catch (error) {
    return {
      success: false,
      provider: "smtp",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Email templates
export const emailTemplates = {
  alertNotification: (data: {
    deviceName: string;
    alertTitle: string;
    alertMessage: string;
    severity: string;
    value: string;
    timestamp: string;
    dashboardUrl: string;
  }) => ({
    subject: `🚨 ${data.severity.toUpperCase()} Alert: ${data.alertTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${data.severity === 'critical' ? '#dc2626' : data.severity === 'warning' ? '#f59e0b' : '#3b82f6'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .value { font-size: 24px; font-weight: bold; color: ${data.severity === 'critical' ? '#dc2626' : '#f59e0b'}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⚠️ ${data.alertTitle}</h1>
          </div>
          <div class="content">
            <p><strong>Device:</strong> ${data.deviceName}</p>
            <p><strong>Message:</strong> ${data.alertMessage}</p>
            <p><strong>Current Value:</strong> <span class="value">${data.value}</span></p>
            <p><strong>Time:</strong> ${data.timestamp}</p>
            <a href="${data.dashboardUrl}" class="btn">View Dashboard</a>
          </div>
          <div class="footer">
            <p>This is an automated alert from Mechatronics IoT Platform</p>
            <p>You can manage your alert preferences in your account settings.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderConfirmation: (data: {
    customerName: string;
    orderRef: string;
    items: Array<{ name: string; quantity: number; price: string }>;
    total: string;
    paymentUrl?: string;
  }) => ({
    subject: `Order Confirmation - ${data.orderRef}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 20px; font-weight: bold; color: #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Order Confirmed</h1>
          </div>
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>Thank you for your order! Here are the details:</p>
            <p><strong>Order Reference:</strong> ${data.orderRef}</p>
            <table>
              <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
              ${data.items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price}</td></tr>`).join('')}
            </table>
            <p><strong>Total:</strong> <span class="total">${data.total}</span></p>
            ${data.paymentUrl ? `<a href="${data.paymentUrl}" class="btn">Complete Payment</a>` : ''}
          </div>
          <div class="footer">
            <p>Mechatronics IoT Solutions</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcomeEmail: (data: {
    name: string;
    loginUrl: string;
  }) => ({
    subject: "Welcome to Mechatronics IoT Platform!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f74780, #3b82f6); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #f74780; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
          .feature { display: flex; align-items: center; margin: 15px 0; }
          .feature-icon { font-size: 24px; margin-right: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Mechatronics!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>Welcome to the Mechatronics IoT Platform! We're excited to have you on board.</p>
            <p>With your account, you can:</p>
            <div class="feature"><span class="feature-icon">📊</span> Monitor your devices in real-time</div>
            <div class="feature"><span class="feature-icon">🔔</span> Set up custom alerts and notifications</div>
            <div class="feature"><span class="feature-icon">📈</span> View historical data and analytics</div>
            <div class="feature"><span class="feature-icon">🏢</span> Manage multiple sites and zones</div>
            <a href="${data.loginUrl}" class="btn">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>Need help? Contact us at support@mechatronics.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  teamInvitation: (data: {
    inviterName: string;
    companyName: string;
    role: string;
    inviteUrl: string;
    expiresIn: string;
  }) => ({
    subject: `You've been invited to join ${data.companyName} on Mechatronics`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 25px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
          .role-badge { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">👋 You're Invited!</h1>
          </div>
          <div class="content">
            <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.companyName}</strong> on the Mechatronics IoT Platform.</p>
            <p>Your role: <span class="role-badge">${data.role}</span></p>
            <p>Click the button below to accept the invitation and create your account:</p>
            <a href="${data.inviteUrl}" class="btn">Accept Invitation</a>
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">This invitation expires in ${data.expiresIn}.</p>
          </div>
          <div class="footer">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// SMS templates
export const smsTemplates = {
  alertNotification: (data: {
    deviceName: string;
    alertTitle: string;
    value: string;
  }) => `ALERT: ${data.alertTitle} on ${data.deviceName}. Value: ${data.value}. Check your dashboard for details.`,

  orderConfirmation: (data: {
    orderRef: string;
    total: string;
  }) => `Your order ${data.orderRef} has been confirmed. Total: ${data.total}. Thank you for choosing Mechatronics!`,

  paymentReceived: (data: {
    amount: string;
    orderRef: string;
  }) => `Payment of ${data.amount} received for order ${data.orderRef}. Your subscription is now active. Thank you!`,

  otpCode: (data: {
    code: string;
  }) => `Your Mechatronics verification code is: ${data.code}. Valid for 10 minutes. Do not share this code.`,
};
