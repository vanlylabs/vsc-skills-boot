import { BaseHandler, ToolConfig, BaseMcpConfig } from './base';

class ClaudeMcpConfig {
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

export class ClaudeCodeHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'claudecode',
        displayName: 'Claude Code',
        root: '.claude/',
        switchPaths: ['.claude/', 'CLAUDE.md', '.mcp.json'],
        features: ['Skills', 'AGENTS.md', 'MCP'],
        // Official website: https://code.claude.com/docs
        // CLAUDE.md(CLAUDE.md or ./.claude/CLAUDE.md), rules(.claude/rules/), Skills(.claude/skills/), MCP(.mcp.json), Agent(.claude/agents/), hooks(.claude/settings.json)
        featurePaths: ['.claude.json', '.claude/', 'CLAUDE.md', '.mcp.json']
        // NOT supported: agent teams (not supported in project level), plugins(?)
    };

    async applySkills(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.claude/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'CLAUDE.md', direction);
    }

    async applyMCP(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncJson(sourceRoot, targetRoot, 'mcp/mcp.json', '.mcp.json', direction, (data) => {
            return (direction === 'b2a') ? this._baseToAgent(data) : this._agentToBase(data);
        });
    }

    private _baseToAgent(base: BaseMcpConfig): ClaudeMcpConfig {
        return new ClaudeMcpConfig(base);
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
