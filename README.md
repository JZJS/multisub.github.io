---

# XRP Multi-Signature Subscription Demo

## 🚀 Overview
![multisub](https://github.com/user-attachments/assets/f2377d3b-b1b5-465f-b4f6-a05e76d2d5ee)

**XRP Multi-Signature Subscription** is a demo web application that showcases how multi-signature approval and time-based escrow can be used to create secure, collaborative subscription payments on the XRP Ledger. This project is designed for hackathons and as a reference for Web3 teams interested in improving the trust and transparency of crypto subscription payments.

---

## 💡 Why This Project?

Traditional crypto payments, even in the Web3 world, often rely on a single account and lack collaborative approval and clear user governance. This creates risks for shared wallets, teams, and DAOs, such as unauthorized payments, insufficient accountability, and no way to cancel subscriptions in a trust-minimized way.

This project addresses these pain points by providing:

* **Collaborative Security:** Multiple managers (signers) must approve any subscription before payment is sent.
* **Automated, Transparent Escrow:** Funds are securely locked in the XRP Ledger's Escrow smart contract and only released when all parties approve within a set time window.
* **User-Focused Workflow:** Easy email-based approvals make the system accessible to any team, even if signers aren't familiar with blockchain tools.

---

## 🧩 Key Features

* **Multi-Signature Approval Flow:** Each subscription order requires all specified signers to click an email confirmation link before funds are released.
* **Time-Based Escrow:** If approval is not completed within the deadline (e.g., 1 minute for demo), funds are automatically refunded to the source wallet.
* **Real XRP Testnet Integration:** All on-chain actions (escrow creation, finish, and cancel) are executed in real time on the XRP Testnet via `xrpl.js`.
* **Email Notifications:** Signers receive approval links via email (powered by Resend API).
* **Modern React Frontend:** Clean UI with editable service/amount/signers fields, and visual order status.

---

## 🏗️ How It Works

1. **Create a Subscription Order:**
   The user fills out the service name, amount, and selects signers.
2. **Escrow Funding:**
   Upon order creation, funds are locked in an XRP Escrow smart contract. The deadline is set (e.g., 1 minute for demo purposes).
3. **Email Approval:**
   All signers receive an email with a unique approval link.
4. **Multi-Sig Approval:**
   Each signer must click their link. If all signers approve before the deadline, funds are released to the service wallet.
5. **Timeout & Refund:**
   If approval is incomplete when the timer expires, the escrow is canceled and funds are automatically refunded to the sender.
6. **Fully On-Chain:**
   All actions are visible and verifiable on the XRP Testnet blockchain.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (React, Tailwind CSS)
* **Backend/API:** Next.js App Router, Node.js
* **Blockchain:** [xrpl.js](https://xrpl.org/xrpl.js.html) (XRP Testnet)
* **Email:** [Resend](https://resend.com/) API
* **Storage:** In-memory (for demo); can be extended with a DB for production

---

## 📦 Project Structure

```
├─ app/
│  ├─ api/
│  │   ├─ create-order/route.ts    # Handles order creation, email, and escrow creation
│  │   ├─ approve/route.ts         # Handles approval link clicks
├─ hooks/
│  ├─ useXrplEscrow.ts             # XRPL escrow interaction logic
│  ├─ useCreateOrder.ts            # Frontend API logic
├─ components/
│  ├─ ServiceCard.tsx              # Main order UI card
├─ .env.local                      # Secrets & config (NOT COMMITTED)
```

---

## 🧑‍💻 How to Run Locally

1. **Clone the Repository**

   ```bash
   git clone https://github.com/JZJS/multisub.github.io.git
   cd multisub.github.io
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**

   * Create a `.env.local` file in the project root:

     ```env
     RESEND_API_KEY=your-resend-api-key
     MULTISIG_SEED=your-xrp-testnet-wallet-seed
     MULTISIG_ADDRESS=your-xrp-testnet-wallet-address
     SERVICE_WALLET=service-receiving-wallet-address
     NEXT_PUBLIC_BASE_URL=http://localhost:3000
     ```
   * You can get XRP testnet wallets at: [https://xrpl.org/xrp-testnet-faucet.html](https://xrpl.org/xrp-testnet-faucet.html)

4. **Start the Development Server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

5. **Try the Demo!**

   * Fill out a new order in the web UI, enter your own email for testing approval.
   * Watch emails arrive; click the approval link before the timer expires.
   * Check on-chain transactions using the XRP Testnet explorer: [https://testnet.xrpl.org/](https://testnet.xrpl.org/)

---

## 📈 Future Improvements

* Persistent database for production use (currently in-memory for demo simplicity)
* Dashboard to visualize all pending/completed orders
* Mobile-optimized UI
* Real multi-sig (on-chain) support with multiple testnet wallets
* Integration with more email providers, more robust notifications
* Full audit log & security improvements

---

## 🙌 Contact Us

Twitter: [@BTCtensai](https://twitter.com/BTCtensai)

---

## 🌎 Links

* [XRPL.org documentation](https://xrpl.org/)
* [XRPL Testnet Explorer](https://testnet.xrpl.org/)
* [Resend API](https://resend.com/)
* [Next.js documentation](https://nextjs.org/)

---

**This project is for demonstration and educational purposes only. Do not use real funds on mainnet!**

---
