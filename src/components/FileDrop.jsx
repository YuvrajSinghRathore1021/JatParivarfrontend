import React, { useRef, useState } from "react";

export default function FileDrop({
  label,
  accept,
  onFile,
  hint,
  required = false,
  value = null,
}) {
  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef(null);

  const pick = () => inputRef.current?.click();

  const onDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div className="space-y-1">
      {label && (
        <div className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-600">*</span>}
        </div>
      )}

      <div
        onClick={pick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        className={[
          "rounded-2xl border-2 border-dashed p-5 cursor-pointer transition",
          isOver
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 hover:border-blue-300 hover:bg-slate-50",
          "flex items-center gap-4",
        ].join(" ")}
      >
        <div className="h-12 w-12 rounded-xl bg-slate-100 grid place-items-center">
          <svg width="22" height="22" viewBox="0 0 24 24" className="text-slate-600">
            <path
              fill="currentColor"
              d="M19 15v4H5v-4H3v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4zm-7-1l4-4h-3V3h-2v7H8z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-900">
            {value?.name ? value.name : "Click to upload or drag & drop"}
          </div>
          {hint && <div className="text-sm text-slate-500">{hint}</div>}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Browse
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => onFile(e.target.files?.[0] || null)}
        className="sr-only"
      />
    </div>
  );
}
