// frontend/src/pages/dashboard/Overview.jsx
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useLang } from '../../lib/useLang'
import {
  fetchMyInstitutions,
  fetchMyJobs,
  fetchMyMatrimonyProfile,
  fetchMyProfile,
} from '../../lib/dashboardApi'

const copy = {
  en: {
    heroBody:
      'Track your community activity, finish pending steps, and jump into the tools you need without hunting through menus.',
    heroReferral: 'Share your referral code to invite family and friends.',
    quickHeading: 'Suggested next actions',
    quickEmpty: 'Everything looks up to date. Explore any section from the cards below.',
    steps: {
      profile:
        'Add a display photo and contact details so members can recognise and reach you effortlessly.',
      matrimonyCreate: 'Publish your matrimony profile so other verified members can discover you.',
      matrimonyManage: 'Review the interests you have received and keep your matrimony information updated.',
      jobsCreate: 'Post a new opening and reach members who are actively looking for opportunities.',
      jobsManage: 'Check the status of your job listings and respond to applicants promptly.',
      dharamshalaye: 'List Dharamshalas your family manages so travellers can find the right stay.',
      sanstha: 'Keep institution details accurate for supporters and volunteers.',
    },
    statsHeading: 'Your activity snapshot',
    stats: {
      matrimony: 'Matrimony profile',
      jobs: 'Job posts',
      dharamshalaye: 'Dharamshala listings',
      sansthaye: 'Sanstha listings',
    },
    resourcesHeading: 'Helpful shortcuts',
    resources: [
      {
        title: 'Browse verified matrimony matches',
        body: 'Filter profiles, express interest, and stay updated on responses.',
        to: 'dashboard/matrimony',
      },
      {
        title: 'See all community job openings',
        body: 'Discover new opportunities shared by trusted members and organisations.',
        to: 'dashboard/jobs',
      },
      {
        title: 'View approved Dharamshalas and institutions',
        body: 'Check published listings, amenities, and contact details in one place.',
        to: 'dashboard/sansthaye',
      },
    ],
  },
  hi: {
    heroBody:
      'अपने समुदाय की गतिविधि को एक ही स्थान से देखें, लंबित चरण पूरे करें और बिना खोजे ज़रूरी सेवाओं तक पहुँचें।',
    heroReferral: 'परिवार और मित्रों को आमंत्रित करने के लिए अपना रेफ़रल कोड साझा करें।',
    quickHeading: 'सुझावित अगले कदम',
    quickEmpty: 'सब कुछ अद्यतित है। नीचे दिए गए किसी भी कार्ड से संबंधित अनुभाग देखें।',
    steps: {
      profile: 'अपना फोटो और संपर्क विवरण जोड़ें ताकि सदस्य आपको आसानी से पहचान सकें।',
      matrimonyCreate: 'अपनी विवाह प्रोफ़ाइल प्रकाशित करें ताकि सत्यापित सदस्य आपको देख सकें।',
      matrimonyManage: 'प्राप्त रुचियों की समीक्षा करें और विवाह प्रोफ़ाइल अपडेट रखें।',
      jobsCreate: 'नई नौकरी पोस्ट करें और अवसर ढूँढ रहे सदस्यों तक पहुँचें।',
      jobsManage: 'अपनी नौकरी सूची की स्थिति देखें और आवेदकों को शीघ्र जवाब दें।',
      dharamshalaye: 'परिवार द्वारा संचालित धर्मशालाओं की सूची जोड़ें ताकि यात्री सही स्थान खोज सकें।',
      sanstha: 'संस्था से जुड़े विवरण सही रखें ताकि समर्थक और स्वयंसेवक संपर्क कर सकें।',
    },
    statsHeading: 'आपकी गतिविधि का सारांश',
    stats: {
      matrimony: 'विवाह प्रोफ़ाइल',
      jobs: 'नौकरी पोस्ट',
      dharamshalaye: 'धर्मशाला सूचियाँ',
      sansthaye: 'संस्था सूचियाँ',
    },
    resourcesHeading: 'उपयोगी शॉर्टकट',
    resources: [
      {
        title: 'सत्यापित विवाह प्रोफ़ाइल देखें',
        body: 'प्रोफ़ाइल फ़िल्टर करें, रुचि दर्ज करें और उत्तरों पर नज़र रखें।',
        to: 'dashboard/matrimony',
      },
      {
        title: 'समुदाय की नौकरी पोस्टिंग देखें',
        body: 'विश्वसनीय सदस्यों व संस्थाओं द्वारा साझा किए गए नए अवसर जानें।',
        to: 'dashboard/jobs',
      },
      {
        title: 'अनुमोदित धर्मशाला और संस्था सूची देखें',
        body: 'सभी प्रकाशित सूचियाँ, सुविधाएँ और संपर्क विवरण एक ही स्थान पर देखें।',
        to: 'dashboard/sansthaye',
      },
    ],
  },
}

export default function Overview() {
  const { lang, makePath } = useLang()
  const t = copy[lang]

  const { data: profileData } = useQuery({ queryKey: ['profile', 'me'], queryFn: fetchMyProfile, staleTime: 60_000 })
  const { data: matrimonyProfile } = useQuery({ queryKey: ['dashboard', 'matrimony', 'me'], queryFn: fetchMyMatrimonyProfile })
  const { data: jobs } = useQuery({ queryKey: ['dashboard', 'jobs', 'mine'], queryFn: fetchMyJobs })
  const { data: institutions } = useQuery({
    queryKey: ['dashboard', 'institutions', 'mine'],
    queryFn: fetchMyInstitutions,
  })

  const user = profileData?.user
  const memberName = user?.displayName || user?.name || user?.phone || (lang === 'hi' ? 'सदस्य' : 'Member')

  const myJobs = jobs || []
  const myInstitutions = institutions || []
  const dharamshalas = myInstitutions.filter((item) => item.kind === 'dharamshala')
  const sansthaye = myInstitutions.filter((item) => item.kind === 'sanstha')

  const profileNeedsPhoto = !user?.avatarUrl
  const profileNeedsContact = !user?.contactEmail && !user?.alternatePhone

  const quickSteps = useMemo(() => {
    const steps = []
    if (profileNeedsPhoto || profileNeedsContact) {
      steps.push({
        key: 'profile',
        title: lang === 'hi' ? 'प्रोफ़ाइल अपडेट करें' : 'Update your profile',
        body: t.steps.profile,
        to: 'dashboard/profile',
      })
    }

    if (!matrimonyProfile) {
      steps.push({
        key: 'matrimony-create',
        title: lang === 'hi' ? 'विवाह प्रोफ़ाइल बनाएँ' : 'Create matrimony profile',
        body: t.steps.matrimonyCreate,
        to: 'dashboard/matrimony/profile',
      })
    } else {
      steps.push({
        key: 'matrimony-manage',
        title: lang === 'hi' ? 'विवाह प्रोफ़ाइल प्रबंधित करें' : 'Manage matrimony profile',
        body: t.steps.matrimonyManage,
        to: 'dashboard/matrimony',
      })
    }

    if (myJobs.length === 0) {
      steps.push({
        key: 'job-create',
        title: lang === 'hi' ? 'पहली नौकरी पोस्ट करें' : 'Post your first job',
        body: t.steps.jobsCreate,
        to: 'dashboard/jobs/create',
      })
    } else {
      steps.push({
        key: 'job-manage',
        title: lang === 'hi' ? 'नौकरी पोस्ट देखें' : 'Review job posts',
        body: t.steps.jobsManage,
        to: 'dashboard/jobs',
      })
    }

    if (dharamshalas.length === 0) {
      steps.push({
        key: 'dharamshalaye-create',
        title: lang === 'hi' ? 'धर्मशाला सूची जोड़ें' : 'Add a Dharamshala listing',
        body: t.steps.dharamshalaye,
        to: 'dashboard/dharamshalaye/create',
      })
    }

    if (sansthaye.length === 0) {
      steps.push({
        key: 'sanstha-create',
        title: lang === 'hi' ? 'संस्था सूची जोड़ें' : 'Add an institution listing',
        body: t.steps.sanstha,
        to: 'dashboard/sansthaye/create',
      })
    }

    return steps
  }, [
    profileNeedsPhoto,
    profileNeedsContact,
    lang,
    t.steps.profile,
    t.steps.matrimonyCreate,
    t.steps.matrimonyManage,
    t.steps.jobsCreate,
    t.steps.jobsManage,
    t.steps.dharamshalaye,
    t.steps.sanstha,
    matrimonyProfile,
    myJobs.length,
    dharamshalas.length,
    sansthaye.length,
  ])

  const stats = [
    { key: 'matrimony', label: t.stats.matrimony, value: matrimonyProfile ? (lang === 'hi' ? 'सक्रिय' : 'Active') : '—' },
    { key: 'jobs', label: t.stats.jobs, value: myJobs.length },
    { key: 'dharamshalaye', label: t.stats.dharamshalaye, value: dharamshalas.length },
    { key: 'sansthaye', label: t.stats.sansthaye, value: sansthaye.length },
  ]

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-r from-blue-50 via-white to-blue-50 p-8 shadow-sm md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-extrabold text-slate-900 break-all line-clamp-1">
              {lang === 'hi' ? `${memberName} ` : `${memberName}`}
            </h1>
            <p className="text-sm text-slate-600">{t.heroBody}</p>
            {user?.referralCode && (
              <div className="inline-flex items-center gap-3 rounded-2xl border border-blue-200 bg-white/80 px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm">
                <span>{lang === 'hi' ? 'रेफ़रल कोड' : 'Referral code'}:</span>
                <code className="rounded-xl bg-blue-50 px-3 py-1 text-base tracking-widest">{user.referralCode}</code>
              </div>
            )}
            <p className="text-xs text-slate-500">{t.heroReferral}</p>
          </div>

          <div className="grid w-full max-w-sm gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
            {stats.map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-500">{item.label}</span>
                <span className="text-base font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{t.quickHeading}</h2>
        </header>

        {quickSteps.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-600 shadow-sm">
            {t.quickEmpty}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickSteps.map((step) => (
              <Link
                key={step.key}
                to={makePath(step.to)}
                className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.body}</p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600">
                  {lang === 'hi' ? 'जाएँ' : 'Open'}
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0z" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">{t.resourcesHeading}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {t.resources.map((item) => (
            <Link
              key={item.to}
              to={makePath(item.to)}
              className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.body}</p>
              </div>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600">
                {lang === 'hi' ? 'जाएँ' : 'Open'}
                <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0z" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
