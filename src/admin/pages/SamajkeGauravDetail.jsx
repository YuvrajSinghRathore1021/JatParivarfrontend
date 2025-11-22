import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { upload } from "../../lib/api.js";
import { useAdminQuery } from "../hooks/useAdminApi.js";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import FileDrop from "../../components/FileDrop.jsx";

let API_File = import.meta.env.VITE_API_File;

const emptyForm = {
    name: "",
    title: "",
    visible: true,
    photo: "",
    present: {
        timeline: "PRESENT",
        category: "games",
        biography: "",
        achievements: [""],
        gallery: [],
    },
    past: {
        timeline: "PAST",
        category: "games",
        biography: "",
        achievements: [""],
        gallery: [],
    },
};

export default function SamajkeGauravDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAdminAuth();

    const { data, isLoading } = useAdminQuery(
        ["gaurav", id],
        () => `/gaurav/${id}`,
        { enabled: id !== "save" }
    );

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // ---------------------------
    // SET FORM WHEN DATA LOADS
    // ---------------------------
    useEffect(() => {
        if (data && id !== "save") {
            setForm({
                name: data.name || "",
                title: data.title || "",
                visible: data.visible ?? true,
                photo: data.photo || "",

                present: {
                    timeline: "PRESENT",
                    category: data.present?.category || "games",
                    biography: data.present?.biography || "",
                    achievements: data.present?.achievements?.length
                        ? data.present.achievements
                        : [""],
                    gallery: data.present?.gallery || [],
                },

                past: {
                    timeline: "PAST",
                    category: data.past?.category || "games",
                    biography: data.past?.biography || "",
                    achievements: data.past?.achievements?.length
                        ? data.past.achievements
                        : [""],
                    gallery: data.past?.gallery || [],
                },
            });
        }
    }, [data]);

    // ---------------------------
    // SAFE UPDATE FUNCTIONS
    // ---------------------------
    const update = (section, field, value) => {
        setForm(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const updateMain = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // ---------------------------
    // PHOTO UPLOAD
    // ---------------------------
    const uploadMainPhoto = async file => {
        const { url } = await upload("/uploads/file", file);
        updateMain("photo", url);
    };

    const uploadGalleryPhoto = async (section, file) => {
        const { url } = await upload("/uploads/file", file);
        const newGallery = [...form[section].gallery, url];
        update(section, "gallery", newGallery);
    };

    const removeGalleryImage = (section, index) => {
        const newList = form[section].gallery.filter((_, i) => i !== index);
        update(section, "gallery", newList);
    };

    // ---------------------------
    // SAVE REQUEST
    // ---------------------------
    const mutation = useMutation({
        mutationFn: async payload => {
            setSaving(true);
            const method = id === "save" ? "POST" : "PATCH";

            const res = await fetch(`${API_File}/api/v1/admin/gaurav/${id}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            return res.json();
        },
        onSuccess: () => navigate("/admin/samaj_ke_gaurav"),
        onSettled: () => setSaving(false),
    });

    const save = e => {
        e.preventDefault();
        mutation.mutate(form);
    };

    const categories = [
        "games",
        "politics",
        "education",
        "medical",
        "samaj-sevi",
        "adhikari",
        "other",
    ];

    // ---------------------------
    // SECTION COMPONENT
    // ---------------------------
    const Section = ({ label, section }) => {
        const s = useMemo(() => form[section], [form, section]);

        return (
            <div className="border p-4 rounded-lg mt-6 bg-slate-50">
                <h3 className="text-lg font-semibold mb-2">{label}</h3>

                {/* CATEGORY */}
                <label className="block text-sm">
                    <span className="font-semibold">Category</span>
                    <select
                        value={s.category}
                        onChange={e => update(section, "category", e.target.value)}
                        className="mt-1 w-full border px-3 py-2 rounded"
                    >
                        {categories.map(c => (
                            <option key={c}>{c}</option>
                        ))}
                    </select>
                </label>

                {/* BIOGRAPHY */}
                <label className="block text-sm mt-3">
                    <span className="font-semibold">Biography</span>
                    <textarea
                        rows={4}
                        value={s.biography}
                        onChange={e => update(section, "biography", e.target.value)}
                        className="mt-1 w-full border px-3 py-2 rounded"
                    />
                </label>

                {/* ACHIEVEMENTS */}
                <div className="mt-3">
                    <span className="font-semibold text-sm">Achievements</span>

                    {s.achievements.map((a, i) => (
                        <div key={section + "-ach-" + i} className="flex gap-2 mt-2">
                            <input
                                value={a}
                                onChange={e => {
                                    const newList = [...s.achievements];
                                    newList[i] = e.target.value;
                                    update(section, "achievements", newList);
                                }}
                                className="flex-1 border px-3 py-2 rounded"
                            />

                            <button
                                type="button"
                                onClick={() => {
                                    const updated = s.achievements.filter(
                                        (_, idx) => idx !== i
                                    );
                                    update(section, "achievements", updated);
                                }}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded"
                            >
                                X
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() =>
                            update(section, "achievements", [...s.achievements, ""])
                        }
                        className="mt-2 px-3 py-1 border rounded text-sm"
                    >
                        + Add Achievement
                    </button>
                </div>

                {/* GALLERY */}
                <div className="mt-4">
                    <p className="font-semibold text-sm">Gallery</p>

                    <FileDrop
                        accept="image/*"
                        label="Upload Gallery Image"
                        onFile={f => uploadGalleryPhoto(section, f)}
                    />

                    <div className="grid grid-cols-3 gap-3 mt-3">
                        {s.gallery.map((img, i) => (
                            <div key={i} className="relative">
                                <img
                                    src={API_File + img}
                                    className="w-full h-32 object-cover rounded border"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(section, i)}
                                    className="absolute top-1 right-1 bg-white px-2 rounded text-xs"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // ---------------------------
    // RETURN UI
    // ---------------------------
    return (
        <form onSubmit={save} className="space-y-6 border p-6 rounded-xl bg-white">
            <h2 className="text-xl font-semibold">
                {id === "save" ? "Add New Gaurav" : "Edit Gaurav Profile"}
            </h2>

            {isLoading ? (
                <div className="h-40 bg-slate-100 animate-pulse rounded" />
            ) : (
                <>
                    {/* NAME */}
                    <label className="block text-sm">
                        <span className="font-semibold">Name</span>
                        <input
                            value={form.name}
                            onChange={e => updateMain("name", e.target.value)}
                            className="mt-1 w-full border px-3 py-2 rounded"
                        />
                    </label>

                    {/* TITLE */}
                    <label className="block text-sm">
                        <span className="font-semibold">Title / Position</span>
                        <input
                            value={form.title}
                            onChange={e => updateMain("title", e.target.value)}
                            className="mt-1 w-full border px-3 py-2 rounded"
                        />
                    </label>

                    {/* PHOTO */}
                    <div>
                        <p className="font-semibold text-sm">Profile Photo</p>
                        <FileDrop
                            accept="image/*"
                            label="Upload Main Photo"
                            onFile={uploadMainPhoto}
                        />

                        {form.photo && (
                            <img
                                src={API_File + form.photo}
                                className="mt-3 w-32 h-32 rounded object-cover border"
                            />
                        )}
                    </div>

                    {/* SECTIONS */}
                    {/* <Section label="Past Details" section="past" />
                    <Section label="Present Details" section="present" /> */}

                    {/* --------------------- PAST SECTION --------------------- */}
                    <div className="border p-4 rounded-lg mt-6 bg-slate-50">
                        <h3 className="text-lg font-semibold mb-2">Past Details</h3>

                        {/* CATEGORY */}
                        <label className="block text-sm">
                            <span className="font-semibold">Category</span>
                            <select
                                value={form.past.category}
                                onChange={(e) =>
                                    update("past", "category", e.target.value)
                                }
                                className="mt-1 w-full border px-3 py-2 rounded"
                            >
                                {categories.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </label>

                        {/* BIO */}
                        <label className="block text-sm mt-3">
                            <span className="font-semibold">Biography</span>
                            <textarea
                                rows={4}
                                value={form.past.biography}
                                onChange={(e) =>
                                    update("past", "biography", e.target.value)
                                }
                                className="mt-1 w-full border px-3 py-2 rounded"
                            />
                        </label>

                        {/* ACHIEVEMENTS */}
                        <div className="mt-3">
                            <span className="font-semibold text-sm">Achievements</span>

                            {form.past.achievements.map((a, i) => (
                                <div key={"past-ach-" + i} className="flex gap-2 mt-2">
                                    <input
                                        value={a}
                                        onChange={(e) => {
                                            const newList = [...form.past.achievements];
                                            newList[i] = e.target.value;
                                            update("past", "achievements", newList);
                                        }}
                                        className="flex-1 border px-3 py-2 rounded"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            update(
                                                "past",
                                                "achievements",
                                                form.past.achievements.filter(
                                                    (_, idx) => idx !== i
                                                )
                                            )
                                        }
                                        className="px-3 py-2 bg-red-100 text-red-600 rounded"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                    update("past", "achievements", [
                                        ...form.past.achievements,
                                        "",
                                    ])
                                }
                                className="mt-2 px-3 py-1 border rounded text-sm"
                            >
                                + Add Achievement
                            </button>
                        </div>

                        {/* GALLERY */}
                        <div className="mt-4">
                            <p className="font-semibold text-sm">Gallery</p>

                            <FileDrop
                                accept="image/*"
                                label="Upload Gallery Image"
                                onFile={(f) => uploadGalleryPhoto("past", f)}
                            />

                            <div className="grid grid-cols-3 gap-3 mt-3">
                                {form.past.gallery.map((img, i) => (
                                    <div key={i} className="relative">
                                        <img
                                            src={API_File + img}
                                            className="w-full h-32 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage("past", i)}
                                            className="absolute top-1 right-1 bg-white px-2 rounded text-xs"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>



                    {/* --------------------- PRESENT SECTION --------------------- */}
                    <div className="border p-4 rounded-lg mt-6 bg-slate-50">
                        <h3 className="text-lg font-semibold mb-2">Present Details</h3>

                        {/* CATEGORY */}
                        <label className="block text-sm">
                            <span className="font-semibold">Category</span>
                            <select
                                value={form.present.category}
                                onChange={(e) =>
                                    update("present", "category", e.target.value)
                                }
                                className="mt-1 w-full border px-3 py-2 rounded"
                            >
                                {categories.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </label>

                        {/* BIO */}
                        <label className="block text-sm mt-3">
                            <span className="font-semibold">Biography</span>
                            <textarea
                                rows={4}
                                value={form.present.biography}
                                onChange={(e) =>
                                    update("present", "biography", e.target.value)
                                }
                                className="mt-1 w-full border px-3 py-2 rounded"
                            />
                        </label>

                        {/* ACHIEVEMENTS */}
                        <div className="mt-3">
                            <span className="font-semibold text-sm">Achievements</span>

                            {form.present.achievements.map((a, i) => (
                                <div key={"present-ach-" + i} className="flex gap-2 mt-2">
                                    <input
                                        value={a}
                                        onChange={(e) => {
                                            const newList = [...form.present.achievements];
                                            newList[i] = e.target.value;
                                            update("present", "achievements", newList);
                                        }}
                                        className="flex-1 border px-3 py-2 rounded"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            update(
                                                "present",
                                                "achievements",
                                                form.present.achievements.filter(
                                                    (_, idx) => idx !== i
                                                )
                                            )
                                        }
                                        className="px-3 py-2 bg-red-100 text-red-600 rounded"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                    update("present", "achievements", [
                                        ...form.present.achievements,
                                        "",
                                    ])
                                }
                                className="mt-2 px-3 py-1 border rounded text-sm"
                            >
                                + Add Achievement
                            </button>
                        </div>

                        {/* GALLERY */}
                        <div className="mt-4">
                            <p className="font-semibold text-sm">Gallery</p>
                            <FileDrop
                                accept="image/*"
                                label="Upload Gallery Image"
                                onFile={(f) => uploadGalleryPhoto("present", f)}
                            />

                            <div className="grid grid-cols-3 gap-3 mt-3">
                                {form.present.gallery.map((img, i) => (
                                    <div key={i} className="relative">
                                        <img
                                            src={API_File + img}
                                            className="w-full h-32 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeGalleryImage("present", i)
                                            }
                                            className="absolute top-1 right-1 bg-white px-2 rounded text-xs"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* VISIBILITY */}
                    <label className="flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            checked={form.visible}
                            onChange={e => updateMain("visible", e.target.checked)}
                        />
                        <span>Visible on public page</span>
                    </label>
                </>
            )}

            <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white rounded"
            >
                {saving ? "Saving..." : "Save Profile"}
            </button>
        </form>
    );
}
