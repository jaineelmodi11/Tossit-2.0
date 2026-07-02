import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in or create an account",
  description:
    "Sign in to TossIt to classify waste items and track your recycling rate across devices.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
