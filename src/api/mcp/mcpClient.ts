/* eslint-disable @typescript-eslint/no-explicit-any */
import { Type, type FunctionDeclaration, type Schema } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { ImageContent, TextContent, Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Interface for MCP tool execution results
 */
interface McpToolResult {
    success: boolean;
    content?: string;
    error?: string;
}

/**
 * MCP Client class for managing connections and tool executions
 */
export class McpClient {
    /**
     * MCP client instance
     */
    private client: Client | null = null;

    /**
     * Default MCP server URL
     */
    private mcpServerUrl!: string;

    /**
     * MCP Client constructor
     * 
     * @param mcpServerUrl - URL of the MCP server
     */
    constructor(mcpServerUrl: string) {
        this.mcpServerUrl = mcpServerUrl;
    }

    /**
     * Initializes the MCP client with the given server command and arguments.
     */
    public async initialize(): Promise<void> {
        if (this.client) {
            throw new Error('MCP client is already initialized');
        }

        try {
            const transport = new SSEClientTransport(
                new URL("/sse", this.mcpServerUrl),
            );

            this.client = new Client(
                {
                    name: 'gemini-figma-client-sse',
                    version: '1.0.0',
                },
                {
                    capabilities: {
                        tools: {},
                    },
                }
            );

            await this.client.connect(transport);

            console.log('MCP client connected successfully');
        } catch (error) {
            console.error('Failed to initialize MCP client:', error);
            throw new Error(`MCP client initialization failed: ${error}`);
        }
    }

    /**
     * Initializes the MCP client with the given server command and arguments.
     * 
     * TODO: WORKING PROGRESS
     */
    public async initializeWithStreamedHTTP(): Promise<void> {
        if (this.client) {
            throw new Error('MCP client is already initialized');
        }

        try {
            const transport = new StreamableHTTPClientTransport(
                new URL("/mcp", this.mcpServerUrl),
            );

            this.client = new Client(
                {
                    name: 'gemini-figma-client',
                    version: '1.0.0',
                },
                {
                    capabilities: {
                        tools: {},
                    },
                }
            );

            await this.client.connect(transport);

            console.log('MCP client connected successfully');
        } catch (error) {
            console.error('Failed to initialize MCP client:', error);
            throw new Error(`MCP client initialization failed: ${error}`);
        }
    }

    /**
     * Returns the initialized MCP client.
     * 
     * @returns The MCP client instance
     */
    public getClient(): Client {
        if (!this.client) {
            throw new Error('MCP client is not initialized. Call initialize first.');
        }
        return this.client;
    }

    /**
     * Checks if the MCP client is initialized.
     * 
     * @returns True if the MCP client is initialized, false otherwise
     */
    public isInitialized(): boolean {
        return this.client !== null;
    }

    /**
     * Get all available tools from the MCP server.
     */
    public async getAvailableTools(): Promise<Tool[]> {
        if (!this.client) {
            throw new Error('MCP client not initialized. Call initialize first.');
        }

        const capabilities = await this.client.listTools();
        return capabilities.tools || [];
    }

    /**
     * Executes a tool via the MCP server.
     * 
     * @param toolName - Name of the tool to execute
     * @param parameters - Parameters for the tool
     */
    public async executeTool(
        toolName: string,
        parameters: Record<string, any>,
    ): Promise<McpToolResult> {
        if (!this.client) {
            return {
                success: false,
                error: 'MCP client not initialized'
            };
        }

        try {
            const response = await this.client.callTool({
                name: toolName,
                arguments: parameters,
            });

            // Extract text content from the response
            let content = '';
            if (Array.isArray(response.content)) {
                for (const item of response.content) {
                    if (item.type === 'text') {
                        content += (item as TextContent).text + '\n';
                    } else if (item.type === 'image') {
                        content += `[Image: ${(item as ImageContent).data}]\n`;
                    }
                }
            }

            return {
                success: !response.isError,
                content: content.trim(),
                error: response.isError ? 'Tool execution failed' : undefined
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error executing tool'
            };
        }
    }

    /**
     * Converts MCP tools to Gemini function declarations.
     */
    public async convertAllToolsToGeminiFunctions(): Promise<FunctionDeclaration[]> {
        const mcpTools: Tool[] = await this.getAvailableTools();

        return mcpTools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: {
                type: Type.OBJECT,
                description: tool.description,
                properties: this.sanitizeSchemaProperties(tool.inputSchema?.properties),
                required: tool.inputSchema?.required || []
            }
        }));
    }

    /**
     * To sanitize MCP schema properties, to pass to google gemini
     * 
     * @param properties - Schema properties to sanitize
     * @returns - Sanitized schema properties
     */
    private sanitizeSchemaProperties(
        properties: Record<string, any> | undefined
    ): Record<string, Schema> {
        if (!properties) return {};

        // Create a Set of allowed keys from the Schema type
        const allowedKeys = new Set<keyof Schema>([
            'anyOf', 'type', 'properties', 'items', 'required', 'nullable',
            'format', 'description', 'enum', 'default', 'example', 'maxItems', 'maxLength',
            'maxProperties', 'maximum', 'minItems', 'minLength', 'minProperties', 'minimum',
            'pattern', 'propertyOrdering'
        ]);

        const sanitized: Record<string, Schema> = {};

        for (const [key, value] of Object.entries(properties)) {
            // Create a new object with only allowed properties
            const sanitizedValue: Partial<Schema> = {};
            for (const prop of Object.keys(value)) {
                if (allowedKeys.has(prop as keyof Schema)) {
                    sanitizedValue[prop as keyof Schema] = value[prop];
                }
            }
            sanitized[key] = sanitizedValue as Schema;
        }

        return sanitized;
    }

    /**
     * Closes the MCP client connection.
     */
    public async close(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            console.log('MCP client connection closed');
        } else {
            console.warn('MCP client is not initialized, nothing to close');
        }
    }
}
