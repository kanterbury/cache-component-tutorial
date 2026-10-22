// メモリ上の簡易「データベース」。/revalidation ページで使います。
// サーバープロセスを再起動すると初期状態に戻ります。
// （開発サーバーのHMRでモジュールが再評価されても消えないよう globalThis に置いています）

import { sleep } from "./time";

export type Todo = { id: number; title: string };

const INITIAL: Todo[] = [
  { id: 1, title: "Cache Components を有効にする" },
  { id: 2, title: "'use cache' を付けてみる" },
];

const store = globalThis as unknown as { __todos?: Todo[] };

function todos() {
  store.__todos ??= structuredClone(INITIAL);
  return store.__todos;
}

export async function listTodos(): Promise<Todo[]> {
  console.log("🗄️  [db] listTodos() を実行");
  await sleep(500);
  return [...todos()];
}

export async function addTodo(title: string) {
  const list = todos();
  const id = Math.max(0, ...list.map((t) => t.id)) + 1;
  list.push({ id, title });
}

export async function resetTodos() {
  store.__todos = structuredClone(INITIAL);
}
