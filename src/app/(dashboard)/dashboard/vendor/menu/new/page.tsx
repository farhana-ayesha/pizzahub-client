import type { Metadata } from "next";
import { MenuItemForm } from "@/components/menu-item-form";

export const metadata: Metadata = {
  title: "Add Menu Item",
};

export default function AddMenuItemPage() {
  return <MenuItemForm mode="create" />;
}
