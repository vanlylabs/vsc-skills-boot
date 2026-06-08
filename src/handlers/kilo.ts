import * as fs from 'fs';
import * as path from 'path';
import * as jsonc from 'jsonc-parser';
import { BaseHandler, ToolConfig, BaseMcpConfig } from './base';

class KiloMcpConfig {
    mcp: Record<string, {
        type?: 'local' | 'remote';
        command?: string[];
        url?: string;
        environment?: Record<string, string>;
        headers?: Record<string, string>;
        enabled?: boolean;
        timeout?: number;
    }> = {};

    constructor(base: BaseMcpConfig) {
        for (const name in base.mcpServers) {
            const entry = base.mcpServers[name];
            this.mcp[name] = {
                type: entry.url ? 'remote' : 'local',
                url: entry.url,
                command: entry.command ? [entry.command, ...(entry.args || [])] : undefined,
                environment: entry.env,
                headers: entry.headers,
                enabled: entry.enabled,
                timeout: entry.timeout
            };
        }
    }
}

export class KiloHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'kilo',
        displayName: 'Kilo',
        root: ['.kilocode', 'AGENTS.md', '.kilo/kilo.jsonc'],
        features: ['Skills', 'AGENTS.md', 'MCP'],
        // Official website: https://docs.kilohq.com/
        featurePaths: ['.kilocode/rules', '.kilocode/agents']
    };

    async applySkills(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.kilocode/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }

    async applyMCP(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        const templatePath = path.join(sourceRoot, 'mcp/mcp.json');
        const projectPath = path.join(targetRoot, '.kilo/kilo.jsonc');

        if (direction === 'b2a') {
            if (!fs.existsSync(templatePath)) return;
            const base = JSON.parse(fs.readFileSync(templatePath, 'utf8')) as BaseMcpConfig;
            const agentData = this._baseToAgent(base);

            let projectContent = '{}';
            if (fs.existsSync(projectPath)) {
                projectContent = fs.readFileSync(projectPath, 'utf8');
            }

            const edits = jsonc.modify(projectContent, ['mcp'], agentData.mcp, {
                formattingOptions: { insertSpaces: true, tabSize: 2, eol: '\n' }
            });
            const updatedContent = jsonc.applyEdits(projectContent, edits);

            if (!fs.existsSync(path.dirname(projectPath))) fs.mkdirSync(path.dirname(projectPath), { recursive: true });
            fs.writeFileSync(projectPath, updatedContent);
        } else {
            if (!fs.existsSync(projectPath)) return;
            const projectContent = fs.readFileSync(projectPath, 'utf8');
            const projectData = jsonc.parse(projectContent);
            if (!projectData.mcp) return;

            const base = this._agentToBase(projectData);
            if (!fs.existsSync(path.dirname(templatePath))) fs.mkdirSync(path.dirname(templatePath), { recursive: true });
            fs.writeFileSync(templatePath, JSON.stringify(base, null, 2));
        }
    }

    private _baseToAgent(base: BaseMcpConfig): KiloMcpConfig {
        return new KiloMcpConfig(base);
    }

    private _agentToBase(agentData: any): BaseMcpConfig {
        const mcpServers: Record<string, any> = {};
        const raw = agentData.mcp || {};
        for (const name in raw) {
            const entry = raw[name];
            const baseEntry: any = {
                url: entry.url,
                env: entry.environment,
                headers: entry.headers,
                enabled: entry.enabled,
                timeout: entry.timeout,
                type: entry.type === 'remote' ? 'remote' : 'local'
            };
            if (Array.isArray(entry.command) && entry.command.length > 0) {
                baseEntry.command = entry.command[0];
                if (entry.command.length > 1) baseEntry.args = entry.command.slice(1);
            }
            mcpServers[name] = baseEntry;
        }
        return { mcpServers };
    }
}
