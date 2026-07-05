import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Section } from "@/components/Section";
import { CompanyForm } from "../CompanyForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — new company" };

export default async function NewCompanyPage() {
  const industries = await prisma.industry.findMany({ orderBy: { name: "asc" } });
  return (
    <Section title="New company">
      <CompanyForm industries={industries} />
    </Section>
  );
}
