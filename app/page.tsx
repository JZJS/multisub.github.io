"use client";
import ServiceCard from "../components/ServiceCard";
import LogDisplay from "../components/WalletMonitor";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <header className="text-3xl font-bold text-center mt-12 mb-8">
        Welcome to XRP Multi-Signature Subscription Demo
      </header>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Service Card */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Order</h2>
            <ServiceCard
              initialServiceName="OpenAI ChatGPT API"
              initialAmount={1}
              initialSigners={["yuxialun123@gmail.com"]}
              status="Pending Approval"
            />
          </div>

          {/* Right: Log Display */}
          <div>
            <LogDisplay />
          </div>
        </div>
      </div>
    </main>
  );
}
