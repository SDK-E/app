import { getAuth0Client } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return getAuth0Client().middleware(request);
}

export async function POST(request: NextRequest) {
  return getAuth0Client().middleware(request);
}
