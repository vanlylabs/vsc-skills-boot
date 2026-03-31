import { BaseHandler, ToolConfig } from './base';

export class GithubCopilotHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'githubcopilot',
        displayName: 'GitHub Copilot',
        root: ['.github', 'AGENTS.md'],
        // root: ['.github', 'AGENTS.md', '.vscode/mcp.json'],
        features: ['Skills', 'AGENTS.md']
    };

    // async applyRules(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncPattern(sourceRoot, targetRoot, 'rules', '.github/${basename}.instructions.md', direction);
    // }

    // async applyWorkflows(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncPattern(sourceRoot, targetRoot, 'workflows', '.github/prompts/${basename}.prompt.md', direction);
    // }

    async applySkills(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.github/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }

    // async applyMCP(sourceRoot: string, targetRoot: string, direction: 's2v' | 'v2s'): Promise<void> {
    //     this.syncJson(sourceRoot, targetRoot, 'mcp/mcp.json', '.vscode/mcp.json', direction, (data) => {
    //         if (direction === 's2v') {
    //             if (data.mcpServers) {
    //                 data.servers = data.mcpServers;
    //                 delete data.mcpServers;
    //             }
    //         } else {
    //             if (data.servers) {
    //                 data.mcpServers = data.servers;
    //                 delete data.servers;
    //             }
    //         }
    //         return data;
    //     });
    // }
}
