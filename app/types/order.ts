export type OrderInfo = {
  orderId: string;
  escrowId: number;
  finishAfter: number;
  signers: string[];
  confirmed: string[];
  amount: number;
}; 