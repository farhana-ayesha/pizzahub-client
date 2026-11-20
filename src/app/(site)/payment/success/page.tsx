import type { Metadata } from "next";
import { PaymentSuccess } from "./payment-success";

export const metadata: Metadata = { title: "Payment Success" };

export default function PaymentSuccessPage() {
  return <PaymentSuccess />;
}
