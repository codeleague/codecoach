import { LogSeverity } from './@enums/log.severity.enum';
import { AndroidLintStyleParser } from './AndroidLintStyleParser';

describe('AndroidLintStyleParser', () => {
  const cwd = 'C:/Users/a/scalaProjectRoot';
  const mockedContent = `<?xml version="1.0" encoding="UTF-8"?>
<issues format="5" by="lint 4.1.1">
 <issue
         id="GradleDependency"
         severity="Warning"
         message="A newer version of org.jetbrains.kotlin:kotlin-stdlib than 1.3.72 is available: 1.4.20"
         category="Correctness"
         priority="4"
         summary="Obsolete Gradle Dependency"
         explanation="This detector looks for usages of libraries where the version you are using is not the current stable release. Using older versions is fine, and there are cases where you deliberately want to stick with an older version. However, you may simply not be aware that a more recent version is available, and that is what this lint check helps find."
         errorLine1="    implementation &quot;org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version&quot;"
         errorLine2="    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~">
  <location
          file="/Users/a/AndroidStudioProjects/MyApplication/app/build.gradle"
          line="42"
          column="5"/>
 </issue>
 <issue
         id="MissingTranslation"
         severity="Error"
         message="&quot;esp&quot; is not translated in &quot;ab&quot; (Abkhazian)"
         category="Correctness:Messages"
         priority="8"
         summary="Incomplete translation"
         explanation="If an application has more than one locale, then all the strings declared in one language should also be translated in all other languages.&#xA;&#xA;If the string should **not** be translated, you can add the attribute \`translatable=&quot;false&quot;\` on the \`&lt;string>\` element, or you can define all your non-translatable strings in a resource file called \`donottranslate.xml\`. Or, you can ignore the issue with a \`tools:ignore=&quot;MissingTranslation&quot;\` attribute.&#xA;&#xA;You can tell lint (and other tools) which language is the default language in your \`res/values/\` folder by specifying \`tools:locale=&quot;languageCode&quot;\` for the root \`&lt;resources>\` element in your resource file. (The \`tools\` prefix refers to the namespace declaration \`http://schemas.android.com/tools\`.)"
         errorLine1="    &lt;string name=&quot;esp&quot;>My Application&lt;/string>"
         errorLine2="            ~~~~~~~~~~">
  <location
          file="/Users/a/AndroidStudioProjects/MyApplication/app/src/main/res/values/strings.xml"
          line="4"
          column="13"/>
 </issue>
 <issue
         id="SetJavaScriptEnabled"
         severity="Warning"
         message="Using \`setJavaScriptEnabled\` can introduce XSS vulnerabilities into your application, review carefully"
         category="Security"
         priority="6"
         summary="Using \`setJavaScriptEnabled\`"
         explanation="Your code should not invoke \`setJavaScriptEnabled\` if you are not sure that your app really requires JavaScript support."
         url="https://developer.android.com/training/articles/security-tips"
         urls="https://developer.android.com/training/articles/security-tips"
         errorLine1="        webView.settings.javaScriptEnabled = true"
         errorLine2="        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~">
  <location
          file="/Users/a/AndroidStudioProjects/MyApplication/app/src/main/java/com/example/myapplication/MainActivity.kt"
          line="16"
          column="9"/>
 </issue>
 <issue
         id="AllowBackup"
         severity="Warning"
         message="On SDK version 23 and up, your app data will be automatically backed up and restored on app install. Consider adding the attribute \`android:fullBackupContent\` to specify an \`@xml\` resource which configures which files to backup. More info: https://developer.android.com/training/backup/autosyncapi.html"
         category="Security"
         priority="3"
         summary="AllowBackup/FullBackupContent Problems"
         explanation="The \`allowBackup\` attribute determines if an application&apos;s data can be backed up and restored. It is documented at https://developer.android.com/reference/android/R.attr.html#allowBackup&#xA;&#xA;By default, this flag is set to \`true\` which means application data can be backed up and restored by the OS. Setting \`allowBackup=&quot;false&quot;\` opts the application out of being backed up and so users can&apos;t restore data related to it when they go through the device setup wizard.&#xA;&#xA;Allowing backups may have security consequences for an application. Currently \`adb backup\` allows users who have enabled USB debugging to copy application data off of the device. Once backed up, all application data can be read by the user. \`adb restore\` allows creation of application data from a source specified by the user. Following a restore, applications should not assume that the data, file permissions, and directory permissions were created by the application itself.&#xA;&#xA;To fix this warning, decide whether your application should support backup, and explicitly set \`android:allowBackup=(true|false)&quot;\`.&#xA;&#xA;If not set to false, and if targeting API 23 or later, lint will also warn that you should set \`android:fullBackupContent\` to configure auto backup."
         url="https://developer.android.com/training/backup/autosyncapi.html"
         urls="https://developer.android.com/training/backup/autosyncapi.html,https://developer.android.com/reference/android/R.attr.html#allowBackup"
         errorLine1="    &lt;application"
         errorLine2="     ~~~~~~~~~~~">
  <location
          file="/Users/a/AndroidStudioProjects/MyApplication/app/src/main/AndroidManifest.xml"
          line="7"
          column="6"/>
 </issue>
 <issue
         id="UnusedResources"
         severity="Warning"
         message="The resource \`R.string.esp\` appears to be unused"
         category="Performance"
         priority="3"
         summary="Unused resources"
         explanation="Unused resources make applications larger and slow down builds.&#xA;&#xA;The unused resource check can ignore tests. If you want to include resources that are only referenced from tests, consider packaging them in a test source set instead.&#xA;&#xA;You can include test sources in the unused resource check by setting the system property lint.unused-resources.include-tests=true, and to exclude them (usually for performance reasons), use lint.unused-resources.exclude-tests=true."
         errorLine1="    &lt;string name=&quot;esp&quot;>My Application&lt;/string>"
         errorLine2="            ~~~~~~~~~~">
  <location
          file="/Users/a/AndroidStudioProjects/MyApplication/app/src/main/res/values/strings.xml"
          line="4"
          column="13"/>
 </issue>
</issues>
`;
  const mockedContentWithNoError = `<?xml version="1.0" encoding="UTF-8"?>
  <issues format="5" by="lint 4.1.1"></issues>
  `;

  const mockedContentString = mockedContent;

  it('Should parse correctly', () => {
    const result = new AndroidLintStyleParser(cwd).parse(mockedContentString);
    expect(result).toHaveLength(5);

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

    expect(result[3]).toEqual({
      source: `/Users/a/AndroidStudioProjects/MyApplication/app/src/main/AndroidManifest.xml`,
      severity: LogSeverity.warning,
      line: 7,
      lineOffset: 6,
      msg: `On SDK version 23 and up, your app data will be automatically backed up and restored on app install. Consider adding the attribute \`android:fullBackupContent\` to specify an \`@xml\` resource which configures which files to backup. More info: https://developer.android.com/training/backup/autosyncapi.html`,
      log: `&lt;application`,
      valid: true,
    });
    expect(result[4]).toEqual({
      source: `/Users/a/AndroidStudioProjects/MyApplication/app/src/main/res/values/strings.xml`,
      severity: LogSeverity.warning,
      line: 4,
      lineOffset: 13,
      msg: `The resource \`R.string.esp\` appears to be unused`,
      log: `&lt;string name=&quot;esp&quot;>My Application&lt;/string>`,
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
