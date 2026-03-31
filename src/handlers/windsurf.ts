import { BaseHandler, ToolConfig } from './base';

export class WindsurfHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'windsurf',
        displayName: 'Windsurf',
        root: ['.windsurf', 'AGENTS.md'],
        features: ['Skills', 'AGENTS.md']
    };

    // async applyRules(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFolder(sourceRoot, targetRoot, 'rules', '.windsurf/rules', direction);
    // }

    async applySkills(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.windsurf/skills', direction);
    }

    // async applyWorkflows(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncFolder(sourceRoot, targetRoot, 'workflows', '.windsurf/workflows', direction);
    // }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }
}
