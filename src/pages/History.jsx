import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLang } from '../lib/useLang'
import { Link } from 'react-router-dom'
import { fetchHistory } from '../lib/publicApi'

const DEFAULT = {
  heroTitle: {
    en: 'History of Jat Parivar initiatives',
    hi: 'जाट परिवार पहलों का इतिहास',
  },
  intro: {
    en: 'The Jat Parivar has led educational, cultural, and social upliftment programmes for decades. The portal records key milestones.',
    hi: 'जाट परिवार ने दशकों से शिक्षा, संस्कृति और सामाजिक उत्थान के कार्यक्रम संचालित किए हैं। यह पोर्टल प्रमुख मील के पत्थर संजोता है।',
  }
}

export default function History() {
  const { lang, makePath } = useLang()
  const langKey = lang === 'hi' ? 'hi' : 'en'

  // ✅ FETCH API DATA
  const { data, isLoading } = useQuery({
    queryKey: ['public-history'],
    queryFn: fetchHistory,
  })




  if (isLoading) return <p className="p-10 text-center">Loading...</p>
  const sorted = useMemo(() => {
    const list = Array.isArray(data) ? [...data] : []
    return list.sort((a, b) => (b.year || 0) - (a.year || 0))
  }, [data])

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">

        {/* HEADER */}
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 break-words">
            {DEFAULT.heroTitle[langKey]}
          </h1>
          <p className="text-slate-600 leading-relaxed break-words">
            {DEFAULT.intro[langKey]}
          </p>
        </header>

        {/* TIMELINE GRID */}
        {/* <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <Link
              key={item.id}
              to={makePath(`history/${item.id}`)}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm 
                 p-6 flex flex-col gap-4 hover:shadow-md hover:border-blue-300 transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={API_File + item.imageUrl}
                  className="h-16 w-16 rounded-2xl object-cover"
                  loading="lazy"
                />

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {item.title?.[langKey]}
                  </h2>

                  <p className="text-sm text-blue-600">Year : {item.year}</p>

                  {item.category && (
                    <p className="text-sm text-amber-600">
                      Category : {item.category}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                {item.body?.[langKey]}
              </p>
            </Link>
          ))}
        </section> */}


        <section className="space-y-6">
          {sorted.map((item, idx) => (
            <Link
              key={item.id || idx}
              to={makePath(`history/${item.id}`)}
              className="block rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <article className="grid gap-4 p-6 md:grid-cols-6 md:items-center">
                <div className="md:col-span-1 flex flex-col items-start md:items-center gap-1">
                  {item.year ? (
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-bold shadow">
                      {item.year}
                    </span>
                  ) : (
                    <span className="text-xs uppercase text-slate-400">Year N/A</span>
                  )}
                  {item.category && (
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide text-center">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="md:col-span-5 space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900 break-words">
                    {langKey === 'hi' ? item.titleHi || item.titleEn : item.titleEn || item.titleHi}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed break-words">
                    {langKey === 'hi' ? item.bodyHi || item.bodyEn : item.bodyEn || item.bodyHi}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {item.createdAt && (
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    {item.updatedAt && (
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {langKey === 'hi' ? 'अपडेटेड' : 'Updated'} {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>

      </div>
    </main>
  )
}

// /////////view in card 
//  <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {data.map((item) => (
//             <Link
//               key={item.id}
//               to={makePath(`history/${item.id}`)}
//               className="rounded-3xl border border-slate-200 bg-white shadow-sm 
//                  p-6 flex flex-col gap-4 hover:shadow-md hover:border-blue-300 transition"
//             >
//               <div className="flex items-center gap-4">
//                 <img
//                   src={API_File + item.imageUrl}
//                   className="h-16 w-16 rounded-2xl object-cover"
//                   loading="lazy"
//                 />

//                 <div>
//                   <h2 className="text-lg font-semibold text-slate-900">
//                     {item.title?.[langKey]}
//                   </h2>

//                   <p className="text-sm text-blue-600">Year : {item.year}</p>

//                   {item.category && (
//                     <p className="text-sm text-amber-600">
//                       Category : {item.category}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
//                 {item.body?.[langKey]}
//               </p>
//             </Link>
//           ))}
//         </section>





{/* <section className="relative border-l-2 border-slate-200 pl-8 space-y-8">
          {merged.timeline.map((milestone) => (
            <article key={milestone.id} className="relative">
              {milestone.year ? (
                <span className="absolute -left-[42px] top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                  {milestone.year}
                </span>
              ) : null}
              <h2 className="text-xl font-semibold text-slate-900">{milestone.title[langKey]}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{milestone.body[langKey]}</p>
            </article>
          ))}
        </section> */}



























