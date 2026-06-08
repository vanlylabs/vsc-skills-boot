import * as fs from 'fs';
import * as path from 'path';
import { manager } from '../extensionManager';
import { copyFolderSync } from '../handlers';

export interface InstructionHandler {
    id: string;
    syncSourceToVariant: (sourceBase: string, variantPath: string) => Promise<void>;
    syncVariantToSource: (variantPath: string, sourceBase: string) => Promise<void>;
    scaffold: (targetDir: string, selectedFeatures: string[], embeddedTemplateRoot: string) => Promise<void>;
    importProject: (projectRoot: string, templatePath: string, variantPath: string, selectedFeatures: string[]) => Promise<void>;
    detect: (projectRoot: string) => boolean;
}

export type ToolFeature = 'Rules' | 'Workflows' | 'Skills' | 'AGENTS.md' | 'MCP';

/**
 * Central MCP configuration — the canonical shape stored in template mcp/mcp.json.
 * Uses Claude Code's mcpServers format as the base.
 */
export class BaseMcpConfig {
    mcpServers: Record<string, {
        command?: string;
        args?: string[];
        env?: Record<string, string>;
        env_vars?: string[];
        url?: string;
        headers?: Record<string, string>;
        env_http_headers?: string[];
        type?: string;
        enabled?: boolean;
        timeout?: number;
        enabled_tools?: string[];
        disabled_tools?: string[];
        startup_timeout_sec?: number;
        tool_timeout_sec?: number;
    }> = {};
}

export interface ToolConfig {
    id: string;
    displayName: string;
    root: string[];
    features: ToolFeature[];
    featurePaths?: string[];
}

export abstract class BaseHandler implements InstructionHandler {
    abstract metadata: ToolConfig;

    get id(): string { return this.metadata.id; }
    get displayName(): string { return this.metadata.displayName; }
    get root(): string[] { return this.metadata.root; }

    // --- Support Checks ---
    hasFeature(name: ToolFeature): boolean {
        return this.metadata.features.includes(name);
    }

    // --- Action Methods ---
    // subclasses implement these to define their unique paths
    async applyRules(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> { }
    async applySkills(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> { }
    async applyWorkflows(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> { }
    async applyAgentsmd(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> { }
    async applyMCP(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b'): Promise<void> { }

    // --- UI Configuration ---
    getConfig(): ToolConfig {
        return this.metadata;
    }

    // --- InstructionHandler Implementation ---
    async syncSourceToVariant(sourceBase: string, variantPath: string): Promise<void> {
        if (!fs.existsSync(variantPath)) fs.mkdirSync(variantPath, { recursive: true });
        await this.syncAll(sourceBase, variantPath, 'b2a');
    }

    async syncVariantToSource(variantPath: string, sourceBase: string): Promise<void> {
        await this.syncAll(sourceBase, variantPath, 'a2b');
    }

    async scaffold(targetDir: string, selectedFeatures: string[], embeddedTemplateRoot: string): Promise<void> {
        const features = (selectedFeatures && selectedFeatures.length > 0)
            ? (selectedFeatures as ToolFeature[])
            : this.metadata.features;

        await this.applyCanonical(embeddedTemplateRoot, targetDir, features);
    }

    async importProject(projectRoot: string, templatePath: string, variantPath: string, selectedFeatures: string[]): Promise<void> {
        const features = (selectedFeatures && selectedFeatures.length > 0)
            ? (selectedFeatures as ToolFeature[])
            : this.metadata.features;

        // Import project -> Template store (a2b)
        await this.applyFeatures(templatePath, projectRoot, 'a2b', features);

        // Update Variant root (b2a)
        await this.applyFeatures(templatePath, variantPath, 'b2a', features);
    }

    detect(projectRoot: string): boolean {
        // Priority: Tool-specific roots
        for (const rootPath of this.root) {
            if (rootPath === 'AGENTS.md') continue;
            if (fs.existsSync(path.join(projectRoot, rootPath))) return true;
        }
        // Fallback: AGENTS.md
        if (this.root.includes('AGENTS.md')) {
            if (fs.existsSync(path.join(projectRoot, 'AGENTS.md'))) return true;
        }
        return false;
    }

    protected async applyCanonical(sourceRoot: string, targetRoot: string, features: ToolFeature[]): Promise<void> {
        if (features.includes('Rules')) this.syncFolder(sourceRoot, targetRoot, 'rules', 'rules', 'b2a');
        if (features.includes('Workflows')) this.syncFolder(sourceRoot, targetRoot, 'workflows', 'workflows', 'b2a');
        if (features.includes('Skills')) this.syncFolder(sourceRoot, targetRoot, 'skills', 'skills', 'b2a');
        if (features.includes('AGENTS.md')) this.syncFolder(sourceRoot, targetRoot, 'agentsmd', 'agentsmd', 'b2a');
        if (features.includes('MCP')) this.syncFolder(sourceRoot, targetRoot, 'mcp', 'mcp', 'b2a');
    }

    protected async applyFeatures(sourceRoot: string, targetRoot: string, direction: 'b2a' | 'a2b', features: ToolFeature[]): Promise<void> {
        if (features.includes('Rules')) await this.applyRules(sourceRoot, targetRoot, direction);
        if (features.includes('Workflows')) await this.applyWorkflows(sourceRoot, targetRoot, direction);
        if (features.includes('Skills')) await this.applySkills(sourceRoot, targetRoot, direction);
        if (features.includes('AGENTS.md')) await this.applyAgentsmd(sourceRoot, targetRoot, direction);
        if (features.includes('MCP')) await this.applyMCP(sourceRoot, targetRoot, direction);
    }

    protected async syncAll(sourceRoot: string, variantPath: string, direction: 'b2a' | 'a2b'): Promise<void> {
        await this.applyFeatures(sourceRoot, variantPath, direction, this.metadata.features);
    }

    // --- Common Sync Utilities ---
    protected syncFolder(sourceRoot: string, targetRoot: string, sourceRel: string, targetRel: string, direction: 'b2a' | 'a2b', recursive: boolean = true) {
        const srcPath = path.join(direction === 'b2a' ? sourceRoot : targetRoot, direction === 'b2a' ? sourceRel : targetRel);
        const destPath = path.join(direction === 'b2a' ? targetRoot : sourceRoot, direction === 'b2a' ? targetRel : sourceRel);

        if (fs.existsSync(srcPath)) {
            copyFolderSync(srcPath, destPath, recursive);
        }
    }

    protected syncFile(sourceRoot: string, targetRoot: string, sourceRel: string, targetRel: string, direction: 'b2a' | 'a2b') {
        const srcPath = path.join(direction === 'b2a' ? sourceRoot : targetRoot, direction === 'b2a' ? sourceRel : targetRel);
        const destPath = path.join(direction === 'b2a' ? targetRoot : sourceRoot, direction === 'b2a' ? targetRel : sourceRel);

        if (fs.existsSync(srcPath)) {
            if (!fs.existsSync(path.dirname(destPath))) fs.mkdirSync(path.dirname(destPath), { recursive: true });
            const srcStat = fs.statSync(srcPath);
            if (!fs.existsSync(destPath) || srcStat.mtimeMs > fs.statSync(destPath).mtimeMs) {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    protected syncPattern(sourceRoot: string, targetRoot: string, sourceDirRel: string, targetPatternPathRel: string, direction: 'b2a' | 'a2b') {
        const patternBase = path.basename(targetPatternPathRel);
        const patternDir = path.dirname(targetPatternPathRel);
        const [prefix, suffix] = patternBase.split('${basename}');
        const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
        const regex = new RegExp(`^${escapeRegExp(prefix)}(.+)${escapeRegExp(suffix)}$`);

        if (direction === 'b2a') {
            const srcPath = path.join(sourceRoot, sourceDirRel);
            if (!fs.existsSync(srcPath)) return;
            const destBaseFull = path.join(targetRoot, patternDir);
            if (!fs.existsSync(destBaseFull)) fs.mkdirSync(destBaseFull, { recursive: true });

            const files = fs.readdirSync(srcPath);
            for (const file of files) {
                if (fs.statSync(path.join(srcPath, file)).isDirectory()) continue;
                const basename = path.basename(file, path.extname(file));
                const targetName = patternBase.replace('${basename}', basename);
                const targetFilePath = path.join(destBaseFull, targetName);
                const sourceFilePath = path.join(srcPath, file);

                const srcStat = fs.statSync(sourceFilePath);
                if (!fs.existsSync(targetFilePath) || srcStat.mtimeMs > fs.statSync(targetFilePath).mtimeMs) {
                    fs.copyFileSync(sourceFilePath, targetFilePath);
                }
            }
        } else {
            const variantDir = path.join(targetRoot, patternDir);
            const templateDir = path.join(sourceRoot, sourceDirRel);
            if (!fs.existsSync(variantDir)) return;
            if (!fs.existsSync(templateDir)) fs.mkdirSync(templateDir, { recursive: true });

            const files = fs.readdirSync(variantDir);
            for (const file of files) {
                const match = file.match(regex);
                if (match) {
                    const basename = match[1];
                    const sourceFiles = fs.readdirSync(templateDir).filter(f => {
                        const fb = path.basename(f, path.extname(f));
                        return fb === basename;
                    });
                    const sourceFilename = sourceFiles.length > 0 ? sourceFiles[0] : `${basename}.md`;
                    const sourceFilePath = path.join(templateDir, sourceFilename);
                    const variantFilePath = path.join(variantDir, file);

                    if (fs.statSync(variantFilePath).isDirectory()) continue;
                    const varStat = fs.statSync(variantFilePath);
                    if (!fs.existsSync(sourceFilePath) || varStat.mtimeMs > fs.statSync(sourceFilePath).mtimeMs) {
                        fs.copyFileSync(variantFilePath, sourceFilePath);
                    }
                }
            }
        }
    }

    protected syncJson(sourceRoot: string, targetRoot: string, sourceRel: string, targetRel: string, direction: 'b2a' | 'a2b', transform?: (data: any) => any) {
        const srcPath = path.join(direction === 'b2a' ? sourceRoot : targetRoot, direction === 'b2a' ? sourceRel : targetRel);
        const destPath = path.join(direction === 'b2a' ? targetRoot : sourceRoot, direction === 'b2a' ? targetRel : sourceRel);

        if (fs.existsSync(srcPath)) {
            if (!fs.existsSync(path.dirname(destPath))) fs.mkdirSync(path.dirname(destPath), { recursive: true });
            const srcStat = fs.statSync(srcPath);
            if (!fs.existsSync(destPath) || srcStat.mtimeMs > fs.statSync(destPath).mtimeMs) {
                try {
                    let data = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
                    if (transform) data = transform(data);
                    fs.writeFileSync(destPath, JSON.stringify(data, null, 2));
                } catch (err: any) {
                    manager.log.error(`[SkillsBoot] Error syncing JSON from ${srcPath} to ${destPath}: ${err.message}`);
                }
            }
        }
    }
}
