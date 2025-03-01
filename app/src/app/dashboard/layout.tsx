'use client';
import { cn } from '@/lib/utils';
import {
  Home,
  Trophy,
  BarChart3,
  Store,
  Beaker,
  Database,
  Coins,
  Gift,
  Flag
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Auctions', href: '/dashboard/auctions', icon: Trophy },
  { name: 'Charts', href: '/dashboard/charts', icon: BarChart3 },
  { name: 'Store', href: '/dashboard/store', icon: Store },
  { name: 'AI Lab', href: '/dashboard/ai-lab', icon: Beaker, badge: 'beta' },
  { name: 'Data Market', href: '/dashboard/data-market', icon: Database },
  { name: 'Tokenization Hub', href: '/dashboard/tokenization', icon: Coins, badge: 'soon' },
  { name: 'Contribute & Earn', href: '/dashboard/contribute', icon: Gift, badge: 'soon' }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <Flag className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-wider">NEVERHOLD</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
              {item.badge && (
                <span className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-xs",
                  item.badge === 'beta' ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 p-4 border-t">
          <div className="flex items-center gap-2 mt-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-muted-foreground">Connected</span>
            <span className="ml-auto text-xs text-muted-foreground">20.00 $ASRR</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 