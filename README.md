#  DealRoom Live
### High-Stakes Marketplace Negotiation & WebRTC Video Inspection Suite
> **Built for the [CometChat 'Zero to Chat' Hackathon](https://unstop.com/college-fests/zero-to-chat-cometchat-hackathon-cometchat-520033) using the CometChat MCP Server & React v7 UI Kit.**

[![CometChat](https://img.shields.io/badge/CometChat-React%20v7%20UI%20Kit-6366f1?style=for-the-badge&logo=chat)](https://www.cometchat.com)
[![WebRTC Calls](https://img.shields.io/badge/CometChat-WebRTC%20Calls%20v5-10b981?style=for-the-badge&logo=webrtc)](https://www.cometchat.com/voice-and-video-calls)
[![MCP Powered](https://img.shields.io/badge/AI%20Agent-MCP%20Verified-06b6d4?style=for-the-badge&logo=anthropic)](https://mcp.cometchat.com/mcp?ref=z2c)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

---

##  What is DealRoom Live?

High-value marketplace transactions (vintage watches, fine art, collector vehicles, SaaS acquisitions) frequently stall or fall through in traditional chat apps because plain text lacks trust, verification, and binding negotiation mechanics.

**DealRoom Live** transforms standard messaging into an active, high-trust commerce studio:
1. **Real-Time 1-on-1 Negotiation**: Instant messaging with live counterparty presence subscriptions (`CometChat.addUserListener`, `onUserOnline`, `onUserOffline`, `getUserPresence`), bidirectional typing indicators (`CometChat.startTyping`, `endTyping`, `onTypingStarted`, `onTypingEnded`), dynamic last-seen statuses (`formatLastSeen`), and delivered vs. read receipts (`markAsRead`, `onMessagesDelivered`, `onMessagesRead`).
2. **Interactive Smart Offer Cards**: Custom deal cards directly inside the chat bubble stream with instant `Accept`, `Counter`, and `Decline` action states driving an interactive Escrow state machine.
3. **1-Click Live Video Inspection**: Buyers and sellers can instantly launch an encrypted HD WebRTC video consultation powered by `@cometchat/calls-sdk-javascript` to inspect serial numbers, hallmarks, and condition stamps live on macro camera before releasing payment.
4. **Interactive Escrow State Machine (Client Demo)**: A client-side demonstration state machine (`pending` → `countered` → `escrow_funded` → `inspection_completed` → `buyer_signed` → `seller_signed` → `payout_released`) synchronized directly with CometChat negotiation payloads. In enterprise production, this connects to institutional escrow providers or smart contract custody.
5. **Policy Guardrails Indicator (Demo Evaluation)**: Client-side demonstration evaluator modeling off-platform circumvention detection and PII masking planned for production via CometChat Dashboard Rules Engine & Moderation Webhooks.

---

## Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (React 19 + Vite + Modern CSS)"]
        UI["DealRoom Glassmorphic UI"]
        CC_UIKit["CometChat React v7 UI Kit"]
        CC_Calls["CometChat Calls SDK (WebRTC v5)"]
        OfferComponent["Interactive DealOfferCard (Custom Bubbles)"]
        EscrowSM["Client Escrow State Machine (Demo Mock)"]
    end

    subgraph CometChat_Cloud["CometChat Global Infrastructure"]
        Messaging["Real-time WebSocket Messaging & Presence"]
        MediaServer["WebRTC Audio/Video Routing Bridges"]
        Guardrails["Production: Dashboard Rules Engine & Moderation Queue"]
    end

    subgraph Agent_MCP["AI Coding Agent Integration"]
        MCP["CometChat MCP Server (@cometchat/skills)"]
        IDE["Coding Agent (Antigravity / Claude Code / Cursor)"]
    end

    IDE <-->|Reads live docs & verified bundles| MCP
    UI --> CC_UIKit
    UI --> CC_Calls
    UI --> EscrowSM
    CC_UIKit <-->|Real-time Socket| Messaging
    CC_Calls <-->|Encrypted Media Stream| MediaServer
    Messaging --> Guardrails
```

---

##  Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Harshit17x/dealroom-live.git
cd dealroom-live
npm install
```

### 2. Configure CometChat Credentials
Create a free account at [app.cometchat.com](https://app.cometchat.com/) (free tier includes 100 Monthly Active Users).

#### Option A: Pull automatically with the CometChat Skills CLI
```bash
npx @cometchat/skills-cli@3 auth login
npx @cometchat/skills-cli@3 provision run
```

#### Option B: Configure manually
Copy `.env.example` to `.env` and insert your dashboard credentials:
```env
VITE_COMETCHAT_APP_ID=your_app_id_here
VITE_COMETCHAT_REGION=us
VITE_COMETCHAT_AUTH_KEY=your_auth_key_here
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

##  90-Second Demo Flow

| Step | Action | Feature Highlight |
|---|---|---|
| **1. Agent MCP Connector** | Terminal shows active `@cometchat/skills` & MCP tool execution. | Demonstrates AI agent build compliance |
| **2. Listing & Chat** | Marcus (Buyer) opens Elena's (Seller) 1984 Rolex Submariner listing. | Clean 3-column CometChat layout standard |
| **3. Smart Offer** | Marcus submits a $13,800 offer card with custom parameters. | CometChat Custom Message payloads & confetti |
| **4. Live Inspection** | Elena initiates a 1-click video call; macro camera verifies serial #8.4M. | CometChat Calls SDK WebRTC integration |
| **5. Escrow Demonstration** | Buyer confirms condition; state machine locks funds (`ESCROW LOCKED ✅`). | End-to-end transaction state synchronization |

---

##  Tech Stack
- **Framework**: React 19 (`19.2.8`), Vite
- **Messaging**: `@cometchat/chat-uikit-react@^7.2.3`, `@cometchat/chat-sdk-javascript@^4.2.0`
- **Voice/Video**: `@cometchat/calls-sdk-javascript@^5.0.6`
- **Styling**: Modern Vanilla CSS (Design Tokens, Glassmorphism, Zero-Shift Layout)
- **Icons & Effects**: `lucide-react`, `canvas-confetti`

---

##  Hackathon Submission
- **Challenge**: [Zero to Chat: CometChat Hackathon (Edition 1)](https://unstop.com/college-fests/zero-to-chat-cometchat-hackathon-cometchat-520033)
- **Developer**: Harshit Bisht ([@Harshit17x](https://github.com/Harshit17x))
- **Hashtags**: `#ZeroToChat` • Tag: `@CometChat`

