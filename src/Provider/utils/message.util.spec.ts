import LogSeverity from '../../Parser/@enums/log.severity.enum';
import { MessageUtil } from './message.util';

describe('Message util tests', () => {
  it('Should parsed log message to Emoji correctly', () => {
    // ¯\_(ツ)_/¯
    const msg = 'test';

    expect(MessageUtil.createMessageWithEmoji(msg, LogSeverity.error)).toBe(
      `:rotating_light: ${msg}`,
    );
    expect(MessageUtil.createMessageWithEmoji(msg, LogSeverity.warning)).toBe(
      `:warning: ${msg}`,
    );
  });
});
