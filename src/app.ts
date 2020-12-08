#!/usr/bin/env node

import { Config, ProjectType } from './Config';
import { File } from './File';
import { Log } from './Logger';
import {
  DotnetBuildParser,
  ESLintParser,
  LogType,
  MSBuildParser,
  Parser,
  TSLintParser,
} from './Parser';
import { GitHub, GitHubPRService, VCS } from './Provider';

class App {
  private readonly parser: Parser;
  private readonly vcs: VCS;

  constructor() {
    this.parser = App.setProjectType(Config.app.projectType);
    const githubPRService = new GitHubPRService(
      Config.provider.token,
      Config.provider.repoUrl,
      Config.provider.prId,
    );
    this.vcs = new GitHub(githubPRService);
  }

  async start(): Promise<void> {
    const logs = await this.parseBuildData(Config.app.buildLogFiles);
    Log.info('Build data parsing completed');

    await this.vcs.report(logs);
    Log.info('Report to VCS completed');

    await App.writeLogToFile(logs);
    Log.info('Write output completed');
  }

  private static setProjectType(type: ProjectType): Parser {
    Log.debug(`Project type: ${type}, cwd: ${Config.app.cwd}`);
    switch (type) {
      case ProjectType.dotnetbuild:
        return new DotnetBuildParser(Config.app.cwd);
      case ProjectType.msbuild:
        return new MSBuildParser(Config.app.cwd);
      case ProjectType.tslint:
        return new TSLintParser(Config.app.cwd);
      case ProjectType.eslint:
        return new ESLintParser(Config.app.cwd);
    }
  }

  private async parseBuildData(files: string[]): Promise<LogType[]> {
    const parserTasks = files.map(async (file) => {
      const content = await File.readFileHelper(file);
      this.parser.withContent(content);
    });

    await Promise.all(parserTasks);

    return this.parser.getLogs();
  }

  private static async writeLogToFile(logs: LogType[]): Promise<void> {
    await File.writeFileHelper(Config.app.logFilePath, JSON.stringify(logs, null, 2));
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
