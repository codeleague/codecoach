import yargs, { string } from 'yargs';

import { BuildLogFile, ConfigArgument, ConfigObject } from './@types';
import { ProjectType } from './@enums';

import { buildAppConfig, buildProviderConfig } from './configBuilder';
import { DEFAULT_OUTPUT_FILE } from './constants/defaults';

const projectTypes = Object.keys(ProjectType);

type RequiredArgs = (keyof ConfigArgument)[];
const REQUIRED_ARGS: RequiredArgs = ['url', 'pr', 'buildLogFile', 'token'];

function parseConfigfile(fileConfig?: string): boolean {
  if (fileConfig === '') throw 'bad parse config file';
  // TODO: yml parse
  return true;
}

const args = yargs
  .option('config', {
    describe: 'use config file',
    type: 'string',
  })
  .option('url', {
    describe: 'GitHub repo url (https or ssh)',
    type: 'string',
  })
  .option('pr', {
    describe: 'PR number',
    type: 'number',
  })
  .option('token', {
    describe: 'GitHub token',
    type: 'string',
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
    // check config file
    const useConfigFile = options.config !== undefined;
    const validFilePattern = parseConfigfile(options.config);
    if (useConfigFile && !validFilePattern) throw 'bad parse config file';
    return true;
  })
  .check((options) => {
    // check required arguments
    const useConfigArgs = options.config === undefined;
    const validRequiredArgs = REQUIRED_ARGS.every(
      (el) => options[el] != undefined || options[el] != null,
    );
    if (useConfigArgs && !validRequiredArgs)
      throw `please fill all required fields ${REQUIRED_ARGS.join(', ')}`;
    return true;
  })
  .check((options) => {
    // check arguments parsing
    const useConfigArgs = options.config === undefined;
    if (!options.pr || (Array.isArray(options.pr) && useConfigArgs))
      throw '--pr config should be a single number';
    if (
      (!options.buildLogFile || options.buildLogFile.some((file) => file === null)) &&
      useConfigArgs
    )
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
