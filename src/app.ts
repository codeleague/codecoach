import { join, resolve } from 'path';

import { Agent, CSharpAgent } from './Agent';
import { Config, ProjectType } from './Config';
import { File } from './File';
import { CSharpParser, LogType, Parser } from './Parser';
import { Git, GitConfigType, GithubProvider } from './Provider';
import { Report } from './Report/Report';

import { ROOT_DIR } from './app.constants';

class App {
  private readonly parser: Parser;
  private readonly agent: Agent;
  private readonly provider = new GithubProvider(Config.provider);

  constructor() {
    [this.parser, this.agent] = App.setProjectType(Config.app.projectType);
  }

  async start(): Promise<void> {
    if (!Config.provider.gitCloneBypass) await App.cloneRepo();

    const logFiles = Config.app.buildLogFiles ?? (await this.agent.buildAndGetLogFiles());

    const logs = await this.parseBuildData(logFiles);
    const report = Report.parse(logs);

    await this.provider.report(report);
    await App.writeLogToFile(logs);
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
      const content = await File.readFileHelper(resolve(file));
      this.parser.withContent(content);
    });

    await Promise.all(parserTasks);

    return this.parser.getLogs();
  }

  private static async writeLogToFile(logs: LogType[]): Promise<void> {
    await File.writeFileHelper(
      join(ROOT_DIR, Config.app.logFilePath),
      JSON.stringify(logs, null, 2),
    );
  }
}

new App().start().catch((err) => {
  console.error(err);
  process.exit(1);
});
