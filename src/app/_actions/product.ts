"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";

const fileSchema = z.instanceof(File, { message: "File is required" });

const imageSchema = fileSchema
  .refine(
    (file) => file.type.startsWith("image/"),
    "only image files are allowed "
  )
  .refine((file) => file.size > 0, "File is required");

const addSchema = z.object({
  name: z.string().min(1),
  priceInCents: z.coerce.number().int().gt(0),
  description: z.string().min(1),
  file: fileSchema.refine((file) => file.size > 0, "File is required"),
  image: imageSchema,
});

export async function addProduct(prevState: unknown, formData: FormData) {
  console.log(formData);
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  } else {
    const data = result.data;

    await fs.mkdir("products", { recursive: true });
    const filePath = `products/${crypto.randomUUID}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

    await fs.mkdir("public/products", { recursive: true });
    const imagePath = `/products/${crypto.randomUUID}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );

    await db.product.create({
      data: {
        isAvailableForPurchase: false,
        name: data.name,
        priceInCents: data.priceInCents,
        description: data.description,
        filePath,
        imagePath,
      },
    });

    redirect("/admin/products");
  }
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });
}
export async function deleteProduct(id: string) {
  const product = await db.product.delete({
    where: { id },
  });
  if (product == null) return notFound();
  await fs.unlink(product.filePath);
  await fs.unlink(`public${product.imagePath}`);
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

export async function addProduct(prevState: unknown, formData: FormData) {

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
redirect("/admin/products");
}
}
*/
