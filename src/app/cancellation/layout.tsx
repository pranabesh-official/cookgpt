import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Cancellation Policy",
  description: "Understand our cancellation policy and how to request changes.",
  alternates: { canonical: "/cancellation" },
};

export default function CancellationLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


