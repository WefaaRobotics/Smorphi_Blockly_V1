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

goog.provide('goog.editor.rangeTest');
goog.setTestOnly('goog.editor.rangeTest');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.range');
goog.require('goog.editor.range.Point');
goog.require('goog.string');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var savedHtml;
var $;

function setUpPage() {
  $ = goog.dom.getElement;
}

function setUp() {
  savedHtml = $('root').innerHTML;
}

function tearDown() {
  $('root').innerHTML = savedHtml;
}

function testNoNarrow() {
  var def = $('def');
  var jkl = $('jkl');
  var range =
      goog.dom.Range.createFromNodes(def.firstChild, 1, jkl.firstChild, 2);

  range = goog.editor.range.narrow(range, $('parentNode'));
  goog.testing.dom.assertRangeEquals(
      def.firstChild, 1, jkl.firstChild, 2, range);
}

function testNarrowAtEndEdge() {
  var def = $('def');
  var jkl = $('jkl');
  var range =
      goog.dom.Range.createFromNodes(def.firstChild, 1, jkl.firstChild, 2);

  range = goog.editor.range.narrow(range, def);
  goog.testing.dom.assertRangeEquals(
      def.firstChild, 1, def.firstChild, 3, range);
}

function testNarrowAtStartEdge() {
  var def = $('def');
  var jkl = $('jkl');
  var range =
      goog.dom.Range.createFromNodes(def.firstChild, 1, jkl.firstChild, 2);

  range = goog.editor.range.narrow(range, jkl);

  goog.testing.dom.assertRangeEquals(
      jkl.firstChild, 0, jkl.firstChild, 2, range);
}

function testNarrowOutsideElement() {
  var def = $('def');
  var jkl = $('jkl');
  var range =
      goog.dom.Range.createFromNodes(def.firstChild, 1, jkl.firstChild, 2);

  range = goog.editor.range.narrow(range, $('pqr'));
  assertNull(range);
}

function testNoExpand() {
  var div = $('parentNode');
  div.innerHTML = '<div>longword</div>';
  // Select "ongwo" and make sure we don't expand since this is not
  // a full container.
  var textNode = div.firstChild.firstChild;
  var range = goog.dom.Range.createFromNodes(textNode, 1, textNode, 6);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(textNode, 1, textNode, 6, range);
}

function testSimpleExpand() {
  var div = $('parentNode');
  div.innerHTML = '<div>longword</div>foo';
  // Select "longword" and make sure we do expand to include the div since
  // the full container text is selected.
  var textNode = div.firstChild.firstChild;
  var range = goog.dom.Range.createFromNodes(textNode, 0, textNode, 8);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(div, 0, div, 1, range);

  // Select "foo" and make sure we expand out to the parent div.
  var fooNode = div.lastChild;
  range = goog.dom.Range.createFromNodes(fooNode, 0, fooNode, 3);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(div, 1, div, 2, range);
}

function testDoubleExpand() {
  var div = $('parentNode');
  div.innerHTML = '<div><span>longword</span></div>foo';
  // Select "longword" and make sure we do expand to include the span
  // and the div since both of their full contents are selected.
  var textNode = div.firstChild.firstChild.firstChild;
  var range = goog.dom.Range.createFromNodes(textNode, 0, textNode, 8);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(div, 0, div, 1, range);

  // Same visible position, different dom position.
  // Start in text node, end in span.
  range = goog.dom.Range.createFromNodes(textNode, 0, textNode.parentNode, 1);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(div, 0, div, 1, range);
}

function testMultipleChildrenExpand() {
  var div = $('parentNode');
  div.innerHTML = '<ol><li>one</li><li>two</li><li>three</li></ol>';
  // Select "two" and make sure we expand to the li, but not the ol.
  var li = div.firstChild.childNodes[1];
  var textNode = li.firstChild;
  var range = goog.dom.Range.createFromNodes(textNode, 0, textNode, 3);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(li.parentNode, 1, li.parentNode, 2, range);

  // Make the same visible selection, only slightly different dom position.
  // Select starting from the text node, but ending in the li.
  range = goog.dom.Range.createFromNodes(textNode, 0, li, 1);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(li.parentNode, 1, li.parentNode, 2, range);
}

function testSimpleDifferentContainersExpand() {
  var div = $('parentNode');
  div.innerHTML = '<ol><li>1</li><li><b>bold</b><i>italic</i></li></ol>';
  // Select all of "bold" and "italic" at the text node level, and
  // make sure we expand to the li.
  var li = div.firstChild.childNodes[1];
  var boldNode = li.childNodes[0];
  var italicNode = li.childNodes[1];
  var range = goog.dom.Range.createFromNodes(
      boldNode.firstChild, 0, italicNode.firstChild, 6);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(li.parentNode, 1, li.parentNode, 2, range);

  // Make the same visible selection, only slightly different dom position.
  // Select "bold" at the b node level and "italic" at the text node level.
  range = goog.dom.Range.createFromNodes(boldNode, 0, italicNode.firstChild, 6);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(li.parentNode, 1, li.parentNode, 2, range);
}

function testSimpleDifferentContainersSmallExpand() {
  var div = $('parentNode');
  div.innerHTML = '<ol><li>1</li><li><b>bold</b><i>italic</i>' +
      '<u>under</u></li></ol>';
  // Select all of "bold" and "italic", but we can't expand to the
  // entire li since we didn't select "under".
  var li = div.firstChild.childNodes[1];
  var boldNode = li.childNodes[0];
  var italicNode = li.childNodes[1];
  var range = goog.dom.Range.createFromNodes(
      boldNode.firstChild, 0, italicNode.firstChild, 6);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(li, 0, li, 2, range);

  // Same visible position, different dom position.
  // Select "bold" starting in text node, "italic" at i node.
  range = goog.dom.Range.createFromNodes(boldNode.firstChild, 0, italicNode, 1);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(li, 0, li, 2, range);
}

function testEmbeddedDifferentContainersExpand() {
  var div = $('parentNode');
  div.innerHTML = '<div><b><i>italic</i>after</b><u>under</u></div>foo';
  // Select "italic" "after" "under", should expand all the way to parent.
  var boldNode = div.firstChild.childNodes[0];
  var italicNode = boldNode.childNodes[0];
  var underNode = div.firstChild.childNodes[1];
  var range = goog.dom.Range.createFromNodes(
      italicNode.firstChild, 0, underNode.firstChild, 5);

  range = goog.editor.range.expand(range);
  goog.testing.dom.assertRangeEquals(div, 0, div, 1, range);
}

function testReverseSimpleExpand() {
  var div = $('parentNode');
  div.innerHTML = '<div>longword</div>foo';
  // Select "longword" and make sure we do expand to include the div since
  // the full container text is selected.
  var textNode = div.firstChild.firstChild;
  var range = goog.dom.Range.createFromNodes(textNode, 8, textNode, 0);

  range = goog.editor.range.expand(range);

  goog.testing.dom.assertRangeEquals(div, 0, div, 1, range);
}

function testExpandWithStopNode() {
  var div = $('parentNode');
  div.innerHTML = '<div><span>word</span></div>foo';
  // Select "word".
  var span = div.firstChild.firstChild;
  var textNode = span.firstChild;
  var range = goog.dom.Range.createFromNodes(textNode, 0, textNode, 4);

  range = goog.editor.range.expand(range);

  goog.testing.dom.assertRangeEquals(div, 0, div, 1, range);

  // Same selection, but force stop at the span.
  range = goog.dom.Range.createFromNodes(textNode, 0, textNode, 4);

  range = goog.editor.range.expand(range, span);

  goog.testing.dom.assertRangeEquals(span, 0, span, 1, range);
}

// Ojan didn't believe this code worked, this was the case he
// thought was broken.  Keeping just as a regression test.
function testOjanCase() {
  var div = $('parentNode');
  div.innerHTML = '<em><i><b>foo</b>bar</i></em>';
  // Select "foo", at text node level.
  var iNode = div.firstChild.firstChild;
  var textNode = iNode.firstChild.firstChild;
  var range = goog.dom.Range.createFromNodes(textNode, 0, textNode, 3);

  range = goog.editor.range.expand(range);

  goog.testing.dom.assertRangeEquals(iNode, 0, iNode, 1, range);

  // Same selection, at b node level.
  range =
      goog.dom.Range.createFromNodes(iNode.firstChild, 0, iNode.firstChild, 1);
  range = goog.editor.range.expand(range);

  goog.testing.dom.assertRangeEquals(iNode, 0, iNode, 1, range);
}

function testPlaceCursorNextToLeft() {
  var div = $('parentNode');
  div.innerHTML = 'foo<div id="bar">bar</div>baz';
  var node = $('bar');
  var range = goog.editor.range.placeCursorNextTo(node, true);

  var expose = goog.testing.dom.exposeNode;
  assertEquals(
      'Selection should be to the left of the node ' + expose(node) + ',' +
          expose(range.getStartNode().nextSibling),
      node, range.getStartNode().nextSibling);
  assertEquals('Selection should be collapsed', true, range.isCollapsed());
}


function testPlaceCursorNextToRight() {
  var div = $('parentNode');
  div.innerHTML = 'foo<div id="bar">bar</div>baz';
  var node = $('bar');
  var range = goog.editor.range.placeCursorNextTo(node, false);

  assertEquals(
      'Selection should be to the right of the node', node,
      range.getStartNode().previousSibling);
  assertEquals('Selection should be collapsed', true, range.isCollapsed());
}

function testPlaceCursorNextTo_rightOfLineBreak() {
  var div = $('parentNode');
  div.innerHTML = '<div contentEditable="true">hhhh<br />h</div>';
  var children = div.firstChild.childNodes;
  assertEquals(3, children.length);
  var node = children[1];
  var range = goog.editor.range.placeCursorNextTo(node, false);
  assertEquals(node.nextSibling, range.getStartNode());
}

function testPlaceCursorNextTo_leftOfHr() {
  var div = $('parentNode');
  div.innerHTML = '<hr />aaa';
  var children = div.childNodes;
  assertEquals(2, children.length);
  var node = children[0];
  var range = goog.editor.range.placeCursorNextTo(node, true);

  assertEquals(div, range.getStartNode());
  assertEquals(0, range.getStartOffset());
}

function testPlaceCursorNextTo_rightOfHr() {
  var div = $('parentNode');
  div.innerHTML = 'aaa<hr>';
  var children = div.childNodes;
  assertEquals(2, children.length);
  var node = children[1];
  var range = goog.editor.range.placeCursorNextTo(node, false);

  assertEquals(div, range.getStartNode());
  assertEquals(2, range.getStartOffset());
}

function testPlaceCursorNextTo_rightOfImg() {
  var div = $('parentNode');
  div.innerHTML =
      'aaa<img src="https://www.google.com/images/srpr/logo3w.png">bbb';
  var children = div.childNodes;
  assertEquals(3, children.length);
  var imgNode = children[1];
  var range = goog.editor.range.placeCursorNextTo(imgNode, false);

  assertEquals(
      'range node should be the right sibling of img tag', children[2],
      range.getStartNode());
  assertEquals(0, range.getStartOffset());
}

function testPlaceCursorNextTo_rightOfImgAtEnd() {
  var div = $('parentNode');
  div.innerHTML =
      'aaa<img src="https://www.google.com/images/srpr/logo3w.png">';
  var children = div.childNodes;
  assertEquals(2, children.length);
  var imgNode = children[1];
  var range = goog.editor.range.placeCursorNextTo(imgNode, false);

  assertEquals(
      'range node should be the parent of img', div, range.getStartNode());
  assertEquals(
      'offset should be right after the img tag', 2, range.getStartOffset());
}

function testPlaceCursorNextTo_leftOfImg() {
  var div = $('parentNode');
  div.innerHTML =
      '<img src="https://www.google.com/images/srpr/logo3w.png">xxx';
  var children = div.childNodes;
  assertEquals(2, children.length);
  var imgNode = children[0];
  var range = goog.editor.range.placeCursorNextTo(imgNode, true);

  assertEquals(
      'range node should be the parent of img', div, range.getStartNode());
  assertEquals('offset should point to the img tag', 0, range.getStartOffset());
}

function testPlaceCursorNextTo_rightOfFirstOfTwoImgTags() {
  var div = $('parentNode');
  div.innerHTML =
      'aaa<img src="https://www.google.com/images/srpr/logo3w.png">' +
      '<img src="https://www.google.com/images/srpr/logo3w.png">';
  var children = div.childNodes;
  assertEquals(3, children.length);
  var imgNode = children[1];  // First of two IMG nodes
  var range = goog.editor.range.placeCursorNextTo(imgNode, false);

  assertEquals(
      'range node should be the parent of img instead of ' +
          'node with innerHTML=' + range.getStartNode().innerHTML,
      div, range.getStartNode());
  assertEquals(
      'offset should be right after the img tag', 2, range.getStartOffset());
}

function testGetDeepEndPoint() {
  var div = $('parentNode');
  var def = $('def');
  var jkl = $('jkl');

  assertPointEquals(
      div.firstChild, 0, goog.editor.range.getDeepEndPoint(
                             goog.dom.Range.createFromNodeContents(div), true));
  assertPointEquals(
      div.lastChild, div.lastChild.length,
      goog.editor.range.getDeepEndPoint(
          goog.dom.Range.createFromNodeContents(div), false));

  assertPointEquals(
      def.firstChild, 0, goog.editor.range.getDeepEndPoint(
                             goog.dom.Range.createCaret(div, 1), true));
  assertPointEquals(
      def.nextSibling, 0, goog.editor.range.getDeepEndPoint(
                              goog.dom.Range.createCaret(div, 2), true));
}

function testNormalizeOnNormalizedDom() {
  var defText = $('def').firstChild;
  var jklText = $('jkl').firstChild;
  var range = goog.dom.Range.createFromNodes(defText, 1, jklText, 2);

  var newRange = normalizeBody(range);
  goog.testing.dom.assertRangeEquals(defText, 1, jklText, 2, newRange);
}

function testDeepPointFindingOnNormalizedDom() {
  var def = $('def');
  var jkl = $('jkl');
  var range = goog.dom.Range.createFromNodes(def, 0, jkl, 1);

  var newRange = normalizeBody(range);

  // Make sure that newRange is measured relative to the text nodes,
  // not the DIV elements.
  goog.testing.dom.assertRangeEquals(
      def.firstChild, 0, jkl.firstChild, 3, newRange);
}

function testNormalizeOnVeryFragmentedDom() {
  var defText = $('def').firstChild;
  var jklText = $('jkl').firstChild;
  var range = goog.dom.Range.createFromNodes(defText, 1, jklText, 2);

  // Fragment the DOM a bunch.
  fragmentText(defText);
  fragmentText(jklText);

  var newRange = normalizeBody(range);

  // our old text nodes may not be valid anymore. find new ones.
  defText = $('def').firstChild;
  jklText = $('jkl').firstChild;

  goog.testing.dom.assertRangeEquals(defText, 1, jklText, 2, newRange);
}

function testNormalizeOnDivWithEmptyTextNodes() {
  var emptyDiv = $('normalizeTest-with-empty-text-nodes');

  // Append empty text nodes to the emptyDiv.
  var tnode1 = goog.dom.createTextNode('');
  var tnode2 = goog.dom.createTextNode('');
  var tnode3 = goog.dom.createTextNode('');

  goog.dom.appendChild(emptyDiv, tnode1);
  goog.dom.appendChild(emptyDiv, tnode2);
  goog.dom.appendChild(emptyDiv, tnode3);

  var range = goog.dom.Range.createFromNodes(emptyDiv, 1, emptyDiv, 2);

  // Cannot use document.body.normalize() as it fails to normalize the div
  // (in IE) if it has nothing but empty text nodes.
  var newRange = goog.editor.range.rangePreservingNormalize(emptyDiv, range);

  if (goog.userAgent.GECKO &&
      goog.string.compareVersions(goog.userAgent.VERSION, '1.9') == -1) {
    // In FF2, node.normalize() leaves an empty textNode in the div, unlike
    // other browsers where the div is left with no children.
    goog.testing.dom.assertRangeEquals(
        emptyDiv.firstChild, 0, emptyDiv.firstChild, 0, newRange);
  } else {
    goog.testing.dom.assertRangeEquals(emptyDiv, 0, emptyDiv, 0, newRange);
  }
}

function testRangeCreatedInVeryFragmentedDom() {
  var def = $('def');
  var defText = def.firstChild;
  var jkl = $('jkl');
  var jklText = jkl.firstChild;

  // Fragment the DOM a bunch.
  fragmentText(defText);
  fragmentText(jklText);

  // Notice that there are two empty text nodes at the beginning of each
  // fragmented node.
  var range = goog.dom.Range.createFromNodes(def, 3, jkl, 4);

  var newRange = normalizeBody(range);

  // our old text nodes may not be valid anymore. find new ones.
  defText = $('def').firstChild;
  jklText = $('jkl').firstChild;
  goog.testing.dom.assertRangeEquals(defText, 1, jklText, 2, newRange);
}

function testNormalizeInFragmentedDomWithPreviousSiblings() {
  var ghiText = $('def').nextSibling;
  var mnoText = $('jkl').nextSibling;
  var range = goog.dom.Range.createFromNodes(ghiText, 1, mnoText, 2);

  // Fragment the DOM a bunch.
  fragmentText($('def').previousSibling);  // fragment abc
  fragmentText(ghiText);
  fragmentText(mnoText);

  var newRange = normalizeBody(range);

  // our old text nodes may not be valid anymore. find new ones.
  ghiText = $('def').nextSibling;
  mnoText = $('jkl').nextSibling;

  goog.testing.dom.assertRangeEquals(ghiText, 1, mnoText, 2, newRange);
}

function testRangeCreatedInFragmentedDomWithPreviousSiblings() {
  var def = $('def');
  var ghiText = $('def').nextSibling;
  var jkl = $('jkl');
  var mnoText = $('jkl').nextSibling;

  // Fragment the DOM a bunch.
  fragmentText($('def').previousSibling);  // fragment abc
  fragmentText(ghiText);
  fragmentText(mnoText);

  // Notice that there are two empty text nodes at the beginning of each
  // fragmented node.
  var root = $('parentNode');
  var range = goog.dom.Range.createFromNodes(root, 9, root, 16);

  var newRange = normalizeBody(range);

  // our old text nodes may not be valid anymore. find new ones.
  ghiText = $('def').nextSibling;
  mnoText = $('jkl').nextSibling;
  goog.testing.dom.assertRangeEquals(ghiText, 1, mnoText, 2, newRange);
}


/**
 * Branched from the tests for goog.dom.SavedCaretRange.
 */
function testSavedCaretRange() {
  var def = $('def-1');
  var jkl = $('jkl-1');

  var range =
      goog.dom.Range.createFromNodes(def.firstChild, 1, jkl.firstChild, 2);
  range.select();

  var saved = goog.editor.range.saveUsingNormalizedCarets(range);
  assertHTMLEquals(
      'd<span id="' + saved.startCaretId_ + '"></span>ef', def.innerHTML);
  assertHTMLEquals(
      'jk<span id="' + saved.endCaretId_ + '"></span>l', jkl.innerHTML);

  clearSelectionAndRestoreSaved(saved);

  var selection = goog.dom.Range.createFromWindow(window);
  def = $('def-1');
  jkl = $('jkl-1');
  assertHTMLEquals('def', def.innerHTML);
  assertHTMLEquals('jkl', jkl.innerHTML);

  // Check that everything was normalized ok.
  assertEquals(1, def.childNodes.length);
  assertEquals(1, jkl.childNodes.length);
  goog.testing.dom.assertRangeEquals(
      def.firstChild, 1, jkl.firstChild, 2, selection);
}

function testRangePreservingNormalize() {
  var parent = $('normalizeTest-4');
  var def = $('def-4');
  var jkl = $('jkl-4');
  fragmentText(def.firstChild);
  fragmentText(jkl.firstChild);

  var range = goog.dom.Range.createFromNodes(def, 3, jkl, 4);
  var oldRangeDescription = goog.testing.dom.exposeRange(range);
  range = goog.editor.range.rangePreservingNormalize(parent, range);

  // Check that everything was normalized ok.
  assertEquals(
      'def should have 1 child; range is ' +
          goog.testing.dom.exposeRange(range) + ', range was ' +
          oldRangeDescription,
      1, def.childNodes.length);
  assertEquals(
      'jkl should have 1 child; range is ' +
          goog.testing.dom.exposeRange(range) + ', range was ' +
          oldRangeDescription,
      1, jkl.childNodes.length);
  goog.testing.dom.assertRangeEquals(
      def.firstChild, 1, jkl.firstChild, 2, range);
}

function testRangePreservingNormalizeWhereEndNodePreviousSiblingIsSplit() {
  var parent = $('normalizeTest-with-br');
  var br = parent.childNodes[1];
  fragmentText(parent.firstChild);

  var range = goog.dom.Range.createFromNodes(parent, 3, br, 0);
  range = goog.editor.range.rangePreservingNormalize(parent, range);

  // Code used to throw an error here.

  assertEquals('parent should have 3 children', 3, parent.childNodes.length);
  goog.testing.dom.assertRangeEquals(parent.firstChild, 1, parent, 1, range);
}

function testRangePreservingNormalizeWhereStartNodePreviousSiblingIsSplit() {
  var parent = $('normalizeTest-with-br');
  var br = parent.childNodes[1];
  fragmentText(parent.firstChild);
  fragmentText(parent.lastChild);

  var range = goog.dom.Range.createFromNodes(br, 0, parent, 9);
  range = goog.editor.range.rangePreservingNormalize(parent, range);

  // Code used to throw an error here.

  assertEquals('parent should have 3 children', 3, parent.childNodes.length);
  goog.testing.dom.assertRangeEquals(parent, 1, parent.lastChild, 1, range);
}

function testSelectionPreservingNormalize1() {
  var parent = $('normalizeTest-2');
  var def = $('def-2');
  var jkl = $('jkl-2');
  fragmentText(def.firstChild);
  fragmentText(jkl.firstChild);

  goog.dom.Range.createFromNodes(def, 3, jkl, 4).select();
  assertFalse(goog.dom.Range.createFromWindow(window).isReversed());

  var oldRangeDescription =
      goog.testing.dom.exposeRange(goog.dom.Range.createFromWindow(window));
  goog.editor.range.selectionPreservingNormalize(parent);

  // Check that everything was normalized ok.
  var range = goog.dom.Range.createFromWindow(window);
  assertFalse(range.isReversed());

  assertEquals(
      'def should have 1 child; range is ' +
          goog.testing.dom.exposeRange(range) + ', range was ' +
          oldRangeDescription,
      1, def.childNodes.length);
  assertEquals(
      'jkl should have 1 child; range is ' +
          goog.testing.dom.exposeRange(range) + ', range was ' +
          oldRangeDescription,
      1, jkl.childNodes.length);
  goog.testing.dom.assertRangeEquals(
      def.firstChild, 1, jkl.firstChild, 2, range);
}


/**
 * Make sure that selectionPreservingNormalize doesn't explode with no
 * selection in the document.
 */
function testSelectionPreservingNormalize2() {
  var parent = $('normalizeTest-3');
  var def = $('def-3');
  var jkl = $('jkl-3');
  def.firstChild.splitText(1);
  jkl.firstChild.splitText(2);

  goog.dom.Range.clearSelection(window);
  goog.editor.range.selectionPreservingNormalize(parent);

  // Check that everything was normalized ok.
  assertEquals(1, def.childNodes.length);
  assertEquals(1, jkl.childNodes.length);
  assertFalse(goog.dom.Range.hasSelection(window));
}

function testSelectionPreservingNormalize3() {
  if (goog.userAgent.EDGE_OR_IE) {
    return;
  }
  var parent = $('normalizeTest-2');
  var def = $('def-2');
  var jkl = $('jkl-2');
  fragmentText(def.firstChild);
  fragmentText(jkl.firstChild);

  goog.dom.Range.createFromNodes(jkl, 4, def, 3).select();
  assertTrue(goog.dom.Range.createFromWindow(window).isReversed());

  var oldRangeDescription =
      goog.testing.dom.exposeRange(goog.dom.Range.createFromWindow(window));
  goog.editor.range.selectionPreservingNormalize(parent);

  // Check that everything was normalized ok.
  var range = goog.dom.Range.createFromWindow(window);
  assertTrue(range.isReversed());

  assertEquals(
      'def should have 1 child; range is ' +
          goog.testing.dom.exposeRange(range) + ', range was ' +
          oldRangeDescription,
      1, def.childNodes.length);
  assertEquals(
      'jkl should have 1 child; range is ' +
          goog.testing.dom.exposeRange(range) + ', range was ' +
          oldRangeDescription,
      1, jkl.childNodes.length);
  goog.testing.dom.assertRangeEquals(
      def.firstChild, 1, jkl.firstChild, 2, range);
}

function testSelectionPreservingNormalizeAfterPlaceCursorNextTo() {
  var parent = $('normalizeTest-with-div');
  goog.editor.range.placeCursorNextTo(parent.firstChild);
  goog.editor.range.selectionPreservingNormalize(parent);

  // Code used to throw an exception here.
}


/** Normalize the body and return the normalized range. */
function normalizeBody(range) {
  var rangeFactory = goog.editor.range.normalize(range);
  document.body.normalize();
  return rangeFactory();
}


/** Break a text node up into lots of little fragments. */
function fragmentText(text) {
  // NOTE(nicksantos): For some reason, splitText makes IE deeply
  // unhappy to the point where normalize and other normal DOM operations
  // start failing. It's a useful test for Firefox though, because different
  // versions of FireFox handle empty text nodes differently.
  // See goog.editor.BrowserFeature.
  if (goog.userAgent.IE) {
    manualSplitText(text, 2);
    manualSplitText(text, 1);
    manualSplitText(text, 0);
    manualSplitText(text, 0);
  } else {
    text.splitText(2);
    text.splitText(1);

    text.splitText(0);
    text.splitText(0);
  }
}


/**
 * Clear the selection by re-parsing the DOM. Then restore the saved
 * selection.
 * @param {goog.dom.SavedRange} saved The saved range.
 */
function clearSelectionAndRestoreSaved(saved) {
  goog.dom.Range.clearSelection(window);
  assertFalse(goog.dom.Range.hasSelection(window));
  saved.restore();
  assertTrue(goog.dom.Range.hasSelection(window));
}

function manualSplitText(node, pos) {
  var newNodeString = node.nodeValue.substr(pos);
  node.nodeValue = node.nodeValue.substr(0, pos);
  goog.dom.insertSiblingAfter(document.createTextNode(newNodeString), node);
}

function testSelectNodeStartSimple() {
  var div = $('parentNode');
  div.innerHTML = '<p>Cursor should go in here</p>';

  goog.editor.range.selectNodeStart(div);
  var range = goog.dom.Range.createFromWindow(window);
  // Gotta love browsers and their inconsistencies with selection
  // representations.  What we are trying to achieve is that when we type
  // the text will go into the P node.  In Gecko, the selection is at the start
  // of the text node, as you'd expect, but in pre-530 Webkit, it has been
  // normalized to the visible position of P:0.
  if (goog.userAgent.GECKO || goog.userAgent.IE || goog.userAgent.EDGE ||
      (goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('530'))) {
    goog.testing.dom.assertRangeEquals(
        div.firstChild.firstChild, 0, div.firstChild.firstChild, 0, range);
  } else {
    goog.testing.dom.assertRangeEquals(
        div.firstChild, 0, div.firstChild, 0, range);
  }
}

function testSelectNodeStartBr() {
  var div = $('parentNode');
  div.innerHTML = '<p><br>Cursor should go in here</p>';

  goog.editor.range.selectNodeStart(div);
  var range = goog.dom.Range.createFromWindow(window);
  // We have to skip the BR since Gecko can't render a cursor at a BR.
  goog.testing.dom.assertRangeEquals(
      div.firstChild, 0, div.firstChild, 0, range);
}

function testIsEditable() {
  var containerElement = document.getElementById('editableTest');
  // Find editable container element's index.
  var containerIndex = 0;
  var currentSibling = containerElement;
  while (currentSibling = currentSibling.previousSibling) {
    containerIndex++;
  }

  var editableContainer = goog.dom.Range.createFromNodes(
      containerElement.parentNode, containerIndex, containerElement.parentNode,
      containerIndex + 1);
  assertFalse(
      'Range containing container element not considered editable',
      goog.editor.range.isEditable(editableContainer));

  var allEditableChildren = goog.dom.Range.createFromNodes(
      containerElement, 0, containerElement,
      containerElement.childNodes.length);
  assertTrue(
      'Range of all of container element children considered editable',
      goog.editor.range.isEditable(allEditableChildren));

  var someEditableChildren =
      goog.dom.Range.createFromNodes(containerElement, 2, containerElement, 6);
  assertTrue(
      'Range of some container element children considered editable',
      goog.editor.range.isEditable(someEditableChildren));


  var mixedEditableNonEditable = goog.dom.Range.createFromNodes(
      containerElement.previousSibling, 0, containerElement, 2);
  assertFalse(
      'Range overlapping some content not considered editable',
      goog.editor.range.isEditable(mixedEditableNonEditable));
}

function testIntersectsTag() {
  var root = $('root');
  root.innerHTML =
      '<b>Bold</b><p><span><code>x</code></span></p><p>y</p><i>Italic</i>';

  // Select the whole thing.
  var range = goog.dom.Range.createFromNodeContents(root);
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.DIV));
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.B));
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.I));
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.CODE));
  assertFalse(goog.editor.range.intersectsTag(range, goog.dom.TagName.U));

  // Just select italic.
  range = goog.dom.Range.createFromNodes(root, 3, root, 4);
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.DIV));
  assertFalse(goog.editor.range.intersectsTag(range, goog.dom.TagName.B));
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.I));
  assertFalse(goog.editor.range.intersectsTag(range, goog.dom.TagName.CODE));
  assertFalse(goog.editor.range.intersectsTag(range, goog.dom.TagName.U));

  // Select "ld x y".
  range = goog.dom.Range.createFromNodes(
      root.firstChild.firstChild, 2, root.childNodes[2], 1);
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.DIV));
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.B));
  assertFalse(goog.editor.range.intersectsTag(range, goog.dom.TagName.I));
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.CODE));
  assertFalse(goog.editor.range.intersectsTag(range, goog.dom.TagName.U));

  // Select ol.
  range = goog.dom.Range.createFromNodes(
      root.firstChild.firstChild, 1, root.firstChild.firstChild, 3);
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.DIV));
  assertTrue(goog.editor.range.intersectsTag(range, goog.dom.TagName.B));
  assertFalse(goog.editor.range.intersectsTag(range, goog.dom.TagName.I));
  assertFalse(goog.editor.range.intersectsTag(range, goog.dom.TagName.CODE));
  assertFalse(goog.editor.range.intersectsTag(range, goog.dom.TagName.U));
}

function testNormalizeNode() {
  var div = goog.dom.createDom(goog.dom.TagName.DIV, null, 'a', 'b', 'c');
  assertEquals(3, div.childNodes.length);
  goog.editor.range.normalizeNode(div);
  assertEquals(1, div.childNodes.length);
  assertEquals('abc', div.firstChild.nodeValue);

  div = goog.dom.createDom(
      goog.dom.TagName.DIV, null,
      goog.dom.createDom(goog.dom.TagName.SPAN, null, '1', '2'),
      goog.dom.createTextNode(''), goog.dom.createDom(goog.dom.TagName.BR), 'b',
      'c');
  assertEquals(5, div.childNodes.length);
  assertEquals(2, div.firstChild.childNodes.length);
  goog.editor.range.normalizeNode(div);
  if (goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher(1.9) ||
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher(526)) {
    // Old Gecko and Webkit versions don't delete the empty node.
    assertEquals(4, div.childNodes.length);
  } else {
    assertEquals(3, div.childNodes.length);
  }
  assertEquals(1, div.firstChild.childNodes.length);
  assertEquals('12', div.firstChild.firstChild.nodeValue);
  assertEquals('bc', div.lastChild.nodeValue);
  assertEquals(goog.dom.TagName.BR, div.lastChild.previousSibling.tagName);
}

function testDeepestPoint() {
  var parent = $('parentNode');
  var def = $('def');

  assertEquals(def, parent.childNodes[1]);

  var deepestPoint = goog.editor.range.Point.createDeepestPoint;

  var defStartLeft = deepestPoint(parent, 1, true);
  assertPointEquals(
      def.previousSibling, def.previousSibling.nodeValue.length, defStartLeft);

  var defStartRight = deepestPoint(parent, 1, false);
  assertPointEquals(def.firstChild, 0, defStartRight);

  var defEndLeft = deepestPoint(parent, 2, true);
  assertPointEquals(
      def.firstChild, def.firstChild.nodeValue.length, defEndLeft);

  var defEndRight = deepestPoint(parent, 2, false);
  assertPointEquals(def.nextSibling, 0, defEndRight);
}

function assertPointEquals(node, offset, actualPoint) {
  assertEquals('Point has wrong node', node, actualPoint.node);
  assertEquals('Point has wrong offset', offset, actualPoint.offset);
}
