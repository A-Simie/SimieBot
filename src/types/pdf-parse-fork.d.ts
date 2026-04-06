declare module 'pdf-parse-fork' {
  interface PdfParseResult {
    text: string;
    numpages?: number;
    numrender?: number;
    info?: Record<string, unknown>;
    metadata?: unknown;
    version?: string;
  }

  export default function pdf(dataBuffer: Buffer | Uint8Array): Promise<PdfParseResult>;
}
