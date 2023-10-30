import { LintSeverity } from '../../Parser';
import { MessageUtil } from './message.util';

describe('createMessageWithEmoji', () => {
  it('should parsed log message to Emoji correctly', () => {
    // ¯\_(ツ)_/¯
    const msg = 'test';

    expect(MessageUtil.createMessageWithEmoji(msg, LintSeverity.error)).toBe(
      `:rotating_light: ${msg}`,
    );
    expect(MessageUtil.createMessageWithEmoji(msg, LintSeverity.warning)).toBe(
      `:warning: ${msg}`,
    );
  });
});

describe('generateCommitDescription', () => {
  it('should return no issue when provided 0 error', () => {
    expect(MessageUtil.generateCommitDescription(0)).toBe(
      'CodeCoach report no critical issue, good job!',
    );
  });

  it('should notate error count if error > 0', () => {
    expect(MessageUtil.generateCommitDescription(99)).toBe('CodeCoach report 99 errors');
  });
});

describe('addRuleIdToMessage', () => {
  it('should add ruleId to message', () => {
    const msg = 'test';
    const ruleId = 'id';

    expect(MessageUtil.addRuleIdToMessage(msg, ruleId)).toBe(`${msg} (rule: ${ruleId})`);
  });
  it('should not add ruleId to message if ruleId is empty', () => {
    const msg = 'test';
    const ruleId = '';

    expect(MessageUtil.addRuleIdToMessage(msg, ruleId)).toBe(msg);
  });
});
