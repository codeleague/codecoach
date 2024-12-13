import { basename } from 'path';
import slash from 'slash';

import { Log } from '../Logger';
import { getRelativePath } from './utils/path.util';
import { Parser } from './@interfaces/parser.interface';
import { LintItem } from './@types';
import { mapSeverity } from './utils/dotnetSeverityMap';
import { ProjectType } from '../Config/@enums';
import { LintSeverity } from './@enums/LintSeverity';
import { NoNaN } from './utils/number.util';

interface SarifLog {
  version: string;
  runs: SarifRun[];
}

interface SarifRun {
  tool: {
    driver: {
      name: string;
      rules?: SarifRule[];
    };
  };
  results: SarifResult[];
}

interface SarifRule {
  id: string;
  shortDescription?: {
    text: string;
  };
}

interface SarifResult {
  ruleId: string;
  level?: 'none' | 'note' | 'warning' | 'error';
  message: {
    text: string;
  };
  locations?: Array<{
    physicalLocation: {
      artifactLocation: {
        uri: string;
      };
      region?: {
        startLine: number;
        startColumn?: number;
      };
    };
  }>;
}

export class SarifParser extends Parser {
  parse(content: string): LintItem[] {
    try {
      const sarifLog = this.parseSarifContent(content);
      return this.processRuns(sarifLog.runs);
    } catch (error) {
      const message = 'SarifParser Error: Failed to parse SARIF content';
      Log.error(message, { error, content });
      throw new Error(message);
    }
  }

  private parseSarifContent(content: string): SarifLog {
    const sarifLog: SarifLog = JSON.parse(content);

    if (!this.isValidSarifLog(sarifLog)) {
      const message = 'SarifParser Error: Invalid SARIF format';
      Log.error(message, { content });
      throw new Error(message);
    }

    return sarifLog;
  }

  private processRuns(runs: SarifRun[]): LintItem[] {
    const lintItems: LintItem[] = [];

    for (const run of runs) {
      this.processResults(run, lintItems);
    }

    return lintItems;
  }

  private processResults(run: SarifRun, lintItems: LintItem[]): void {
    const results = run.results || [];
    for (const result of results) {
      const lintItem = this.toLintItem(result, run);
      if (lintItem) {
        lintItems.push(lintItem);
      }
    }
  }

  private isValidSarifLog(log: any): log is SarifLog {
    return (
      log &&
      typeof log === 'object' &&
      typeof log.version === 'string' &&
      Array.isArray(log.runs)
    );
  }

  private toLintItem(result: SarifResult, run: SarifRun): LintItem | null {
    if (!result.locations?.[0]) {
      Log.warn('SarifParser Warning: Result has no location information', { result });
      return null;
    }

    const location = result.locations[0].physicalLocation;
    const uri = location.artifactLocation.uri;
    const relativeSrcPath = getRelativePath(this.cwd, uri);

    if (!relativeSrcPath) {
      Log.warn(`SarifParser Warning: source path is not relative to root`, { uri });
    }

    return {
      ruleId: result.ruleId,
      log: JSON.stringify(result),
      line: NoNaN(String(location.region?.startLine || '')),
      lineOffset: NoNaN(String(location.region?.startColumn || '')),
      msg: `${result.ruleId}: ${result.message.text}`,
      source: relativeSrcPath ?? basename(slash(uri)),
      severity: this.getSeverity(result.level),
      valid: !!relativeSrcPath,
      type: ProjectType.sarif,
    };
  }

  private getSeverity(level?: string): LintSeverity {
    const severityMap: Record<string, string> = {
      error: 'error',
      warning: 'warning',
      note: 'info',
      none: 'info',
    };

    return mapSeverity(severityMap[level ?? 'warning']);
  }

  private findRuleDetails(ruleId: string, run: SarifRun): SarifRule | undefined {
    return run.tool.driver.rules?.find((rule) => rule.id === ruleId);
  }
}
