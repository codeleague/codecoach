#!/usr/bin/env node

import { BuildLogFile, Config, ConfigObject, ProjectType } from './Config';
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
import { DartLintParser } from './Parser/DartLintParser';
import { GitHub, GitHubPRService, VCS } from './Provider';

class App {
  private vcs: VCS;
  private config: ConfigObject;

  async start(): Promise<void> {
    this.config = await Config;

    const githubPRService = new GitHubPRService(
      this.config.provider.token,
      this.config.provider.repoUrl,
      this.config.provider.prId,
    );
    this.vcs = new GitHub(githubPRService, this.config.provider.removeOldComment);

    const logs = await this.parseBuildData(this.config.app.buildLogFiles);
    Log.info('Build data parsing completed');

    // Fire and forget, no need to await
    App.writeLogToFile(logs)
      .then(() => Log.info('Write output completed'))
      .catch((error) => Log.error('Write output failed', { error }));

    await this.vcs.report(logs);
    Log.info('Report to VCS completed');
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

  private async parseBuildData(files: BuildLogFile[]): Promise<LogType[]> {
    const logsTasks = files.map(async ({ type, path, cwd }) => {
      Log.debug('Parsing', { type, path, cwd });
      const content = await File.readFileHelper(path);
      const parser = App.getParser(type, cwd);
      return parser.parse(content);
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
