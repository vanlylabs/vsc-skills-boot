import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { manager } from './extensionManager';
import { createWatcher, syncInstruction } from './sync';
import { handlers, ToolConfig } from './handlers';
import { storageService } from './services/storageService';
import { stateService } from './services/stateService';
import { linkManager } from './services/linkManager';
import { WebviewMessage, InstructionMetadata } from './types';
import { TEMPLATES_STORE, VARIANTS_STORE } from './config';

export function activate(context: vscode.ExtensionContext) {
    manager.init(context);
    stateService.init(context);

    [TEMPLATES_STORE, VARIANTS_STORE].forEach(p => {
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });

    manager.log.info('SkillsBoot active');

    let activeWatcher: vscode.Disposable | null = null;

    const startWatching = (instructionName: string) => {
        if (activeWatcher) {
            activeWatcher.dispose();
            activeWatcher = null;
        }
        const watcher = createWatcher(instructionName);
        if (watcher) {
            activeWatcher = watcher;
        }
    };

    const activeId = stateService.getActiveInstruction();
    if (activeId) startWatching(activeId);

    const provider = new SkillsBootViewProvider(
        context.extensionUri,
        (id) => startWatching(id),
        () => { if (activeWatcher) { activeWatcher.dispose(); activeWatcher = null; } }
    );
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('skillsboot.mainView', provider));
    context.subscriptions.push(vscode.commands.registerCommand('skillsboot.refreshWebview', () => provider.refresh()));
}

class SkillsBootViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _onInstructionApplied: (id: string) => void,
        private readonly _onInstructionUnlinked: () => void
    ) { }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlContent(webviewView.webview, this._extensionUri);

        webviewView.webview.onDidReceiveMessage(async (data: WebviewMessage) => {
            try {
                switch (data.type) {
                    case 'requestData': await this.refresh(); break;
                    case 'create': await this._handleCreate(data); break;
                    case 'apply': await this._handleApply(data.id, data.toolId); break;
                    case 'unlink': await this._handleUnlink(); break;
                    case 'delete': await this._handleDelete(data.id); break;
                    case 'edit': await this._handleEdit(data.id, data.name, data.description); break;
                    case 'duplicate': await this._handleDuplicate(data.sourceId, data.name, data.description); break;
                    case 'detectInstructions': await this._handleDetectInstructions(); break;
                    case 'import': await this._handleImport(data.name, data.description, data.toolId, data.features); break;
                }
            } catch (err: any) {
                manager.log.error(`[SkillsBoot] Error handling ${data.type}: ${err.message}`);
                vscode.window.showErrorMessage(err.message);
            }
        });
    }

    private async _handleCreate(data: { name: string, description: string, toolId: string, features: string[] }) {
        if (storageService.exists(data.name)) {
            this._view?.webview.postMessage({ type: 'createError', message: "Instruction already exists." });
            return;
        }

        const handler = handlers[data.toolId];
        if (!handler) throw new Error("Invalid tool selected.");

        const targetDir = storageService.getTemplatePath(data.name);
        fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(path.join(targetDir, 'description.md'), data.description || `# ${data.name}`);

        const embeddedTemplateRoot = path.join(this._extensionUri.fsPath, 'src', 'template');
        await handler.scaffold(targetDir, data.features, embeddedTemplateRoot);

        await this.refresh();
        await this._handleApply(data.name, data.toolId);
        vscode.window.showInformationMessage(`Instruction "${data.name}" initialized and applied.`);
    }

    private async _handleUnlink(silent: boolean = false) {
        const activeState = stateService.getActiveState();
        if (!activeState) return;

        const projectRoot = this._getProjectRoot();
        if (!projectRoot) return;

        linkManager.unlinkTool(projectRoot, activeState.id, activeState.toolId);

        await stateService.setActiveState(undefined, undefined);
        this._onInstructionUnlinked();
        await this.refresh();
        if (!silent) vscode.window.showInformationMessage('Unlinked instruction.');
    }

    private async _handleDelete(id: string) {
        const answer = await vscode.window.showWarningMessage(
            `Delete instruction "${id}"? This will permanently remove it.`,
            { modal: true }, 'Delete'
        );
        if (answer !== 'Delete') return;

        const activeState = stateService.getActiveState();
        if (activeState && activeState.id === id) {
            await this._handleUnlink(true);
        }

        storageService.deleteInstruction(id);
        await this.refresh();
        vscode.window.showInformationMessage(`Instruction "${id}" deleted.`);
    }

    private async _handleEdit(id: string, newName: string, newDescription: string) {
        const oldDir = storageService.getTemplatePath(id);
        if (!fs.existsSync(oldDir)) throw new Error(`Instruction ${id} not found`);

        const activeState = stateService.getActiveState();
        const wasActive = activeState?.id === id;
        const activeToolId = activeState?.toolId;

        if (wasActive) await this._handleUnlink(true);

        const newDir = storageService.getTemplatePath(newName);
        if (id !== newName) {
            if (fs.existsSync(newDir)) throw new Error(`Instruction ${newName} already exists`);
            fs.renameSync(oldDir, newDir);

            const oldVariantRoot = storageService.getVariantRoot(id);
            if (fs.existsSync(oldVariantRoot)) {
                fs.renameSync(oldVariantRoot, storageService.getVariantRoot(newName));
            }
        }

        fs.writeFileSync(path.join(newDir, 'description.md'), newDescription);

        if (wasActive && activeToolId) {
            await this._handleApply(newName, activeToolId);
        }

        await this.refresh();
        vscode.window.showInformationMessage('Instruction updated.');
    }

    private async _handleDuplicate(sourceId: string, newName: string, newDescription: string) {
        const sourceDir = storageService.getTemplatePath(sourceId);
        const targetDir = storageService.getTemplatePath(newName);

        if (!fs.existsSync(sourceDir)) throw new Error("Source not found");
        if (fs.existsSync(targetDir)) throw new Error("Target already exists");

        fs.cpSync(sourceDir, targetDir, { recursive: true });
        fs.writeFileSync(path.join(targetDir, 'description.md'), newDescription || `# ${newName}`);

        await this.refresh();
        vscode.window.showInformationMessage('Instruction duplicated.');
    }

    private async _handleDetectInstructions() {
        const projectRoot = this._getProjectRoot();
        if (!projectRoot) return;

        const order = ['githubcopilot', 'kilo', 'cline', 'claudecode'];
        for (const toolId of order) {
            if (handlers[toolId]?.detect(projectRoot)) {
                this._view?.webview.postMessage({
                    type: 'detected', toolId, name: '', description: 'Imported from project'
                });
                return;
            }
        }
        this._view?.webview.postMessage({ type: 'detectionFailed' });
    }

    private async _handleImport(name: string, description: string, toolId: string, features: string[]) {
        const templatePath = storageService.getTemplatePath(name);
        if (fs.existsSync(templatePath)) throw new Error(`Instruction ${name} already exists`);

        const projectRoot = this._getProjectRoot();
        if (!projectRoot) return;

        const variantPath = storageService.getVariantPath(name, toolId);
        fs.mkdirSync(templatePath, { recursive: true });
        fs.mkdirSync(variantPath, { recursive: true });

        await handlers[toolId].importProject(projectRoot, templatePath, variantPath, features);
        fs.writeFileSync(path.join(templatePath, 'description.md'), description);

        await this._handleApply(name, toolId);
        vscode.window.showInformationMessage(`Instruction "${name}" imported.`);
    }

    private async _handleApply(id: string, toolId: string) {
        const projectRoot = this._getProjectRoot();
        if (!projectRoot) return;

        const templateDir = storageService.getTemplatePath(id);
        const variantDir = storageService.getVariantPath(id, toolId);

        if (!fs.existsSync(templateDir)) throw new Error('Master template not found');
        if (!fs.existsSync(variantDir)) fs.mkdirSync(variantDir, { recursive: true });

        await handlers[toolId].syncSourceToVariant(templateDir, variantDir);

        const conflicts = await linkManager.applyLinks(projectRoot, id, toolId);
        if (conflicts.length > 0) {
            const msg = `SkillsBoot will replace these paths with links:\n\n${conflicts.join('\n')}\n\nProceed?`;
            const answer = await vscode.window.showWarningMessage(msg, { modal: true }, 'Proceed');
            if (answer !== 'Proceed') return;
        }

        await this._handleUnlink(true);
        linkManager.executeLinks(projectRoot, id, toolId, variantDir);

        await stateService.setActiveState(id, toolId);
        this._onInstructionApplied(id);
        await this.refresh();
    }

    public async refresh() {
        if (!this._view) return;
        this._view.webview.postMessage({
            type: 'update',
            instructions: storageService.getAllInstructions(),
            availableTools: Object.values(handlers).map(h => h.getConfig()),
            selected: stateService.getActiveState()
        });
    }

    private _getProjectRoot(): string | undefined {
        return vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    }

    private _getHtmlContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const toolkitUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode-elements', 'elements', 'dist', 'bundled.js'));
        const htmlPath = vscode.Uri.joinPath(extensionUri, 'src', 'media', 'home.html');
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'media', 'home.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'media', 'home.css'));

        return fs.readFileSync(htmlPath.fsPath, 'utf8')
            .replace(/{{toolkitUri}}/g, toolkitUri.toString())
            .replace(/{{cspSource}}/g, webview.cspSource)
            .replace(/{{scriptUri}}/g, scriptUri.toString())
            .replace(/{{styleUri}}/g, styleUri.toString());
    }
}