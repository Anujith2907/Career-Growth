import { NextResponse } from "next/server";
import { extractText } from "unpdf";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let extractedText = "";

    if (ext === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
      extractedText = typeof result.text === "string"
        ? result.text
        : (result.text as string[]).join("\n");
    } else if (ext === "txt" || ext === "text") {
      extractedText = await file.text();
    } else if (ext === "docx") {
      extractedText = await file.text();
    } else {
      return NextResponse.json(
        { error: `Unsupported file format: .${ext}` },
        { status: 400 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the file. It may be image-based." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: extractedText.trim(),
      fileName: file.name,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (error) {
    console.error("PDF Parse API Error:", error);
    return NextResponse.json(
      { error: "Failed to parse the uploaded file." },
      { status: 500 }
    );
  }
}
