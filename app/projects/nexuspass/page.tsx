"use client";

import Link from "next/link";

export default function NexuspassPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">NEXUSPASS</h1>
          <p className="mt-2 text-gray-600">Digital School ID System</p>
        </div>

        <div className="mt-8 rounded-xl bg-blue-50 p-6 text-center">
          <p className="text-gray-700">Under construction. Coming soon!</p>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}