"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProductImage = {
    id: string;
    url: string;
    alt: string | null;
    position: number;
};

type Category = {
    id: string;
    name: string;
    slug: string;
};

type Product = {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    priceCents: number;
    stock: number;
    active: boolean;
    category: Category | null;
    images: ProductImage[];
};

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

function formatPrice(priceCents: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(priceCents / 100);
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadProducts() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/api/products`);

            if (!response.ok) {
                throw new Error("Não foi possível carregar os produtos.");
            }

            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
            setError(
                "Não foi possível conectar à API. Verifique se o backend está rodando."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    async function handleDelete(product: Product) {
        const confirmed = window.confirm(
            `Tem certeza que deseja excluir o produto "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `${API_URL}/api/admin/products/${product.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Não foi possível excluir o produto."
                );
            }

            await loadProducts();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao excluir produto."
            );
        }
    }

    return (
        <main className="min-h-screen bg-neutral-100">
            <header className="border-b border-neutral-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                            GJ TECH
                        </p>

                        <h1 className="text-xl font-semibold text-neutral-900">
                            MODA FEMININA
                        </h1>
                    </div>

                    <div className="flex items-center gap-5">
                        <Link
                            href="/admin"
                            className="text-sm font-medium text-neutral-600 hover:text-black"
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/"
                            className="text-sm font-medium text-neutral-600 hover:text-black"
                        >
                            Loja
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-neutral-500">
                            Administração
                        </p>

                        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
                            Produtos
                        </h2>

                        <p className="mt-2 text-neutral-600">
                            Gerencie os produtos cadastrados na GJ TECH MODA FEMININA.
                        </p>
                    </div>

                    <Link
                        href="/admin/produtos/novo"
                        className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                        + Novo produto
                    </Link>
                </div>

                {loading && (
                    <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                        Carregando produtos...
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="border-b border-neutral-200 bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Produto
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            SKU
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Categoria
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Preço
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Estoque
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-neutral-100">
                                    {products.map((product) => {
                                        const image = product.images?.[0];

                                        return (
                                            <tr
                                                key={product.id}
                                                className="transition hover:bg-neutral-50"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        {image ? (
                                                            <img
                                                                src={image.url}
                                                                alt={image.alt ?? product.name}
                                                                className="h-16 w-12 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
                                                                Sem foto
                                                            </div>
                                                        )}

                                                        <div>
                                                            <p className="font-semibold text-neutral-900">
                                                                {product.name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-neutral-500">
                                                                /{product.slug}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-neutral-600">
                                                    {product.sku}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-neutral-600">
                                                    {product.category?.name ?? "Sem categoria"}
                                                </td>

                                                <td className="px-6 py-5 text-sm font-semibold text-neutral-900">
                                                    {formatPrice(product.priceCents)}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-neutral-600">
                                                    {product.stock}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-neutral-100 text-neutral-500"
                                                            }`}
                                                    >
                                                        {product.active ? "Ativo" : "Inativo"}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/admin/produtos/${product.id}`}
                                                            className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                                                        >
                                                            Editar
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(product)}
                                                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {products.length === 0 && (
                            <div className="p-12 text-center text-neutral-500">
                                Nenhum produto cadastrado.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}