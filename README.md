# 🤖 SimieBot OS

**SimieBot** is a high-performance, **Agentic Personal Operating System** designed for academic synthesis, crypto security, and media automation. Built on a foundations of **Neo-Tactile "Old Money"** aesthetics, it combines the power of **Next.js 15**, **LangGraph**, and **Auth0** into a unified, secure, and privacy-first digital workspace.

![SimieBot Dashboard Header](https://images.ctfassets.net/23aumh6u8s0i/1gY1jvDgZHSfRloc4qVumu/d44bb7102c1e858e5ac64dea324478fe/tool-calling-with-federated-api-token-exchange.jpg)
*(Note: Replace this with an actual screenshot of your SimieBot Dashboard)*

---

## 🔥 Core Modules

| Module | Description | Status |
| :--- | :--- | :--- |
| **Thesis / Research** | Academic synthesis and academic sourcing for deep theoretical analysis. | **ACTIVE** |
| **Crypto Vaults** | Real-time asset tracking with integrated security protocol logs. | **ACTIVE** |
| **Media Engine** | Video and audio processing with throughput and latency monitoring. | **ACTIVE** |
| **Activity Ledger** | Immutable audit log of every system operation and agentic decision. | **ACTIVE** |
| **System Sync** | Specialized agents for Gmail, Drive, and Slack (via Auth0 Token Vault). | **ACTIVE** |

---

## 🎨 Design System: Neo-Tactile

SimieBot adheres to a strict "Old Money" digital aesthetic:
- **Glassmorphism**: Layered depth with high-refraction glass panels and subtle blur effects.
- **Color Palette**: Deep slate/navy grounds with **Azure Blue** and **Neon Cyan** highlights.
- **Fluid Layout**: Fully responsive, mobile-first grid architecture that adapts to any screen.
- **Tactile Inputs**: Custom "neo-extrusion" and "neo-intrusion" utility classes for 3D UI elements.

---

## 🚀 Technical Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router) + [Tailwind CSS](https://tailwindcss.com/)
- **Intelligence Layer**: [LangGraph.js](https://langchain-ai.github.io/langgraphjs/) + [Vercel AI SDK](https://sdk.vercel.ai/)
- **Identity & Security**: [Auth0](https://auth0.com/) (Next.js SDK + Token Vault)
- **Monitoring**: [LangSmith](https://smith.langchain.com/) for agentic tracing.

---

## ⚙️ Environment Configuration

To run SimieBot locally, you must configure a `.env.local` file with the following parameters:

### 📡 Core Services
```env
# 1. LangGraph Agent Server
LANGGRAPH_API_URL=http://localhost:54367

# 2. Local Next.js Instance
APP_BASE_URL="http://localhost:3000"
```

### 🔐 Authentication (Auth0)
```env
AUTH0_SECRET="..."               # Generate with `openssl rand -hex 32`
AUTH0_DOMAIN="..."               # Your Auth0 Domain (dev-xxx.us.auth0.com)
AUTH0_CLIENT_ID="..."           # Your Auth0 Regular Web App Client ID
AUTH0_CLIENT_SECRET="..."       # Your Auth0 Regular Web App Client Secret
AUTH0_AUDIENCE="https://simiebot.local"
AUTH0_SCOPE="openid profile email offline_access"
```

### 🧠 Intelligence & Tracing
```env
# OpenAI for Agent Brain
OPENAI_API_KEY="sk-proj-..."

# LangSmith for Tracing (Optional but highly recommended)
LANGSMITH_TRACING=true
LANGSMITH_API_KEY="lsv2_pt_..."
```

---

## 🛠️ Development Workflow

### 1. Installation
```powershell
npm install
```

### 2. Simultaneous Boot (Next.js + LangGraph)
```powershell
npm run all:dev
```

### 3. Port Troubleshooting
If you encounter `EADDRINUSE: address already in use ::1:54367`, run this command to kill the stuck LangGraph process:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 54367).OwningProcess -Force
```

---

## 🛡️ License & Copyright

© 2026 SimieBot. Built by **AI Partner** for the **Luminous Engine**.
Open-sourced under the MIT License - see the [LICENSE](LICENSE) file for details.
