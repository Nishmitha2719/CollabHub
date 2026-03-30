# 🚀 CollabHub - Complete Installation Guide

## ⚠️ PowerShell Requirement Issue

This system requires PowerShell 6+ (pwsh.exe) but it's not installed. 
You have **3 options** to complete the setup:

---

## Option 1: Quick Setup with Python (RECOMMENDED)

If you have Python installed:

```bash
python setup_files.py
npm install
```

Then:
1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials
3. Run `npm run dev`

---

## Option 2: Manual Setup (5 minutes)

### Step 1: Create Folders

Open Command Prompt and run:

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

Open `ALL_SOURCE_FILES.txt` and copy each code block into its respective file location as indicated in the comments.

For example:
- Copy the `app/globals.css` section → Create file at `e:\CollabHub\app\globals.css`
- Copy the `app/layout.tsx` section → Create file at `e:\CollabHub\app\layout.tsx`
- And so on for all files...

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment

```bash
copy .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Option 3: Use INSTALL.bat

Double-click `INSTALL.bat` to:
- Create the folder structure
- Install npm dependencies
- Create .env.local template

Then manually copy the files from `ALL_SOURCE_FILES.txt` as described in Option 2.

---

## 📁 Complete File Structure

After setup, your project should look like this:

```
CollabHub/
├── app/
│   ├── globals.css           # Global styles with Tailwind
│   ├── layout.tsx            # Root layout with Navbar/Footer
│   └── page.tsx              # Home page
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx        # Navigation bar
│   │   └── Footer.tsx        # Footer component
│   └── ui/
│       ├── Button.tsx        # Animated button component
│       ├── Card.tsx          # Glassmorphism card
│       └── Container.tsx     # Responsive container
├── lib/
│   ├── supabaseClient.ts     # Supabase configuration
│   └── utils.ts              # Utility functions (cn helper)
├── hooks/
│   └── useSupabase.ts        # Supabase auth hook
├── types/
│   └── index.ts              # TypeScript types
├── public/                    # Static assets
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind configuration
├── next.config.mjs           # Next.js configuration
├── postcss.config.js         # PostCSS configuration
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── .env.example              # Environment template
└── README.md                 # Project documentation
```

---

## 🔧 Supabase Setup

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → API
4. Copy your:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. Add them to `.env.local`

---

## 🎨 Features Included

✅ **Next.js 14** with App Router
✅ **TypeScript** for type safety
✅ **Tailwind CSS** with custom purple theme
✅ **Framer Motion** animations
✅ **Supabase** integration (Auth, DB, Storage)
✅ **Dark theme** with glassmorphism UI
✅ **Responsive** navbar and footer
✅ **Reusable components** (Button, Card, Container)
✅ **Custom hooks** for Supabase auth
✅ **Utility functions** (clsx + tailwind-merge)

---

## 📦 Installed Packages

**Dependencies:**
- `next` (^14.1.0) - React framework
- `react` & `react-dom` (^18.2.0)
- `@supabase/supabase-js` (^2.39.8) - Supabase client
- `framer-motion` (^11.0.5) - Animation library
- `clsx` (^2.1.0) - Class name utility
- `tailwind-merge` (^2.2.1) - Tailwind class merger

**Dev Dependencies:**
- `typescript` (^5)
- `@types/node`, `@types/react`, `@types/react-dom`
- `tailwindcss` (^3.3.0)
- `autoprefixer`, `postcss`
- `eslint`, `eslint-config-next`

---

## 🚀 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🎯 Next Steps

After getting the app running:

1. **Customize the theme** in `tailwind.config.ts`
2. **Add authentication pages** (login, signup)
3. **Create protected routes** with middleware
4. **Set up Supabase tables** for your data
5. **Add more UI components** as needed
6. **Implement real-time features** with Supabase subscriptions

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Supabase connection issues
- Check `.env.local` file exists
- Verify Supabase credentials are correct
- Ensure no trailing spaces in environment variables

---

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Framer Motion:** https://www.framer.com/motion/
- **Supabase Docs:** https://supabase.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

---

## 💡 Tips

- Use the `cn()` utility from `lib/utils.ts` to merge Tailwind classes
- All UI components support className prop for customization
- Framer Motion animations are already configured in components
- The glassmorphism effect is available via `.glass` CSS class
- Use the `useSupabase` hook for auth state management

---

**Need Help?** Check the README.md and SETUP_GUIDE.md files for more details.

Happy coding! 🎉
