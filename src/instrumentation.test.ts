import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('instrumentation edge bundle safety', () => {
    it('does not statically import Node-only backend modules', () => {
        const source = readFileSync(join(process.cwd(), 'src/instrumentation.ts'), 'utf8');

        expect(source).not.toMatch(/^import\s+.*['"]\.\/backend\//m);
        expect(source).not.toMatch(/^import\s+.*['"]@\/backend\//m);
        expect(source).not.toMatch(/^import\s+.*['"]@\/lib\/object-storage/m);
    });
});
