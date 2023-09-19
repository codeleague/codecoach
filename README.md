<h1 align="center">CodeCoach</h1>
<p align="center">
    <a href="https://www.npmjs.com/package/@codecoach/cli"><img alt="npm version badge" src="https://img.shields.io/npm/v/@codecoach/cli.svg?label=@codecoach/cli&style=for-the-badge&logo=npm"/></a>
    <a href="https://www.npmjs.com/package/@codecoach/cli"><img alt="npm download badge" src="https://img.shields.io/npm/dm/@codecoach/cli.svg?style=for-the-badge"/></a>
    <br/>
    <a href="https://github.com/codeleague/codecoach/actions/workflows/release.yml"><img alt="Release" src="https://github.com/codeleague/codecoach/actions/workflows/release.yml/badge.svg"></a>
</p>
<p align="center">
<img alt="CodeCoach logo" src="https://user-images.githubusercontent.com/5965883/110232495-8cb95700-7f50-11eb-99ee-c223786e39a9.png"/>
</p>

Lightweight code review tool. 
Provide lint output to CodeCoach, it will automatically review pull requests.
CodeCoach uses node.js as run time. It can be run from any command line.
So it can be integrated with any CI with ease.

#### Supported linters.
- ESLint
- TSLint
- MSBuild (both `msbuild.exe` and `dotnet build` commands)
- ScalaStyle
- AndroidLint
- DartLint
- SwiftLint (0.49.1 or later)

#### Supported code duplication detectors.
- jscpd

#### Supported source controls
- GitHub
- GitHub Enterprise
- GitLab

### Prerequisite
Node.js v14 or later

### Installation
Install it globally using npm
```shell script
$ npm i -g @codecoach/cli
```
or Yarn
```shell script
$ yarn global add @codecoach/cli
```

### Usage
Use command `codecoach` with required config.

#### Configs
Configuration could be supplied by arguments options or config JSON file.

##### Example: Supplying config by options
```shell
$ codecoach \
  -g="github"
  --githubRepoUrl="https://github.com/codeleague/codecoach" \
  --githubPr=99 \
  --githubToken="yourtoken" \
  -f="eslint;/path/to/eslintoutput.json" \
  -f="dotnetbuild;/path/to/dotnetbuild;/repo/src" \
  -r
```

##### Example: Supplying config by json
```shell
$ codecoach --config="codecoach.json"
```
and in `codecoach.json`
```json
{
  "vcs": "github",
  "githubRepoUrl": "https://github.com/codeleague/codecoach",
  "githubPr": 99,
  "githubToken": "yourtoken",
  "buildLogFile": [
    "eslint;/path/to/eslintoutput.json",
    "dotnetbuild;/path/to/dotnetbuild;/repo/src"
  ],
  "removeOldComment": true
}
```
Will do the same thing.

> Warning: If both config file and options are supplied, options will override config in file.

| Option                    | Required                  | Value                                     | Description                                                                            | 
|---------------------------|---------------------------|-------------------------------------------|----------------------------------------------------------------------------------------|
| `vcs` / `-g`              | when `dryRun` is `false`  | `github` or `gitlab`                      |                                                                                        |
|                           |                           |                                           |                                                                                        |
| `githubRepoUrl`           | when `vcs` is `github`    |                                           | Repository's HTTPS URL                                                                 |
| `githubPr`                | when `vcs` is `github`    |                                           | Pull request ID                                                                        |
| `githubToken`             | when `vcs` is `github`    |                                           | Personal Access Token                                                                  |
|                           |                           |                                           |                                                                                        |
| `gitlabHost`              | when `vcs` is `gitlab`    | `https://gitlab.company.com`              | GitLab Server (Could also be `https://gitlab.com`)                                     |
| `gitlabProjectId`         | when `vcs` is `gitlab`    |                                           | Project ID                                                                             |
| `gitlabMrIid`             | when `vcs` is `gitlab`    |                                           | MergeRequest IID (not to be confused with ID)                                          |
| `gitlabToken`             | when `vcs` is `gitlab`    |                                           | Access Token                                                                           |
|                           |                           |                                           |                                                                                        |
| `buildLogFile` / `-f`     | yes, repeatable           |                                           | Read below                                                                             |
| `output` / `-o`           | no                        |                                           | CodeCoach parsed output for debugging                                                  |
| `removeOldComment` / `-r` | no                        | `true` or `false`                         | Remove CodeCoach's old comments before adding new one                                  |
| `failOnWarnings`          | no                        | `true` or `false`                         | Fail the job when warnings are found                                                   |
| `dryRun`                  | no                        | `true` or `false`                         | Running CodeCoach without reporting to VCS                                             |
| `suppressRules`           | no                        | `rule-group-1/.*` `rule-id-1` `rule-id-2` | Rule IDs that CodeCoach will still comment but no longer treated as errors or warnings |
| `outputFormat`            | no                        | `default`, `gitlab`                       | Output file format                                                                     |


##### `--buildLogFile` or `-f`
###### Required, Repeatable  
Build log content files config. Splitted in to 3 part, formatted in `<type>;<path>[;<cwd>]`
- Type: one of `dotnetbuild`, `msbuild`, `tslint`, `eslint`, `scalastyle`, `androidlint` or `dartlint`
- Path: Path to lint output file to be processed
- cwd: Linter context repository root (optional, will use current directory if not provided)

For example,  
**Case 1**: Run CodeCoach from repo root for `eslint` and `dotnetbuild` in the same lint context directory
```
--buildLogFile="eslint;./src/client/eslint-out.json" --buildLogFile="dotnetbuild;./src/api/msbuild.log"
```

**Case 2**: Run CodeCoach from somewhere else for `androidlint` (linter context root was `/path/to/project/root`)
```
--buildLogFile="androidlint;./android-lint.xml;/path/to/project/root"
```


### How to get lint output for CodeCoach
#### ESLint
Use `-o <filename>` to output lint result to file and `-f json` to format logs as JSON.
(_[ref.](https://eslint.org/docs/user-guide/command-line-interface)_)

#### TSLint
Use `-o <filename>` to output lint result to file and `-t json` or `--format json` to format logs as JSON.
(_[ref.](https://palantir.github.io/tslint/usage/cli/)_)

#### MSBuild and dotnet build
Use `-fileLoggerParameters` or `-flp` switch with `msbuild`, `dotnet build` or `dotnet msbuild` command to send logs to file. 
(_[ref.](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild-command-line-reference?view=vs-2019)_)

#### ScalaStyle
Result is already written to `target/scalastyle-result.xml` when project is built
(_[ref.](http://www.scalastyle.org/sbt.html)_)

#### AndroidLint
Use `-o <filename>` to output lint result to file
(_[ref.](http://tools.android.com/tips/lint)_)

#### DartLint
Use `-o <filename>` on output lint result created by command `dart analyze > <filename>` in dart project
(_[ref.](https://dart-lang.github.io/linter/lints/)_)

#### SwiftLint
Use `--output <filename>` to output lint result to file and `--reporter json` to format logs as JSON.
(_[ref.](https://github.com/realm/SwiftLint#command-line)_)

### Contribute
For contribution guidelines and project dev setup. Please see [CONTRIBUTING.md](CONTRIBUTING.md)
