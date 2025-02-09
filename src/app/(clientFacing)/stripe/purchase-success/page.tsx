import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import Stripe from "stripe";
import { notFound } from "next/navigation";
import db from "@/db/db";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function successPage({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}) {
  const sp = await searchParams;
  const paymentIntent = await stripe.paymentIntents.retrieve(sp.payment_intent);

  if (paymentIntent.metadata.serviceId == null) return notFound();

  const service = await db.service.findUnique({
    where: { id: paymentIntent.metadata.serviceId },
  });
  if (service == null) return notFound();
  const isSuccess = paymentIntent.status === "succeeded";

  return (
    <>
      <div className="max-w-6xl w-full mx-auto space-y-8">
        <h1 className="font-bold text-3xl">
          {isSuccess ? "Succeded!" : "Failed!"}
        </h1>
        <div className="flex gap-4 items-center">
          <div className="aspect-video shrink-0 w-1/3 relative">
            <Image
              src={service.imagePath}
              alt={service.name}
              width={300}
              height={300}
              className="object-cover"
              priority={true}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <div className="text-lg">
              {formatCurrency(service.priceInCents / 100)}
            </div>
            <p className="line-clamp-3 text-muted-foreground">
              {service.description}
            </p>
            <Button className="mt-4" size="lg" asChild>
              {isSuccess ? (
                <a
                  href={`/services/download/${await createDownloadVerificationId(
                    service.id
                  )}`}
                >
                  Download
                </a>
              ) : (
                <Link href={`/services/${service.id}/purchase`}>Try Again</Link>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

async function createDownloadVerificationId(serviceId: string) {
  return (
    await db.downloadVerification.create({
      data: {
        serviceId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })
  ).id;
}
