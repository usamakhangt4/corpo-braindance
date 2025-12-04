# CORPO // BRAINDANCE - Technical Documentation

> Complete technical documentation for developers

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

- **Server State**: [React Query (TanStack Query)](https://tanstack.com/query) - Data fetching, caching, and optimistic updates
- **Client State**: [Zustand](https://github.com/pmndrs/zustand) - Authentication and UI state
- **Server Actions**: Next.js Server Actions for type-safe mutations
- **Deployment**: [Vercel](https://vercel.com/)
- **Cron Jobs**: Vercel Cron

## 📁 Project Structure

```
corpo-braindance/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth pages (route group)
│   │   │   └── login/
│   │   │       └── page.tsx     # Login/Signup page
│   │   ├── (features)/          # Feature pages (route group)
│   │   │   └── hall-of-shame/
│   │   │       ├── page.tsx     # Server Component (data fetching)
│   │   │       └── hall-of-shame-client.tsx  # Client Component (interactivity)
│   │   ├── (user)/               # User pages (route group)
│   │   │   ├── profile/
│   │   │   │   └── page.tsx     # User profile page
│   │   │   └── settings/
│   │   │       └── page.tsx     # User settings page
│   │   ├── actions/               # Server Actions
│   │   │   ├── auth.ts          # Auth actions (username check, profile creation)
│   │   │   └── buzzword.ts      # Buzzword actions (generate, submit)
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts     # OAuth callback handler
│   │   ├── components/           # React components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── auth-card.tsx    # Login/Signup form
│   │   │   ├── auth-modal.tsx   # Auth modal dialog
│   │   │   ├── Navbar.tsx       # Navigation bar
│   │   │   └── UserDropdown.tsx # User menu dropdown
│   │   ├── hooks/                # React Query hooks
│   │   │   └── use-buzzwords.ts # Data fetching hooks
│   │   ├── lib/
│   │   │   ├── db/              # Database adapters
│   │   │   │   └── buzzword-db.ts  # Unified database adapter
│   │   │   ├── stores/          # Zustand stores
│   │   │   │   ├── use-auth-store.ts      # Authentication state
│   │   │   │   ├── use-buzzword-store.ts  # Buzzword generation state
│   │   │   │   └── use-voting-store.ts    # Voting state
│   │   │   ├── providers/
│   │   │   │   └── query-provider.tsx     # React Query provider
│   │   │   ├── supabase/
│   │   │   │   └── client.ts             # Unified Supabase client helper
│   │   │   ├── types/           # TypeScript type definitions
│   │   │   │   ├── auth.ts
│   │   │   │   ├── buzzword.ts
│   │   │   │   └── profile.ts
│   │   │   ├── constants/        # Application constants
│   │   │   │   ├── buzzwords.ts
│   │   │   │   └── routes.ts
│   │   │   └── utils.ts          # Client utilities (cn, etc.)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx              # Home page
├── supabase/
│   └── schema/                   # Database schema files
│       ├── buzzwords.sql         # Buzzwords table schema
│       ├── profiles.sql          # Profiles table schema
│       ├── votes.sql             # Votes table schema
│       └── trigger.sql           # Trigger setup (if needed manually)
├── .env.local                    # Environment variables (gitignored)
└── package.json
```

### Key Architectural Decisions

- **Route Groups**: Using `(auth)`, `(features)`, and `(user)` for better organization without affecting URLs
- **Server vs Client Components**: Default to Server Components, use `'use client'` only when needed
- **Server Actions**: Type-safe server mutations for data modifications
- **React Query**: Server state management with automatic caching, refetching, and optimistic updates
- **Database Abstraction**: Direct use of database adapters (no service layer)
  - Components → React Query Hooks → Database Adapters → Supabase
- **Unified Supabase Client**: Single helper that detects context (client/server) and returns appropriate client
- **Type Safety**: Centralized types in `lib/types/`
- **Constants**: Centralized constants in `lib/constants/`
- **Authentication**: Cookie-based auth with username support and Google OAuth

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

   Run the SQL schemas in Supabase SQL Editor (in this order):

   **a. Create buzzwords table:**
   - Run `supabase/schema/buzzwords.sql` to create the `buzzwords` table with RLS policies
   - Includes `user_id` column for authenticated submissions
   - Only authenticated users can submit and vote

   **b. Create profiles table:**
   - Run `supabase/schema/profiles.sql` to create the `profiles` table
   - Includes username, display_name, bio, avatar_url, website, and preferences
   - Auto-creates profile on user signup via database trigger
   - Includes helper functions for username checking and email lookup

   **c. Create votes table:**
   - Run `supabase/schema/votes.sql` to create the `buzzword_votes` table
   - Tracks user votes (upvote/downvote) for buzzwords
   - Includes trigger to automatically update buzzword upvote counts
   - Includes helper function to get user vote status

   **d. Set up trigger (if needed):**
   - The trigger is included in `profiles.sql`, but if it doesn't work automatically, run `supabase/schema/trigger.sql`
   - This ensures profiles are auto-created when users sign up via OAuth

   **e. Configure Google OAuth (optional):**
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable Google provider
   - Add Client ID and Secret from Google Cloud Console

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
  - No `'use client'` directive
  - Can be async and directly fetch from database
  - Example: `hall-of-shame/page.tsx` fetches initial data server-side
- **Client Components** (`'use client'`): Used for interactivity, hooks, and browser APIs
  - Required for React Query hooks, Zustand stores, event handlers
  - Example: `hall-of-shame-client.tsx` handles voting and real-time updates

### Database Architecture

The project uses a unified database adapter pattern:

```
Client Components
    ↓
React Query Hooks (use-buzzwords.ts)
    ↓
Database Adapter (buzzword-db.ts)
    ↓
Supabase Client (unified helper)
```

**Key Points:**
- Direct use of database adapters (no service layer)
- React Query handles caching, refetching, and optimistic updates
- Unified Supabase client helper (`getSupabaseClient()`) detects context automatically
- Server Actions for mutations (type-safe server-side operations)

### Database Schema Organization

Database schemas are organized in `supabase/schema/`:

- **`buzzwords.sql`**: Main buzzwords table with RLS policies
- **`profiles.sql`**: User profiles table with trigger function and helper functions
- **`votes.sql`**: Voting system with automatic upvote count updates
- **`trigger.sql`**: Standalone trigger setup (use if trigger in profiles.sql doesn't work)

All schemas use `CREATE TABLE IF NOT EXISTS` and `CREATE OR REPLACE FUNCTION` for idempotency, so they can be safely re-run.

### Data Flow

1. **Buzzword Generation**: Server Action (`generateBuzzwordAction`) keeps logic server-side
2. **Data Fetching**: React Query hooks fetch data with automatic caching
3. **Data Submission**: Server Action (`submitBuzzwordAction`) requires authentication
4. **Voting**: React Query mutations with optimistic updates
5. **Real-time Updates**: React Query background refetching keeps data fresh

### State Management

- **Server State**: React Query (`@tanstack/react-query`) for all data fetching
  - Automatic caching and background refetching
  - Optimistic updates for better UX
  - Query invalidation for real-time feel
- **Client State**: Zustand stores for:
  - Authentication state (`use-auth-store.ts`)
  - UI state (`use-buzzword-store.ts`, `use-voting-store.ts`)
- **Local State**: `useState` for component-specific state
- **Server State**: Server Components fetch initial data, React Query handles updates

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

## 🔐 Authentication

The app supports multiple authentication methods:

### Email/Password with Username
- Users sign up with email, password, and unique username
- Usernames are validated (3+ chars, alphanumeric + underscore)
- Real-time username availability checking
- Users can sign in with either email or username

### Google OAuth
- One-click sign-in with Google account
- Auto-generates username for OAuth users
- Extracts avatar and display name from Google profile
- Seamless integration with existing auth system

### Features
- Cookie-based authentication (works with Server Components)
- Row Level Security (RLS) policies protect user data
- Profile auto-creation on signup
- Username uniqueness enforced at database level

## 📝 Code Quality

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Next.js recommended configuration
- **Code Organization**: Follows Next.js 15 App Router conventions
- **Best Practices**: Senior-level engineering patterns
- **Server Actions**: Type-safe server mutations
- **React Query**: Optimistic updates and automatic caching
- **Error Handling**: Proper error boundaries and user-friendly messages
- **Security**: RLS policies, authentication checks, input validation

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

