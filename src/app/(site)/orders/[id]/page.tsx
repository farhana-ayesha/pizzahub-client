import type { Metadata } from "next";
import { OrderDetails } from "./order-details";

export const metadata: Metadata = {
  title: "Order Details",
  description: "Track your PizzaHub order status and delivery details.",
};

export default function OrderDetailsPage() {
  return <OrderDetails />;
}
