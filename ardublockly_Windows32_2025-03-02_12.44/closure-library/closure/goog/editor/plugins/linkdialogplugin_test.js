// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.editor.plugins.LinkDialogTest');
goog.setTestOnly('goog.ui.editor.plugins.LinkDialogTest');

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
goog.require('goog.editor.Link');
goog.require('goog.editor.plugins.LinkDialogPlugin');
goog.require('goog.string');
goog.require('goog.string.Unicode');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.editor.FieldMock');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.editor.dom');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');
goog.require('goog.ui.editor.AbstractDialog');
goog.require('goog.ui.editor.LinkDialog');
goog.require('goog.userAgent');

var plugin;
var anchorElem;
var extraAnchors;
var isNew;
var testDiv;

var mockCtrl;
var mockField;
var mockLink;
var mockAlert;

var OLD_LINK_TEXT = 'old text';
var OLD_LINK_URL = 'http://old.url/';
var NEW_LINK_TEXT = 'My Link Text';
var NEW_LINK_URL = 'http://my.link/url/';

var fieldElem;
var fieldObj;
var linkObj;

function setUp() {
  testDiv = goog.dom.getDocument().getElementById('test');
  goog.dom.setTextContent(testDiv, 'Some preceeding text');

  anchorElem = goog.dom.createElement(goog.dom.TagName.A);
  anchorElem.href = 'http://www.google.com/';
  goog.dom.setTextContent(anchorElem, 'anchor text');
  goog.dom.appendChild(testDiv, anchorElem);
  extraAnchors = [];

  mockCtrl = new goog.testing.MockControl();
  mockField = new goog.testing.editor.FieldMock();
  mockCtrl.addMock(mockField);
  mockLink = mockCtrl.createLooseMock(goog.editor.Link);
  mockAlert = mockCtrl.createGlobalFunctionMock('alert');

  isNew = false;
  mockLink.isNew().$anyTimes().$does(function() { return isNew; });
  mockLink
      .setTextAndUrl(
          goog.testing.mockmatchers.isString,
          goog.testing.mockmatchers.isString)
      .$anyTimes()
      .$does(function(text, url) {
        anchorElem.innerHTML = text;
        anchorElem.href = url;
      });
  mockLink.getAnchor().$anyTimes().$returns(anchorElem);
  mockLink.getExtraAnchors().$anyTimes().$returns(extraAnchors);
}

function tearDown() {
  plugin.dispose();
  tearDownRealEditableField();
  goog.dom.removeChildren(testDiv);
  mockCtrl.$tearDown();
}

function setUpAnchor(text, href, opt_isNew, opt_target, opt_rel) {
  setUpGivenAnchor(anchorElem, text, href, opt_isNew, opt_target, opt_rel);
}

function setUpGivenAnchor(anchor, text, href, opt_isNew, opt_target, opt_rel) {
  anchor.innerHTML = text;
  anchor.href = href;
  isNew = !!opt_isNew;
  if (opt_target) {
    anchor.target = opt_target;
  }
  if (opt_rel) {
    anchor.rel = opt_rel;
  }
}


/**
 * Tests that the plugin's dialog is properly created.
 */
function testCreateDialog() {
  // Note: this tests simply creating the dialog because that's the only
  // functionality added to this class. Opening or closing effects (editing
  // the actual link) is tested in linkdialog_test.html, but should be moved
  // here if that functionality gets refactored from the dialog to the plugin.
  mockCtrl.$replayAll();

  plugin = new goog.editor.plugins.LinkDialogPlugin();
  plugin.registerFieldObject(mockField);

  var dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);
  assertTrue(
      'Dialog should be of type goog.ui.editor.LinkDialog',
      dialog instanceof goog.ui.editor.LinkDialog);

  mockCtrl.$verifyAll();
}


/**
 * Tests that when the OK event fires the link is properly updated.
 */
function testOk() {
  mockLink.placeCursorRightOf();
  mockField.dispatchSelectionChangeEvent();
  mockField.dispatchChange();
  mockField.focus();
  mockCtrl.$replayAll();

  setUpAnchor(OLD_LINK_TEXT, OLD_LINK_URL);
  plugin = new goog.editor.plugins.LinkDialogPlugin();
  plugin.registerFieldObject(mockField);
  var dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);

  // Mock of execCommand + clicking OK without actually opening the dialog.
  plugin.currentLink_ = mockLink;
  dialog.dispatchEvent(
      new goog.ui.editor.LinkDialog.OkEvent(NEW_LINK_TEXT, NEW_LINK_URL));

  assertEquals('Display text incorrect', NEW_LINK_TEXT, anchorElem.innerHTML);
  assertEquals('Anchor element href incorrect', NEW_LINK_URL, anchorElem.href);

  mockCtrl.$verifyAll();
}


/**
 * Tests that when the Cancel event fires the link is unchanged.
 */
function testCancel() {
  mockCtrl.$replayAll();

  setUpAnchor(OLD_LINK_TEXT, OLD_LINK_URL);
  plugin = new goog.editor.plugins.LinkDialogPlugin();
  plugin.registerFieldObject(mockField);
  var dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);

  // Mock of execCommand + cancel without actually opening the dialog.
  plugin.currentLink_ = mockLink;
  dialog.dispatchEvent(goog.ui.editor.AbstractDialog.EventType.CANCEL);

  assertEquals(
      'Display text should not be changed', OLD_LINK_TEXT,
      anchorElem.innerHTML);
  assertEquals(
      'Anchor element href should not be changed', OLD_LINK_URL,
      anchorElem.href);

  mockCtrl.$verifyAll();
}


/**
 * Tests that when the Cancel event fires for a new link it gets removed.
 */
function testCancelNew() {
  mockField.dispatchChange();  // Should be fired because link was removed.
  mockCtrl.$replayAll();

  setUpAnchor(OLD_LINK_TEXT, OLD_LINK_URL, true);
  var prevSib = anchorElem.previousSibling;
  plugin = new goog.editor.plugins.LinkDialogPlugin();
  plugin.registerFieldObject(mockField);
  var dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);

  // Mock of execCommand + cancel without actually opening the dialog.
  plugin.currentLink_ = mockLink;
  dialog.dispatchEvent(goog.ui.editor.AbstractDialog.EventType.CANCEL);

  assertNotEquals(
      'Anchor element should be removed from document body', testDiv,
      anchorElem.parentNode);
  var newElem = prevSib.nextSibling;
  assertEquals(
      'Link should be replaced by text node', goog.dom.NodeType.TEXT,
      newElem.nodeType);
  assertEquals(
      'Original text should be left behind', OLD_LINK_TEXT, newElem.nodeValue);

  mockCtrl.$verifyAll();
}


/**
 * Tests that when the Cancel event fires for a new link it gets removed.
 */
function testCancelNewMultiple() {
  mockField.dispatchChange();  // Should be fired because link was removed.
  mockCtrl.$replayAll();

  var anchorElem1 = anchorElem;
  var parent1 = goog.dom.createDom(goog.dom.TagName.DIV, null, anchorElem1);
  goog.dom.appendChild(testDiv, parent1);
  setUpGivenAnchor(anchorElem1, OLD_LINK_TEXT + '1', OLD_LINK_URL + '1', true);

  anchorElem2 = goog.dom.createDom(goog.dom.TagName.A);
  var parent2 = goog.dom.createDom(goog.dom.TagName.DIV, null, anchorElem2);
  goog.dom.appendChild(testDiv, parent2);
  setUpGivenAnchor(anchorElem2, OLD_LINK_TEXT + '2', OLD_LINK_URL + '2', true);
  extraAnchors.push(anchorElem2);

  anchorElem3 = goog.dom.createDom(goog.dom.TagName.A);
  var parent3 = goog.dom.createDom(goog.dom.TagName.DIV, null, anchorElem3);
  goog.dom.appendChild(testDiv, parent3);
  setUpGivenAnchor(anchorElem3, OLD_LINK_TEXT + '3', OLD_LINK_URL + '3', true);
  extraAnchors.push(anchorElem3);

  plugin = new goog.editor.plugins.LinkDialogPlugin();
  plugin.registerFieldObject(mockField);
  var dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);

  // Mock of execCommand + cancel without actually opening the dialog.
  plugin.currentLink_ = mockLink;
  dialog.dispatchEvent(goog.ui.editor.AbstractDialog.EventType.CANCEL);

  assertNotEquals(
      'Anchor 1 element should be removed from document body', parent1,
      anchorElem1.parentNode);
  assertNotEquals(
      'Anchor 2 element should be removed from document body', parent2,
      anchorElem2.parentNode);
  assertNotEquals(
      'Anchor 3 element should be removed from document body', parent3,
      anchorElem3.parentNode);

  assertEquals(
      'Link 1 should be replaced by text node', goog.dom.NodeType.TEXT,
      parent1.firstChild.nodeType);
  assertEquals(
      'Link 2 should be replaced by text node', goog.dom.NodeType.TEXT,
      parent2.firstChild.nodeType);
  assertEquals(
      'Link 3 should be replaced by text node', goog.dom.NodeType.TEXT,
      parent3.firstChild.nodeType);

  assertEquals(
      'Original text 1 should be left behind', OLD_LINK_TEXT + '1',
      parent1.firstChild.nodeValue);
  assertEquals(
      'Original text 2 should be left behind', OLD_LINK_TEXT + '2',
      parent2.firstChild.nodeValue);
  assertEquals(
      'Original text 3 should be left behind', OLD_LINK_TEXT + '3',
      parent3.firstChild.nodeValue);

  mockCtrl.$verifyAll();
}


/**
 * Tests that when the Cancel event fires for a new link it gets removed.
 */
function testOkNewMultiple() {
  mockLink.placeCursorRightOf();
  mockField.dispatchSelectionChangeEvent();
  mockField.dispatchChange();
  mockField.focus();
  mockCtrl.$replayAll();

  var anchorElem1 = anchorElem;
  setUpGivenAnchor(anchorElem1, OLD_LINK_TEXT + '1', OLD_LINK_URL + '1', true);

  anchorElem2 = goog.dom.createElement(goog.dom.TagName.A);
  goog.dom.appendChild(testDiv, anchorElem2);
  setUpGivenAnchor(anchorElem2, OLD_LINK_TEXT + '2', OLD_LINK_URL + '2', true);
  extraAnchors.push(anchorElem2);

  anchorElem3 = goog.dom.createElement(goog.dom.TagName.A);
  goog.dom.appendChild(testDiv, anchorElem3);
  setUpGivenAnchor(anchorElem3, OLD_LINK_TEXT + '3', OLD_LINK_URL + '3', true);
  extraAnchors.push(anchorElem3);

  var prevSib = anchorElem1.previousSibling;
  plugin = new goog.editor.plugins.LinkDialogPlugin();
  plugin.registerFieldObject(mockField);
  var dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);

  // Mock of execCommand + clicking OK without actually opening the dialog.
  plugin.currentLink_ = mockLink;
  dialog.dispatchEvent(
      new goog.ui.editor.LinkDialog.OkEvent(NEW_LINK_TEXT, NEW_LINK_URL));

  assertEquals(
      'Display text 1 must update', NEW_LINK_TEXT, anchorElem1.innerHTML);
  assertEquals(
      'Display text 2 must not update', OLD_LINK_TEXT + '2',
      anchorElem2.innerHTML);
  assertEquals(
      'Display text 3 must not update', OLD_LINK_TEXT + '3',
      anchorElem3.innerHTML);

  assertEquals(
      'Anchor element 1 href must update', NEW_LINK_URL, anchorElem1.href);
  assertEquals(
      'Anchor element 2 href must update', NEW_LINK_URL, anchorElem2.href);
  assertEquals(
      'Anchor element 3 href must update', NEW_LINK_URL, anchorElem3.href);

  mockCtrl.$verifyAll();
}


/**
 * Tests the anchor's target is correctly modified with the "open in new
 * window" feature on.
 */
function testOkOpenInNewWindow() {
  mockLink.placeCursorRightOf().$anyTimes();
  mockField.dispatchSelectionChangeEvent().$anyTimes();
  mockField.dispatchChange().$anyTimes();
  mockField.focus().$anyTimes();
  mockCtrl.$replayAll();

  plugin = new goog.editor.plugins.LinkDialogPlugin();
  plugin.registerFieldObject(mockField);
  plugin.showOpenLinkInNewWindow(false);
  plugin.currentLink_ = mockLink;

  // Edit a link that doesn't open in a new window and leave it as such.
  setUpAnchor(OLD_LINK_TEXT, OLD_LINK_URL);
  var dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);
  dialog.dispatchEvent(
      new goog.ui.editor.LinkDialog.OkEvent(
          NEW_LINK_TEXT, NEW_LINK_URL, false, false));
  assertEquals(
      'Target should not be set for link that doesn\'t open in new window', '',
      anchorElem.target);
  assertFalse(
      'Checked state should stay false',
      plugin.getOpenLinkInNewWindowCheckedState());

  // Edit a link that doesn't open in a new window and toggle it on.
  setUpAnchor(OLD_LINK_TEXT, OLD_LINK_URL);
  dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);
  dialog.dispatchEvent(
      new goog.ui.editor.LinkDialog.OkEvent(NEW_LINK_TEXT, NEW_LINK_URL, true));
  assertEquals(
      'Target should be set to _blank for link that opens in new window',
      '_blank', anchorElem.target);
  assertTrue(
      'Checked state should be true after toggling a link on',
      plugin.getOpenLinkInNewWindowCheckedState());

  // Edit a link that doesn't open in a named window and don't touch it.
  setUpAnchor(OLD_LINK_TEXT, OLD_LINK_URL, false, 'named');
  dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);
  dialog.dispatchEvent(
      new goog.ui.editor.LinkDialog.OkEvent(
          NEW_LINK_TEXT, NEW_LINK_URL, false));
  assertEquals(
      'Target should keep its original value', 'named', anchorElem.target);
  assertFalse(
      'Checked state should be false again',
      plugin.getOpenLinkInNewWindowCheckedState());

  // Edit a link that opens in a new window and toggle it off.
  setUpAnchor(OLD_LINK_TEXT, OLD_LINK_URL, false, '_blank');
  dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);
  dialog.dispatchEvent(
      new goog.ui.editor.LinkDialog.OkEvent(
          NEW_LINK_TEXT, NEW_LINK_URL, false));
  assertEquals(
      'Target should not be set for link that doesn\'t open in new window', '',
      anchorElem.target);

  mockCtrl.$verifyAll();
}

function testOkNoFollowEnabled() {
  verifyRelNoFollow(true, null, 'nofollow');
}

function testOkNoFollowInUppercase() {
  verifyRelNoFollow(true, 'NOFOLLOW', 'NOFOLLOW');
}

function testOkNoFollowEnabledHasMoreRelValues() {
  verifyRelNoFollow(true, 'author', 'author nofollow');
}

function testOkNoFollowDisabled() {
  verifyRelNoFollow(false, null, '');
}

function testOkNoFollowDisabledHasMoreRelValues() {
  verifyRelNoFollow(false, 'author', 'author');
}

function testOkNoFollowDisabledHasMoreRelValues() {
  verifyRelNoFollow(false, 'author nofollow', 'author ');
}

function testOkNoFollowInUppercaseWithMoreValues() {
  verifyRelNoFollow(true, 'NOFOLLOW author', 'NOFOLLOW author');
}

function verifyRelNoFollow(noFollow, originalRel, expectedRel) {
  mockLink.placeCursorRightOf();
  mockField.dispatchSelectionChangeEvent();
  mockField.dispatchChange();
  mockField.focus();
  mockCtrl.$replayAll();

  plugin = new goog.editor.plugins.LinkDialogPlugin();
  plugin.registerFieldObject(mockField);
  plugin.showRelNoFollow();
  plugin.currentLink_ = mockLink;

  setUpAnchor(OLD_LINK_TEXT, OLD_LINK_URL, true, null, originalRel);
  var dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);
  dialog.dispatchEvent(
      new goog.ui.editor.LinkDialog.OkEvent(
          NEW_LINK_TEXT, NEW_LINK_URL, false, noFollow));
  assertEquals(expectedRel, anchorElem.rel);

  mockCtrl.$verifyAll();
}


/**
 * Tests that the selection is cleared when the dialog opens and is
 * correctly restored after cancel is clicked.
 */
function testRestoreSelectionOnOk() {
  setUpAnchor('12345', '/');
  setUpRealEditableField();

  var elem = fieldObj.getElement();
  var helper = new goog.testing.editor.TestHelper(elem);
  helper.select('12345', 1, '12345', 4);  // Selects '234'.

  assertEquals(
      'Incorrect text selected before dialog is opened', '234',
      fieldObj.getRange().getText());
  plugin.execCommand(goog.editor.Command.MODAL_LINK_EDITOR, linkObj);
  if (!goog.userAgent.IE && !goog.userAgent.OPERA) {
    // IE returns some bogus range when field doesn't have selection.
    // You can't remove the selection from a whitebox field in Opera.
    assertNull(
        'There should be no selection while dialog is open',
        fieldObj.getRange());
  }
  goog.testing.events.fireClickSequence(plugin.dialog_.getOkButtonElement());
  assertEquals(
      'No text should be selected after clicking ok', '',
      fieldObj.getRange().getText());

  // Test that the caret is placed at the end of the link text.
  goog.testing.editor.dom.assertRangeBetweenText(
      // If the browser gets stuck in links, an nbsp was added after the link
      // to avoid that, otherwise we just look for the 5.
      goog.editor.BrowserFeature.GETS_STUCK_IN_LINKS ?
          goog.string.Unicode.NBSP :
          '5',
      '', fieldObj.getRange());

  // NOTE(user): The functionality to avoid getting stuck in links is
  // tested in editablelink_test.html::testPlaceCursorRightOf().
}


/**
 * Tests that the selection is cleared when the dialog opens and is
 * correctly restored after cancel is clicked.
 * @param {boolean=} opt_isNew Whether to test behavior when creating a new
 *     link (cancelling will flatten it).
 */
function testRestoreSelectionOnCancel(opt_isNew) {
  setUpAnchor('12345', '/', opt_isNew);
  setUpRealEditableField();

  var elem = fieldObj.getElement();
  var helper = new goog.testing.editor.TestHelper(elem);
  helper.select('12345', 1, '12345', 4);  // Selects '234'.

  assertEquals(
      'Incorrect text selected before dialog is opened', '234',
      fieldObj.getRange().getText());
  plugin.execCommand(goog.editor.Command.MODAL_LINK_EDITOR, linkObj);
  if (!goog.userAgent.IE && !goog.userAgent.OPERA) {
    // IE returns some bogus range when field doesn't have selection.
    // You can't remove the selection from a whitebox field in Opera.
    assertNull(
        'There should be no selection while dialog is open',
        fieldObj.getRange());
  }
  goog.testing.events.fireClickSequence(
      plugin.dialog_.getCancelButtonElement());
  assertEquals(
      'Incorrect text selected after clicking cancel', '234',
      fieldObj.getRange().getText());
}


/**
 * Tests that the selection is cleared when the dialog opens and is
 * correctly restored after cancel is clicked and the new link is removed.
 */
function testRestoreSelectionOnCancelNew() {
  testRestoreSelectionOnCancel(true);
}


/**
 * Tests that the BeforeTestLink event is suppressed for invalid url schemes.
 */
function testTestLinkDisabledForInvalidScheme() {
  mockAlert(goog.testing.mockmatchers.isString);
  mockCtrl.$replayAll();

  var invalidUrl = 'javascript:document.write(\'hello\');';

  plugin = new goog.editor.plugins.LinkDialogPlugin();
  var dialog = plugin.createDialog(new goog.dom.DomHelper(), mockLink);

  // Mock of execCommand + clicking test without actually opening the dialog.
  var dispatched = dialog.dispatchEvent(
      new goog.ui.editor.LinkDialog.BeforeTestLinkEvent(invalidUrl));

  assertFalse(dispatched);
  mockCtrl.$verifyAll();
}

function testIsSafeSchemeToOpen() {
  plugin = new goog.editor.plugins.LinkDialogPlugin();
  // Urls with no scheme at all are ok too since 'http://' will be prepended.
  var good = [
    'http://google.com', 'http://google.com/', 'https://google.com',
    'null@google.com', 'http://www.google.com', 'http://site.com', 'google.com',
    'google', 'http://google', 'HTTP://GOOGLE.COM', 'HtTp://www.google.com'
  ];

  var bad = [
    'javascript:google.com', 'httpp://google.com', 'data:foo',
    'javascript:alert(\'hi\');', 'abc:def'
  ];

  for (var i = 0; i < good.length; i++) {
    assertTrue(
        good[i] + ' should have a safe scheme',
        plugin.isSafeSchemeToOpen_(good[i]));
  }

  for (i = 0; i < bad.length; i++) {
    assertFalse(
        bad[i] + ' should have an unsafe scheme',
        plugin.isSafeSchemeToOpen_(bad[i]));
  }
}

function testShouldOpenWithWhitelist() {
  plugin.setSafeToOpenSchemes(['abc']);

  assertTrue('Scheme should be safe', plugin.shouldOpenUrl('abc://google.com'));
  assertFalse(
      'Scheme should be unsafe', plugin.shouldOpenUrl('http://google.com'));

  plugin.setBlockOpeningUnsafeSchemes(false);
  assertTrue(
      'Non-whitelisted should now be safe after disabling blocking',
      plugin.shouldOpenUrl('http://google.com'));
}


/**
 * Regression test for http://b/issue?id=1607766 . Without the fix, this
 * should give an Invalid Argument error in IE, because the editable field
 * caches a selection util that has a reference to the node of the link text
 * before it is edited (which gets replaced by a new node for the new text
 * after editing).
 */
function testBug1607766() {
  setUpAnchor('abc', 'def');
  setUpRealEditableField();

  var elem = fieldObj.getElement();
  var helper = new goog.testing.editor.TestHelper(elem);
  helper.select('abc', 1, 'abc', 2);  // Selects 'b'.
  // Dispatching a selection event causes the field to cache a selection
  // util, which is the root of the bug.
  plugin.fieldObject.dispatchSelectionChangeEvent();

  plugin.execCommand(goog.editor.Command.MODAL_LINK_EDITOR, linkObj);
  goog.dom.getElement(goog.ui.editor.LinkDialog.Id_.TEXT_TO_DISPLAY).value =
      'Abc';
  goog.testing.events.fireClickSequence(plugin.dialog_.getOkButtonElement());

  // In IE the unit test somehow doesn't cause a browser focus event, so we
  // need to manually invoke this, which is where the bug happens.
  plugin.fieldObject.dispatchFocus_();
}


/**
 * Regression test for http://b/issue?id=2215546 .
 */
function testBug2215546() {
  setUpRealEditableField();

  var elem = fieldObj.getElement();
  fieldObj.setHtml(false, '<div><a href="/"></a></div>');
  anchorElem = elem.firstChild.firstChild;
  linkObj = new goog.editor.Link(anchorElem, true);

  var helper = new goog.testing.editor.TestHelper(elem);
  // Select "</a>" in a way, simulating what IE does if you hit enter twice,
  // arrow up into the blank line and open the link dialog.
  helper.select(anchorElem, 0, elem.firstChild, 1);

  plugin.execCommand(goog.editor.Command.MODAL_LINK_EDITOR, linkObj);
  goog.dom.getElement(goog.ui.editor.LinkDialog.Id_.TEXT_TO_DISPLAY).value =
      'foo';
  goog.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT).value = 'foo';
  var okButton = plugin.dialog_.getOkButtonElement();
  okButton.disabled = false;
  goog.testing.events.fireClickSequence(okButton);

  assertEquals(
      'Link text should have been inserted', 'foo', anchorElem.innerHTML);
}


/**
 * Test that link insertion doesn't scroll the field to the top
 * after clicking Cancel or OK.
 */
function testBug7279077ScrollOnFocus() {
  if (goog.userAgent.IE) {
    return;  // TODO(user): take this out once b/7279077 fixed for IE too.
  }
  setUpAnchor('12345', '/');
  setUpRealEditableField();

  // Make the field scrollable and kinda small.
  var elem = fieldObj.getElement();
  elem.style.overflow = 'auto';
  elem.style.height = '40px';
  elem.style.width = '200px';
  elem.style.contenteditable = 'true';

  // Add a bunch of text before the anchor tag.
  var longTextElem = document.createElement(goog.dom.TagName.SPAN);
  longTextElem.innerHTML = goog.string.repeat('All work and no play.<p>', 20);
  elem.insertBefore(longTextElem, elem.firstChild);

  var helper = new goog.testing.editor.TestHelper(elem);
  helper.select('12345', 1, '12345', 4);  // Selects '234'.

  // Scroll down.
  elem.scrollTop = 60;

  // Bring up the link insertion dialog, then cancel.
  plugin.execCommand(goog.editor.Command.MODAL_LINK_EDITOR, linkObj);
  goog.dom.getElement(goog.ui.editor.LinkDialog.Id_.TEXT_TO_DISPLAY).value =
      'foo';
  goog.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT).value = 'foo';
  var cancelButton = plugin.dialog_.getCancelButtonElement();
  goog.testing.events.fireClickSequence(cancelButton);

  assertEquals(
      'Field should not have scrolled after cancel', 60, elem.scrollTop);

  // Now let's try it with clicking the OK button.
  plugin.execCommand(goog.editor.Command.MODAL_LINK_EDITOR, linkObj);
  goog.dom.getElement(goog.ui.editor.LinkDialog.Id_.TEXT_TO_DISPLAY).value =
      'foo';
  goog.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT).value = 'foo';
  var okButton = plugin.dialog_.getOkButtonElement();
  goog.testing.events.fireClickSequence(okButton);

  assertEquals('Field should not have scrolled after OK', 60, elem.scrollTop);
}


/**
 * Setup a real editable field (instead of a mock) and register the plugin to
 * it.
 */
function setUpRealEditableField() {
  fieldElem = document.createElement(goog.dom.TagName.DIV);
  fieldElem.id = 'myField';
  document.body.appendChild(fieldElem);
  fieldElem.appendChild(anchorElem);
  fieldObj = new goog.editor.Field('myField', document);
  fieldObj.makeEditable();
  linkObj = new goog.editor.Link(fieldObj.getElement().firstChild, isNew);
  // Register the plugin to that field.
  plugin = new goog.editor.plugins.LinkDialogPlugin();
  fieldObj.registerPlugin(plugin);
}


/**
 * Tear down the real editable field.
 */
function tearDownRealEditableField() {
  if (fieldObj) {
    fieldObj.makeUneditable();
    fieldObj.dispose();
    fieldObj = null;
  }
  goog.dom.removeNode(fieldElem);
}
