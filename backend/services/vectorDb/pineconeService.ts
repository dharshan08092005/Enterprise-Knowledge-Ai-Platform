import { Pinecone } from "@pinecone-database/pinecone";

let pc: Pinecone | null = null;

const getPineconeClient = () => {
    if (!pc) {
        if (!process.env.PINECONE_API_KEY) {
            console.error("PINECONE_API_KEY missing");
        }
        pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY || "",
        });
    }
    return pc;
};

export const getPineconeIndex = () => {
    const client = getPineconeClient();
    if (!process.env.PINECONE_INDEX) {
        throw new Error("PINECONE_INDEX is missing from environment variables");
    }
    return client.index(process.env.PINECONE_INDEX);
};

export const upsertChunksToPinecone = async (
    organizationId: string,
    documentId: string,
    accessScope: string,
    ownerId: string,
    departmentId: string | undefined,
    chunks: { id: string; text: string; values: number[]; metadata?: any }[]
) => {
    const index = getPineconeIndex();

    const vectors = chunks.map(chunk => ({
        id: chunk.id,
        values: chunk.values,
        metadata: {
            ...chunk.metadata,
            text: chunk.text,
            organizationId,
            documentId,
            accessScope,
            ownerId,
            ...(departmentId ? { departmentId } : {})
        }
    }));

    await index.upsert({ records: vectors }); // Using rigorous v7 shape
};

export const searchSimilarChunks = async (
    organizationId: string, 
    userId: string, 
    role: string, 
    departmentId: string | undefined, 
    queryEmbedding: number[], 
    topK = 5
) => {
    const index = getPineconeIndex();

    // 1️⃣ Base multi-tenancy filter
    const filter: any = {
        organizationId: { $eq: organizationId }
    };

    // 2️⃣ RBAC (Role-Based Access Control)
    // If the user isn't an Organization Admin or Global Admin, we lock down visibility.
    if (role !== "ORG_ADMIN" && role !== "ADMIN") {
        const accessConditions: any[] = [
            { accessScope: { $in: ["public", "organization"] } },
            { accessScope: { $eq: "restricted" }, ownerId: { $eq: userId } }
        ];

        // Only allow department filtering if the user belongs to a department
        if (departmentId) {
            accessConditions.push({ 
                accessScope: { $eq: "department" }, 
                departmentId: { $eq: departmentId } 
            });
        }

        filter["$or"] = accessConditions;
    }

    const queryResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter
    });

    return queryResponse.matches;
};
