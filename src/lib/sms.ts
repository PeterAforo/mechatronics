const MNOTIFY_API_KEY = process.env.MNOTIFY_API_KEY;
const MNOTIFY_SENDER_ID = process.env.MNOTIFY_SENDER_ID || "Mechatronics";
const MNOTIFY_API_URL = "https://apps.mnotify.net/smsapi";

export interface SmsOptions {
  to: string;
  message: string;
}

export async function sendSms(options: SmsOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!MNOTIFY_API_KEY) {
    console.log("📱 SMS (dev mode - no API key):", {
      to: options.to,
      message: options.message.substring(0, 50) + "...",
    });
    return { success: true, messageId: "dev-mode" };
  }

  try {
    // Format phone number (ensure it starts with country code for Ghana)
    let phone = options.to.replace(/\s+/g, "").replace(/^0/, "233");
    if (!phone.startsWith("+") && !phone.startsWith("233")) {
      phone = "233" + phone;
    }

    const response = await fetch(MNOTIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        key: MNOTIFY_API_KEY,
        to: phone,
        msg: options.message,
        sender_id: MNOTIFY_SENDER_ID,
      }),
    });

    const result = await response.text();

    // mNotify returns "1000" for success
    if (result.includes("1000")) {
      return { success: true, messageId: result };
    }

    // mNotify error codes
    const errorMessages: Record<string, string> = {
      "1001": "Invalid API key",
      "1002": "Empty message",
      "1003": "Empty recipient",
      "1004": "Invalid sender ID",
      "1005": "Invalid phone number",
      "1006": "Insufficient balance",
      "1007": "Invalid schedule date",
      "1008": "Sender ID not approved",
    };

    const errorCode = result.trim();
    return { 
      success: false, 
      error: errorMessages[errorCode] || `mNotify error: ${result}` 
    };
  } catch (error) {
    console.error("SMS send exception:", error);
    return { success: false, error: "Failed to send SMS" };
  }
}

// SMS Templates
export const smsTemplates = {
  alertNotification: (deviceName: string, alertTitle: string, severity: string) => 
    `[${severity.toUpperCase()}] ${alertTitle} on ${deviceName}. Check your Mechatronics dashboard for details.`,

  orderConfirmation: (orderRef: string) =>
    `Your Mechatronics order #${orderRef} has been confirmed! Our team will contact you within 24-48 hours to schedule installation.`,

  passwordReset: (code: string) =>
    `Your Mechatronics password reset code is: ${code}. This code expires in 1 hour. Do not share this code.`,

  welcomeSms: (name: string) =>
    `Welcome to Mechatronics, ${name}! Your account is ready. Login at mechatronics.com.gh to get started.`,
};
