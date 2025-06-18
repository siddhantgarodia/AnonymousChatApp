"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { MessageCircle, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user as User;

  return (
    <nav className="bg-gradient-to-r from-blue-600/90 to-sky-600/80 dark:from-blue-900/90 dark:to-sky-900/80 py-4 shadow-sm border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Left: Logo + Dashboard */}
        <div className="flex items-center gap-4">
          {" "}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-6 h-6 text-primary" />
            <span className="hidden sm:inline text-xl font-bold tracking-tight text-foreground">
              <span className="font-extrabold text-foreground">Honest</span>
              <span className="font-extrabold text-primary">Feedback</span>
            </span>
            <span className="sm:hidden text-lg font-bold text-foreground">
              HF
            </span>
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className="text-sm sm:text-base font-medium hover:text-primary transition-colors px-2 py-1 rounded-md"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right: Theme, Auth */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href={`/u/${user?.username || ""}`}
                className="hidden md:flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <UserIcon size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {user?.username || user?.email?.split("@")[0] || "User"}
                </span>
              </Link>{" "}
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                variant="secondary"
                size="sm"
                className="rounded-full bg-white/90 dark:bg-slate-800 text-primary hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/sign-up"
                className="px-4 py-1.5 text-sm font-medium rounded-full border border-white/30 dark:border-slate-600 text-white hover:bg-white/10 dark:hover:bg-slate-700/50 transition-all"
              >
                Sign Up
              </Link>
              <Link
                href="/sign-in"
                className="px-4 py-1.5 text-sm font-medium rounded-full bg-white/90 dark:bg-slate-800 text-primary hover:bg-white dark:hover:bg-slate-700 transition-all"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
