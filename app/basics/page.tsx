import { Suspense } from "react";
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

export default function BasicsPage() {
  return (
    <>
      <PageHeader title="1. 静的・キャッシュ・動的">
        <p>
          1つのページに3種類のコンテンツを並べています。
          <strong>何度かリロード</strong>
          して、どの時刻が変わるか確認してください。
        </p>
      </PageHeader>

      {/* ① 静的: 非同期処理もリクエスト情報も使わない → 自動的に事前生成 */}
      <Demo kind="static" title="① 静的コンテンツ">
        <p>
          このテキストは何もしなくてもビルド時にHTML化されます。 （
          <C>Date.now()</C> をここに直接書くと、「毎回違う値になる処理」
          を明示的に扱えとエラーになります）
        </p>
      </Demo>

      {/* ② キャッシュ: 'use cache' の結果が静的シェルに埋め込まれる */}
      <CachedSection />

      {/* ③ 動的: リクエストごとに実行。Suspense の fallback が静的シェルに入る */}
      <Suspense
        fallback={<DemoLoading kind="dynamic" title="③ 動的コンテンツ" />}
      >
        <DynamicSection />
      </Suspense>

      <H2>期待される挙動（npm run build &amp;&amp; npm run start）</H2>
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>
          ② の時刻は<strong>ビルドした時刻のまま変わりません</strong>
          。1秒かかるデータ取得もリロード時には走りません（ターミナルにログが出ない）。
        </li>
        <li>
          ③ はリロードのたびに一瞬「読み込み中…」が表示され、
          <strong>1秒後に最新の時刻</strong>に差し替わります。
        </li>
        <li>
          ページを開いた瞬間に ①②③の fallback が表示されるのは、 それらが
          <strong>静的シェル</strong>として事前に用意されているからです。
        </li>
      </ul>

      <H2>コード</H2>
      <Code>{`
// ② キャッシュ: 関数やコンポーネントの先頭に 'use cache'
async function CachedSection() {
  'use cache'
  cacheLife('hours')           // 寿命（次のレッスンで詳しく）
  const { fetchedAt } = await slowFetch('basics/cached')
  return <Demo kind="cached">...{fetchedAt}...</Demo>
}

// ③ 動的: connection() で「リクエストが来るまで待つ」ことを宣言
async function DynamicSection() {
  await connection()           // ← ここで事前レンダリングが止まる
  const { fetchedAt } = await slowFetch('basics/dynamic')
  return <Demo kind="dynamic">...{fetchedAt}...</Demo>
}

export default function Page() {
  return (
    <>
      <CachedSection />
      <Suspense fallback={<Loading />}>   {/* 動的部分は Suspense 必須 */}
        <DynamicSection />
      </Suspense>
    </>
  )
}
`}</Code>

      <Note>
        <strong>試してみよう：</strong> <C>DynamicSection</C> を囲む
        <C>&lt;Suspense&gt;</C> を外すと、開発サーバーのオーバーレイ（と{" "}
        <C>next build</C>）でエラーになります。Cache Components は
        「キャッシュするか、Suspense で囲むか」を
        <strong>開発者に必ず選ばせる</strong>仕組みだからです。
      </Note>
    </>
  );
}

async function CachedSection() {
  "use cache";
  cacheLife("hours");
  const { fetchedAt } = await slowFetch("basics/cached");
  return (
    <Demo
      kind="cached"
      title="② キャッシュされたコンテンツ（cacheLife('hours')）"
    >
      <p>1秒かかる処理の結果をキャッシュしています。</p>
      <Stamp label="取得時刻" ts={fetchedAt} />
    </Demo>
  );
}

async function DynamicSection() {
  await connection();
  const { fetchedAt } = await slowFetch("basics/dynamic");
  return (
    <Demo kind="dynamic" title="③ 動的コンテンツ（connection()）">
      <p>リクエストのたびに1秒かかる処理を実行しています。</p>
      <Stamp label="取得時刻" ts={fetchedAt} />
    </Demo>
  );
}
