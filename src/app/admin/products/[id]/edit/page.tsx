import { PageHeader } from "@/app/_components/PageHeader";
import ProductForm from "../../new/_components/ProductForm";
import db from "@/db/db";
export default async function EditProductPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product = await db.product.findUnique({ where: { id } });
  return (
    <>
      <div>
        <div className="ml-2">
          <PageHeader>Edit Product</PageHeader>
        </div>
        <ProductForm product={product} />
      </div>
    </>
  );
}
