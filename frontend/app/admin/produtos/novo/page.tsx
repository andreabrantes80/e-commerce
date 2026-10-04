"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Category = {
    id: string;
    name: string;
};

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export default function NewProductPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("0");
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");

    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await fetch(`${API_URL}/api/categories`);

                if (!response.ok) {
                    throw new Error("Erro ao carregar categorias.");
                }

                const data = await response.json();
                setCategories(data);

                if (data.length > 0) {
                    setCategoryId(data[0].id);
                }
            } catch (err) {
                console.error(err);
                setError("Não foi possível carregar as categorias.");
            } finally {
                setLoadingCategories(false);
            }
        }

        loadCategories();
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);
        setError("");

        try {
            const priceNumber = Number(
                price.replace(/\./g, "").replace(",", ".")
            );

            const priceCents = Math.round(priceNumber * 100);
            const stockNumber = Number(stock);

            if (!name.trim()) {
                throw new Error("Informe o nome do produto.");
            }

            if (!sku.trim()) {
                throw new Error("Informe o SKU.");
            }

            if (!Number.isFinite(priceCents) || priceCents <= 0) {
                throw new Error("Informe um preço válido.");
            }

            if (!Number.isInteger(stockNumber) || stockNumber < 0) {
                throw new Error("Informe um estoque válido.");
            }

            if (!categoryId) {
                throw new Error("Selecione uma categoria.");
            }

            const images = imageUrl.trim()
                ? [
                    {
                        url: imageUrl.trim(),
                        alt: imageAlt.trim() || name.trim(),
                    },
                ]
                : [];

            const response = await fetch(`${API_URL}/api/admin/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    sku: sku.trim(),
                    description: description.trim() || undefined,
                    priceCents,
                    stock: stockNumber,
                    categoryId,
                    images,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ?? "Não foi possível cadastrar o produto."
                );
            }

            window.location.href = "/admin/produtos";
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao cadastrar produto."
            );
        } finally {
            setSaving(false);
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
                            href="/admin/produtos"
                            className="text-sm font-medium text-neutral-600 hover:text-black"
                        >
                            Produtos
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

            <div className="mx-auto max-w-4xl px-6 py-10">
                <div className="mb-8">
                    <p className="text-sm font-medium text-neutral-500">
                        Administração / Produtos
                    </p>

                    <h2 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
                        Novo produto
                    </h2>

                    <p className="mt-2 text-neutral-600">
                        Cadastre um novo produto para a GJ TECH MODA FEMININA.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-neutral-900">
                            Informações do produto
                        </h3>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-neutral-700">
                                    Nome do produto *
                                </label>

                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Ex.: Vestido Midi Elegance"
                                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700">
                                    SKU *
                                </label>

                                <input
                                    value={sku}
                                    onChange={(event) =>
                                        setSku(event.target.value.toUpperCase())
                                    }
                                    placeholder="Ex.: VEST-MIDI-002"
                                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 uppercase outline-none transition focus:border-neutral-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700">
                                    Categoria *
                                </label>

                                <select
                                    value={categoryId}
                                    onChange={(event) =>
                                        setCategoryId(event.target.value)
                                    }
                                    disabled={
                                        loadingCategories || categories.length === 0
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-900"
                                    required
                                >
                                    {loadingCategories ? (
                                        <option>Carregando categorias...</option>
                                    ) : categories.length === 0 ? (
                                        <option>Nenhuma categoria cadastrada</option>
                                    ) : (
                                        categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-neutral-700">
                                    Descrição
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    placeholder="Descreva o produto..."
                                    rows={5}
                                    className="mt-2 w-full resize-none rounded-xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-neutral-900">
                            Preço e estoque
                        </h3>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-neutral-700">
                                    Preço *
                                </label>

                                <div className="relative mt-2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                                        R$
                                    </span>

                                    <input
                                        value={price}
                                        onChange={(event) =>
                                            setPrice(event.target.value)
                                        }
                                        placeholder="149,90"
                                        inputMode="decimal"
                                        className="w-full rounded-xl border border-neutral-300 py-3 pl-11 pr-4 outline-none transition focus:border-neutral-900"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700">
                                    Estoque *
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={stock}
                                    onChange={(event) =>
                                        setStock(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-neutral-900">
                            Imagem do produto
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            Por enquanto, informe a URL da imagem. O upload de
                            arquivos será adicionado posteriormente.
                        </p>

                        <div className="mt-6 space-y-6">
                            <div>
                                <label className="text-sm font-medium text-neutral-700">
                                    URL da imagem
                                </label>

                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(event) =>
                                        setImageUrl(event.target.value)
                                    }
                                    placeholder="https://..."
                                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700">
                                    Texto alternativo
                                </label>

                                <input
                                    value={imageAlt}
                                    onChange={(event) =>
                                        setImageAlt(event.target.value)
                                    }
                                    placeholder="Ex.: Vestido midi preto"
                                    className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/admin/produtos"
                            className="rounded-xl border border-neutral-300 bg-white px-6 py-3 text-center text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={saving || loadingCategories}
                            className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Salvando..." : "Cadastrar produto"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}