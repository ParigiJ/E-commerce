import { Button } from "@/components/ui/button";
import { PageHeader } from "../../_components/PageHeader";
import Link from "next/link";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import db from "@/db/db";
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

export default function AdminProductPage() {
  return (
    <>
      <div className="flex items-center gap-4 justify-between">
        <PageHeader>Products</PageHeader>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
      <ProductsTable />
    </>
  );
}

async function ProductsTable() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: { select: { orders: true } },
    },
    orderBy: { name: "asc" },
  });

  if (products.length === 0) {
    return (
      <div className="text-muted-foreground italic">No products found</div>
    );
  }
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w=0">
              <span className="sr-only">Available For Purchase</span>
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="w=0">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.isAvailableForPurchase ? (
                  <>
                    <CheckCircle2 />
                    <span className="sr-only">Available</span>
                  </>
                ) : (
                  <>
                    <XCircle />
                    <span className="sr-only">UnAvailable</span>
                  </>
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {formatCurrency(product.priceInCents / 100)}
              </TableCell>
              <TableCell>{formatNumber(product._count.orders)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical />
                    <span className="sr-only">Actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="ml-20 
                  flex flex-col 
                  fill-background 
                  bg-black text-white 
                  px-2 py-2 
                  rounded"
                  >
                    <DropdownMenuItem
                      asChild
                      className=" hover:bg-gray-800 rounded"
                    >
                      <a
                        download
                        href={`/src/app/admin/products/${product.id}/download`}
                      >
                        Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className=" hover:bg-gray-800 rounded"
                    >
                      <Link href={`/admin/produts/${product.id}/edit`}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
