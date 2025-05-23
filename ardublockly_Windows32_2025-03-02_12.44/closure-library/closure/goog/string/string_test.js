// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for goog.string.
 */

/** @suppress {extraProvide} */
goog.provide('goog.stringTest');

goog.require('goog.dom.TagName');
goog.require('goog.functions');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.string.Unicode');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.stringTest');

var stubs;
var mockControl;

function setUp() {
  stubs = new goog.testing.PropertyReplacer();
  mockControl = new goog.testing.MockControl();
}

function tearDown() {
  stubs.reset();
  mockControl.$tearDown();
}


//=== tests for goog.string.collapseWhitespace ===

function testCollapseWhiteSpace() {
  var f = goog.string.collapseWhitespace;

  assertEquals('Leading spaces not stripped', f('  abc'), 'abc');
  assertEquals('Trailing spaces not stripped', f('abc  '), 'abc');
  assertEquals('Wrapping spaces not stripped', f('  abc  '), 'abc');

  assertEquals(
      'All white space chars not stripped', f('\xa0\n\t abc\xa0\n\t '), 'abc');

  assertEquals('Spaces not collapsed', f('a   b    c'), 'a b c');

  assertEquals('Tabs not collapsed', f('a\t\t\tb\tc'), 'a b c');

  assertEquals(
      'All check failed', f(' \ta \t \t\tb\t\n\xa0  c  \t\n'), 'a b c');
}


function testIsEmpty() {
  assertTrue(goog.string.isEmpty(''));
  assertTrue(goog.string.isEmpty(' '));
  assertTrue(goog.string.isEmpty('    '));
  assertTrue(goog.string.isEmpty(' \t\t\n\xa0   '));

  assertFalse(goog.string.isEmpty(' abc \t\xa0'));
  assertFalse(goog.string.isEmpty(' a b c \t'));
  assertFalse(goog.string.isEmpty(';'));

  assertFalse(goog.string.isEmpty(undefined));
  assertFalse(goog.string.isEmpty(null));
  assertFalse(goog.string.isEmpty({a: 1, b: 2}));
}


function testIsEmptyOrWhitespace() {
  assertTrue(goog.string.isEmptyOrWhitespace(''));
  assertTrue(goog.string.isEmptyOrWhitespace(' '));
  assertTrue(goog.string.isEmptyOrWhitespace('    '));
  assertTrue(goog.string.isEmptyOrWhitespace(' \t\t\n\xa0   '));

  assertFalse(goog.string.isEmptyOrWhitespace(' abc \t\xa0'));
  assertFalse(goog.string.isEmptyOrWhitespace(' a b c \t'));
  assertFalse(goog.string.isEmptyOrWhitespace(';'));

  assertFalse(goog.string.isEmptyOrWhitespace(undefined));
  assertFalse(goog.string.isEmptyOrWhitespace(null));
  assertFalse(goog.string.isEmptyOrWhitespace({a: 1, b: 2}));
}


function testIsEmptyString() {
  assertTrue(goog.string.isEmptyString(''));

  assertFalse(goog.string.isEmptyString(' '));
  assertFalse(goog.string.isEmptyString('    '));
  assertFalse(goog.string.isEmptyString(' \t\t\n\xa0   '));
  assertFalse(goog.string.isEmptyString(' abc \t\xa0'));
  assertFalse(goog.string.isEmptyString(' a b c \t'));
  assertFalse(goog.string.isEmptyString(';'));

  assertFalse(goog.string.isEmptyString({a: 1, b: 2}));
}


function testIsEmptySafe() {
  assertTrue(goog.string.isEmptySafe(''));
  assertTrue(goog.string.isEmptySafe(' '));
  assertTrue(goog.string.isEmptySafe('    '));
  assertTrue(goog.string.isEmptySafe(' \t\t\n\xa0   '));

  assertFalse(goog.string.isEmptySafe(' abc \t\xa0'));
  assertFalse(goog.string.isEmptySafe(' a b c \t'));
  assertFalse(goog.string.isEmptySafe(';'));

  assertTrue(goog.string.isEmptySafe(undefined));
  assertTrue(goog.string.isEmptySafe(null));
  assertFalse(goog.string.isEmptySafe({a: 1, b: 2}));
}


function testIsEmptyOrWhitespaceSafe() {
  assertTrue(goog.string.isEmptyOrWhitespaceSafe(''));
  assertTrue(goog.string.isEmptyOrWhitespaceSafe(' '));
  assertTrue(goog.string.isEmptyOrWhitespaceSafe('    '));
  assertTrue(goog.string.isEmptyOrWhitespaceSafe(' \t\t\n\xa0   '));

  assertFalse(goog.string.isEmptyOrWhitespaceSafe(' abc \t\xa0'));
  assertFalse(goog.string.isEmptyOrWhitespaceSafe(' a b c \t'));
  assertFalse(goog.string.isEmptyOrWhitespaceSafe(';'));

  assertTrue(goog.string.isEmptyOrWhitespaceSafe(undefined));
  assertTrue(goog.string.isEmptyOrWhitespaceSafe(null));
  assertFalse(goog.string.isEmptyOrWhitespaceSafe({a: 1, b: 2}));
}


//=== tests for goog.string.isAlpha ===
function testIsAlpha() {
  assertTrue('"a" should be alpha', goog.string.isAlpha('a'));
  assertTrue('"n" should be alpha', goog.string.isAlpha('n'));
  assertTrue('"z" should be alpha', goog.string.isAlpha('z'));
  assertTrue('"A" should be alpha', goog.string.isAlpha('A'));
  assertTrue('"N" should be alpha', goog.string.isAlpha('N'));
  assertTrue('"Z" should be alpha', goog.string.isAlpha('Z'));
  assertTrue('"aa" should be alpha', goog.string.isAlpha('aa'));
  assertTrue('null is alpha', goog.string.isAlpha(null));
  assertTrue('undefined is alpha', goog.string.isAlpha(undefined));

  assertFalse('"aa!" is not alpha', goog.string.isAlpha('aa!s'));
  assertFalse('"!" is not alpha', goog.string.isAlpha('!'));
  assertFalse('"0" is not alpha', goog.string.isAlpha('0'));
  assertFalse('"5" is not alpha', goog.string.isAlpha('5'));
}



//=== tests for goog.string.isNumeric ===
function testIsNumeric() {
  assertTrue('"8" is a numeric string', goog.string.isNumeric('8'));
  assertTrue('"5" is a numeric string', goog.string.isNumeric('5'));
  assertTrue('"34" is a numeric string', goog.string.isNumeric('34'));
  assertTrue('34 is a number', goog.string.isNumeric(34));

  assertFalse('"3.14" has a period', goog.string.isNumeric('3.14'));
  assertFalse('"A" is a letter', goog.string.isNumeric('A'));
  assertFalse('"!" is punctuation', goog.string.isNumeric('!'));
  assertFalse('null is not numeric', goog.string.isNumeric(null));
  assertFalse('undefined is not numeric', goog.string.isNumeric(undefined));
}


//=== tests for tests for goog.string.isAlphaNumeric ===
function testIsAlphaNumeric() {
  assertTrue(
      '"ABCabc" should be alphanumeric', goog.string.isAlphaNumeric('ABCabc'));
  assertTrue('"123" should be alphanumeric', goog.string.isAlphaNumeric('123'));
  assertTrue(
      '"ABCabc123" should be alphanumeric',
      goog.string.isAlphaNumeric('ABCabc123'));
  assertTrue('null is alphanumeric', goog.string.isAlphaNumeric(null));
  assertTrue(
      'undefined is alphanumeric', goog.string.isAlphaNumeric(undefined));

  assertFalse(
      '"123!" should not be alphanumeric', goog.string.isAlphaNumeric('123!'));
  assertFalse(
      '"  " should not be alphanumeric', goog.string.isAlphaNumeric('  '));
}


//== tests for goog.string.isBreakingWhitespace ===

function testIsBreakingWhitespace() {
  assertTrue('" " is breaking', goog.string.isBreakingWhitespace(' '));
  assertTrue('"\\n" is breaking', goog.string.isBreakingWhitespace('\n'));
  assertTrue('"\\t" is breaking', goog.string.isBreakingWhitespace('\t'));
  assertTrue('"\\r" is breaking', goog.string.isBreakingWhitespace('\r'));
  assertTrue(
      '"\\r\\n\\t " is breaking', goog.string.isBreakingWhitespace('\r\n\t '));

  assertFalse('nbsp is non-breaking', goog.string.isBreakingWhitespace('\xa0'));
  assertFalse('"a" is non-breaking', goog.string.isBreakingWhitespace('a'));
  assertFalse(
      '"a\\r" is non-breaking', goog.string.isBreakingWhitespace('a\r'));
}


//=== tests for goog.string.isSpace ===
function testIsSpace() {
  assertTrue('" " is a space', goog.string.isSpace(' '));

  assertFalse('"\\n" is not a space', goog.string.isSpace('\n'));
  assertFalse('"\\t" is not a space', goog.string.isSpace('\t'));
  assertFalse(
      '"  " is not a space, it\'s two spaces', goog.string.isSpace('  '));
  assertFalse('"a" is not a space', goog.string.isSpace('a'));
  assertFalse('"3" is not a space', goog.string.isSpace('3'));
  assertFalse('"#" is not a space', goog.string.isSpace('#'));
  assertFalse('null is not a space', goog.string.isSpace(null));
  assertFalse('nbsp is not a space', goog.string.isSpace('\xa0'));
}


// === tests for goog.string.stripNewlines ===
function testStripNewLines() {
  assertEquals(
      'Should replace new lines with spaces',
      goog.string.stripNewlines('some\nlines\rthat\r\nare\n\nsplit'),
      'some lines that are split');
}


// === tests for goog.string.canonicalizeNewlines ===
function testCanonicalizeNewlines() {
  assertEquals(
      'Should replace all types of new line with \\n',
      goog.string.canonicalizeNewlines('some\nlines\rthat\r\nare\n\nsplit'),
      'some\nlines\nthat\nare\n\nsplit');
}


// === tests for goog.string.normalizeWhitespace ===
function testNormalizeWhitespace() {
  assertEquals(
      'All whitespace chars should be replaced with a normal space',
      goog.string.normalizeWhitespace('\xa0 \n\t \xa0 \n\t'), '         ');
}


// === tests for goog.string.normalizeSpaces ===
function testNormalizeSpaces() {
  assertEquals(
      'All whitespace chars should be replaced with a normal space',
      goog.string.normalizeSpaces('\xa0 \t \xa0 \t'), '    ');
}

function testCollapseBreakingSpaces() {
  assertEquals(
      'breaking spaces are collapsed', 'a b',
      goog.string.collapseBreakingSpaces(' \t\r\n a \t\r\n b \t\r\n '));
  assertEquals(
      'non-breaking spaces are kept', 'a \u00a0\u2000 b',
      goog.string.collapseBreakingSpaces('a \u00a0\u2000 b'));
}

/// === tests for goog.string.trim ===
function testTrim() {
  assertEquals(
      'Should be the same', goog.string.trim('nothing 2 trim'),
      'nothing 2 trim');
  assertEquals(
      'Remove spaces', goog.string.trim('   hello  goodbye   '),
      'hello  goodbye');
  assertEquals(
      'Trim other stuff', goog.string.trim('\n\r\xa0 hi \r\n\xa0'), 'hi');
}


/// === tests for goog.string.trimLeft ===
function testTrimLeft() {
  var f = goog.string.trimLeft;
  assertEquals('Should be the same', f('nothing to trim'), 'nothing to trim');
  assertEquals('Remove spaces', f('   hello  goodbye   '), 'hello  goodbye   ');
  assertEquals('Trim other stuff', f('\xa0\n\r hi \r\n\xa0'), 'hi \r\n\xa0');
}


/// === tests for goog.string.trimRight ===
function testTrimRight() {
  var f = goog.string.trimRight;
  assertEquals('Should be the same', f('nothing to trim'), 'nothing to trim');
  assertEquals('Remove spaces', f('   hello  goodbye   '), '   hello  goodbye');
  assertEquals('Trim other stuff', f('\n\r\xa0 hi \r\n\xa0'), '\n\r\xa0 hi');
}


// === tests for goog.string.startsWith ===
function testStartsWith() {
  assertTrue('Should start with \'\'', goog.string.startsWith('abcd', ''));
  assertTrue('Should start with \'ab\'', goog.string.startsWith('abcd', 'ab'));
  assertTrue(
      'Should start with \'abcd\'', goog.string.startsWith('abcd', 'abcd'));
  assertFalse(
      'Should not start with \'bcd\'', goog.string.startsWith('abcd', 'bcd'));
}

function testEndsWith() {
  assertTrue('Should end with \'\'', goog.string.endsWith('abcd', ''));
  assertTrue('Should end with \'ab\'', goog.string.endsWith('abcd', 'cd'));
  assertTrue('Should end with \'abcd\'', goog.string.endsWith('abcd', 'abcd'));
  assertFalse('Should not end \'abc\'', goog.string.endsWith('abcd', 'abc'));
  assertFalse(
      'Should not end \'abcde\'', goog.string.endsWith('abcd', 'abcde'));
}


// === tests for goog.string.caseInsensitiveStartsWith ===
function testCaseInsensitiveStartsWith() {
  assertTrue(
      'Should start with \'\'',
      goog.string.caseInsensitiveStartsWith('abcd', ''));
  assertTrue(
      'Should start with \'ab\'',
      goog.string.caseInsensitiveStartsWith('abcd', 'Ab'));
  assertTrue(
      'Should start with \'abcd\'',
      goog.string.caseInsensitiveStartsWith('AbCd', 'abCd'));
  assertFalse(
      'Should not start with \'bcd\'',
      goog.string.caseInsensitiveStartsWith('ABCD', 'bcd'));
}

// === tests for goog.string.caseInsensitiveEndsWith ===
function testCaseInsensitiveEndsWith() {
  assertTrue(
      'Should end with \'\'', goog.string.caseInsensitiveEndsWith('abcd', ''));
  assertTrue(
      'Should end with \'cd\'',
      goog.string.caseInsensitiveEndsWith('abCD', 'cd'));
  assertTrue(
      'Should end with \'abcd\'',
      goog.string.caseInsensitiveEndsWith('abcd', 'abCd'));
  assertFalse(
      'Should not end \'abc\'',
      goog.string.caseInsensitiveEndsWith('aBCd', 'ABc'));
  assertFalse(
      'Should not end \'abcde\'',
      goog.string.caseInsensitiveEndsWith('ABCD', 'abcde'));
}

// === tests for goog.string.caseInsensitiveEquals ===
function testCaseInsensitiveEquals() {
  function assertCaseInsensitiveEquals(str1, str2) {
    assertTrue(goog.string.caseInsensitiveEquals(str1, str2));
  }

  function assertCaseInsensitiveNotEquals(str1, str2) {
    assertFalse(goog.string.caseInsensitiveEquals(str1, str2));
  }

  assertCaseInsensitiveEquals('abc', 'abc');
  assertCaseInsensitiveEquals('abc', 'abC');
  assertCaseInsensitiveEquals('d,e,F,G', 'd,e,F,G');
  assertCaseInsensitiveEquals('ABCD EFGH 1234', 'abcd efgh 1234');
  assertCaseInsensitiveEquals('FooBarBaz', 'fOObARbAZ');

  assertCaseInsensitiveNotEquals('ABCD EFGH', 'abcd efg');
  assertCaseInsensitiveNotEquals('ABC DEFGH', 'ABCD EFGH');
  assertCaseInsensitiveNotEquals('FooBarBaz', 'fOObARbAZ ');
}


// === tests for goog.string.subs ===
function testSubs() {
  assertEquals(
      'Should be the same', 'nothing to subs',
      goog.string.subs('nothing to subs'));
  assertEquals('Should be the same', '1', goog.string.subs('%s', '1'));
  assertEquals(
      'Should be the same', '12true', goog.string.subs('%s%s%s', '1', 2, true));
  function f() { fail('This should not be called'); }
  f.toString = function() { return 'f'; };
  assertEquals('Should not call function', 'f', goog.string.subs('%s', f));

  // If the string that is to be substituted in contains $& then it will be
  // usually be replaced with %s, we need to check goog.string.subs, handles
  // this case.
  assertEquals(
      '$& should not be substituted with %s', 'Foo Bar $&',
      goog.string.subs('Foo %s', 'Bar $&'));

  assertEquals(
      '$$ should not be substituted', '_$$_', goog.string.subs('%s', '_$$_'));
  assertEquals(
      '$` should not be substituted', '_$`_', goog.string.subs('%s', '_$`_'));
  assertEquals(
      '$\' should not be substituted', '_$\'_',
      goog.string.subs('%s', '_$\'_'));
  for (var i = 0; i < 99; i += 9) {
    assertEquals(
        '$' + i + ' should not be substituted', '_$' + i + '_',
        goog.string.subs('%s', '_$' + i + '_'));
  }

  assertEquals(
      'Only the first three "%s" strings should be replaced.',
      'test foo test bar test baz test %s test %s test',
      goog.string.subs(
          'test %s test %s test %s test %s test %s test', 'foo', 'bar', 'baz'));
}


/**
 * Verifies that if too many arguments are given, they are ignored.
 * Logic test for bug documented here: http://go/eusxz
 */
function testSubsTooManyArguments() {
  assertEquals('one', goog.string.subs('one', 'two', 'three'));
  assertEquals('onetwo', goog.string.subs('one%s', 'two', 'three'));
}


// === tests for goog.string.caseInsensitiveCompare ===
function testCaseInsensitiveCompare() {
  var f = goog.string.caseInsensitiveCompare;

  assert('"ABC" should be less than "def"', f('ABC', 'def') == -1);
  assert('"abc" should be less than "DEF"', f('abc', 'DEF') == -1);

  assert('"XYZ" should equal "xyz"', f('XYZ', 'xyz') == 0);

  assert('"XYZ" should be greater than "UVW"', f('xyz', 'UVW') == 1);
  assert('"XYZ" should be greater than "uvw"', f('XYZ', 'uvw') == 1);
}


/**
 * Test cases for goog.string.floatAwareCompare and goog.string.intAwareCompare.
 * Each comparison in this list is tested to assure that terms[0] < terms[1],
 * terms[1] > terms[0], and identity tests terms[0] == terms[0] and
 * terms[1] == terms[1].
 * @const {!Array<!Array<string>>}
 */
var NUMERIC_COMPARISON_TEST_CASES = [
  ['', '0'], ['2', '10'], ['05', '9'], ['sub', 'substring'],
  ['photo 7', 'Photo 8'],  // Case insensitive for most sorts.
  ['Mango', 'mango'],      // Case sensitive if strings are otherwise identical.
  ['album 2 photo 20', 'album 10 photo 20'],
  ['album 7 photo 20', 'album 7 photo 100']
];


function testFloatAwareCompare() {
  var comparisons = NUMERIC_COMPARISON_TEST_CASES.concat([['3.14', '3.2']]);
  for (var i = 0; i < comparisons.length; i++) {
    var terms = comparisons[i];
    assert(
        terms[0] + ' should be less than ' + terms[1],
        goog.string.floatAwareCompare(terms[0], terms[1]) < 0);
    assert(
        terms[1] + ' should be greater than ' + terms[0],
        goog.string.floatAwareCompare(terms[1], terms[0]) > 0);
    assert(
        terms[0] + ' should be equal to ' + terms[0],
        goog.string.floatAwareCompare(terms[0], terms[0]) == 0);
    assert(
        terms[1] + ' should be equal to ' + terms[1],
        goog.string.floatAwareCompare(terms[1], terms[1]) == 0);
  }
}


function testIntAwareCompare() {
  var comparisons = NUMERIC_COMPARISON_TEST_CASES.concat([['3.2', '3.14']]);
  for (var i = 0; i < comparisons.length; i++) {
    var terms = comparisons[i];
    assert(
        terms[0] + ' should be less than ' + terms[1],
        goog.string.intAwareCompare(terms[0], terms[1]) < 0);
    assert(
        terms[1] + ' should be greater than ' + terms[0],
        goog.string.intAwareCompare(terms[1], terms[0]) > 0);
    assert(
        terms[0] + ' should be equal to ' + terms[0],
        goog.string.intAwareCompare(terms[0], terms[0]) == 0);
    assert(
        terms[1] + ' should be equal to ' + terms[1],
        goog.string.intAwareCompare(terms[1], terms[1]) == 0);
  }
}


// === tests for goog.string.urlEncode && .urlDecode ===
// NOTE: When test was written it was simply an alias for the built in
// 'encodeURICompoent', therefore this test is simply used to make sure that in
// the future it doesn't get broken.
function testUrlEncodeAndDecode() {
  var input = '<p>"hello there," she said, "what is going on here?</p>';
  var output = '%3Cp%3E%22hello%20there%2C%22%20she%20said%2C%20%22what%20is' +
      '%20going%20on%20here%3F%3C%2Fp%3E';

  assertEquals(
      'urlEncode vs encodeURIComponent', encodeURIComponent(input),
      goog.string.urlEncode(input));

  assertEquals('urlEncode vs model', goog.string.urlEncode(input), output);

  assertEquals('urlDecode vs model', goog.string.urlDecode(output), input);

  assertEquals(
      'urlDecode vs urlEncode',
      goog.string.urlDecode(goog.string.urlEncode(input)), input);

  assertEquals(
      'urlDecode with +s instead of %20s',
      goog.string.urlDecode(output.replace(/%20/g, '+')), input);
}


// === tests for goog.string.newLineToBr ===
function testNewLineToBr() {
  var str = 'some\nlines\rthat\r\nare\n\nsplit';
  var html = 'some<br>lines<br>that<br>are<br><br>split';
  var xhtml = 'some<br />lines<br />that<br />are<br /><br />split';

  assertEquals('Should be html', goog.string.newLineToBr(str), html);
  assertEquals('Should be html', goog.string.newLineToBr(str, false), html);
  assertEquals('Should be xhtml', goog.string.newLineToBr(str, true), xhtml);
}


// === tests for goog.string.htmlEscape and .unescapeEntities ===
function testHtmlEscapeAndUnescapeEntities() {
  var text = '\'"x1 < x2 && y2 > y1"\'';
  var html = '&#39;&quot;x1 &lt; x2 &amp;&amp; y2 &gt; y1&quot;&#39;';

  assertEquals('Testing htmlEscape', html, goog.string.htmlEscape(text));
  assertEquals('Testing htmlEscape', html, goog.string.htmlEscape(text, false));
  assertEquals('Testing htmlEscape', html, goog.string.htmlEscape(text, true));
  assertEquals(
      'Testing unescapeEntities', text, goog.string.unescapeEntities(html));

  assertEquals(
      'escape -> unescape', text,
      goog.string.unescapeEntities(goog.string.htmlEscape(text)));
  assertEquals(
      'unescape -> escape', html,
      goog.string.htmlEscape(goog.string.unescapeEntities(html)));
}

function testHtmlUnescapeEntitiesWithDocument() {
  var documentMock = {
    createElement: mockControl.createFunctionMock('createElement')
  };
  var divMock = document.createElement(goog.dom.TagName.DIV);
  documentMock.createElement('div').$returns(divMock);
  mockControl.$replayAll();

  var html = '&lt;a&b&gt;';
  var text = '<a&b>';

  assertEquals(
      'wrong unescaped value', text,
      goog.string.unescapeEntitiesWithDocument(html, documentMock));
  assertNotEquals(
      'divMock.innerHTML should have been used', '', divMock.innerHTML);
  mockControl.$verifyAll();
}

function testHtmlEscapeAndUnescapeEntitiesUsingDom() {
  var text = '"x1 < x2 && y2 > y1"';
  var html = '&quot;x1 &lt; x2 &amp;&amp; y2 &gt; y1&quot;';

  assertEquals(
      'Testing unescapeEntities', goog.string.unescapeEntitiesUsingDom_(html),
      text);
  assertEquals(
      'escape -> unescape',
      goog.string.unescapeEntitiesUsingDom_(goog.string.htmlEscape(text)),
      text);
  assertEquals(
      'unescape -> escape',
      goog.string.htmlEscape(goog.string.unescapeEntitiesUsingDom_(html)),
      html);
}

function testHtmlUnescapeEntitiesUsingDom_withAmpersands() {
  var html = '&lt;a&b&gt;';
  var text = '<a&b>';

  assertEquals(
      'wrong unescaped value', text,
      goog.string.unescapeEntitiesUsingDom_(html));
}

function testHtmlEscapeAndUnescapePureXmlEntities_() {
  var text = '"x1 < x2 && y2 > y1"';
  var html = '&quot;x1 &lt; x2 &amp;&amp; y2 &gt; y1&quot;';

  assertEquals(
      'Testing unescapePureXmlEntities_',
      goog.string.unescapePureXmlEntities_(html), text);
  assertEquals(
      'escape -> unescape',
      goog.string.unescapePureXmlEntities_(goog.string.htmlEscape(text)), text);
  assertEquals(
      'unescape -> escape',
      goog.string.htmlEscape(goog.string.unescapePureXmlEntities_(html)), html);
}


function testForceNonDomHtmlUnescaping() {
  stubs.set(goog.string, 'FORCE_NON_DOM_HTML_UNESCAPING', true);
  // Set document.createElement to empty object so that the call to
  // unescapeEntities will blow up if html unescaping is carried out with DOM.
  // Notice that we can't directly set document to empty object since IE8 won't
  // let us do so.
  stubs.set(goog.global.document, 'createElement', {});
  goog.string.unescapeEntities('&quot;x1 &lt; x2 &amp;&amp; y2 &gt; y1&quot;');
}


function testHtmlEscapeDetectDoubleEscaping() {
  stubs.set(goog.string, 'DETECT_DOUBLE_ESCAPING', true);
  assertEquals('&#101; &lt; pi', goog.string.htmlEscape('e < pi'));
  assertEquals('&#101; &lt; pi', goog.string.htmlEscape('e < pi', true));
}

function testHtmlEscapeNullByte() {
  assertEquals('&#0;', goog.string.htmlEscape('\x00'));
  assertEquals('&#0;', goog.string.htmlEscape('\x00', true));
  assertEquals('\\x00', goog.string.htmlEscape('\\x00'));
  assertEquals('\\x00', goog.string.htmlEscape('\\x00', true));
}

var globalXssVar = 0;

function testXssUnescapeEntities() {
  // This tests that we don't have any XSS exploits in unescapeEntities
  var test = '&amp;<script defer>globalXssVar=1;</' +
      'script>';
  var expected = '&<script defer>globalXssVar=1;</' +
      'script>';

  assertEquals(
      'Testing unescapeEntities', expected, goog.string.unescapeEntities(test));
  assertEquals('unescapeEntities is vulnarable to XSS', 0, globalXssVar);

  test = '&amp;<script>globalXssVar=1;</' +
      'script>';
  expected = '&<script>globalXssVar=1;</' +
      'script>';

  assertEquals(
      'Testing unescapeEntities', expected, goog.string.unescapeEntities(test));
  assertEquals('unescapeEntities is vulnarable to XSS', 0, globalXssVar);
}


function testXssUnescapeEntitiesUsingDom() {
  // This tests that we don't have any XSS exploits in unescapeEntitiesUsingDom
  var test = '&amp;<script defer>globalXssVar=1;</' +
      'script>';
  var expected = '&<script defer>globalXssVar=1;</' +
      'script>';

  assertEquals(
      'Testing unescapeEntitiesUsingDom_', expected,
      goog.string.unescapeEntitiesUsingDom_(test));
  assertEquals(
      'unescapeEntitiesUsingDom_ is vulnerable to XSS', 0, globalXssVar);

  test = '&amp;<script>globalXssVar=1;</' +
      'script>';
  expected = '&<script>globalXssVar=1;</' +
      'script>';

  assertEquals(
      'Testing unescapeEntitiesUsingDom_', expected,
      goog.string.unescapeEntitiesUsingDom_(test));
  assertEquals(
      'unescapeEntitiesUsingDom_ is vulnerable to XSS', 0, globalXssVar);
}


function testXssUnescapePureXmlEntities() {
  // This tests that we don't have any XSS exploits in unescapePureXmlEntities
  var test = '&amp;<script defer>globalXssVar=1;</' +
      'script>';
  var expected = '&<script defer>globalXssVar=1;</' +
      'script>';

  assertEquals(
      'Testing unescapePureXmlEntities_', expected,
      goog.string.unescapePureXmlEntities_(test));
  assertEquals(
      'unescapePureXmlEntities_ is vulnarable to XSS', 0, globalXssVar);

  test = '&amp;<script>globalXssVar=1;</' +
      'script>';
  expected = '&<script>globalXssVar=1;</' +
      'script>';

  assertEquals(
      'Testing unescapePureXmlEntities_', expected,
      goog.string.unescapePureXmlEntities_(test));
  assertEquals(
      'unescapePureXmlEntities_ is vulnarable to XSS', 0, globalXssVar);
}


function testUnescapeEntitiesPreservesWhitespace() {
  // This tests that whitespace is preserved (primarily for IE)
  // Also make sure leading and trailing whitespace are preserved.
  var test = '\nTesting\n\twhitespace\n    preservation\n';
  var expected = test;

  assertEquals(
      'Testing unescapeEntities', expected, goog.string.unescapeEntities(test));

  // Now with entities
  test += ' &amp;&nbsp;\n';
  expected += ' &\u00A0\n';
  assertEquals(
      'Testing unescapeEntities', expected, goog.string.unescapeEntities(test));
}


// === tests for goog.string.whitespaceEscape ===
function testWhitespaceEscape() {
  assertEquals(
      'Should be the same',
      goog.string.whitespaceEscape('one two  three   four    five     '),
      'one two &#160;three &#160; four &#160; &#160;five &#160; &#160; ');
}


// === tests for goog.string.preserveSpaces ===
function testPreserveSpaces() {
  var nbsp = goog.string.Unicode.NBSP;
  assertEquals('', goog.string.preserveSpaces(''));
  assertEquals(nbsp + 'a', goog.string.preserveSpaces(' a'));
  assertEquals(nbsp + ' a', goog.string.preserveSpaces('  a'));
  assertEquals(nbsp + ' ' + nbsp + 'a', goog.string.preserveSpaces('   a'));
  assertEquals('a ' + nbsp + 'b', goog.string.preserveSpaces('a  b'));
  assertEquals('a\n' + nbsp + 'b', goog.string.preserveSpaces('a\n b'));

  // We don't care about trailing spaces.
  assertEquals('a ', goog.string.preserveSpaces('a '));
  assertEquals('a \n' + nbsp + 'b', goog.string.preserveSpaces('a \n b'));
}


// === tests for goog.string.stripQuotes ===
function testStripQuotes() {
  assertEquals(
      'Quotes should be stripped', goog.string.stripQuotes('"hello"', '"'),
      'hello');

  assertEquals(
      'Quotes should be stripped', goog.string.stripQuotes('\'hello\'', '\''),
      'hello');

  assertEquals(
      'Quotes should not be stripped', goog.string.stripQuotes('-"hello"', '"'),
      '-"hello"');
}

function testStripQuotesMultiple() {
  assertEquals(
      'Quotes should be stripped', goog.string.stripQuotes('"hello"', '"\''),
      'hello');
  assertEquals(
      'Quotes should be stripped', goog.string.stripQuotes('\'hello\'', '"\''),
      'hello');

  assertEquals(
      'Quotes should be stripped', goog.string.stripQuotes('\'hello\'', ''),
      '\'hello\'');
}

function testStripQuotesMultiple2() {
  // Makes sure we do not strip twice
  assertEquals(
      'Quotes should be stripped',
      goog.string.stripQuotes('"\'hello\'"', '"\''), '\'hello\'');
  assertEquals(
      'Quotes should be stripped',
      goog.string.stripQuotes('"\'hello\'"', '\'"'), '\'hello\'');
}

// === tests for goog.string.truncate ===
function testTruncate() {
  var str = 'abcdefghijklmnopqrstuvwxyz';
  assertEquals('Should be equal', goog.string.truncate(str, 8), 'abcde...');
  assertEquals('Should be equal', goog.string.truncate(str, 11), 'abcdefgh...');

  var html = 'true &amp;&amp; false == false';
  assertEquals(
      'Should clip html char', goog.string.truncate(html, 11), 'true &am...');
  assertEquals(
      'Should not clip html char', goog.string.truncate(html, 12, true),
      'true &amp;&amp; f...');
}


// === tests for goog.string.truncateMiddle ===
function testTruncateMiddle() {
  var str = 'abcdefghijklmnopqrstuvwxyz';
  assertEquals('abc...xyz', goog.string.truncateMiddle(str, 6));
  assertEquals('abc...yz', goog.string.truncateMiddle(str, 5));
  assertEquals(str, goog.string.truncateMiddle(str, str.length));

  var html = 'true &amp;&amp; false == false';
  assertEquals(
      'Should clip html char', 'true &a...= false',
      goog.string.truncateMiddle(html, 14));
  assertEquals(
      'Should not clip html char', 'true &amp;&amp;...= false',
      goog.string.truncateMiddle(html, 14, true));

  assertEquals('ab...xyz', goog.string.truncateMiddle(str, 5, null, 3));
  assertEquals('abcdefg...xyz', goog.string.truncateMiddle(str, 10, null, 3));
  assertEquals('abcdef...wxyz', goog.string.truncateMiddle(str, 10, null, 4));
  assertEquals('...yz', goog.string.truncateMiddle(str, 2, null, 3));
  assertEquals(str, goog.string.truncateMiddle(str, 50, null, 3));

  assertEquals(
      'Should clip html char', 'true &amp;&...lse',
      goog.string.truncateMiddle(html, 14, null, 3));
  assertEquals(
      'Should not clip html char', 'true &amp;&amp; fal...lse',
      goog.string.truncateMiddle(html, 14, true, 3));
}


// === goog.string.quote ===
function testQuote() {
  var str = allChars();
  assertEquals(str, eval(goog.string.quote(str)));

  // empty string
  assertEquals('', eval(goog.string.quote('')));

  // unicode
  str = allChars(0, 10000);
  assertEquals(str, eval(goog.string.quote(str)));
}

function testQuoteSpecialChars() {
  assertEquals('"\\""', goog.string.quote('"'));
  assertEquals('"\'"', goog.string.quote("'"));
  assertEquals('"\\\\"', goog.string.quote('\\'));
  assertEquals('"\x3c"', goog.string.quote('<'));

  var zeroQuoted = goog.string.quote('\0');
  assertTrue(
      'goog.string.quote mangles the 0 char: ',
      '"\\0"' == zeroQuoted || '"\\x00"' == zeroQuoted);
}

function testCrossBrowserQuote() {
  // The vertical space char has weird semantics on jscript, so we don't test
  // that one.
  var vertChar = '\x0B'.charCodeAt(0);

  // The zero char has two alternate encodings (\0 and \x00) both are ok,
  // and tested above.
  var zeroChar = 0;

  var str = allChars(zeroChar + 1, vertChar) + allChars(vertChar + 1, 10000);
  var nativeQuote = goog.string.quote(str);

  stubs.set(String.prototype, 'quote', null);
  assertNull(''.quote);

  assertEquals(nativeQuote, goog.string.quote(str));
}

function allChars(opt_start, opt_end) {
  opt_start = opt_start || 0;
  opt_end = opt_end || 256;
  var rv = '';
  for (var i = opt_start; i < opt_end; i++) {
    rv += String.fromCharCode(i);
  }
  return rv;
}

function testEscapeString() {
  var expected = allChars(0, 10000);
  try {
    var actual = eval('"' + goog.string.escapeString(expected) + '"');
  } catch (e) {
    fail('Quote failed: err ' + e.message);
  }
  assertEquals(expected, actual);
}

function testCountOf() {
  assertEquals(goog.string.countOf('REDSOXROX', undefined), 0);
  assertEquals(goog.string.countOf('REDSOXROX', null), 0);
  assertEquals(goog.string.countOf('REDSOXROX', ''), 0);
  assertEquals(goog.string.countOf('', undefined), 0);
  assertEquals(goog.string.countOf('', null), 0);
  assertEquals(goog.string.countOf('', ''), 0);
  assertEquals(goog.string.countOf('', 'REDSOXROX'), 0);
  assertEquals(goog.string.countOf(undefined, 'R'), 0);
  assertEquals(goog.string.countOf(null, 'R'), 0);
  assertEquals(goog.string.countOf(undefined, undefined), 0);
  assertEquals(goog.string.countOf(null, null), 0);

  assertEquals(goog.string.countOf('REDSOXROX', 'R'), 2);
  assertEquals(goog.string.countOf('REDSOXROX', 'E'), 1);
  assertEquals(goog.string.countOf('REDSOXROX', 'X'), 2);
  assertEquals(goog.string.countOf('REDSOXROX', 'RED'), 1);
  assertEquals(goog.string.countOf('REDSOXROX', 'ROX'), 1);
  assertEquals(goog.string.countOf('REDSOXROX', 'OX'), 2);
  assertEquals(goog.string.countOf('REDSOXROX', 'Z'), 0);
  assertEquals(goog.string.countOf('REDSOXROX', 'REDSOXROX'), 1);
  assertEquals(goog.string.countOf('REDSOXROX', 'YANKEES'), 0);
  assertEquals(goog.string.countOf('REDSOXROX', 'EVIL_EMPIRE'), 0);

  assertEquals(goog.string.countOf('RRRRRRRRR', 'R'), 9);
  assertEquals(goog.string.countOf('RRRRRRRRR', 'RR'), 4);
  assertEquals(goog.string.countOf('RRRRRRRRR', 'RRR'), 3);
  assertEquals(goog.string.countOf('RRRRRRRRR', 'RRRR'), 2);
  assertEquals(goog.string.countOf('RRRRRRRRR', 'RRRRR'), 1);
  assertEquals(goog.string.countOf('RRRRRRRRR', 'RRRRRR'), 1);
}

function testRemoveAt() {
  var str = 'barfoobarbazbar';
  str = goog.string.removeAt(str, 0, 3);
  assertEquals('Remove first bar', 'foobarbazbar', str);
  str = goog.string.removeAt(str, 3, 3);
  assertEquals('Remove middle bar', 'foobazbar', str);
  str = goog.string.removeAt(str, 6, 3);
  assertEquals('Remove last bar', 'foobaz', str);
  assertEquals(
      'Invalid negative index', 'foobaz', goog.string.removeAt(str, -1, 0));
  assertEquals(
      'Invalid overflow index', 'foobaz', goog.string.removeAt(str, 9, 0));
  assertEquals(
      'Invalid negative stringLength', 'foobaz',
      goog.string.removeAt(str, 0, -1));
  assertEquals(
      'Invalid overflow stringLength', '', goog.string.removeAt(str, 0, 9));
  assertEquals(
      'Invalid overflow index and stringLength', 'foobaz',
      goog.string.removeAt(str, 9, 9));
  assertEquals(
      'Invalid zero stringLength', 'foobaz', goog.string.removeAt(str, 0, 0));
}

function testRemove() {
  var str = 'barfoobarbazbar';
  str = goog.string.remove(str, 'bar');
  assertEquals('Remove first bar', 'foobarbazbar', str);
  str = goog.string.remove(str, 'bar');
  assertEquals('Remove middle bar', 'foobazbar', str);
  str = goog.string.remove(str, 'bar');
  assertEquals('Remove last bar', 'foobaz', str);
  str = goog.string.remove(str, 'bar');
  assertEquals('Original string', 'foobaz', str);
}

function testRemoveAll() {
  var str = 'foobarbazbarfoobazfoo';
  str = goog.string.removeAll(str, 'foo');
  assertEquals('Remove all occurrences of foo', 'barbazbarbaz', str);
  str = goog.string.removeAll(str, 'foo');
  assertEquals('Original string', 'barbazbarbaz', str);
}

function testRegExpEscape() {
  var spec = '()[]{}+-?*.$^|,:#<!\\';
  var escapedSpec = '\\' + spec.split('').join('\\');
  assertEquals('special chars', escapedSpec, goog.string.regExpEscape(spec));
  assertEquals('backslash b', '\\x08', goog.string.regExpEscape('\b'));

  var s = allChars();
  var re = new RegExp('^' + goog.string.regExpEscape(s) + '$');
  assertTrue('All ASCII', re.test(s));
  s = '';
  var re = new RegExp('^' + goog.string.regExpEscape(s) + '$');
  assertTrue('empty string', re.test(s));
  s = allChars(0, 10000);
  var re = new RegExp('^' + goog.string.regExpEscape(s) + '$');
  assertTrue('Unicode', re.test(s));
}

function testPadNumber() {
  assertEquals('01.250', goog.string.padNumber(1.25, 2, 3));
  assertEquals('01.25', goog.string.padNumber(1.25, 2));
  assertEquals('01.3', goog.string.padNumber(1.25, 2, 1));
  assertEquals('1.25', goog.string.padNumber(1.25, 0));
  assertEquals('10', goog.string.padNumber(9.9, 2, 0));
  assertEquals('7', goog.string.padNumber(7, 0));
  assertEquals('7', goog.string.padNumber(7, 1));
  assertEquals('07', goog.string.padNumber(7, 2));
}

function testAsString() {
  assertEquals('', goog.string.makeSafe(null));
  assertEquals('', goog.string.makeSafe(undefined));
  assertEquals('', goog.string.makeSafe(''));

  assertEquals('abc', goog.string.makeSafe('abc'));
  assertEquals('123', goog.string.makeSafe(123));
  assertEquals('0', goog.string.makeSafe(0));

  assertEquals('true', goog.string.makeSafe(true));
  assertEquals('false', goog.string.makeSafe(false));

  var funky = function() {};
  funky.toString = function() { return 'funky-thing' };
  assertEquals('funky-thing', goog.string.makeSafe(funky));
}

function testStringRepeat() {
  assertEquals('', goog.string.repeat('*', 0));
  assertEquals('*', goog.string.repeat('*', 1));
  assertEquals('     ', goog.string.repeat(' ', 5));
  assertEquals('__________', goog.string.repeat('_', 10));
  assertEquals('aaa', goog.string.repeat('a', 3));
  assertEquals('foofoofoofoofoofoo', goog.string.repeat('foo', 6));
}

function testBuildString() {
  assertEquals('', goog.string.buildString());
  assertEquals('a', goog.string.buildString('a'));
  assertEquals('ab', goog.string.buildString('ab'));
  assertEquals('ab', goog.string.buildString('a', 'b'));
  assertEquals('abcd', goog.string.buildString('a', 'b', 'c', 'd'));
  assertEquals('0', goog.string.buildString(0));
  assertEquals('0123', goog.string.buildString(0, 1, 2, 3));
  assertEquals('ab01', goog.string.buildString('a', 'b', 0, 1));
  assertEquals('', goog.string.buildString(null, undefined));
}

function testCompareVersions() {
  var f = goog.string.compareVersions;
  assertTrue('numeric equality broken', f(1, 1) == 0);
  assertTrue('numeric less than broken', f(1.0, 1.1) < 0);
  assertTrue('numeric greater than broken', f(2.0, 1.1) > 0);

  assertTrue('exact equality broken', f('1.0', '1.0') == 0);
  assertTrue('mutlidot equality broken', f('1.0.0.0', '1.0') == 0);
  assertTrue('mutlidigit equality broken', f('1.000', '1.0') == 0);
  assertTrue('less than broken', f('1.0.2.1', '1.1') < 0);
  assertTrue('greater than broken', f('1.1', '1.0.2.1') > 0);

  assertTrue('substring less than broken', f('1', '1.1') < 0);
  assertTrue('substring greater than broken', f('2.2', '2') > 0);

  assertTrue('b greater than broken', f('1.1', '1.1b') > 0);
  assertTrue('b less than broken', f('1.1b', '1.1') < 0);
  assertTrue('b equality broken', f('1.1b', '1.1b') == 0);

  assertTrue('b > a broken', f('1.1b', '1.1a') > 0);
  assertTrue('a < b broken', f('1.1a', '1.1b') < 0);

  assertTrue('9.5 < 9.10 broken', f('9.5', '9.10') < 0);
  assertTrue('9.5 < 9.11 broken', f('9.5', '9.11') < 0);
  assertTrue('9.11 > 9.10 broken', f('9.11', '9.10') > 0);
  assertTrue('9.1 < 9.10 broken', f('9.1', '9.10') < 0);
  assertTrue('9.1.1 < 9.10 broken', f('9.1.1', '9.10') < 0);
  assertTrue('9.1.1 < 9.11 broken', f('9.1.1', '9.11') < 0);

  assertTrue('10a > 9b broken', f('1.10a', '1.9b') > 0);
  assertTrue('b < b2 broken', f('1.1b', '1.1b2') < 0);
  assertTrue('b10 > b9 broken', f('1.1b10', '1.1b9') > 0);

  assertTrue('7 > 6 broken with leading whitespace', f(' 7', '6') > 0);
  assertTrue('7 > 6 broken with trailing whitespace', f('7 ', '6') > 0);
}

function testIsUnicodeChar() {
  assertFalse('empty string broken', goog.string.isUnicodeChar(''));
  assertFalse(
      'non-single char string broken', goog.string.isUnicodeChar('abc'));
  assertTrue('space broken', goog.string.isUnicodeChar(' '));
  assertTrue('single char broken', goog.string.isUnicodeChar('a'));
  assertTrue('upper case broken', goog.string.isUnicodeChar('A'));
  assertTrue('unicode char broken', goog.string.isUnicodeChar('\u0C07'));
}

function assertHashcodeEquals(expectedHashCode, str) {
  assertEquals(
      'wrong hashCode for ' + str.substring(0, 32), expectedHashCode,
      goog.string.hashCode(str));
}


/**
 * Verify we get random-ish looking values for hash of Strings.
 */
function testHashCode() {
  try {
    goog.string.hashCode(null);
    fail('should throw exception for null');
  } catch (ex) {
    // success
  }
  assertHashcodeEquals(0, '');
  assertHashcodeEquals(101574, 'foo');
  assertHashcodeEquals(1301670364, '\uAAAAfoo');
  assertHashcodeEquals(92567585, goog.string.repeat('a', 5));
  assertHashcodeEquals(2869595232, goog.string.repeat('a', 6));
  assertHashcodeEquals(3058106369, goog.string.repeat('a', 7));
  assertHashcodeEquals(312017024, goog.string.repeat('a', 8));
  assertHashcodeEquals(2929737728, goog.string.repeat('a', 1024));
}

function testUniqueString() {
  var TEST_COUNT = 20;

  var obj = {};
  for (var i = 0; i < TEST_COUNT; i++) {
    obj[goog.string.createUniqueString()] = true;
  }

  assertEquals(
      'All strings should be unique.', TEST_COUNT, goog.object.getCount(obj));
}

function testToNumber() {
  // First, test the cases goog.string.toNumber() was primarily written for,
  // because JS built-ins are dumb.
  assertNaN(goog.string.toNumber('123a'));
  assertNaN(goog.string.toNumber('123.456.78'));
  assertNaN(goog.string.toNumber(''));
  assertNaN(goog.string.toNumber(' '));

  // Now, sanity-check.
  assertEquals(123, goog.string.toNumber(' 123 '));
  assertEquals(321.123, goog.string.toNumber('321.123'));
  assertEquals(1.00001, goog.string.toNumber('1.00001'));
  assertEquals(1, goog.string.toNumber('1.00000'));
  assertEquals(0.2, goog.string.toNumber('0.20'));
  assertEquals(0, goog.string.toNumber('0'));
  assertEquals(0, goog.string.toNumber('0.0'));
  assertEquals(-1, goog.string.toNumber('-1'));
  assertEquals(-0.3, goog.string.toNumber('-.3'));
  assertEquals(-12.345, goog.string.toNumber('-12.345'));
  assertEquals(100, goog.string.toNumber('1e2'));
  assertEquals(0.123, goog.string.toNumber('12.3e-2'));
  assertNaN(goog.string.toNumber('abc'));
}

function testGetRandomString() {
  stubs.set(goog, 'now', goog.functions.constant(1295726605874));
  stubs.set(Math, 'random', goog.functions.constant(0.6679361383522245));
  assertTrue(
      'String must be alphanumeric',
      goog.string.isAlphaNumeric(goog.string.getRandomString()));
}

function testToCamelCase() {
  assertEquals('OneTwoThree', goog.string.toCamelCase('-one-two-three'));
  assertEquals('oneTwoThree', goog.string.toCamelCase('one-two-three'));
  assertEquals('oneTwo', goog.string.toCamelCase('one-two'));
  assertEquals('one', goog.string.toCamelCase('one'));
  assertEquals('oneTwo', goog.string.toCamelCase('oneTwo'));
  assertEquals(
      'String value matching a native function name.', 'toString',
      goog.string.toCamelCase('toString'));
}

function testToSelectorCase() {
  assertEquals('-one-two-three', goog.string.toSelectorCase('OneTwoThree'));
  assertEquals('one-two-three', goog.string.toSelectorCase('oneTwoThree'));
  assertEquals('one-two', goog.string.toSelectorCase('oneTwo'));
  assertEquals('one', goog.string.toSelectorCase('one'));
  assertEquals('one-two', goog.string.toSelectorCase('one-two'));
  assertEquals(
      'String value matching a native function name.', 'to-string',
      goog.string.toSelectorCase('toString'));
}

function testToTitleCase() {
  assertEquals('One', goog.string.toTitleCase('one'));
  assertEquals('CamelCase', goog.string.toTitleCase('camelCase'));
  assertEquals('Onelongword', goog.string.toTitleCase('onelongword'));
  assertEquals('One Two Three', goog.string.toTitleCase('one two three'));
  assertEquals(
      'One        Two    Three',
      goog.string.toTitleCase('one        two    three'));
  assertEquals('   Longword  ', goog.string.toTitleCase('   longword  '));
  assertEquals('One-two-three', goog.string.toTitleCase('one-two-three'));
  assertEquals('One_two_three', goog.string.toTitleCase('one_two_three'));
  assertEquals(
      'String value matching a native function name.', 'ToString',
      goog.string.toTitleCase('toString'));

  // Verify results with no delimiter.
  assertEquals('One two three', goog.string.toTitleCase('one two three', ''));
  assertEquals('One-two-three', goog.string.toTitleCase('one-two-three', ''));
  assertEquals(' onetwothree', goog.string.toTitleCase(' onetwothree', ''));

  // Verify results with one delimiter.
  assertEquals('One two', goog.string.toTitleCase('one two', '.'));
  assertEquals(' one two', goog.string.toTitleCase(' one two', '.'));
  assertEquals(' one.Two', goog.string.toTitleCase(' one.two', '.'));
  assertEquals('One.Two', goog.string.toTitleCase('one.two', '.'));
  assertEquals('One...Two...', goog.string.toTitleCase('one...two...', '.'));

  // Verify results with multiple delimiters.
  var delimiters = '_-.';
  assertEquals(
      'One two three', goog.string.toTitleCase('one two three', delimiters));
  assertEquals(
      '  one two three',
      goog.string.toTitleCase('  one two three', delimiters));
  assertEquals(
      'One-Two-Three', goog.string.toTitleCase('one-two-three', delimiters));
  assertEquals(
      'One_Two_Three', goog.string.toTitleCase('one_two_three', delimiters));
  assertEquals(
      'One...Two...Three',
      goog.string.toTitleCase('one...two...three', delimiters));
  assertEquals(
      'One.  two.  three',
      goog.string.toTitleCase('one.  two.  three', delimiters));
}

function testCapitalize() {
  assertEquals('Reptar', goog.string.capitalize('reptar'));
  assertEquals('Reptar reptar', goog.string.capitalize('reptar reptar'));
  assertEquals('Reptar', goog.string.capitalize('REPTAR'));
  assertEquals('Reptar', goog.string.capitalize('Reptar'));
  assertEquals('1234', goog.string.capitalize('1234'));
  assertEquals('$#@!', goog.string.capitalize('$#@!'));
  assertEquals('', goog.string.capitalize(''));
  assertEquals('R', goog.string.capitalize('r'));
  assertEquals('R', goog.string.capitalize('R'));
}

function testParseInt() {
  // Many example values borrowed from
  // http://trac.webkit.org/browser/trunk/LayoutTests/fast/js/kde/
  // GlobalObject-expected.txt

  // Check non-numbers and strings
  assertTrue(isNaN(goog.string.parseInt(undefined)));
  assertTrue(isNaN(goog.string.parseInt(null)));
  assertTrue(isNaN(goog.string.parseInt({})));

  assertTrue(isNaN(goog.string.parseInt('')));
  assertTrue(isNaN(goog.string.parseInt(' ')));
  assertTrue(isNaN(goog.string.parseInt('a')));
  assertTrue(isNaN(goog.string.parseInt('FFAA')));
  assertEquals(1, goog.string.parseInt(1));
  assertEquals(1234567890123456, goog.string.parseInt(1234567890123456));
  assertEquals(2, goog.string.parseInt(' 2.3'));
  assertEquals(16, goog.string.parseInt('0x10'));
  assertEquals(11, goog.string.parseInt('11'));
  assertEquals(15, goog.string.parseInt('0xF'));
  assertEquals(15, goog.string.parseInt('0XF'));
  assertEquals(3735928559, goog.string.parseInt('0XDEADBEEF'));
  assertEquals(3, goog.string.parseInt('3x'));
  assertEquals(3, goog.string.parseInt('3 x'));
  assertFalse(isFinite(goog.string.parseInt('Infinity')));
  assertEquals(15, goog.string.parseInt('15'));
  assertEquals(15, goog.string.parseInt('015'));
  assertEquals(15, goog.string.parseInt('0xf'));
  assertEquals(15, goog.string.parseInt('15'));
  assertEquals(15, goog.string.parseInt('0xF'));
  assertEquals(15, goog.string.parseInt('15.99'));
  assertTrue(isNaN(goog.string.parseInt('FXX123')));
  assertEquals(15, goog.string.parseInt('15*3'));
  assertEquals(7, goog.string.parseInt('0x7'));
  assertEquals(1, goog.string.parseInt('1x7'));

  // Strings have no special meaning
  assertTrue(isNaN(goog.string.parseInt('Infinity')));
  assertTrue(isNaN(goog.string.parseInt('NaN')));

  // Test numbers and values
  assertEquals(3, goog.string.parseInt(3.3));
  assertEquals(-3, goog.string.parseInt(-3.3));
  assertEquals(0, goog.string.parseInt(-0));
  assertTrue(isNaN(goog.string.parseInt(Infinity)));
  assertTrue(isNaN(goog.string.parseInt(NaN)));
  assertTrue(isNaN(goog.string.parseInt(Number.POSITIVE_INFINITY)));
  assertTrue(isNaN(goog.string.parseInt(Number.NEGATIVE_INFINITY)));

  // In Chrome (at least), parseInt(Number.MIN_VALUE) is 5 (5e-324) and
  // parseInt(Number.MAX_VALUE) is 1 (1.79...e+308) as they are converted
  // to strings.  We do not attempt to correct this behavior.

  // Additional values for negatives.
  assertEquals(-3, goog.string.parseInt('-3'));
  assertEquals(-32, goog.string.parseInt('-32    '));
  assertEquals(-32, goog.string.parseInt(' -32 '));
  assertEquals(-3, goog.string.parseInt('-0x3'));
  assertEquals(-50, goog.string.parseInt('-0x32    '));
  assertEquals(-243, goog.string.parseInt('   -0xF3    '));
  assertTrue(isNaN(goog.string.parseInt(' - 0x32 ')));
}

function testIsLowerCamelCase() {
  assertTrue(goog.string.isLowerCamelCase('foo'));
  assertTrue(goog.string.isLowerCamelCase('fooBar'));
  assertTrue(goog.string.isLowerCamelCase('fooBarBaz'));
  assertTrue(goog.string.isLowerCamelCase('innerHTML'));

  assertFalse(goog.string.isLowerCamelCase(''));
  assertFalse(goog.string.isLowerCamelCase('a3a'));
  assertFalse(goog.string.isLowerCamelCase('goog.dom'));
  assertFalse(goog.string.isLowerCamelCase('Foo'));
  assertFalse(goog.string.isLowerCamelCase('FooBar'));
  assertFalse(goog.string.isLowerCamelCase('ABCBBD'));
}

function testIsUpperCamelCase() {
  assertFalse(goog.string.isUpperCamelCase(''));
  assertFalse(goog.string.isUpperCamelCase('foo'));
  assertFalse(goog.string.isUpperCamelCase('fooBar'));
  assertFalse(goog.string.isUpperCamelCase('fooBarBaz'));
  assertFalse(goog.string.isUpperCamelCase('innerHTML'));
  assertFalse(goog.string.isUpperCamelCase('a3a'));
  assertFalse(goog.string.isUpperCamelCase('goog.dom'));
  assertFalse(goog.string.isUpperCamelCase('Boyz2Men'));

  assertTrue(goog.string.isUpperCamelCase('ABCBBD'));
  assertTrue(goog.string.isUpperCamelCase('Foo'));
  assertTrue(goog.string.isUpperCamelCase('FooBar'));
  assertTrue(goog.string.isUpperCamelCase('FooBarBaz'));
}

function testSplitLimit() {
  assertArrayEquals(['a*a*a*a'], goog.string.splitLimit('a*a*a*a', '*', -1));
  assertArrayEquals(['a*a*a*a'], goog.string.splitLimit('a*a*a*a', '*', 0));
  assertArrayEquals(['a', 'a*a*a'], goog.string.splitLimit('a*a*a*a', '*', 1));
  assertArrayEquals(
      ['a', 'a', 'a*a'], goog.string.splitLimit('a*a*a*a', '*', 2));
  assertArrayEquals(
      ['a', 'a', 'a', 'a'], goog.string.splitLimit('a*a*a*a', '*', 3));
  assertArrayEquals(
      ['a', 'a', 'a', 'a'], goog.string.splitLimit('a*a*a*a', '*', 4));

  assertArrayEquals(
      ['bbbbbbbbbbbb'], goog.string.splitLimit('bbbbbbbbbbbb', 'a', 10));
  assertArrayEquals(
      ['babab', 'bab', 'abb'],
      goog.string.splitLimit('bababaababaaabb', 'aa', 10));
  assertArrayEquals(
      ['babab', 'babaaabb'],
      goog.string.splitLimit('bababaababaaabb', 'aa', 1));
  assertArrayEquals(
      ['b', 'a', 'b', 'a', 'b', 'a', 'a', 'b', 'a', 'b', 'aaabb'],
      goog.string.splitLimit('bababaababaaabb', '', 10));
}

function testContains() {
  assertTrue(goog.string.contains('moot', 'moo'));
  assertFalse(goog.string.contains('moo', 'moot'));
  assertFalse(goog.string.contains('Moot', 'moo'));
  assertTrue(goog.string.contains('moo', 'moo'));
}

function testCaseInsensitiveContains() {
  assertTrue(goog.string.caseInsensitiveContains('moot', 'moo'));
  assertFalse(goog.string.caseInsensitiveContains('moo', 'moot'));
  assertTrue(goog.string.caseInsensitiveContains('Moot', 'moo'));
  assertTrue(goog.string.caseInsensitiveContains('moo', 'moo'));
}

function testEditDistance() {
  assertEquals(
      'Empty string should match to length of other string', 4,
      goog.string.editDistance('goat', ''));
  assertEquals(
      'Empty string should match to length of other string', 4,
      goog.string.editDistance('', 'moat'));

  assertEquals(
      'Equal strings should have zero edit distance', 0,
      goog.string.editDistance('abcd', 'abcd'));
  assertEquals(
      'Equal strings should have zero edit distance', 0,
      goog.string.editDistance('', ''));

  assertEquals(
      'Edit distance for adding characters incorrect', 4,
      goog.string.editDistance('bdf', 'abcdefg'));
  assertEquals(
      'Edit distance for removing characters incorrect', 4,
      goog.string.editDistance('abcdefg', 'bdf'));

  assertEquals(
      'Edit distance for substituting characters incorrect', 4,
      goog.string.editDistance('adef', 'ghij'));
  assertEquals(
      'Edit distance for substituting characters incorrect', 1,
      goog.string.editDistance('goat', 'boat'));

  assertEquals(
      'Substitution should be preferred over insert/delete', 4,
      goog.string.editDistance('abcd', 'defg'));
}
