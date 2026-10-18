import { Suspense } from "react";
import Link from "next/link";
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

const PRODUCTS: Record<string, string> = {
  "1": "りんご",
  "2": "みかん",
  "3": "ぶどう",
};

/**
 * 引数（id）がキャッシュキーの一部になる。
 * id が違えば別のキャッシュエントリ、同じなら同じエントリが使われる。
 */
async function getProduct(id: string) {
  "use cache";
  cacheLife("hours");
  const { fetchedAt } = await slowFetch(`getProduct(${id})`);
  return { id, name: PRODUCTS[id] ?? "不明な商品", fetchedAt };
}

export default function CacheKeysPage(props: PageProps<"/cache-keys">) {
  return (
    <>
      <PageHeader title="3. キャッシュキー — 引数ごとに別のキャッシュ">
        <p>
          <C>&apos;use cache&apos;</C> 関数の
          <strong>引数（コンポーネントなら props）</strong>
          と、外側のスコープから参照した変数は、自動的にキャッシュキーに含まれます。
        </p>
      </PageHeader>

      <div className="flex gap-2">
        {Object.entries(PRODUCTS).map(([id, name]) => (
          <Link
            key={id}
            href={`/cache-keys?id=${id}`}
            className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            id={id}（{name}）
          </Link>
        ))}
      </div>

      {/* searchParams はリクエスト時の情報なので、読む部分は Suspense の内側に置く */}
      <Suspense
        fallback={<DemoLoading kind="dynamic" title="searchParams を読む部分" />}
      >
        <ProductView searchParams={props.searchParams} />
      </Suspense>

      <H2>観察ポイント</H2>
      <ul className="list-inside list-disc space-y-1 text-sm">
        <li>
          id=1 → id=2 → id=1 と切り替えると、id=1 に戻ったときは
          <strong>最初に表示した時刻のまま</strong>
          です（初回だけ1秒待ち、2回目以降は即表示）。
        </li>
        <li>
          下の2つのカードは同じ <C>getProduct(id)</C>{" "}
          を別々に呼んでいますが、時刻は同じで、ターミナルのログも1回だけです。
          同じ引数の呼び出しは1つのエントリを共有します。
        </li>
      </ul>

      <H2>コード</H2>
      <Code>{`
async function getProduct(id: string) {
  'use cache'                // id がキャッシュキーの一部になる
  cacheLife('hours')
  return await db.product.find(id)
}

export default function Page({ searchParams }: PageProps<'/cache-keys'>) {
  // ページ本体では await しない → ページの大部分を静的シェルにできる
  return (
    <Suspense fallback={<Loading />}>
      <ProductView searchParams={searchParams} />
    </Suspense>
  )
}

async function ProductView({ searchParams }) {
  const { id } = await searchParams   // ← リクエスト時の値（キャッシュの外で読む）
  const product = await getProduct(id) // ← 値を引数で渡す
  ...
}
`}</Code>

      <Note>
        <C>searchParams</C>・<C>cookies()</C>・<C>headers()</C>{" "}
        は <C>&apos;use cache&apos;</C>{" "}
        の<strong>内側では読めません</strong>
        （エラーになります）。外側で読んで、値を引数として渡すのが基本パターンです。
        ページのトップで <C>await searchParams</C>{" "}
        せず、Suspense の内側へ Promise のまま渡すと静的シェルを大きく保てます。
      </Note>
    </>
  );
}

async function ProductView({
  searchParams,
}: Pick<PageProps<"/cache-keys">, "searchParams">) {
  const { id: raw } = await searchParams;
  const id = typeof raw === "string" ? raw : "1";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ProductCard id={id} label="カードA" />
      <ProductCard id={id} label="カードB" />
    </div>
  );
}

async function ProductCard({ id, label }: { id: string; label: string }) {
  const product = await getProduct(id);
  return (
    <Demo kind="cached" title={`${label}: getProduct("${id}")`}>
      <p className="text-lg">{product.name}</p>
      <Stamp label="取得時刻" ts={product.fetchedAt} />
    </Demo>
  );
}
