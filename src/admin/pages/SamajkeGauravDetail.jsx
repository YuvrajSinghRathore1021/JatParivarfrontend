import { useEffect, useState } from "react";
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
    timeline: "PAST",
    category: "games",
    biography: "",
    achievements: [""],
    photo: "",
    gallery: [],
    visible: true,
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

    useEffect(() => {
        if (data && id !== "save") {
            setForm({
                name: data.name,
                title: data.title,
                timeline: data.timeline,
                category: data.category,
                biography: data.biography,
                achievements: data.achievements?.length ? data.achievements : [""],
                photo: data.photo,
                gallery: data.gallery || [],
                visible: data.visible,
            });
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async (payload) => {
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
        onSuccess: () => {
            navigate("/admin/samaj_ke_gaurav");
        },
        onSettled: () => setSaving(false),
    });

    const update = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const uploadMainPhoto = async (file) => {
        const { url } = await upload("/uploads/file", file);
        update("photo", url);
    };

    const uploadGalleryPhoto = async (file) => {
        const { url } = await upload("/uploads/file", file);
        update("gallery", [...form.gallery, url]);
    };

    const removeGalleryImage = (index) => {
        update(
            "gallery",
            form.gallery.filter((_, i) => i !== index)
        );
    };

    const save = (e) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    const categories = [
        "games", "politics", "education",
        "medical", "samaj-sevi", "adhikari", "other",
    ];

    return (
        <form
            onSubmit={save}
            className="space-y-6 border p-6 rounded-xl bg-white"
        >
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
                            onChange={(e) =>
                                update("name", e.target.value)
                            }
                            className="mt-1 w-full border px-3 py-2 rounded"
                        />
                    </label>

                    {/* TITLE / POSITION */}
                    <label className="block text-sm">
                        <span className="font-semibold">Title / Position</span>
                        <input
                            value={form.title}
                            onChange={(e) =>
                                update("title", e.target.value)
                            }
                            className="mt-1 w-full border px-3 py-2 rounded"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        {/* TIMELINE */}
                        <label className="block text-sm">
                            <span className="font-semibold">Timeline</span>
                            <select
                                value={form.timeline}
                                onChange={(e) =>
                                    update("timeline", e.target.value)
                                }
                                className="mt-1 w-full border px-3 py-2 rounded"
                            >
                                <option value="PAST">Past</option>
                                <option value="PRESENT">Present</option>
                            </select>
                        </label>

                        {/* CATEGORY */}
                        <label className="block text-sm">
                            <span className="font-semibold">Category</span>
                            <select
                                value={form.category}
                                onChange={(e) =>
                                    update("category", e.target.value)
                                }
                                className="mt-1 w-full border px-3 py-2 rounded"
                            >
                                {categories.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* BIOGRAPHY */}
                    <label className="block text-sm">
                        <span className="font-semibold">Biography</span>
                        <textarea
                            value={form.biography}
                            onChange={(e) =>
                                update("biography", e.target.value)
                            }
                            rows={5}
                            className="mt-1 w-full border px-3 py-2 rounded"
                        />
                    </label>

                    {/* ACHIEVEMENTS */}
                    <div>
                        <span className="font-semibold text-sm">
                            Achievements
                        </span>
                        {form.achievements.map((a, i) => (
                            <div key={i} className="flex gap-2 mt-2">
                                <input
                                    value={a}
                                    onChange={(e) => {
                                        const arr = [...form.achievements];
                                        arr[i] = e.target.value;
                                        update("achievements", arr);
                                    }}
                                    className="flex-1 border px-3 py-2 rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        update(
                                            "achievements",
                                            form.achievements.filter(
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
                                update("achievements", [
                                    ...form.achievements,
                                    "",
                                ])
                            }
                            className="mt-2 px-3 py-1 border rounded text-sm"
                        >
                            + Add Achievement
                        </button>
                    </div>

                    {/* MAIN PHOTO */}
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

                    {/* GALLERY */}
                    <div>
                        <p className="font-semibold text-sm">Gallery</p>
                        <FileDrop
                            accept="image/*"
                            label="Upload Gallery Image"
                            onFile={uploadGalleryPhoto}
                        />

                        <div className="grid grid-cols-3 gap-3 mt-3">
                            {form.gallery.map((img, i) => (
                                <div key={i} className="relative">
                                    <img
                                        src={API_File + img}
                                        className="w-full h-32 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(i)}
                                        className="absolute top-1 right-1 bg-white px-2 rounded text-xs"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* VISIBLE */}
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.visible}
                            onChange={(e) =>
                                update("visible", e.target.checked)
                            }
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
