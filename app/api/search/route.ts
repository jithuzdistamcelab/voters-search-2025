// app/api/search/route.ts
import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

import { Voter } from "@/types/voter";

const dbPath = path.join(process.cwd(), "public/db/voters-list.db");
const db = new Database(dbPath, { readonly: true });

// --- SEARCH QUERY ---
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
    (
      name_en LIKE ?
      OR name_ml LIKE ?
      OR voter_id LIKE ?
      OR house_name_en LIKE ?
      OR house_name_ml LIKE ?
      OR guardian_en LIKE ?
      OR guardian_ml LIKE ?
    )
    AND (? = '' OR ward = ?)   -- <-- ward filter added
  ORDER BY score DESC, name_en ASC
  LIMIT ? OFFSET ?;
`);

// --- COUNT QUERY ---
const countStmt = db.prepare(`
  SELECT COUNT(*) AS total
  FROM voters
  WHERE
    (
      name_en LIKE ?
      OR name_ml LIKE ?
      OR voter_id LIKE ?
      OR house_name_en LIKE ?
      OR house_name_ml LIKE ?
      OR guardian_en LIKE ?
      OR guardian_ml LIKE ?
    )
    AND (? = '' OR ward = ?);   -- <-- ward filter added
`);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const ward = (searchParams.get("ward") || "").trim(); // <-- NEW
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
    // --- COUNT ---
    const totalResult = countStmt.get(
      like, like, like, like, like, like, like, // search filters
      ward, ward                                // ward filter
    ) as { total: number };

    // --- SEARCH ---
    const rows = searchStmt.all(
      prefix, prefix,     // scoring prefix
      like, like,         // scoring contains
      like,               // scoring voter_id
      like, like,         // scoring house
      like, like,         // scoring guardian
      like, like, like, like, like, like, like, // WHERE filters
      ward, ward,         // ward filter
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
