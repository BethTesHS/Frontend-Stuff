import { Icon } from "lucide-react";

export const FilterToggle = ({ label, color, icon: Icon }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
    <div className={`p-1 rounded text-white ${color}`}>
      <Icon size={10} />
    </div>
    <span className="text-[11px] font-bold text-gray-700 group-hover:text-emerald-600 transition-colors">{label}</span>
  </label>
);