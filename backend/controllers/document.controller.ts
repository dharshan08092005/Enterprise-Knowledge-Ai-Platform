// controllers/document.controller.ts
import { Request, Response } from "express";
import Document from "../models/Document";

export const createDocument = async (req: Request, res: Response) => {
  const doc = await Document.create(req.body);
  res.status(201).json(doc);
};

export const getDocuments = async (_: Request, res: Response) => {
  const docs = await Document.find();
  res.json(docs);
};
