#!/usr/bin/env node

import {
  BuildLogFile,
  Config,
  ConfigObject,
  DataProviderConfig,
  ProjectType,
  PrProviderConfig,
} from './Config';
import { COMMAND } from './Config/constants/defaults';
import { File } from './File';
import { Log } from './Logger';
import {
  AndroidLintStyleParser,
  DotnetBuildParser,
  ESLintParser,
  LogType,
  MSBuildParser,
  Parser,
  ScalaStyleParser,
  TSLintParser,
} from './Parser';
import { ParsedLogType, Run } from './Parser/@types/log.type';
import { DartLintParser } from './Parser/DartLintParser';
import { GitHub, GitHubPRService, VCS } from './Provider';

class App {
  private vcs: VCS;
  private config: ConfigObject;

  async start(): Promise<void> {
    this.config = await Config;
    const { repoUrl } = this.config.provider;

    const parsedLogs = await this.parseBuildData(this.config.app.buildLogFiles);
    const logs = parsedLogs.flatMap(({ logs }) => logs);
    Log.info('Build data parsing completed');

    // Fire and forget, no need to await
    App.writeLogToFile(logs)
      .then(() => Log.info('Write output completed'))
      .catch((error) => Log.error('Write output failed', { error }));

    switch (this.config.app.command) {
      case COMMAND.DEFAULT:
        const { token, removeOldComment, prId } = this.config
          .provider as PrProviderConfig;
        const githubPRService = new GitHubPRService(token, repoUrl, prId);
        this.vcs = new GitHub(githubPRService, removeOldComment);

        await this.vcs.report(logs);
        Log.info('Report to VCS completed');
        break;
      case COMMAND.COLLECT:
        const { headCommit, runId } = this.config.provider as DataProviderConfig;
        const issues: ParsedLogType[] = parsedLogs.filter(({ logs }) =>
          logs.filter(({ valid }) => valid),
        );
        const runInfomation: Run = {
          id: runId,
          timestamp: new Date(Date.now()),
          issues: issues,
          branch: 'something',
          headCommit: {
            sha: headCommit,
          },
          repository: {
            url: repoUrl,
          },
        };

        if (issues.length === 0) break;
        //TODO: send api
        break;
      default:
        Log.error(`Command: ${this.config.app.command} is invalid`);
        break;
    }
  }

  private static getParser(type: ProjectType, cwd: string): Parser {
    switch (type) {
      case ProjectType.dotnetbuild:
        return new DotnetBuildParser(cwd);
      case ProjectType.msbuild:
        return new MSBuildParser(cwd);
      case ProjectType.tslint:
        return new TSLintParser(cwd);
      case ProjectType.eslint:
        return new ESLintParser(cwd);
      case ProjectType.scalastyle:
        return new ScalaStyleParser(cwd);
      case ProjectType.androidlint:
        return new AndroidLintStyleParser(cwd);
      case ProjectType.dartlint:
        return new DartLintParser(cwd);
    }
  }

  private async parseBuildData(files: BuildLogFile[]): Promise<ParsedLogType[]> {
    const logsTasks = files.map(async ({ type, path, cwd }) => {
      Log.debug('Parsing', { type, path, cwd });
      const content = await File.readFileHelper(path);
      const parser = App.getParser(type, cwd);
      return {
        logs: parser.parse(content),
        raw: content,
        linter: type,
      };
    });

    return (await Promise.all(logsTasks)).flatMap((x) => x);
  }

  private static async writeLogToFile(logs: LogType[]): Promise<void> {
    const config = await Config;
    await File.writeFileHelper(config.app.logFilePath, JSON.stringify(logs, null, 2));
  }
}

new App().start().catch((error) => {
  if (error instanceof Error) {
    const { stack, message } = error;
    Log.error('Unexpected error', { stack, message });
  }
  Log.error('Unexpected error', { error });
  process.exit(1);
});
