import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Section } from "@/components/Section";
import { ProfessionalForm } from "../ProfessionalForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — edit professional" };

export default async function EditProfessionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [professional, companies, agencies] = await Promise.all([
    prisma.professional.findUnique({ where: { id } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.agency.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!professional) notFound();
  return (
    <Section title={`Edit: ${professional.firstName} ${professional.lastName}`}>
      <ProfessionalForm professional={professional} companies={companies} agencies={agencies} />
    </Section>
  );
}
