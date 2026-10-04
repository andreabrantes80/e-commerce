import type { Product } from "@/lib/api";

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];

  return (
    <article className="group overflow-hidden rounded-2xl bg-white">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {image?.url ? (
          <img
            src={image.url}
            alt={image.alt ?? product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
              GJ TECH
            </span>
          </div>
        )}

        {product.stock <= 0 && (
          <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold">
            Esgotado
          </div>
        )}
      </div>

      <div className="px-1 pb-2 pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
          {product.category?.name ?? "Moda feminina"}
        </p>

        <h2 className="mt-2 text-base font-semibold text-neutral-900">
          {product.name}
        </h2>

        <p className="mt-2 text-lg font-bold text-neutral-900">
          {formatBRL(product.priceCents)}
        </p>

        {product.stock > 0 && (
          <p className="mt-1 text-xs text-neutral-500">
            Disponível em estoque
          </p>
        )}
      </div>
    </article>
  );
}