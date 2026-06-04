import Link from "next/link";

import { mainNavigation } from "@/config/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-fuchsia-300/10 bg-[#07091a]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-400 via-violet-400 to-cyan-300 font-black text-slate-950 shadow-lg shadow-fuchsia-500/25">
            PR
          </div>
          <div>
            <p className="text-lg font-bold text-white">PickResearch</p>
            <p className="text-xs text-fuchsia-200/70">DFS prop finder</p>
          </div>
        </Link>
        <nav className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 transition hover:border-fuchsia-300/70 hover:bg-fuchsia-400/10 hover:text-white"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
