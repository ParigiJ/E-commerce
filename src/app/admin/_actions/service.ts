"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, { message: "File is required" });

const imageSchema = fileSchema
  .refine(
    (file) => file.type.startsWith("image/"),
    "only image files are allowed "
  )
  .refine((file) => file.size > 0, "Image is required");

const addSchema = z.object({
  name: z.string().min(1),
  priceInCents: z.coerce.number().int().gt(0),
  description: z.string().min(1),
  file: fileSchema.refine((file) => file.size > 0, "File is required"),
  image: imageSchema,
});

const editImageSchema = fileSchema
  .refine(
    (file) => file.size === 0 || file.type.startsWith("image/"),
    "only image files are allowed"
  )
  .optional();

const editSchema = z.object({
  name: z.string().min(1),
  priceInCents: z
    .string()
    .transform((val) => Math.round(Number(val)))
    .pipe(z.number().int().gt(0)),
  description: z.string().min(1),
  file: fileSchema.optional(),
  image: editImageSchema,
});

export async function updateService(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  console.log(formData);
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  } else {
    const data = result.data;
    const service = await db.service.findUnique({ where: { id } });

    if (service == null) return notFound();

    let filePath = service.filePath;
    if (data.file != null && data.file.size > 0) {
      await fs.unlink(service.filePath);
      const filePath = `services/${crypto.randomUUID}-${data.file.name}`;
      await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
    }

    let imagePath = service.imagePath;
    if (data.image != null && data.image.size > 0) {
      await fs.unlink(`public${service.imagePath}`);
      const imagePath = `/services/${crypto.randomUUID}-${data.image.name}`;
      await fs.writeFile(
        `public${imagePath}`,
        Buffer.from(await data.image.arrayBuffer())
      );
    }

    await db.service.update({
      where: { id },
      data: {
        name: data.name,
        priceInCents: data.priceInCents,
        description: data.description,
        filePath,
        imagePath,
      },
    });

    revalidatePath("/");
    revalidatePath("/services");
    redirect("/admin/services");
  }
}

export async function addService(prevState: unknown, formData: FormData) {
  console.log(formData);
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  } else {
    const data = result.data;

    await fs.mkdir("services", { recursive: true });
    const filePath = `services/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

    await fs.mkdir("public/services", { recursive: true });
    const imagePath = `/services/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );

    await db.service.create({
      data: {
        isAvailableForPurchase: false,
        name: data.name,
        priceInCents: data.priceInCents,
        description: data.description,
        filePath,
        imagePath,
      },
    });

    revalidatePath("/");
    revalidatePath("/services");
    redirect("/admin/services");
  }
}

export async function toggleServiceAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.service.update({
    where: { id },
    data: { isAvailableForPurchase },
  });

  revalidatePath("/");
  revalidatePath("/services");
}

export async function deleteService(id: string) {
  const service = await db.service.delete({
    where: { id },
  });
  if (service == null) return notFound();
  await fs.unlink(service.filePath);
  await fs.unlink(`public${service.imagePath}`);

  revalidatePath("/");
  revalidatePath("/services");
}
/* 

const fileSchema: z.instanceOf(File, "file shouldn't be empty").refine((file)=> file.size()>0, "file should be provided");
const imageSchema: fileSchema.refine((file)=>file.startsWith("/image"), "only image files are accepted");

const obj = z.object({
name: z.string().min(1),
priceInCents: z.coerce.number.int().min(1),
description: z.string().min(1),
file:fileSchema, 
image:imageSchema,
})

export async function addService(prevState: unknown, formData: FormData) {

const res = obj.safeParse(Object.fromEntries(formData.entries()));
if(res.success === false){
return res.error.formErrors.fieldErrors;
}
else{
const data = result.data;
await fs.mkdir("products", {recursive: true});
const filePath = `/products/${crypto.randomUUID}-{data.file.name}`;
await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

await fs.mkdir("public/products", {recursive: true});
const imagePath = `/products/${crypto.randomUUID}-${data.image.name}`;
await fs.writeFile(
  `public${imagePath}`,
  Buffer.from(await data.image.arrayBuffer())
);
redirect("/admin/services");
}
}
*/
