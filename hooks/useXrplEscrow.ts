//"use client"

// hooks/useXrplEscrow.ts
import { Client, Wallet, EscrowCreate, EscrowFinish, EscrowCancel } from "xrpl"

const XRPL_TESTNET = "wss://s.altnet.rippletest.net:51233"

/**
 * Get account sequence number
 * @param client XRPL client
 * @param address Account address
 * @returns sequence number
 */
async function getAccountSequence(client: Client, address: string): Promise<number> {
  const accountInfo = await client.request({
    command: "account_info",
    account: address,
  });
  return accountInfo.result.account_data.Sequence;
}

/**
 * Create Escrow
 * @param amount Amount in XRP
 * @param finishAfterSec Delay in seconds before funds can be released
 * @returns escrowId (on-chain escrow ID) and finishAfter timestamp
 */
export async function createEscrow(
  amount: number,
  finishAfterSec: number
) {
  const client = new Client(XRPL_TESTNET)
  await client.connect()

  try {
    const senderWallet = Wallet.fromSeed(process.env.MULTISIG_SEED!)
    const currentLedger = await client.getLedgerIndex()
    
    // Get current sequence number before creating escrow
    const sequence = await getAccountSequence(client, senderWallet.classicAddress)
    console.log("[Escrow] Current account sequence:", sequence)

    // Convert Unix timestamp to Ripple timestamp (seconds since 2000-01-01)
    const RIPPLE_EPOCH_DIFF = 946684800 // Difference between Unix epoch (1970-01-01) and Ripple epoch (2000-01-01) in seconds
    const finishAfter = Math.floor(Date.now() / 1000) + finishAfterSec - RIPPLE_EPOCH_DIFF

    const escrowTx: EscrowCreate = {
      TransactionType: "EscrowCreate",
      Account: senderWallet.classicAddress,
      Destination: process.env.SERVICE_WALLET!,
      Amount: (amount * 1_000_000).toString(), // Convert XRP to drops
      FinishAfter: finishAfter, // Unix timestamp
      Fee: "12", // Basic fee
      Flags: 0,
      LastLedgerSequence: currentLedger + 20,
      Sequence: sequence // Use the sequence we just got
    }

    console.log("[Escrow] Creating escrow with sequence:", sequence)
    const signed = senderWallet.sign(escrowTx)
    const result = await client.submitAndWait(signed.tx_blob)
    
    // Use the sequence we passed to the transaction as escrowId
    console.log("[Escrow] Escrow created successfully with sequence:", sequence)
    return { escrowId: sequence, finishAfter }
  } catch (error) {
    console.error("[Escrow] Failed to create escrow:", error)
    throw error
  } finally {
    await client.disconnect()
  }
}

/**
 * Complete Escrow and release funds
 * @param escrowId sequence number used when creating the escrow
 * @returns transaction result
 */
export async function finishEscrow(
  escrowId: number
) {
  const client = new Client(XRPL_TESTNET)
  await client.connect()
  
  try {
    const wallet = Wallet.fromSeed(process.env.MULTISIG_SEED!)
    const currentLedger = await client.getLedgerIndex()
    const sequence = await getAccountSequence(client, wallet.classicAddress)

    console.log("[Escrow] Finishing escrow with OfferSequence:", escrowId)
    const escrowFinishTx: EscrowFinish = {
      TransactionType: "EscrowFinish",
      Owner: process.env.MULTISIG_ADDRESS!,
      OfferSequence: escrowId, // Use the sequence from escrow creation
      Account: process.env.MULTISIG_ADDRESS!,
      Fee: "12",
      Flags: 0,
      LastLedgerSequence: currentLedger + 20,
      Sequence: sequence
    }

    const signed = wallet.sign(escrowFinishTx)
    const result = await client.submitAndWait(signed.tx_blob)
    console.log("[Escrow] Escrow finished successfully")
    return result
  } catch (error) {
    console.error("[Escrow] Failed to finish escrow:", error)
    throw error
  } finally {
    await client.disconnect()
  }
}

/**
 * Cancel Escrow
 * @param escrowId sequence number used when creating the escrow
 * @returns transaction result
 */
export async function cancelEscrow(
  escrowId: number
) {
  const client = new Client(XRPL_TESTNET)
  await client.connect()
  
  try {
    const wallet = Wallet.fromSeed(process.env.MULTISIG_SEED!)
    const currentLedger = await client.getLedgerIndex()
    const sequence = await getAccountSequence(client, wallet.classicAddress)

    console.log("[Escrow] Cancelling escrow with OfferSequence:", escrowId)
    const escrowCancelTx: EscrowCancel = {
      TransactionType: "EscrowCancel",
      Owner: process.env.MULTISIG_ADDRESS!,
      OfferSequence: escrowId, // Use the sequence from escrow creation
      Account: process.env.MULTISIG_ADDRESS!,
      Fee: "12",
      Flags: 0,
      LastLedgerSequence: currentLedger + 20,
      Sequence: sequence
    }

    const signed = wallet.sign(escrowCancelTx)
    const result = await client.submitAndWait(signed.tx_blob)
    console.log("[Escrow] Escrow cancelled successfully")
    return result
  } catch (error) {
    console.error("[Escrow] Failed to cancel escrow:", error)
    throw error
  } finally {
    await client.disconnect()
  }
}
