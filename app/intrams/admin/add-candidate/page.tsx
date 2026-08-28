"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AddCandidatePage() {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [section, setSection] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  const validateForm = () => {
    if (!number.trim()) return "Candidate Number is required.";
    if (!name.trim()) return "Candidate Name is required.";
    if (!section.trim()) return "Section is required.";
    return null;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage(null);
    setMessageType("");

    try {
      // 1. I-upload muna yung photo sa Supabase Storage
      let photoUrl = null;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `candidate-${number}-${Date.now()}.${fileExt}`;
        const filePath = `candidate-photos/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('candidate-photos')
          .upload(filePath, photoFile);
        
        if (uploadError) {
          setMessage(`Photo upload failed: ${uploadError.message}`);
          setMessageType("error");
          return;
        }
        
        const { data } = supabase.storage
          .from('candidate-photos')
          .getPublicUrl(filePath);
        photoUrl = data.publicUrl;
      }

      // 2. I-insert yung candidate sa database
      const { error } = await supabase.from("candidates").insert({
        number: parseInt(number),
        name: name,
        gender: gender,
        section: section,
        photo_url: photoUrl || null,
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("Candidate added successfully!");
      setMessageType("success");
      setLoading(false);

      // Reset form
      setNumber("");
      setName("");
      setGender("male");
      setSection("");
      setPhotoFile(null);
      setPhotoPreview(null);

      setTimeout(() => {
        router.push("/intrams/admin/dashboard");
      }, 1500);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📝 Add Candidate</h1>
            <p className="text-gray-600">Add a new candidate to Mr. & Miss Intrams 2026</p>
          </div>
          <Link href="/intrams/admin/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Admin Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Candidate Number</label>
              <input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Candidate Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Section</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Grade 10 - Ruby"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="mt-2 h-24 w-16 object-cover rounded-lg"
                />
              )}
            </div>

            {message && (
              <div
                className={`mt-4 rounded-lg p-3 text-center text-sm ${
                  messageType === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : messageType === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}