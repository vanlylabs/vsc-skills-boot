import { BaseHandler, ToolConfig, BaseMcpConfig } from './base';

class CopilotMcpConfig {
    servers: Record<string, {
        command?: string;
        args?: string[];
        url?: string;
        type?: 'stdio' | 'http';
        headers?: Record<string, string>;
        env?: Record<string, string>;

    }> = {};

    constructor(base: BaseMcpConfig) {
        for (const name in base.mcpServers) {
            const entry = base.mcpServers[name];
            this.servers[name] = {
                command: entry.command,
                args: entry.args,
                url: entry.url,
                type: entry.url ? 'http' : 'stdio',
                headers: entry.headers,
                env: entry.env
            };
        }
    }
}

export class GithubCopilotHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'githubcopilot',
        displayName: 'GitHub Copilot',
        root: ['.github', 'AGENTS.md', '.vscode/mcp.json'],
        features: ['Skills', 'AGENTS.md', 'MCP']
    };

    async applySkills(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.github/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }

    async applyMCP(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncJson(sourceRoot, targetRoot, 'mcp/mcp.json', '.vscode/mcp.json', direction, (data) => {
            return (direction === 'b2a') ? this._baseToAgent(data) : this._agentToBase(data);
        });
    }

    private _baseToAgent(base: BaseMcpConfig): CopilotMcpConfig {
        return new CopilotMcpConfig(base);
    }

    private _agentToBase(agentData: any): BaseMcpConfig {
        const mcpServers: Record<string, any> = {};
        const raw = agentData.servers || {};
        for (const name in raw) {
            const entry = raw[name];
            mcpServers[name] = {
                command: entry.command,
                args: entry.args,
                url: entry.url,
                type: entry.type === 'http' ? 'remote' : 'local',
                headers: entry.headers,
                env: entry.env
            };
        }
        return { mcpServers };
    }
}
