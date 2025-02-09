import { Button } from "@/components/ui/Button";
import db from "@/db/db";
import { Service } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ServiceCard, ServiceCardSkeleton } from "@/components/ServiceCard";
import { Suspense } from "react";
import { cache } from "@/lib/cache";

const getNewServices = cache(
  () => {
    return db.service.findMany({
      where: {
        isAvailableForPurchase: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });
  },
  ["/", "getNewServices"],
  { revalidate: 60 * 60 * 24 }
);

const getPopularServices = cache(
  () => {
    return db.service.findMany({
      where: {
        isAvailableForPurchase: true,
      },
      orderBy: {
        orders: {
          _count: "desc",
        },
      },
    });
  },
  ["/", "getPopularServices"],
  { revalidate: 60 * 60 * 24 }
);

type ServiceGridSectionProps = {
  title: string;
  serviceFetcher: () => Promise<Service[]>;
};

async function ServiceGridSection({
  title,
  serviceFetcher,
}: ServiceGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" className="bg-black text-white" asChild>
          <Link href="/services" className="space-x-2">
            <span>View All</span>
            <ArrowRight />
          </Link>
        </Button>
      </div>
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
          <GetService serviceFetcher={serviceFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function GetService({
  serviceFetcher,
}: {
  serviceFetcher: () => Promise<Service[]>;
}) {
  return (await serviceFetcher()).map((service) => (
    <ServiceCard key={service.id} {...service} />
  ));
}

export default function HomePage() {
  return (
    <>
      <main className="space-y-12">
        <ServiceGridSection
          title="New Services"
          serviceFetcher={getNewServices}
        />
        <ServiceGridSection
          title="Popular Services"
          serviceFetcher={getPopularServices}
        />
      </main>
    </>
  );
}
