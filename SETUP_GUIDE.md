# CollabHub - Setup Guide

## ⚠️ Important: Manual Setup Required

PowerShell 6+ is not available on this system. Please follow these manual steps:

### Step 1: Create Directory Structure

Create the following folders manually (using File Explorer or Command Prompt):

```
CollabHub\
├── app\
├── components\
│   ├── layout\
│   └── ui\
├── lib\
├── hooks\
├── types\
└── public\
```

**Using Command Prompt:**
```cmd
cd e:\CollabHub
mkdir app
mkdir components\layout
mkdir components\ui
mkdir lib
mkdir hooks
mkdir types
mkdir public
```

### Step 2: Copy Files

After creating the directories, all the code files are already generated:

#### Configuration Files (Already Created ✓)
- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `next.config.mjs`
- `.eslintrc.json`
- `.gitignore`
- `.env.example`

#### Files to Create (See Below)

Copy the content from the sections below into their respective files:

1. **app/globals.css** - Global styles
2. **app/layout.tsx** - Root layout
3. **app/page.tsx** - Home page
4. **lib/supabaseClient.ts** - Supabase setup
5. **lib/utils.ts** - Utility functions
6. **components/layout/Navbar.tsx** - Navigation bar
7. **components/layout/Footer.tsx** - Footer
8. **components/ui/Button.tsx** - Button component
9. **components/ui/Card.tsx** - Card component with glassmorphism
10. **components/ui/Container.tsx** - Container component

### Step 3: Install Dependencies

```bash
npm install
```

This will install:
- Next.js (latest)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Client
- clsx & tailwind-merge

### Step 4: Configure Supabase

1. Go to https://supabase.com and create a new project
2. Copy `.env.example` to `.env.local`
3. Update with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Run the App

```bash
npm run dev
```

Visit http://localhost:3000

## 🎨 Design System

### Colors
- **Background:** Pure black (#000000)
- **Primary:** Purple shades (500-900)
- **Accents:** Purple gradients
- **Glass Effect:** White with 5% opacity + backdrop blur

### Components
- **Button:** Animated with hover effects
- **Card:** Glassmorphism style
- **Container:** Responsive max-width wrapper

## 📚 Next Steps

1. Add authentication pages (login, signup)
2. Create protected routes
3. Build user dashboard
4. Set up Supabase database tables
5. Add real-time features

---

**All source files are provided below. Copy each into its respective location after creating the folder structure.**
