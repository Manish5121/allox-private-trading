'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

const navLinks = [
  { label: 'Markets', path: '/markets' },
  { label: 'Live Orders', path: '#' },
  { label: 'Portfolio', path: '#' },
  { label: 'Earn', path: '#' },
  { label: 'API', path: '#' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/markets" className="text-xl font-bold tracking-tight text-foreground">
            Allo<span className="text-primary">X</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(link => (
              <Link
                key={link.label}
                href={link.path}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${pathname === link.path
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Button size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>
    </header>
  );
}
