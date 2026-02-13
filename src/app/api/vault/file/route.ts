import { NextResponse } from "next/server";
import { vaultService } from "@/lib/services/vault.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");
    if (!filePath) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    const result = await vaultService.readFile(filePath);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    console.error("Failed to read file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");
    if (!filePath) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    const body = await request.json();
    await vaultService.writeFile(filePath, body.content ?? "");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Path traversal detected") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Failed to write file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path: filePath, content } = body;
    if (!filePath) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    await vaultService.createFile(filePath, content ?? "");
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "File already exists") {
      return NextResponse.json({ error: "File already exists" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "Path traversal detected") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Failed to create file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");
    if (!filePath) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    await vaultService.deleteFile(filePath);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    console.error("Failed to delete file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
