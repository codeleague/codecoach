import { LintItem } from "../Parser"

describe('OutputFormatter', () => {
  it('should format logs to GitLab format', () => {
    const items: LintItem[] = [