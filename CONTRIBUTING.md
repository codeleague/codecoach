# Contributing to CodeCoach

## Logging issues

### Search for duplicates

[Search the existing issues](https://github.com/codeleague/codecoach/search?type=Issues) before logging a new one.

Some search tips:

- **Don't** restrict your search to only open issues. An issue with a title similar to yours may have been closed as a duplicate of one with a less-findable title.
- Check for synonyms. For example, if your bug involves an interface, it likely also occurs with type aliases or classes.
- Search for the title of the issue you're about to log. This sounds obvious but 80% of the time this is sufficient to find a duplicate when one exists.

### Bugs

When logging a bug, please be sure to include the following:

- What version you're using (run `codecoach --version`)
- Sample of your lint output file to be processed
- The behavior you expect to see, and the actual behavior

### Feature suggestions

Be sure to [search](https://github.com/codeleague/codecoach/search?type=Issues) first.

In general, things we find useful when reviewing suggestions are:

- A description of the problem you're trying to solve
- An overview of the suggested solution

## Contributing code
All work on CodeCoach happens directly on GitHub. 
Both members and external contributors send pull requests which go through the same review process.

### Setup

1. Fork this repo and create a new branch from `main`
1. Clone your fork down to your machine
1. Make sure you have a compatible version of node installed (v14.x is recommended)
   ```shell
    $ node -v
    ```
1. Make sure you have Yarn installed (CodeCoach uses Yarn for dependencies lock file)
   ```shell
    $ yarn -v
    ```
1. Install dependencies
   ```shell
    $ yarn
    ```
1. Build CodeCoach once to check TypeScript transpilation.
   ```shell
   $ yarn build
    ```
   
### Development

1. To run your local build.
      ```shell
   $ yarn dev
    ```
1.  To debug your local code. Set break points, attach your IDE to node process at `localhost:5858` and run `yarn dev`  
    Or use any of these preconfigured IDE settings.
    1. **WebStorm**  
       Run the `Debug Dev` run config. This will start CodeCoach dev and debugger together.
    1. **VSCode**  
       Run `dev:debug` config to start debugger. And run `yarn dev` in terminal to start CodeCoach dev.
       
    _(feel free to update `dev` script in `package.json` to test/debug your own settings.)_

1. If add or update any dependency. Please use `yarn`
   ```shell
   $ yarn add <package>
    ```

1. If add any new linter/build output support.
    1. Please add lint output sample in `./sample` (can add more than 1 for different scenarios)
    1. Please update [`README.md`](README.md) in these sections.
        1. Supported linters
        1. `--buildLogFile` config type name
        1. How to get lint output for CodeCoach

1. Make sure to comply project's code style.
   ```shell
   $ yarn lint
    ```

1. Make sure to add tests for your new code and not breaking existing test.
   ```shell
   $ yarn test
    ```
   
1. Send pull request! :)

## Releases

_For repo owners_  
Steps to release new version
1.  [Create new release](https://github.com/codeleague/codecoach/releases/new)  
    1. Tag version - Make sure to comply [SemVer](https://semver.org/) standard.
    1. Release title - Could be anything (Release vX.Y.Z) is recommended
    1. Release description - List down changes since last version.
    
1. Package publishing will be triggered automatically, check the status in [Workflow](https://github.com/codeleague/codecoach/actions/workflows/publish-npm.yml)

<hr/>

_(this CONTRIBUTING file refers to 
[TypeScript CONTRIBUTING](https://github.com/microsoft/TypeScript/blob/master/CONTRIBUTING.md), 
[Jest CONTRIBUTING](https://github.com/facebook/jest/blob/master/CONTRIBUTING.md))_
