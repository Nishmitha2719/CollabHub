# CollabHub

A production-ready Next.js collaboration platform with Supabase integration.

## 🚀 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Dark theme with purple gradients)
- **Framer Motion** (Animations)
- **Supabase** (Auth, Database, Storage)

## 📁 Project Structure

```
CollabHub/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components (Navbar, Footer)
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── supabaseClient.ts # Supabase configuration
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## 🛠️ Setup Instructions

### Quick Start (Choose ONE method)

#### Method 1: Python Script (EASIEST - RECOMMENDED) ⚡

```bash
python create_files.py
npm install
copy .env.example .env.local
npm run dev
```

#### Method 2: Node.js Script 🟢

```bash
node setup.js
npm install
copy .env.example .env.local
npm run dev
```

#### Method 3: Automated Batch File (Windows) 💻

Double-click `RUN_SETUP.bat` - it will:
- Create all files automatically
- Install npm packages
- Create .env.local
- Show you next steps

### Manual Setup (if scripts don't work)

1. Create folders: `app`, `components\layout`, `components\ui`, `lib`, `hooks`, `types`, `public`
2. Copy code from `ALL_SOURCE_FILES.txt` to respective files
3. Run `npm install`

### 3. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` to `.env.local`
3. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 🎨 Features

- ✅ Dark theme with purple gradient accents
- ✅ Glassmorphism UI components
- ✅ Responsive navbar and footer
- ✅ Supabase integration ready
- ✅ TypeScript for type safety
- ✅ Framer Motion animations
- ✅ Utility functions with clsx and tailwind-merge

## 📦 Key Files

- **lib/supabaseClient.ts** - Supabase client configuration
- **lib/utils.ts** - Utility functions (cn helper)
- **components/ui/** - Reusable components (Button, Card, Container)
- **components/layout/** - Layout components (Navbar, Footer)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Notes

- All components use TypeScript
- Tailwind CSS configured with custom purple theme
- Supabase client uses singleton pattern
- Components are fully typed and reusable

---

Built with ❤️ using Next.js and Supabase
