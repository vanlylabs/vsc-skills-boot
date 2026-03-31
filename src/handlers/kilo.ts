import { BaseHandler, ToolConfig } from './base';

export class KiloHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'kilo',
        displayName: 'Kilo',
        root: ['.kilocode', 'AGENTS.md'],
        features: ['Skills', 'AGENTS.md']
    };

    // async applyRules(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFolder(sourceRoot, targetRoot, 'rules', '.kilocode/rules', direction);
    // }

    // async applyWorkflows(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFolder(sourceRoot, targetRoot, 'workflows', '.kilocode/workflows', direction);
    // }

    async applySkills(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.kilocode/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }

    // async applyMCP(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFile(sourceRoot, targetRoot, 'mcp/mcp.json', '.kilocode/mcp.json', direction);
    // }
}
