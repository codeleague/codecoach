import { LogSeverity } from './@enums/log.severity.enum';
import { AndroidLintStyleParser } from './AndroidLintStyleParser';

describe('AndroidLintStyleParser', () => {
  it('Should parse correctly', () => {
    const result = new AndroidLintStyleParser(Cwd.projectAbsolutePath).parse(
      Content.correct,
    );
    expect(result).toHaveLength(3);

    expect(result[0]).toEqual({
      ruleId: 'GradleDependency',
      source: 'app/build.gradle',
      severity: LogSeverity.warning,
      line: 42,
      lineOffset: 5,
      msg: `A newer version of org.jetbrains.kotlin:kotlin-stdlib than 1.3.72 is available: 1.4.20`,
      log: `implementation org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version`,
      valid: true,
      type: 'androidlint',
    });

    expect(result[1]).toEqual({
      ruleId: 'MissingTranslation',
      source: `app/src/main/res/values/strings.xml`,
      severity: LogSeverity.error,
      line: 4,
      lineOffset: 13,
      msg: `esp is not translated in (Thai)`,
      log: `<string name=esp>My Application</string>`,
      valid: true,
      type: 'androidlint',
    });

    expect(result[2]).toEqual({
      ruleId: 'SetJavaScriptEnabled',
      source: `app/src/main/java/com/example/app/MainActivity.kt`,
      severity: LogSeverity.warning,
      line: 16,
      lineOffset: 9,
      msg: `Using \`setJavaScriptEnabled\` can introduce XSS vulnerabilities into your application, review carefully`,
      log: `webView.settings.javaScriptEnabled = true`,
      valid: true,
      type: 'androidlint',
    });
  });

  it('Should do nothing if put empty string', () => {
    const result = new AndroidLintStyleParser(Cwd.projectAbsolutePath).parse(
      Content.empty,
    );
    expect(result).toHaveLength(0);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() =>
      new AndroidLintStyleParser(Cwd.projectAbsolutePath).parse(Content.incorrect),
    ).toThrow();
  });

  it('Should parse content with no error correctly', () => {
    const result = new AndroidLintStyleParser(Cwd.projectAbsolutePath).parse(
      Content.noResults,
    );
    expect(result).toHaveLength(0);
  });

  it('Should not change source path when CodeCoach is executed from different cwd than lint', () => {
    const result = new AndroidLintStyleParser(Cwd.differentThanProjectAbsolutePath).parse(
      Content.correct,
    );
    expect(result).toHaveLength(3);
    expect(result[0].source).toEqual('/project-absolute-path/app/build.gradle');
    expect(result[1].source).toEqual(
      '/project-absolute-path/app/src/main/res/values/strings.xml',
    );
    expect(result[2].source).toEqual(
      '/project-absolute-path/app/src/main/java/com/example/app/MainActivity.kt',
    );
  });

  enum Cwd {
    projectAbsolutePath = '/project-absolute-path',
    differentThanProjectAbsolutePath = '/different-absolute-path',
  }

  enum Content {
    correct = `<?xml version="1.0" encoding="UTF-8"?>
<issues format="5" by="lint 4.1.1">
  <issue
    id="GradleDependency"
    severity="Warning"
    message="A newer version of org.jetbrains.kotlin:kotlin-stdlib than 1.3.72 is available: 1.4.20"
    category="Correctness"
    priority="4"
    summary="Obsolete Gradle Dependency"
    explanation="This detector looks for usages of libraries where the version you are using is not the stable release."
    errorLine1="implementation org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version"
    errorLine2="error line two">
    <location file="/project-absolute-path/app/build.gradle" line="42" column="5"/>
  </issue>
  <issue
    id="MissingTranslation"
    severity="Error"
    message="esp is not translated in (Thai)"
    category="Correctness:Messages"
    priority="8"
    summary="Incomplete translation"
    explanation="If an application has more than one locale, then all the strings should also be translated."
    errorLine1="<string name=esp>My Application</string>"
    errorLine2="error line two">
    <location file="/project-absolute-path/app/src/main/res/values/strings.xml" line="4" column="13"/>
  </issue>
  <issue
    id="SetJavaScriptEnabled"
    severity="Warning"
    message="Using \`setJavaScriptEnabled\` can introduce XSS vulnerabilities into your application, review carefully"
    category="Security"
    priority="6"
    summary="Using setJavaScriptEnabled"
    explanation="Your code should not invoke setJavaScriptEnabled if you are not sure that your app really requires JS."
    url="https://developer.android.com/training/articles/security-tips"
    urls="https://developer.android.com/training/articles/security-tips"
    errorLine1="webView.settings.javaScriptEnabled = true"
    errorLine2="~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~">
    <location file="/project-absolute-path/app/src/main/java/com/example/app/MainActivity.kt" line="16" column="9"/>
 </issue>
</issues>
`,
    noResults = `<?xml version="1.0" encoding="UTF-8"?><issues format="5" by="lint 4.1.1"></issues>`,
    empty = '',
    incorrect = ':',
  }
});
