import yargs from 'yargs';

import { BuildLogFile, ConfigArgument, ConfigObject } from './@types';
import { ProjectType } from './@enums';

import { buildAppConfig, buildProviderConfig } from './configBuilder';
import { DEFAULT_OUTPUT_FILE } from './constants/defaults';

const buildLogFileOptionRegex = new RegExp(
  `^(${Object.keys(ProjectType).join('|')}):(.+)$`,
  'i',
);

const args = yargs
  .option('url', {
    describe: 'GitHub repo url (https or ssh)',
    type: 'string',
    demandOption: true,
  })
  .option('pr', {
    describe: 'PR number',
    type: 'number',
    demandOption: true,
  })
  .option('buildLogFile', {
    alias: 'f',
    describe: `Build log content files formatted in '<type>:<path>' where format is one of [${Object.keys(
      ProjectType,
    ).join(', ')}]`,
    type: 'array',
    string: true,
    number: false,
    demandOption: true,
  })
  .option('output', {
    describe: 'Output parsed log file',
    type: 'string',
    default: DEFAULT_OUTPUT_FILE,
  })
  .option('token', {
    describe: 'GitHub token',
    type: 'string',
    demandOption: true,
  })
  .option('cwd', {
    describe: 'Set working directory. Will use current context cwd if not set.',
    type: 'string',
    default: process.cwd(),
  })
  .check((options) => {
    if (!options.pr || Array.isArray(options.pr))
      throw '--pr config should be a single number';
    if (
      !options.buildLogFile ||
      options.buildLogFile.some((file: string) => !buildLogFileOptionRegex.test(file))
    )
      throw '--buildLogFile, -f should have correct format';
    return true;
  })
  .coerce('buildLogFile', (fileOption: string[]) => {
    return fileOption.map((opt) => {
      const match = opt.match(buildLogFileOptionRegex);
      if (!match) throw 'Error parsing --buildLogFile config';
      const [, type, path] = match;
      return { type, path } as BuildLogFile;
    });
  })
  .help()
  .parse(process.argv.slice(1)) as ConfigArgument;

export const Config: ConfigObject = Object.freeze({
  app: buildAppConfig(args),
  provider: buildProviderConfig(args),
});
