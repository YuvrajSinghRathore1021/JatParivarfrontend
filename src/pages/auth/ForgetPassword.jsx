// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useLang } from '../../lib/useLang'
// import { api } from '../../lib/api' 

// const copy = {
//     en: {
//         title: 'Reset Password',
//         phone: 'Phone number',
//         sendOtp: 'Send OTP',
//         otp: 'OTP',
//         newPassword: 'New password',
//         change: 'Change Password',
//         back: 'Back to login',
//     },
//     hi: {
//         title: 'पासवर्ड रीसेट',
//         phone: 'मोबाइल नंबर',
//         sendOtp: 'ओटीपी भेजें',
//         otp: 'ओटीपी',
//         newPassword: 'नया पासवर्ड',
//         change: 'पासवर्ड बदलें',
//         back: 'लॉगिन पर वापस जाएं',
//     },
// }

// export default function ForgetPassword() {
//     const [step, setStep] = useState(1)
//     const [phone, setPhone] = useState('')
//     const [otp, setOtp] = useState('')
//     const [newPassword, setNewPassword] = useState('')

//     const navigate = useNavigate()
//     const { lang, makePath } = useLang()
//     const t = copy[lang]

//     const sendOtp = async () => {
//         await api.post('/otp/start', { phone, type: "forgot" })
//         setStep(2)
//     }

//     const changePassword = async () => {
//         await api.post('/otp/verify', { phone, code: otp })
//         navigate(makePath('login'))
//     }

//     return (
//         <main className="bg-slate-50">
//             <div className="mx-auto max-w-md px-4 py-16">

//                 <div className="rounded-3xl border p-8 bg-white shadow space-y-6">
//                     <h1 className="text-2xl font-bold">{t.title}</h1>

//                     {step === 1 && (
//                         <>
//                             <label className="text-sm">{t.phone}</label>
//                             <input
//                                 className="border w-full px-3 py-2 rounded-xl"
//                                 value={phone}
//                                 onChange={(e) => setPhone(e.target.value)}
//                             />

//                             <button
//                                 onClick={sendOtp}
//                                 className="w-full bg-blue-600 text-white p-3 rounded-xl"
//                             >
//                                 {t.sendOtp}
//                             </button>
//                         </>
//                     )}

//                     {step === 2 && (
//                         <>
//                             <label className="text-sm">{t.otp}</label>
//                             <input
//                                 className="border w-full px-3 py-2 rounded-xl"
//                                 value={otp}
//                                 onChange={(e) => setOtp(e.target.value)}
//                             />

//                             <label className="text-sm mt-4">{t.newPassword}</label>
//                             <input
//                                 className="border w-full px-3 py-2 rounded-xl"
//                                 type="password"
//                                 value={newPassword}
//                                 onChange={(e) => setNewPassword(e.target.value)}
//                             />

//                             <button
//                                 onClick={changePassword}
//                                 className="w-full bg-blue-600 text-white p-3 rounded-xl mt-4"
//                             >
//                                 {t.change}
//                             </button>
//                         </>
//                     )}

//                     <button
//                         onClick={() => navigate(makePath('login'))}
//                         className="text-sm text-blue-600"
//                     >
//                         {t.back}
//                     </button>
//                 </div>
//             </div>
//         </main>
//     )
// }












import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { post } from '../../lib/api'
import { useLang } from '../../lib/useLang'

const copy = {
  en: {
    title: 'Forgot Password',
    phone: 'Phone number',
    sendOtp: 'Send OTP',
    otp: 'OTP',
    verify: 'Verify OTP',
    newPassword: 'New password',
    reset: 'Reset password',
    back: 'Back',
    login: 'Back to login',
    invalidPhone: 'Please enter a valid phone number.',
    otpRequired: 'Please enter the 6-digit OTP.',
    passwordHint: 'Password must be at least 6 characters.',
    invalidOtp: 'Invalid or expired OTP.',
    success: 'Password changed successfully.',
  },
  hi: {
    title: 'पासवर्ड भूल गए',
    phone: 'मोबाइल नंबर',
    sendOtp: 'OTP भेजें',
    otp: 'OTP',
    verify: 'OTP सत्यापित करें',
    newPassword: 'नया पासवर्ड',
    reset: 'पासवर्ड बदलें',
    back: 'वापस',
    login: 'लॉगिन पर जाएँ',
    invalidPhone: 'कृपया मान्य मोबाइल नंबर डालें।',
    otpRequired: 'कृपया 6 अंकों का OTP डालें।',
    passwordHint: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
    invalidOtp: 'OTP अमान्य या समाप्त हो चुका है।',
    success: 'पासवर्ड सफलतापूर्वक बदल दिया गया।',
  }
}

export default function ForgotPassword() {
  const { lang, makePath } = useLang()
  const t = copy[lang]
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const sendOtp = async () => {
    try {
      setError('')
      if (!/^\+?[0-9]{8,15}$/.test(phone)) {
        setError(t.invalidPhone)
        return
      }
      setLoading(true)
      await post('/otp/start', { phone, type: 'forgot' })
      setStep(2)
    } catch {
      setError(t.invalidPhone)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    try {
      setError('')
      if (!otp || otp.length !== 6) {
        setError(t.otpRequired)
        return
      }
      setLoading(true)
      await post('/otp/verify', { phone, code: otp })
      setStep(3)
    } catch {
      setError(t.invalidOtp)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    try {
      setError('')
      if (!password || password.length < 6) {
        setError(t.passwordHint)
        return
      }
      setLoading(true)
      await post('/auth/forgot/change-password', { phone, newPassword: password })
      setSuccess(t.success)
      setTimeout(() => navigate(makePath('login')), 1200)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-3xl border bg-white shadow p-8 space-y-6">

          <h1 className="text-2xl font-extrabold">{t.title}</h1>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder={t.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 text-white py-3"
              >
                {loading ? '…' : t.sendOtp}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <input
                className="w-full rounded-xl border px-4 py-3"
                placeholder={t.otp}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 rounded-xl border py-3">
                  {t.back}
                </button>
                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-blue-600 text-white py-3"
                >
                  {loading ? '…' : t.verify}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <input
                type="password"
                className="w-full rounded-xl border px-4 py-3"
                placeholder={t.newPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={resetPassword}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 text-white py-3"
              >
                {loading ? '…' : t.reset}
              </button>
            </div>
          )}

          <Link
            to={makePath('login')}
            className="block text-center text-sm text-blue-600"
          >
            {t.login}
          </Link>

        </div>
      </div>
    </main>
  )
}
