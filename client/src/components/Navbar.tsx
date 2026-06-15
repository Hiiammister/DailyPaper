import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Sun, Moon, History, BookOpen, GraduationCap } from "lucide-react";
import { useUserProfile } from "../hooks/useUser.ts";
import { useTheme } from "../hooks/useTheme.ts";
import StreakBadge from "./StreakBadge.tsx";

export default function Navbar() {
  const { user } = useUserProfile();
  const { dark, toggle } = useTheme();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-600 tracking-tight">
          <BookOpen className="w-5 h-5" />
          DailyPaper
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/history"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <History className="w-4 h-4" />
            History
          </Link>
          <Link
            to="/topics"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Topics
          </Link>
          <Link
            to="/resources"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Guide
          </Link>
          {user && <div className="px-2"><StreakBadge streak={user.streak} /></div>}
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}
