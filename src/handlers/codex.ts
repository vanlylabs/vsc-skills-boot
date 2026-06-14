import * as fs from 'fs';
import * as path from 'path';
import * as TOML from '@iarna/toml';
import { BaseHandler, ToolConfig, BaseMcpConfig } from './base';

class CodexMcpConfig {
    mcp_servers: Record<string, {
        command?: string;
        args?: string[];
        url?: string;
        env?: Record<string, string>;
        env_vars?: string[];
        http_headers?: Record<string, string>;
        env_http_headers?: string[];
        enabled?: boolean;
        enabled_tools?: string[];
        disabled_tools?: string[];
        startup_timeout_sec?: number;
        tool_timeout_sec?: number;
    }> = {};

    constructor(base: BaseMcpConfig) {
        for (const name in base.mcpServers) {
            const entry = base.mcpServers[name];
            this.mcp_servers[name] = {
                command: entry.command,
                args: entry.args,
                url: entry.url,
                env: entry.env,
                env_vars: entry.env_vars,
                http_headers: entry.headers,
                env_http_headers: entry.env_http_headers,
                enabled: entry.enabled,
                enabled_tools: entry.enabled_tools,
                disabled_tools: entry.disabled_tools,
                startup_timeout_sec: entry.startup_timeout_sec,
                tool_timeout_sec: entry.tool_timeout_sec
            };
        }
    }
}

export class CodexHandler extends BaseHandler {
    metadata: ToolConfig = {
        id: 'codex',
        displayName: 'Codex',
        root: '.agents/',
        switchPaths: ['.agents/', 'AGENTS.md', '.codex/config.toml'],
        features: ['Skills', 'AGENTS.md', 'MCP'],
        // Official website:https://developers.openai.com/codex/
        // skills (agents/skills), agents(.codex/agents/), mcp(.codex/config.toml), hook(.codex/hooks.json, .codex/config.toml), rules(.codex/rules/)
        featurePaths: ['.agents/', 'AGENTS.md', '.codex/',]
    };

    async applySkills(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFolder(sourceRoot, targetRoot, 'skills', '.agents/skills', direction);
    }

    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        this.syncFile(sourceRoot, targetRoot, 'agentsmd/AGENTS.md', 'AGENTS.md', direction);
    }

    async applyMCP(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> {
        const templatePath = path.join(sourceRoot, 'mcp/mcp.json');
        const projectPath = path.join(targetRoot, '.codex/config.toml');

        if (direction === 'b2a') {
            if (!fs.existsSync(templatePath)) return;
            const baseData = JSON.parse(fs.readFileSync(templatePath, 'utf8')) as BaseMcpConfig;
            const agentData = this._baseToAgent(baseData);

            let projectData: any = {};
            if (fs.existsSync(projectPath)) {
                try {
                    projectData = TOML.parse(fs.readFileSync(projectPath, 'utf8'));
                } catch (e) {
                    projectData = {};
                }
            }

            // Merge MCP servers into the mcp_servers table
            projectData.mcp_servers = agentData.mcp_servers;

            if (!fs.existsSync(path.dirname(projectPath))) fs.mkdirSync(path.dirname(projectPath), { recursive: true });
            fs.writeFileSync(projectPath, TOML.stringify(projectData));
        } else {
            if (!fs.existsSync(projectPath)) return;
            const projectContent = fs.readFileSync(projectPath, 'utf8');
            const base = this._agentToBase(projectContent);
            if (!fs.existsSync(path.dirname(templatePath))) fs.mkdirSync(path.dirname(templatePath), { recursive: true });
            fs.writeFileSync(templatePath, JSON.stringify(base, null, 2));
        }
    }

    private _baseToAgent(base: BaseMcpConfig): CodexMcpConfig {
        return new CodexMcpConfig(base);
    }

    private _agentToBase(tomlString: string): BaseMcpConfig {
        const parsed = TOML.parse(tomlString) as any;
        const mcpServers: Record<string, any> = {};
        const raw = parsed.mcp_servers || {};
        for (const name in raw) {
            const entry = raw[name];
            mcpServers[name] = {
                command: entry.command,
                args: entry.args,
                url: entry.url,
                env: entry.env,
                env_vars: entry.env_vars,
                headers: entry.http_headers,
                env_http_headers: entry.env_http_headers,
                enabled: entry.enabled,
                enabled_tools: entry.enabled_tools,
                disabled_tools: entry.disabled_tools,
                startup_timeout_sec: entry.startup_timeout_sec,
                tool_timeout_sec: entry.tool_timeout_sec
            };
        }
        return { mcpServers };
    }
}
