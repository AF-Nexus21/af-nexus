"use client";

import Link from "next/link";

export default function IntramsProjectPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-600">INTRAMS 2026</h1>
          <p className="mt-2 text-gray-600">Online Tabulation System</p>
        </div>

        <div className="mt-8 rounded-xl bg-orange-50 p-6 text-center">
          <p className="text-gray-700">Under construction. Coming soon!</p>
          <Link href="/dashboard" className="mt-4 inline-block text-orange-600 hover:text-orange-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}