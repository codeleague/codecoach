export default class CodeCoachError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CodeCoachError.prototype);
    this.name = 'CodeCoachError';
  }
}
