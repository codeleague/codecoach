# CodeCoach
Automatic code report tool.

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
