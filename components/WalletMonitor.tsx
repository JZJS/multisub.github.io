"use client"

import { useEffect, useState } from "react"
import { Client } from "xrpl"

interface BalanceLog {
  timestamp: string
  type: "balance"
  address: string
  balance: string
  change?: string
}

export default function LogDisplay() {
  const [logs, setLogs] = useState<BalanceLog[]>([])
  const [previousBalances, setPreviousBalances] = useState<Record<string, string>>({})

  // Monitor wallet balances
  const monitorBalances = async () => {
    const client = new Client("wss://s.altnet.rippletest.net:51233")
    try {
      await client.connect()

      // Get balances for both addresses
      const addresses = [
        process.env.NEXT_PUBLIC_MULTISIG_ADDRESS,
        process.env.NEXT_PUBLIC_SERVICE_WALLET
      ].filter(Boolean) as string[]

      for (const address of addresses) {
        const response = await client.request({
          command: "account_info",
          account: address,
          ledger_index: "validated"
        })

        const balance = response.result.account_data.Balance
        const xrpBalance = (Number(balance) / 1_000_000).toFixed(2) // Convert drops to XRP

        // Calculate balance change
        const prevBalance = previousBalances[address]
        let change = undefined
        if (prevBalance) {
          const diff = Number(xrpBalance) - Number(prevBalance)
          if (diff !== 0) {
            change = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)
          }
        }

        // Update previous balance
        setPreviousBalances(prev => ({
          ...prev,
          [address]: xrpBalance
        }))

        // Add new balance log with explicit type
        const newLog: BalanceLog = {
          timestamp: new Date().toLocaleTimeString(),
          type: "balance",
          address,
          balance: xrpBalance,
          change
        }
        
        setLogs(prev => [newLog, ...prev].slice(0, 50)) // Keep last 50 logs
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    } finally {
      await client.disconnect()
    }
  }

  useEffect(() => {
    // Initial balance check
    monitorBalances()

    // Set up periodic balance checks
    const interval = setInterval(monitorBalances, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[600px] overflow-hidden flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Wallet Balance Monitor</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {logs.map((log, index) => (
          <div
            key={index}
            className="p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{log.timestamp}</span>
              <span className="text-sm font-medium">
                {log.address === process.env.NEXT_PUBLIC_MULTISIG_ADDRESS ? "Multi-sig Wallet" : "Service Wallet"}
              </span>
            </div>
            <div className="mt-1 flex justify-between items-center">
              <span className="font-mono">{log.balance} XRP</span>
              {log.change && (
                <span className={`font-mono ${
                  log.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {log.change} XRP
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 