# CORPO // BRAINDANCE

> Generate enterprise-grade nonsense for 2025. A satirical buzzword generator that creates hilariously corporate phrases with AI-powered synergy scores.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

## 🎯 Features

- **Buzzword Generator**: Generate corporate jargon based on role (CEO, Sales, Tech)
- **Hall of Shame**: View and vote on the most cringeworthy phrases
- **Synergy Scoring**: Each phrase gets a randomized "synergy score" (80-99%)
- **Real-time Voting**: Upvote/downvote your favorite corporate nonsense
- **Modern UI**: Cyberpunk-inspired design with smooth animations

## 🛠️ Tech Stack

### Core

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Database

- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with pgvector)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

### State Management & Tools

- **State**: [Zustand](https://github.com/pmndrs/zustand)
- **Deployment**: [Vercel](https://vercel.com/)
- **Cron Jobs**: Vercel Cron

## 📁 Project Structure

```
corpo-braindance/
├── app/
│   ├── (main)/              # Main public pages (route group)
│   │   ├── page.tsx        # Home/Generator page
│   ├── (features)/          # Feature pages (route group)
│   │   └── hall-of-shame/
│   │       └── page.tsx    # Hall of Shame leaderboard
│   ├── api/                 # API routes
│   │   └── buzzword/
│   │       └── route.ts
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── Navbar.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── use-buzzword.ts
│   │   └── use-voting.ts
│   ├── lib/                 # Client-side utilities
│   │   ├── types/          # TypeScript type definitions
│   │   ├── constants/      # Application constants
│   │   ├── buzzwords.ts    # Buzzword generation logic
│   │   ├── supabaseClient.ts
│   │   └── utils.ts        # Client utilities (cn, etc.)
│   ├── utils/               # Server-side utilities
│   │   └── supabase/
│   │       └── server.ts    # Server-side Supabase client
│   ├── globals.css
│   └── layout.tsx
├── public/                  # Static assets
├── .env.local              # Environment variables (gitignored)
└── package.json
```

### Key Architectural Decisions

- **Route Groups**: Using `(main)` and `(features)` for better organization without affecting URLs
- **Separation of Concerns**:
  - `lib/` = Client-side code
  - `utils/` = Server-side code
- **Type Safety**: Centralized types in `lib/types/`
- **Constants**: Centralized constants in `lib/constants/`
- **Custom Hooks**: Reusable logic extracted to `hooks/`

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/corpo-braindance.git
   cd corpo-braindance
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**

   Create a `buzzwords` table with the following schema:

   ```sql
   CREATE TABLE buzzwords (
     id BIGSERIAL PRIMARY KEY,
     phrase TEXT NOT NULL,
     meaning TEXT NOT NULL,
     department TEXT NOT NULL,
     synergy_score INTEGER NOT NULL,
     upvotes INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Server vs Client Components

- **Server Components** (default): Used for data fetching, SEO, and server-side logic
- **Client Components** (`'use client'`): Used for interactivity, hooks, and browser APIs

### Data Flow

1. **Buzzword Generation**: Client-side generation using constants
2. **Data Persistence**: Supabase database for storing submissions
3. **Voting**: Optimistic updates with server sync
4. **Real-time**: Supabase real-time subscriptions (ready for implementation)

### State Management

- **Local State**: `useState` for component-specific state
- **Global State**: Zustand stores (ready for implementation)
- **Server State**: Server Components for data fetching

## 🎨 Styling

- **Tailwind CSS v4**: Utility-first CSS framework
- **Design System**: Custom color palette with cyberpunk aesthetic
- **Responsive**: Mobile-first approach
- **Animations**: Smooth transitions and hover effects

## 🔒 Environment Variables

| Variable                        | Description                 | Required |
| ------------------------------- | --------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL   | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes      |

## 📝 Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Code Organization**: Follows Next.js 15 App Router conventions
- **Best Practices**: Senior-level engineering patterns

## 🚢 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy!

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
