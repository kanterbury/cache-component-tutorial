# Cache Components チュートリアル

Next.js 16 の **Cache Components**（`cacheComponents: true`）の仕組みを、動かしながら理解するためのサンプルアプリです。
各デモには「生成時刻」が表示されるので、リロードやボタン操作で **どの時刻が変わり、どれが変わらないか** を観察します。

## 起動

挙動を正しく観察するには **本番モード** を使ってください（開発モードでは毎回レンダリングされる部分が多いため）。

```bash
npm install
npm run build   # ルートごとの種類（○ Static / ◐ Partial Prerender）と Revalidate/Expire が表示される
npm run start   # http://localhost:3000
```

サーバーのターミナルに `🐢 [slowFetch] ...` が出たら実際にデータ取得が走った（キャッシュミス）、出なければキャッシュが使われています。

## レッスン

| パス | テーマ | 主なAPI |
| --- | --- | --- |
| `/basics` | 静的・キャッシュ・動的の違いと静的シェル（PPR） | `'use cache'`, `<Suspense>`, `connection()` |
| `/cache-life` | キャッシュの寿命と stale-while-revalidate | `cacheLife()`, `next.config.ts` の `cacheLife` |
| `/cache-keys` | 引数がキャッシュキーになる | `searchParams` を外で読んで引数で渡す |
| `/revalidation` | タグによる無効化の違い | `cacheTag`, `updateTag`, `revalidateTag(tag, 'max')`, `refresh` |
| `/runtime-data` | cookies を扱う3パターン | `cookies()`, `'use cache: private'` |
| `/interleaving` | キャッシュされた枠に動的な children を差し込む | `children` スロット |

## ファイル構成

```
app/
  _components/ui.tsx     共通UI（Demo / Stamp など）
  basics/                レッスン1
  cache-life/            レッスン2
  cache-keys/            レッスン3
  revalidation/          レッスン4（actions.ts に Server Actions）
  runtime-data/          レッスン5（actions.ts で cookie を切り替え）
  interleaving/          レッスン6
lib/
  time.ts                時刻整形と、遅いAPIを模した slowFetch()
  db.ts                  メモリ上の簡易DB（サーバー再起動で初期化）
next.config.ts           cacheComponents 有効化 + カスタムプロファイル tenSeconds
```

## 参考

API の詳細は `node_modules/next/dist/docs/01-app/` 以下の同梱ドキュメント
（`01-getting-started/08-caching.md`, `03-api-reference/01-directives/use-cache.md` など）を参照してください。
