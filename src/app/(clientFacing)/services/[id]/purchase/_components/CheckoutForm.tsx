"use client";

import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";
import { FormEvent, useState } from "react";
import useOrderExists from "@/app/actions/orders";
import Loading from "@/app/admin/loading";

type CheckoutFormProps = {
  service: {
    id: string;
    description: string;
    priceInCents: number;
    imagePath: string;
    name: string;
  };
  clientSecret: string;
};

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const CheckoutForm = ({ service, clientSecret }: CheckoutFormProps) => {
  if (!stripePromise) {
    return <Loading />;
  }
  return (
    <>
      <div className="max-w-6xl w-full mx-aut0 space-y-8">
        <div className="flex gap-4 items-center">
          <div className="aspect-video shrink-0 w-1/3 relative">
            <Image
              src={service.imagePath}
              alt={service.name}
              fill
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
          </div>
        </div>
        <Elements options={{ clientSecret }} stripe={stripePromise}>
          <Form priceInCents={service.priceInCents} serviceId={service.id} />
        </Elements>
      </div>
    </>
  );
};

const Form = ({
  priceInCents,
  serviceId,
}: {
  priceInCents: number;
  serviceId: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState<string>();

  if (stripe == null || elements == null) {
    return <Loading />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !email) {
      return;
    }
    setIsLoading(true);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const orderExists = await useOrderExists(email, serviceId);

    if (orderExists) {
      setErrorMessage(
        "You have already purchased this service, please check My Orders page"
      );
      setIsLoading(false);
      return;
    }

    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unkown error occured");
          console.log(error);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        {errorMessage && (
          <CardDescription className="text-destructive">
            {errorMessage}
          </CardDescription>
        )}
        <CardContent>
          <PaymentElement />
          <div className="mt-4">
            <LinkAuthenticationElement
              onChange={(e) => {
                setEmail(e.value.email);
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={stripe == null || elements == null || isLoading}
          >
            {isLoading
              ? "Purchasing..."
              : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CheckoutForm;
