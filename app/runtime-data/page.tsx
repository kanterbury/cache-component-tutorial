import { Suspense } from "react";
import { cookies } from "next/headers";
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
import { switchUser } from "./actions";

const USERS = ["alice", "bob", "guest"];

async function currentUser() {
  return (await cookies()).get("demo-user")?.value ?? "guest";
}

export default function RuntimeDataPage() {
  return (
    <>
      <PageHeader title="5. cookies とキャッシュ">
        <p>
          <C>cookies()</C>・<C>headers()</C>・<C>searchParams</C>{" "}
          のような<strong>リクエストごとの情報</strong>
          を扱う3つの方法を比べます。cookie の <C>demo-user</C>{" "}
          を切り替えて違いを見てください。
        </p>
      </PageHeader>

      <form action={switchUser} className="flex flex-wrap gap-2 text-sm">
        {USERS.map((u) => (
          <button
            key={u}
            name="user"
            value={u}
            className="rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {u} に切り替え
          </button>
        ))}
      </form>

      <Suspense fallback={<DemoLoading kind="dynamic" title="① 直接読む" />}>
        <DirectSection />
      </Suspense>

      <Suspense
        fallback={<DemoLoading kind="cached" title="② 外で読んで引数で渡す" />}
      >
        <ArgumentSection />
      </Suspense>

      <Suspense
        fallback={<DemoLoading kind="private" title="③ 'use cache: private'" />}
      >
        <PrivateSection />
      </Suspense>

      <H2>観察ポイント</H2>
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>
          ① は毎回1秒待って新しい時刻になります。キャッシュなし。
        </li>
        <li>
          ② は alice → bob → alice と切り替えると、alice に戻ったとき
          <strong>以前の時刻のまま</strong>
          です。ユーザー名が<strong>キャッシュキー</strong>
          になり、サーバーのキャッシュに保存されています。
        </li>
        <li>
          ③ は関数の中で直接 cookie を読めます。本番では結果を
          <strong>サーバーのキャッシュには保存せず</strong>
          （リクエストをまたいで共有しない）、ブラウザのルーターキャッシュと
          プリフェッチにだけ載ります。そのためブラウザでリロードすると再実行されます。
          開発モードではサーバーのメモリにも保持されるので挙動が異なります。
        </li>
      </ul>

      <H2>コード</H2>
      <Code>{`
// ① 直接読む（キャッシュなし）→ Suspense 必須
async function DirectSection() {
  const user = (await cookies()).get('demo-user')?.value
  await connection()   // 毎リクエスト実行したい処理（Date.now() など）の前に必要
  const data = await fetchSomething(user)
}

// ② 推奨パターン：キャッシュの外で読み、値を引数で渡す
async function ArgumentSection() {
  const user = (await cookies()).get('demo-user')?.value
  return <CachedProfile user={user} />
}
async function CachedProfile({ user }: { user: string }) {
  'use cache'                // user がキャッシュキーになる
  cacheLife('hours')
  ...
}

// ③ 'use cache: private'：中で cookies() を読める
async function getRecommendations() {
  'use cache: private'
  cacheLife({ stale: 60 })
  const user = (await cookies()).get('demo-user')?.value
  ...
}
`}</Code>

      <Note>
        <p className="mb-2">
          <strong>① で connection() が必要な理由：</strong>
          Partial Prefetching が有効だと、<C>cookies()</C>・<C>headers()</C>{" "}
          を読む部分は「セッション単位のデータ」として、リンクのプリフェッチ時にも事前レンダリングされます。
          そのため cookie を読んだだけでは「毎リクエスト実行」とはみなされず、
          後続の <C>Date.now()</C>{" "}
          が開発モードでエラーになります。リクエストごとに実行したい処理の前には{" "}
          <C>await connection()</C> を置きます。
        </p>
        通常の <C>&apos;use cache&apos;</C> の中で <C>cookies()</C>{" "}
        を呼ぶとエラーになります。基本は ② のパターンを使い、
        リファクタリングが難しい場合やコンプライアンス上サーバーに個人データを保存したくない場合に
        ③ を検討します。
      </Note>
    </>
  );
}

async function DirectSection() {
  const user = await currentUser();
  // cookies() だけだと「セッション単位のデータ」としてプリフェッチ時にも事前レンダリングされ得る。
  // リクエストごとに必ず実行したいので connection() で明示する。
  await connection();
  const { fetchedAt } = await slowFetch(`runtime/direct(${user})`);
  return (
    <Demo kind="dynamic" title="① cookies() を直接読む（キャッシュなし）">
      <p>
        ユーザー: <strong>{user}</strong>
      </p>
      <Stamp label="取得時刻" ts={fetchedAt} />
    </Demo>
  );
}

async function ArgumentSection() {
  const user = await currentUser(); // キャッシュの外で読む
  return <CachedProfile user={user} />;
}

async function CachedProfile({ user }: { user: string }) {
  "use cache";
  cacheLife("hours");
  const { fetchedAt } = await slowFetch(`runtime/cached(${user})`);
  return (
    <Demo kind="cached" title="② 外で読んで引数で渡す（'use cache'）">
      <p>
        ユーザー: <strong>{user}</strong>（キャッシュキーの一部）
      </p>
      <Stamp label="取得時刻" ts={fetchedAt} />
    </Demo>
  );
}

async function getRecommendations() {
  "use cache: private";
  cacheLife({ stale: 60 });
  const user = await currentUser(); // private なら中で読める
  const { fetchedAt } = await slowFetch(`runtime/private(${user})`);
  return { user, fetchedAt };
}

async function PrivateSection() {
  const { user, fetchedAt } = await getRecommendations();
  return (
    <Demo kind="private" title="③ 'use cache: private' の中で cookies() を読む">
      <p>
        ユーザー: <strong>{user}</strong>
      </p>
      <Stamp label="取得時刻" ts={fetchedAt} />
    </Demo>
  );
}
