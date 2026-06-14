import { BaseHandler, ToolConfig } from './base';

export class WindsurfHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'windsurf',
        displayName: 'Windsurf',
        root: '.windsurf/',
        switchPaths: ['.windsurf/'],
        features: ['Skills', 'AGENTS.md'],
        // Official website: https://docs.devin.ai/product-guides/
        // rules(.windsurfrules), skills(.windsurf/skills/, .agents/skills), rules(.devin/rules)
        featurePaths: ['.windsurfrules', '.windsurf/', '.agents/', '.devin/']
    };

    async applySkills(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.windsurf/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }
}
