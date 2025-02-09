import { PageHeader } from "@/app/_components/PageHeader";
import ServiceForm from "../../_components/ServiceForm";
import db from "@/db/db";
export default async function EditServicePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const service = await db.service.findUnique({ where: { id } });
  return (
    <>
      <div>
        <div className="ml-2">
          <PageHeader>Edit Service</PageHeader>
        </div>
        <ServiceForm service={service} />
      </div>
    </>
  );
}
