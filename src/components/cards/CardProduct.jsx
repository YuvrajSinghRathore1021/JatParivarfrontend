let API_File = import.meta.env.VITE_API_File
export default function CardProduct({
  href,
  image,
  title,
  price,
  badge,
  swatches = [],
  ariaLabel,
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel || title}
      className="block focus:outline-none"
      role="listitem"
    >
      <article className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus-visible:ring-4 focus-visible:ring-black/10">
        <div className="aspect-square  bg-white grid place-items-center overflow-hidden">
          <img
            src={API_File + image}
            alt={title}
            className="w-[85%] h-[85%] object-contain transition will-change-transform  hover:scale-[1.02] "
            loading="lazy"
            decoding="async"
          />

        </div>


        <div className="p-2.5">
          {badge && (
            <span className="inline-block text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 mb-2">
              {badge}
            </span>
          )}
          <h4 className="text-gray-900 font-medium clamp-2">{title}</h4>
          {price && <p className="text-gray-600 text-sm mt-1 clamp-2">{price}</p>}
          {!!swatches.length && (
            <ul className="mt-3 flex items-center gap-2" aria-label="Available colours">
              {swatches.map((s, i) => (
                <li key={i}>
                  <img
                    src={s.image}
                    alt={s.alt}
                    className="w-[85%] h-[85%] object-contain transition will-change-transform  hover:scale-[1.02] "
                     loading="lazy"
                    decoding="async"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </a>
  );
}
