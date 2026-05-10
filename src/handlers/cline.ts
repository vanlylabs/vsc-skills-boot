import { BaseHandler, ToolConfig } from './base';

export class ClineHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'cline',
        displayName: 'Cline',
        root: ['.clinerules'],
        features: ['Skills', 'AGENTS.md']
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
