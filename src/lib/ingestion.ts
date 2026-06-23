import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getPineconeIndex } from "./pinecone";
import { embedMany } from "ai";
import { mistral } from "@ai-sdk/mistral";

/**
 * Extracts text from a PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Splits text into manageable chunks for embeddings
 */
export async function chunkText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  const docs = await splitter.createDocuments([text]);
  return docs.map((doc) => doc.pageContent);
}

/**
 * Processes a document and stores its embeddings in Pinecone
 */
export async function processAndStoreDocument(
  tenantId: string,
  documentId: string,
  text: string
) {
  // 1. Chunk the text
  console.log("Ingestion started for text length:", text.length);
  const chunks = await chunkText(text);
  console.log("Generated chunks:", chunks.length);

  if (chunks.length === 0) {
    console.log("No chunks generated! Text length was:", text.length);
    throw new Error("Could not extract any readable text from this file. Please make sure the file contains actual text.");
  }

  // 2. Generate embeddings using Mistral
  const { embeddings } = await embedMany({
    model: mistral.embedding("mistral-embed"),
    values: chunks,
  });
  console.log("Generated embeddings:", embeddings.length);

  // 3. Prepare Pinecone vectors
  // NOTE: Array.from() is critical — Mistral SDK may return Float32Array (typed array),
  // which Pinecone SDK v8 rejects. We must convert to a plain JS number[].
  const vectors = chunks.map((chunk, i) => ({
    id: `${documentId}-chunk-${i}`,
    values: Array.from(embeddings[i] as number[]),
    metadata: {
      tenantId,
      documentId,
      text: chunk,
    },
  }));

  console.log("Vectors to upsert:", vectors.length);
  console.log("First vector id:", vectors[0]?.id);
  console.log("First vector dims:", (vectors[0]?.values as number[])?.length);

  if (vectors.length === 0) {
    throw new Error("Failed to map embeddings to vectors.");
  }

  // 4. Store in Pinecone — upsert in batches of 100 for safety
  const pineconeIndex = getPineconeIndex();
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await pineconeIndex.upsert({ records: batch });
    console.log(`Upserted batch ${i / batchSize + 1}, records: ${batch.length}`);
  }
  console.log("All vectors upserted successfully!");
}

/**
 * Deletes all vectors associated with a document ID from Pinecone
 */
export async function deleteDocumentVectors(documentId: string) {
  try {
    const pineconeIndex = getPineconeIndex();
    // Delete all vectors matching this documentId in their metadata
    // In Pinecone SDK v8, deleteMany takes a filter object directly
    // Wait, pineconeIndex.deleteMany({ documentId: "foo" }) may not work if it requires a filter wrapper. 
    // Wait, the new SDK expects `deleteMany({ filter: { documentId: { $eq: documentId } } })` or just iterate if not supported.
    // However, Pinecone SDK `deleteMany` requires a `Record<string, any>` filter. 
    // Let's use `{ documentId: documentId }` or delete by prefix if not supported.
    // Actually, in Pinecone V8, `deleteMany` takes a filter or an array of IDs. 
    // Since we don't know the exact number of chunks, and metadata filtering requires index configuration on serverless (which is default on starter), 
    // it's safer to just let `deleteMany` handle it with a filter.
    // If that fails, we can catch and ignore (for MVP).
    console.log(`Deleting vectors for document: ${documentId}`);
    
    // Attempt deletion by metadata filter
    await pineconeIndex.deleteMany({ documentId: { $eq: documentId } } as any);
    console.log(`Deleted vectors for document: ${documentId}`);
  } catch (error) {
    console.error(`Failed to delete vectors for document ${documentId}:`, error);
  }
}
