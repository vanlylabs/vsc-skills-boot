import * as fs from 'fs';
import * as path from 'path';
import { manager } from './extensionManager';
import { InstructionHandler, ToolConfig } from './handlers/base';
import { KiloHandler } from './handlers/kilo';
import { ClineHandler } from './handlers/cline';
import { ClaudeCodeHandler } from './handlers/claudecode';
import { GithubCopilotHandler } from './handlers/githubcopilot';
import { CursorHandler } from './handlers/cursor';
import { CodexHandler } from './handlers/codex';
import { WindsurfHandler } from './handlers/windsurf';

export { InstructionHandler, ToolConfig };

export const handlers: Record<string, InstructionHandler & { getConfig(): ToolConfig }> = {
    'githubcopilot': new GithubCopilotHandler(),
    'kilo': new KiloHandler(),
    'cline': new ClineHandler(),
    'claudecode': new ClaudeCodeHandler(),
    'cursor': new CursorHandler(),
    'codex': new CodexHandler(),
    'windsurf': new WindsurfHandler()
};

/**
 * Helper to recursively copy directories with mtime check to prevent infinite loops.
 */
export function copyFolderSync(from: string, to: string, recursive: boolean = true) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        if (['workspace', '.git', '.vscode', '.github', 'node_modules'].includes(element)) return;
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        const stat = fs.lstatSync(fromPath);

        if (stat.isFile()) {
            if (!fs.existsSync(toPath)) {
                manager.log.info(`[SkillsBoot] [copyFolderSync] >> Copying new file: ${fromPath} -> ${toPath}`);
                fs.copyFileSync(fromPath, toPath);
            } else {
                const toStat = fs.statSync(toPath);
                if (stat.mtimeMs > toStat.mtimeMs) {
                    manager.log.info(`[SkillsBoot] [copyFolderSync] >> Syncing file: ${fromPath} -> ${toPath} (${stat.mtimeMs} > ${toStat.mtimeMs})`);
                    fs.copyFileSync(fromPath, toPath);
                } else {
                    manager.log.debug(`[SkillsBoot] [copyFolderSync] Skipping ${element} (not newer: ${stat.mtimeMs} <= ${toStat.mtimeMs})`);
                }
            }
        } else if (stat.isDirectory() && recursive) {
            copyFolderSync(fromPath, toPath, recursive);
        }
    });
}