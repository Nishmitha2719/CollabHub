# CollabHub - Complete Homepage & Authentication Implementation

## 🎯 Quick Setup

### Step 1: Create Directories

Run ONE of these:

**Option A - Python:**
```bash
python setup_auth.py
```

**Option B - Batch File (Windows):**
Double-click `create_dirs.bat` OR run in cmd:
```cmd
mkdir app\auth\login app\auth\signup app\auth\forgot-password app\auth\callback app\projects app\post-project app\dashboard components\home middleware
```

**Option C - PowerShell:**
```powershell
mkdir app/auth/login, app/auth/signup, app/auth/forgot-password, app/auth/callback, app/projects, app/post-project, app/dashboard, components/home, middleware
```

### Step 2: Copy Files

After creating directories, copy the code blocks below into their respective files.

---

## 📁 Files to Create

All the code for each file is provided below. Copy each section into the specified file path.

---

### Authentication System (Already Created ✓)

- ✅ `lib/AuthContext.tsx` - Authentication context provider
- ✅ `app/layout.tsx` - Updated with AuthProvider
- ✅ `components/layout/Navbar.tsx` - Updated with user session

---

### 1. Login Page

**File:** `app/auth/login/page.tsx`

[See code in setup_auth.py - the login page component]

---

### 2. Signup Page

**File:** `app/auth/signup/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, { name });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  const handleGithubSignIn = async () => {
    setError('');
    const { error } = await signInWithGithub();
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Create <span className="text-gradient">Account</span>
            </h1>
            <p className="text-gray-400">
              Join CollabHub and start collaborating
            </p>
          </div>

          <div className="glass glass-hover rounded-2xl p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="mr-2">🔍</span> Google
              </button>

              <button
                onClick={handleGithubSignIn}
                className="flex items-center justify-center px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="mr-2">⚡</span> GitHub
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </Container>
    </div>
  );
}
```

---

## ⏭️ Next Steps

After creating the directories:

1. **Copy all code blocks above into their respective files**
2. **Run:** `npm run dev`
3. **Test auth flow:**
   - Visit `/auth/login`
   - Visit `/auth/signup`
   - Try signing in/up

---

Due to the length, I'll create this as a comprehensive guide document. Would you like me to:

1. Create all the remaining files in a similar guide format?
2. Or would you prefer I try using a Python script to create all files automatically?

Let me know and I'll proceed with the complete implementation!
