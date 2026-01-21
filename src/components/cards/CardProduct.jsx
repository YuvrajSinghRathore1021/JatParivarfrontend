let API_File = import.meta.env.VITE_API_File
const fallbackImg = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='#E2E8F0'/><circle cx='50' cy='44' r='18' fill='#94A3B8'/><path d='M20 92c10-18 27-28 30-28s20 10 30 28H20z' fill='#94A3B8'/></svg>`
)}`
const resolveSrc = (image) => {
  if (!image) return fallbackImg
  if (typeof image !== 'string') return fallbackImg
  if (image.startsWith('data:') || image.startsWith('blob:')) return image
  if (image.startsWith('http://') || image.startsWith('https://')) return image
  return `${API_File || ''}${image}`
}
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
      <article className="bg-white rounded-2xl border max-h-100 max-w-80 border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus-visible:ring-4 focus-visible:ring-black/10">
        <div className="aspect-square  bg-white grid place-items-center overflow-hidden ">
          <img
            src={resolveSrc(image)}
            alt="image"
            className="w-[85%] h-[80%] object-contain transition will-change-transform  hover:scale-[1.02] "
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = fallbackImg
            }}
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
                    alt="image"
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
