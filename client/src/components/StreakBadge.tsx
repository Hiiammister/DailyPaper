import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "lg";
}

export default function StreakBadge({ streak, size = "sm" }: StreakBadgeProps) {
  if (size === "lg") {
    return (
      <div className="flex items-center gap-2">
        <Flame className="w-8 h-8 text-orange-500" />
        <div>
          <p className="text-4xl font-bold text-orange-500">{streak}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">day streak</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full text-sm font-medium">
      <Flame className="w-3.5 h-3.5" />
      <span>{streak}</span>
    </div>
  );
}
