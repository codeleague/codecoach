import { Parser } from './Parser';

describe('Parser test', () => {
  const mock = `test.test/warning/should fix
  test2.test/error/can not compile
  test3:cannot:labled
  `;
  type MockParser = { src: string } | undefined;
  const parser = new Parser<MockParser>(mock).setLineSplitter('\n');
  const mockMapLabel = (e: string): MockParser => {
    const extract = e.match(/(.+)\/(.+)\/(.+)/);
    if (extract)
      return {
        src: extract[1],
      };
    return;
  };

  it('should filter undefined or empty element', () => {
    const splited = parser.getLineSplit();
    expect(splited.length).toBe(3);
  });

  it('should be extact by custom label', () => {
    const mappedLabel = parser.mapLabel(mockMapLabel).getLabled();
    expect(mappedLabel.length).toBe(2);
    expect(mappedLabel[0]?.src).toBe('test.test');
  });
});
