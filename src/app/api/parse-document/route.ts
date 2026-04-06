import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse-fork';
import mammoth from 'mammoth';

export async function GET() {
  return NextResponse.json({ status: 'active', node: process.version });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf') {
      try {
        const data = await pdf(buffer);
        text = data.text;
      } catch {
        return NextResponse.json(
          { error: 'PDF parsing failed. The file may be password protected or corrupted.' },
          { status: 422 },
        );
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch {
        return NextResponse.json({ error: 'DOCX parsing failed.' }, { status: 422 });
      }
    } else {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 });
    }

    text = text.replace(/\s+/g, ' ').trim();

    if (!text) {
      return NextResponse.json({ error: 'No readable text found in the document.' }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal server error during parsing: ${error?.message ?? 'Unknown error'}` },
      { status: 500 },
    );
  }
}
