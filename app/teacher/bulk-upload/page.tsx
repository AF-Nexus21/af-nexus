"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseAvailable } from "@/lib/supabase";

interface Student {
  first_name: string;
  last_name: string;
  grade_level: string;
  section: string;
  learner_reference_number?: string;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    getTeacherId();
  }, []);

  // ✅ Check Supabase availability
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isSupabaseAvailable || !supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-red-600">⚠️ Service Unavailable</h2>
          <p className="mt-2 text-sm text-gray-600">
            Supabase is not configured. Please contact support.
          </p>
          <button
            onClick={() => router.push("/teacher/preview")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Back to Preview
          </button>
        </div>
      </div>
    );
  }

  async function getTeacherId() {
    try {
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setTeacherId(user.id);
    } catch (error) {
      console.error("Error getting teacher ID:", error);
    }
  }

  function validateStudent(student: Student): string | null {
    if (!student.first_name?.trim()) return "First name is required";
    if (!student.last_name?.trim()) return "Last name is required";
    if (!student.grade_level?.trim()) return "Grade level is required";
    if (!student.section?.trim()) return "Section is required";
    return null;
  }

  async function handleBulkUpload() {
    if (!supabase) {
      setMessage("Supabase is not configured. Please try again later.");
      setMessageType("error");
      return;
    }

    if (students.length === 0) {
      setMessage("Please add at least one student.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const validStudents = students.filter((s) => {
        const error = validateStudent(s);
        if (error) {
          console.warn("Invalid student:", s, error);
          return false;
        }
        return true;
      });

      if (validStudents.length === 0) {
        setMessage("No valid students to upload. Please check the data.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .insert(
          validStudents.map((s) => ({
            ...s,
            teacher_id: teacherId,
            created_at: new Date().toISOString(),
          }))
        )
        .select();

      if (error) {
        console.error("Upload error:", error);
        setMessage(`Upload failed: ${error.message}`);
        setMessageType("error");
      } else {
        setMessage(`Successfully uploaded ${data?.length || 0} students!`);
        setMessageType("success");
        setStudents([]);
      }
    } catch (error) {
      console.error("Error uploading students:", error);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function addStudent() {
    setStudents([
      ...students,
      {
        first_name: "",
        last_name: "",
        grade_level: "",
        section: "",
        learner_reference_number: "",
      },
    ]);
  }

  function removeStudent(index: number) {
    const newStudents = [...students];
    newStudents.splice(index, 1);
    setStudents(newStudents);
  }

  function updateStudent(index: number, field: keyof Student, value: string) {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Bulk Upload Students</h1>
          <button
            onClick={() => router.push("/teacher/preview")}
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            ← Back to Preview
          </button>
        </div>

        <div className="mb-4 flex gap-4">
          <button
            onClick={addStudent}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            + Add Student
          </button>
          <button
            onClick={handleBulkUpload}
            disabled={loading || students.length === 0}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload All Students"}
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg p-4 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {students.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500">
            No students added yet. Click "Add Student" to start.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    First Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Last Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Grade Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    LRN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={student.first_name}
                        onChange={(e) =>
                          updateStudent(index, "first_name", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        placeholder="First Name"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={student.last_name}
                        onChange={(e) =>
                          updateStudent(index, "last_name", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        placeholder="Last Name"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={student.grade_level}
                        onChange={(e) =>
                          updateStudent(index, "grade_level", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        placeholder="e.g., Grade 7"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={student.section}
                        onChange={(e) =>
                          updateStudent(index, "section", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        placeholder="e.g., A"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={student.learner_reference_number || ""}
                        onChange={(e) =>
                          updateStudent(
                            index,
                            "learner_reference_number",
                            e.target.value
                          )
                        }
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        placeholder="LRN (optional)"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeStudent(index)}
                        className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}