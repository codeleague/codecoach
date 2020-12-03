import { getLineBreakChar } from './lineBreak.util';

describe('getLineBreakChar', () => {
  const CRLF_MOCK = `test \r\n test`;
  const LF_MOCK = `test 1\n test \n`;
  it('Should able to detect CRLF', () => {
    expect(getLineBreakChar(CRLF_MOCK)).toEqual('\r\n');
  });

  it('Should able to detect LF', () => {
    expect(getLineBreakChar(LF_MOCK)).toEqual('\n');
  });
});
