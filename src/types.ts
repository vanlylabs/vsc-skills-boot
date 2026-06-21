import { ToolConfig } from './handlers/base';

export interface InstructionMetadata {
    id: string;
    name: string;
    description: string;
}

export interface AgentLockState {
    enabled: boolean;
    toolId: string;
}

export type WebviewMessage =
    | { type: 'requestData' }
    | { type: 'create', name: string, description: string, toolId: string, features: string[] }
    | { type: 'apply', id: string, toolId: string }
    | { type: 'unlink' }
    | { type: 'delete', id: string }
    | { type: 'edit', id: string, name: string, description: string, loadAndConvert?: boolean }
    | { type: 'duplicate', sourceId: string, name: string, description: string }
    | { type: 'detectInstructions' }
    | { type: 'import', name: string, description: string, toolId: string, features: string[] }
    | { type: 'update', instructions: InstructionMetadata[], availableTools: ToolConfig[], selected: any, agentLock: AgentLockState | undefined }
    | { type: 'detected', toolId: string, name: string, description: string }
    | { type: 'detectionFailed' }
    | { type: 'createError', message: string }
    | { type: 'setAgentLock', toolId: string | null }
    | { type: 'applyLocked', id: string }
    | { type: 'welcomeDone' };
