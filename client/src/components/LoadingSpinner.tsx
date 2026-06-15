export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div
      className={`${sizeClass} animate-spin rounded-full border-2 border-gray-200 border-t-brand-500`}
    />
  );
}
