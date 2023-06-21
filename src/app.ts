#!/usr/bin/env node

import { BuildLogFile, configs, ProjectType } from './Config';
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
import { GitLab } from './Provider/GitLab/GitLab';
import { GitLabMRService } from './Provider/GitLab/GitLabMRService';

class App {
  private vcs: VCS | null = null;

  async start(): Promise<void> {
    if (configs.vcs === 'github') {
      const githubPRService = new GitHubPRService(
        configs.githubToken,
        configs.githubRepoUrl,
        configs.githubPr,
      );
      this.vcs = new GitHub(
        githubPRService,
        configs.removeOldComment,
        configs.failOnWarnings,
      );
    } else if (configs.vcs === 'gitlab') {
      this.vcs = new GitLab(
        new GitLabMRService(),
        configs.removeOldComment,
        configs.failOnWarnings,
      );
    }

    const logs = await this.parseBuildData(configs.buildLogFile);
    Log.info('Build data parsing completed');

    const reportToVcs = this.reportToVcs(this.vcs, logs);
    const logToFile = App.writeLogToFile(logs);
    const [passed] = await Promise.all([reportToVcs, logToFile]);
    if (!passed) {
      Log.error('There are some linting error and exit code reporting is enabled');
      process.exit(1);
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

  private async parseBuildData(files: BuildLogFile[]): Promise<LogType[]> {
    const logsTasks = files.map(async ({ type, path, cwd }) => {
      Log.debug('Parsing', { type, path, cwd });
      const content = await File.readFileHelper(path);
      const parser = App.getParser(type, cwd);
      return parser.parse(content);
    });

    return (await Promise.all(logsTasks)).flatMap((x) => x);
  }

  private async reportToVcs(vcs: VCS | null, logs: LogType[]): Promise<boolean> {
    if (!this.vcs) {
      Log.info('Dry run enabled, skip reporting');
      return true;
    }

    try {
      const passed = await this.vcs.report(logs);
      Log.info('Report to VCS completed');
      return passed;
    } catch (error) {
      Log.error('Report to VCS failed', { error });
      throw error;
    }
  }

  private static async writeLogToFile(logs: LogType[]): Promise<void> {
    try {
      await File.writeFileHelper(configs.output, JSON.stringify(logs, null, 2));
      Log.info('Write output completed');
    } catch (error) {
      Log.error('Write output failed', { error });
      throw error;
    }
  }
}

new App().start().catch((error) => {
  if (error instanceof Error) {
    const { stack, message } = error;
    Log.error('Unexpected error', { stack, message });
  }
  Log.error('Unexpected error', { error });
  process.exit(2);
});
