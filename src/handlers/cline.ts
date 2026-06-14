import { BaseHandler, ToolConfig } from './base';

export class ClineHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'cline',
        displayName: 'Cline',
        root: '.clinerules/',
        switchPaths: ['.clinerules/', 'AGENTS.md'],
        features: ['Skills', 'AGENTS.md'],
        // Official website: https://docs.cline.bot/cline-overview
        // rules (	.clinerules/), skills(.cline/skills/, .clinerules/skills/)
        featurePaths: ['.clinerules/', 'AGENTS.md', '.cline/']
        // Not supported: plugins(?), mcp(not project level), hooks(?)
    };

    async applySkills(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        // Cline uses .clinerules/skills/
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.clinerules/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        // Cline uses AGENTS.md at root
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }
}
