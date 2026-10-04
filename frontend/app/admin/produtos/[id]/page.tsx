"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type Category = {
    id: string;
    name: string;
};

type ProductImage = {
    id: string;
    url: string;
    alt: string | null;
};

type Product = {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    priceCents: number;
    stock: number;
    active: boolean;
    categoryId: string | null;
    category: Category | null;
    images: ProductImage[];
};

export default function EditarProdutoPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [active, setActive] = useState(true);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [productResponse, categoriesResponse] = await Promise.all([
                    fetch(`${API_URL}/api/admin/products/${id}`),
                    fetch(`${API_URL}/api/categories`),
                ]);

                if (!productResponse.ok) {
                    throw new Error("Produto não encontrado.");
                }

                if (!categoriesResponse.ok) {
                    throw new Error("Não foi possível carregar as categorias.");
                }

                const productData: Product = await productResponse.json();
                const categoriesData: Category[] =
                    await categoriesResponse.json();

                setProduct(productData);
                setCategories(categoriesData);

                setName(productData.name);
                setSku(productData.sku);
                setDescription(productData.description ?? "");
                setPrice((productData.priceCents / 100).toFixed(2).replace(".", ","));
                setStock(String(productData.stock));
                setCategoryId(productData.categoryId ?? "");
                setActive(productData.active);

                if (productData.images.length > 0) {
                    setImageUrl(productData.images[0].url);
                    setImageAlt(productData.images[0].alt ?? "");
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Erro ao carregar produto."
                );
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [id]);

    function convertPriceToCents(value: string) {
        const normalized = value
            .replace(/\./g, "")
            .replace(",", ".")
            .trim();

        const numeric = Number(normalized);

        if (!Number.isFinite(numeric)) {
            return 0;
        }

        return Math.round(numeric * 100);
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setSaving(true);
        setError("");

        try {
            const priceCents = convertPriceToCents(price);

            if (!name.trim()) {
                throw new Error("Informe o nome do produto.");
            }

            if (!sku.trim()) {
                throw new Error("Informe o SKU.");
            }

            if (priceCents <= 0) {
                throw new Error("Informe um preço válido.");
            }

            const response = await fetch(
                `${API_URL}/api/admin/products/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        sku: sku.trim(),
                        description: description.trim() || null,
                        priceCents,
                        stock: Number(stock),
                        categoryId: categoryId || null,
                        active,
                        images: imageUrl.trim()
                            ? [
                                {
                                    url: imageUrl.trim(),
                                    alt: imageAlt.trim() || null,
                                },
                            ]
                            : [],
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Não foi possível atualizar o produto."
                );
            }

            router.push("/admin/produtos");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao atualizar produto."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-50 p-8">
                <div className="mx-auto max-w-5xl">
                    <p className="text-neutral-500">Carregando produto...</p>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-neutral-50 p-8">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        Produto não encontrado
                    </h1>

                    <Link
                        href="/admin/produtos"
                        className="mt-6 inline-block rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
                    >
                        Voltar para produtos
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <Link
                        href="/admin/produtos"
                        className="text-sm text-neutral-500 hover:text-neutral-900"
                    >
                        ← Voltar para produtos
                    </Link>

                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-neutral-900">
                                Editar produto
                            </h1>

                            <p className="mt-1 text-sm text-neutral-500">
                                Atualize as informações de {product.name}.
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-neutral-200 text-neutral-600"
                                }`}
                        >
                            {active ? "Ativo" : "Inativo"}
                        </span>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                Nome do produto
                            </label>

                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                                placeholder="Ex.: Vestido Midi Elegance"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                SKU
                            </label>

                            <input
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                                placeholder="VEST-MIDI-001"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                Categoria
                            </label>

                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
                            >
                                <option value="">Sem categoria</option>

                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                Preço
                            </label>

                            <input
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                                placeholder="149,90"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                Estoque
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                Descrição
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                                placeholder="Descrição do produto..."
                            />
                        </div>

                        <div className="md:col-span-2 border-t border-neutral-200 pt-6">
                            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
                                Imagem principal
                            </h2>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                URL da imagem
                            </label>

                            <input
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                Texto alternativo
                            </label>

                            <input
                                value={imageAlt}
                                onChange={(e) => setImageAlt(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
                                placeholder="Vestido midi feminino"
                            />
                        </div>

                        <div className="md:col-span-2 border-t border-neutral-200 pt-6">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={(e) => setActive(e.target.checked)}
                                    className="h-4 w-4"
                                />

                                <span className="text-sm font-medium text-neutral-700">
                                    Produto ativo na loja
                                </span>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-3">
                        <Link
                            href="/admin/produtos"
                            className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}