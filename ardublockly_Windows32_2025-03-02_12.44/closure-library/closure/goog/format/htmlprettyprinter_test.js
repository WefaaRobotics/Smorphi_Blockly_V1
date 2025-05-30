// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.format.HtmlPrettyPrinterTest');
goog.setTestOnly('goog.format.HtmlPrettyPrinterTest');

goog.require('goog.format.HtmlPrettyPrinter');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

var COMPLEX_HTML = '<!DOCTYPE root-element [SYSTEM OR PUBLIC FPI] "uri" [' +
    '<!-- internal declarations -->]>' +
    '<html><head><title>My HTML</title><!-- my comment --></head>' +
    '<body><h1>My Header</h1>My text.<br><b>My bold text.</b><hr>' +
    '<pre>My\npreformatted <br> HTML.</pre>5 < 10</body>' +
    '</html>';
var mockClock;
var mockClockTicks;

function setUp() {
  mockClockTicks = 0;
  mockClock = new goog.testing.MockClock();
  mockClock.getCurrentTime = function() { return mockClockTicks++; };
  mockClock.install();
}

function tearDown() {
  if (mockClock) {
    mockClock.uninstall();
  }
}

function testSimpleHtml() {
  var actual = goog.format.HtmlPrettyPrinter.format('<br><b>bold</b>');
  assertEquals('<br>\n<b>bold</b>\n', actual);
  assertEquals(actual, goog.format.HtmlPrettyPrinter.format(actual));
}

function testSimpleHtmlMixedCase() {
  var actual = goog.format.HtmlPrettyPrinter.format('<BR><b>bold</b>');
  assertEquals('<BR>\n<b>bold</b>\n', actual);
  assertEquals(actual, goog.format.HtmlPrettyPrinter.format(actual));
}

function testComplexHtml() {
  var actual = goog.format.HtmlPrettyPrinter.format(COMPLEX_HTML);
  var expected = '<!DOCTYPE root-element [SYSTEM OR PUBLIC FPI] "uri" [' +
      '<!-- internal declarations -->]>\n' +
      '<html>\n' +
      '<head>\n' +
      '<title>My HTML</title>\n' +
      '<!-- my comment -->' +
      '</head>\n' +
      '<body>\n' +
      '<h1>My Header</h1>\n' +
      'My text.<br>\n' +
      '<b>My bold text.</b>\n' +
      '<hr>\n' +
      '<pre>My\npreformatted <br> HTML.</pre>\n' +
      '5 < 10' +
      '</body>\n' +
      '</html>\n';
  assertEquals(expected, actual);
  assertEquals(actual, goog.format.HtmlPrettyPrinter.format(actual));
}

function testTimeout() {
  var pp = new goog.format.HtmlPrettyPrinter(3);
  var actual = pp.format(COMPLEX_HTML);
  var expected = '<!DOCTYPE root-element [SYSTEM OR PUBLIC FPI] "uri" [' +
      '<!-- internal declarations -->]>\n' +
      '<html>\n' +
      '<head><title>My HTML</title><!-- my comment --></head>' +
      '<body><h1>My Header</h1>My text.<br><b>My bold text.</b><hr>' +
      '<pre>My\npreformatted <br> HTML.</pre>5 < 10</body>' +
      '</html>\n';
  assertEquals(expected, actual);
}

function testKeepLeadingIndent() {
  var original = ' <b>Bold</b> <i>Ital</i> ';
  var expected = ' <b>Bold</b> <i>Ital</i>\n';
  assertEquals(expected, goog.format.HtmlPrettyPrinter.format(original));
}

function testTrimLeadingLineBreaks() {
  var original = '\n \t\r\n  \n <b>Bold</b> <i>Ital</i> ';
  var expected = ' <b>Bold</b> <i>Ital</i>\n';
  assertEquals(expected, goog.format.HtmlPrettyPrinter.format(original));
}

function testExtraLines() {
  var original = '<br>\ntombrat';
  assertEquals(original + '\n', goog.format.HtmlPrettyPrinter.format(original));
}

function testCrlf() {
  var original = '<br>\r\none\r\ntwo<br>';
  assertEquals(original + '\n', goog.format.HtmlPrettyPrinter.format(original));
}

function testEndInLineBreak() {
  assertEquals('foo\n', goog.format.HtmlPrettyPrinter.format('foo'));
  assertEquals('foo\n', goog.format.HtmlPrettyPrinter.format('foo\n'));
  assertEquals('foo\n', goog.format.HtmlPrettyPrinter.format('foo\n\n'));
  assertEquals('foo<br>\n', goog.format.HtmlPrettyPrinter.format('foo<br>'));
  assertEquals('foo<br>\n', goog.format.HtmlPrettyPrinter.format('foo<br>\n'));
}

function testTable() {
  var original = '<table>' +
      '<tr><td>one.one</td><td>one.two</td></tr>' +
      '<tr><td>two.one</td><td>two.two</td></tr>' +
      '</table>';
  var expected = '<table>\n' +
      '<tr>\n<td>one.one</td>\n<td>one.two</td>\n</tr>\n' +
      '<tr>\n<td>two.one</td>\n<td>two.two</td>\n</tr>\n' +
      '</table>\n';
  assertEquals(expected, goog.format.HtmlPrettyPrinter.format(original));
}


/**
 * We have a sanity check in HtmlPrettyPrinter to make sure the regex index
 * advances after every match. We should never hit this, but we include it on
 * the chance there is some corner case where the pattern would match but not
 * process a new token. It's not generally a good idea to break the
 * implementation to test behavior, but this is the easiest way to mimic a
 * bad internal state.
 */
function testRegexMakesProgress() {
  var original = goog.format.HtmlPrettyPrinter.TOKEN_REGEX_;

  try {
    // This regex matches \B, an index between 2 word characters, so the regex
    // index does not advance when matching this.
    goog.format.HtmlPrettyPrinter.TOKEN_REGEX_ =
        /(?:\B|<!--.*?-->|<!.*?>|<(\/?)(\w+)[^>]*>|[^<]+|<)/g;

    // It would work on this string.
    assertEquals('f o o\n', goog.format.HtmlPrettyPrinter.format('f o o'));

    // But not this one.
    var ex = assertThrows(
        'should have failed for invalid regex - endless loop',
        goog.partial(goog.format.HtmlPrettyPrinter.format, COMPLEX_HTML));
    assertEquals(
        'Regex failed to make progress through source html.', ex.message);
  } finally {
    goog.format.HtmlPrettyPrinter.TOKEN_REGEX_ = original;
  }
}


/**
 * FF3.0 doesn't like \n between <code></li></code> and <code></ul></code>.
 * See b/1520665.
 */
function testLists() {
  var original = '<ul><li>one</li><ul><li>two</li></UL><li>three</li></ul>';
  var expected =
      '<ul><li>one</li>\n<ul><li>two</li></UL>\n<li>three</li></ul>\n';
  assertEquals(expected, goog.format.HtmlPrettyPrinter.format(original));
}


/**
 * We have a sanity check in HtmlPrettyPrinter to make sure the regex fully
 * tokenizes the string. We should never hit this, but we include it on the
 * chance there is some corner case where the pattern would miss a section of
 * original string. It's not generally a good idea to break the
 * implementation to test behavior, but this is the easiest way to mimic a
 * bad internal state.
 */
function testAvoidDataLoss() {
  var original = goog.format.HtmlPrettyPrinter.TOKEN_REGEX_;

  try {
    // This regex does not match stranded '<' characters, so does not fully
    // tokenize the string.
    goog.format.HtmlPrettyPrinter.TOKEN_REGEX_ =
        /(?:<!--.*?-->|<!.*?>|<(\/?)(\w+)[^>]*>|[^<]+)/g;

    // It would work on this string.
    assertEquals('foo\n', goog.format.HtmlPrettyPrinter.format('foo'));

    // But not this one.
    var ex = assertThrows(
        'should have failed for invalid regex - data loss',
        goog.partial(goog.format.HtmlPrettyPrinter.format, COMPLEX_HTML));
    assertEquals('Lost data pretty printing html.', ex.message);
  } finally {
    goog.format.HtmlPrettyPrinter.TOKEN_REGEX_ = original;
  }
}
