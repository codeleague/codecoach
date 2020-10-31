#!/usr/bin/env node

import { Config, ProjectType } from './Config';
import { File } from './File';
import { CSharpParser, LogType, Parser, TSLintParser } from './Parser';
import { GitHub, GitHubPRService, VCS } from './Provider';

class App {
  private readonly parser: Parser;
  private readonly vcs: VCS;

  constructor() {
    [this.parser] = App.setProjectType(Config.app.projectType);
    const githubPRService = new GitHubPRService(
      Config.provider.token,
      Config.provider.repoUrl,
      Config.provider.prId,
    );
    this.vcs = new GitHub(githubPRService);
  }

  async start(): Promise<void> {
    const logs = await this.parseBuildData(Config.app.buildLogFiles);
    await this.vcs.report(logs);
    await App.writeLogToFile(logs);
  }

  private static setProjectType(type: ProjectType): [Parser] {
    switch (type) {
      case ProjectType.csharp:
        return [new CSharpParser(Config.app.cwd)];
      case ProjectType.tslint:
        return [new TSLintParser(Config.app.cwd)];
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

new App().start().catch((err) => {
  console.error(err);
  process.exit(1);
});
