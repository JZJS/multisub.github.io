import { OrderInfo } from "../types/order";

// Store orders in memory
const ordersMap = new Map<string, OrderInfo>();

// Timer for checking order expiry
let expiryTimer: NodeJS.Timeout | null = null;

// Log current orders status
export function logOrdersMap() {
  console.log('\n[OrderManager] Current orders status:');
  if (ordersMap.size === 0) {
    console.log('[OrderManager] No active orders');
    return;
  }

  ordersMap.forEach((order, orderId) => {
    console.log(`[OrderManager] Order ${orderId}:`, {
      signers: order.signers,
      confirmed: order.confirmed,
      amount: order.amount,
      timeRemaining: Math.max(0, Math.floor((order.finishAfter * 1000 - Date.now()) / 1000)) + 's',
      status: order.confirmed.length === order.signers.length ? 'Fully Approved' : 'Pending Approval'
    });
  });
}

// Get order information
export function getOrder(orderId: string): OrderInfo | undefined {
  return ordersMap.get(orderId);
}

// Update order confirmation status
export function updateOrderConfirmed(orderId: string, signer: string) {
  const order = ordersMap.get(orderId);
  if (!order) {
    console.error(`[OrderManager] Order ${orderId} not found when updating confirmation`);
    return;
  }

  if (!order.confirmed.includes(signer)) {
    order.confirmed.push(signer);
    console.log(`[OrderManager] Updated confirmation status for order ${orderId}:`, {
      signer,
      confirmedCount: order.confirmed.length,
      totalSigners: order.signers.length
    });
  }
}

// Add new order
export function addOrder(orderId: string, orderInfo: OrderInfo) {
  ordersMap.set(orderId, orderInfo);
  console.log(`[OrderManager] Added new order ${orderId}:`, {
    signers: orderInfo.signers,
    amount: orderInfo.amount,
    finishAfter: new Date(orderInfo.finishAfter * 1000).toISOString()
  });
  logOrdersMap();
}

// Remove order
export function removeOrder(orderId: string) {
  const order = ordersMap.get(orderId);
  if (order) {
    ordersMap.delete(orderId);
    console.log(`[OrderManager] Removed order ${orderId}`);
    logOrdersMap();
  }
}

// Start expiry check timer
export function startExpiryTimer() {
  if (expiryTimer) {
    console.log('[OrderManager] Expiry timer already running');
    return;
  }

  console.log('[OrderManager] Starting expiry check timer');
  expiryTimer = setInterval(() => {
    const now = Date.now();
    ordersMap.forEach((order, orderId) => {
      if (order.finishAfter * 1000 <= now) {
        console.log(`[OrderManager] Order ${orderId} expired`);
        removeOrder(orderId);
      }
    });
  }, 10000); // Check every 10 seconds
}

// Stop expiry check timer
export function stopExpiryTimer() {
  if (expiryTimer) {
    clearInterval(expiryTimer);
    expiryTimer = null;
    console.log('[OrderManager] Stopped expiry check timer');
  }
} 