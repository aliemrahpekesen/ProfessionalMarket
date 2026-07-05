import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Section } from "@/components/Section";
import { ProfessionalForm } from "../ProfessionalForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — new professional" };

export default async function NewProfessionalPage() {
  const [companies, agencies] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.agency.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <Section title="New professional">
      <ProfessionalForm companies={companies} agencies={agencies} />
    </Section>
  );
}
