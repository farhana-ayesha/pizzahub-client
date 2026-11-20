import type { Metadata } from "next";
import { PaymentCancel } from "./payment-cancel";

export const metadata: Metadata = { title: "Payment Cancelled" };

export default function PaymentCancelPage() {
  return <PaymentCancel />;
}
