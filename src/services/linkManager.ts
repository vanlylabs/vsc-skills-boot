import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { manager } from '../extensionManager';
import { handlers, ToolConfig } from '../handlers';
import { storageService } from './storageService';

export class LinkManager {
    private getLinkPaths(config: ToolConfig, agentLockEnabled: boolean): string[] {
        const paths = [...config.root];
        if (agentLockEnabled && config.featurePaths) {
            for (const fp of config.featurePaths) {
                const isSubPath = config.root.some(r => fp.startsWith(r + '/') || fp.startsWith(r + '\\'));
                if (!isSubPath) {
                    paths.push(fp);
                }
            }
        }
        return paths;
    }

    public async applyLinks(projectRoot: string, instructionId: string, toolId: string, agentLockEnabled: boolean = false): Promise<string[]> {
        const handler = handlers[toolId];
        if (!handler) throw new Error(`Handler for ${toolId} not found`);

        const config = handler.getConfig();
        const paths = this.getLinkPaths(config, agentLockEnabled);
        const expandedRoots: { raw: string, expanded: string }[] = [];
        const conflicts: string[] = [];

        for (const rootPath of paths) {
            const expanded = rootPath.replace('${basename}', instructionId);
            expandedRoots.push({ raw: rootPath, expanded });

            const targetPath = path.join(projectRoot, expanded);
            try {
                const stat = fs.lstatSync(targetPath);
                if (!stat.isSymbolicLink()) {
                    conflicts.push(expanded);
                }
            } catch (e) { }
        }

        return conflicts;
    }

    public executeLinks(projectRoot: string, instructionId: string, toolId: string, variantDir: string, agentLockEnabled: boolean = false) {
        const handler = handlers[toolId];
        const config = handler.getConfig();
        const paths = this.getLinkPaths(config, agentLockEnabled);

        for (const rootPath of paths) {
            const expanded = rootPath.replace('${basename}', instructionId);
            const targetPath = path.join(projectRoot, expanded);
            const actualSourcePath = path.join(variantDir, expanded);

            if (fs.existsSync(actualSourcePath)) {
                this.removePath(targetPath, true);

                const isDir = fs.statSync(actualSourcePath).isDirectory();
                const type = os.platform() === 'win32' ? (isDir ? 'junction' : 'file') : (isDir ? 'dir' : 'file');

                const parent = path.dirname(targetPath);
                if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });

                manager.log.info("[SkillsBoot] Linking: {} -> {}", actualSourcePath, targetPath);
                fs.symlinkSync(actualSourcePath, targetPath, type);
            }
        }
    }

    public unlinkTool(projectRoot: string, instructionId: string, toolId: string, agentLockEnabled: boolean = false) {
        const handler = handlers[toolId];
        if (!handler) return;

        const config = handler.getConfig();
        const paths = this.getLinkPaths(config, agentLockEnabled);
        for (const rootPath of paths) {
            const expanded = rootPath.replace('${basename}', instructionId);
            const fullPath = path.join(projectRoot, expanded);
            this.removePath(fullPath, false);
        }
    }

    public verifyLinks(projectRoot: string, instructionId: string, toolId: string, agentLockEnabled: boolean = false): boolean {
        const handler = handlers[toolId];
        if (!handler) return false;

        const config = handler.getConfig();
        const paths = this.getLinkPaths(config, agentLockEnabled);
        const variantDir = storageService.getVariantPath(instructionId, toolId);

        for (const rootPath of paths) {
            const expanded = rootPath.replace('${basename}', instructionId);
            const fullPath = path.join(projectRoot, expanded);
            const sourcePath = path.join(variantDir, expanded);
            try {
                if (!fs.lstatSync(fullPath).isSymbolicLink()) return false;
            } catch (e) {
                // Path doesn't exist in project — only fail if the source exists
                // (meaning a symlink should have been created but wasn't)
                if (fs.existsSync(sourcePath)) return false;
                // Source also doesn't exist, so no symlink was expected — OK
                continue;
            }
        }
        return true;
    }

    private removePath(fullPath: string, allowDelete: boolean = false) {
        try {
            const stat = fs.lstatSync(fullPath);
            const parent = path.dirname(fullPath);

            if (stat.isSymbolicLink()) {
                fs.unlinkSync(fullPath);
            } else if (allowDelete) {
                if (stat.isDirectory()) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(fullPath);
                }
            }

            // Clean up parent if empty (safely)
            if (fs.existsSync(parent) && fs.readdirSync(parent).length === 0) {
                // Don't delete root or critical folders
                const basename = path.basename(parent);
                if (['.vscode', '.github', '.kilocode', '.claude', '.cursor', '.codex', '.agents', '.kilo'].includes(basename)) {
                    fs.rmdirSync(parent);
                }
            }
        } catch (e) { }
    }
}

export const linkManager = new LinkManager();
