#!/usr/bin/env node

import { Config, ProjectType } from './Config';
import { File } from './File';
import { CSharpParser, TSLintParser, LogType, Parser } from './Parser';
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

  async start(): Promise<boolean> {
    const logs = await this.parseBuildData(Config.app.buildLogFiles);
    const isOk = await this.vcs.report(logs);
    await App.writeLogToFile(logs);

    return isOk;
  }

  private static setProjectType(type: ProjectType): [Parser] {
    switch (type) {
      case ProjectType.csharp:
        return [new CSharpParser()];
      case ProjectType.tslint:
        return [new TSLintParser()];
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

new App()
  .start()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
