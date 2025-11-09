import React from "react";

export default function SelectField({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  disabled = false,
  required = false,
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
