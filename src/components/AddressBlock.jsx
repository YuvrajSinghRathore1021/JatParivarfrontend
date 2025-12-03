import SelectField from './SelectField'
import { useGeoOptions } from '../hooks/useGeoOptions'

export default function AddressBlock(props) {
    const { title, formKey, form, setForm, lang } = props

    const f = form[formKey]

    // ⭐ Correct Hook Call
    const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(f.stateCode, f.districtCode, lang)

    return (
        <div className="rounded-2xl border border-slate-200 p-4 space-y-4 md:col-span-2">
            <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>

            {/* STATE */}
            <SelectField
                label={lang === 'hi' ? 'राज्य' : 'State'}
                value={f.stateCode}
                options={stateOptions}
                onChange={(code) => {
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

            {/* DISTRICT */}
            <SelectField
                label={lang === 'hi' ? 'ज़िला' : 'District'}
                value={f.districtCode}
                options={districtOptions}
                disabled={!f.stateCode}
                onChange={(code) => {
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

            {/* CITY */}
            <SelectField
                label={lang === 'hi' ? 'शहर' : 'City'}
                value={f.cityCode}
                options={cityOptions}
                disabled={!f.districtCode}
                onChange={(code) => {
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

            {/* VILLAGE */}
            <label className="block text-sm">
                <span className="font-semibold text-slate-600">{lang === 'hi' ? 'गाँव' : 'Village'}</span>
                <input
                    value={f.village}
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
