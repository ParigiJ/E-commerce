import { PageHeader } from "@/app/_components/PageHeader";
import ProductForm from "./_components/ProductForm";
export default function NewProduct() {
  return (
    <>
      <div>
        <div className="ml-2">
          <PageHeader>Add Product</PageHeader>
        </div>
        <ProductForm />
      </div>
    </>
  );
}
