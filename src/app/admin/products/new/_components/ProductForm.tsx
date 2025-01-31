"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useActionState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addProduct } from "@/app/_actions/product";
import { useFormStatus } from "react-dom";
import { Product } from "@prisma/client";

export default function ProductForm({ product }: { product?: Product | null }) {
  const [error, action] = useActionState(addProduct, {});
  const [priceInCents, setPriceInCents] = useState<number | undefined>(
    product?.priceInCents
  );
  const formattedPrice = formatCurrency((priceInCents || 0) / 100);

  return (
    <>
      <form action={action} className="space-y-8">
        <div className="flex flex-col ml-2 space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            name="name"
            id="name"
            type="text"
            required
            defaultValue={product?.name || ""}
          />
          {error.name && <div className="destructive">{error.name}</div>}
        </div>

        <div className="flex flex-col ml-2 space-y-2">
          <Label htmlFor="priceInCents">PriceInCents</Label>
          <Input
            name="priceInCents"
            id="priceInCents"
            type="number"
            required
            value={priceInCents ?? ""}
            onChange={(e) =>
              setPriceInCents(Number(e.target.value) || undefined)
            }
          ></Input>
          {error.priceInCents && (
            <div className="destructive">{error.priceInCents}</div>
          )}
        </div>

        <div className="text-muted-foreground ml-2">{formattedPrice}</div>
        <div className="flex flex-col ml-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            name="description"
            id="description"
            defaultValue={product?.description || ""}
            required
          ></Textarea>
          {error.description && (
            <div className="destructive">{error.description}</div>
          )}
        </div>

        <div className="flex flex-col ml-2 space-y-2">
          <Label htmlFor="File">File</Label>
          <Input name="file" id="file" type="file" required={product == null} />
          {error.file && <div className="destructive">{error.file}</div>}
        </div>

        <div className="flex flex-col ml-2 space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            name="image"
            id="image"
            type="file"
            required={product == null}
          />
          {error.image && <div className="destructive">{error.image}</div>}
        </div>

        <SubmitButton />
      </form>
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="ml-2" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
