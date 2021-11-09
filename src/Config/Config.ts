import yargs, { Arguments } from 'yargs';
import { ProjectType } from './@enums';
import { BuildLogFile, ConfigArgument, ConfigObject } from './@types';
import { buildAppConfig, buildProviderConfig } from './configBuilder';
import { DEFAULT_OUTPUT_FILE, COMMAND } from './constants/defaults';
import { DATA_REQUIRED_ARGS, PR_REQUIRED_ARGS } from './constants/required';

const projectTypes = Object.keys(ProjectType);
let command: COMMAND = COMMAND.DEFAULT;

const validateRequiredArgs = (options: Arguments, requiredArgs: string[]) => {
  const validRequiredArgs = requiredArgs.every(
    (el) => options[el] != undefined || options[el] != null,
  );
  if (!validRequiredArgs)
    throw new Error(`please fill all required fields ${requiredArgs.join(', ')}`);
  return true;
};

const args = yargs
  .option('config', {
    describe: 'use config file',
    type: 'string',
  })
  .option('url', {
    describe: 'GitHub repo url (https or ssh)',
    type: 'string',
  })
  .option('token', {
    describe: 'GitHub token',
    type: 'string',
  })
  .option('output', {
    alias: 'o',
    describe: 'Output parsed log file',
    type: 'string',
    default: DEFAULT_OUTPUT_FILE,
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
  .command(['$0', 'comment'], 'desc', (yarg) =>
    yarg
      .option('pr', {
        describe: 'PR number',
        type: 'number',
        global: true,
      })
      .option('removeOldComment', {
        type: 'boolean',
        describe: 'Remove existing CodeCoach comments before putting new one',
        default: false,
      })
      .check((options) => {
        // check arguments parsing
        const useConfigArgs = options.config === undefined;
        if (!useConfigArgs) return true;

        validateRequiredArgs(options, PR_REQUIRED_ARGS);

        if (!options.pr || Array.isArray(options.pr))
          throw new Error('--pr config should be a single number');
        return true;
      }),
  )
  .command(
    'collect',
    'des',
    (yarg) =>
      yarg
        .option('latestCommit', {
          alias: 'c',
          describe: 'The latest commit sha',
          type: 'string',
          global: true,
        })
        .option('runId', {
          alias: 'r',
          describe: 'The latest run id',
          type: 'number',
          global: true,
        })
        .check((options) => {
          // check arguments parsing
          const useConfigArgs = options.config === undefined;
          if (!useConfigArgs) return true;

          validateRequiredArgs(options, DATA_REQUIRED_ARGS);

          if (!options.runId || Array.isArray(options.runId))
            throw new Error('--runId config should be a single number');
          return true;
        }),
    () => {
      command = COMMAND.COLLECT;
    },
  )
  .check((options) => {
    // check arguments parsing
    const useConfigArgs = options.config === undefined;
    if (!useConfigArgs) return true;
    if (!options.buildLogFile || options.buildLogFile.some((file) => file === null))
      throw new Error('all of `--buildLogFile` options should have correct format');
    return true;
  })
  .help()
  .wrap(120).argv as ConfigArgument;

export const Config: Promise<ConfigObject> = (async () => {
  return Object.freeze({
    app: await buildAppConfig(args, command),
    provider: await buildProviderConfig(args, command),
  });
})();
