import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { useUserProfile } from "../hooks/useUser.ts";
import StreakBadge from "./StreakBadge.tsx";

export default function Navbar() {
  const { user } = useUserProfile();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-brand-600 tracking-tight">
          DailyPaper
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/history"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            History
          </Link>
          {user && <StreakBadge streak={user.streak} />}
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}
