interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "lg";
}

export default function StreakBadge({ streak, size = "sm" }: StreakBadgeProps) {
  if (size === "lg") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-4xl font-bold text-orange-500">{streak}</p>
          <p className="text-sm text-gray-500">day streak</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-sm font-medium">
      <span>🔥</span>
      <span>{streak}</span>
    </div>
  );
}
