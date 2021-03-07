<h1 style="text-align: center">CodeCoach</h1>
<p style="text-align: center">
Lightweight code review tool. 
Provide lint output to CodeCoach, it will automatically review pull requests.
CodeCoach uses node.js as run time. It can be run from any command line.
So it can be integrated with any CI with ease.

<img alt="CodeCoach logo" src="https://user-images.githubusercontent.com/5965883/110232495-8cb95700-7f50-11eb-99ee-c223786e39a9.png"/>
</p>

#### Supported linters.
- ESLint
- TSLint
- MSBuild (both `msbuild.exe` and `dotnet build` commands)
- ScalaStyle
- AndroidLint

#### Supported source controls
- GitHub
- GitHub Enterprise

### Prerequisite
Node.js v14 or later

### Installation
Install it globally using npm
```shell script
$ npm i -g codecoach
```
or Yarn
```shell script
$ yarn global add codecoach
```

### Usage
Use command `codecoach` with required config.

_Example_
```shell script
$ codecoach --url="https://github.com/codeleague/codecoach" --pr=99 --token="token1234567890token" -f="eslint;/path/to/eslintoutput/json"
```

#### Configs
##### `--url`
###### Required
Repository url

##### `--pr`
###### Required
PR number to review

##### `--token`
###### Required
Repository access token. For GitHub, it's _"Personal access tokens"_ in settings.

##### `--buildLogFile` or `-f`
###### Required, Repeatable  
Build log content files config. Splitted in to 3 part, formatted in `<type>;<path>[;<cwd>]`
- Type: one of `dotnetbuild`, `msbuild`, `tslint`, `eslint`, `scalastyle` or `androidlint`
- Path: Path to lint output file to be processed
- cwd: Repository root directory for lint context (optional, will use current context if not provided)

For example,  
**Case 1**: Run CodeCoach from repo root for `eslint` and `dotnetbuild` in the same lint context directory
```
--buildLogFile="eslint;./src/client/eslint-out.json" --buildLogFile="dotnetbuild;./src/api/msbuild.log"
```

**Case 2**: Run CodeCoach from somewhere else for `androidlint` (linter context is `/path/to/project/root`)
```
--buildLogFile="androidlint;./android-lint.xml;/path/to/project/root"
```

##### `--output` or `-o`
###### Optional
Parsed lint result output.

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
