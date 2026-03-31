import { BaseHandler, ToolConfig } from './base';

export class CursorHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'cursor',
        displayName: 'Cursor',
        root: ['.cursor', 'AGENTS.md'],
        features: ['Skills', 'AGENTS.md']
    };

    // async applyRules(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFolder(sourceRoot, targetRoot, 'rules', '.cursor/rules', direction);
    // }

    async applySkills(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.cursor/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }

    // async applyMCP(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFile(sourceRoot, targetRoot, 'mcp/mcp.json', '.cursor/mcp.json', direction);
    // }
}
