import { BaseHandler, ToolConfig, BaseMcpConfig } from './base';

class CursorMcpConfig {
    mcpServers: Record<string, {
        command?: string;
        args?: string[];
        env?: Record<string, string>;
        url?: string;
        headers?: Record<string, string>;
    }> = {};

    constructor(base: BaseMcpConfig) {
        for (const name in base.mcpServers) {
            const entry = base.mcpServers[name];
            this.mcpServers[name] = {
                command: entry.command,
                args: entry.args,
                env: entry.env,
                url: entry.url,
                headers: entry.headers
            };
        }
    }
}

export class CursorHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'cursor',
        displayName: 'Cursor',
        root: ['.cursor', 'AGENTS.md', '.cursor/mcp.json'],
        features: ['Skills', 'AGENTS.md', 'MCP']
    };

    async applySkills(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.cursor/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }

    async applyMCP(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncJson(sourceRoot, targetRoot, 'mcp/mcp.json', '.cursor/mcp.json', direction, (data) => {
            return (direction === 'b2a') ? this._baseToAgent(data) : this._agentToBase(data);
        });
    }

    private _baseToAgent(base: BaseMcpConfig): CursorMcpConfig {
        return new CursorMcpConfig(base);
    }

    private _agentToBase(agentData: any): BaseMcpConfig {
        const mcpServers: Record<string, any> = {};
        const raw = agentData.mcpServers || {};
        for (const name in raw) {
            const entry = raw[name];
            mcpServers[name] = {
                command: entry.command,
                args: entry.args,
                env: entry.env,
                url: entry.url,
                headers: entry.headers
            };
        }
        return { mcpServers };
    }
}
