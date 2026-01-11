import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { jsPDF } from "jspdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = BigInt(id);

    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check authorization
    const isAdmin = session.user.userType === "admin";
    const isTenantOwner = session.user.tenantId && BigInt(session.user.tenantId) === order.tenantId;

    if (!isAdmin && !isTenantOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: order.tenantId },
    });

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Mechatronics IoT Solutions", pageWidth - 20, 15, { align: "right" });
    doc.text("Accra, Ghana", pageWidth - 20, 22, { align: "right" });
    doc.text("info@mechatronics.com.gh", pageWidth - 20, 29, { align: "right" });

    // Invoice details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    let y = 55;

    doc.setFont("helvetica", "bold");
    doc.text("Invoice Number:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(order.orderRef, 70, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(order.createdAt.toLocaleDateString("en-GB"), 70, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Status:", 20, y);
    doc.setFont("helvetica", "normal");
    const statusColor = order.status === "paid" ? [34, 197, 94] : [234, 179, 8];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(order.status.toUpperCase(), 70, y);
    doc.setTextColor(0, 0, 0);

    // Bill To
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill To:", 20, y);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (tenant) {
      doc.text(tenant.companyName, 20, y);
      y += 5;
      if (tenant.contactName) {
        doc.text(tenant.contactName, 20, y);
        y += 5;
      }
      doc.text(tenant.email, 20, y);
      y += 5;
      if (tenant.phone) {
        doc.text(tenant.phone, 20, y);
        y += 5;
      }
      if (tenant.address) {
        doc.text(tenant.address, 20, y);
        y += 5;
      }
    }

    // Items table
    y += 10;
    doc.setFillColor(243, 244, 246);
    doc.rect(20, y, pageWidth - 40, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    y += 7;
    doc.text("Item", 25, y);
    doc.text("Qty", 100, y);
    doc.text("Setup Fee", 120, y);
    doc.text("Monthly", 150, y);
    doc.text("Total", pageWidth - 25, y, { align: "right" });

    y += 5;
    doc.setFont("helvetica", "normal");

    for (const item of order.items) {
      y += 8;
      doc.text(item.product.name.substring(0, 30), 25, y);
      doc.text(item.quantity.toString(), 100, y);
      doc.text(`${order.currency} ${Number(item.setupFee).toFixed(2)}`, 120, y);
      doc.text(`${order.currency} ${Number(item.monthlyFee).toFixed(2)}`, 150, y);
      doc.text(`${order.currency} ${Number(item.lineTotal).toFixed(2)}`, pageWidth - 25, y, { align: "right" });
    }

    // Totals
    y += 15;
    doc.setDrawColor(229, 231, 235);
    doc.line(120, y, pageWidth - 20, y);

    y += 10;
    doc.text("Subtotal:", 130, y);
    doc.text(`${order.currency} ${Number(order.subtotal).toFixed(2)}`, pageWidth - 25, y, { align: "right" });

    if (Number(order.discount) > 0) {
      y += 7;
      doc.text("Discount:", 130, y);
      doc.text(`-${order.currency} ${Number(order.discount).toFixed(2)}`, pageWidth - 25, y, { align: "right" });
    }

    if (Number(order.tax) > 0) {
      y += 7;
      doc.text("Tax:", 130, y);
      doc.text(`${order.currency} ${Number(order.tax).toFixed(2)}`, pageWidth - 25, y, { align: "right" });
    }

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total:", 130, y);
    doc.setTextColor(79, 70, 229);
    doc.text(`${order.currency} ${Number(order.total).toFixed(2)}`, pageWidth - 25, y, { align: "right" });

    // Footer
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", pageWidth / 2, 270, { align: "center" });
    doc.text("© 2026 Mechatronics. All rights reserved.", pageWidth / 2, 277, { align: "center" });

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.orderRef}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
