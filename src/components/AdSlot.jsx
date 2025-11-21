// src/components/AdSlot.jsx (unchanged behavior, clean style)
let API_File = import.meta.env.VITE_API_File
export default function AdSlot({ campaign, variant = "billboard" }) {
  if (!campaign) return null;
  const { href, image, title, label = "Sponsored" } = campaign;
  const rail = variant === "rail";
  const frame =
    "rounded-2xl border border-gray-200 bg-white dark:bg-slate-900/40 dark:border-slate-800 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]";
  return (
    <aside className={`${frame} ${rail ? "p-4 sticky top-24" : "p-6"}`}>
      <div className="text-xs font-semibold text-gray-500 mb-2">{label}</div>
      <a className="block group" href={href} target="_blank" rel="sponsored noopener">
        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-gray-100">
          {image && (
            <img
              src={API_File+image}
              alt={title}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <p className="mt-3 font-semibold text-gray-900 dark:text-white">{title}</p>
      </a>
    </aside>
  );
}
