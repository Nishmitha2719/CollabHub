import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="glass border-t border-[var(--border)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-gradient mb-4">
              CollabHub
            </h3>
            <p className="text-secondary mb-4">
              A modern collaboration platform built with Next.js and Supabase.
              Empowering teams to work better together.
            </p>
            <p className="text-sm text-muted">
              © 2024 CollabHub. All rights reserved.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
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
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
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