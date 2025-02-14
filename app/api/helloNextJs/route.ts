import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ message: "Hello from Next.js 14" });
}

export async function POST(request: Request) {
  return NextResponse.json({})
}