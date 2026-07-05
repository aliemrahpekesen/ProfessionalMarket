import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Section } from "@/components/Section";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteNewsAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — news" };

export default async function AdminNewsPage() {
  const news = await prisma.newsItem.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <Section title={`News (${news.length})`}>
      <div className="flex justify-end border-b border-gray-100 p-3">
        <Link href="/admin/news/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">
          + New article
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Published</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {news.map((n) => (
            <tr key={n.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-semibold">
                <Link href={`/news/${n.slug}`} className="text-sky-800 hover:underline">{n.title}</Link>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-600">{formatDate(n.publishedAt)}</td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/news/${n.id}`} className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold">Edit</Link>
                  <form action={deleteNewsAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <ConfirmButton message="Delete this article?" className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}
