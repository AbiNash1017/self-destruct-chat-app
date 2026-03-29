# >_< Private_Chat 💬

A modern, high-performance, and **self-destructing** private chat application designed for ephemeral and secure communication.

**[Live Preview](https://private-chat-v2.vercel.app/)** | **[Portfolio](https://abinash-das.vercel.app/)**

---

## ✨ Features

- 🕒 **Self-Destructing Rooms**: Message rooms that automatically delete themselves after a set period.
- 🔒 **Private & Secure**: Encrypted and ephemeral; no long-term storage of sensitive conversations.
- 🚀 **Real-time Engine**: Powered by **Upstash Realtime** for sub-millisecond message delivery.
- 🎨 **Premium UI/UX**: Dark-themed, glassmorphic design with smooth micro-animations and right/left message alignment.
- 🤝 **Easy Sharing**: One-click room invites with dynamic sharing popups.
- 🤖 **Auto-Identity**: Instant, friendly nicknames generated for every session.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16 (Turbopack)](https://nextjs.org/)
- **Backend / API**: [ElysiaJS](https://elysiajs.com/) & [Eden](https://elysiajs.com/eden/overview.html)
- **Real-time / Database**: [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted) & [Upstash Realtime](https://upstash.com/docs/realtime/overall/getstarted)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [React Query (TanStack)](https://tanstack.com/query/latest)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Upstash Account](https://console.upstash.com/) (Redis & Realtime)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbiNash1017/chatapp.git
   cd chatapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   UPSTASH_REDIS_REST_URL="your-redis-url"
   UPSTASH_REDIS_REST_TOKEN="your-redis-token"
   UPSTASH_REALTIME_URL="your-realtime-url"
   UPSTASH_REALTIME_API_KEY="your-realtime-key"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 📖 How to Use

1. **Enter the Lobby**: Visit the landing page to get your unique session nickname.
2. **Create a Room**: Click "CREATE SECURE ROOM". This generates a unique encryption-backed room ID.
3. **Invite Friends**: Copy the Room URL from the header or the "Invite" popup and send it to your friend.
4. **Chat Securely**: Start chatting! Your messages will appear with premium alignment (Your messages on the right, theirs on the left).
5. **Self-Destruct**: Keep an eye on the countdown timer in the header. Once it hits zero, the room and all its messages are **permanently wiped** from the database. You can also manually trigger a wipe by clicking "DESTROY NOW".

---

## 👨‍💻 Developed By

Developed with ❤️ by **Abinash Das**

- **Portfolio**: [abinash-das.vercel.app](https://abinash-das.vercel.app/)
- **GitHub**: [@AbiNash1017](https://github.com/AbiNash1017)
- **Email**: [abinash.das.dev@gmail.com](mailto:abinash.das.dev@gmail.com)

---

