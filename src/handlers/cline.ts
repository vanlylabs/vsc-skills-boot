import { BaseHandler, ToolConfig } from './base';

export class ClineHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'cline',
        displayName: 'Cline',
        root: ['.clinerules', 'AGENTS.md'],
        features: ['Skills', 'AGENTS.md']
        // root: ['.clinerules', 'AGENTS.md'],
        // features: ['Rules', 'Workflows', 'Skills', 'Agents']
    };

    // async applyRules(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFolder(sourceRoot, targetRoot, 'rules', '.clinerules', direction, false);
    // }

    // async applyWorkflows(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFolder(sourceRoot, targetRoot, 'workflows', '.clinerules/workflows', direction);
    // }

    async applySkills(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.clinerules/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }
}
