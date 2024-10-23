import { basename } from 'path';
import slash from 'slash';

import { Log } from '../Logger';
import { getRelativePath } from './utils/path.util';
import { Parser } from './@interfaces/parser.interface';
import { LintItem } from './@types';
import { mapSeverity } from './utils/dotnetSeverityMap';
import { ProjectType } from '../Config/@enums';
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
      const sarifLog: SarifLog = JSON.parse(content);
      
      if (!this.isValidSarifLog(sarifLog)) {
        const message = "SarifParser Error: Invalid SARIF format";
        Log.error(message, { content });
        throw new Error(message);
      }

      const lintItems: LintItem[] = [];
      
      for (const run of sarifLog.runs) {
        const results = run.results || [];
        for (const result of results) {
          const lintItem = this.toLintItem(result, run);
          if (lintItem) {
            lintItems.push(lintItem);
          }
        }
      }

      return lintItems;
    } catch (error) {
      const message = "SarifParser Error: Failed to parse SARIF content";
      Log.error(message, { error, content });
      throw new Error(message);
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

    // Map SARIF severity levels to your existing severity system
    const severityMap: Record<string, string> = {
      'error': 'error',
      'warning': 'warning',
      'note': 'info',
      'none': 'info'
    };

    return {
      ruleId: result.ruleId,
      log: JSON.stringify(result), // Store the original result for reference
      line: NoNaN(location.region?.startLine),
      lineOffset: NoNaN(location.region?.startColumn),
      msg: `${result.ruleId}: ${result.message.text}`,
      source: relativeSrcPath ?? basename(slash(uri)),
      severity: mapSeverity(severityMap[result.level ?? 'warning']),
      valid: !!relativeSrcPath,
      type: ProjectType.sarif,
    };
  }

  // Helper method to find rule details if needed
  private findRuleDetails(ruleId: string, run: SarifRun): SarifRule | undefined {
    return run.tool.driver.rules?.find(rule => rule.id === ruleId);
  }
}