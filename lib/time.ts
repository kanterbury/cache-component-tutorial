// 時刻表示用のユーティリティ。
// 「いつ生成された結果なのか」を画面で見比べることが、このチュートリアルの観察方法です。

export function formatTime(ts: number) {
  const hms = new Date(ts).toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour12: false,
  });
  return `${hms}.${String(ts % 1000).padStart(3, "0")}`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 遅い外部API / DB を模したデータ取得。
 * 呼ばれるたびにサーバーのターミナルへログを出すので、
 * 「キャッシュヒットした（＝ログが出ない）」「キャッシュミスした（＝ログが出る）」が分かります。
 */
export async function slowFetch(label: string, ms = 1000) {
  console.log(`🐢 [slowFetch] ${label} を取得中...（${ms}ms）`);
  await sleep(ms);
  return { fetchedAt: Date.now() };
}
