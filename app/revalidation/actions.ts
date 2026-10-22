"use server";

import { refresh, revalidateTag, updateTag } from "next/cache";
import { addTodo, resetTodos } from "@/lib/db";

function titleOf(formData: FormData) {
  return String(formData.get("title") ?? "").trim() || "（無題）";
}

/** A: updateTag … キャッシュを即座に破棄。直後の表示で必ず新しいデータになる（read-your-own-writes） */
export async function addWithUpdateTag(formData: FormData) {
  await addTodo(`${titleOf(formData)}  ← updateTag`);
  updateTag("todos");
}

/** B: revalidateTag(tag, 'max') … 古い（stale）とマークするだけ。次のアクセスで裏で作り直す */
export async function addWithRevalidateTag(formData: FormData) {
  await addTodo(`${titleOf(formData)}  ← revalidateTag`);
  revalidateTag("todos", "max");
}

/** C: 無効化しない … DB は変わるが、キャッシュは古いまま（画面だけ再取得させる） */
export async function addWithoutInvalidation(formData: FormData) {
  await addTodo(`${titleOf(formData)}  ← 無効化なし`);
  refresh();
}

export async function reset() {
  await resetTodos();
  updateTag("todos");
}
