import { PageHeader } from "@/app/_components/PageHeader";
import ServiceForm from "../_components/ServiceForm";
export default function Service() {
  return (
    <>
      <div>
        <div className="ml-2">
          <PageHeader>Add Service</PageHeader>
        </div>
        <ServiceForm />
      </div>
    </>
  );
}
