import fs from "fs";
import { PDFParse } from "pdf-parse";



export const extractPdfText = async (filePath: string) => {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    return {
        text: result.text.trim(),
        pageCount: result.total
    };
};
