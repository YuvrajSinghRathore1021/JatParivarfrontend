// import { useMemo } from 'react'
// import { useLang } from '../lib/useLang'

// const plans = {
//   founder: {
//     amount: '₹1,01,000',
//     perksEn: [
//       'Founder badge on public pages and home hero strip.',
//       'Full member services access.',
//       'Priority support from community success team.',
//     ],
//     perksHi: [
//       'होमपेज और पब्लिक कार्ड पर फाउंडर बैज।',
//       'सभी सदस्य सेवाओं का पूर्ण उपयोग।',
//       'कम्युनिटी सक्सेस टीम से प्राथमिकता सहायता।',
//     ],
//   },
//   member: {
//     amount: '₹50,000',
//     perksEn: [
//       'Featured on members carousel after admin approval.',
//       'Access to marriage, jobs, dharamshala and sanstha tools.',
//       'PhonePe auto-renew reminders and invoices.',
//     ],
//     perksHi: [
//       'एडमिन स्वीकृति के बाद मेम्बर करूसल में लिस्टिंग।',
//       'विवाह, नौकरियाँ, धर्मशाला व संस्था मॉड्यूल तक पहुँच।',
//       'PhonePe ऑटो-रीमाइंडर और इनवॉइस उपलब्ध।',
//     ],
//   },
//   sadharan: {
//     amount: '₹2,100',
//     perksEn: [
//       'Secure access to all member-only services.',
//       'Post and manage listings with admin approvals.',
//       'Upgrade anytime to Founder or Member tiers.',
//     ],
//     perksHi: [
//       'सभी सदस्य सेवाओं तक सुरक्षित पहुँच।',
//       'एडमिन अनुमोदन के साथ लिस्टिंग पोस्ट करें।',
//       'कभी भी फाउंडर या मेम्बर प्लान में अपग्रेड करें।',
//     ],
//   },
// }

// export default function Subscriptions() {
//   const { lang } = useLang()
//   const perksKey = lang === 'hi' ? 'perksHi' : 'perksEn'

//   const items = useMemo(
//     () => [
//       { id: 'founder', title: lang === 'hi' ? 'फाउंडर योजना' : 'Founder plan', ...plans.founder },
//       { id: 'member', title: lang === 'hi' ? 'मेम्बर योजना' : 'Member plan', ...plans.member },
//       { id: 'sadharan', title: lang === 'hi' ? 'साधारण सदस्यता' : 'Sadharan membership', ...plans.sadharan },
//     ],
//     [lang]
//   )

//   return (
//     <main className="bg-slate-50 pb-20">
//       <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-12">
//         <header className="text-center space-y-3">
//           <h1 className="text-3xl font-extrabold text-slate-900">
//             {lang === 'hi' ? 'सदस्यता योजनाएँ' : 'Membership plans'}
//           </h1>
//           <p className="text-slate-600 max-w-3xl mx-auto">
//             {lang === 'hi'
//               ? 'PhonePe भुगतान के साथ तुरंत सक्रियता और रसीद। अपनी भूमिका चुनें और तुरंत समुदाय से जुड़ें।'
//               : 'Instant activation and receipts with PhonePe payments. Select the tier that matches your contribution.'}
//           </p>
//         </header>

//         <div className="grid gap-6 md:grid-cols-3">
//           {items.map((plan) => (
//             <article
//               key={plan.id}
//               className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col"
//             >
//               <div className="space-y-2">
//                 <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">{plan.title}</p>
//                 <p className="text-3xl font-extrabold text-slate-900">{plan.amount}</p>
//               </div>
//               <ul className="mt-4 space-y-3 text-sm text-slate-600 flex-1">
//                 {plan[perksKey].map((perk, idx) => (
//                   <li key={idx} className="flex items-start gap-3">
//                     <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
//                     <span>{perk}</span>
//                   </li>
//                 ))}
//               </ul>
//               <button
//                 type="button"
//                 className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
//                 onClick={() => alert('PhonePe flow coming soon – integrate with backend payments API.')}
//               >
//                 {lang === 'hi' ? 'PhonePe से जारी रखें' : 'Continue with PhonePe'}
//               </button>
//             </article>
//           ))}
//         </div>
//       </div>
//     </main>
//   )
// }






import { useMemo, useState } from 'react'
import { useLang } from '../lib/useLang'

const plans = {
  founder: {
    amount: '₹1,01,000',
    perksEn: [
      'Founder badge on public pages and home hero strip.',
      'Full member services access.',
      'Priority support from community success team.',
    ],
    perksHi: [
      'होमपेज और पब्लिक कार्ड पर फाउंडर बैज।',
      'सभी सदस्य सेवाओं का पूर्ण उपयोग।',
      'कम्युनिटी सक्सेस टीम से प्राथमिकता सहायता।',
    ],
  },
  member: {
    amount: '₹50,000',
    perksEn: [
      'Featured on members carousel after admin approval.',
      'Access to marriage, jobs, dharamshala and sanstha tools.',
      'PhonePe auto-renew reminders and invoices.',
    ],
    perksHi: [
      'एडमिन स्वीकृति के बाद मेम्बर करूसल में लिस्टिंग।',
      'विवाह, नौकरियाँ, धर्मशाला व संस्था मॉड्यूल तक पहुँच।',
      'PhonePe ऑटो-रीमाइंडर और इनवॉइस उपलब्ध।',
    ],
  },
  sadharan: {
    amount: '₹2,100',
    perksEn: [
      'Secure access to all member-only services.',
      'Post and manage listings with admin approvals.',
      'Upgrade anytime to Founder or Member tiers.',
    ],
    perksHi: [
      'सभी सदस्य सेवाओं तक सुरक्षित पहुँच।',
      'एडमिन अनुमोदन के साथ लिस्टिंग पोस्ट करें।',
      'कभी भी फाउंडर या मेम्बर प्लान में अपग्रेड करें।',
    ],
  },
}

export default function Subscriptions() {
  const { lang } = useLang()
  const [loading, setLoading] = useState(false)
  const perksKey = lang === 'hi' ? 'perksHi' : 'perksEn'

  const items = useMemo(
    () => [
      { id: 'founder', title: lang === 'hi' ? 'फाउंडर योजना' : 'Founder plan', ...plans.founder },
      { id: 'member', title: lang === 'hi' ? 'मेम्बर योजना' : 'Member plan', ...plans.member },
      { id: 'sadharan', title: lang === 'hi' ? 'साधारण सदस्यता' : 'Sadharan membership', ...plans.sadharan },
    ],
    [lang]
  )

  const handlePayment = async (planId) => {
    try {
      setLoading(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/phonepe/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan: planId,
          phone: localStorage.getItem('user_phone'),
          refCode: localStorage.getItem('ref_code'),
          form: JSON.parse(localStorage.getItem('signup_form') || '{}'),
          addr: JSON.parse(localStorage.getItem('signup_address') || '{}'),
          gotra: localStorage.getItem('gotra'),
          janAadharUrl: localStorage.getItem('janaadhar_url'),
          profilePhotoUrl: localStorage.getItem('profile_photo_url'),
        }),
      })
      const data = await res.json()
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        alert(lang === 'hi' ? 'भुगतान लिंक नहीं मिला।' : 'Payment link not found.')
      }
    } catch (err) {
      console.error(err)
      alert(lang === 'hi' ? 'कृपया बाद में पुनः प्रयास करें।' : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-slate-50 pb-20">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {lang === 'hi' ? 'सदस्यता योजनाएँ' : 'Membership plans'}
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            {lang === 'hi'
              ? 'PhonePe भुगतान के साथ तुरंत सक्रियता और रसीद। अपनी भूमिका चुनें और तुरंत समुदाय से जुड़ें।'
              : 'Instant activation and receipts with PhonePe payments. Select the tier that matches your contribution.'}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((plan) => (
            <article
              key={plan.id}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col"
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">{plan.title}</p>
                <p className="text-3xl font-extrabold text-slate-900">{plan.amount}</p>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 flex-1">
                {plan[perksKey].map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={loading}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                onClick={() => handlePayment(plan.id)}
              >
                {loading
                  ? (lang === 'hi' ? 'प्रोसेस हो रहा है...' : 'Processing...')
                  : (lang === 'hi' ? 'PhonePe से जारी रखें' : 'Continue with PhonePe')}
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

