import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";
import { addDays, addMonths, addYears, isBefore, startOfDay } from "date-fns";

/**
 * Subscription Renewal Cron Job
 * 
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron)
 * It handles:
 * 1. Sending renewal reminders (7 days before)
 * 2. Processing auto-renewals
 * 3. Marking overdue subscriptions
 */

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.warn("CRON_SECRET not configured");
    return process.env.NODE_ENV === "development";
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const reminderDate = addDays(today, 7);
  
  const results = {
    reminderssSent: 0,
    renewalsProcessed: 0,
    subscriptionsMarkedOverdue: 0,
    errors: [] as string[],
  };

  try {
    // 1. Send renewal reminders for subscriptions expiring in 7 days
    const subscriptionsNeedingReminder = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBillingDate: {
          gte: today,
          lte: reminderDate,
        },
      },
      include: {
        product: true,
      },
    });

    for (const subscription of subscriptionsNeedingReminder) {
      try {
        // Get tenant info
        const tenant = await prisma.tenant.findUnique({
          where: { id: subscription.tenantId },
        });

        if (tenant?.email) {
          const daysUntilRenewal = Math.ceil(
            (subscription.nextBillingDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          await sendEmail({
            to: tenant.email,
            subject: `Subscription Renewal Reminder - ${subscription.product.name}`,
            html: `
              <h2>Subscription Renewal Reminder</h2>
              <p>Dear ${tenant.contactName || tenant.companyName},</p>
              <p>Your subscription for <strong>${subscription.product.name}</strong> will renew in <strong>${daysUntilRenewal} days</strong>.</p>
              <p><strong>Renewal Amount:</strong> ${subscription.currency} ${Number(subscription.monthlyFee).toFixed(2)}</p>
              <p><strong>Renewal Date:</strong> ${subscription.nextBillingDate?.toLocaleDateString()}</p>
              <p>If you have any questions or wish to make changes, please contact us.</p>
              <p>Thank you for choosing Mechatronics!</p>
            `,
            text: `Your subscription for ${subscription.product.name} will renew in ${daysUntilRenewal} days. Amount: ${subscription.currency} ${Number(subscription.monthlyFee).toFixed(2)}`,
          });

          results.reminderssSent++;
        }
      } catch (error) {
        results.errors.push(`Failed to send reminder for subscription ${subscription.id}: ${error}`);
      }
    }

    // 2. Process auto-renewals for subscriptions due today
    const subscriptionsDueToday = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBillingDate: {
          lte: today,
        },
      },
      include: {
        product: true,
      },
    });

    for (const subscription of subscriptionsDueToday) {
      try {
        // Calculate next billing date based on interval
        let nextBillingDate: Date;
        const currentBillingDate = subscription.nextBillingDate || today;

        switch (subscription.billingInterval) {
          case "monthly":
            nextBillingDate = addMonths(currentBillingDate, 1);
            break;
          case "quarterly":
            nextBillingDate = addMonths(currentBillingDate, 3);
            break;
          case "yearly":
            nextBillingDate = addYears(currentBillingDate, 1);
            break;
          default:
            nextBillingDate = addMonths(currentBillingDate, 1);
        }

        // Update subscription with new billing date
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            nextBillingDate,
            updatedAt: new Date(),
          },
        });

        // Create a payment transaction record (pending - would be processed by payment gateway)
        await prisma.paymentTransaction.create({
          data: {
            tenantId: subscription.tenantId,
            subscriptionId: subscription.id,
            provider: subscription.paymentProvider || "paystack",
            amount: subscription.monthlyFee,
            currency: subscription.currency,
            status: "pending",
            metadata: JSON.stringify({
              type: "subscription_renewal",
              subscriptionId: subscription.id.toString(),
              productName: subscription.product.name,
            }),
          },
        });

        results.renewalsProcessed++;
      } catch (error) {
        results.errors.push(`Failed to process renewal for subscription ${subscription.id}: ${error}`);
      }
    }

    // 3. Mark overdue subscriptions (past due by more than 7 days)
    const overdueDate = addDays(today, -7);
    const overdueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBillingDate: {
          lt: overdueDate,
        },
      },
    });

    for (const subscription of overdueSubscriptions) {
      try {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "overdue",
            updatedAt: new Date(),
          },
        });

        // Notify tenant
        const tenant = await prisma.tenant.findUnique({
          where: { id: subscription.tenantId },
        });

        if (tenant?.email) {
          await sendEmail({
            to: tenant.email,
            subject: "Subscription Payment Overdue",
            html: `
              <h2>Payment Overdue</h2>
              <p>Dear ${tenant.contactName || tenant.companyName},</p>
              <p>Your subscription payment is overdue. Please update your payment method to avoid service interruption.</p>
              <p>If you have already made payment, please disregard this notice.</p>
            `,
            text: "Your subscription payment is overdue. Please update your payment method to avoid service interruption.",
          });
        }

        results.subscriptionsMarkedOverdue++;
      } catch (error) {
        results.errors.push(`Failed to mark subscription ${subscription.id} as overdue: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Subscription renewal cron error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription renewals", details: String(error) },
      { status: 500 }
    );
  }
}
