import type { ReactNode } from "react";
import { formatTime } from "@/lib/time";

export type Kind = "static" | "cached" | "dynamic" | "private";

const KIND: Record<Kind, { label: string; box: string; badge: string }> = {
  static: {
    label: "静的",
    box: "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900",
    badge: "bg-zinc-600 text-white",
  },
  cached: {
    label: "'use cache'",
    box: "border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40",
    badge: "bg-sky-600 text-white",
  },
  dynamic: {
    label: "動的（リクエスト時）",
    box: "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/40",
    badge: "bg-orange-600 text-white",
  },
  private: {
    label: "'use cache: private'",
    box: "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/40",
    badge: "bg-violet-600 text-white",
  },
};

/** 1つのデモ領域。色で「静的 / キャッシュ / 動的」を区別します。 */
export function Demo({
  kind,
  title,
  children,
}: {
  kind: Kind;
  title: string;
  children: ReactNode;
}) {
  const k = KIND[kind];
  return (
    <section className={`rounded-lg border-2 p-4 ${k.box}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 font-mono text-xs ${k.badge}`}>
          {k.label}
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </section>
  );
}

/** Suspense の fallback 用。これ自体は静的シェルに含まれます。 */
export function DemoLoading({ kind, title }: { kind: Kind; title: string }) {
  return (
    <Demo kind={kind} title={title}>
      <p className="animate-pulse text-zinc-500">
        ⏳ 読み込み中…（この fallback は静的シェルに含まれています）
      </p>
    </Demo>
  );
}

export function Stamp({ label, ts }: { label: string; ts: number }) {
  return (
    <p>
      {label}:{" "}
      <time className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-base font-bold dark:bg-black/40">
        {formatTime(ts)}
      </time>
    </p>
  );
}

export function PageHeader({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="space-y-2 text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </header>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100">
      <code>{children.trim()}</code>
    </pre>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
      {children}
    </aside>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="pt-4 text-lg font-bold">{children}</h2>;
}

export function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-zinc-200 px-1 font-mono text-[0.9em] dark:bg-zinc-800">
      {children}
    </code>
  );
}
