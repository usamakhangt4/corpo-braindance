# CORPO // BRAINDANCE

> Generate enterprise-grade nonsense for 2025. A satirical buzzword generator that creates hilariously corporate phrases with AI-powered synergy scores.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

## 🎯 What is This?

**CORPO // BRAINDANCE** is a satirical web application that generates hilariously corporate buzzwords and phrases. Perfect for poking fun at corporate jargon, creating memes, or just having a laugh at the expense of corporate speak.

## ✨ Features

### 🎲 Buzzword Generator

Generate random corporate jargon based on your role:

- **CEO Mode**: Visionary, holistic, paradigm-shifting nonsense
- **Sales Mode**: Growth-focused, ROI-positive, conversion-driven phrases
- **Tech Mode**: Cloud-native, serverless, algorithmically complex jargon

Each generated phrase comes with:

- A "synergy score" (80-99%) - because everything needs a score
- A full sentence explanation - because context matters
- Copy-to-clipboard functionality - for maximum efficiency
- Submit to Hall of Shame (requires authentication)

### 🏆 Hall of Shame

View the most cringeworthy corporate phrases submitted by users:

- Top 10 phrases ranked by upvotes
- Vote on your favorites (or least favorites) - requires authentication
- Real-time leaderboard updates with React Query
- See which department generated the most synergy
- View submissions by authenticated users

### 🔐 Authentication

- **Email/Password Signup** with unique username
- **Username-based Signin** - sign in with email or username
- **Google OAuth** - one-click sign-in with Google
- **Real-time Username Availability** checking during signup
- **User Profiles** with display name, bio, avatar, and website

### 🎨 Modern Design

- Cyberpunk-inspired UI with neon accents
- Smooth animations and transitions
- Fully responsive (mobile-first)
- Dark theme optimized

## 🚀 Try It Out

Visit the live site: [Your deployment URL here]

Or run locally:

```bash
git clone https://github.com/yourusername/corpo-braindance.git
cd corpo-braindance
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Set up the database by running the SQL schemas in Supabase SQL Editor (in order):

1. **Buzzwords table**: Run `supabase/schema/buzzwords.sql`
2. **Profiles table**: Run `supabase/schema/profiles.sql`
3. **Votes table**: Run `supabase/schema/votes.sql`
4. **Trigger setup**: Run `supabase/schema/trigger.sql` (if the trigger in profiles.sql doesn't work automatically)

Then start the development server:

```bash
npm run dev
```

## 🛠️ Built With

- **Next.js 15** - Modern React framework with App Router
- **TypeScript** - Type-safe development (strict mode)
- **Supabase** - PostgreSQL database, authentication, and backend
- **React Query** - Server state management with optimistic updates
- **Zustand** - Client-side state management
- **Server Actions** - Type-safe server mutations
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Accessible UI components

## 📸 Screenshots

_Coming soon - Add screenshots of the app here_

## 🎭 Use Cases

- **Memes**: Generate corporate speak for memes
- **Presentations**: Add some "synergy" to your slides
- **Entertainment**: Laugh at corporate jargon
- **Portfolio**: Showcase modern web development skills

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome!

## 📄 License

MIT License - feel free to use this project as inspiration for your own work.

## 🙏 Acknowledgments

- Inspired by corporate jargon and buzzword culture
- Built with modern web technologies
- Designed for portfolio demonstration

---

**Built with ❤️ and excessive corporate synergy**

For technical documentation, see [DOCS.md](./DOCS.md)
