import fs from "fs";
import { PDFParse } from "pdf-parse";



export const extractPdfText = async (input: string | Buffer) => {
    let buffer: Buffer;
    
    if (Buffer.isBuffer(input)) {
        buffer = input;
    } else {
        buffer = fs.readFileSync(input as string);
    }

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    return {
        text: result.text.trim(),
        pageCount: result.total
    };
};
