import { BaseHandler, ToolConfig } from './base';

export class ClaudeCodeHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'claudecode',
        displayName: 'Claude Code',
        root: ['.claude', 'CLAUDE.md'],
        features: ['Skills', 'AGENTS.md']
        // root: ['.claude', 'CLAUDE.md', '.mcp.json'],
        // features: ['Skills', 'Agents', 'MCP']
    };

    async applySkills(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.claude/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'CLAUDE.md', direction);
    }

    // async applyMCP(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFile(sourceRoot, targetRoot, 'mcp/mcp.json', '.mcp.json', direction);
    // }
}
