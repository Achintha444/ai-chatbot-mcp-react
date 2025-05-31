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

  constructor(baseUrl: string = 'http://localhost:3333') {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize connection to MCP server
   */
  async initialize(): Promise<void> {
    try {
      // Establish SSE connection to get session ID
      const response = await fetch(`${this.baseUrl}/sse`);
      if (!response.ok) {
        throw new Error('Failed to establish SSE connection');
      }
      
      // In a real implementation, you'd parse the SSE response to get sessionId
      // For now, we'll generate one or extract from response headers
      this.sessionId = response.headers.get('X-Session-ID') || this.generateSessionId();
    } catch (error) {
      console.error('Failed to initialize MCP connection:', error);
      throw error;
    }
  }

  /**
   * Send a message to the MCP server
   */
  private async sendMCPMessage(message: MCPMessage): Promise<MCPResponse> {
    const response = await fetch(`${this.baseUrl}/messages`, {
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
   * List available tools/capabilities from Figma MCP server
   */
  async listTools(): Promise<any[]> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: this.generateRequestId(),
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
        id: this.generateRequestId(),
        method: 'tools/call',
        params: {
          name: 'get_current_file_context', // Assuming this is available
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
   * Get specific Figma nodes by selection or IDs
   */
  async getFigmaNodes(nodeIds?: string[]): Promise<any[]> {
    const message: MCPMessage = {
      jsonrpc: '2.0',
      id: this.generateRequestId(),
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

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default MCPFigmaService;
