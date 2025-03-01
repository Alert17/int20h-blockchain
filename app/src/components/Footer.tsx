'use client';
import Link from 'next/link';
import { Gavel, Github, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-wider">
                NEVERHOLD
              </span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              The premier decentralized auction platform for crypto assets with
              transparent blockchain fees.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-medium">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auctions"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Browse Auctions
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Create Auction
                </Link>
              </li>
              <li>
                <Link
                  href="/my-bids"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  My Bids
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-medium">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 font-medium">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t pt-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} NEVERHOLD. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
