import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Market news" };

export default async function NewsPage() {
  const news = await prisma.newsItem.findMany({
    orderBy: { publishedAt: "desc" },
    include: { professional: true, company: true },
  });

  return (
    <Section title="Market news">
      <ul className="divide-y divide-gray-100">
        {news.map((n) => (
          <li key={n.id} className="px-3 py-3 hover:bg-gray-50">
            <Link href={`/news/${n.slug}`} className="font-semibold text-sky-800 hover:underline">
              {n.title}
            </Link>
            <div className="mt-0.5 text-xs text-gray-500">
              {formatDate(n.publishedAt)}
              {n.professional ? (
                <>
                  {" · "}
                  <Link href={`/professionals/${n.professional.slug}`} className="text-sky-700 hover:underline">
                    {n.professional.firstName} {n.professional.lastName}
                  </Link>
                </>
              ) : null}
              {n.company ? (
                <>
                  {" · "}
                  <Link href={`/companies/${n.company.slug}`} className="text-sky-700 hover:underline">
                    {n.company.name}
                  </Link>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
