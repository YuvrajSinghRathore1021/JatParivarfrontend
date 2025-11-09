export default function CardPromo({ href, image, headline, subtext, ariaLabel }) {
  return (
    <a
      href={href}
      aria-label={ariaLabel || headline}
      className="block focus:outline-none"
      role="listitem"
    >
      <article className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus-visible:ring-4 focus-visible:ring-black/10">
        <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover transition will-change-transform hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="p-4">
          <h4 className="text-gray-900 font-semibold clamp-2">{headline}</h4>
          {subtext && <p className="text-gray-600 text-sm mt-1 clamp-2">{subtext}</p>}
        </div>
      </article>
    </a>
  );
}
