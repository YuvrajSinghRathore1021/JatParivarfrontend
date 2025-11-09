import React, { useEffect, useMemo, useRef, useState } from "react";

function pad(n) { return String(n).padStart(2, "0"); }
function ymd(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseYmd(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || "");
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

const MONTHS = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  hi: ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"],
};
const DOW = {
  en: ["Su","Mo","Tu","We","Th","Fr","Sa"],
  hi: ["र","सो","मं","बु","गु","शु","श"],
};

export default function DateField({
  label = "Date of birth",
  placeholder = "YYYY-MM-DD",
  lang = "en",
  value,
  onChange,
  minYear = 1920,
  maxYear = new Date().getFullYear(),
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0,0,0,0);
    return t;
  }, []);

  // selected date from value
  const selected = useMemo(() => parseYmd(value) || null, [value]);

  // which month to show in the popup
  const [view, setView] = useState(() => selected ?? today);

  useEffect(() => {
    if (selected) setView(selected);
  }, [selected]);

  // click outside to close
  useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const monthStart = useMemo(() => new Date(view.getFullYear(), view.getMonth(), 1), [view]);

  // Build a 6x7 grid (weeks x days)
  const grid = useMemo(() => {
    const start = new Date(monthStart);
    start.setDate(start.getDate() - start.getDay()); // back to Sunday

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [monthStart]);

  const isSameDay = (a,b) =>
    a && b && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const isFuture = (d) => d.getTime() > today.getTime();
  const inThisMonth = (d) => d.getMonth() === monthStart.getMonth();

  const prevMonth = () => setView(v => new Date(v.getFullYear(), v.getMonth()-1, 1));
  const nextMonth = () => setView(v => new Date(v.getFullYear(), v.getMonth()+1, 1));

  // Jump via dropdowns
  const years = useMemo(() => {
    const arr = [];
    for (let y = maxYear; y >= minYear; y--) arr.push(y);
    return arr;
  }, [minYear, maxYear]);

  const setMonth = (m) => setView(v => new Date(v.getFullYear(), Number(m), 1));
  const setYear  = (y) => setView(v => new Date(Number(y), v.getMonth(), 1));

  const onPick = (d) => {
    if (isFuture(d)) return;
    onChange?.(ymd(d));
    setOpen(false);
  };

  return (
    <div className="space-y-1" ref={rootRef}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={[
          "w-full text-left rounded-xl border border-slate-200 px-4 py-3",
          "bg-white focus:outline-none focus:ring-2 focus:ring-blue-500",
          "flex items-center justify-between"
        ].join(" ")}
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-500">
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute z-50 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white shadow-lg p-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={prevMonth}
              className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
              aria-label="Previous month"
            >
              ‹
            </button>

            <div className="flex items-center gap-2">
              <select
                value={view.getMonth()}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
              >
                {MONTHS[lang].map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={view.getFullYear()}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          {/* Weekdays */}
          <div className="mt-2 grid grid-cols-7 text-center text-xs font-semibold text-slate-500">
            {DOW[lang].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="mt-1 grid grid-cols-7 gap-1 text-sm">
            {grid.map((d, i) => {
              const isOut = !inThisMonth(d);
              const future = isFuture(d);
              const sel = selected && isSameDay(d, selected);
              const isToday = isSameDay(d, today);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPick(d)}
                  disabled={future}
                  className={[
                    "h-9 rounded-xl transition",
                    sel
                      ? "bg-blue-600 text-white"
                      : isOut
                        ? "text-slate-400 hover:bg-slate-50"
                        : "text-slate-900 hover:bg-slate-100",
                    future ? "opacity-40 cursor-not-allowed" : "",
                    isToday && !sel ? "ring-1 ring-blue-500/50" : ""
                  ].join(" ")}
                  aria-current={sel ? "date" : undefined}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => { setView(today); }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-500"
            >
              {lang === "hi" ? "आज" : "Today"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              {lang === "hi" ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
