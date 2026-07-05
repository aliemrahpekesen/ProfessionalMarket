import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = await prisma.newsItem.findUnique({ where: { slug }, select: { title: true } });
  return { title: n?.title ?? "News not found" };
}

export default async function NewsItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = await prisma.newsItem.findUnique({
    where: { slug },
    include: { professional: true, company: true },
  });
  if (!n) notFound();

  return (
    <article className="mx-auto max-w-3xl rounded border border-gray-300 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black text-[var(--pm-navy)]">{n.title}</h1>
      <p className="mt-1 text-xs text-gray-500">{formatDate(n.publishedAt)}</p>
      <div className="prose mt-4 max-w-none text-sm leading-relaxed text-gray-700">{n.body}</div>
      {(n.professional || n.company) && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-3 text-sm">
          <span className="text-gray-500">Related:</span>
          {n.professional ? (
            <Link href={`/professionals/${n.professional.slug}`} className="font-semibold text-sky-800 hover:underline">
              {n.professional.firstName} {n.professional.lastName}
            </Link>
          ) : null}
          {n.company ? (
            <Link href={`/companies/${n.company.slug}`} className="font-semibold text-sky-800 hover:underline">
              {n.company.name}
            </Link>
          ) : null}
        </div>
      )}
    </article>
  );
}
