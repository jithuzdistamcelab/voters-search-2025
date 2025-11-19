// app/api/search/route.ts
import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { Voter } from "@/types/voter";

const db = new Database("voters-list.db", { readonly: true });

const searchStmt = db.prepare(`
  SELECT
    *,
    (
      -- Prefix matches (highest priority)
      CASE WHEN name_en LIKE (? || '%') THEN 500 ELSE 0 END +
      CASE WHEN name_ml LIKE (? || '%') THEN 500 ELSE 0 END +

      -- Contains match
      CASE WHEN name_en LIKE ? THEN 300 ELSE 0 END +
      CASE WHEN name_ml LIKE ? THEN 300 ELSE 0 END +

      -- voter_id
      CASE WHEN voter_id LIKE ? THEN 200 ELSE 0 END +

      -- House name
      CASE WHEN house_name_en LIKE ? THEN 100 ELSE 0 END +
      CASE WHEN house_name_ml LIKE ? THEN 100 ELSE 0 END +

      -- Guardian
      CASE WHEN guardian_en LIKE ? THEN 50 ELSE 0 END +
      CASE WHEN guardian_ml LIKE ? THEN 50 ELSE 0 END
    ) AS score
  FROM voters
  WHERE
    name_en LIKE ?
    OR name_ml LIKE ?
    OR voter_id LIKE ?
    OR house_name_en LIKE ?
    OR house_name_ml LIKE ?
    OR guardian_en LIKE ?
    OR guardian_ml LIKE ?
  ORDER BY score DESC, name_en ASC
  LIMIT ? OFFSET ?;
`);

const countStmt = db.prepare(`
  SELECT COUNT(*) AS total
  FROM voters
  WHERE
    name_en LIKE ?
    OR name_ml LIKE ?
    OR voter_id LIKE ?
    OR house_name_en LIKE ?
    OR house_name_ml LIKE ?
    OR guardian_en LIKE ?
    OR guardian_ml LIKE ?;
`);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const offset = (page - 1) * limit;

  if (!q) {
    return NextResponse.json({
      page,
      limit,
      total: 0,
      hasMore: false,
      results: [],
    });
  }

  const like = `%${q}%`;
  const prefix = `${q}%`;

  try {
    const totalResult = countStmt.get(
      like, like, like, like, like, like, like
    ) as { total: number };

    const rows = searchStmt.all(
      prefix, prefix,      // prefix EN + ML
      like, like,          // contains EN + ML
      like,                // voter_id
      like, like,          // house EN + ML
      like, like,          // guardian EN + ML
      like, like, like, like, like, like, like,  // WHERE filters
      limit,
      offset
    ) as Voter[];

    return NextResponse.json({
      page,
      limit,
      total: totalResult.total,
      hasMore: offset + rows.length < totalResult.total,
      results: rows,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search voters" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
