// app/api/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createEscrow, finishEscrow, cancelEscrow } from "../../../hooks/useXrplEscrow";
import { saveOrder, getOrder } from "../approve/useOrderManager";
import { OrderInfo } from "../../types/order";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Handle order expiry
async function handleOrderExpiry(orderId: string) {
  console.log(`\n[Timer] Processing expiry for order ${orderId}`);
  try {
    const order = getOrder(orderId);
    if (!order) {
      console.error(`[Timer] Error: Order ${orderId} not found`);
      return;
    }

    console.log(`[Timer] Current order status:`, {
      orderId,
      signers: order.signers,
      confirmed: order.confirmed,
      amount: order.amount,
      escrowId: order.escrowId,
      timeRemaining: Math.max(0, Math.floor((order.finishAfter * 1000 - Date.now()) / 1000)) + 's'
    });

    // Check if all signers have confirmed
    const allConfirmed = order.signers.every(signer => 
      order.confirmed.includes(signer)
    );

    if (allConfirmed) {
      // All signers confirmed, finish escrow
      console.log(`[Timer] Order ${orderId}: All signers confirmed, proceeding with escrow completion`);
      try {
        console.log(`[Timer] Initiating escrow completion transaction...`);
        const result = await finishEscrow(order.escrowId);
        console.log(`[Timer] Escrow completion successful:`, {
          orderId,
          escrowId: order.escrowId,
          amount: order.amount,
          txResult: result
        });
      } catch (err: any) {
        console.error(`[Timer] Escrow completion failed:`, {
          orderId,
          escrowId: order.escrowId,
          error: err?.message || 'Unknown error occurred',
          details: err?.details || null
        });
      }
    } else {
      // Some signers haven't confirmed, cancel escrow
      console.log(`[Timer] Order ${orderId}: Not all signers confirmed, proceeding with escrow cancellation`);
      try {
        console.log(`[Timer] Initiating escrow cancellation transaction...`);
        const result = await cancelEscrow(order.escrowId);
        console.log(`[Timer] Escrow cancellation successful:`, {
          orderId,
          escrowId: order.escrowId,
          amount: order.amount,
          txResult: result
        });
      } catch (err: any) {
        console.error(`[Timer] Escrow cancellation failed:`, {
          orderId,
          escrowId: order.escrowId,
          error: err?.message || 'Unknown error occurred',
          details: err?.details || null
        });
      }
    }
  } catch (err: any) {
    console.error(`[Timer] Error processing order ${orderId}:`, {
      message: err?.message || 'Unknown error occurred',
      details: err?.details || null,
      stack: err?.stack
    });
  }
  console.log(`[Timer] Completed processing for order ${orderId}\n`);
}

export async function POST(req: NextRequest) {
  console.log('\n[Order Creation] Received new order request');
  try {
    const data = await req.json();
    const { serviceName, amount, signers, status } = data;

    console.log('[Order Creation] Request parameters:', {
      serviceName,
      amount,
      signers,
      status
    });

    // Parameter validation
    if (!serviceName || !amount || !signers || !Array.isArray(signers) || signers.length === 0) {
      console.error('[Order Creation] Parameter validation failed:', { serviceName, amount, signers });
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const orderId = Date.now().toString();
    console.log(`[Order Creation] Generated order ID: ${orderId}`);

    // Create escrow
    console.log('[Order Creation] Initiating escrow creation...');
    const { escrowId, finishAfter } = await createEscrow(
      amount,
      60
    );
    console.log('[Order Creation] Escrow created successfully:', {
      escrowId,
      expiresAt: new Date(finishAfter * 1000).toLocaleString(),
      amount
    });

    // Save order information
    const orderInfo: OrderInfo = {
      orderId,
      escrowId: Number(escrowId),
      finishAfter,
      signers,
      confirmed: [],
      amount
    };
    saveOrder(orderInfo);

    // Send confirmation emails
    console.log('[Order Creation] Sending confirmation emails...');
    const results = await Promise.all(
      signers.map(async (email: string) => {
        const approveLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?order=${orderId}&signer=${encodeURIComponent(email)}`;
        console.log(`[Order Creation] Preparing email for ${email}`);
        
        const mailContent = `
          Hi,<br/><br/>
          A new subscription order requires your approval.<br/><br/>
          <b>Order Details:</b><br/>
          Service Name: ${serviceName}<br/>
          Amount: ${amount} XRP<br/>
          Signers: ${signers.join(", ")}<br/>
          Status: ${status}<br/>
          Expires in: 1 minute<br/><br/>
          <a href="${approveLink}">Click here to approve this order</a><br/><br/>
          If you did not request this action, please ignore this email.<br/><br/>
          Thanks,<br/>
          XRP Multi-Signature System
        `;

        const result = await resend.emails.send({
          from: "info@web3luck.com",
          to: email,
          subject: "XRP Multi-Signature Order Approval Required",
          html: mailContent
        });
        return result;
      })
    );

    console.log('[Order Creation] Emails sent successfully:', results);

    // Set timer for order expiry
    setTimeout(() => handleOrderExpiry(orderId), 60000);

    return NextResponse.json({
      message: "Order created successfully",
      orderId,
      escrowId,
      expiresAt: new Date(finishAfter * 1000).toLocaleString()
    });

  } catch (err: any) {
    console.error('[Order Creation] Process failed:', {
      message: err?.message || 'Unknown error occurred',
      details: err?.details || null,
      stack: err?.stack
    });
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
