'use client'


import { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import Link from 'next/link';
import { ModeToggle } from './ModeToggle';


function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as User;

  if (pathname?.startsWith('/u/')) {
    return null;
  }

  return (
    <nav className="p-4 md:p-6 shadow-md bg-background/70 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center bg-transparent">
        <a href="/" className="text-xl font-bold mb-4 md:mb-0 text-foreground dark:text-transparent dark:bg-gradient-to-r dark:from-orange-400 dark:to-amber-600 dark:bg-clip-text hover:scale-105 transition-transform duration-300">
          Mystery Message
        </a>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Welcome, <span className="text-foreground">{user?.userName || user?.email}</span>
            </span>
            <ModeToggle />
            <Button
              onClick={() => signOut()}
              className="w-full md:w-auto bg-card hover:bg-accent text-foreground border border-border transition-all duration-300"
              variant='outline'
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button className="w-full md:w-auto text-foreground bg-card hover:bg-accent border border-border shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" variant={'outline'}>Login</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;