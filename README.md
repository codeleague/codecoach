# CodeCoach
Use build log to automatically review your pull requests.  

#### Supported build tools & linters.
- ESLint
- TSLint
- MSBuild (both `msbuild.exe` and `dotnet build` commands)
- ScalaStyle

### Prerequisite
Node v14 or later

### Installation
CodeCoach packages are in GitHub Packages which require you to add scoped registry entry.

Append this to `.npmrc` file.
```
@codeleague:registry=https://npm.pkg.github.com
```

Then install it globally by npm
```shell script
$ npm i -g @codeleague/codecoach
```
or yarn
```shell script
$ yarn global add @codeleague/codecoach
```

### Usage
Just use command `codecoach`
```shell script
$ codecoach <options>
```

All available options
```
Options:
  --version       Show version number                                  [boolean]
  --url           GitHub repo url (https or ssh)             [string] [required]
  --pr            PR number                                  [number] [required]
  --type          Project type
[required] [choices: "dotnetbuild", "msbuild", "tslint", "eslint", "scalastyle"]
  --buildLogFile  Build log content files (repeatable); If this option is set,
                  build agent will be skipped                 [array] [required]
  --output        Output parsed log file        [string] [default: "build.json"]
  --token         GitHub token                               [string] [required]
  --cwd           Set working directory. Will use current context cwd if not
                  set.
                                                                        [string]
  --help          Show help                                            [boolean]

```

### How to get build logs
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
Result is already written to `target/scalastyle-result.xml`
(_[ref.](http://www.scalastyle.org/sbt.html)_)
