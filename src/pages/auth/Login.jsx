// import { useState } from 'react'
// import { useQueryClient } from '@tanstack/react-query'
// import { login } from '../../lib/auth'
// import { useNavigate, Link } from 'react-router-dom'
// import { useLang } from '../../lib/useLang'

// const copy = {
//   en: {
//     title: 'Member login',
//     phone: 'Phone number',
//     password: 'Password',
//     submit: 'Login',
//     error: 'Login failed. Please check your credentials.',
//     noAccount: "Don't have an account?",
//     register: 'Register',
//   },
//   hi: {
//     title: 'सदस्य लॉगिन',
//     phone: 'मोबाइल नंबर',
//     password: 'पासवर्ड',
//     submit: 'लॉगिन',
//     error: 'लॉगिन विफल। कृपया विवरण जांचें।',
//     noAccount: 'खाता नहीं है?',
//     register: 'रजिस्टर करें',
//   },
// }

// export default function Login() {
//   const [phone, setPhone] = useState('')
//    const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('')
//   const navigate = useNavigate()
//   const { lang, makePath } = useLang()
//   const queryClient = useQueryClient()
//   const t = copy[lang]

  // const submit = async (event) => {
  //   event.preventDefault()
  //   setError('')
  //   try {
  //     const res = await login(phone, password)
  //     await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
  //     if (res.kind === 'admin') {
  //       navigate('/admin/home')
  //     } else {
  //       navigate(makePath('dashboard'))
  //     }
  //   } catch (err) {
  //     console.error(err)
  //     setError(t.error)
  //   }
  // }

//   return (
//     <main className="bg-slate-50">
//       <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16">
//         <form
//           onSubmit={submit}
//           className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 space-y-5"
//         >
//           <h1 className="text-2xl font-extrabold text-slate-900">{t.title}</h1>

//           {error && (
//             <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//               {error}
//             </div>
//           )}

//           <div className="space-y-1">
//             <label className="text-sm font-medium text-slate-700" htmlFor="phone">
//               {t.phone}
//             </label>
//             <input
//               id="phone"
//               type="tel"
//               inputMode="tel"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <div className="space-y-1 relative w-full">
//             <label className="text-sm font-medium text-slate-700" htmlFor="password">
//               {t.password}
//             </label>

//             <input
//               id="password"
//               type={showPassword ? 'text' : 'password'}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//             <img
//               width="22"
//               height="22"
//               onClick={() => setShowPassword(!showPassword)}
//               src={
//                 showPassword
//                   ? "https://img.icons8.com/fluency-systems-regular/48/hide.png"
//                   : "https://img.icons8.com/fluency-systems-regular/48/visible.png"
//               }
//               alt="toggle visibility"
//               className="absolute right-3 bottom-3 cursor-pointer"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
//           >
//             {t.submit}
//           </button>

//           {/* Register prompt */}
//           <div className="pt-4 border-t border-slate-200 text-center text-sm text-slate-600">
//             {t.noAccount}{' '}
//             <Link
//               to={makePath('register')}
//               className="font-semibold text-blue-600 hover:text-blue-500"
//             >
//               {t.register}
//             </Link>
//           </div>
//         </form>
//       </div>
//     </main>
//   )
// }







import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { useLang } from '../../lib/useLang'
import { post } from '../../lib/api'   // for OTP APIs
import { login } from '../../lib/auth' // for password login (kept)

const copy = {
  en: {
    title: 'Member login',
    phone: 'Phone number',
    password: 'Password',
    sendOtp: 'Send OTP',
    otp: 'Enter OTP',
    verify: 'Verify OTP',
    login: 'Login',
    error: 'Login failed. Please check details.',
    noAccount: "Don't have an account?",
    register: 'Register',
  },
  hi: {
    title: 'सदस्य लॉगिन',
    phone: 'मोबाइल नंबर',
    password: 'पासवर्ड',
    sendOtp: 'OTP भेजें',
    otp: 'OTP दर्ज करें',
    verify: 'OTP वेरिफाई',
    login: 'लॉगिन',
    error: 'लॉगिन विफल। कृपया विवरण जांचें।',
    noAccount: 'खाता नहीं है?',
    register: 'रजिस्टर करें',
  },
}

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1 = phone, 2 = otp
  const [OtpVer, setOtpVer] = useState(false) 
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { lang, makePath } = useLang()
  const t = copy[lang]

  // -----------------------
  // Step 1 → Send OTP
  // -----------------------
  const sendOtp = async () => {
    try {
      setError('')
      if (!/^\+?[0-9]{8,15}$/.test(phone)) {
        setError('Invalid phone.')
        return
      }
      setLoading(true)
      await post('/otp/start', { phone })
      setStep(2)
    } catch (e) {
      console.error(e)
      setError('Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  // -----------------------
  // Step 2 → Verify OTP
  // -----------------------
  const verifyOtp = async () => {
    try {
      setError('')
      if (!otp || otp.length !== 6) {
        setError('Enter 6 digit OTP.')
        return
      }
      setLoading(true)

      const res = await post('/otp/verify', { phone, code: otp.trim() })

      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })

      if (res.kind === 'admin') navigate('/admin/home')
      else navigate(makePath('dashboard'))

    } catch (e) {
      console.error(e)
      setError('Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  // -----------------------
  // OLD password login kept as fallback
  // -----------------------
   const submit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const res = await login(phone, password)
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      if (res.kind === 'admin') {
        navigate('/admin/home')
      } else {
        navigate(makePath('dashboard'))
      }
    } catch (err) {
      console.error(err)
      setError(t.error)
    }
  }


  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16">

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 space-y-5">
          <h1 className="text-2xl font-extrabold text-slate-900">{t.title}</h1>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* STEP 1 - PHONE */}
          {step === 1 && (
            <>
              <label className="text-sm font-medium text-slate-700">{t.phone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />


              <form onSubmit={submit} className="space-y-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />

                <button className="w-full bg-blue-600 text-white rounded-xl px-4 py-3">
                  {t.login}
                </button>

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 text-white px-4 py-3 mt-3"
                >
                  {loading ? '...' : t.sendOtp}
                </button>
                <div className="pt-4 border-t border-slate-200 text-center text-sm text-slate-600">
                  <span className="font-semibold">Or Login with Password</span>
                </div>
              </form>
            </>
          )}

          {/* STEP 2 - OTP */}
          {step === 2 && (
            <>
              <label className="text-sm font-medium text-slate-700">{t.otp}</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 text-white px-4 py-3 mt-3"
              >
                {loading ? '...' : t.verify}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full rounded-xl border px-4 py-3 mt-2"
              >
                Back
              </button>
            </>
          )}

          {/* Register link */}
          <div className="pt-4 border-t border-slate-200 text-center text-sm text-slate-600">
            {t.noAccount}{' '}
            <Link
              to={makePath('register')}
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              {t.register}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

