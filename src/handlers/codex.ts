import { BaseHandler, ToolConfig } from './base';

export class CodexHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'codex',
        displayName: 'Codex',
        root: ['.agents', 'AGENTS.md'],
        features: ['Skills', 'AGENTS.md']
    };

    async applySkills(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.agents/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }
}
