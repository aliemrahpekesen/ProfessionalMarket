import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Section } from "@/components/Section";
import { CompanyForm } from "../CompanyForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — edit company" };

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [company, industries] = await Promise.all([
    prisma.company.findUnique({ where: { id } }),
    prisma.industry.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!company) notFound();
  return (
    <Section title={`Edit: ${company.name}`}>
      <CompanyForm company={company} industries={industries} />
    </Section>
  );
}
