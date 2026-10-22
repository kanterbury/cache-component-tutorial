import Link from "next/link";
import { C, Code, Demo, H2, Note, PageHeader } from "./_components/ui";

export default function Home() {
  return (
    <>
      <PageHeader title="Cache Components を動かして理解する">
        <p>
          Next.js 16 の <strong>Cache Components</strong>（
          <C>cacheComponents: true</C>）は、「何をキャッシュするか」を
          <C>&apos;use cache&apos;</C>
          で<strong>明示的に</strong>指定する仕組みです。
          各ページには生成時刻が表示されるので、リロードしたときに
          <strong>どの時刻が変わり、どの時刻が変わらないか</strong>
          を観察してください。
        </p>
      </PageHeader>

      <H2>3種類のコンテンツ</H2>
      <p className="text-sm">
        Cache Components が有効なとき、ページの各部分は次のいずれかに分類されます。
        ビルド時に「静的」と「キャッシュ」の部分が<strong>静的シェル</strong>
        （HTML）として事前生成され、「動的」の部分だけがリクエスト時に
        <C>&lt;Suspense&gt;</C>
        の穴へストリーミングされます（Partial Prerendering / PPR）。
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Demo kind="static" title="静的">
          <p>非同期処理・リクエスト情報を使わない部分。ビルド時に自動で事前生成。</p>
        </Demo>
        <Demo kind="cached" title="キャッシュ">
          <p>
            <C>&apos;use cache&apos;</C>
            を付けた関数/コンポーネント。結果が保存され再利用される。
          </p>
        </Demo>
        <Demo kind="dynamic" title="動的">
          <p>
            <C>cookies()</C>・<C>connection()</C>
            などを使う部分。<C>&lt;Suspense&gt;</C>で囲む必要がある。
          </p>
        </Demo>
      </div>

      <Code>{`
┌──────────── 静的シェル（ビルド時に生成・CDNから即配信）────────────┐
│  <header> 静的なテキスト </header>                                  │
│  <CachedList />      ← 'use cache' の結果が埋め込まれる              │
│  <Suspense fallback={<Loading/>}>                                   │
│     ┌─ 穴 ─────────────────────────────────┐                       │
│     │  <UserInfo />  ← リクエスト時に生成し、 │ ← 後からストリーミング │
│     │                  fallbackと差し替え     │                       │
│     └───────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
`}</Code>

      <H2>レッスン</H2>
      <ol className="list-inside list-decimal space-y-1 text-sm">
        <li>
          <Link className="text-sky-600 underline" href="/basics">
            静的・キャッシュ・動的
          </Link>
          — 1ページの中で3種類を並べて比較
        </li>
        <li>
          <Link className="text-sky-600 underline" href="/cache-life">
            cacheLife
          </Link>
          — キャッシュの寿命（stale / revalidate / expire）
        </li>
        <li>
          <Link className="text-sky-600 underline" href="/cache-keys">
            キャッシュキー
          </Link>
          — 引数ごとに別のキャッシュになる
        </li>
        <li>
          <Link className="text-sky-600 underline" href="/revalidation">
            タグと再検証
          </Link>
          — <C>cacheTag</C> / <C>updateTag</C> / <C>revalidateTag</C>
        </li>
        <li>
          <Link className="text-sky-600 underline" href="/runtime-data">
            cookies とキャッシュ
          </Link>
          — 引数で渡すパターンと <C>&apos;use cache: private&apos;</C>
        </li>
        <li>
          <Link className="text-sky-600 underline" href="/interleaving">
            children の差し込み
          </Link>
          — キャッシュされた枠の中に動的コンテンツを入れる
        </li>
      </ol>

      <H2>観察のしかた</H2>
      <Note>
        <p className="mb-2">
          <strong>本番モードでの確認を推奨します。</strong>
          開発モード（<C>npm run dev</C>）では毎回レンダリングされる部分が多く、
          静的シェルの効果が見えにくいためです。
        </p>
        <Code>{`
npm run build   # ビルド結果に各ルートの種類（◐ Partial Prerender など）が表示される
npm run start   # http://localhost:3000
`}</Code>
        <p className="mt-2">
          サーバーのターミナルには、実際にデータ取得が走ったとき
          <C>🐢 [slowFetch]</C>
          のログが出ます。ログが出なければキャッシュが使われています。
          開発モードでは、キャッシュ関数内のログに <C>Cache</C> という接頭辞が付きます。
        </p>
      </Note>
    </>
  );
}
