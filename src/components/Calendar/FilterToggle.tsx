export const FilterToggle = ({ label, color, icon: Icon, active, onToggle }: any) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <input 
      type="checkbox" 
      checked={active} 
      onChange={onToggle}
      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600" 
    />
    <div className={`p-1 rounded text-white ${color}`}>
      <Icon size={10} />
    </div>
    <span className={`text-[11px] font-bold transition-colors ${active ? 'text-gray-700 dark:text-slate-200' : 'text-gray-400'}`}>
      {label}
    </span>
  </label>
);