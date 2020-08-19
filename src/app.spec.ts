import { app } from './app';

describe('test app', () => {
  test('it should log hello', () => {
    expect(app()).toEqual('Hello');
  });
});
