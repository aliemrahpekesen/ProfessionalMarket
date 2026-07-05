import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Section } from "@/components/Section";
import { NewsForm } from "../NewsForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — edit article" };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [news, professionals, companies] = await Promise.all([
    prisma.newsItem.findUnique({ where: { id } }),
    prisma.professional.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!news) notFound();
  return (
    <Section title="Edit article">
      <NewsForm news={news} professionals={professionals} companies={companies} />
    </Section>
  );
}
