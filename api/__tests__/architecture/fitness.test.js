import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../../src');

/**
 * Architectural Fitness Tests
 * Prevents architectural drift by enforcing strict Hexagonal boundary invariants across the codebase.
 */
describe('Architectural Fitness Tests (Hexagonal Ports & Adapters)', () => {
  function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (file.endsWith('.js')) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  test('Controllers and Routes must NEVER directly import provider implementations (gemini/openai/local.provider.js)', () => {
    const controllersDir = path.join(srcDir, 'controllers');
    const routesDir = path.join(srcDir, 'routes');
    const targetFiles = [...getAllFiles(controllersDir), ...getAllFiles(routesDir)];

    const forbiddenImports = ['gemini.provider.js', 'openai.provider.js', 'local.provider.js'];

    const violations = [];
    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const forbidden of forbiddenImports) {
        if (content.includes(forbidden)) {
          violations.push(`${path.relative(srcDir, file)} imports forbidden concrete provider: ${forbidden}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test('Pure Domain layer (api/src/ai/domain) must have ZERO imports from Express, Mongoose, or external infrastructure SDKs', () => {
    const domainDir = path.join(srcDir, 'ai/domain');
    const domainFiles = getAllFiles(domainDir);

    const forbiddenModules = ['express', 'mongoose', 'bullmq', 'redis', '@google/generative-ai', 'openai'];

    const violations = [];
    for (const file of domainFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const mod of forbiddenModules) {
        const importRegex = new RegExp(`from\\s+['"]${mod}['"]|require\\(['"]${mod}['"]\\)`, 'g');
        if (importRegex.test(content)) {
          violations.push(`${path.relative(srcDir, file)} imports forbidden infrastructure module: ${mod}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
