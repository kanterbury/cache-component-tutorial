import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // カスタムの cacheLife プロファイル（/cache-life ページで使用）
  // 「10秒たったら裏で作り直す」を観察しやすくするための短い設定
  cacheLife: {
    tenSeconds: {
      stale: 30, // クライアント（ブラウザのルーターキャッシュ）が再確認せずに使える時間
      revalidate: 10, // この時間を過ぎた後のリクエストで、裏で再生成（stale-while-revalidate）
      expire: 3600, // アクセスが無いままこの時間を過ぎたら、次のリクエストは再生成を待つ
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
