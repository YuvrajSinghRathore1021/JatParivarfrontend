import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../lib/useLang'
// import { api } from '../../lib/api' 

const copy = {
    en: {
        title: 'Reset Password',
        phone: 'Phone number',
        sendOtp: 'Send OTP',
        otp: 'OTP',
        newPassword: 'New password',
        change: 'Change Password',
        back: 'Back to login',
    },
    hi: {
        title: 'पासवर्ड रीसेट',
        phone: 'मोबाइल नंबर',
        sendOtp: 'ओटीपी भेजें',
        otp: 'ओटीपी',
        newPassword: 'नया पासवर्ड',
        change: 'पासवर्ड बदलें',
        back: 'लॉगिन पर वापस जाएं',
    },
}

export default function ForgetPassword() {
    const [step, setStep] = useState(1)
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const navigate = useNavigate()
    const { lang, makePath } = useLang()
    const t = copy[lang]

    const sendOtp = async () => {
        // await api.post('/auth/forgot/send-otp', { phone })
        setStep(2)
    }

    const changePassword = async () => {
        // await api.post('/auth/forgot/verify', { phone, otp, newPassword })
        navigate(makePath('login'))
    }

    return (
        <main className="bg-slate-50">
            <div className="mx-auto max-w-md px-4 py-16">

                <div className="rounded-3xl border p-8 bg-white shadow space-y-6">
                    <h1 className="text-2xl font-bold">{t.title}</h1>

                    {step === 1 && (
                        <>
                            <label className="text-sm">{t.phone}</label>
                            <input
                                className="border w-full px-3 py-2 rounded-xl"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />

                            <button
                                onClick={sendOtp}
                                className="w-full bg-blue-600 text-white p-3 rounded-xl"
                            >
                                {t.sendOtp}
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <label className="text-sm">{t.otp}</label>
                            <input
                                className="border w-full px-3 py-2 rounded-xl"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />

                            <label className="text-sm mt-4">{t.newPassword}</label>
                            <input
                                className="border w-full px-3 py-2 rounded-xl"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />

                            <button
                                onClick={changePassword}
                                className="w-full bg-blue-600 text-white p-3 rounded-xl mt-4"
                            >
                                {t.change}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => navigate(makePath('login'))}
                        className="text-sm text-blue-600"
                    >
                        {t.back}
                    </button>
                </div>
            </div>
        </main>
    )
}
