const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  priceCents: number;
  stock: number;
  images: {
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }[];
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os produtos");
  }

  return response.json();
}