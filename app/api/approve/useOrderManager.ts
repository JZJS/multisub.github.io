import { OrderInfo } from "../../types/order";

const ordersMap: { [key: string]: OrderInfo } = {};

// Print current state of all orders
export function logOrdersMap() {
  console.log('\n=== Current Orders Status ===');
  Object.entries(ordersMap).forEach(([orderId, order]) => {
    console.log(`\nOrder ${orderId}:`);
    console.log(`- Escrow ID: ${order.escrowId}`);
    console.log(`- Amount: ${order.amount} XRP`);
    console.log(`- Expires at: ${new Date(order.finishAfter * 1000).toLocaleString()}`);
    console.log(`- Signers: ${order.signers.join(', ')}`);
    console.log(`- Confirmed by: ${order.confirmed.join(', ') || 'None'}`);
    console.log(`- Approval Progress: ${order.confirmed.length}/${order.signers.length}`);
    console.log(`- Time Remaining: ${Math.max(0, Math.floor((order.finishAfter * 1000 - Date.now()) / 1000))}s`);
  });
  console.log('\n===========================\n');
}

export function saveOrder(order: OrderInfo) {
  ordersMap[order.orderId] = order;
  console.log(`\n[Order Created] New order saved:`, {
    orderId: order.orderId,
    escrowId: order.escrowId,
    amount: order.amount,
    signers: order.signers,
    expiresAt: new Date(order.finishAfter * 1000).toLocaleString()
  });
  logOrdersMap();
}

export function getOrder(orderId: string): OrderInfo | undefined {
  return ordersMap[orderId];
}

export function updateOrderConfirmed(orderId: string, signer: string) {
  const order = ordersMap[orderId];
  if (!order) {
    console.error(`[Order Update] Order ${orderId} not found`);
    return;
  }

  if (!order.confirmed.includes(signer)) {
    order.confirmed.push(signer);
    console.log(`[Order Update] Signer ${signer} confirmed order ${orderId}`);
    logOrdersMap();
  }
}

// Export ordersMap for debugging
export function getOrdersMap() {
  return ordersMap;
}
