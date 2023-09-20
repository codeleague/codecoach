import { NoNaN } from './number.util';

describe('NoNaN', () => {
  it('should return number when provided a number string', () => {
    const result = NoNaN('69');
    expect(result).toBe(69);
  });

  it('should return undefined when provided NaN string', () => {
    const result = NoNaN('this is NaN for sure');
    expect(result).toBeUndefined();
  });
});
