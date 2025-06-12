"use client";
import { useState } from "react";
import { createOrder } from "../hooks/useCreateOrder";

// Predefined available signers
const allSigners = [
  "a@email.com",
  "b@email.com",
  "c@email.com",
  "yuxialun123@gmail.com",
  "yuxialun@foxmail.com"
];

type ServiceCardProps = {
  initialServiceName: string;
  initialAmount: number;
  initialSigners: string[];
  status: string;
};

export default function ServiceCard({
  initialServiceName,
  initialAmount,
  initialSigners,
  status
}: ServiceCardProps) {
  const [serviceName, setServiceName] = useState(initialServiceName);
  const [amount, setAmount] = useState(initialAmount);
  const [signers, setSigners] = useState(initialSigners);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Add a signer when clicked
  const addSigner = (email: string) => {
    if (!signers.includes(email)) {
      setSigners([...signers, email]);
    }
    setDropdownOpen(false);
  };

  // Remove a selected signer
  const removeSigner = (email: string) => {
    setSigners(signers.filter(s => s !== email));
  };

  // Currently unselected signers
  const availableSigners = allSigners.filter(s => !signers.includes(s));

  // Handle order creation
  const handleCreateOrder = async () => {
    try {
      await createOrder({
        serviceName,
        amount,
        signers,
        status,
      });
      alert("Order created and emails sent to signers!");
    } catch (err) {
      alert("Failed to create order.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-96">
      <div className="mb-4">
        <label className="text-gray-700 block mb-1 font-semibold">Service Name</label>
        <input
          className="w-full bg-gray-100 p-2 rounded"
          type="text"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="Enter service name"
        />
      </div>

      <div className="mb-4">
        <label className="text-gray-700 block mb-1 font-semibold">Amount</label>
        <div className="flex">
          <input
            className="flex-1 bg-gray-100 p-2 rounded-l"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount"
          />
          <span className="inline-flex items-center px-3 bg-gray-200 rounded-r border-l border-gray-300">
            XRP
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-gray-700 block mb-1 font-semibold">Signers</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {signers.map(email => (
            <span
              key={email}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center"
            >
              {email}
              <button
                className="ml-1 text-xs text-red-500 hover:text-red-700"
                onClick={() => removeSigner(email)}
                title="Remove"
                type="button"
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <button
            className="w-full bg-gray-100 p-2 rounded border text-left"
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            + Add Signer
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
              {availableSigners.length === 0 ? (
                <div className="px-4 py-2 text-gray-400">No more signers available</div>
              ) : (
                availableSigners.map(email => (
                  <div
                    key={email}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => addSigner(email)}
                  >
                    {email}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-gray-500 mb-4">
        Status: {status}
      </div>

      <div className="space-y-2">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 transition-colors"
          onClick={handleCreateOrder}
        >
          Create Order
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
