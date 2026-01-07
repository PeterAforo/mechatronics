import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import paystack from "@/lib/paystack";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reference = request.nextUrl.searchParams.get("reference");
    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    // Verify with Paystack
    const result = await paystack.verifyTransaction(reference);

    if (result.data.status === "success") {
      // Update transaction and order (webhook should have done this, but double-check)
      const transaction = await prisma.paymentTransaction.findFirst({
        where: { providerRef: reference },
      });

      if (transaction && transaction.status !== "success") {
        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: "success",
            paymentMethod: result.data.channel,
            paidAt: new Date(result.data.paid_at),
          },
        });

        if (transaction.orderId) {
          await prisma.order.update({
            where: { id: transaction.orderId },
            data: {
              status: "paid",
              paymentProvider: "paystack",
              paymentProviderRef: reference,
              paidAt: new Date(result.data.paid_at),
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        status: "success",
        amount: result.data.amount / 100,
        currency: result.data.currency,
        paidAt: result.data.paid_at,
        channel: result.data.channel,
      });
    }

    return NextResponse.json({
      success: false,
      status: result.data.status,
      message: result.message,
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
