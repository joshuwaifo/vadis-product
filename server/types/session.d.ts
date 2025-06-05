import 'express-session';

declare module 'express-session' {
  interface SessionData {
    uploadedPdfData?: {
      buffer: string;
      fileName: string;
      mimeType: string;
      size: number;
    };
  }
}