import { getProducts, type Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

const categories = [
  "Vestidos",
  "Blusas",
  "Calças",
  "Shorts",
  "Saias",
  "Conjuntos",
  "Bolsas",
  "Acessórios",
];

export default async function HomePage() {
  let products: Product[] = [];
  let apiError = false;

  try {
    products = await getProducts();
  } catch {
    apiError = true;
  }

  const featuredProducts = products.slice(0, 8);

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      {/* TOP BAR */}
      <div className="bg-neutral-900 px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
        Frete especial para pedidos selecionados • Compre online com segurança
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-[#faf9f7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <a href="/" className="min-w-fit">
            <div className="text-xl font-black tracking-tight">
              GJ TECH
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Moda Feminina
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            <a href="/" className="hover:text-neutral-500">
              Início
            </a>
            <a href="#roupas" className="hover:text-neutral-500">
              Roupas
            </a>
            <a href="#acessorios" className="hover:text-neutral-500">
              Acessórios
            </a>
            <a href="#novidades" className="hover:text-neutral-500">
              Novidades
            </a>
            <a href="#ofertas" className="font-semibold hover:text-neutral-500">
              Ofertas
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              aria-label="Buscar"
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-200 sm:flex"
            >
              <span className="text-lg">⌕</span>
            </button>

            <button
              aria-label="Minha conta"
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-200 sm:flex"
            >
              <span className="text-lg">♙</span>
            </button>

            <button className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700">
              🛒 <span className="hidden sm:inline">Carrinho</span> (0)
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className="flex gap-5 overflow-x-auto border-t border-neutral-200 px-5 py-3 text-xs font-medium lg:hidden">
          {categories.map((category) => (
            <a
              key={category}
              href="#categorias"
              className="whitespace-nowrap text-neutral-700"
            >
              {category}
            </a>
          ))}
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 pt-6 lg:px-8 lg:pt-8">
        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-neutral-200">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

          <div className="relative flex min-h-[520px] max-w-2xl flex-col justify-center px-7 py-16 text-white sm:px-12 lg:px-16">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              Nova coleção
            </p>

            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Seu estilo.
              <br />
              Sua essência.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
              Descubra roupas e acessórios pensados para valorizar o seu estilo
              em todos os momentos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#novidades"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-neutral-900 transition hover:bg-neutral-200"
              >
                Comprar novidades
              </a>

              <a
                href="#categorias"
                className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Ver categorias
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        id="categorias"
        className="mx-auto max-w-7xl px-5 py-16 lg:px-8"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Explore
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Categorias
            </h2>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <a
              key={category}
              href="#novidades"
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm font-semibold transition hover:-translate-y-1 hover:shadow-md"
            >
              {category}
            </a>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section
        id="novidades"
        className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
              GJ TECH MODA FEMININA
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Novidades
            </h2>
          </div>

          <a
            href="#"
            className="hidden text-sm font-semibold underline underline-offset-4 sm:block"
          >
            Ver todos
          </a>
        </div>

        <div className="mt-8">
          {apiError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
              <p className="font-bold">Não foi possível carregar os produtos.</p>
              <p className="mt-1">
                Verifique se o backend está funcionando em{" "}
                <code className="rounded bg-amber-100 px-1.5 py-0.5">
                  localhost:3001
                </code>
                .
              </p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
              <p className="text-lg font-bold">
                Em breve, novidades para você.
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                Os produtos cadastrados no painel aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BANNER */}
      <section
        id="ofertas"
        className="border-y border-neutral-200 bg-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-5 py-16 text-center sm:flex-row sm:text-left lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
              Seleção especial
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Ofertas para renovar seu guarda-roupa.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
              Encontre peças selecionadas com condições especiais por tempo
              limitado.
            </p>
          </div>

          <a
            href="#novidades"
            className="whitespace-nowrap rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-700"
          >
            Ver ofertas
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="text-xl font-black">GJ TECH</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
              Moda Feminina
            </div>

            <p className="mt-5 text-sm leading-6 text-neutral-400">
              Moda feminina e acessórios para deixar seu estilo ainda mais
              especial.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold">Atendimento</h3>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <p>Fale conosco</p>
              <p>Trocas e devoluções</p>
              <p>Formas de pagamento</p>
            </div>
          </div>

          <div id="acessorios">
            <h3 className="text-sm font-bold">Categorias</h3>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <p>Roupas</p>
              <p>Bolsas</p>
              <p>Calçados</p>
              <p>Acessórios</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold">GJ TECH MODA FEMININA</h3>
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              Uma nova experiência de compra está chegando.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} GJ TECH MODA FEMININA. Todos os direitos
          reservados.
        </div>
      </footer>
    </main>
  );
}