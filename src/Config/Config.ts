import yargs from 'yargs';
import { ProjectType } from './@enums';
import { BuildLogFile } from './@types';
import { DEFAULT_OUTPUT_FILE } from './constants/defaults';
import { GITHUB_ARGS, GITLAB_ARGS } from './constants/required';
import { z } from 'zod';

const projectTypes = Object.keys(ProjectType);

export const configSchema = z
  .object({
    vcs: z.enum(['github', 'gitlab']).optional().describe('VCS Type'),

    githubRepoUrl: z.string().optional(),
    githubPr: z.number().optional(),
    githubToken: z.string().optional(),

    gitlabHost: z.string().optional(),
    gitlabProjectId: z.number().optional(),
    gitlabMrIid: z.number().optional(),
    gitlabToken: z.string().optional(),

    buildLogFile: z.array(z.string()).transform((files) => {
      return files
        .map((opt) => {
          const [type, path, cwd] = opt.split(';');
          if (!projectTypes.includes(type) || !path) return null;
          return { type, path, cwd: cwd ?? process.cwd() } as BuildLogFile;
        })
        .filter((file) => file !== null) as BuildLogFile[];
    }),
    output: z.string().default(DEFAULT_OUTPUT_FILE),
    removeOldComment: z.boolean().default(false),
    failOnWarnings: z.boolean().default(false),
    dryRun: z.boolean().default(false),
  })
  .superRefine((options, ctx) => {
    if (!options.vcs && !options.dryRun) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'VCS type is required',
      });
    }
  })
  .superRefine((options, ctx) => {
    if (options.vcs === 'github' && GITHUB_ARGS.some((arg) => !options[arg])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `GitHub requires [${GITHUB_ARGS.map((a) => `--${a}`).join(
          ', ',
        )}] to be set`,
      });
    }

    if (options.vcs === 'gitlab' && GITLAB_ARGS.some((arg) => !options[arg])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `GitLab requires [${GITLAB_ARGS.map((a) => `--${a}`).join(
          ', ',
        )}] to be set`,
      });
    }
  });

export const args = yargs
  .config('config', (file) => {
    return require(file);
  })
  .option('vcs', {
    alias: 'g',
    describe: 'VCS Type',
    choices: ['github', 'gitlab'],
  })

  .option('githubRepoUrl', {
    describe: 'GitHub repo url (https or ssh)',
    type: 'string',
  })
  .option('githubPr', {
    describe: 'GitHub PR number',
    type: 'number',
  })
  .option('githubToken', {
    describe: 'GitHub token',
    type: 'string',
  })

  .option('gitlabHost', {
    describe: 'GitLab server URL (https://gitlab.yourcompany.com)',
    type: 'string',
  })
  .option('gitlabProjectId', {
    describe: 'GitLab project ID',
    type: 'number',
  })
  .option('gitlabMrIid', {
    describe: 'GitLab merge request IID (not to be confused with ID)',
    type: 'number',
  })
  .option('gitlabToken', {
    describe: 'GitLab token',
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
  .option('output', {
    alias: 'o',
    describe: 'Output parsed log file',
    type: 'string',
    default: DEFAULT_OUTPUT_FILE,
  })
  .option('removeOldComment', {
    alias: 'r',
    type: 'boolean',
    describe: 'Remove existing CodeCoach comments before putting new one',
    default: false,
  })
  .option('failOnWarnings', {
    type: 'boolean',
    describe: 'Fail the job if warnings are found',
    default: false,
  })
  .option('dryRun', {
    describe: 'Running CodeCoach without reporting to VCS',
    type: 'boolean',
    default: false,
  })
  .strict()
  .help()
  .wrap(120)
  .parse(process.argv.slice(1));

export const configs = configSchema.parse(args);
