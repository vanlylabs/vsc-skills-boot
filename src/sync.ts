import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { manager } from './extensionManager';
import { handlers } from './handlers';
import { storageService } from './services/storageService';
import { SYNC_DEBOUNCE_MS, SYNC_LOCK_TIMEOUT_MS } from './config';

const syncLocks = new Set<string>();
const debounceTimeouts = new Map<string, NodeJS.Timeout>();
const instructionSyncInProgress = new Set<string>();

/**
 * Syncs a specific variant back to the template, then updates all other variants.
 */
export async function syncVariantToTemplate(instructionName: string, toolId: string): Promise<void> {
    const lockKey = `${instructionName}:${toolId}`;

    if (syncLocks.has(lockKey) || instructionSyncInProgress.has(instructionName)) {
        return;
    }

    syncLocks.add(lockKey);
    instructionSyncInProgress.add(instructionName);

    try {
        const templatePath = storageService.getTemplatePath(instructionName);
        const variantPath = storageService.getVariantPath(instructionName, toolId);

        if (!fs.existsSync(templatePath) || !fs.existsSync(variantPath)) {
            return;
        }

        manager.log.info(`[SkillsBoot] [${instructionName}] === Syncing ${toolId} variant -> template ===`);

        // 1. Sync Variant -> Template
        if (handlers[toolId]) {
            await handlers[toolId].syncVariantToSource(variantPath, templatePath);
        }

        // 2. Fan-out: Sync Template -> All OTHER Variants
        await syncTemplateToVariants(instructionName, toolId);

    } catch (err) {
        manager.log.error(`[SkillsBoot] Sync failed: ${err}`);
    } finally {
        setTimeout(() => {
            instructionSyncInProgress.delete(instructionName);
            syncLocks.delete(lockKey);
        }, SYNC_LOCK_TIMEOUT_MS);
    }
}

/**
 * Syncs the template to all tool variants for this instruction.
 */
export async function syncTemplateToVariants(instructionName: string, skipToolId?: string): Promise<void> {
    const templatePath = storageService.getTemplatePath(instructionName);
    if (!fs.existsSync(templatePath)) return;

    const variantRoot = storageService.getVariantRoot(instructionName);
    if (!fs.existsSync(variantRoot)) return;

    const toolIds = fs.readdirSync(variantRoot).filter(d => fs.lstatSync(path.join(variantRoot, d)).isDirectory());

    for (const toolId of toolIds) {
        if (toolId === skipToolId) continue;
        if (handlers[toolId]) {
            const variantPath = storageService.getVariantPath(instructionName, toolId);
            manager.log.info(`[SkillsBoot] [${instructionName}] Fanning out: template -> ${toolId}`);
            await handlers[toolId].syncSourceToVariant(templatePath, variantPath);
        }
    }
}

export async function syncInstruction(instructionName: string, direction: 'a2b' | 'b2a' = 'a2b'): Promise<void> {
    if (direction === 'b2a') {
        await syncTemplateToVariants(instructionName);
    }
}

export function createWatcher(instructionName: string): vscode.FileSystemWatcher | null {
    const variantRoot = storageService.getVariantRoot(instructionName);
    if (!fs.existsSync(variantRoot)) return null;

    // Watch all files in the variant directory
    const pattern = new vscode.RelativePattern(variantRoot, '**/*');
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    const onChange = (uri: vscode.Uri) => {
        const relativePath = path.relative(variantRoot, uri.fsPath);
        const parts = relativePath.split(/[\\\/]/);
        const toolId = parts[0];

        if (!toolId || instructionSyncInProgress.has(instructionName)) return;

        // Filter junk
        if (parts.some(p => p === '.git') || relativePath.endsWith('~')) return;

        const debounceKey = `${instructionName}:${toolId}`;
        const existingTimeout = debounceTimeouts.get(debounceKey);
        if (existingTimeout) clearTimeout(existingTimeout);

        const newTimeout = setTimeout(async () => {
            try {
                await syncVariantToTemplate(instructionName, toolId);
            } catch (err) {
                manager.log.error(`[SkillsBoot] Sync error: ${err}`);
            } finally {
                debounceTimeouts.delete(debounceKey);
            }
        }, SYNC_DEBOUNCE_MS);

        debounceTimeouts.set(debounceKey, newTimeout);
    };

    watcher.onDidChange(onChange);
    watcher.onDidCreate(onChange);
    watcher.onDidDelete(onChange);

    return watcher;
}