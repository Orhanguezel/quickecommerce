import type { Product } from "@/modules/product/product.type";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "./section-header";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
}: ProductSectionProps) {
  if (!products.length) return null;

  return (
    <section>
      <SectionHeader title={title} subtitle={subtitle} viewAllHref={viewAllHref} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
