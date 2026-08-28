"use client";

import Link from "next/link";

export default function IntramsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">🎉 Mr. & Miss Intrams 2026</h1>
          <p className="mt-2 text-lg text-purple-100">Online Tabulation System</p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {/* Admin Panel */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              🛠️
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Admin Panel</h3>
            <p className="mt-2 text-sm text-gray-600">
              Manage candidates, criteria, and view all scores.
            </p>
            <Link href="/intrams/admin" className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700">
              Go to Admin
            </Link>
          </div>

          {/* Judge Login */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              👩‍⚖️
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Judge Login</h3>
            <p className="mt-2 text-sm text-gray-600">
              Login to submit scores.
            </p>
            <Link href="/intrams/judge/login" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              Judge Login
            </Link>
          </div>

          {/* Judge Register */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              📝
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Judge Registration</h3>
            <p className="mt-2 text-sm text-gray-600">
              Create your judge account to start scoring.
            </p>
            <Link href="/intrams/judge/register" className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
              Register as Judge
            </Link>
          </div>

          {/* Live Display */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              📺
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Live Display</h3>
            <p className="mt-2 text-sm text-gray-600">
              Real-time leaderboard for the audience and hosts.
            </p>
            <Link href="/intrams/display" className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
              Go to Live Display
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}