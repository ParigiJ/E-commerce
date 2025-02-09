import { Button } from "@/components/ui/Button";
import { PageHeader } from "../../_components/PageHeader";
import Link from "next/link";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import db from "@/db/db";
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
} from "./_components/ServiceActions";

export default function AdminServicePage() {
  return (
    <>
      <div className="flex items-center gap-4 justify-between">
        <PageHeader>Services</PageHeader>
        <Button asChild>
          <Link href="/admin/services/new">Add Service</Link>
        </Button>
      </div>
      <ServicesTable />
    </>
  );
}

async function ServicesTable() {
  const services = await db.service.findMany({
    select: {
      id: true,
      name: true,
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: { select: { orders: true } },
    },
    orderBy: { name: "asc" },
  });

  if (services.length === 0) {
    return (
      <div className="text-muted-foreground italic">No services found</div>
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
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>
                {service.isAvailableForPurchase ? (
                  <>
                    <CheckCircle2 className="stroke-green-600" />
                    <span className="sr-only">Available</span>
                  </>
                ) : (
                  <>
                    <XCircle className="stroke-destructive" />
                    <span className="sr-only">UnAvailable</span>
                  </>
                )}
              </TableCell>
              <TableCell>{service.name}</TableCell>
              <TableCell>
                {formatCurrency(service.priceInCents / 100)}
              </TableCell>
              <TableCell>{formatNumber(service._count.orders)}</TableCell>
              <TableCell>
                <div></div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical />
                    <span className="sr-only">Actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="ml-20 
                  flex flex-col 
                  fill-background 
                  bg-slate-200 text-black shadow-xl
                  px-2 py-2 
                  rounded
                  "
                  >
                    <DropdownMenuItem asChild className=" hover:bg-slate-500">
                      <a
                        download
                        href={`/admin/services/${service.id}/download`}
                      >
                        Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className=" hover:bg-slate-500">
                      <Link href={`/admin/services/${service.id}/edit`}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <div className="cursor-pointer">
                      <div className=" hover:bg-slate-500">
                        <ActiveToggleDropdownItem
                          id={service.id}
                          isAvailableForPurchase={
                            service.isAvailableForPurchase
                          }
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <div className="text-red-400 hover:bg-red-300">
                        <DeleteDropdownItem
                          id={service.id}
                          disabled={service._count.orders > 0}
                        />
                      </div>
                    </div>
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
