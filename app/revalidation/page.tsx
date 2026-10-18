import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { listTodos, type Todo } from "@/lib/db";
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
import {
  addWithRevalidateTag,
  addWithUpdateTag,
  addWithoutInvalidation,
  reset,
} from "./actions";

/** タグ 'todos' を付けてキャッシュ。寿命は 'max'（時間では実質切れない）。 */
async function getCachedTodos() {
  "use cache";
  cacheLife("max");
  cacheTag("todos");
  const todos = await listTodos();
  return { todos, cachedAt: Date.now() };
}

export default function RevalidationPage() {
  return (
    <>
      <PageHeader title="4. タグと再検証 — cacheTag / updateTag / revalidateTag">
        <p>
          データを更新したとき、古いキャッシュを捨てる（再検証する）方法です。
          キャッシュに <C>cacheTag(&apos;todos&apos;)</C>{" "}
          で名札を付けておき、Server Action からその名札を指定して無効化します。
        </p>
      </PageHeader>

      <form className="space-y-3 rounded-lg border border-zinc-300 p-4 dark:border-zinc-700">
        <input
          name="title"
          placeholder="追加するTODO"
          className="w-full rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            formAction={addWithUpdateTag}
            className="rounded bg-sky-600 px-3 py-1.5 text-white hover:bg-sky-700"
          >
            A: 追加して updateTag
          </button>
          <button
            formAction={addWithRevalidateTag}
            className="rounded bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
          >
            B: 追加して revalidateTag(&apos;max&apos;)
          </button>
          <button
            formAction={addWithoutInvalidation}
            className="rounded bg-zinc-600 px-3 py-1.5 text-white hover:bg-zinc-700"
          >
            C: 追加のみ（無効化しない）
          </button>
          <button
            formAction={reset}
            className="ml-auto rounded border border-zinc-400 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            リセット
          </button>
        </div>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        <CachedTodos />
        <Suspense
          fallback={<DemoLoading kind="dynamic" title="DB の実際の中身" />}
        >
          <LiveTodos />
        </Suspense>
      </div>

      <H2>観察ポイント</H2>
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>
          <strong>C（無効化しない）</strong>
          ：右の「DBの実際の中身」には追加されますが、左のキャッシュは
          <strong>古いまま</strong>
          です。キャッシュは自動では更新されません。
        </li>
        <li>
          <strong>A（updateTag）</strong>
          ：キャッシュを即座に破棄するので、ボタンを押した直後の画面で左側も最新になります
          （先に C で追加した分も、このタイミングで一緒に反映されます）。
          フォーム送信など「自分の書き込みをすぐ見たい」場面向けです（Server Action 専用）。
        </li>
        <li>
          <strong>B（revalidateTag + &apos;max&apos;）</strong>
          ：キャッシュを「古い」とマークするだけです。次のアクセスでは
          <strong>古い内容を返しつつ裏で作り直し</strong>
          、その次のアクセスで新しくなります。ブログ記事やCMS連携（Route Handler
          からの Webhook）など、多少の遅れが許される場面向けです。
        </li>
      </ul>

      <H2>コード</H2>
      <Code>{`
// データ取得側：タグを付ける
async function getCachedTodos() {
  'use cache'
  cacheLife('max')
  cacheTag('todos')          // ← 名札
  return await db.todo.findMany()
}

// 更新側（'use server' のファイル）
export async function addWithUpdateTag(formData: FormData) {
  await db.todo.create(...)
  updateTag('todos')         // 即時破棄。次の読み込みは新データを待つ
}

export async function addWithRevalidateTag(formData: FormData) {
  await db.todo.create(...)
  revalidateTag('todos', 'max')  // stale にする。次のアクセスで裏で再生成
}
`}</Code>

      <Note>
        <C>revalidateTag(tag)</C>{" "}
        の1引数形式は非推奨です。第2引数にプロファイル（推奨は{" "}
        <C>&apos;max&apos;</C>）を渡します。Route Handler では{" "}
        <C>updateTag</C> は使えないので <C>revalidateTag</C> を使います。
      </Note>
    </>
  );
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul className="list-inside list-disc">
      {todos.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}

async function CachedTodos() {
  const { todos, cachedAt } = await getCachedTodos();
  return (
    <Demo kind="cached" title="キャッシュされた一覧（tag: todos）">
      <TodoList todos={todos} />
      <Stamp label="キャッシュ生成時刻" ts={cachedAt} />
    </Demo>
  );
}

async function LiveTodos() {
  await connection();
  const todos = await listTodos();
  return (
    <Demo kind="dynamic" title="DB の実際の中身（毎回取得）">
      <TodoList todos={todos} />
      <Stamp label="取得時刻" ts={Date.now()} />
    </Demo>
  );
}
