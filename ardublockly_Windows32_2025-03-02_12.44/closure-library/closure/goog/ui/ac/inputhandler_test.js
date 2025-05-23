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

goog.provide('goog.ui.ac.InputHandlerTest');
goog.setTestOnly('goog.ui.ac.InputHandlerTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.selection');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.events.KeyCodes');
goog.require('goog.functions');
goog.require('goog.object');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.userAgent');



/**
 * Mock out the input element.
 * @constructor
 */
function MockElement() {
  goog.events.EventTarget.call(this);
  this.setAttributeNS = function() {};
  this.setAttribute = function(key, value) { this[key] = value; };
  this.focus = function() {};
  this.blur = function() {};
  this.ownerDocument = document;
  this.selectionStart = 0;
}
goog.inherits(MockElement, goog.events.EventTarget);



/**
 * @constructor
 */
function MockAutoCompleter() {
  this.setToken = null;
  this.setTokenWasCalled = false;
  this.selectHilitedWasCalled = false;
  this.dismissWasCalled = false;
  this.getTarget = function() { return mockElement };
  this.setTarget = function() {};
  this.setToken = function(token) {
    this.setTokenWasCalled = true;
    this.setToken = token;
  };
  this.selectHilited = function() {
    this.selectHilitedWasCalled = true;
    return true;  // Success.
  };
  this.cancelDelayedDismiss = function() {};
  this.dismissOnDelay = function() {};
  this.dismiss = function() { this.dismissWasCalled = true; };
  this.isOpen = goog.functions.TRUE;
}



/**
 * MockInputHandler simulates key events for testing the IME behavior of
 * InputHandler.
 * @constructor
 */
function MockInputHandler() {
  goog.ui.ac.InputHandler.call(this);

  this.ac_ = new MockAutoCompleter();
  this.cursorPosition_ = 0;

  this.attachInput(mockElement);
}
goog.inherits(MockInputHandler, goog.ui.ac.InputHandler);


/** Checks for updates to the text area, should not happen during IME. */
MockInputHandler.prototype.update = function() {
  this.updates++;
};


/** Simulates key events. */
MockInputHandler.prototype.fireKeyEvents = function(
    keyCode, down, press, up, opt_properties) {
  if (down) this.fireEvent('keydown', keyCode, opt_properties);
  if (press) this.fireEvent('keypress', keyCode, opt_properties);
  if (up) this.fireEvent('keyup', keyCode, opt_properties);
};


/** Simulates an event. */
MockInputHandler.prototype.fireEvent = function(type, keyCode, opt_properties) {
  var e = {};
  e.type = type;
  e.keyCode = keyCode;
  e.preventDefault = function() {};
  if (!goog.userAgent.IE) {
    e.which = type == 'keydown' ? keyCode : 0;
  }
  if (opt_properties) {
    goog.object.extend(e, opt_properties);
  }
  e = new goog.events.BrowserEvent(e);
  mockElement.dispatchEvent(e);
};

MockInputHandler.prototype.setCursorPosition = function(cursorPosition) {
  this.cursorPosition_ = cursorPosition;
};

MockInputHandler.prototype.getCursorPosition = function() {
  return this.cursorPosition_;
};

// Variables used by all test
var mh = null;
var oldMac, oldWin, oldLinux, oldIe, oldFf, oldWebkit, oldVersion;
var oldUsesKeyDown;
var mockElement;
var mockClock;

function setUp() {
  oldMac = goog.userAgent.MAC;
  oldWin = goog.userAgent.WINDOWS;
  oldLinux = goog.userAgent.LINUX;
  oldIe = goog.userAgent.IE;
  oldFf = goog.userAgent.GECKO;
  oldWebkit = goog.userAgent.WEBKIT;
  oldVersion = goog.userAgent.VERSION;
  oldUsesKeyDown = goog.events.KeyHandler.USES_KEYDOWN_;
  mockClock = new goog.testing.MockClock(true);
  mockElement = new MockElement;
  mh = new MockInputHandler;
}

function tearDown() {
  goog.userAgent.MAC = oldMac;
  goog.userAgent.WINDOWS = oldWin;
  goog.userAgent.LINUX = oldLinux;
  goog.userAgent.IE = oldIe;
  goog.userAgent.GECKO = oldFf;
  goog.userAgent.WEBKIT = oldWebkit;
  goog.userAgent.VERSION = oldVersion;
  goog.events.KeyHandler.USES_KEYDOWN_ = oldUsesKeyDown;
  mockClock.dispose();
  mockElement.dispose();
}


/** Used to simulate behavior of Windows/Firefox3 */
function simulateWinFirefox3() {
  goog.userAgent.MAC = false;
  goog.userAgent.WINDOWS = true;
  goog.userAgent.LINUX = false;
  goog.userAgent.IE = false;
  goog.userAgent.EDGE = false;
  goog.userAgent.EDGE_OR_IE = false;
  goog.userAgent.GECKO = true;
  goog.userAgent.WEBKIT = false;
  goog.events.KeyHandler.USES_KEYDOWN_ = false;
}


/** Used to simulate behavior of Windows/InternetExplorer7 */
function simulateWinIe7() {
  goog.userAgent.MAC = false;
  goog.userAgent.WINDOWS = true;
  goog.userAgent.LINUX = false;
  goog.userAgent.IE = true;
  goog.userAgent.EDGE = false;
  goog.userAgent.EDGE_OR_IE = true;
  goog.userAgent.DOCUMENT_MODE = 7;
  goog.userAgent.GECKO = false;
  goog.userAgent.WEBKIT = false;
  goog.events.KeyHandler.USES_KEYDOWN_ = true;
}


/** Used to simulate behavior of Windows/Chrome */
function simulateWinChrome() {
  goog.userAgent.MAC = false;
  goog.userAgent.WINDOWS = true;
  goog.userAgent.LINUX = false;
  goog.userAgent.IE = false;
  goog.userAgent.EDGE = false;
  goog.userAgent.EDGE_OR_IE = false;
  goog.userAgent.GECKO = false;
  goog.userAgent.WEBKIT = true;
  goog.userAgent.VERSION = '525';
  goog.events.KeyHandler.USES_KEYDOWN_ = true;
}


/** Used to simulate behavior of Mac/Firefox3 */
function simulateMacFirefox3() {
  goog.userAgent.MAC = true;
  goog.userAgent.WINDOWS = false;
  goog.userAgent.LINUX = false;
  goog.userAgent.IE = false;
  goog.userAgent.EDGE = false;
  goog.userAgent.EDGE_OR_IE = false;
  goog.userAgent.GECKO = true;
  goog.userAgent.WEBKIT = false;
  goog.events.KeyHandler.USES_KEYDOWN_ = true;
}


/** Used to simulate behavior of Mac/Safari3 */
function simulateMacSafari3() {
  goog.userAgent.MAC = true;
  goog.userAgent.WINDOWS = false;
  goog.userAgent.LINUX = false;
  goog.userAgent.IE = false;
  goog.userAgent.EDGE = false;
  goog.userAgent.EDGE_OR_IE = false;
  goog.userAgent.GECKO = false;
  goog.userAgent.WEBKIT = true;
  goog.userAgent.VERSION = '525';
  goog.events.KeyHandler.USES_KEYDOWN_ = true;
}


/** Used to simulate behavior of Linux/Firefox3 */
function simulateLinuxFirefox3() {
  goog.userAgent.MAC = false;
  goog.userAgent.WINDOWS = false;
  goog.userAgent.LINUX = true;
  goog.userAgent.IE = false;
  goog.userAgent.EDGE = false;
  goog.userAgent.EDGE_OR_IE = false;
  goog.userAgent.GECKO = true;
  goog.userAgent.WEBKIT = false;
  goog.events.KeyHandler.USES_KEYDOWN_ = true;
}


/** Test the normal, non-IME case */
function testRegularKey() {
  // Each key fires down, press, and up in that order, and each should
  // trigger an autocomplete update
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  mh.fireKeyEvents(goog.events.KeyCodes.K, true, true, true);
  assertFalse('IME should not be triggered by K', mh.waitingForIme_);

  mh.fireKeyEvents(goog.events.KeyCodes.A, true, true, true);
  assertFalse('IME should not be triggered by A', mh.waitingForIme_);
}


/**
 * This test simulates the key inputs generated by pressing
 * '<ime_on>a<enter>i<ime_off>u' using the Japanese IME
 * on Windows/Firefox3.
 */
function testImeWinFirefox3() {
  simulateWinFirefox3();
  mh.fireEvent('focus', '');
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // ime_on

  // a
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, true, false);
  // Event is not generated for key code a.
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // enter
  mh.fireKeyEvents(goog.events.KeyCodes.ENTER, false, false, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // i
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, true, false);
  // Event is not generated for key code i.
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // ime_off

  // u
  mh.fireKeyEvents(goog.events.KeyCodes.U, true, true, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  mh.fireEvent('blur', '');
}


/**
 * This test simulates the key inputs generated by pressing
 * '<ime_on>a<enter>i<ime_off>u' using the Japanese IME
 * on Windows/InternetExplorer7.
 */
function testImeWinIe7() {
  simulateWinIe7();
  mh.fireEvent('focus', '');
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // ime_on

  // a
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, false, false);
  mh.fireKeyEvents(goog.events.KeyCodes.A, false, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // enter
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, false, false);
  mh.fireKeyEvents(goog.events.KeyCodes.ENTER, false, false, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // i
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, false, false);
  mh.fireKeyEvents(goog.events.KeyCodes.I, false, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // ime_off

  // u
  mh.fireKeyEvents(goog.events.KeyCodes.U, true, true, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  mh.fireEvent('blur', '');
}


/**
 * This test simulates the key inputs generated by pressing
 * '<ime_on>a<enter>i<ime_off>u' using the Japanese IME
 * on Windows/Chrome.
 */
function testImeWinChrome() {
  simulateWinChrome();
  mh.fireEvent('focus', '');
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // ime_on

  // a
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, false, false);
  mh.fireKeyEvents(goog.events.KeyCodes.A, false, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // enter
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, false, false);
  mh.fireKeyEvents(goog.events.KeyCodes.ENTER, false, false, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // i
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, false, false);
  mh.fireKeyEvents(goog.events.KeyCodes.I, false, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // ime_off

  // u
  mh.fireKeyEvents(goog.events.KeyCodes.U, true, true, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  mh.fireEvent('blur', '');
}


/**
 * This test simulates the key inputs generated by pressing
 * '<ime_on>a<enter>i<ime_off>u' using the Japanese IME
 * on Mac/Firefox3.
 */
function testImeMacFirefox3() {
  // TODO(user): Currently our code cannot distinguish preedit characters
  // from normal ones for Mac/Firefox3.
  // Enable this test after we fix it.

  simulateMacFirefox3();
  mh.fireEvent('focus', '');
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // ime_on

  // a
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, true, false);
  assertTrue('IME should be triggered', mh.waitingForIme_);
  mh.fireKeyEvents(goog.events.KeyCodes.A, true, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // enter
  mh.fireKeyEvents(goog.events.KeyCodes.ENTER, true, true, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // i
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, true, false);
  mh.fireKeyEvents(goog.events.KeyCodes.I, true, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // ime_off

  // u
  mh.fireKeyEvents(goog.events.KeyCodes.U, true, true, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  mh.fireEvent('blur', '');
}


/**
 * This test simulates the key inputs generated by pressing
 * '<ime_on>a<enter>i<ime_off>u' using the Japanese IME
 * on Mac/Safari3.
 */
function testImeMacSafari3() {
  simulateMacSafari3();
  mh.fireEvent('focus', '');
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // ime_on

  // a
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, false, false);
  mh.fireKeyEvents(goog.events.KeyCodes.A, false, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // enter
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, false, false);
  mh.fireKeyEvents(goog.events.KeyCodes.ENTER, false, false, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // i
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, false, false);
  mh.fireKeyEvents(goog.events.KeyCodes.I, false, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // ime_off

  // u
  mh.fireKeyEvents(goog.events.KeyCodes.U, true, true, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  mh.fireEvent('blur', '');
}


/**
 * This test simulates the key inputs generated by pressing
 * '<ime_on>a<enter>i<ime_off>u' using the Japanese IME
 * on Linux/Firefox3.
 */
function testImeLinuxFirefox3() {
  // TODO(user): Currently our code cannot distinguish preedit characters
  // from normal ones for Linux/Firefox3.
  // Enable this test after we fix it.


  simulateLinuxFirefox3();
  mh.fireEvent('focus', '');
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // ime_on
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, true, false);

  // a
  mh.fireKeyEvents(goog.events.KeyCodes.A, true, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // enter
  mh.fireKeyEvents(goog.events.KeyCodes.ENTER, true, true, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  // i
  mh.fireKeyEvents(goog.events.KeyCodes.WIN_IME, true, true, false);
  mh.fireKeyEvents(goog.events.KeyCodes.I, true, false, true);
  assertTrue('IME should be triggered', mh.waitingForIme_);

  // ime_off

  // u
  mh.fireKeyEvents(goog.events.KeyCodes.U, true, true, true);
  assertFalse('IME should not be triggered', mh.waitingForIme_);

  mh.fireEvent('blur', '');
}


/**
 * Check attaching to an EventTarget instead of an element.
 */
function testAttachEventTarget() {
  var target = new goog.events.EventTarget();

  assertNull(mh.activeElement_);
  mh.attachInput(target);
  assertNull(mh.activeElement_);

  mockElement.dispatchEvent(new goog.events.Event('focus', mockElement));
  assertEquals(mockElement, mh.activeElement_);

  mh.detachInput(target);
}


/**
 * Make sure that the active element handling works.
 */
function testActiveElement() {
  assertNull(mh.activeElement_);

  mockElement.dispatchEvent('keydown');
  assertEquals(mockElement, mh.activeElement_);

  mockElement.dispatchEvent('blur');
  assertNull(mh.activeElement_);

  mockElement.dispatchEvent('focus');
  assertEquals(mockElement, mh.activeElement_);

  mh.detachInput(mockElement);
  assertNull(mh.activeElement_);
}


/**
 * We can attach an EventTarget that isn't an element.
 */
function testAttachEventTarget() {
  var target = new goog.events.EventTarget();

  assertNull(mh.activeElement_);
  mh.attachInput(target);
  assertNull(mh.activeElement_);

  target.dispatchEvent(new goog.events.Event('focus', mockElement));
  assertEquals(mockElement, mh.activeElement_);

  mh.detachInput(target);
}


/**
 * Make sure an already-focused element becomes active immediately.
 */
function testActiveElementAlreadyFocused() {
  var element = document.getElementById('textInput');
  element.style.display = '';
  element.focus();

  assertNull(mh.activeElement_);

  mh.attachInput(element);
  assertEquals(element, mh.activeElement_);

  mh.detachInput(element);
  element.style.display = 'none';
}

function testUpdateDoesNotTriggerSetTokenForSelectRow() {
  var ih = new goog.ui.ac.InputHandler();

  // Set up our input handler with the necessary mocks
  var mockAutoCompleter = new MockAutoCompleter();
  ih.ac_ = mockAutoCompleter;
  ih.activeElement_ = mockElement;

  var row = {};
  ih.selectRow(row, false);

  ih.update();
  assertFalse(
      'update should not call setToken on selectRow',
      mockAutoCompleter.setTokenWasCalled);

  ih.update();
  assertFalse(
      'update should not call setToken on selectRow',
      mockAutoCompleter.setTokenWasCalled);
}

function testSetTokenText() {
  var ih = new MockInputHandler();

  // Set up our input handler with the necessary mocks
  var mockAutoCompleter = new MockAutoCompleter();
  ih.ac_ = mockAutoCompleter;
  ih.activeElement_ = mockElement;
  mockElement.value = 'bob, wal, joey';
  ih.setCursorPosition(8);

  ih.setTokenText('waldo', true /* multi-row */);

  assertEquals('bob, waldo, joey', mockElement.value);
}

function testSetTokenTextLeftHandSideOfToken() {
  var ih = new MockInputHandler();
  ih.setSeparators(' ');
  ih.setWhitespaceWrapEntries(false);

  // Set up our input handler with the necessary mocks
  var mockAutoCompleter = new MockAutoCompleter();
  ih.ac_ = mockAutoCompleter;
  ih.activeElement_ = mockElement;
  mockElement.value = 'foo bar';
  // Sets cursor position right before 'bar'
  ih.setCursorPosition(4);

  ih.setTokenText('bar', true /* multi-row */);

  assertEquals('foo bar ', mockElement.value);
}

function testEmptyTokenWithSeparator() {
  var ih = new goog.ui.ac.InputHandler();
  var mockAutoCompleter = new MockAutoCompleter();
  ih.ac_ = mockAutoCompleter;
  ih.activeElement_ = mockElement;
  mockElement.value = ', ,';
  // Sets cursor position before the second comma
  goog.dom.selection.setStart(mockElement, 2);

  ih.update();
  assertTrue(
      'update should call setToken on selectRow',
      mockAutoCompleter.setTokenWasCalled);
  assertEquals(
      'update should be called with empty string', '',
      mockAutoCompleter.setToken);
}

function testNonEmptyTokenWithSeparator() {
  var ih = new goog.ui.ac.InputHandler();
  var mockAutoCompleter = new MockAutoCompleter();
  ih.ac_ = mockAutoCompleter;
  ih.activeElement_ = mockElement;
  mockElement.value = ', joe ,';
  // Sets cursor position before the second comma
  goog.dom.selection.setStart(mockElement, 5);

  ih.update();
  assertTrue(
      'update should call setToken on selectRow',
      mockAutoCompleter.setTokenWasCalled);
  assertEquals(
      'update should be called with expected string', 'joe',
      mockAutoCompleter.setToken);
}

function testGetThrottleTime() {
  var ih = new goog.ui.ac.InputHandler();
  ih.setThrottleTime(999);
  assertEquals('throttle time set+get', 999, ih.getThrottleTime());
}

function testGetUpdateDuringTyping() {
  var ih = new goog.ui.ac.InputHandler();
  ih.setUpdateDuringTyping(false);
  assertFalse('update during typing set+get', ih.getUpdateDuringTyping());
}

function testEnterToSelect() {
  mh.fireEvent('focus', '');
  mh.fireKeyEvents(goog.events.KeyCodes.ENTER, true, true, true);
  assertTrue('Should hilite', mh.ac_.selectHilitedWasCalled);
  assertFalse('Should NOT be dismissed', mh.ac_.dismissWasCalled);
}

function testEnterDoesNotSelectWhenClosed() {
  mh.fireEvent('focus', '');
  mh.ac_.isOpen = goog.functions.FALSE;
  mh.fireKeyEvents(goog.events.KeyCodes.ENTER, true, true, true);
  assertFalse('Should NOT hilite', mh.ac_.selectHilitedWasCalled);
  assertTrue('Should be dismissed', mh.ac_.dismissWasCalled);
}

function testTabToSelect() {
  mh.fireEvent('focus', '');
  mh.fireKeyEvents(goog.events.KeyCodes.TAB, true, true, true);
  assertTrue('Should hilite', mh.ac_.selectHilitedWasCalled);
  assertFalse('Should NOT be dismissed', mh.ac_.dismissWasCalled);
}

function testTabDoesNotSelectWhenClosed() {
  mh.fireEvent('focus', '');
  mh.ac_.isOpen = goog.functions.FALSE;
  mh.fireKeyEvents(goog.events.KeyCodes.TAB, true, true, true);
  assertFalse('Should NOT hilite', mh.ac_.selectHilitedWasCalled);
  assertTrue('Should be dismissed', mh.ac_.dismissWasCalled);
}

function testShiftTabDoesNotSelect() {
  mh.fireEvent('focus', '');
  mh.ac_.isOpen = goog.functions.TRUE;
  mh.fireKeyEvents(
      goog.events.KeyCodes.TAB, true, true, true, {shiftKey: true});
  assertFalse('Should NOT hilite', mh.ac_.selectHilitedWasCalled);
  assertTrue('Should be dismissed', mh.ac_.dismissWasCalled);
}

function testEmptySeparatorUsesDefaults() {
  var inputHandler = new goog.ui.ac.InputHandler('');
  assertFalse(inputHandler.separatorCheck_.test(''));
  assertFalse(inputHandler.separatorCheck_.test('x'));
  assertTrue(inputHandler.separatorCheck_.test(','));
}

function testMultipleSeparatorUsesEmptyDefaults() {
  var inputHandler = new goog.ui.ac.InputHandler(',\n', null, true);
  inputHandler.setWhitespaceWrapEntries(false);
  inputHandler.setSeparators(',\n', '');

  // Set up our input handler with the necessary mocks
  var mockAutoCompleter = new MockAutoCompleter();
  inputHandler.ac_ = mockAutoCompleter;
  inputHandler.activeElement_ = mockElement;
  mockElement.value = 'bob,wal';
  inputHandler.setCursorPosition(8);

  inputHandler.setTokenText('waldo', true /* multi-row */);

  assertEquals('bob,waldo', mockElement.value);
}


function testAriaTags() {
  var target = goog.dom.createDom('div');
  mh.attachInput(target);

  assertEquals(goog.a11y.aria.Role.COMBOBOX, goog.a11y.aria.getRole(target));
  assertEquals(
      'list',
      goog.a11y.aria.getState(target, goog.a11y.aria.State.AUTOCOMPLETE));

  mh.detachInput(target);

  assertNull(goog.a11y.aria.getRole(target));
  assertEquals(
      '', goog.a11y.aria.getState(target, goog.a11y.aria.State.AUTOCOMPLETE));
}
