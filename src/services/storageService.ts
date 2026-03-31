import * as fs from 'fs';
import * as path from 'path';
import { TEMPLATES_STORE, VARIANTS_STORE } from '../config';
import { InstructionMetadata } from '../types';

export class StorageService {
    public getAllInstructions(): InstructionMetadata[] {
        if (!fs.existsSync(TEMPLATES_STORE)) return [];

        const entries = fs.readdirSync(TEMPLATES_STORE, { withFileTypes: true });
        return entries
            .filter(e => e.isDirectory())
            .map(d => {
                const descPath = path.join(TEMPLATES_STORE, d.name, 'description.md');
                return {
                    id: d.name,
                    name: d.name,
                    description: fs.existsSync(descPath) ? fs.readFileSync(descPath, 'utf8') : ""
                };
            });
    }

    public getTemplatePath(id: string): string {
        return path.join(TEMPLATES_STORE, id);
    }

    public getVariantPath(id: string, toolId: string): string {
        return path.join(VARIANTS_STORE, id, toolId);
    }

    public getVariantRoot(id: string): string {
        return path.join(VARIANTS_STORE, id);
    }

    public deleteInstruction(id: string) {
        const templateDir = this.getTemplatePath(id);
        const variantDir = this.getVariantRoot(id);

        if (fs.existsSync(templateDir)) {
            fs.rmSync(templateDir, { recursive: true, force: true });
        }
        if (fs.existsSync(variantDir)) {
            fs.rmSync(variantDir, { recursive: true, force: true });
        }
    }

    public exists(id: string): boolean {
        return fs.existsSync(this.getTemplatePath(id));
    }
}

export const storageService = new StorageService();
