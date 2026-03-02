import { Check } from "lucide-react";

interface FilterToggleProps {
  label: string;
  color: string; // The dot color (e.g., bg-blue-500)
  active: boolean;
  onToggle: () => void;
  accentColor: string; // The theme color (e.g., emerald-600)
}

export const FilterToggle = ({
  label,
  color,
  active,
  onToggle,
  accentColor,
}: FilterToggleProps) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-3 w-full group py-1"
  >
    {/* Checkbox on the Left */}
    <div
      className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0
      ${
        active
          ? `bg-${accentColor} border-${accentColor}`
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      {active && <Check size={12} className="text-white" strokeWidth={3} />}
    </div>

    {/* Color Dot and Label on the Right */}
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded flex items-center justify-center ${color}`}
      >
        {/* If you prefer the small icon inside the colored square like your screenshot */}
        <div className="w-2 h-2 bg-white/20 rounded-full" />
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
  </button>
);
