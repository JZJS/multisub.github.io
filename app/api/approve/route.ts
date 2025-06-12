import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrderConfirmed, logOrdersMap } from "./useOrderManager";
import { OrderInfo } from "../../types/order";

export async function GET(req: NextRequest) {
  console.log('\n[Approval] Received signer approval request');
  try {
    // Get parameters from URL
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("order");
    const signer = searchParams.get("signer");

    console.log('[Approval] Request parameters:', { orderId, signer });

    // Parameter validation
    if (!orderId || !signer) {
      console.error('[Approval] Parameter validation failed: Missing required parameters');
      return NextResponse.json(
        { error: "Missing required parameters: order and signer" },
        { status: 400 }
      );
    }

    // Get order information
    const order = getOrder(orderId);
    if (!order) {
      console.error(`[Approval] Order ${orderId} not found`);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.log(`[Approval] Current order status:`, {
      orderId,
      signers: order.signers,
      confirmed: order.confirmed,
      amount: order.amount,
      timeRemaining: Math.max(0, Math.floor((order.finishAfter * 1000 - Date.now()) / 1000)) + 's'
    });

    // Verify signer authorization
    if (!order.signers.includes(signer)) {
      console.error(`[Approval] Unauthorized signer: ${signer}`);
      return NextResponse.json(
        { error: "Signer not authorized for this order" },
        { status: 403 }
      );
    }

    // Check if already confirmed
    if (order.confirmed.includes(signer)) {
      console.log(`[Approval] Signer ${signer} has already approved order ${orderId}`);
      return NextResponse.json(
        { 
          message: "Already approved",
          orderStatus: {
            orderId,
            confirmedSigners: order.confirmed,
            totalSigners: order.signers,
            isFullyApproved: order.confirmed.length === order.signers.length,
            timeRemaining: Math.max(0, Math.floor((order.finishAfter * 1000 - Date.now()) / 1000)) + 's'
          }
        },
        { status: 200 }
      );
    }

    // Update confirmation status
    console.log(`[Approval] Updating approval status for signer ${signer}`);
    updateOrderConfirmed(orderId, signer);

    // Log current orders status
    logOrdersMap();

    // Return updated status
    const response = {
      message: "Approval successful",
      orderStatus: {
        orderId,
        confirmedSigners: order.confirmed,
        totalSigners: order.signers,
        isFullyApproved: order.confirmed.length === order.signers.length,
        timeRemaining: Math.max(0, Math.floor((order.finishAfter * 1000 - Date.now()) / 1000)) + 's'
      }
    };
    console.log('[Approval] Approval successful, returning status:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Approval] Process failed:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 