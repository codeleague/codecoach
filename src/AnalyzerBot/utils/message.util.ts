import { LintSeverity } from '../../Parser';

const EMOJI_ERROR = ':rotating_light:';
const EMOJI_WARNING = ':warning:';

export class MessageUtil {
  static createMessageWithEmoji(msg: string, severity: LintSeverity): string {
    let emoji = '';
    switch (severity) {
      case LintSeverity.error:
        emoji = EMOJI_ERROR;
        break;
      case LintSeverity.warning:
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
      LintSeverity.error,
    );
    const warningMsg = MessageUtil.createMessageWithEmoji(
      MessageUtil.pluralize('warning', nOfWarnings),
      LintSeverity.warning,
    );

    return `## CodeCoach reports ${issueCountMsg}
${errorMsg}
${warningMsg}`;
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

  static addRuleIdToMessage(msg: string, ruleId: string): string {
    return `${msg}` + (ruleId ? ` (rule: ${ruleId})` : '');
  }
}
