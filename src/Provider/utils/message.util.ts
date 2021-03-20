import { LogSeverity, LogType } from '../../Parser';

const EMOJI_ERROR = ':rotating_light:';
const EMOJI_WARNING = ':warning:';

export class MessageUtil {
  static createMessageWithEmoji(msg: string, severity: LogSeverity): string {
    let emoji = '';
    switch (severity) {
      case LogSeverity.error:
        emoji = EMOJI_ERROR;
        break;
      case LogSeverity.warning:
        emoji = EMOJI_WARNING;
        break;
    }
    return `${emoji} ${msg}`;
  }

  static generateOverviewMessage(nOfErrors: number, nOfWarnings: number): string {
    if (nOfErrors + nOfWarnings === 0) {
      return '## CodeCoach reports no issue, good job';
    }
    const issueCountMsg = this.pluralize('issue', nOfErrors + nOfWarnings);
    const errorMsg = MessageUtil.createMessageWithEmoji(
      MessageUtil.pluralize('error', nOfErrors),
      LogSeverity.error,
    );
    const warningMsg = MessageUtil.createMessageWithEmoji(
      MessageUtil.pluralize('warning', nOfWarnings),
      LogSeverity.warning,
    );

    return `## CodeCoach reports ${issueCountMsg}
${errorMsg}
${warningMsg}`;
  }

  static createOtherIssueReport(logs: LogType[]): string | null {
    if (logs.length === 0) return null;

    const issuesTableContent = logs.map((l) => `| ${l.source} | ${l.msg} |`).join('\n');

    // Blank line required after </summary> to let markdown after it display correctly
    return `<details>
<summary><span>By the way, there are other issues those might not related to your code</span></summary>

| source | message |
|-|-|
${issuesTableContent}
</details>`;
  }

  private static pluralize(word: string, n: number): string {
    const fill = word.split('').shift() === 's' ? 'es' : 's';
    return n + ' ' + (n > 1 ? `${word}${fill}` : word);
  }

  static generateCommitDescription(nOfErrors: number): string {
    return nOfErrors
      ? `CodeCoach report ${nOfErrors} errors`
      : 'CodeCoach report no critical issue, good job!';
  }
}
