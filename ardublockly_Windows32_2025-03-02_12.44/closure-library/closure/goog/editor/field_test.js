// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Shared tests for goog.editor.Field and ContentEditableField.
 * Since ContentEditableField switches many of the internal code paths in Field
 * (such as via usesIframe()) it's important to re-run a lot of the same tests.
 *
 * @author nicksantos@google.com (Nick Santos)
 * @author gboyer@google.com (Garrett Boyer)
 */

/** @suppress {extraProvide} */
goog.provide('goog.editor.field_test');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Field');
goog.require('goog.editor.Plugin');
goog.require('goog.editor.range');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.functions');
goog.require('goog.testing.LooseMock');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.dom');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.recordFunction');
goog.require('goog.userAgent');
goog.setTestOnly('Tests for goog.editor.*Field');


/** Constructor to use for creating the field. Set by the test HTML file. */
var FieldConstructor;


/** Hard-coded HTML for the tests. */
var HTML = '<div id="testField">I am text.</div>';


function setUp() {
  goog.dom.getElement('parent').innerHTML = HTML;
  assertTrue(
      'FieldConstructor should be set by the test HTML file',
      goog.isFunction(FieldConstructor));
}


function tearDown() {
  // NOTE(nicksantos): I think IE is blowing up on this call because
  // it is lame. It manifests its lameness by throwing an exception.
  // Kudos to XT for helping me to figure this out.
  try {
  } catch (e) {
  }
}

// Tests for the plugin interface.



/**
 * Dummy plugin for test usage.
 * @constructor
 * @extends {goog.editor.Plugin}
 * @final
 */
function TestPlugin() {
  TestPlugin.base(this, 'constructor');

  this.getTrogClassId = function() { return 'TestPlugin'; };

  this.handleKeyDown = goog.nullFunction;
  this.handleKeyPress = goog.nullFunction;
  this.handleKeyUp = goog.nullFunction;
  this.handleKeyboardShortcut = goog.nullFunction;
  this.isSupportedCommand = goog.nullFunction;
  this.execCommandInternal = goog.nullFunction;
  this.queryCommandValue = goog.nullFunction;
  this.activeOnUneditableFields = goog.nullFunction;
  this.handleSelectionChange = goog.nullFunction;
}
goog.inherits(TestPlugin, goog.editor.Plugin);


/**
 * Tests that calling registerPlugin will add the plugin to the
 * plugin map.
 */
function testRegisterPlugin() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();

  editableField.registerPlugin(plugin);

  assertEquals(
      'Registered plugin must be in protected plugin map.', plugin,
      editableField.plugins_[plugin.getTrogClassId()]);
  assertEquals(
      'Plugin has a keydown handler, should be in keydown map', plugin,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.KEYDOWN][0]);
  assertEquals(
      'Plugin has a keypress handler, should be in keypress map', plugin,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.KEYPRESS][0]);
  assertEquals(
      'Plugin has a keyup handler, should be in keuup map', plugin,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.KEYUP][0]);
  assertEquals(
      'Plugin has a selectionchange handler, should be in selectionchange map',
      plugin,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.SELECTION][0]);
  assertEquals(
      'Plugin has a shortcut handler, should be in shortcut map', plugin,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.SHORTCUT][0]);
  assertEquals(
      'Plugin has a execCommand, should be in execCommand map', plugin,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.EXEC_COMMAND][0]);
  assertEquals(
      'Plugin has a queryCommand, should be in queryCommand map', plugin,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.QUERY_COMMAND][0]);
  assertEquals(
      'Plugin does not have a prepareContentsHtml,' +
          'should not be in prepareContentsHtml map',
      undefined,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML]
                                   [0]);
  assertEquals(
      'Plugin does not have a cleanContentsDom,' +
          'should not be in cleanContentsDom map',
      undefined,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.CLEAN_CONTENTS_DOM]
                                   [0]);
  assertEquals(
      'Plugin does not have a cleanContentsHtml,' +
          'should not be in cleanContentsHtml map',
      undefined,
      editableField.indexedPlugins_[goog.editor.Plugin.Op.CLEAN_CONTENTS_HTML]
                                   [0]);

  editableField.dispose();
}


/**
 * Tests that calling unregisterPlugin will remove the plugin from
 * the map.
 */
function testUnregisterPlugin() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();

  editableField.registerPlugin(plugin);
  editableField.unregisterPlugin(plugin);

  assertUndefined(
      'Unregistered plugin must not be in protected plugin map.',
      editableField.plugins_[plugin.getTrogClassId()]);

  editableField.dispose();
}


/**
 * Tests that registered plugins can be fetched by their id.
 */
function testGetPluginByClassId() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();

  assertUndefined(
      'Must not be able to get unregistered plugins by class id.',
      editableField.getPluginByClassId(plugin.getTrogClassId()));

  editableField.registerPlugin(plugin);
  assertEquals(
      'Must be able to get registered plugins by class id.', plugin,
      editableField.getPluginByClassId(plugin.getTrogClassId()));
  editableField.dispose();
}


/**
 * Tests that plugins get auto disposed by default when the field is disposed.
 * Tests that plugins with setAutoDispose(false) do not get disposed when the
 * field is disposed.
 */
function testDisposed_PluginAutoDispose() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();

  var noDisposePlugin = new goog.editor.Plugin();
  noDisposePlugin.getTrogClassId = function() { return 'noDisposeId'; };
  noDisposePlugin.setAutoDispose(false);

  editableField.registerPlugin(plugin);
  editableField.registerPlugin(noDisposePlugin);
  editableField.dispose();
  assert(editableField.isDisposed());
  assertTrue(plugin.isDisposed());
  assertFalse(noDisposePlugin.isDisposed());
}

var STRING_KEY = String.fromCharCode(goog.events.KeyCodes.A).toLowerCase();


/**
 * @return {goog.events.Event} Returns an event for a keyboard shortcut
 * for the letter 'a'.
 */
function getBrowserEvent() {
  var e = new goog.events.BrowserEvent();
  e.ctrlKey = true;
  e.metaKey = true;
  e.charCode = goog.events.KeyCodes.A;
  return e;
}


/**
 * @param {boolean} followLinkInNewWindow Whether activating a hyperlink
 *     in the editable field will open a new window or not.
 * @return {!goog.editor.Field} Returns an editable field after its load phase.
 */
function createEditableFieldWithListeners(followLinkInNewWindow) {
  var editableField = new FieldConstructor('testField');
  editableField.setFollowLinkInNewWindow(followLinkInNewWindow);

  var originalElement = editableField.getOriginalElement();
  editableField.setupFieldObject(originalElement);
  editableField.handleFieldLoad();

  return editableField;
}

function getListenerTarget(editableField) {
  var elt = editableField.getElement();
  var listenerTarget = goog.editor.BrowserFeature.USE_DOCUMENT_FOR_KEY_EVENTS &&
          editableField.usesIframe() ?
      elt.ownerDocument :
      elt;
  return listenerTarget;
}

function assertClickDefaultActionIsCanceled(editableField) {
  var cancelClickDefaultActionListener = goog.events.getListener(
      getListenerTarget(editableField), goog.events.EventType.CLICK,
      goog.editor.Field.cancelLinkClick_, undefined, editableField);

  assertNotNull(cancelClickDefaultActionListener);
}

function assertClickDefaultActionIsNotCanceled(editableField) {
  var cancelClickDefaultActionListener = goog.events.getListener(
      getListenerTarget(editableField), goog.events.EventType.CLICK,
      goog.editor.Field.cancelLinkClick_, undefined, editableField);

  assertNull(cancelClickDefaultActionListener);
}


/**
 * Tests that plugins are disabled when the field is made uneditable.
 */

function testMakeUneditableDisablesPlugins() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();

  var calls = 0;
  plugin.disable = function(field) {
    assertEquals(editableField, field);
    assertTrue(field.isUneditable());
    calls++;
  };

  editableField.registerPlugin(plugin);
  editableField.makeEditable();

  assertEquals(0, calls);
  editableField.makeUneditable();

  assertEquals(1, calls);

  editableField.dispose();
}


/**
 * Test that if a browser open a new page when clicking a link in a content
 * editable element, a click listener is set to cancel this default action.
 */
function testClickDefaultActionIsCanceledWhenBrowserFollowsClick() {
  // Simulate a browser that will open a new page when activating a link in a
  // content editable element.
  var editableField =
      createEditableFieldWithListeners(true /* followLinkInNewWindow */);
  assertClickDefaultActionIsCanceled(editableField);

  editableField.dispose();
}


/**
 * Test that if a browser does not open a new page when clicking a link in a
 * content editable element, the click default action is not canceled.
 */
function testClickDefaultActionIsNotCanceledWhenBrowserDontFollowsClick() {
  // Simulate a browser that will NOT open a new page when activating a link in
  // a content editable element.
  var editableField =
      createEditableFieldWithListeners(false /* followLinkInNewWindow */);
  assertClickDefaultActionIsNotCanceled(editableField);

  editableField.dispose();
}


/**
 * Test that if a plugin registers keyup, it gets called.
 */
function testPluginKeyUp() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();

  var mockPlugin = new goog.testing.LooseMock(plugin);
  mockPlugin.getTrogClassId().$returns('mockPlugin');
  mockPlugin.registerFieldObject(editableField);
  mockPlugin.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin.handleKeyUp(e);
  mockPlugin.$replay();

  editableField.registerPlugin(mockPlugin);

  editableField.handleKeyUp_(e);

  mockPlugin.$verify();
}


/**
 * Test that if a plugin registers keydown, it gets called.
 */
function testPluginKeyDown() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();

  var mockPlugin = new goog.testing.LooseMock(plugin);
  mockPlugin.getTrogClassId().$returns('mockPlugin');
  mockPlugin.registerFieldObject(editableField);
  mockPlugin.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin.handleKeyDown(e).$returns(true);
  mockPlugin.$replay();

  editableField.registerPlugin(mockPlugin);

  editableField.handleKeyDown_(e);

  mockPlugin.$verify();
}


/**
 * Test that if a plugin registers keypress, it gets called.
 */
function testPluginKeyPress() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();

  var mockPlugin = new goog.testing.LooseMock(plugin);
  mockPlugin.getTrogClassId().$returns('mockPlugin');
  mockPlugin.registerFieldObject(editableField);
  mockPlugin.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin.handleKeyPress(e).$returns(true);
  mockPlugin.$replay();

  editableField.registerPlugin(mockPlugin);

  editableField.handleKeyPress_(e);

  mockPlugin.$verify();
}


/**
 * If one plugin handles a key event, the rest of the plugins do not get their
 * key handlers invoked.
 */
function testHandledKeyEvent() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();

  var mockPlugin1 = new goog.testing.LooseMock(plugin);
  mockPlugin1.getTrogClassId().$returns('mockPlugin1');
  mockPlugin1.registerFieldObject(editableField);
  mockPlugin1.isEnabled(editableField).$anyTimes().$returns(true);
  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    mockPlugin1.handleKeyDown(e).$returns(true);
  } else {
    mockPlugin1.handleKeyPress(e).$returns(true);
  }
  mockPlugin1.handleKeyUp(e).$returns(true);
  mockPlugin1.$replay();

  var mockPlugin2 = new goog.testing.LooseMock(plugin);
  mockPlugin2.getTrogClassId().$returns('mockPlugin2');
  mockPlugin2.registerFieldObject(editableField);
  mockPlugin2.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin2.$replay();

  editableField.registerPlugin(mockPlugin1);
  editableField.registerPlugin(mockPlugin2);

  editableField.handleKeyUp_(e);
  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    editableField.handleKeyDown_(e);
  } else {
    editableField.handleKeyPress_(e);
  }

  mockPlugin1.$verify();
  mockPlugin2.$verify();
}


/**
 * Tests to make sure the cut and paste events are not dispatched immediately.
 */
function testHandleCutAndPasteEvents() {
  if (goog.editor.BrowserFeature.USE_MUTATION_EVENTS) {
    // Cut and paste events do not raise events at all in Mozilla.
    return;
  }
  var editableField = new FieldConstructor('testField');
  var clock = new goog.testing.MockClock(true);
  var delayedChanges = goog.testing.recordFunction();
  goog.events.listen(
      editableField, goog.editor.Field.EventType.DELAYEDCHANGE, delayedChanges);

  editableField.makeEditable();

  goog.testing.events.fireBrowserEvent(
      new goog.testing.events.Event('cut', editableField.getElement()));
  assertEquals(
      'Cut event should be on a timer', 0, delayedChanges.getCallCount());
  clock.tick(1000);
  assertEquals(
      'delayed change event should fire within 1s after cut', 1,
      delayedChanges.getCallCount());

  goog.testing.events.fireBrowserEvent(
      new goog.testing.events.Event('paste', editableField.getElement()));
  assertEquals(
      'Paste event should be on a timer', 1, delayedChanges.getCallCount());
  clock.tick(1000);
  assertEquals(
      'delayed change event should fire within 1s after paste', 2,
      delayedChanges.getCallCount());

  clock.dispose();
  editableField.dispose();
}


/**
 * If the first plugin does not handle the key event, the next plugin gets
 * a chance to handle it.
 */
function testNotHandledKeyEvent() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();

  var mockPlugin1 = new goog.testing.LooseMock(plugin);
  mockPlugin1.getTrogClassId().$returns('mockPlugin1');
  mockPlugin1.registerFieldObject(editableField);
  mockPlugin1.isEnabled(editableField).$anyTimes().$returns(true);
  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    mockPlugin1.handleKeyDown(e).$returns(false);
  } else {
    mockPlugin1.handleKeyPress(e).$returns(false);
  }
  mockPlugin1.handleKeyUp(e).$returns(false);
  mockPlugin1.$replay();

  var mockPlugin2 = new goog.testing.LooseMock(plugin);
  mockPlugin2.getTrogClassId().$returns('mockPlugin2');
  mockPlugin2.registerFieldObject(editableField);
  mockPlugin2.isEnabled(editableField).$anyTimes().$returns(true);
  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    mockPlugin2.handleKeyDown(e).$returns(true);
  } else {
    mockPlugin2.handleKeyPress(e).$returns(true);
  }
  mockPlugin2.handleKeyUp(e).$returns(true);
  mockPlugin2.$replay();

  editableField.registerPlugin(mockPlugin1);
  editableField.registerPlugin(mockPlugin2);

  editableField.handleKeyUp_(e);
  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    editableField.handleKeyDown_(e);
  } else {
    editableField.handleKeyPress_(e);
  }

  mockPlugin1.$verify();
  mockPlugin2.$verify();
}


/**
 * Make sure that handleKeyboardShortcut is called if other key handlers
 * return false.
 */
function testKeyboardShortcutCalled() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();

  var mockPlugin = new goog.testing.LooseMock(plugin);
  mockPlugin.getTrogClassId().$returns('mockPlugin');
  mockPlugin.registerFieldObject(editableField);
  mockPlugin.isEnabled(editableField).$anyTimes().$returns(true);
  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    mockPlugin.handleKeyDown(e).$returns(false);
  } else {
    mockPlugin.handleKeyPress(e).$returns(false);
  }
  mockPlugin.handleKeyboardShortcut(e, STRING_KEY, true).$returns(false);
  mockPlugin.$replay();

  editableField.registerPlugin(mockPlugin);

  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    editableField.handleKeyDown_(e);
  } else {
    editableField.handleKeyPress_(e);
  }

  mockPlugin.$verify();
}


/**
 * Make sure that handleKeyboardShortcut is not called if other key handlers
 * return true.
 */
function testKeyboardShortcutNotCalled() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();

  var mockPlugin = new goog.testing.LooseMock(plugin);
  mockPlugin.getTrogClassId().$returns('mockPlugin');
  mockPlugin.registerFieldObject(editableField);
  mockPlugin.isEnabled(editableField).$anyTimes().$returns(true);
  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    mockPlugin.handleKeyDown(e).$returns(true);
  } else {
    mockPlugin.handleKeyPress(e).$returns(true);
  }
  mockPlugin.$replay();

  editableField.registerPlugin(mockPlugin);

  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    editableField.handleKeyDown_(e);
  } else {
    editableField.handleKeyPress_(e);
  }

  mockPlugin.$verify();
}


/**
 * Make sure that handleKeyboardShortcut is not called if alt is pressed.
 * @bug 1363959
 */
function testKeyHandlingAlt() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();
  e.altKey = true;

  var mockPlugin = new goog.testing.LooseMock(plugin);
  mockPlugin.getTrogClassId().$returns('mockPlugin');
  mockPlugin.registerFieldObject(editableField);
  mockPlugin.isEnabled(editableField).$anyTimes().$returns(true);
  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    mockPlugin.handleKeyDown(e).$returns(false);
  } else {
    mockPlugin.handleKeyPress(e).$returns(false);
  }
  mockPlugin.$replay();

  editableField.registerPlugin(mockPlugin);

  if (goog.editor.BrowserFeature.USES_KEYDOWN) {
    editableField.handleKeyDown_(e);
  } else {
    editableField.handleKeyPress_(e);
  }

  mockPlugin.$verify();
}


/**
 * Test that if a plugin has an execCommand function, it gets called
 * but only for supported commands.
 */
function testPluginExecCommand() {
  var plugin = new TestPlugin();
  var passedCommand, passedArg;
  plugin.execCommand = function(command, arg) {
    passedCommand = command;
    passedArg = arg;
  };

  var editableField = new FieldConstructor('testField');
  editableField.registerPlugin(plugin);
  plugin.enable(editableField);
  plugin.isSupportedCommand = goog.functions.constant(true);

  editableField.execCommand('+indent', true);
  // Verify that the plugin's execCommand was called with the correct
  // args.
  assertEquals('+indent', passedCommand);
  assertTrue(passedArg);

  passedCommand = null;
  passedArg = null;
  plugin.isSupportedCommand = goog.functions.constant(false);

  editableField.execCommand('+outdent', false);
  // Verify that a plugin's execCommand is not called if it isn't a supported
  // command.
  assertNull(passedCommand);
  assertNull(passedArg);

  editableField.dispose();
  plugin.dispose();
}


/**
 * Test that if one plugin supports execCommand, no other plugins
 * get a chance to handle the execComand.
 */
function testSupportedExecCommand() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();

  var mockPlugin1 = new goog.testing.LooseMock(plugin);
  mockPlugin1.getTrogClassId().$returns('mockPlugin1');
  mockPlugin1.registerFieldObject(editableField);
  mockPlugin1.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin1.isSupportedCommand('+indent').$returns(true);
  mockPlugin1.execCommandInternal('+indent').$returns(true);
  mockPlugin1.execCommand('+indent').$does(function() {
    mockPlugin1.execCommandInternal('+indent');
  });
  mockPlugin1.$replay();

  var mockPlugin2 = new goog.testing.LooseMock(plugin);
  mockPlugin2.getTrogClassId().$returns('mockPlugin2');
  mockPlugin2.registerFieldObject(editableField);
  mockPlugin2.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin2.$replay();

  editableField.registerPlugin(mockPlugin1);
  editableField.registerPlugin(mockPlugin2);

  editableField.execCommand('+indent');

  mockPlugin1.$verify();
  mockPlugin2.$verify();
}


/**
 * Test that if the first plugin does not support execCommand, the other
 * plugins get a chance to handle the execCommand.
 */
function testNotSupportedExecCommand() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();

  var mockPlugin1 = new goog.testing.LooseMock(plugin);
  mockPlugin1.getTrogClassId().$returns('mockPlugin1');
  mockPlugin1.registerFieldObject(editableField);
  mockPlugin1.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin1.isSupportedCommand('+indent').$returns(false);
  mockPlugin1.$replay();

  var mockPlugin2 = new goog.testing.LooseMock(plugin);
  mockPlugin2.getTrogClassId().$returns('mockPlugin2');
  mockPlugin2.registerFieldObject(editableField);
  mockPlugin2.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin2.isSupportedCommand('+indent').$returns(true);
  mockPlugin2.execCommandInternal('+indent').$returns(true);
  mockPlugin2.execCommand('+indent').$does(function() {
    mockPlugin2.execCommandInternal('+indent');
  });
  mockPlugin2.$replay();

  editableField.registerPlugin(mockPlugin1);
  editableField.registerPlugin(mockPlugin2);

  editableField.execCommand('+indent');

  mockPlugin1.$verify();
  mockPlugin2.$verify();
}


/**
 * Tests that if a plugin supports a command that its queryCommandValue
 * gets called and no further plugins can handle the queryCommandValue.
 */
function testSupportedQueryCommand() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();

  var mockPlugin1 = new goog.testing.LooseMock(plugin);
  mockPlugin1.getTrogClassId().$returns('mockPlugin1');
  mockPlugin1.registerFieldObject(editableField);
  mockPlugin1.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin1.isSupportedCommand('+indent').$returns(true);
  mockPlugin1.queryCommandValue('+indent').$returns(true);
  mockPlugin1.activeOnUneditableFields().$returns(true);
  mockPlugin1.$replay();

  var mockPlugin2 = new goog.testing.LooseMock(plugin);
  mockPlugin2.getTrogClassId().$returns('mockPlugin2');
  mockPlugin2.registerFieldObject(editableField);
  mockPlugin2.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin2.$replay();

  editableField.registerPlugin(mockPlugin1);
  editableField.registerPlugin(mockPlugin2);

  editableField.queryCommandValue('+indent');

  mockPlugin1.$verify();
  mockPlugin2.$verify();
}


/**
 * Tests that if the first plugin does not support a command that its
 * queryCommandValue do not get called and the next plugin can handle the
 * queryCommandValue.
 */
function testNotSupportedQueryCommand() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();

  var mockPlugin1 = new goog.testing.LooseMock(plugin);
  mockPlugin1.getTrogClassId().$returns('mockPlugin1');
  mockPlugin1.registerFieldObject(editableField);
  mockPlugin1.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin1.isSupportedCommand('+indent').$returns(false);
  mockPlugin1.$replay();

  var mockPlugin2 = new goog.testing.LooseMock(plugin);
  mockPlugin2.getTrogClassId().$returns('mockPlugin2');
  mockPlugin2.registerFieldObject(editableField);
  mockPlugin2.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin2.isSupportedCommand('+indent').$returns(true);
  mockPlugin2.queryCommandValue('+indent').$returns(true);
  mockPlugin2.activeOnUneditableFields().$returns(true);
  mockPlugin2.$replay();

  editableField.registerPlugin(mockPlugin1);
  editableField.registerPlugin(mockPlugin2);

  editableField.queryCommandValue('+indent');

  mockPlugin1.$verify();
  mockPlugin2.$verify();
}


/**
 * Tests that if a plugin handles selectionChange that it gets called and
 * no further plugins can handle the selectionChange.
 */
function testHandledSelectionChange() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();

  var mockPlugin1 = new goog.testing.LooseMock(plugin);
  mockPlugin1.getTrogClassId().$returns('mockPlugin1');
  mockPlugin1.registerFieldObject(editableField);
  mockPlugin1.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin1.handleSelectionChange(e, undefined).$returns(true);
  mockPlugin1.$replay();

  var mockPlugin2 = new goog.testing.LooseMock(plugin);
  mockPlugin2.getTrogClassId().$returns('mockPlugin2');
  mockPlugin2.registerFieldObject(editableField);
  mockPlugin2.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin2.$replay();

  editableField.registerPlugin(mockPlugin1);
  editableField.registerPlugin(mockPlugin2);

  editableField.dispatchSelectionChangeEvent(e);

  mockPlugin1.$verify();
  mockPlugin2.$verify();
}


/**
 * Tests that if the first plugin does not handle selectionChange that
 * the next plugin gets a chance to handle it.
 */
function testNotHandledSelectionChange() {
  var editableField = new FieldConstructor('testField');
  var plugin = new TestPlugin();
  var e = getBrowserEvent();

  var mockPlugin1 = new goog.testing.LooseMock(plugin);
  mockPlugin1.getTrogClassId().$returns('mockPlugin1');
  mockPlugin1.registerFieldObject(editableField);
  mockPlugin1.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin1.handleSelectionChange(e, undefined).$returns(false);
  mockPlugin1.$replay();

  var mockPlugin2 = new goog.testing.LooseMock(plugin);
  mockPlugin2.getTrogClassId().$returns('mockPlugin2');
  mockPlugin2.registerFieldObject(editableField);
  mockPlugin2.isEnabled(editableField).$anyTimes().$returns(true);
  mockPlugin2.handleSelectionChange(e, undefined).$returns(true);
  mockPlugin2.$replay();

  editableField.registerPlugin(mockPlugin1);
  editableField.registerPlugin(mockPlugin2);

  editableField.dispatchSelectionChangeEvent(e);

  mockPlugin1.$verify();
  mockPlugin2.$verify();
}


// Tests for goog.editor.Field internals.

function testSelectionChange() {
  var editableField = new FieldConstructor('testField', document);
  var clock = new goog.testing.MockClock(true);
  var beforeSelectionChanges = goog.testing.recordFunction();
  goog.events.listen(
      editableField, goog.editor.Field.EventType.BEFORESELECTIONCHANGE,
      beforeSelectionChanges);
  var selectionChanges = goog.testing.recordFunction();
  goog.events.listen(
      editableField, goog.editor.Field.EventType.SELECTIONCHANGE,
      selectionChanges);

  editableField.makeEditable();

  // Emulate pressing left arrow key, this should result in a
  // BEFORESELECTIONCHANGE event immediately, and a SELECTIONCHANGE event after
  // a short timeout.
  editableField.handleKeyUp_({keyCode: goog.events.KeyCodes.LEFT});
  assertEquals(
      'Before selection change should fire immediately', 1,
      beforeSelectionChanges.getCallCount());
  assertEquals(
      'Selection change should be on a timer', 0,
      selectionChanges.getCallCount());
  clock.tick(1000);
  assertEquals(
      'Selection change should fire within 1s', 1,
      selectionChanges.getCallCount());

  // Programically place cursor at start. SELECTIONCHANGE event should be fired.
  editableField.placeCursorAtStart();
  assertEquals(
      'Selection change should fire', 2, selectionChanges.getCallCount());

  clock.dispose();
  editableField.dispose();
}


function testSelectionChangeOnMouseUp() {
  var fakeEvent =
      new goog.events.BrowserEvent({type: 'mouseup', target: 'fakeTarget'});
  var editableField = new FieldConstructor('testField', document);
  var clock = new goog.testing.MockClock(true);
  var beforeSelectionChanges = goog.testing.recordFunction();
  goog.events.listen(
      editableField, goog.editor.Field.EventType.BEFORESELECTIONCHANGE,
      beforeSelectionChanges);
  var selectionChanges = goog.testing.recordFunction();
  goog.events.listen(
      editableField, goog.editor.Field.EventType.SELECTIONCHANGE,
      selectionChanges);

  var plugin = new TestPlugin();
  plugin.handleSelectionChange = goog.testing.recordFunction();
  editableField.registerPlugin(plugin);

  editableField.makeEditable();

  // Emulate a mouseup event, this should result in immediate
  // BEFORESELECTIONCHANGE and SELECTIONCHANGE, plus a second SELECTIONCHANGE in
  // IE after a short timeout.
  editableField.handleMouseUp_(fakeEvent);
  assertEquals(
      'Before selection change should fire immediately', 1,
      beforeSelectionChanges.getCallCount());
  assertEquals(
      'Selection change should fire immediately', 1,
      selectionChanges.getCallCount());
  assertEquals(
      'Plugin should have handled selection change immediately', 1,
      plugin.handleSelectionChange.getCallCount());
  assertEquals(
      'Plugin should have received original browser event to handle', fakeEvent,
      plugin.handleSelectionChange.getLastCall().getArguments()[0]);

  // Pretend another plugin fired a SELECTIONCHANGE in the meantime.
  editableField.dispatchSelectionChangeEvent();
  assertEquals(
      'Second selection change should fire immediately', 2,
      selectionChanges.getCallCount());
  assertEquals(
      'Plugin should have handled second selection change immediately', 2,
      plugin.handleSelectionChange.getCallCount());
  var args = plugin.handleSelectionChange.getLastCall().getArguments();
  assertTrue(
      'Plugin should not have received data from extra firing',
      args.length == 0 || !args[0] && (args.length == 1 || !args[1]));

  // Now check for the extra call in IE.
  clock.tick(1000);
  if (goog.userAgent.IE) {
    assertEquals(
        'Additional selection change should fire within 1s', 3,
        selectionChanges.getCallCount());
    assertEquals(
        'Plugin should have handled selection change within 1s', 3,
        plugin.handleSelectionChange.getCallCount());
    assertEquals(
        'Plugin should have received target of original browser event',
        fakeEvent.target,
        plugin.handleSelectionChange.getLastCall().getArguments().pop());
  } else {
    assertEquals(
        'No additional selection change should fire', 2,
        selectionChanges.getCallCount());
    assertEquals(
        'Plugin should not have handled selection change again', 2,
        plugin.handleSelectionChange.getCallCount());
  }

  clock.dispose();
  editableField.dispose();
}


function testSelectionChangeBeforeUneditable() {
  var editableField = new FieldConstructor('testField', document);
  var clock = new goog.testing.MockClock(true);
  var selectionChanges = goog.testing.recordFunction();
  goog.events.listen(
      editableField, goog.editor.Field.EventType.SELECTIONCHANGE,
      selectionChanges);

  editableField.makeEditable();
  editableField.handleKeyUp_({keyCode: goog.events.KeyCodes.LEFT});
  assertEquals(
      'Selection change should be on a timer', 0,
      selectionChanges.getCallCount());
  editableField.makeUneditable();
  assertEquals(
      'Selection change should fire during make uneditable', 1,
      selectionChanges.getCallCount());
  clock.tick(1000);
  assertEquals(
      'No additional selection change should fire', 1,
      selectionChanges.getCallCount());

  clock.dispose();
  editableField.dispose();
}


function testGetEditableDomHelper() {
  var editableField = new FieldConstructor('testField', document);
  assertNull(
      'Before being made editable, we do not know the dom helper',
      editableField.getEditableDomHelper());
  editableField.makeEditable();
  assertNotNull(
      'After being made editable, we know the dom helper',
      editableField.getEditableDomHelper());
  assertEquals(
      'Document from domHelper should be the editable elements doc',
      goog.dom.getOwnerDocument(editableField.getElement()),
      editableField.getEditableDomHelper().getDocument());
  editableField.dispose();
}


function testQueryCommandValue() {
  var editableField = new FieldConstructor('testField', document);
  assertFalse(editableField.queryCommandValue('boo'));
  assertObjectEquals(
      {'boo': false, 'aieee': false},
      editableField.queryCommandValue(['boo', 'aieee']));

  editableField.makeEditable();
  assertFalse(editableField.queryCommandValue('boo'));

  focusFieldSync(editableField);
  assertNull(editableField.queryCommandValue('boo'));
  assertObjectEquals(
      {'boo': null, 'aieee': null},
      editableField.queryCommandValue(['boo', 'aieee']));
  editableField.dispose();
}

function focusFieldSync(field) {
  field.focus();

  // IE fires focus events async, so create a fake focus event
  // synchronously.
  goog.testing.events.fireFocusEvent(field.getElement());
}


function testSetHtml() {
  var editableField = new FieldConstructor('testField', document);
  var clock = new goog.testing.MockClock(true);

  try {
    var delayedChangeCalled = false;
    goog.events.listen(
        editableField, goog.editor.Field.EventType.DELAYEDCHANGE,
        function() { delayedChangeCalled = true; });

    editableField.makeEditable();
    clock.tick(1000);
    assertFalse(
        'Make editable must not fire delayed change.', delayedChangeCalled);

    editableField.setHtml(false, 'bar', true /* Don't fire delayed change */);
    goog.testing.dom.assertHtmlContentsMatch('bar', editableField.getElement());
    clock.tick(1000);
    assertFalse(
        'setHtml must not fire delayed change if so configured.',
        delayedChangeCalled);

    editableField.setHtml(false, 'foo', false /* Fire delayed change */);
    goog.testing.dom.assertHtmlContentsMatch('foo', editableField.getElement());
    clock.tick(1000);
    assertTrue(
        'setHtml must fire delayed change by default', delayedChangeCalled);
  } finally {
    clock.dispose();
    editableField.dispose();
  }
}


/**
 * Helper to test that the cursor is placed at the beginning of the editable
 * field's contents.
 * @param {string=} opt_html Html to replace the test file default field
 *     contents with.
 * @param {string=} opt_parentId Id of the parent of the node where the cursor
 *     is expected to be placed. If omitted, will expect cursor to be placed in
 *     the first child of the field element (or, if the field has no content, in
 *     the field element itself).
 */
function doTestPlaceCursorAtStart(opt_html, opt_parentId) {
  var editableField = new FieldConstructor('testField', document);
  editableField.makeEditable();
  // Initially place selection not at the start of the editable field.
  var textNode = editableField.getElement().firstChild;
  goog.dom.Range.createFromNodes(textNode, 1, textNode, 2).select();
  if (opt_html != null) {
    editableField.getElement().innerHTML = opt_html;
  }

  editableField.placeCursorAtStart();
  var range = editableField.getRange();
  assertNotNull(
      'Placing the cursor should result in a range object being available',
      range);
  assertTrue('The range should be collapsed', range.isCollapsed());
  textNode = editableField.getElement().firstChild;

  // We check whether getAttribute exist because textNode may be an actual
  // TextNode, which does not have getAttribute.
  if (textNode && textNode.getAttribute &&
      textNode.getAttribute('_moz_editor_bogus_node')) {
    // At least in FF >= 6, assigning '' to innerHTML of a contentEditable
    // element will results in textNode being modified into:
    // <br _moz_editor_bogus_node="TRUE" _moz_dirty=""> instead of nulling
    // it. So we should null it ourself.
    textNode = null;
  }

  var startNode = opt_parentId ?
      editableField.getEditableDomHelper().getElement(opt_parentId).firstChild :
      textNode ? textNode : editableField.getElement();
  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('528')) {
    // Safari 3 seems to normalize the selection to the shallowest endpoint (in
    // this case the editable element) in all cases tested below. This is OK
    // because when you start typing it magically inserts the text at the
    // deepest endpoint, and even behaves as desired in the case tested by
    // testPlaceCursorAtStartNonImportantTextNode.
    startNode = editableField.getElement();
  }
  assertEquals(
      'The range should start at the specified expected node', startNode,
      range.getStartNode());
  assertEquals(
      'The range should start at the beginning of the node', 0,
      range.getStartOffset());
}


/**
 * Verify that restoreSavedRange() restores the range and sets the focus.
 */
function testRestoreSavedRange() {
  var editableField = new FieldConstructor('testField', document);
  editableField.makeEditable();


  // Create another node to take the focus later.
  var doc = goog.dom.getOwnerDocument(editableField.getElement());
  var otherElem = doc.createElement(goog.dom.TagName.DIV);
  otherElem.tabIndex = '1';  // Make it focusable.
  editableField.getElement().parentNode.appendChild(otherElem);

  // Initially place selection not at the start of the editable field.
  var textNode = editableField.getElement().firstChild;
  var range = goog.dom.Range.createFromNodes(textNode, 1, textNode, 2);
  range.select();
  var savedRange = goog.editor.range.saveUsingNormalizedCarets(range);

  // Change range to be a simple cursor at start, and move focus away.
  editableField.placeCursorAtStart();
  otherElem.focus();

  editableField.restoreSavedRange(savedRange);

  // Verify that we have focus and the range is restored.
  assertEquals(
      'Field should be focused', editableField.getElement(),
      goog.dom.getActiveElement(doc));
  var newRange = editableField.getRange();
  assertEquals('Range startNode', textNode, newRange.getStartNode());
  assertEquals('Range startOffset', 1, newRange.getStartOffset());
  assertEquals('Range endNode', textNode, newRange.getEndNode());
  assertEquals('Range endOffset', 2, newRange.getEndOffset());
}


function testPlaceCursorAtStart() {
  doTestPlaceCursorAtStart();
}


function testPlaceCursorAtStartEmptyField() {
  doTestPlaceCursorAtStart('');
}


function testPlaceCursorAtStartNonImportantTextNode() {
  doTestPlaceCursorAtStart(
      '\n<span id="important">important text</span>', 'important');
}


/**
 * Helper to test that the cursor is placed at the beginning of the editable
 * field's contents.
 * @param {string=} opt_html Html to replace the test file default field
 *     contents with.
 * @param {string=} opt_parentId Id of the parent of the node where the cursor
 *     is expected to be placed. If omitted, will expect cursor to be placed in
 *     the first child of the field element (or, if the field has no content, in
 *     the field element itself).
 * @param {number=} opt_offset The offset to expect for the end position.
 */
function doTestPlaceCursorAtEnd(opt_html, opt_parentId, opt_offset) {
  var editableField = new FieldConstructor('testField', document);
  editableField.makeEditable();

  // Initially place selection not at the end of the editable field.
  var textNode = editableField.getElement().firstChild;
  goog.dom.Range.createFromNodes(textNode, 0, textNode, 1).select();
  if (opt_html != null) {
    editableField.getElement().innerHTML = opt_html;
  }

  editableField.placeCursorAtEnd();
  var range = editableField.getRange();
  assertNotNull(
      'Placing the cursor should result in a range object being available',
      range);
  assertTrue('The range should be collapsed', range.isCollapsed());
  textNode = editableField.getElement().firstChild;

  // We check whether getAttribute exist because textNode may be an actual
  // TextNode, which does not have getAttribute.

  var hasBogusNode = textNode && textNode.getAttribute &&
      textNode.getAttribute('_moz_editor_bogus_node');
  if (hasBogusNode) {
    // At least in FF >= 6, assigning '' to innerHTML of a contentEditable
    // element will results in textNode being modified into:
    // <br _moz_editor_bogus_node="TRUE" _moz_dirty=""> instead of nulling
    // it. So we should null it ourself.
    textNode = null;
  }

  var endNode = opt_parentId ?
      editableField.getEditableDomHelper().getElement(opt_parentId).lastChild :
      textNode ? textNode : editableField.getElement();
  assertEquals(
      'The range should end at the specified expected node', endNode,
      range.getEndNode());
  var offset = goog.isDefAndNotNull(opt_offset) ? opt_offset : textNode ?
                                                  endNode.nodeValue.length :
                                                  endNode.childNodes.length - 1;
  if (hasBogusNode) {
    assertEquals(
        'The range should end at the ending of the bogus node ' +
            'added by FF',
        offset + 1, range.getEndOffset());
  } else {
    assertEquals(
        'The range should end at the ending of the node', offset,
        range.getEndOffset());
  }
}


function testPlaceCursorAtEnd() {
  doTestPlaceCursorAtEnd();
}


function testPlaceCursorAtEndEmptyField() {
  doTestPlaceCursorAtEnd('', null, 0);
}


function testPlaceCursorAtEndNonImportantTextNode() {
  doTestPlaceCursorAtStart(
      '\n<span id="important">important text</span>', 'important');
}


// Tests related to change/delayed change events.


function testClearDelayedChange() {
  var clock = new goog.testing.MockClock(true);
  var editableField = new FieldConstructor('testField', document);
  editableField.makeEditable();

  var delayedChangeCalled = false;
  goog.events.listen(
      editableField, goog.editor.Field.EventType.DELAYEDCHANGE,
      function() { delayedChangeCalled = true; });

  // Clears delayed change timer.
  editableField.delayedChangeTimer_.start();
  editableField.clearDelayedChange();
  assertTrue(delayedChangeCalled);
  if (editableField.changeTimerGecko_) {
    assertFalse(editableField.changeTimerGecko_.isActive());
  }
  assertFalse(editableField.delayedChangeTimer_.isActive());

  // Clears delayed changes caused by changeTimerGecko_
  if (editableField.changeTimerGecko_) {
    delayedChangeCalled = false;
    editableField.changeTimerGecko_.start();
    editableField.clearDelayedChange();
    assertTrue(delayedChangeCalled);
    if (editableField.changeTimerGecko_) {
      assertFalse(editableField.changeTimerGecko_.isActive());
    }
    assertFalse(editableField.delayedChangeTimer_.isActive());
  }
  clock.dispose();
}


function testHandleChange() {
  if (goog.editor.BrowserFeature.USE_MUTATION_EVENTS) {
    var editableField = new FieldConstructor('testField', document);
    editableField.makeEditable();

    editableField.changeTimerGecko_.start();
    editableField.handleChange();
    assertFalse(editableField.changeTimerGecko_.isActive());
  }
}


function testDispatchDelayedChange() {
  var editableField = new FieldConstructor('testField', document);
  editableField.makeEditable();

  editableField.delayedChangeTimer_.start();
  editableField.dispatchDelayedChange_();
  assertFalse(editableField.delayedChangeTimer_.isActive());
}


function testHandleWindowLevelMouseUp() {
  var editableField = new FieldConstructor('testField', document);
  if (editableField.usesIframe()) {
    // Only run this test if the editor does not use an iframe.
    return;
  }
  editableField.setUseWindowMouseUp(true);
  editableField.makeEditable();
  var selectionHasFired = false;
  goog.events.listenOnce(
      editableField, goog.editor.Field.EventType.SELECTIONCHANGE,
      function(e) { selectionHasFired = true; });
  var editableElement = editableField.getElement();
  var otherElement = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.insertSiblingAfter(otherElement, document.body.lastChild);

  goog.testing.events.fireMouseDownEvent(editableElement);
  assertFalse(selectionHasFired);
  goog.testing.events.fireMouseUpEvent(otherElement);
  assertTrue(selectionHasFired);
}

function testNoHandleWindowLevelMouseUp() {
  var editableField = new FieldConstructor('testField', document);
  editableField.setUseWindowMouseUp(false);
  editableField.makeEditable();
  var selectionHasFired = false;
  goog.events.listenOnce(
      editableField, goog.editor.Field.EventType.SELECTIONCHANGE,
      function(e) { selectionHasFired = true; });
  var editableElement = editableField.getElement();
  var otherElement = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.insertSiblingAfter(otherElement, document.body.lastChild);

  goog.testing.events.fireMouseDownEvent(editableElement);
  assertFalse(selectionHasFired);
  goog.testing.events.fireMouseUpEvent(otherElement);
  assertFalse(selectionHasFired);
}

function testIsGeneratingKey() {
  var regularKeyEvent = new goog.events.BrowserEvent();
  regularKeyEvent.charCode = goog.events.KeyCodes.A;

  var ctrlKeyEvent = new goog.events.BrowserEvent();
  ctrlKeyEvent.ctrlKey = true;
  ctrlKeyEvent.metaKey = true;
  ctrlKeyEvent.charCode = goog.events.KeyCodes.A;

  var imeKeyEvent = new goog.events.BrowserEvent();
  imeKeyEvent.keyCode =
      229;  // indicates from an IME - see KEYS_CAUSING_CHANGES

  assertTrue(goog.editor.Field.isGeneratingKey_(regularKeyEvent, true));
  assertFalse(goog.editor.Field.isGeneratingKey_(ctrlKeyEvent, true));
  if (goog.userAgent.WINDOWS && !goog.userAgent.GECKO) {
    assertTrue(goog.editor.Field.isGeneratingKey_(imeKeyEvent, false));
  } else {
    assertFalse(goog.editor.Field.isGeneratingKey_(imeKeyEvent, false));
  }
}

function testSetEditableClassName() {
  var element = goog.dom.getElement('testField');
  var editableField = new FieldConstructor('testField');

  assertFalse(goog.dom.classlist.contains(element, 'editable'));
  editableField.makeEditable();
  assertTrue(goog.dom.classlist.contains(element, 'editable'));
  assertEquals(
      1,
      goog.array.count(
          goog.dom.classlist.get(element), goog.functions.equalTo('editable')));

  // Skip restore won't reset the original element's CSS classes.
  editableField.makeUneditable(true /* opt_skipRestore */);

  editableField.makeEditable();
  assertTrue(goog.dom.classlist.contains(element, 'editable'));
  assertEquals(
      1,
      goog.array.count(
          goog.dom.classlist.get(element), goog.functions.equalTo('editable')));
}
