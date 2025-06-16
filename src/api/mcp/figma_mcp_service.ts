/* eslint-disable @typescript-eslint/no-explicit-any */
// services/mcpFigmaService.ts

interface MCPMessage {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface FigmaDesignContext {
  nodes: any[];
  components: any[];
  styles: any[];
  metadata: any;
}

class MCPFigmaService {
  private baseUrl: string;
  private sessionId: string | null = null;
  private eventSource: EventSource | null = null;

  constructor(baseUrl: string = 'http://localhost:3333') {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize connection to MCP server using SSE
   */
  async initialize(): Promise<void> {
    try {
      await this.initializeSSE();
    } catch (error) {
      console.error('Failed to initialize MCP connection:', error);
      throw error;
    }
  }

  /**
   * Initialize SSE connection
   */
  private async initializeSSE(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(`${this.baseUrl}/sse`);

        this.eventSource.onopen = (event) => {
          console.log('SSE connection established', event);
          // Extract session ID from the connection - you might need to adjust this
          // based on how the server sends the session ID
          resolve();
        };

        this.eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          reject(new Error('Failed to establish SSE connection'));
        };

        // Listen for the specific 'endpoint' event
        this.eventSource.addEventListener('endpoint', (event) => {
          try {
            const data = event.data;
            console.log('Received endpoint event:', data);

            // Parse the endpoint data: "/messages?sessionId=a3c2887c-bb4d-4296-a039-1d459e4a0cb0"
            const sessionIdMatch = data.match(/sessionId=([a-f0-9-]+)/);
            if (sessionIdMatch) {
              this.sessionId = sessionIdMatch[1];
              console.log('Session ID captured:', this.sessionId);

              // Resolve the promise once we have the session ID
              resolve();
            } else {
              reject(new Error('Failed to extract session ID from endpoint data'));
            }
          } catch (e) {
            console.error('Failed to parse endpoint event:', e);
            reject(e);
          }
        });


        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received SSE message:', data);
            // Handle incoming messages if needed
          } catch (e) {
            console.error('Failed to parse SSE message:', e);
          }
        };

        // Set a timeout for connection
        setTimeout(() => {
          if (this.eventSource?.readyState !== EventSource.OPEN) {
            reject(new Error('SSE connection timeout'));
          }
        }, 5000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send a message to the MCP server
   */
  private async sendMCPMessage(message: MCPMessage): Promise<MCPResponse> {
    return this.sendSSEMessage(message);
  }

  private get getSessionId(): string {
    return this.sessionId || 'default-session';
  }

  /**
   * Send message via SSE transport
   */
  private async sendSSEMessage(message: MCPMessage): Promise<MCPResponse> {
    // For SSE, we need to determine the session ID from the EventSource connection
    // This is a simplified implementation - you might need to adjust based on 
    // how the server provides session ID information

    const response = await fetch(`${this.baseUrl}/messages?sessionId=${this.getSessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.sessionId = null;
  }

  /**
   * List available tools/capabilities from Figma MCP server
   */
  async listTools(): Promise<any[]> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: this.getSessionId,
      method: 'tools/list',
    };

    const response = await this.sendMCPMessage(message);
    return response.result?.tools || [];
  }

  /**
   * Get current Figma file context
   */
  async getFigmaContext(): Promise<FigmaDesignContext> {
    try {
      // Call Figma MCP server to get current design context
      const message: MCPMessage = {
        jsonrpc: '2.0',
        id: this.getSessionId,
        method: 'tools/call',
        params: {
          name: 'get_figma_data',
        },
      };

      const response = await this.sendMCPMessage(message);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.result || { nodes: [], components: [], styles: [], metadata: {} };
    } catch (error) {
      console.error('Failed to get Figma context:', error);
      throw error;
    }
  }

  /**
   * Get Figma data for a specific file and node
   * 
   * @param fileKey - Figma file key to fetch data from
   * @param nodeId - Optional node ID to fetch specific node data
   * @param depth - Optional depth to fetch nested nodes
   * @returns 
   */
  async getFigmaData(fileKey: string, nodeId?: string, depth?: number): Promise<any> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: this.getSessionId,
      method: 'tools/call',
      params: {
        name: 'get_figma_data',
        arguments: {
          fileKey,
          ...(nodeId && { nodeId }),
          ...(depth && { depth }),
        },
      },
    };

    const response = await this.sendMCPMessage(message);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result;
  }

  /**
   * Download images from Figma file
   * 
   * @param fileKey - Figma file key to download images from
   * @param nodes - Array of node IDs to download images for
   * @param localPath - Local path to save downloaded images
   * @param scale - Optional scale factor for images
   * @returns 
   */
  async downloadImages(fileKey: string, nodes: any[], localPath: string, scale?: number): Promise<any> {
    const message = {
      jsonrpc: '2.0',
      id: this.getSessionId,
      method: 'tools/call',
      params: {
        name: 'download_figma_images',
        arguments: {
          fileKey,
          nodes,
          localPath,
          ...(scale && { scale }),
        },
      },
    };

    const response = await this.sendMCPMessage(message);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result;
  }

  /**
   * Get specific Figma nodes by selection or IDs
   */
  async getFigmaNodes(nodeIds?: string[]): Promise<any[]> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: this.getSessionId,
      method: 'tools/call',
      params: {
        name: 'get_nodes',
        arguments: nodeIds ? { node_ids: nodeIds } : {},
      },
    };

    const response = await this.sendMCPMessage(message);
    return response.result?.nodes || [];
  }

  /**
   * Format Figma context for Gemini consumption
   */
  formatContextForGemini(context: FigmaDesignContext): string {
    const formattedContext = {
      design_summary: {
        total_nodes: context.nodes.length,
        components_count: context.components.length,
        styles_count: context.styles.length,
      },
      components: context.components.map(comp => ({
        name: comp.name,
        type: comp.type,
        properties: comp.properties,
      })),
      design_tokens: context.styles.map(style => ({
        name: style.name,
        type: style.type,
        value: style.value,
      })),
      layout_structure: context.nodes
        .filter(node => node.type === 'FRAME' || node.type === 'GROUP')
        .map(node => ({
          name: node.name,
          type: node.type,
          dimensions: {
            width: node.width,
            height: node.height,
          },
          children_count: node.children?.length || 0,
        })),
    };

    return `Figma Design Context:
${JSON.stringify(formattedContext, null, 2)}

Current design contains:
- ${context.nodes.length} design elements
- ${context.components.length} reusable components  
- ${context.styles.length} design tokens/styles

This context can be used to answer questions about the current Figma design, suggest improvements, generate code from designs, or help with design system questions.`;
  }
}

export default MCPFigmaService;
