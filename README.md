# Rewards Tracker BR 🏆

A comprehensive rewards tracking application for Microsoft Rewards users in Brazil. Track your daily activities, monitor progress, and manage redemptions with beautiful charts and analytics.

## Features

- 📊 **Daily Activity Tracking** - Log PC searches, mobile searches, Xbox activities, and daily challenges
- 📈 **Progress Analytics** - Beautiful charts showing your earning trends and patterns
- 🏆 **Goal Tracking** - Set monthly targets and track progress towards rewards
- 💰 **Redemption Management** - Track points spent on gift cards and rewards
- 👥 **Guest Mode** - Try the app without creating an account
- 🔒 **Secure Authentication** - Supabase-powered authentication with proper security measures

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/eduardotai/rewardstracker.git
   cd rewardstracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Create a new project on [Supabase](https://supabase.com)
   - Run the migration: `supabase db push`
   - Or manually run the SQL in `supabase/migrations/`

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## Security Notes

This application implements several security measures:

- ✅ **Environment Variables** - All sensitive data stored in environment variables
- ✅ **Row Level Security (RLS)** - Database policies ensure users can only access their own data
- ✅ **Server-Side Authentication** - Middleware protects routes and validates sessions
- ✅ **Type Safety** - Full TypeScript coverage prevents runtime errors
- ✅ **Input Validation** - Zod schemas validate all user inputs
- ✅ **No Hardcoded Secrets** - All configuration externalized

## Building for Production

```bash
npm run build
npm run start
```

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context
- **Type Safety:** TypeScript

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Made with ❤️ for Brazilian Microsoft Rewards users**
