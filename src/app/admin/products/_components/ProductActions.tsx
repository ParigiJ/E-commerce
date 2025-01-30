import {
  deleteProduct,
  istoggleProductAvailability,
} from "@/app/_actions/product";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useTransition } from "react";

export function ToggleDropdownItem({
  id,
  isAvailableForPurchase,
}: {
  id: string;
  isAvailableForPurchase: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await istoggleProductAvailability(id, !isAvailableForPurchase);
        });
      }}
    >
      {isAvailableForPurchase ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}

export function DeleteDropdownItem({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteProduct(id, !disabled);
        });
      }}
    >
      {disabled ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}
