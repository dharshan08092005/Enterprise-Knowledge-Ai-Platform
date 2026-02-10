import { Schema, model } from "mongoose";

/**
 * SystemSettings Schema
 * ---------------------
 * Stores admin-configurable system settings.
 * This is a single-document collection (singleton pattern).
 * Each category of settings is a nested object.
 */
const systemSettingsSchema = new Schema(
    {
        // Database Settings
        database: {
            mongoUri: {
                type: String,
                default: ""
            },
            mongoDbName: {
                type: String,
                default: ""
            }
        },

        // LLM / AI Provider Settings
        llm: {
            provider: {
                type: String,
                enum: ["openai", "anthropic", "google", "azure", "ollama", "custom"],
                default: "openai"
            },
            apiKey: {
                type: String,
                default: ""
            },
            model: {
                type: String,
                default: "gpt-4"
            },
            baseUrl: {
                type: String,
                default: ""
            },
            maxTokens: {
                type: Number,
                default: 4096
            },
            temperature: {
                type: Number,
                default: 0.7
            }
        },

        // Embedding Settings
        embedding: {
            provider: {
                type: String,
                enum: ["openai", "cohere", "huggingface", "custom"],
                default: "openai"
            },
            apiKey: {
                type: String,
                default: ""
            },
            model: {
                type: String,
                default: "text-embedding-3-small"
            },
            baseUrl: {
                type: String,
                default: ""
            }
        },

        // Vector Database Settings
        vectorDb: {
            provider: {
                type: String,
                enum: ["pinecone", "qdrant", "weaviate", "chroma", "milvus", "none"],
                default: "none"
            },
            apiKey: {
                type: String,
                default: ""
            },
            host: {
                type: String,
                default: ""
            },
            indexName: {
                type: String,
                default: ""
            }
        },

        // Storage Settings
        storage: {
            provider: {
                type: String,
                enum: ["local", "s3", "gcs", "azure-blob", "supabase"],
                default: "local"
            },
            bucket: {
                type: String,
                default: ""
            },
            region: {
                type: String,
                default: ""
            },
            accessKey: {
                type: String,
                default: ""
            },
            secretKey: {
                type: String,
                default: ""
            },
            endpoint: {
                type: String,
                default: ""
            }
        },

        // Security Settings
        security: {
            jwtSecret: {
                type: String,
                default: ""
            },
            jwtExpiresIn: {
                type: String,
                default: "7d"
            },
            refreshTokenExpiresIn: {
                type: String,
                default: "30d"
            },
            maxLoginAttempts: {
                type: Number,
                default: 5
            },
            lockoutDuration: {
                type: Number,
                default: 15 // minutes
            }
        },

        // Email / SMTP Settings
        email: {
            provider: {
                type: String,
                enum: ["smtp", "sendgrid", "ses", "mailgun", "none"],
                default: "none"
            },
            host: {
                type: String,
                default: ""
            },
            port: {
                type: Number,
                default: 587
            },
            user: {
                type: String,
                default: ""
            },
            password: {
                type: String,
                default: ""
            },
            from: {
                type: String,
                default: ""
            },
            apiKey: {
                type: String,
                default: ""
            }
        },

        // General Settings
        general: {
            appName: {
                type: String,
                default: "Enterprise AI"
            },
            appUrl: {
                type: String,
                default: "http://localhost:5173"
            },
            maxFileSize: {
                type: Number,
                default: 50 // MB
            },
            allowedFileTypes: {
                type: [String],
                default: ["pdf", "doc", "docx", "txt", "xls", "xlsx", "csv"]
            },
            maintenanceMode: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

export default model("SystemSettings", systemSettingsSchema);
