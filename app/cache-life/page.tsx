import { Suspense } from "react";
import { cacheLife } from "next/cache";
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

export default function CacheLifePage() {
  return (
    <>
      <PageHeader title="2. cacheLife — キャッシュの寿命">
        <p>
          <C>cacheLife()</C> は <C>&apos;use cache&apos;</C>
          の中で呼び、そのキャッシュがどれくらい使われ続けるかを決めます。
          寿命は3つの値で表されます。
        </p>
      </PageHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b dark:border-zinc-700">
            <tr>
              <th className="py-1 pr-4">値</th>
              <th className="py-1">意味</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            <tr>
              <td className="py-1 pr-4 font-mono">stale</td>
              <td>
                ブラウザ側（クライアントルーター）がサーバーに確認せず使い回せる時間
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-mono">revalidate</td>
              <td>
                これを過ぎた後のリクエストでは<strong>古い結果を返しつつ裏で作り直す</strong>
                （stale-while-revalidate）
              </td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-mono">expire</td>
              <td>
                アクセスが無いままこれを過ぎると、次のリクエストは作り直し完了まで待つ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <H2>デモ</H2>

      {/* stale が5分未満なので App Shell（クライアント遷移時に即表示される部分）には入らない
          → クライアント遷移を即時にするため Suspense で囲む。直接アクセス時の静的シェルには含まれる */}
      <Suspense
        fallback={<DemoLoading kind="cached" title="cacheLife('tenSeconds')" />}
      >
        <TenSecondsSection />
      </Suspense>

      {/* 'seconds' は expire が1分しかないので事前レンダリングから除外される → Suspense が必要 */}
      <Suspense
        fallback={<DemoLoading kind="cached" title="cacheLife('seconds')" />}
      >
        <SecondsSection />
      </Suspense>

      <H2>観察ポイント（npm run start で）</H2>
      <ol className="list-inside list-decimal space-y-1 text-sm">
        <li>
          上の <C>tenSeconds</C>{" "}
          は事前レンダリングされるので、最初は<strong>ビルド時刻</strong>
          が表示されます。
        </li>
        <li>
          10秒以上待ってリロード →{" "}
          <strong>まだ古い時刻</strong>
          が表示されます（古い結果を返しつつ、裏で再生成が始まる）。
        </li>
        <li>
          もう一度リロード → <strong>新しい時刻</strong>
          に変わります。これが stale-while-revalidate です。
        </li>
        <li>
          下の <C>seconds</C>{" "}
          は寿命が短すぎるため静的シェルに入らず、「動的な穴」としてリクエスト時に解決されます。
        </li>
      </ol>

      <H2>コード</H2>
      <Code>{`
// next.config.ts でカスタムプロファイルを定義
cacheLife: {
  tenSeconds: { stale: 30, revalidate: 10, expire: 3600 },
}

// 使う側
async function TenSecondsSection() {
  'use cache'
  cacheLife('tenSeconds')     // 名前で指定
  // cacheLife({ revalidate: 10 })  // インラインでも書ける
  ...
}
`}</Code>

      <H2>組み込みプロファイル</H2>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="border-b dark:border-zinc-700">
            <tr>
              <th className="py-1">profile</th>
              <th>stale</th>
              <th>revalidate</th>
              <th>expire</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {[
              ["default", "5分", "15分", "無期限"],
              ["seconds", "30秒", "1秒", "1分"],
              ["minutes", "5分", "1分", "1時間"],
              ["hours", "5分", "1時間", "1日"],
              ["days", "5分", "1日", "1週間"],
              ["weeks", "5分", "1週間", "30日"],
              ["max", "5分", "30日", "1年"],
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) => (
                  <td key={i} className="py-1">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Note>
        <p>
          <strong>静的シェルに入るかどうかの境目：</strong>
          <C>revalidate: 0</C> または <C>expire</C> が5分未満、あるいは{" "}
          <C>stale</C>{" "}
          が30秒未満のキャッシュは事前レンダリングされず「動的な穴」になります。
          そのため <C>&lt;Suspense&gt;</C> で囲む必要があります。
          組み込みでは <C>seconds</C> だけがこれに該当します。
        </p>
        <p className="mt-2">
          また <C>stale</C> が30秒以上5分未満のキャッシュ（このページの{" "}
          <C>tenSeconds</C>{" "}
          など）は、直接アクセス時の静的シェルには入りますが、クライアント遷移で即表示される{" "}
          <strong>App Shell</strong>{" "}
          からは除外されます。そのため開発モードの検証で{" "}
          <C>&lt;Suspense&gt;</C> で囲むよう求められます。
        </p>
      </Note>
    </>
  );
}

async function TenSecondsSection() {
  "use cache";
  cacheLife("tenSeconds");
  const { fetchedAt } = await slowFetch("cache-life/tenSeconds", 500);
  return (
    <Demo kind="cached" title="cacheLife('tenSeconds')  … revalidate: 10秒">
      <Stamp label="取得時刻" ts={fetchedAt} />
    </Demo>
  );
}

async function SecondsSection() {
  "use cache";
  cacheLife("seconds");
  const { fetchedAt } = await slowFetch("cache-life/seconds", 500);
  return (
    <Demo kind="cached" title="cacheLife('seconds')  … 動的な穴になる">
      <Stamp label="取得時刻" ts={fetchedAt} />
    </Demo>
  );
}
