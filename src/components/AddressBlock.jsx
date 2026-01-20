// import SelectField from './SelectField'
// import { useGeoOptions } from '../hooks/useGeoOptions'

// export default function AddressBlock(props) {
//     const { title, formKey, form, setForm, lang } = props

//     const f = form[formKey]

//     // ⭐ Correct Hook Call
//     const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(f?.stateCode, f?.districtCode, lang)

//     return (
//         <div className="rounded-2xl border border-slate-200 p-4 space-y-4 md:col-span-2">
//             <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>

//             {/* STATE */}
//             <SelectField
//                 label={lang === 'hi' ? 'राज्य' : 'State'}
//                 value={f?.stateCode}
//                 options={stateOptions}
//                 onChange={(code) => {
//                     const s = states.find(x => x.code === code)
//                     setForm(prev => ({
//                         ...prev,
//                         [formKey]: {
//                             ...prev[formKey],
//                             stateCode: code,
//                             state: s?.name?.en || '',
//                             districtCode: '',
//                             district: '',
//                             cityCode: '',
//                             city: '',
//                         }
//                     }))
//                 }}
//             />

//             {/* DISTRICT */}
//             <SelectField
//                 label={lang === 'hi' ? 'ज़िला' : 'District'}
//                 value={f?.districtCode}
//                 options={districtOptions}
//                 disabled={!f?.stateCode}
//                 onChange={(code) => {
//                     const d = districts.find(x => x.code === code)
//                     setForm(prev => ({
//                         ...prev,
//                         [formKey]: {
//                             ...prev[formKey],
//                             districtCode: code,
//                             district: d?.name?.en || '',
//                             cityCode: '',
//                             city: '',
//                         }
//                     }))
//                 }}
//             />

//             {/* CITY */}
//             <SelectField
//                 label={lang === 'hi' ? 'शहर' : 'City'}
//                 value={f?.cityCode}
//                 options={cityOptions}
//                 disabled={!f?.districtCode}
//                 onChange={(code) => {
//                     const c = cities.find(x => x.code === code)
//                     setForm(prev => ({
//                         ...prev,
//                         [formKey]: {
//                             ...prev[formKey],
//                             cityCode: code,
//                             city: c?.name?.en || '',
//                         }
//                     }))
//                 }}
//             />

//             {/* VILLAGE */}
//             <label className="block text-sm">
//                 <span className="font-semibold text-slate-600">{lang === 'hi' ? 'गाँव' : 'Village'}</span>
//                 <input
//                     value={f?.village}
//                     onChange={(e) =>
//                         setForm(prev => ({
//                             ...prev,
//                             [formKey]: { ...prev[formKey], village: e.target.value }
//                         }))
//                     }
//                     className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
//                 />
//             </label>
//         </div>
//     )
// }
















import SelectField from './SelectField'
import { useGeoOptions } from '../hooks/useGeoOptions'
import { useEffect } from 'react'

export default function AddressBlock(props) {
    const OTHER = '__OTHER__'

    const { title, formKey, form, setForm, lang } = props

    const f = form[formKey]

    // ⭐ Correct Hook Call
    const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(f?.stateCode, f?.districtCode, lang)

    // If we already have a typed value but no code (from earlier saves), show manual inputs by forcing OTHER
    useEffect(() => {
        if (!f) return
        if (!f.stateCode && f.state) {
            setForm(prev => ({
                ...prev,
                [formKey]: {
                    ...prev[formKey],
                    stateCode: OTHER,
                }
            }))
        }
        if (!f.districtCode && f.district) {
            setForm(prev => ({
                ...prev,
                [formKey]: {
                    ...prev[formKey],
                    districtCode: OTHER,
                }
            }))
        }
        if (!f.cityCode && f.city) {
            setForm(prev => ({
                ...prev,
                [formKey]: {
                    ...prev[formKey],
                    cityCode: OTHER,
                }
            }))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [f?.state, f?.district, f?.city])

    return (
        <div className="rounded-2xl border border-slate-200 p-4 space-y-4 md:col-span-2">
            <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>

            {/* STATE */}
            <SelectField
                label={lang === 'hi' ? 'राज्य' : 'State'}
                value={f?.stateCode}
                options={[
                    ...stateOptions,
                    { value: OTHER, label: lang === 'hi' ? 'सूची में नहीं' : 'Not in list' }
                ]}
                onChange={(code) => {
                    if (code === OTHER) {
                        setForm(prev => ({
                            ...prev,
                            [formKey]: {
                                ...prev[formKey],
                                stateCode: OTHER,
                                state: '',
                                districtCode: '',
                                district: '',
                                cityCode: '',
                                city: '',
                            }
                        }))
                        return
                    }

                    const s = states.find(x => x.code === code)
                    setForm(prev => ({
                        ...prev,
                        [formKey]: {
                            ...prev[formKey],
                            stateCode: code,
                            state: s?.name?.en || '',
                            districtCode: '',
                            district: '',
                            cityCode: '',
                            city: '',
                        }
                    }))
                }}
            />

            {/* MANUAL STATE INPUT */}
            {f?.stateCode === OTHER && (
                <input
                    placeholder={lang === 'hi' ? 'राज्य लिखें' : 'Enter State'}
                    value={f?.state}
                    onChange={(e) =>
                        setForm(prev => ({
                            ...prev,
                            [formKey]: { ...prev[formKey], state: e.target.value }
                        }))
                    }
                    className="w-full rounded-xl border px-3 py-2"
                />
            )}


            {/* DISTRICT */}
            <SelectField
                label={lang === 'hi' ? 'ज़िला' : 'District'}
                value={f?.districtCode}
                options={[
                    ...districtOptions,
                    { value: OTHER, label: lang === 'hi' ? 'सूची में नहीं' : 'Not in list' }
                ]}
                // disabled={!f?.stateCode || f?.stateCode === OTHER}
                onChange={(code) => {
                    if (code === OTHER) {
                        setForm(prev => ({
                            ...prev,
                            [formKey]: {
                                ...prev[formKey],
                                districtCode: OTHER,
                                district: '',
                                cityCode: '',
                                city: '',
                            }
                        }))
                        return
                    }

                    const d = districts.find(x => x.code === code)
                    setForm(prev => ({
                        ...prev,
                        [formKey]: {
                            ...prev[formKey],
                            districtCode: code,
                            district: d?.name?.en || '',
                            cityCode: '',
                            city: '',
                        }
                    }))
                }}
            />

            {f?.districtCode === OTHER && (
                <input
                    placeholder={lang === 'hi' ? 'ज़िला लिखें' : 'Enter District'}
                    value={f?.district}
                    onChange={(e) =>
                        setForm(prev => ({
                            ...prev,
                            [formKey]: { ...prev[formKey], district: e.target.value }
                        }))
                    }
                    className="w-full rounded-xl border px-3 py-2"
                />
            )}



            {/* CITY */}
            <SelectField
                label={lang === 'hi' ? 'शहर' : 'City'}
                value={f?.cityCode}
                options={[
                    ...cityOptions,
                    { value: OTHER, label: lang === 'hi' ? 'सूची में नहीं' : 'Not in list' }
                ]}
                // disabled={!f?.districtCode || f?.districtCode === OTHER}
                onChange={(code) => {
                    if (code === OTHER) {
                        setForm(prev => ({
                            ...prev,
                            [formKey]: {
                                ...prev[formKey],
                                cityCode: OTHER,
                                city: '',
                            }
                        }))
                        return
                    }

                    const c = cities.find(x => x.code === code)
                    setForm(prev => ({
                        ...prev,
                        [formKey]: {
                            ...prev[formKey],
                            cityCode: code,
                            city: c?.name?.en || '',
                        }
                    }))
                }}
            />

            {f?.cityCode === OTHER && (
                <input
                    placeholder={lang === 'hi' ? 'शहर लिखें' : 'Enter City'}
                    value={f?.city}
                    onChange={(e) =>
                        setForm(prev => ({
                            ...prev,
                            [formKey]: { ...prev[formKey], city: e.target.value }
                        }))
                    }
                    className="w-full rounded-xl border px-3 py-2"
                />
            )}


            {/* VILLAGE */}
            <label className="block text-sm">
                <span className="font-semibold text-slate-600">{lang === 'hi' ? 'पता' : 'Address'}</span>
                <input
                    value={f?.village}
                    onChange={(e) =>
                        setForm(prev => ({
                            ...prev,
                            [formKey]: { ...prev[formKey], village: e.target.value }
                        }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
            </label>
        </div>
    )
}
