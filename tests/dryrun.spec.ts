import { ConfigParser } from '../src/Config';
import { App } from '../src/app';
import fs from 'fs';

describe('Dry Run', () => {
  it('should correctly write output to file', async () => {
    const configs = ConfigParser([
      'node',
      'app.ts',
      '--dryRun',
      `-f=eslint;./tests/eslint-report.json;/Users/codeleague/example`,
      `-o=./tests/output.log`,
      '--failOnWarnings',
    ]);
    const app = new App(configs);
    await app.start();

    const outputFile = JSON.parse(fs.readFileSync('./tests/output.log', 'utf8'));
    expect(outputFile).toHaveLength(1);
    expect(outputFile[0]).toMatchObject({
      ruleId: 'react-hooks/rules-of-hooks',
      log:
        '{"ruleId":"react-hooks/rules-of-hooks","severity":2,"message":"React Hook \\"useEffect\\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":11,"column":5,"nodeType":"Identifier","endLine":11,"endColumn":14}',
      line: 11,
      lineOffset: 5,
      msg:
        'React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render.',
      source: 'src/App.tsx',
      severity: 'error',
      valid: true,
      type: 'eslint',
    });
  });
});
