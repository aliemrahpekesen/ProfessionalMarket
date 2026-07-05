import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Section } from "@/components/Section";
import { NewsForm } from "../NewsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — new article" };

export default async function NewNewsPage() {
  const [professionals, companies] = await Promise.all([
    prisma.professional.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <Section title="New article">
      <NewsForm professionals={professionals} companies={companies} />
    </Section>
  );
}
