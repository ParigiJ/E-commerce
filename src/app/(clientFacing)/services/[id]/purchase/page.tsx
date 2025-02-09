import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import Checkoutform from "./_components/CheckoutForm";

if (process.env.STRIPE_SECRET_KEY === null) {
  throw new Error("Missing env.NEXT_PUBLIC_STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const service = await db.service.findUnique({
    where: { id },
    select: {
      name: true,
      id: true,
      priceInCents: true,
      imagePath: true,
      description: true,
    },
  });
  if (!service) {
    return notFound();
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: service.priceInCents,
    currency: "USD",
    metadata: { serviceId: service.id },
  });

  if (paymentIntent.client_secret == null) {
    throw new Error("Failed to create payment intent");
  }

  return (
    <Checkoutform
      service={service}
      clientSecret={paymentIntent.client_secret}
    />
  );
};

export default page;
