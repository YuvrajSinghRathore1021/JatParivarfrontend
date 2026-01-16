import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchMatrimonyDetail } from "../../../lib/dashboardApi";
import { useLang } from "../../../lib/useLang";
let API_File = import.meta.env.VITE_API_File
export default function MatrimonyDetail() {

    const { id } = useParams();
    const { lang } = useLang();

    const { data: item, isLoading } = useQuery({
        queryKey: ["matrimony", id],
        queryFn: () => fetchMatrimonyDetail(id),
    });

    if (isLoading) {
        return (
            <div className="animate-pulse p-6 space-y-4">
                <div className="h-40 rounded-2xl bg-slate-200" />
                <div className="h-6 w-1/3 rounded bg-slate-200" />
                <div className="h-4 w-2/3 rounded bg-slate-200" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="p-6 text-center text-slate-500">
                {lang === "hi" ? "डेटा उपलब्ध नहीं है।" : "No data found."}
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">

            {/* ===== Photo ===== */}
            <section className="px-4">
                <img
                    src={API_File + item.photos?.[0]}
                    alt="image"
                    className="w-full h-60 object-cover rounded-2xl shadow"
                />
            </section>

            {/* ===== Basic Info ===== */}
            <section className="px-4">
                <h1 className="text-3xl font-bold text-slate-900">{item.name}</h1>

                <div className="text-slate-700 mt-2 space-y-1">
                    <p><b>Age:</b> {item.age}</p>
                    <p><b>Gender:</b> {item.gender}</p>
                    <p><b>Height:</b> {item.height}</p>
                    <p><b>Marital Status:</b> {item.maritalStatus}</p>
                </div>
            </section>

            {/* ===== Education ===== */}
            <section className="px-4">
                <div className="rounded-xl bg-white shadow-sm border p-6 space-y-1">
                    <h2 className="text-lg font-semibold">Education</h2>
                    <p className="text-slate-700 break-all">{item.education}</p>
                </div>
            </section>

            {/* ===== Occupation ===== */}
            <section className="px-4">
                <div className="rounded-xl bg-white shadow-sm border p-6 space-y-1">
                    <h2 className="text-lg font-semibold">Occupation</h2>
                    <p className="text-slate-700 break-all" >{item.occupation}</p>
                </div>
            </section>

            {/* ===== Address ===== */}
            <section className="px-4">
                <div className="rounded-xl bg-white shadow-sm border p-6 space-y-2">
                    <h2 className="text-lg font-semibold">Location</h2>
                    <p className="text-slate-800">
                        {item.village}, {item.city}, {item.district}, {item.state}
                    </p>
                </div>
            </section> 
            <section className="px-4">
                <div className="rounded-xl bg-white shadow-sm border p-6 space-y-2">
                    <h2 className="text-lg font-semibold">Address</h2>
                    <p className="text-slate-800">
                        {item?.address}
                    </p>
                </div>
            </section>
            <section className="px-4">
                <div className="rounded-xl bg-white shadow-sm border p-6 space-y-2">
                    <h2 className="text-lg font-semibold">Parental Address</h2>
                    <p className="text-slate-800">
                        {item?.parentaladdress}
                    </p>
                </div>
            </section>

            {/* ===== Gotra ===== */}
            <section className="px-4">
                <div className="rounded-xl bg-white shadow-sm border p-6 space-y-2">
                    <h2 className="text-lg font-semibold">Gotra</h2>
                    <ul className="text-slate-700 space-y-1">
                        <li><b>Self:</b> {item.gotra?.self}</li>
                        <li><b>Mother:</b> {item.gotra?.mother}</li>
                        <li><b>Nani:</b> {item.gotra?.nani}</li>
                        <li><b>Dadi:</b> {item.gotra?.dadi}</li>
                    </ul>
                </div>
            </section>
            {/* ===== Gallery ===== */}
            {item.photos?.length > 1 && (
                <section className="px-4 mt-4">
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">
                        {lang === "hi" ? "गैलरी" : "Gallery"}
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {item.photos.slice(1).map((img, i) => (
                            <img
                                key={i}
                                src={API_File + img}
                                alt={`Gallery ${i + 1}`}
                                className="h-32 w-full object-cover rounded-xl shadow"
                            />
                        ))}
                    </div>
                </section>
            )}
            {/* ===== Dates ===== */}
            <section className="px-4">
                <div className="rounded-xl bg-white shadow-sm border p-6 space-y-1">
                    <h2 className="text-lg font-semibold">Record Info</h2>

                    <p><b>Created:</b> {new Date(item.createdAt).toLocaleString()}</p>
                    <p><b>Updated:</b> {new Date(item.updatedAt).toLocaleString()}</p>
                </div>
            </section>

        </div>
    );
}
