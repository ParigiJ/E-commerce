"use client";

import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { useState, useActionState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { Textarea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { addService, updateService } from "@/app/admin/_actions/service";
import { useFormStatus } from "react-dom";
import { Service } from "@prisma/client";
import Image from "next/image";

export default function ServiceForm({ service }: { service?: Service | null }) {
  const [error, action] = useActionState(
    service == null ? addService : updateService.bind(null, service.id),
    {}
  );
  const [priceInCents, setPriceInCents] = useState<number | undefined>(
    service?.priceInCents
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
            defaultValue={service?.name || ""}
          />
          {error.name && <div className="text-red-500">{error.name}</div>}
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
            <div className="text-red-500">{error.priceInCents}</div>
          )}
        </div>

        <div className="text-muted-foreground ml-2">{formattedPrice}</div>
        <div className="flex flex-col ml-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            name="description"
            id="description"
            defaultValue={service?.description || ""}
            required
          ></Textarea>
          {error.description && (
            <div className="text-red-500">{error.description}</div>
          )}
        </div>

        <div className="flex flex-col ml-2 space-y-2">
          <Label htmlFor="File">File</Label>
          <Input name="file" id="file" type="file" required={service == null} />
          {error.file && <div className="text-red-500">{error.file}</div>}
        </div>

        <div className="flex flex-col ml-2 space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            name="image"
            id="image"
            type="file"
            required={service == null}
          />
          {service != null && (
            <Image
              src={service.imagePath}
              width={400}
              height={400}
              alt="Service Image"
            />
          )}
          {error.image && <div className="text-red-500">{error.image}</div>}
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
