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

goog.provide('goog.editor.plugins.RemoveFormattingTest');
goog.setTestOnly('goog.editor.plugins.RemoveFormattingTest');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.plugins.RemoveFormatting');
goog.require('goog.string');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.dom');
goog.require('goog.testing.editor.FieldMock');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var SAVED_HTML;
var FIELDMOCK;
var FORMATTER;
var testHelper;
var WEBKIT_BEFORE_CHROME_8;
var WEBKIT_AFTER_CHROME_16;
var WEBKIT_AFTER_CHROME_21;
var insertImageBoldGarbage = '';
var insertImageFontGarbage = '';
var controlHtml;
var controlCleanHtml;
var expectedFailures;

function setUpPage() {
  WEBKIT_BEFORE_CHROME_8 =
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('534.10');

  WEBKIT_AFTER_CHROME_16 =
      goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('535.7');

  WEBKIT_AFTER_CHROME_21 =
      goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('537.1');
  // On Chrome 16, execCommand('insertImage') inserts a garbage BR
  // after the image that we insert. We use this command to paste HTML
  // in-place, because it has better paragraph-preserving semantics.
  //
  // TODO(nicksantos): Figure out if there are better chrome APIs that we
  // should be using, or if insertImage should just be fixed.
  if (WEBKIT_AFTER_CHROME_21) {
    insertImageBoldGarbage = '<br>';
    insertImageFontGarbage = '<br>';
  } else if (WEBKIT_AFTER_CHROME_16) {
    insertImageBoldGarbage = '<b><br/></b>';
    insertImageFontGarbage = '<font size="1"><br/></font>';
  } else if (goog.userAgent.EDGE) {
    insertImageFontGarbage =
        '<fontsize="-1"><font class="p" size="-1"></font></fontsize="-1">';
  }
  // Extra html to add to test html to make sure removeformatting is actually
  // getting called when you're testing if it leaves certain styles alone
  // (instead of not even running at all due to some other bug). However, adding
  // this extra text into the node to be selected screws up IE.
  // (e.g. <a><img></a><b>t</b> --> <a></a><a><img></a>t )
  // TODO(user): Remove this special casing once http://b/3131117 is
  // fixed.
  controlHtml = goog.userAgent.IE ? '' : '<u>control</u>';
  controlCleanHtml = goog.userAgent.IE ? '' : 'control';
  if (goog.userAgent.EDGE) {
    controlCleanHtml = 'control<u></u>';
  }
  expectedFailures = new goog.testing.ExpectedFailures();
}

function setUp() {
  testHelper =
      new goog.testing.editor.TestHelper(document.getElementById('html'));
  testHelper.setUpEditableElement();

  FIELDMOCK = new goog.testing.editor.FieldMock();
  FIELDMOCK.getElement();
  FIELDMOCK.$anyTimes();
  FIELDMOCK.$returns(document.getElementById('html'));

  FORMATTER = new goog.editor.plugins.RemoveFormatting();
  FORMATTER.fieldObject = FIELDMOCK;

  FIELDMOCK.$replay();
}

function tearDown() {
  expectedFailures.handleTearDown();
  testHelper.tearDownEditableElement();
}

function setUpTableTests() {
  var div = document.getElementById('html');
  div.innerHTML = '<table><tr> <th> head1</th><th id= "outerTh">' +
      '<span id="emptyTh">head2</span></th> </tr><tr> <td> one </td> <td>' +
      'two </td> </tr><tr><td> three</td><td id="outerTd"> ' +
      '<span id="emptyTd"><strong>four</strong></span></td></tr>' +
      '<tr id="outerTr"><td><span id="emptyTr"> five </span></td></tr>' +
      '<tr id="outerTr2"><td id="cell1"><b>seven</b></td><td id="cell2">' +
      '<u>eight</u><span id="cellspan2"> foo</span></td></tr></table>';
}

function testTableTagsAreNotRemoved() {
  setUpTableTests();
  var span;

  // TD
  span = document.getElementById('emptyTd');
  goog.dom.Range.createFromNodeContents(span).select();
  FORMATTER.removeFormatting_();

  var elem = document.getElementById('outerTd');
  assertTrue('TD should not be removed', !!elem);
  if (!goog.userAgent.WEBKIT && !goog.userAgent.EDGE) {
    // webkit seems to have an Apple-style-span
    assertEquals(
        'TD should be clean', 'four', goog.string.trim(elem.innerHTML));
  }

  // TR
  span = document.getElementById('outerTr');
  goog.dom.Range.createFromNodeContents(span).select();
  FORMATTER.removeFormatting_();

  elem = document.getElementById('outerTr');
  assertTrue('TR should not be removed', !!elem);

  // TH
  span = document.getElementById('emptyTh');
  goog.dom.Range.createFromNodeContents(span).select();
  FORMATTER.removeFormatting_();

  elem = document.getElementById('outerTh');
  assertTrue('TH should not be removed', !!elem);
  if (!goog.userAgent.WEBKIT && !goog.userAgent.EDGE) {
    // webkit seems to have an Apple-style-span
    assertEquals('TH should be clean', 'head2', elem.innerHTML);
  }
}


/**
 * We select two cells from the table and then make sure that there is no
 * data loss and basic formatting is removed from each cell.
 */
function testTableDataIsNotRemoved() {
  setUpTableTests();
  if (goog.userAgent.IE) {
    // IE returns an "unspecified error" which seems to be beyond
    // ExpectedFailures' ability to catch.
    return;
  }

  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT || goog.userAgent.EDGE,
      'The content moves out of the table in WebKit and Edge.');

  if (goog.userAgent.IE) {
    // Not used since we bail out early for IE, but this is there so that
    // developers can easily reproduce IE error.
    goog.dom.Range.createFromNodeContents(document.getElementById('outerTr2'))
        .select();
  } else {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) selection.removeAllRanges();
    var range = document.createRange();
    range.selectNode(document.getElementById('cell1'));
    selection.addRange(range);
    range = document.createRange();
    range.selectNode(document.getElementById('cell2'));
    selection.addRange(range);
  }

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();

    span = document.getElementById('outerTr2');
    assertEquals(
        'Table data should not be removed',
        '<td id="cell1">seven</td><td id="cell2">eight foo</td>',
        span.innerHTML);
  });
}

function testLinksAreNotRemoved() {
  expectedFailures.expectFailureFor(
      WEBKIT_BEFORE_CHROME_8,
      'WebKit\'s removeFormatting command removes links.');

  var anchor;
  var div = document.getElementById('html');
  div.innerHTML = 'Foo<span id="link">Pre<a href="http://www.google.com">' +
      'Outside Span<span style="font-size:15pt">Inside Span' +
      '</span></a></span>';

  anchor = document.getElementById('link');
  goog.dom.Range.createFromNodeContents(anchor).select();

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();
    assertHTMLEquals(
        'link should not be removed',
        'FooPre<a href="http://www.google.com/">Outside SpanInside Span</a>',
        div.innerHTML);
  });
}


/**
 * A short formatting removal function for use with the RemoveFormatting
 * plugin. Does enough that we can tell this function was run over the
 * document.
 * @param {string} text The HTML in from the document.
 * @return {string} The "cleaned" HTML out.
 */
function replacementFormattingFunc(text) {
  // Really basic so that we can just see this is executing.
  return text.replace(/Foo/gi, 'Bar').replace(/<[\/]*span[^>]*>/gi, '');
}

function testAlternateRemoveFormattingFunction() {
  var div = document.getElementById('html');
  div.innerHTML = 'Start<span id="remFormat">Foo<pre>Bar</pre>Baz</span>';

  FORMATTER.setRemoveFormattingFunc(replacementFormattingFunc);
  var area = document.getElementById('remFormat');
  goog.dom.Range.createFromNodeContents(area).select();
  FORMATTER.removeFormatting_();
  // Webkit will change all tags to non-formatted ones anyway.
  // Make sure 'Foo' was changed to 'Bar'
  if (WEBKIT_BEFORE_CHROME_8) {
    assertHTMLEquals(
        'regular cleaner should not have run', 'StartBar<br>Bar<br>Baz',
        div.innerHTML);
  } else {
    assertHTMLEquals(
        'regular cleaner should not have run', 'StartBar<pre>Bar</pre>Baz',
        div.innerHTML);
  }
}

function testGetValueForNode() {
  // Override getValueForNode to keep bold tags.
  var oldGetValue =
      goog.editor.plugins.RemoveFormatting.prototype.getValueForNode;
  goog.editor.plugins.RemoveFormatting.prototype.getValueForNode = function(
      node) {
    if (node.nodeName == goog.dom.TagName.B) {
      return '<b>' + this.removeFormattingWorker_(node.innerHTML) + '</b>';
    }
    return null;
  };

  var html = FORMATTER.removeFormattingWorker_('<div>foo<b>bar</b></div>');
  assertHTMLEquals('B tags should remain', 'foo<b>bar</b>', html);

  // Override getValueForNode to throw out bold tags, and their contents.
  goog.editor.plugins.RemoveFormatting.prototype.getValueForNode = function(
      node) {
    if (node.nodeName == goog.dom.TagName.B) {
      return '';
    }
    return null;
  };

  html = FORMATTER.removeFormattingWorker_('<div>foo<b>bar</b></div>');
  assertHTMLEquals('B tag and its contents should be removed', 'foo', html);

  FIELDMOCK.$verify();
  goog.editor.plugins.RemoveFormatting.prototype.getValueForNode = oldGetValue;
}

function testRemoveFormattingAddsNoNbsps() {
  var div = document.getElementById('html');
  div.innerHTML = '"<span id="toStrip">Twin <b>Cinema</b></span>"';

  var span = document.getElementById('toStrip');
  goog.dom.Range.createFromNodeContents(span).select();

  FORMATTER.removeFormatting_();

  assertEquals(
      'Text should be the same, with no non-breaking spaces', '"Twin Cinema"',
      div.innerHTML);

  FIELDMOCK.$verify();
}


/**
 * @bug 992795
 */
function testRemoveFormattingNestedDivs() {
  var html =
      FORMATTER.removeFormattingWorker_('<div>1</div><div><div>2</div></div>');

  goog.testing.dom.assertHtmlMatches('1<br>2', html);
}


/**
 * Test that when we perform remove formatting on an entire table,
 * that the visual look is similiar to as if there was a table there.
 */
function testRemoveFormattingForTableFormatting() {
  // We preserve the table formatting as much as possible.
  // Spaces separate TD's, <br>'s separate TR's.
  // <br>'s separate the start and end of a table.
  var html = '<table><tr><td>cell00</td><td>cell01</td></tr>' +
      '<tr><td>cell10</td><td>cell11</td></tr></table>';
  html = FORMATTER.removeFormattingWorker_(html);
  assertHTMLEquals('<br>cell00 cell01<br>cell10 cell11<br>', html);
}


/**
 * @bug 1319715
 */
function testRemoveFormattingDoesNotShrinkSelection() {
  var div = document.getElementById('html');
  div.innerHTML = '<div>l </div><div><br><b>a</b>foo bar</div>';
  var div2 = div.lastChild;

  goog.dom.Range.createFromNodes(div2.firstChild, 0, div2.lastChild, 7)
      .select();

  FORMATTER.removeFormatting_();

  var range = goog.dom.Range.createFromWindow();
  assertEquals('Correct text should be selected', 'afoo bar', range.getText());

  // We have to trim out the leading BR in IE due to execCommand issues,
  // so it isn't sent off to the removeFormattingWorker.
  // Workaround for broken removeFormat in old webkit added an extra
  // <br> to the end of the html.
  var html = '<div>l </div><br class="GECKO WEBKIT">afoo bar' +
      (goog.editor.BrowserFeature.ADDS_NBSPS_IN_REMOVE_FORMAT ? '<br>' : '');
  if (goog.userAgent.EDGE) {  // TODO(user): I have no idea where this comes from
    html = html.replace(' class="GECKO WEBKIT"', '');
  }

  goog.testing.dom.assertHtmlContentsMatch(html, div);
  FIELDMOCK.$verify();
}


/**
 *  @bug 1447374
 */
function testInsideListRemoveFormat() {
  var div = document.getElementById('html');
  div.innerHTML = '<ul><li>one</li><li><b>two</b></li><li>three</li></ul>';

  var twoLi = div.firstChild.childNodes[1];
  goog.dom.Range.createFromNodeContents(twoLi).select();

  expectedFailures.expectFailureFor(
      goog.userAgent.IE,
      'IE adds the "two" to the "three" li, and leaves empty B tags.');
  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT || goog.userAgent.EDGE,
      'WebKit and Edge leave the "two" orphaned outside of an li but ' +
          'inside the ul (invalid HTML).');

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();
    // Test that we split the list.
    assertHTMLEquals(
        '<ul><li>one</li></ul><br>two<ul><li>three</li></ul>', div.innerHTML);
    FIELDMOCK.$verify();
  });
}

function testFullListRemoveFormat() {
  var div = document.getElementById('html');
  div.innerHTML = '<ul><li>one</li><li><b>two</b></li><li>three</li></ul>after';

  goog.dom.Range.createFromNodeContents(div.firstChild).select();

  //  Note: This may just be a createFromNodeContents issue, as
  //  I can't ever make this happen with real user selection.
  expectedFailures.expectFailureFor(
      goog.userAgent.IE,
      'IE combines everything into a single LI and leaves the UL.');

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();
    // Test that we completely remove the list.
    assertHTMLEquals('<br>one<br>two<br>threeafter', div.innerHTML);
    FIELDMOCK.$verify();
  });
}


/**
 *  @bug 1440935
 */
function testPartialListRemoveFormat() {
  var div = document.getElementById('html');
  div.innerHTML = '<ul><li>one</li><li>two</li><li>three</li></ul>after';

  // Select "two three after".
  goog.dom.Range
      .createFromNodes(div.firstChild.childNodes[1], 0, div.lastChild, 5)
      .select();

  expectedFailures.expectFailureFor(
      goog.userAgent.IE, 'IE leaves behind an empty LI.');
  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT, 'WebKit completely loses the "one".');
  expectedFailures.expectFailureFor(
      goog.userAgent.EDGE,
      'Edge leaves "two" and "threeafter" orphaned outside of an li ' +
          'but inside the ul (invalid HTML).');

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();
    // Test that we leave the list start alone.
    assertHTMLEquals(
        '<ul><li>one</li></ul><br>two<br>threeafter', div.innerHTML);
    FIELDMOCK.$verify();
  });
}

function testBasicRemoveFormatting() {
  // IE will clobber the editable div.
  // Note: I can't repro this using normal user selections.
  if (goog.userAgent.IE) {
    return;
  }
  var div = document.getElementById('html');
  div.innerHTML = '<b>bold<i>italic</i></b>';

  goog.dom.Range.createFromNodeContents(div).select();

  expectedFailures.expectFailureFor(
      goog.editor.BrowserFeature.ADDS_NBSPS_IN_REMOVE_FORMAT,
      'The workaround for the nbsp bug adds an extra br at the end.');

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();
    assertHTMLEquals('bolditalic' + insertImageBoldGarbage, div.innerHTML);
    FIELDMOCK.$verify();
  });
}


/**
 * @bug 1480260
 */
function testPartialBasicRemoveFormatting() {
  var div = document.getElementById('html');
  div.innerHTML = '<b>bold<i>italic</i></b>';

  goog.dom.Range
      .createFromNodes(
          div.firstChild.firstChild, 2, div.firstChild.lastChild.firstChild, 3)
      .select();

  expectedFailures.expectFailureFor(
      WEBKIT_BEFORE_CHROME_8,
      'WebKit just gets this all wrong.  Everything stays bold and ' +
          '"lditalic" gets italicised.');

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();
    assertHTMLEquals('<b>bo</b>ldita<b><i>lic</i></b>', div.innerHTML);
    FIELDMOCK.$verify();
  });
}


/**
 * @bug 3075557
 */
function testRemoveFormattingLinkedImageBorderZero() {
  var testHtml = '<a href="http://www.google.com/">' +
      '<img src="http://www.google.com/images/logo.gif" border="0"></a>';
  var div = document.getElementById('html');
  div.innerHTML = testHtml + controlHtml;
  goog.dom.Range.createFromNodeContents(div).select();
  FORMATTER.removeFormatting_();

  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT, 'WebKit removes the image entirely, see ' +
          'https://bugs.webkit.org/show_bug.cgi?id=13125 .');

  expectedFailures.run(function() {
    assertHTMLEquals(
        'Image\'s border=0 should not be removed during remove formatting',
        testHtml + controlCleanHtml, div.innerHTML);
    FIELDMOCK.$verify();
  });
}


/**
 * @bug 3075557
 */
function testRemoveFormattingLinkedImageBorderNonzero() {
  var testHtml = '<a href="http://www.google.com/">' +
      '<img src="http://www.google.com/images/logo.gif" border="1"></a>';
  var div = document.getElementById('html');
  div.innerHTML = testHtml + controlHtml;
  goog.dom.Range.createFromNodeContents(div).select();
  FORMATTER.removeFormatting_();

  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT, 'WebKit removes the image entirely, see ' +
          'https://bugs.webkit.org/show_bug.cgi?id=13125 .');

  expectedFailures.run(function() {
    assertHTMLEquals(
        'Image\'s border should be removed during remove formatting' +
            ' if non-zero',
        testHtml.replace(' border="1"', '') + controlCleanHtml, div.innerHTML);
    FIELDMOCK.$verify();
  });
}


/**
 * @bug 3075557
 */
function testRemoveFormattingUnlinkedImage() {
  var testHtml = '<img src="http://www.google.com/images/logo.gif" border="0">';
  var div = document.getElementById('html');
  div.innerHTML = testHtml + controlHtml;
  goog.dom.Range.createFromNodeContents(div).select();
  FORMATTER.removeFormatting_();

  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT, 'WebKit removes the image entirely, see ' +
          'https://bugs.webkit.org/show_bug.cgi?id=13125 .');

  expectedFailures.run(function() {
    assertHTMLEquals(
        'Image\'s border=0 should not be removed during remove formatting' +
            ' even if not wrapped by a link',
        testHtml + controlCleanHtml, div.innerHTML);
    FIELDMOCK.$verify();
  });
}


/**
 * @bug 3075557
 */
function testRemoveFormattingLinkedImageDeep() {
  var testHtml = '<a href="http://www.google.com/"><b>hello' +
      '<img src="http://www.google.com/images/logo.gif" border="0">' +
      'world</b></a>';
  var div = document.getElementById('html');
  div.innerHTML = testHtml + controlHtml;
  goog.dom.Range.createFromNodeContents(div).select();
  FORMATTER.removeFormatting_();

  expectedFailures.expectFailureFor(
      WEBKIT_BEFORE_CHROME_8, 'WebKit removes the image entirely, see ' +
          'https://bugs.webkit.org/show_bug.cgi?id=13125 .');

  expectedFailures.run(function() {
    assertHTMLEquals(
        'Image\'s border=0 should not be removed during remove formatting' +
            ' even if deep inside anchor tag',
        testHtml.replace(/<\/?b>/g, '') + controlCleanHtml +
            insertImageBoldGarbage,
        div.innerHTML);
    FIELDMOCK.$verify();
  });
}

function testFullTableRemoveFormatting() {
  // Something goes horrible wrong in case 1 below.  It was crashing all
  // WebKit browsers, and now seems to be giving errors as it is trying
  // to perform remove formatting on the little expected failures window
  // instead of the dom we select.  WTF.  Since I'm gutting this code,
  // I'm not going to look into this anymore right now.  For what its worth,
  // I can't repro any issues in standalone TrogEdit.
  if (goog.userAgent.WEBKIT) {
    return;
  }

  var div = document.getElementById('html');

  // WebKit has an extra BR in case 2.
  expectedFailures.expectFailureFor(
      goog.userAgent.IE,
      'IE clobbers the editable node in case 2 (can\'t repro with real ' +
          'user selections). IE doesn\'t remove the table in case 1.');

  expectedFailures.run(function() {

    // When a full table is selected, we remove it completely.
    div.innerHTML = 'foo<table><tr><td>bar</td></tr></table>baz1';
    goog.dom.Range.createFromNodeContents(div.childNodes[1]).select();
    FORMATTER.removeFormatting_();
    assertHTMLEquals('foo<br>bar<br>baz1', div.innerHTML);
    FIELDMOCK.$verify();

    // Remove the full table when it is selected with additional
    // contents too.
    div.innerHTML = 'foo<table><tr><td>bar</td></tr></table>baz2';
    goog.dom.Range.createFromNodes(div.firstChild, 0, div.lastChild, 1)
        .select();
    FORMATTER.removeFormatting_();
    assertHTMLEquals('foo<br>bar<br>baz2', div.innerHTML);
    FIELDMOCK.$verify();

    // We should still remove the table, even if the selection is inside the
    // table and it is fully selected.
    div.innerHTML = 'foo<table><tr><td id=\'td\'>bar</td></tr></table>baz3';
    goog.dom.Range.createFromNodeContents(goog.dom.getElement('td').firstChild)
        .select();
    FORMATTER.removeFormatting_();
    assertHTMLEquals('foo<br>bar<br>baz3', div.innerHTML);
    FIELDMOCK.$verify();
  });
}

function testInsideTableRemoveFormatting() {
  var div = document.getElementById('html');
  div.innerHTML =
      '<table><tr><td><b id="b">foo</b></td></tr><tr><td>ba</td></tr></table>';

  goog.dom.Range.createFromNodeContents(goog.dom.getElement('b')).select();

  // Webkit adds some apple style span crap during execCommand("removeFormat")
  // Our workaround for the nbsp bug removes these, but causes worse problems.
  // See bugs.webkit.org/show_bug.cgi?id=29164 for more details.
  expectedFailures.expectFailureFor(
      WEBKIT_BEFORE_CHROME_8 &&
          !goog.editor.BrowserFeature.ADDS_NBSPS_IN_REMOVE_FORMAT,
      'Extra apple-style-spans');

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();

    // Only remove styling from inside tables.
    assertHTMLEquals(
        '<table><tr><td>foo' + insertImageBoldGarbage +
            '</td></tr><tr><td>ba</td></tr></table>',
        div.innerHTML);
    FIELDMOCK.$verify();
  });
}

function testPartialTableRemoveFormatting() {
  if (goog.userAgent.IE) {
    // IE returns an "unspecified error" which seems to be beyond
    // ExpectedFailures' ability to catch.
    return;
  }

  var div = document.getElementById('html');
  div.innerHTML = 'bar<table><tr><td><b id="b">foo</b></td></tr>' +
      '<tr><td><i>banana</i></td></tr></table><div id="baz">' +
      'baz</div>';

  // Select from the "oo" inside the b tag to the end of "baz".
  goog.dom.Range
      .createFromNodes(
          goog.dom.getElement('b').firstChild, 1,
          goog.dom.getElement('baz').firstChild, 3)
      .select();

  // All browsers currently clobber the table cells that are selected.
  expectedFailures.expectFailureFor(goog.userAgent.WEBKIT);

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();
    // Only remove styling from inside tables.
    assertHTMLEquals(
        'bar<table><tr><td><b id="b">f</b>oo</td></tr>' +
            '<tr><td>banana</td></tr></table>baz',
        div.innerHTML);
    FIELDMOCK.$verify();
  });
}

// Runs tests knowing some browsers will fail, because the new
// table functionality hasn't been implemented in them yet.
function runExpectingFailuresForUnimplementedBrowsers(func) {
  if (goog.userAgent.IE) {
    // IE returns an "unspecified error" which seems to be beyond
    // ExpectedFailures' ability to catch.
    return;
  }

  expectedFailures.expectFailureFor(
      goog.userAgent.IE, 'Proper behavior not yet implemented for IE.');
  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT, 'Proper behavior not yet implemented for WebKit.');

  expectedFailures.run(func);
}


function testTwoTablesSelectedFullyRemoveFormatting() {
  runExpectingFailuresForUnimplementedBrowsers(function() {
    var div = document.getElementById('html');
    // When two tables are fully selected, we remove them completely.
    div.innerHTML = '<table><tr><td>foo</td></tr></table>' +
        '<table><tr><td>bar</td></tr></table>';
    goog.dom.Range.createFromNodes(div.firstChild, 0, div.lastChild, 1)
        .select();
    FORMATTER.removeFormatting_();
    assertHTMLEquals('<br>foo<br><br>bar<br>', div.innerHTML);
    FIELDMOCK.$verify();
  });
}

function testTwoTablesSelectedFullyInsideRemoveFormatting() {
  if (goog.userAgent.WEBKIT) {
    // Something goes very wrong here, but it did before
    // Julie started writing v2.  Will address when converting
    // safari to v2.
    return;
  }

  runExpectingFailuresForUnimplementedBrowsers(function() {
    var div = document.getElementById('html');
    // When two tables are selected from inside but fully,
    // also remove them completely.
    div.innerHTML = '<table><tr><td id="td1">foo</td></tr></table>' +
        '<table><tr><td id="td2">bar</td></tr></table>';
    goog.dom.Range
        .createFromNodes(
            goog.dom.getElement('td1').firstChild, 0,
            goog.dom.getElement('td2').firstChild, 3)
        .select();
    FORMATTER.removeFormatting_();
    assertHTMLEquals('<br>foo<br><br>bar<br>', div.innerHTML);
    FIELDMOCK.$verify();
  });
}

function testTwoTablesSelectedFullyAndPartiallyRemoveFormatting() {
  runExpectingFailuresForUnimplementedBrowsers(function() {
    var div = document.getElementById('html');
    // Two tables selected, one fully, one partially. Remove
    // only the fully selected one and remove styles only from
    // partially selected one.
    div.innerHTML = '<table><tr><td id="td1">foo</td></tr></table>' +
        '<table><tr><td id="td2"><b>bar<b></td></tr></table>';
    goog.dom.Range
        .createFromNodes(
            goog.dom.getElement('td1').firstChild, 0,
            goog.dom.getElement('td2').firstChild.firstChild, 2)
        .select();
    FORMATTER.removeFormatting_();
    var expectedHtml = '<br>foo<br>' +
        '<table><tr><td id="td2">ba<b>r</b></td></tr></table>';
    if (goog.userAgent.EDGE) {
      // TODO(user): Edge inserts an extra empty <b> tag but is otherwise correct
      expectedHtml = expectedHtml.replace('</b>', '<b></b></b>');
    }
    assertHTMLEquals(expectedHtml, div.innerHTML);
    FIELDMOCK.$verify();
  });
}

function testTwoTablesSelectedPartiallyRemoveFormatting() {
  runExpectingFailuresForUnimplementedBrowsers(function() {
    var div = document.getElementById('html');
    // Two tables selected, both partially.  Don't remove tables,
    // but remove styles.
    div.innerHTML = '<table><tr><td id="td1">f<i>o</i>o</td></tr></table>' +
        '<table><tr><td id="td2">b<b>a</b>r</td></tr></table>';
    goog.dom.Range
        .createFromNodes(
            goog.dom.getElement('td1').firstChild, 1,
            goog.dom.getElement('td2').childNodes[1], 1)
        .select();
    FORMATTER.removeFormatting_();
    assertHTMLEquals(
        '<table><tr><td id="td1">foo</td></tr></table>' +
            '<table><tr><td id="td2">bar</td></tr></table>',
        div.innerHTML);
    FIELDMOCK.$verify();
  });
}


/**
 * Test a random snippet from Google News (Google News has complicated
 * dom structure, including tables, links, images, etc).
 */
function testRandomGoogleNewsSnippetRemoveFormatting() {
  if (goog.userAgent.IE) {
    // IE returns an "unspecified error" which seems to be beyond
    // ExpectedFailures' ability to catch.
    return;
  }

  var div = document.getElementById('html');
  div.innerHTML =
      '<font size="-3"><br></font><table align="right" border="0" ' +
      'cellpadding="0" cellspacing="0"><tbody><tr><td style="padding-left:' +
      '6px;" valign="top" width="80" align="center"><a href="http://www.wash' +
      'ingtonpost.com/wp-dyn/content/article/2008/11/11/AR2008111101090.htm' +
      'l" + id="s-skHRvWH7ryqkcA4caGv0QQ:u-AFQjCNG3vx1HJOxKxMQPzCvYOVRE0JUDe' +
      'Q:r-1-0i_1268233361_6_H0_MH20_PL60"><img src="http://news.google.com/' +
      'news?imgefp=4LFiNNP62TgJ&amp;imgurl=media3.washingtonpost.com/wp-dyn/' +
      'content/photo/2008/11/11/PH2008111101091.jpg" alt="" width="60" ' +
      'border="1" height="80"><br><font size="-2">Washington Post</font></a>' +
      '</td></tr></tbody></table><a href="http://www.nme.com/news/britney-' +
      'spears/40995" id="s-xZUO-t0c1IpsVjyJj0rgxw:u-AFQjCNEZAMQCseEW6uTgXI' +
      'iPvAMHe_0B4A:r-1-0_1268233361_6_H0_MH20_PL60"><b>Britney\'s son ' +
      'released from hospital</b></a><br><font size="-1"><b><font color=' +
      '"#6f6f6f">NME.com&nbsp;-</font> <nobr>53 minutes ago</nobr></b>' +
      '</font><br><font size="-1">Britney Spears� youngest son Jayden James ' +
      'has been released from hospital, having been admitted on Sunday after' +
      ' suffering a severe reaction to something he ingested.</font><br><fon' +
      'tsize="-1"><a href="http://www.celebrity-gossip.net/celebrities/holly' +
      'wood/britney-and-jamie-lynn-spears-alligator-alley-208944/" id="s-nM' +
      'PzHclcMG0J2WZkw9gnVQ:u-AFQjCNHal08usOQ5e5CAQsck2yGsTYeGVQ">Britney ' +
      'and Jamie Lynn Spears: Alligator Alley!</a> <font size="-1" color=' +
      '"#6f6f6f"><nobr>The Gossip Girls</nobr></font></font><br><font size=' +
      '"-1"><a href="http://foodconsumer.org/7777/8888/Other_N_ews_51/111101' +
      '362008_Allergy_incident_could_spell_custody_trouble_for_Britney_Spear' +
      's.shtml" id="s-2lMNDY4joOprVvkkY_b-6A:u-AFQjCNGAeFNutMEbSg5zAvrh5reBF' +
      'lqUmA">Allergy incident could spell trouble for Britney Spears</a> ' +
      '<font size="-1" color="#6f6f6f"><nobr>Food Consumer</nobr></font>' +
      '</font><br><font class="p" size="-1"><a href="http://www.people.com/' +
      'people/article/0,,20239458,00.html" id="s-x9thwVUYVET0ZJOnkkcsjw:u-A' +
      'FQjCNE99eijVIrezr9AFRjLkmo5j_Jr7A"><nobr>People Magazine</nobr></a>&nb' +
      'sp;- <a href="http://www.eonline.com/uberblog/b68226_hospital_run_cou' +
      'ld_cost_britney_custody.html" id="s-kYt5LHDhlDnhUL9kRLuuwA:u-AFQjCNF8' +
      '8eOy2utriYuF0icNrZQPzwK8gg"><nobr>E! Online</nobr></a>&nbsp;- <a href' +
      '="http://justjared.buzznet.com/2008/11/11/britney-spears-alligator-fa' +
      'rm/" id="s--VDy1fyacNvaRo_aXb02Dw:u-AFQjCNEn0Rz3wg0PMwDdzKTDug-9k5W6y' +
      'g"><nobr>Just Jared</nobr></a>&nbsp;- <a href="http://www.efluxmedia.' +
      'com/news_Britney_Spears_Son_Released_from_Hospital_28696.html" id="s-' +
      '8oX6hVDe4Qbcl1x5Rua_EA:u-AFQjCNEpn3nOHA8EB0pxJAPf6diOicMRDg"><nobr>eF' +
      'luxMedia</nobr></a></font><br><font class="p" size="-1"><a class="p" ' +
      'href="http://news.google.com/news?ncl=1268233361&amp;hl=en"><nobr><b>' +
      'all 950 news articles&nbsp;�</b></nobr></a></font>';
  // Select it all.
  goog.dom.Range.createFromNodeContents(div).select();

  expectedFailures.expectFailureFor(
      WEBKIT_BEFORE_CHROME_8,
      'WebKit barfs apple-style-spans all over the place, and removes links.');

  expectedFailures.run(function() {
    FORMATTER.removeFormatting_();
    // Leave links and images alone, remove all other formatting.
    assertHTMLEquals(
        '<br><br><a href="http://www.washingtonpost.com/wp-dyn/' +
            'content/article/2008/11/11/AR2008111101090.html"><img src="http://n' +
            'ews.google.com/news?imgefp=4LFiNNP62TgJ&amp;imgurl=media3.washingto' +
            'npost.com/wp-dyn/content/photo/2008/11/11/PH2008111101091.jpg"><br>' +
            'Washington Post</a><br><a href="http://www.nme.com/news/britney-spe' +
            'ars/40995">Britney\'s son released from hospital</a><br>NME.com - 5' +
            '3 minutes ago<br>Britney Spears� youngest son Jayden James has been' +
            ' released from hospital, having been admitted on Sunday after suffe' +
            'ring a severe reaction to something he ingested.<br><a href="http:/' +
            '/www.celebrity-gossip.net/celebrities/hollywood/britney-and-jamie-l' +
            'ynn-spears-alligator-alley-208944/">Britney and Jamie Lynn Spears: ' +
            'Alligator Alley!</a> The Gossip Girls<br><a href="http://foodconsum' +
            'er.org/7777/8888/Other_N_ews_51/111101362008_Allergy_incident_could' +
            '_spell_custody_trouble_for_Britney_Spears.shtml">Allergy incident c' +
            'ould spell trouble for Britney Spears</a> Food Consumer<br><a href=' +
            '"http://www.people.com/people/article/0,,20239458,00.html">People M' +
            'agazine</a> - <a href="http://www.eonline.com/uberblog/b68226_hospi' +
            'tal_run_could_cost_britney_custody.html">E! Online</a> - <a href="h' +
            'ttp://justjared.buzznet.com/2008/11/11/britney-spears-alligator-far' +
            'm/">Just Jared</a> - <a href="http://www.efluxmedia.com/news_Britne' +
            'y_Spears_Son_Released_from_Hospital_28696.html">eFluxMedia</a><br><' +
            'a href="http://news.google.com/news?ncl=1268233361&amp;hl=en">all 9' +
            '50 news articles �</a>' + insertImageFontGarbage,
        div.innerHTML);
    FIELDMOCK.$verify();
  });
}

function testRangeDelimitedByRanges() {
  var abcde = goog.dom.getElement('abcde').firstChild;
  var start = goog.dom.Range.createFromNodes(abcde, 1, abcde, 2);
  var end = goog.dom.Range.createFromNodes(abcde, 3, abcde, 4);

  goog.testing.dom.assertRangeEquals(
      abcde, 1, abcde, 4,
      goog.editor.plugins.RemoveFormatting.createRangeDelimitedByRanges_(
          start, end));
}

function testGetTableAncestor() {
  var div = document.getElementById('html');

  div.innerHTML = 'foo<table><tr><td>foo</td></tr></table>bar';
  assertTrue(
      'Full table is in table',
      !!FORMATTER.getTableAncestor_(div.childNodes[1]));

  assertFalse(
      'Outside of table', !!FORMATTER.getTableAncestor_(div.firstChild));

  assertTrue(
      'Table cell is in table',
      !!FORMATTER.getTableAncestor_(
          div.childNodes[1].firstChild.firstChild.firstChild));

  goog.dom.setTextContent(div, 'foo');
  assertNull(
      'No table inside field.', FORMATTER.getTableAncestor_(div.childNodes[0]));
}


/**
 * @bug 1272905
 */
function testHardReturnsInHeadersPreserved() {
  var div = document.getElementById('html');
  div.innerHTML = '<h1>abcd</h1><h2>efgh</h2><h3>ijkl</h3>';

  // Select efgh.
  goog.dom.Range.createFromNodeContents(div.childNodes[1]).select();
  FORMATTER.removeFormatting_();

  expectedFailures.expectFailureFor(
      goog.userAgent.IE, 'Proper behavior not yet implemented for IE.');
  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT, 'Proper behavior not yet implemented for WebKit.');
  expectedFailures.run(function() {
    assertHTMLEquals('<h1>abcd</h1><br>efgh<h3>ijkl</h3>', div.innerHTML);
  });

  // Select ijkl.
  goog.dom.Range.createFromNodeContents(div.lastChild).select();
  FORMATTER.removeFormatting_();

  expectedFailures.expectFailureFor(
      goog.userAgent.IE, 'Proper behavior not yet implemented for IE.');
  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT, 'Proper behavior not yet implemented for WebKit.');
  expectedFailures.run(function() {
    assertHTMLEquals('<h1>abcd</h1><br>efgh<br>ijkl', div.innerHTML);
  });

  // Select abcd.
  goog.dom.Range.createFromNodeContents(div.firstChild).select();
  FORMATTER.removeFormatting_();

  expectedFailures.expectFailureFor(
      goog.userAgent.IE, 'Proper behavior not yet implemented for IE.');
  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT, 'Proper behavior not yet implemented for WebKit.');
  expectedFailures.run(function() {
    assertHTMLEquals('<br>abcd<br>efgh<br>ijkl', div.innerHTML);
  });
}

function testKeyboardShortcut_space() {
  FIELDMOCK.$reset();

  FIELDMOCK.execCommand(
      goog.editor.plugins.RemoveFormatting.REMOVE_FORMATTING_COMMAND);

  FIELDMOCK.$replay();

  var e = {};
  var key = ' ';
  var result = FORMATTER.handleKeyboardShortcut(e, key, true);
  assertTrue(result);

  FIELDMOCK.$verify();
}

function testKeyboardShortcut_other() {
  FIELDMOCK.$reset();
  FIELDMOCK.$replay();

  var e = {};
  var key = 'a';
  var result = FORMATTER.handleKeyboardShortcut(e, key, true);
  assertFalse(result);

  FIELDMOCK.$verify();
}
