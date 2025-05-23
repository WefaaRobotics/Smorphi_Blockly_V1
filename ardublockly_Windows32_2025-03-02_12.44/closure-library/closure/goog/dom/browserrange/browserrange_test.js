// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.browserrangeTest');
goog.setTestOnly('goog.dom.browserrangeTest');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.Range');
goog.require('goog.dom.RangeEndpoint');
goog.require('goog.dom.TagName');
goog.require('goog.dom.browserrange');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var test1;
var test2;
var cetest;
var empty;
var dynamic;
var onlybrdiv;

function setUpPage() {
  test1 = goog.dom.getElement('test1');
  test2 = goog.dom.getElement('test2');
  cetest = goog.dom.getElement('cetest');
  empty = goog.dom.getElement('empty');
  dynamic = goog.dom.getElement('dynamic');
  onlybrdiv = goog.dom.getElement('onlybr');
}

function testCreate() {
  assertNotNull(
      'Browser range object can be created for node',
      goog.dom.browserrange.createRangeFromNodeContents(test1));
}

function testRangeEndPoints() {
  var container = cetest.firstChild;
  var range =
      goog.dom.browserrange.createRangeFromNodes(container, 2, container, 2);
  range.select();

  var selRange = goog.dom.Range.createFromWindow();
  var startNode = selRange.getStartNode();
  var endNode = selRange.getEndNode();
  var startOffset = selRange.getStartOffset();
  var endOffset = selRange.getEndOffset();
  if (goog.userAgent.WEBKIT) {
    assertEquals(
        'Start node should have text: abc', 'abc', startNode.nodeValue);
    assertEquals('End node should have text: abc', 'abc', endNode.nodeValue);
    assertEquals('Start offset should be 3', 3, startOffset);
    assertEquals('End offset should be 3', 3, endOffset);
  } else {
    assertEquals('Start node should be the first div', container, startNode);
    assertEquals('End node should be the first div', container, endNode);
    assertEquals('Start offset should be 2', 2, startOffset);
    assertEquals('End offset should be 2', 2, endOffset);
  }
}

function testCreateFromNodeContents() {
  var range = goog.dom.Range.createFromNodeContents(onlybrdiv);
  goog.testing.dom.assertRangeEquals(onlybrdiv, 0, onlybrdiv, 1, range);
}

function normalizeHtml(str) {
  return str.toLowerCase().replace(/[\n\r\f"]/g, '');
}

// TODO(robbyw): We really need tests for (and code fixes for)
// createRangeFromNodes in the following cases:
// * BR boundary (before + after)

function testCreateFromNodes() {
  var start = test1.firstChild;
  var range =
      goog.dom.browserrange.createRangeFromNodes(start, 2, test2.firstChild, 2);
  assertNotNull(
      'Browser range object can be created for W3C node range', range);

  assertEquals(
      'Start node should be selected at start endpoint', start,
      range.getStartNode());
  assertEquals('Selection should start at offset 2', 2, range.getStartOffset());

  assertEquals(
      'Text node should be selected at end endpoint', test2.firstChild,
      range.getEndNode());
  assertEquals('Selection should end at offset 2', 2, range.getEndOffset());

  assertTrue(
      'Text content should be "xt\\s*ab"', /xt\s*ab/.test(range.getText()));
  assertFalse('Nodes range is not collapsed', range.isCollapsed());
  assertEquals(
      'Should contain correct html fragment', 'xt</div><div id=test2>ab',
      normalizeHtml(range.getHtmlFragment()));
  assertEquals(
      'Should contain correct valid html',
      '<div id=test1>xt</div><div id=test2>ab</div>',
      normalizeHtml(range.getValidHtml()));
}


function testTextNode() {
  var range =
      goog.dom.browserrange.createRangeFromNodeContents(test1.firstChild);

  assertEquals(
      'Text node should be selected at start endpoint', 'Text',
      range.getStartNode().nodeValue);
  assertEquals('Selection should start at offset 0', 0, range.getStartOffset());

  assertEquals(
      'Text node should be selected at end endpoint', 'Text',
      range.getEndNode().nodeValue);
  assertEquals(
      'Selection should end at offset 4', 'Text'.length, range.getEndOffset());

  assertEquals(
      'Container should be text node', goog.dom.NodeType.TEXT,
      range.getContainer().nodeType);

  assertEquals('Text content should be "Text"', 'Text', range.getText());
  assertFalse('Text range is not collapsed', range.isCollapsed());
  assertEquals(
      'Should contain correct html fragment', 'Text', range.getHtmlFragment());
  assertEquals(
      'Should contain correct valid html', 'Text', range.getValidHtml());
}

function testTextNodes() {
  goog.dom.removeChildren(dynamic);
  dynamic.appendChild(goog.dom.createTextNode('Part1'));
  dynamic.appendChild(goog.dom.createTextNode('Part2'));
  var range = goog.dom.browserrange.createRangeFromNodes(
      dynamic.firstChild, 0, dynamic.lastChild, 5);

  assertEquals(
      'Text node 1 should be selected at start endpoint', 'Part1',
      range.getStartNode().nodeValue);
  assertEquals('Selection should start at offset 0', 0, range.getStartOffset());

  assertEquals(
      'Text node 2 should be selected at end endpoint', 'Part2',
      range.getEndNode().nodeValue);
  assertEquals(
      'Selection should end at offset 5', 'Part2'.length, range.getEndOffset());

  assertEquals(
      'Container should be DIV', goog.dom.TagName.DIV,
      range.getContainer().tagName);

  assertEquals(
      'Text content should be "Part1Part2"', 'Part1Part2', range.getText());
  assertFalse('Text range is not collapsed', range.isCollapsed());
  assertEquals(
      'Should contain correct html fragment', 'Part1Part2',
      range.getHtmlFragment());
  assertEquals(
      'Should contain correct valid html', 'part1part2',
      normalizeHtml(range.getValidHtml()));
}

function testDiv() {
  var range = goog.dom.browserrange.createRangeFromNodeContents(test2);

  assertEquals(
      'Text node "abc" should be selected at start endpoint', 'abc',
      range.getStartNode().nodeValue);
  assertEquals('Selection should start at offset 0', 0, range.getStartOffset());

  assertEquals(
      'Text node "def" should be selected at end endpoint', 'def',
      range.getEndNode().nodeValue);
  assertEquals(
      'Selection should end at offset 3', 'def'.length, range.getEndOffset());

  assertEquals('Container should be DIV', 'DIV', range.getContainer().tagName);

  assertTrue(
      'Div text content should be "abc\\s*def"',
      /abc\s*def/.test(range.getText()));
  assertEquals(
      'Should contain correct html fragment', 'abc<br id=br>def',
      normalizeHtml(range.getHtmlFragment()));
  assertEquals(
      'Should contain correct valid html',
      '<div id=test2>abc<br id=br>def</div>',
      normalizeHtml(range.getValidHtml()));
  assertFalse('Div range is not collapsed', range.isCollapsed());
}

function testEmptyNodeHtmlInsert() {
  var range = goog.dom.browserrange.createRangeFromNodeContents(empty);
  var html = '<b>hello</b>';
  range.insertNode(goog.dom.htmlToDocumentFragment(html));
  assertEquals(
      'Html is not inserted correctly', html, normalizeHtml(empty.innerHTML));
  goog.dom.removeChildren(empty);
}

function testEmptyNode() {
  var range = goog.dom.browserrange.createRangeFromNodeContents(empty);

  assertEquals(
      'DIV be selected at start endpoint', 'DIV', range.getStartNode().tagName);
  assertEquals('Selection should start at offset 0', 0, range.getStartOffset());

  assertEquals(
      'DIV should be selected at end endpoint', 'DIV',
      range.getEndNode().tagName);
  assertEquals('Selection should end at offset 0', 0, range.getEndOffset());

  assertEquals('Container should be DIV', 'DIV', range.getContainer().tagName);

  assertEquals('Empty text content should be ""', '', range.getText());
  assertTrue('Empty range is collapsed', range.isCollapsed());
  assertEquals(
      'Should contain correct valid html', '<div id=empty></div>',
      normalizeHtml(range.getValidHtml()));
  assertEquals('Should contain no html fragment', '', range.getHtmlFragment());
}


function testRemoveContents() {
  var outer = goog.dom.getElement('removeTest');
  var range =
      goog.dom.browserrange.createRangeFromNodeContents(outer.firstChild);

  range.removeContents();

  assertEquals('Removed range content should be ""', '', range.getText());
  assertTrue('Removed range is now collapsed', range.isCollapsed());
  assertEquals('Outer div has 1 child now', 1, outer.childNodes.length);
  assertEquals('Inner div is empty', 0, outer.firstChild.childNodes.length);
}


function testRemoveContentsEmptyNode() {
  var outer = goog.dom.getElement('removeTestEmptyNode');
  var range = goog.dom.browserrange.createRangeFromNodeContents(outer);

  range.removeContents();

  assertEquals('Removed range content should be ""', '', range.getText());
  assertTrue('Removed range is now collapsed', range.isCollapsed());
  assertEquals(
      'Outer div should have 0 children now', 0, outer.childNodes.length);
}


function testRemoveContentsSingleNode() {
  var outer = goog.dom.getElement('removeTestSingleNode');
  var range =
      goog.dom.browserrange.createRangeFromNodeContents(outer.firstChild);

  range.removeContents();

  assertEquals('Removed range content should be ""', '', range.getText());
  assertTrue('Removed range is now collapsed', range.isCollapsed());
  assertEquals('', goog.dom.getTextContent(outer));
}


function testRemoveContentsMidNode() {
  var outer = goog.dom.getElement('removeTestMidNode');
  var textNode = outer.firstChild.firstChild;
  var range =
      goog.dom.browserrange.createRangeFromNodes(textNode, 1, textNode, 4);

  assertEquals(
      'Previous range content should be "123"', '123', range.getText());
  range.removeContents();

  assertEquals(
      'Removed range content should be "0456789"', '0456789',
      goog.dom.getTextContent(outer));
}


function testRemoveContentsMidMultipleNodes() {
  var outer = goog.dom.getElement('removeTestMidMultipleNodes');
  var firstTextNode = outer.firstChild.firstChild;
  var lastTextNode = outer.lastChild.firstChild;
  var range = goog.dom.browserrange.createRangeFromNodes(
      firstTextNode, 1, lastTextNode, 4);

  assertEquals(
      'Previous range content', '1234567890123',
      range.getText().replace(/\s/g, ''));
  range.removeContents();

  assertEquals(
      'Removed range content should be "0456789"', '0456789',
      goog.dom.getTextContent(outer).replace(/\s/g, ''));
}


function testRemoveDivCaretRange() {
  var outer = goog.dom.getElement('sandbox');
  outer.innerHTML = '<div>Test1</div><div></div>';
  var range = goog.dom.browserrange.createRangeFromNodes(
      outer.lastChild, 0, outer.lastChild, 0);

  range.removeContents();
  range.insertNode(
      goog.dom.createDom(goog.dom.TagName.SPAN, undefined, 'Hello'), true);

  assertEquals(
      'Resulting contents', 'Test1Hello',
      goog.dom.getTextContent(outer).replace(/\s/g, ''));
}


function testCollapse() {
  var range = goog.dom.browserrange.createRangeFromNodeContents(test2);
  assertFalse('Div range is not collapsed', range.isCollapsed());
  range.collapse();
  assertTrue(
      'Div range is collapsed after call to empty()', range.isCollapsed());

  range = goog.dom.browserrange.createRangeFromNodeContents(empty);
  assertTrue('Empty range is collapsed', range.isCollapsed());
  range.collapse();
  assertTrue('Empty range is still collapsed', range.isCollapsed());
}


function testIdWithSpecialCharacters() {
  goog.dom.removeChildren(dynamic);
  dynamic.appendChild(goog.dom.createTextNode('1'));
  dynamic.appendChild(goog.dom.createDom(goog.dom.TagName.DIV, {id: '<>'}));
  dynamic.appendChild(goog.dom.createTextNode('2'));
  var range = goog.dom.browserrange.createRangeFromNodes(
      dynamic.firstChild, 0, dynamic.lastChild, 1);

  // Difference in special character handling is ok.
  assertContains(
      'Should have correct html fragment',
      normalizeHtml(range.getHtmlFragment()),
      [
        '1<div id=<>></div>2',       // IE
        '1<div id=&lt;>></div>2',    // WebKit
        '1<div id=&lt;&gt;></div>2'  // Others
      ]);
}

function testEndOfChildren() {
  dynamic.innerHTML = '<span id="a">123<br>456</span><span id="b">text</span>';
  var range = goog.dom.browserrange.createRangeFromNodes(
      goog.dom.getElement('a'), 3, goog.dom.getElement('b'), 1);
  assertEquals('Should have correct text.', 'text', range.getText());
}

function testEndOfDiv() {
  dynamic.innerHTML = '<div id="a">abc</div><div id="b">def</div>';
  var a = goog.dom.getElement('a');
  var range = goog.dom.browserrange.createRangeFromNodes(a, 1, a, 1);
  var expectedStartNode = a;
  var expectedStartOffset = 1;
  var expectedEndNode = a;
  var expectedEndOffset = 1;
  assertEquals('startNode is wrong', expectedStartNode, range.getStartNode());
  assertEquals(
      'startOffset is wrong', expectedStartOffset, range.getStartOffset());
  assertEquals('endNode is wrong', expectedEndNode, range.getEndNode());
  assertEquals('endOffset is wrong', expectedEndOffset, range.getEndOffset());
}

function testRangeEndingWithBR() {
  dynamic.innerHTML = '<span id="a">123<br>456</span>';
  var spanElem = goog.dom.getElement('a');
  var range =
      goog.dom.browserrange.createRangeFromNodes(spanElem, 0, spanElem, 2);
  var htmlText = range.getValidHtml().toLowerCase();
  assertContains('Should include BR in HTML.', 'br', htmlText);
  assertEquals('Should have correct text.', '123', range.getText());

  range.select();

  var selRange = goog.dom.Range.createFromWindow();
  var startNode = selRange.getStartNode();
  if (goog.userAgent.GECKO || goog.userAgent.EDGE ||
      (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9))) {
    assertEquals('Start node should be span', spanElem, startNode);
  } else {
    assertEquals('Startnode should have text:123', '123', startNode.nodeValue);
  }
  assertEquals('Startoffset should be 0', 0, selRange.getStartOffset());
  var endNode = selRange.getEndNode();
  assertEquals('Endnode should be span', spanElem, endNode);
  assertEquals('Endoffset should be 2', 2, selRange.getEndOffset());
}

function testRangeEndingWithBR2() {
  dynamic.innerHTML = '<span id="a">123<br></span>';
  var spanElem = goog.dom.getElement('a');
  var range =
      goog.dom.browserrange.createRangeFromNodes(spanElem, 0, spanElem, 2);
  var htmlText = range.getValidHtml().toLowerCase();
  assertContains('Should include BR in HTML.', 'br', htmlText);
  assertEquals('Should have correct text.', '123', range.getText());

  range.select();

  var selRange = goog.dom.Range.createFromWindow();
  var startNode = selRange.getStartNode();
  if (goog.userAgent.GECKO || goog.userAgent.EDGE ||
      (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9))) {
    assertEquals('Start node should be span', spanElem, startNode);
  } else {
    assertEquals('Start node should have text:123', '123', startNode.nodeValue);
  }
  assertEquals('Startoffset should be 0', 0, selRange.getStartOffset());
  var endNode = selRange.getEndNode();
  if (goog.userAgent.WEBKIT) {
    assertEquals('Endnode should have text', '123', endNode.nodeValue);
    assertEquals('Endoffset should be 3', 3, selRange.getEndOffset());
  } else {
    assertEquals('Endnode should be span', spanElem, endNode);
    assertEquals('Endoffset should be 2', 2, selRange.getEndOffset());
  }
}

function testRangeEndingBeforeBR() {
  dynamic.innerHTML = '<span id="a">123<br>456</span>';
  var spanElem = goog.dom.getElement('a');
  var range =
      goog.dom.browserrange.createRangeFromNodes(spanElem, 0, spanElem, 1);
  var htmlText = range.getValidHtml().toLowerCase();
  assertNotContains('Should not include BR in HTML.', 'br', htmlText);
  assertEquals('Should have correct text.', '123', range.getText());
  range.select();

  var selRange = goog.dom.Range.createFromWindow();
  var startNode = selRange.getStartNode();
  if (goog.userAgent.GECKO || goog.userAgent.EDGE ||
      (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9))) {
    assertEquals('Start node should be span', spanElem, startNode);
  } else {
    assertEquals('Startnode should have text:123', '123', startNode.nodeValue);
  }
  assertEquals('Startoffset should be 0', 0, selRange.getStartOffset());
  var endNode = selRange.getEndNode();
  if (goog.userAgent.GECKO || goog.userAgent.EDGE ||
      (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9))) {
    assertEquals('Endnode should be span', spanElem, endNode);
    assertEquals('Endoffset should be 1', 1, selRange.getEndOffset());
  } else {
    assertEquals('Endnode should have text:123', '123', endNode.nodeValue);
    assertEquals('Endoffset should be 3', 3, selRange.getEndOffset());
  }
}

function testRangeStartingWithBR() {
  dynamic.innerHTML = '<span id="a">123<br>456</span>';
  var spanElem = goog.dom.getElement('a');
  var range =
      goog.dom.browserrange.createRangeFromNodes(spanElem, 1, spanElem, 3);
  var htmlText = range.getValidHtml().toLowerCase();
  assertContains('Should include BR in HTML.', 'br', htmlText);
  // Firefox returns '456' as the range text while IE returns '\r\n456'.
  // Therefore skipping the text check.

  range.select();
  var selRange = goog.dom.Range.createFromWindow();
  var startNode = selRange.getStartNode();
  assertEquals('Start node should be span', spanElem, startNode);
  assertEquals('Startoffset should be 1', 1, selRange.getStartOffset());
  var endNode = selRange.getEndNode();
  if (goog.userAgent.GECKO || goog.userAgent.EDGE ||
      (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9))) {
    assertEquals('Endnode should be span', spanElem, endNode);
    assertEquals('Endoffset should be 3', 3, selRange.getEndOffset());
  } else {
    assertEquals('Endnode should have text:456', '456', endNode.nodeValue);
    assertEquals('Endoffset should be 3', 3, selRange.getEndOffset());
  }
}

function testRangeStartingAfterBR() {
  dynamic.innerHTML = '<span id="a">123<br>4567</span>';
  var spanElem = goog.dom.getElement('a');
  var range =
      goog.dom.browserrange.createRangeFromNodes(spanElem, 2, spanElem, 3);
  var htmlText = range.getValidHtml().toLowerCase();
  assertNotContains('Should not include BR in HTML.', 'br', htmlText);
  assertEquals('Should have correct text.', '4567', range.getText());

  range.select();

  var selRange = goog.dom.Range.createFromWindow();
  var startNode = selRange.getStartNode();
  if (goog.userAgent.GECKO || goog.userAgent.EDGE ||
      (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9))) {
    assertEquals('Start node should be span', spanElem, startNode);
    assertEquals('Startoffset should be 2', 2, selRange.getStartOffset());
  } else {
    assertEquals(
        'Startnode should have text:4567', '4567', startNode.nodeValue);
    assertEquals('Startoffset should be 0', 0, selRange.getStartOffset());
  }
  var endNode = selRange.getEndNode();
  if (goog.userAgent.GECKO || goog.userAgent.EDGE ||
      (goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9))) {
    assertEquals('Endnode should be span', spanElem, endNode);
    assertEquals('Endoffset should be 3', 3, selRange.getEndOffset());
  } else {
    assertEquals('Endnode should have text:4567', '4567', endNode.nodeValue);
    assertEquals('Endoffset should be 4', 4, selRange.getEndOffset());
  }
}

function testCollapsedRangeBeforeBR() {
  dynamic.innerHTML = '<span id="a">123<br>456</span>';
  var range = goog.dom.browserrange.createRangeFromNodes(
      goog.dom.getElement('a'), 1, goog.dom.getElement('a'), 1);
  // Firefox returns <span id="a"></span> as the range HTML while IE returns
  // empty string. Therefore skipping the HTML check.
  assertEquals('Should have no text.', '', range.getText());
}

function testCollapsedRangeAfterBR() {
  dynamic.innerHTML = '<span id="a">123<br>456</span>';
  var range = goog.dom.browserrange.createRangeFromNodes(
      goog.dom.getElement('a'), 2, goog.dom.getElement('a'), 2);
  // Firefox returns <span id="a"></span> as the range HTML while IE returns
  // empty string. Therefore skipping the HTML check.
  assertEquals('Should have no text.', '', range.getText());
}

function testCompareBrowserRangeEndpoints() {
  var outer = goog.dom.getElement('outer');
  var inner = goog.dom.getElement('inner');
  var range_outer = goog.dom.browserrange.createRangeFromNodeContents(outer);
  var range_inner = goog.dom.browserrange.createRangeFromNodeContents(inner);

  assertEquals(
      'The start of the inner selection should be after the outer.', 1,
      range_inner.compareBrowserRangeEndpoints(
          range_outer.getBrowserRange(), goog.dom.RangeEndpoint.START,
          goog.dom.RangeEndpoint.START));

  assertEquals(
      "The start of the inner selection should be before the outer's end.", -1,
      range_inner.compareBrowserRangeEndpoints(
          range_outer.getBrowserRange(), goog.dom.RangeEndpoint.START,
          goog.dom.RangeEndpoint.END));

  assertEquals(
      "The end of the inner selection should be after the outer's start.", 1,
      range_inner.compareBrowserRangeEndpoints(
          range_outer.getBrowserRange(), goog.dom.RangeEndpoint.END,
          goog.dom.RangeEndpoint.START));

  assertEquals(
      "The end of the inner selection should be before the outer's end.", -1,
      range_inner.compareBrowserRangeEndpoints(
          range_outer.getBrowserRange(), goog.dom.RangeEndpoint.END,
          goog.dom.RangeEndpoint.END));
}


/**
 * Regression test for a bug in IeRange.insertNode_ where if the node to be
 * inserted was not an element (e.g. a text node), it would clone the node
 * in the inserting process but return the original node instead of the newly
 * created and inserted node.
 */
function testInsertNodeNonElement() {
  goog.dom.setTextContent(dynamic, 'beforeafter');
  var range = goog.dom.browserrange.createRangeFromNodes(
      dynamic.firstChild, 6, dynamic.firstChild, 6);
  var newNode = goog.dom.createTextNode('INSERTED');
  var inserted = range.insertNode(newNode, false);

  assertEquals(
      'Text should be inserted between "before" and "after"',
      'beforeINSERTEDafter', goog.dom.getRawTextContent(dynamic));
  assertEquals(
      'Node returned by insertNode() should be a child of the div' +
          ' containing the text',
      dynamic, inserted.parentNode);
}

function testSelectOverwritesOldSelection() {
  goog.dom.browserrange.createRangeFromNodes(test1, 0, test1, 1).select();
  goog.dom.browserrange.createRangeFromNodes(test2, 0, test2, 1).select();
  assertEquals(
      'The old selection must be replaced with the new one', 'abc',
      goog.dom.Range.createFromWindow().getText());
}

// Following testcase is special for IE. The comparison of ranges created in
// testcases with a range over empty span using native inRange fails. So the
// fallback mechanism is needed.
function testGetContainerInTextNodesAroundEmptySpan() {
  dynamic.innerHTML = 'abc<span></span>def';
  var abc = dynamic.firstChild;
  var def = dynamic.lastChild;

  var range;
  range = goog.dom.browserrange.createRangeFromNodes(abc, 1, abc, 1);
  assertEquals(
      'textNode abc should be the range container', abc, range.getContainer());
  assertEquals(
      'textNode abc should be the range start node', abc, range.getStartNode());
  assertEquals(
      'textNode abc should be the range end node', abc, range.getEndNode());

  range = goog.dom.browserrange.createRangeFromNodes(def, 1, def, 1);
  assertEquals(
      'textNode def should be the range container', def, range.getContainer());
  assertEquals(
      'textNode def should be the range start node', def, range.getStartNode());
  assertEquals(
      'textNode def should be the range end node', def, range.getEndNode());
}
