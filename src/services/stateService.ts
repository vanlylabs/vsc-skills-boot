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
}

export const stateService = new StateService();
