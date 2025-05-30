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

goog.provide('goog.dom.ControlRangeTest');
goog.setTestOnly('goog.dom.ControlRangeTest');

goog.require('goog.dom');
goog.require('goog.dom.ControlRange');
goog.require('goog.dom.RangeType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.TextRange');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var logo;
var table;

function setUpPage() {
  logo = goog.dom.getElement('logo');
  table = goog.dom.getElement('table');
}

function testCreateFromElement() {
  if (!goog.userAgent.IE) {
    return;
  }
  assertNotNull(
      'Control range object can be created for element',
      goog.dom.ControlRange.createFromElements(logo));
}

function testCreateFromRange() {
  if (!goog.userAgent.IE) {
    return;
  }
  var range = document.body.createControlRange();
  range.addElement(table);
  assertNotNull(
      'Control range object can be created for element',
      goog.dom.ControlRange.createFromBrowserRange(range));
}

function testSelect() {
  if (!goog.userAgent.IE || goog.userAgent.isVersionOrHigher('11')) {
    return;
  }

  var range = goog.dom.ControlRange.createFromElements(table);
  range.select();

  assertEquals(
      'Control range should be selected', 'Control', document.selection.type);
  assertEquals(
      'Control range should have length 1', 1,
      document.selection.createRange().length);
  assertEquals(
      'Control range should select table', table,
      document.selection.createRange().item(0));
}

function testControlRangeIterator() {
  if (!goog.userAgent.IE) {
    return;
  }
  var range = goog.dom.ControlRange.createFromElements(logo, table);
  // Each node is included twice - once as a start tag, once as an end.
  goog.testing.dom.assertNodesMatch(range, [
    '#logo', '#logo', '#table', '#tbody', '#tr1',   '#td11', 'a', '#td11',
    '#td12', 'b',     '#td12',  '#tr1',   '#tr2',   '#td21', 'c', '#td21',
    '#td22', 'd',     '#td22',  '#tr2',   '#tbody', '#table'
  ]);
}

function testBounds() {
  if (!goog.userAgent.IE) {
    return;
  }

  // Initialize in both orders.
  helpTestBounds(goog.dom.ControlRange.createFromElements(logo, table));
  helpTestBounds(goog.dom.ControlRange.createFromElements(table, logo));
}

function helpTestBounds(range) {
  assertEquals('Start node is logo', logo, range.getStartNode());
  assertEquals('Start offset is 0', 0, range.getStartOffset());
  assertEquals('End node is table', table, range.getEndNode());
  assertEquals('End offset is 1', 1, range.getEndOffset());
}

function testCollapse() {
  if (!goog.userAgent.IE) {
    return;
  }

  var range = goog.dom.ControlRange.createFromElements(logo, table);
  assertFalse('Not initially collapsed', range.isCollapsed());
  range.collapse();
  assertTrue('Successfully collapsed', range.isCollapsed());
}

function testGetContainer() {
  if (!goog.userAgent.IE) {
    return;
  }

  var range = goog.dom.ControlRange.createFromElements(logo);
  assertEquals(
      'Single element range is contained by itself', logo,
      range.getContainer());

  range = goog.dom.ControlRange.createFromElements(logo, table);
  assertEquals(
      'Two element range is contained by body', document.body,
      range.getContainer());
}

function testSave() {
  if (!goog.userAgent.IE) {
    return;
  }

  var range = goog.dom.ControlRange.createFromElements(logo, table);
  var savedRange = range.saveUsingDom();

  range.collapse();
  assertTrue('Successfully collapsed', range.isCollapsed());

  range = savedRange.restore();
  assertEquals(
      'Restored a control range', goog.dom.RangeType.CONTROL, range.getType());
  assertFalse('Not collapsed after restore', range.isCollapsed());
  helpTestBounds(range);
}

function testRemoveContents() {
  if (!goog.userAgent.IE) {
    return;
  }

  var img = goog.dom.createDom(goog.dom.TagName.IMG);
  img.src = logo.src;

  var div = goog.dom.getElement('test1');
  goog.dom.removeChildren(div);
  div.appendChild(img);
  assertEquals('Div has 1 child', 1, div.childNodes.length);

  var range = goog.dom.ControlRange.createFromElements(img);
  range.removeContents();
  assertEquals('Div has 0 children', 0, div.childNodes.length);
  assertTrue('Range is collapsed', range.isCollapsed());
}

function testReplaceContents() {
  // Test a control range.
  if (!goog.userAgent.IE) {
    return;
  }

  var outer = goog.dom.getElement('test1');
  outer.innerHTML = '<div contentEditable="true">' +
      'Hello <input type="text" value="World">' +
      '</div>';
  range = goog.dom.ControlRange.createFromElements(
      outer.getElementsByTagName(goog.dom.TagName.INPUT)[0]);
  goog.dom.ControlRange.createFromElements(table);
  range.replaceContentsWithNode(goog.dom.createTextNode('World'));
  assertEquals('Hello World', outer.firstChild.innerHTML);
}

function testContainsRange() {
  if (!goog.userAgent.IE) {
    return;
  }

  var table2 = goog.dom.getElement('table2');
  var table2td = goog.dom.getElement('table2td');
  var logo2 = goog.dom.getElement('logo2');

  var range = goog.dom.ControlRange.createFromElements(logo, table);
  var range2 = goog.dom.ControlRange.createFromElements(logo);
  assertTrue(
      'Control range contains the other control range',
      range.containsRange(range2));
  assertTrue(
      'Control range partially contains the other control range',
      range2.containsRange(range, true));

  range2 = goog.dom.ControlRange.createFromElements(table2);
  assertFalse(
      'Control range does not contain the other control range',
      range.containsRange(range2));

  range = goog.dom.ControlRange.createFromElements(table2);
  range2 = goog.dom.TextRange.createFromNodeContents(table2td);
  assertTrue('Control range contains text range', range.containsRange(range2));

  range2 = goog.dom.TextRange.createFromNodeContents(table);
  assertFalse(
      'Control range does not contain text range', range.containsRange(range2));

  range = goog.dom.ControlRange.createFromElements(logo2);
  range2 = goog.dom.TextRange.createFromNodeContents(table2);
  assertFalse(
      'Control range does not fully contain text range',
      range.containsRange(range2, false));

  range2 = goog.dom.ControlRange.createFromElements(table2);
  assertTrue(
      'Control range contains the other control range (2)',
      range2.containsRange(range));
}

function testCloneRange() {
  if (!goog.userAgent.IE) {
    return;
  }
  var range = goog.dom.ControlRange.createFromElements(logo);
  assertNotNull('Control range object created for element', range);

  var cloneRange = range.clone();
  assertNotNull('Cloned control range object', cloneRange);
  assertArrayEquals(
      'Control range and clone have same elements', range.getElements(),
      cloneRange.getElements());
}
