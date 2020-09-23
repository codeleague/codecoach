import { BYPASS_BUILD } from './app.constant';
describe('App test', () => {
  it('BYPASS_BUILD should be disabled before merge to master', () => {
    expect(BYPASS_BUILD).toBe(false);
  });
});
