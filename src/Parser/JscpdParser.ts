import { Log } from '../Logger';
import { Parser } from './@interfaces/parser.interface';
import { LintItem } from './@types';
import { ProjectType } from '../Config/@enums';
import { JscpdLog } from './@types/JscpdLog';
import { LintSeverity } from './@enums/LintSeverity';

export class JscpdParser extends Parser {
  private readonly ruleId = 'jscpd';

  parse(content: string): LintItem[] {
    try {
      if (!content) return [];

      const logsJson = JSON.parse(content) as JscpdLog;
      return logsJson.duplicates.flatMap((el) => this.toLintItem(el));
    } catch (err) {
      Log.warn('jscpd Parser: parse with content via JSON error', content);
      throw err;
    }
  }

  private toLintItem(log: JscpdLog['duplicates'][number]): LintItem[] {
    return [
      {
        ruleId: this.ruleId,
        log: JSON.stringify(log),
        line: log.secondFile.startLoc.line,
        lineOffset: log.secondFile.startLoc.column ?? 0,
        nLines: log.lines,
        msg: `Found code duplication from \`${log.firstFile.name}:${log.firstFile.startLoc.line}\`

<details>
<summary>Click to see duplicated code</summary>

\`\`\`
${log.fragment}
\`\`\`

</details>`,
        source: log.secondFile.name,
        severity: LintSeverity.warning,
        valid: true,
        type: ProjectType.jscpd,
      },
      {
        ruleId: this.ruleId,
        log: JSON.stringify(log),
        line: log.firstFile.startLoc.line,
        lineOffset: log.firstFile.startLoc.column ?? 0,
        nLines: log.lines,
        msg: `Found code duplication from \`${log.secondFile.name}:${log.secondFile.startLoc.line}\`

<details>
<summary>Click to see duplicated code</summary>

\`\`\`
${log.fragment}
\`\`\`

</details>`,
        source: log.firstFile.name,
        severity: LintSeverity.warning,
        valid: true,
        type: ProjectType.jscpd,
      },
    ];
  }
}
