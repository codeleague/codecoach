import { LintSeverity } from './@enums/LintSeverity';
import { ScalaStyleParser } from './ScalaStyleParser';

describe('ScalaStyleParser', () => {
  const cwd = 'C:/Users/a/scalaProjectRoot';
  const mockedContent = `<?xml version="1.0" encoding="windows-1252"?>
<checkstyle version="5.0">
 <file name="C:\\some\\where\\else">
  <error column="4" line="53" source="some.gibberish.text.that.i.dont.wanna.keep.it" severity="error" message="Avoid mutable fields"/>
 </file>
 <file name="C:\\Users\\a\\scalaProjectRoot\\src\\main\\scala\\code\\dir\\subdir\\code-a.scala">
  <error severity="error" message="illegal start of definition: Token(VARID,yplTaxWithValue,1704,yplTaxWithValue)"/>
  <error column="7" line="7" source="some.gibberish.text.that.i.dont.wanna.keep.it" severity="error" message="Number of methods in class exceeds 30"/>
 </file>
 <file name="C:\\Users\\a\\scalaProjectRoot\\src\\main\\scala\\code\\code-c.scala">
  <error column="6" line="207" source="some.gibberish.text.that.i.dont.wanna.keep.it" severity="warning" message="Avoid mutable local variables"/>
 </file>
</checkstyle>
`;
  const mockedContentWithNoError = `<?xml version="1.0" encoding="windows-1252"?>
  <checkstyle version="5.0">
        
      </checkstyle>
  `;

  const mockedContentString = mockedContent;

  it('Should parse correctly', () => {
    const result = new ScalaStyleParser(cwd).parse(mockedContentString);
    expect(result).toHaveLength(4);

    expect(result[0]).toEqual({
      ruleId: 'some.gibberish.text.that.i.dont.wanna.keep.it',
      source: '',
      severity: LintSeverity.error,
      line: 53,
      lineOffset: 4,
      msg: `Avoid mutable fields`,
      log: `<error column="4" line="53" source="some.gibberish.text.that.i.dont.wanna.keep.it" severity="error" message="Avoid mutable fields"/>`,
      valid: false,
      type: 'scalastyle',
    });

    expect(result[1]).toEqual({
      ruleId: '',
      source: `src/main/scala/code/dir/subdir/code-a.scala`,
      severity: LintSeverity.error,
      line: undefined,
      lineOffset: undefined,
      msg: `illegal start of definition: Token(VARID,yplTaxWithValue,1704,yplTaxWithValue)`,
      log: `<error severity="error" message="illegal start of definition: Token(VARID,yplTaxWithValue,1704,yplTaxWithValue)"/>`,
      valid: true,
      type: 'scalastyle',
    });

    expect(result[2]).toEqual({
      ruleId: 'some.gibberish.text.that.i.dont.wanna.keep.it',
      source: `src/main/scala/code/dir/subdir/code-a.scala`,
      severity: LintSeverity.error,
      line: 7,
      lineOffset: 7,
      msg: `Number of methods in class exceeds 30`,
      log: `<error column="7" line="7" source="some.gibberish.text.that.i.dont.wanna.keep.it" severity="error" message="Number of methods in class exceeds 30"/>`,
      valid: true,
      type: 'scalastyle',
    });

    expect(result[3]).toEqual({
      ruleId: 'some.gibberish.text.that.i.dont.wanna.keep.it',
      source: `src/main/scala/code/code-c.scala`,
      severity: LintSeverity.warning,
      line: 207,
      lineOffset: 6,
      msg: `Avoid mutable local variables`,
      log: `<error column="6" line="207" source="some.gibberish.text.that.i.dont.wanna.keep.it" severity="warning" message="Avoid mutable local variables"/>`,
      valid: true,
      type: 'scalastyle',
    });
  });

  it('Should do nothing if put empty string', () => {
    const result = new ScalaStyleParser(cwd).parse('');
    expect(result).toHaveLength(0);
  });

  it('Should parse with valid/invalid correctly', () => {
    const result = new ScalaStyleParser(cwd).parse(mockedContentString);
    const valid = result.filter((el) => el.valid);
    const invalid = result.filter((el) => !el.valid);
    expect(valid).toHaveLength(3);
    expect(invalid).toHaveLength(1);
  });

  it('Should throw error if the line not match the rule', () => {
    expect(() => new ScalaStyleParser(cwd).parse(':')).toThrow();
  });

  it('Should parse content with no error correctly', () => {
    const result = new ScalaStyleParser(cwd).parse(mockedContentWithNoError);
    expect(result).toHaveLength(0);
  });
});
