"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EditCriteriaPage() {
  const [criteriaList, setCriteriaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxScore, setMaxScore] = useState(10);
  const [percentage, setPercentage] = useState(0.25);
  const [sortOrder, setSortOrder] = useState(1);
  const [segment, setSegment] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    // ✅ Diretso pasok na tayo, hindi na kailangan ng login check!
    fetchCriteria();
  }, []);

  async function fetchCriteria() {
    const { data } = await supabase
      .from("criteria")
      .select("*")
      .order("segment")
      .order("sort_order");
    setCriteriaList(data || []);
    setLoading(false);
  }

  async function handleAddCriteria() {
    if (!name.trim() || !segment.trim()) {
      setMessage("Name and Segment are required.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage(null);
    setMessageType("");

    try {
      const { error } = await supabase.from("criteria").insert({
        name: name,
        description: description,
        max_score: maxScore,
        percentage: percentage,
        sort_order: sortOrder,
        segment: segment,
        gender: gender || null,
      });

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("Criteria added successfully!");
      setMessageType("success");
      setLoading(false);

      // Reset form
      setName("");
      setDescription("");
      setMaxScore(10);
      setPercentage(0.25);
      setSortOrder(1);
      setSegment("");
      setGender("");

      fetchCriteria();
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  }

  async function handleUpdateCriteria(criteria: any) {
    setLoading(true);
    setMessage(null);
    setMessageType("");

    try {
      const { error } = await supabase
        .from("criteria")
        .update({
          name: criteria.name,
          description: criteria.description,
          max_score: criteria.max_score,
          percentage: criteria.percentage,
          sort_order: criteria.sort_order,
          segment: criteria.segment,
          gender: criteria.gender || null,
        })
        .eq("id", criteria.id);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("Criteria updated successfully!");
      setMessageType("success");
      setLoading(false);

      fetchCriteria();
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  }

  async function handleDeleteCriteria(criteria: any) {
    setLoading(true);
    setMessage(null);
    setMessageType("");

    try {
      const { error } = await supabase
        .from("criteria")
        .delete()
        .eq("id", criteria.id);

      if (error) {
        setMessage(error.message);
        setMessageType("error");
        return;
      }

      setMessage("Criteria deleted successfully!");
      setMessageType("success");
      setLoading(false);

      fetchCriteria();
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-500">Loading Criteria...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📝 Edit Criteria</h1>
            <p className="text-gray-600">Manage all scoring criteria for Mr. & Miss Intrams 2026</p>
          </div>
          <Link href="/intrams/admin/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Admin Dashboard
          </Link>
        </div>

        {/* Add New Criteria */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">➕ Add New Criteria</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Sportsmanship & Creativity"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Shows energy, confidence, and character of an athlete"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Select Segment --</option>
                <option value="Sport Attire">Sport Attire</option>
                <option value="Production Number">Production Number</option>
                <option value="Ramp Modelling">Ramp Modelling</option>
                <option value="Q&A">Q&A</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Both (All)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Score</label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Percentage</label>
              <input
                type="number"
                step="0.01"
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value))}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
              />
            </div>
          </div>

          <button
            onClick={handleAddCriteria}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Add Criteria"}
          </button>
        </div>

        {/* Existing Criteria List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Existing Criteria</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {criteriaList.map((criteria) => (
              <div key={criteria.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{criteria.name}</p>
                    <p className="text-xs text-gray-600">
                      Segment: {criteria.segment} | Gender: {criteria.gender || "Both"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteCriteria(criteria)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Name</label>
                    <input
                      type="text"
                      value={criteria.name}
                      onChange={(e) => {
                        const updated = criteriaList.map((c) =>
                          c.id === criteria.id ? { ...c, name: e.target.value } : c
                        );
                        setCriteriaList(updated);
                      }}
                      className="mt-1 w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Description</label>
                    <input
                      type="text"
                      value={criteria.description}
                      onChange={(e) => {
                        const updated = criteriaList.map((c) =>
                          c.id === criteria.id ? { ...c, description: e.target.value } : c
                        );
                        setCriteriaList(updated);
                      }}
                      className="mt-1 w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Max</label>
                      <input
                        type="number"
                        value={criteria.max_score}
                        onChange={(e) => {
                          const updated = criteriaList.map((c) =>
                            c.id === criteria.id ? { ...c, max_score: parseInt(e.target.value) } : c
                          );
                          setCriteriaList(updated);
                        }}
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Pct</label>
                      <input
                        type="number"
                        step="0.01"
                        value={criteria.percentage}
                        onChange={(e) => {
                          const updated = criteriaList.map((c) =>
                            c.id === criteria.id ? { ...c, percentage: parseFloat(e.target.value) } : c
                          );
                          setCriteriaList(updated);
                        }}
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Order</label>
                      <input
                        type="number"
                        value={criteria.sort_order}
                        onChange={(e) => {
                          const updated = criteriaList.map((c) =>
                            c.id === criteria.id ? { ...c, sort_order: parseInt(e.target.value) } : c
                          );
                          setCriteriaList(updated);
                        }}
                        className="mt-1 w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleUpdateCriteria(criteria)}
                  disabled={loading}
                  className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Update"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}