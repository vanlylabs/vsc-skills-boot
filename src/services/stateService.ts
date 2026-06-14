import * as vscode from 'vscode';

export interface AppState {
    id: string;
    toolId: string;
}

export class StateService {
    private _context?: vscode.ExtensionContext;

    public init(context: vscode.ExtensionContext) {
        this._context = context;
    }

    public getActiveInstruction(): string | undefined {
        return this._context?.workspaceState.get<string>('skillsboot.selectedInstruction');
    }

    public getActiveState(): AppState | undefined {
        return this._context?.workspaceState.get<AppState>('skillsboot.selectedState');
    }

    public async setActiveState(id: string | undefined, toolId: string | undefined) {
        await this._context?.workspaceState.update('skillsboot.selectedInstruction', id);
        await this._context?.workspaceState.update('skillsboot.selectedState', id ? { id, toolId } : undefined);
    }

    public getAgentLock(): { enabled: boolean; toolId: string } | undefined {
        return this._context?.globalState.get<{ enabled: boolean; toolId: string }>('skillsboot.agentLock');
    }

    public async setAgentLock(state: { enabled: boolean; toolId: string } | undefined) {
        await this._context?.globalState.update('skillsboot.agentLock', state);
    }

    public getFirstRunDone(): boolean {
        return this._context?.globalState.get<boolean>('skillsboot.firstRunDone') || false;
    }

    public async setFirstRunDone(done: boolean) {
        await this._context?.globalState.update('skillsboot.firstRunDone', done);
    }
}

export const stateService = new StateService();
