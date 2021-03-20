import yargs from 'yargs';

import { BuildLogFile, ConfigArgument, ConfigObject } from './@types';
import { ProjectType } from './@enums';

import { buildAppConfig, buildProviderConfig } from './configBuilder';
import { DEFAULT_OUTPUT_FILE } from './constants/defaults';

const projectTypes = Object.keys(ProjectType);

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
  .option('token', {
    describe: 'GitHub token',
    type: 'string',
    demandOption: true,
  })
  .option('buildLogFile', {
    alias: 'f',
    describe: `Build log content files formatted in '<type>;<path>[;<cwd>]'
where <type> is one of [${projectTypes.join(', ')}]
<path> is build log file path to be processed
and <cwd> is build root directory (optional (Will use current context as cwd)).
`,
    type: 'array',
    string: true,
    number: false,
    demandOption: true,
  })
  .coerce('buildLogFile', (files: string[]) => {
    return files.map((opt) => {
      const [type, path, cwd] = opt.split(';');
      if (!projectTypes.includes(type) || !path) return null;
      return { type, path, cwd: cwd ?? process.cwd() } as BuildLogFile;
    });
  })
  .option('output', {
    alias: 'o',
    describe: 'Output parsed log file',
    type: 'string',
    default: DEFAULT_OUTPUT_FILE,
  })
  .option('removeOldComment', {
    type: 'boolean',
    describe: 'Remove existing CodeCoach comments before putting new one',
    default: false,
  })
  .check((options) => {
    if (!options.pr || Array.isArray(options.pr))
      throw '--pr config should be a single number';
    if (!options.buildLogFile || options.buildLogFile.some((file) => file === null))
      throw 'all of `--buildLogFile` options should have correct format';
    return true;
  })
  .help()
  .wrap(120)
  .parse(process.argv.slice(1)) as ConfigArgument;

export const Config: ConfigObject = Object.freeze({
  app: buildAppConfig(args),
  provider: buildProviderConfig(args),
});
