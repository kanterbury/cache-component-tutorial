import { Suspense, type ReactNode } from "react";
import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { slowFetch } from "@/lib/time";
import {
  C,
  Code,
  Demo,
  DemoLoading,
  H2,
  Note,
  PageHeader,
  Stamp,
} from "../_components/ui";

export default function InterleavingPage() {
  return (
    <>
      <PageHeader title="6. children の差し込み（Interleaving）">
        <p>
          キャッシュされたコンポーネントに <C>children</C>{" "}
          として渡したJSXは、<strong>キャッシュの内容に含まれません</strong>
          。そのため「外枠はキャッシュ、中身は動的」という構成が作れます。
        </p>
      </PageHeader>

      <CachedFrame>
        <Suspense fallback={<DemoLoading kind="dynamic" title="中身（動的）" />}>
          <DynamicContent />
        </Suspense>
      </CachedFrame>

      <H2>観察ポイント</H2>
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>
          リロードすると、内側（オレンジ）の時刻だけが変わり、外枠（青）の時刻は変わりません。
        </li>
        <li>
          外枠は <C>children</C>{" "}
          の中身を知らないままキャッシュされ、差し込む「穴」の位置だけを覚えています。
        </li>
      </ul>

      <H2>コード</H2>
      <Code>{`
async function CachedFrame({ children }: { children: ReactNode }) {
  'use cache'
  cacheLife('hours')
  const data = await getSidebarData()
  return (
    <div>
      <Sidebar data={data} />
      {children}        {/* ← ここはキャッシュキーにも中身にも含まれない */}
    </div>
  )
}

export default function Page() {
  return (
    <CachedFrame>
      <Suspense fallback={<Loading />}>
        <DynamicContent />   {/* リクエストごとに生成 */}
      </Suspense>
    </CachedFrame>
  )
}
`}</Code>

      <Note>
        注意：キャッシュ関数の本体で <C>children</C>{" "}
        を加工したり中身を参照したりすると、この性質は失われます。そのまま返すだけにしましょう。
        Server Action を props で渡し、キャッシュされたコンポーネントからクライアントコンポーネントへ
        受け渡すこともできます（キャッシュ関数の中で呼び出さなければOK）。
      </Note>
    </>
  );
}

async function CachedFrame({ children }: { children: ReactNode }) {
  "use cache";
  cacheLife("hours");
  const { fetchedAt } = await slowFetch("interleaving/frame");
  return (
    <Demo kind="cached" title="外枠（キャッシュ）">
      <Stamp label="外枠の取得時刻" ts={fetchedAt} />
      <div className="mt-3">{children}</div>
    </Demo>
  );
}

async function DynamicContent() {
  await connection();
  const { fetchedAt } = await slowFetch("interleaving/content");
  return (
    <Demo kind="dynamic" title="中身（children・動的）">
      <Stamp label="中身の取得時刻" ts={fetchedAt} />
    </Demo>
  );
}
