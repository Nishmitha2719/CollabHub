import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="glass border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="mb-4 text-2xl font-bold text-gradient">
              CollabHub
            </h3>
            <p className="mb-4 max-w-xl text-secondary leading-relaxed">
              A modern collaboration platform built with Next.js and Supabase.
              Empowering teams to work better together.
            </p>
            <p className="text-sm text-muted">
              © 2024 CollabHub. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 text-base font-semibold">Product</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link href="/projects" className="text-secondary hover:text-white transition-colors">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link href="/post-project" className="text-secondary hover:text-white transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-secondary hover:text-white transition-colors">
                  Saved Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 text-base font-semibold">Company</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link href="/about" className="text-secondary hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-secondary hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-secondary hover:text-white transition-colors">
                  Join Now
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}