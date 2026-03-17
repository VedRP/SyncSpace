import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-6xl px-6">
        <header className="h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              S
            </span>
            <span>SyncSpace</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition duration-200 shadow-md"
            >
              Signup
            </Link>
          </div>
        </header>

        <main className="py-12">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-semibold leading-tight">
                A clean workspace for teams, projects, and tasks.
              </h1>
              <p className="mt-4 text-gray-500">
                SyncSpace is a minimal, modern UI that feels like a real SaaS product — designed for hackathons and ready to connect to a backend later.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition duration-200 shadow-md text-center"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/task/proj-1"
                  className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition duration-200 text-center"
                >
                  View Kanban
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 shadow-md p-6">
              <div className="text-sm font-semibold">Quick preview</div>
              <p className="text-sm text-gray-500 mt-1">A few things you can do right now.</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: "Overview", desc: "Stats + activity" },
                  { title: "Projects", desc: "Card grid list" },
                  { title: "Kanban", desc: "Trello-like board" },
                ].map((c) => (
                  <div key={c.title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-sm font-semibold">{c.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Modern UI", desc: "Rounded cards, soft shadows, clean spacing." },
              { title: "Clear navigation", desc: "Active states + hover transitions everywhere." },
              { title: "Backend-ready", desc: "UI flows built for future integration." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl bg-white border border-gray-200 shadow-md p-6">
                <div className="text-xl font-semibold">{f.title}</div>
                <div className="text-gray-500 mt-2">{f.desc}</div>
              </div>
            ))}
          </section>
        </main>

        <footer className="py-10 border-t border-gray-200 text-sm text-gray-500">
          © {new Date().getFullYear()} SyncSpace
        </footer>
      </div>
    </div>
  );
}
