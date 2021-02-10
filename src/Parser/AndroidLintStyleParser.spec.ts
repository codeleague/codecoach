import { LogSeverity } from './@enums/log.severity.enum';
import { AndroidLintStyleParser } from './AndroidLintStyleParser';

describe('AndroidLintStyleParser', () => {
  const cwd = 'C:/Users/a/scalaProjectRoot';
  const mockedContent = `<?xml version="1.0" encoding="UTF-8"?>
<issues format="5" by="lint 4.1.1">
  <issue id="GradleDependency" severity="Warning" message="A newer version of org.jetbrains.kotlin:kotlin-stdlib than 1.3.72 is available: 1.4.20" category="Correctness" priority="4" summary="Obsolete Gradle Dependency" explanation="This detector looks for usages of libraries where the version you are using is not the current stable release." errorLine1="implementation org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version" errorLine2="error line two">
    <location file="/Users/a/AndroidStudioProjects/MyApplication/app/build.gradle" line="42" column="5"/>
  </issue>
  <issue id="MissingTranslation" severity="Error" message="esp is not translated in (Abkhazian)" category="Correctness:Messages" priority="8" summary="Incomplete translation" explanation="If an application has more than one locale, then all the strings declared in one language should also be translated in all other languages." errorLine1="<string name=esp>My Application</string>" errorLine2="error line two">
    <location file="/Users/a/AndroidStudioProjects/MyApplication/app/src/main/res/values/strings.xml" line="4" column="13"/>
  </issue>
  <issue id="SetJavaScriptEnabled" severity="Warning" message="Using setJavaScriptEnabled can introduce XSS vulnerabilities into your application, review carefully" category="Security" priority="6" summary="Using setJavaScriptEnabled" explanation="Your code should not invoke setJavaScriptEnabled if you are not sure that your app really requires JavaScript support." url="https://developer.android.com/training/articles/security-tips" urls="https://developer.android.com/training/articles/security-tips" errorLine1="webView.settings.javaScriptEnabled = true" errorLine2="~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~">
    <location file="/Users/a/AndroidStudioProjects/MyApplication/app/src/main/java/com/example/myapplication/MainActivity.kt" line="16" column="9"/>
 </issue>
</issues>
`;
  const mockedContentWithNoError = `<?xml version="1.0" encoding="UTF-8"?>
  <issues format="5" by="lint 4.1.1"></issues>
  `;

  const mockedContentString = mockedContent;

  it('Should parse correctly', () => {
    const result = new AndroidLintStyleParser(cwd).parse(mockedContentString);
    expect(result).toHaveLength(3);

    expect(result[0]).toEqual({
      source: '/Users/a/AndroidStudioProjects/MyApplication/app/build.gradle',
      severity: LogSeverity.warning,
      line: 42,
      lineOffset: 5,
      msg: `A newer version of org.jetbrains.kotlin:kotlin-stdlib than 1.3.72 is available: 1.4.20`,
      log: `implementation &quot;org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version&quot;`,
      valid: true,
    });

    expect(result[1]).toEqual({
      source: `/Users/a/AndroidStudioProjects/MyApplication/app/src/main/res/values/strings.xml`,
      severity: LogSeverity.error,
      line: 4,
      lineOffset: 13,
      msg: `&quot;esp&quot; is not translated in &quot;ab&quot; (Abkhazian)`,
      log: `&lt;string name=&quot;esp&quot;>My Application&lt;/string>`,
      valid: true,
    });

    expect(result[2]).toEqual({
      source: `/Users/a/AndroidStudioProjects/MyApplication/app/src/main/java/com/example/myapplication/MainActivity.kt`,
      severity: LogSeverity.warning,
      line: 16,
      lineOffset: 9,
      msg: `Using \`setJavaScriptEnabled\` can introduce XSS vulnerabilities into your application, review carefully`,
      log: `webView.settings.javaScriptEnabled = true`,
      valid: true,
    });
  });

  it('Should do nothing if put empty string', () => {
    const result = new AndroidLintStyleParser(cwd).parse('');
    expect(result).toHaveLength(0);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new AndroidLintStyleParser(cwd).parse(':')).toThrow();
  });

  it('Should parse content with no error correctly', () => {
    const result = new AndroidLintStyleParser(cwd).parse(mockedContentWithNoError);
    expect(result).toHaveLength(0);
  });
});
