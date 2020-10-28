#!/usr/bin/env node

import { Agent, CSharpAgent } from './Agent';
import { Config, ProjectType } from './Config';
import { File } from './File';
import { CSharpParser, LogType, Parser } from './Parser';
import { Git, GitConfigType, GitHub, GitHubPRService, VCS } from './Provider';

import { ROOT_DIR } from './app.constants';

class App {
  private readonly parser: Parser;
  private readonly agent: Agent;
  private readonly vcs: VCS;

  constructor() {
    [this.parser, this.agent] = App.setProjectType(Config.app.projectType);
    const githubPRService = new GitHubPRService(
      Config.provider.token,
      Config.provider.repoUrl,
      Config.provider.prId,
    );
    this.vcs = new GitHub(githubPRService);
  }

  async start(): Promise<boolean> {
    if (!Config.provider.gitCloneBypass) await App.cloneRepo();

    const logFiles = Config.app.buildLogFiles ?? (await this.agent.buildAndGetLogFiles());

    const logs = await this.parseBuildData(logFiles);

    const isOk = await this.vcs.report(logs);
    await App.writeLogToFile(logs);

    return isOk;
  }

  private static async cloneRepo(): Promise<void> {
    const config: GitConfigType = {
      src: Config.provider.repoUrl,
      prId: Config.provider.prId,
      dest: ROOT_DIR,
    };

    const git = new Git(config);
    await git.clone();
  }

  private static setProjectType(type: ProjectType): [Parser, Agent] {
    switch (type) {
      case ProjectType.csharp:
        return [new CSharpParser(), new CSharpAgent(Config.agent)];
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
