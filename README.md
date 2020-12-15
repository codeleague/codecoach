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
      --version       Show version number                                                                      [boolean]
      --url           GitHub repo url (https or ssh)                                                 [string] [required]
      --pr            PR number                                                                      [number] [required]
  -f, --buildLogFile  Build log content files formatted in '<type>;<path>[;<cwd>]'
                      where <type> is one of [dotnetbuild, msbuild, tslint, eslint, scalastyle]
                      <path> is build log file path to be processed
                      and <cwd> is build root directory (optional (Will use current context as cwd)).
                                                                                                      [array] [required]
  -o, --output        Output parsed log file                                            [string] [default: "build.json"]
      --token         GitHub token                                                                   [string] [required]
      --help          Show help                                                                                [boolean]
```
