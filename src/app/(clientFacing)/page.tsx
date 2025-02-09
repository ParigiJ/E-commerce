import { Suspense } from "react";
import { ServiceCardSkeleton, ServiceCard } from "../../components/ServiceCard";
import db from "@/db/db";

export default function Services() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
          </>
        }
      >
        <ServicesOffered />
      </Suspense>
    </div>
  );
}

function getService() {
  return db.service.findMany({
    where: {
      isAvailableForPurchase: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

async function ServicesOffered() {
  const servicesOffered = await getService();

  return servicesOffered.map((serviceOffered) => (
    <ServiceCard key={serviceOffered.id} {...serviceOffered} />
  ));
}
