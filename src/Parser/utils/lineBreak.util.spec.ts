import lineBreakUtil from './lineBreak.util';

describe('Line brake utils tests', () => {
  const CRLF_MOCK = `test \r\n test`;
  const LF_MOCK = `test 1\n test \n`;
  it('Should able to detect CRLF', () => {
    expect(lineBreakUtil(CRLF_MOCK)).toEqual('\r\n');
  });

  it('Should able to detect LF', () => {
    expect(lineBreakUtil(LF_MOCK)).toEqual('\n');
  });
});
