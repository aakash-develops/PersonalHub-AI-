// // import * as pdfjsLib from "pdfjs-dist";
// // import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

// // pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// // export async function extractTextFromFile(file: File): Promise<string> {

// //   if (file.type === "application/pdf") {

// //     const buffer = await file.arrayBuffer();

// //     const pdf = await pdfjsLib.getDocument({
// //       data: buffer,
// //     }).promise;

// //     let fullText = "";

// //     for (let page = 1; page <= pdf.numPages; page++) {

// //       const pdfPage = await pdf.getPage(page);

// //       const text = await pdfPage.getTextContent();

// //       fullText +=
// //         text.items
// //           .map((item: any) => item.str)
// //           .join(" ") + "\n";
// //     }

// //     return fullText;
// //   }

// //   return await file.text();
// // }
// import * as pdfjsLib from "pdfjs-dist";

// // Configure worker cleanly for modern bundlers (Vite, Webpack 5, Next.js)
// pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();

// /**
//  * Extracts plain text content from a uploaded document (PDF or Text).
//  */
// export async function extractTextFromFile(file: File): Promise<string> {
//   const fileType = file.type.toLowerCase();
//   const fileName = file.name.toLowerCase();

//   // 1. Process PDF Files
//   if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
//     try {
//       const buffer = await file.arrayBuffer();
//       const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

//       let fullText = "";

//       for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//         const page = await pdf.getPage(pageNum);
//         const textContent = await page.getTextContent();

//         // Preserve spaces between text items to prevent word merging
//         const pageText = textContent.items
//           .map((item: any) => (typeof item.str === "string" ? item.str : ""))
//           .join(" ");

//         fullText += pageText + "\n\n";
//       }

//       const trimmedText = fullText.trim();
//       if (!trimmedText) {
//         throw new Error(
//           "Extracted PDF text is empty. The PDF may be image-only (scanned) and requires OCR processing."
//         );
//       }

//       return trimmedText;
//     } catch (error: any) {
//       throw new Error(`Failed to extract text from PDF: ${error.message}`);
//     }
//   }

//   // 2. Process Plain Text / Markdown Files
//   if (
//     fileType.startsWith("text/") ||
//     fileName.endsWith(".txt") ||
//     fileName.endsWith(".md")
//   ) {
//     return await file.text();
//   }

//   // 3. Fallback for Unsupported File Formats (.docx, .doc, etc.)
//   throw new Error(
//     `Unsupported file format: "${file.name}". Please upload a PDF (.pdf) or Plain Text (.txt) file.`
//   );
// }
import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Configure worker cleanly for modern bundlers
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/**
 * Helper to safely type-guard PDF text items vs. marked content items.
 */
function isTextItem(item: unknown): item is TextItem {
  return typeof item === "object" && item !== null && "str" in item;
}

/**
 * Extracts plain text content from an uploaded document (PDF or Text).
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // 1. Process PDF Files
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Reconstruct line breaks using item.hasEOL
        let pageText = "";
        for (const item of textContent.items) {
          if (isTextItem(item)) {
            pageText += item.str;
            if (item.hasEOL) {
              pageText += "\n";
            } else {
              pageText += " ";
            }
          }
        }

        // Clean up redundant spaces created during coordinate extraction
        const cleanedPageText = pageText.replace(/[ \t]+/g, " ").trim();
        fullText += cleanedPageText + "\n\n";
      }

      const trimmedText = fullText.trim();
      if (!trimmedText) {
        throw new Error(
          "Extracted PDF text is empty. The PDF may be image-only (scanned) and requires OCR processing."
        );
      }

      return trimmedText;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to extract text from PDF: ${message}`);
    }
  }

  // 2. Process Plain Text / Markdown Files
  if (
    fileType.startsWith("text/") ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md")
  ) {
    return await file.text();
  }

  // 3. Fallback for Unsupported File Formats
  throw new Error(
    `Unsupported file format: "${file.name}". Please upload a PDF (.pdf) or Plain Text (.txt) file.`
  );
}