// hooks/useCreateOrder.ts

export async function createOrder(order: {
  serviceName: string;
  amount: number;
  signers: string[];
  status: string;
}) {
  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return await res.json();
}
