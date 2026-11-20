import type { Metadata } from "next";
import { ItemDetails } from "./item-details";

export const metadata: Metadata = {
  title: "Item Details",
  description: "View pizza details, vendor information and place your order on PizzaHub.",
};

export default function ItemDetailsPage() {
  return <ItemDetails />;
}
