import { Log } from '../Logger';
import { Parser } from './@interfaces/parser.interface';
import { LogType } from './@types';
import { ProjectType } from '../Config/@enums';
import { JscpdLog } from './@types/JscpdLog';
import { LogSeverity } from './@enums/log.severity.enum';

export class JscpdParser extends Parser {
  private readonly ruleId = 'jscpd';

  parse(content: string): LogType[] {
    try {
      if (!content) return [];

      const logsJson = JSON.parse(content) as JscpdLog;
      return logsJson.duplicates.flatMap((el) => this.toLog(el));
    } catch (err) {
      Log.warn('jscpd Parser: parse with content via JSON error', content);
      throw err;
    }
  }

  private toLog(log: JscpdLog['duplicates'][number]): LogType[] {
    return [
      {
        ruleId: this.ruleId,
        log: JSON.stringify(log),
        line: log.secondFile.startLoc.line,
        lineOffset: log.secondFile.startLoc.column ?? 0,
        nLines: log.lines,
        msg:
          `Found code duplication from \`${log.firstFile.name}:${log.firstFile.startLoc.line}\`\r\n` +
          `\r\n` +
          `<details>\r\n` +
          `<summary>Click to see duplicated code</summary>\r\n` +
          `\`\`\`\r\n` +
          `${log.fragment}\r\n` +
          `\`\`\`\r\n` +
          `</details>`,
        source: log.secondFile.name,
        severity: LogSeverity.warning,
        valid: true,
        type: ProjectType.jscpd,
      },
      {
        ruleId: this.ruleId,
        log: JSON.stringify(log),
        line: log.firstFile.startLoc.line,
        lineOffset: log.firstFile.startLoc.column ?? 0,
        nLines: log.lines,
        msg:
          `Found code duplication from \`${log.secondFile.name}:${log.secondFile.startLoc.line}\`\r\n` +
          `\r\n` +
          `<details>\r\n` +
          `<summary>Click to see duplicated code</summary>\r\n` +
          `\`\`\`\r\n` +
          `${log.fragment}\r\n` +
          `\`\`\`\r\n` +
          `</details>`,
        source: log.firstFile.name,
        severity: LogSeverity.warning,
        valid: true,
        type: ProjectType.jscpd,
      },
    ];
  }
}
