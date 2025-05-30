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

goog.provide('goog.ui.NativeButtonRendererTest');
goog.setTestOnly('goog.ui.NativeButtonRendererTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.NativeButtonRenderer');
goog.require('goog.userAgent');

var sandbox;
var renderer;
var expectedFailures;
var button;

function setUpPage() {
  sandbox = goog.dom.getElement('sandbox');
  renderer = goog.ui.NativeButtonRenderer.getInstance();
  expectedFailures = new goog.testing.ExpectedFailures();
}

function setUp() {
  button = new goog.ui.Button('Hello', renderer);
}

function tearDown() {
  button.dispose();
  goog.dom.removeChildren(sandbox);
  expectedFailures.handleTearDown();
}

function testConstructor() {
  assertNotNull('Renderer must not be null', renderer);
}

function testGetAriaRole() {
  assertUndefined('ARIA role must be undefined', renderer.getAriaRole());
}

function testCreateDom() {
  button.setTooltip('Hello, world!');
  button.setValue('foo');
  var element = renderer.createDom(button);
  assertNotNull('Element must not be null', element);
  assertEquals(
      'Element must be a button', goog.dom.TagName.BUTTON, element.tagName);
  assertSameElements(
      'Button element must have expected class name', ['goog-button'],
      goog.dom.classlist.get(element));
  assertFalse('Button element must be enabled', element.disabled);
  assertEquals(
      'Button element must have expected title', 'Hello, world!',
      element.title);
  // Expected to fail on IE.
  expectedFailures.expectFailureFor(goog.userAgent.IE);
  try {
    // See http://www.fourmilab.ch/fourmilog/archives/2007-03/000824.html
    // for a description of the problem.
    assertEquals(
        'Button element must have expected value', 'foo', element.value);
    assertEquals(
        'Button element must have expected contents', 'Hello',
        element.innerHTML);
  } catch (e) {
    expectedFailures.handleException(e);
  }
  assertFalse(
      'Button must not handle its own mouse events',
      button.isHandleMouseEvents());
  assertFalse(
      'Button must not support the custom FOCUSED state',
      button.isSupportedState(goog.ui.Component.State.FOCUSED));
}

function testCanDecorate() {
  sandbox.innerHTML = '<button id="buttonElement">Button</button>\n' +
      '<input id="inputButton" type="button" value="Input Button">\n' +
      '<input id="inputSubmit" type="submit" value="Input Submit">\n' +
      '<input id="inputReset" type="reset" value="Input Reset">\n' +
      '<input id="inputText" type="text" size="10">\n' +
      '<div id="divButton" class="goog-button">Hello</div>';

  assertTrue(
      'Must be able to decorate <button>',
      renderer.canDecorate(goog.dom.getElement('buttonElement')));
  assertTrue(
      'Must be able to decorate <input type="button">',
      renderer.canDecorate(goog.dom.getElement('inputButton')));
  assertTrue(
      'Must be able to decorate <input type="submit">',
      renderer.canDecorate(goog.dom.getElement('inputSubmit')));
  assertTrue(
      'Must be able to decorate <input type="reset">',
      renderer.canDecorate(goog.dom.getElement('inputReset')));
  assertFalse(
      'Must not be able to decorate <input type="text">',
      renderer.canDecorate(goog.dom.getElement('inputText')));
  assertFalse(
      'Must not be able to decorate <div class="goog-button">',
      renderer.canDecorate(goog.dom.getElement('divButton')));
}

function testDecorate() {
  sandbox.innerHTML =
      '<button id="foo" title="Hello!" value="bar">Foo Button</button>\n' +
      '<button id="disabledButton" value="bah" disabled="disabled">Disabled' +
      '</button>';

  var element = renderer.decorate(button, goog.dom.getElement('foo'));
  assertEquals(
      'Decorated element must be as expected', goog.dom.getElement('foo'),
      element);
  assertEquals(
      'Decorated button title must have expected value', 'Hello!',
      button.getTooltip());
  // Expected to fail on IE.
  expectedFailures.expectFailureFor(goog.userAgent.IE);
  try {
    // See http://www.fourmilab.ch/fourmilog/archives/2007-03/000824.html
    // for a description of the problem.
    assertEquals(
        'Decorated button value must have expected value', 'bar',
        button.getValue());
  } catch (e) {
    expectedFailures.handleException(e);
  }
  assertFalse(
      'Button must not handle its own mouse events',
      button.isHandleMouseEvents());
  assertFalse(
      'Button must not support the custom FOCUSED state',
      button.isSupportedState(goog.ui.Component.State.FOCUSED));

  element = renderer.decorate(button, goog.dom.getElement('disabledButton'));
  assertFalse('Decorated button must be disabled', button.isEnabled());
  assertSameElements(
      'Decorated button must have expected class names',
      ['goog-button', 'goog-button-disabled'], goog.dom.classlist.get(element));
  // Expected to fail on IE.
  expectedFailures.expectFailureFor(goog.userAgent.IE);
  try {
    // See http://www.fourmilab.ch/fourmilog/archives/2007-03/000824.html
    // for a description of the problem.
    assertEquals(
        'Decorated button value must have expected value', 'bah',
        button.getValue());
  } catch (e) {
    expectedFailures.handleException(e);
  }
  assertFalse(
      'Button must not handle its own mouse events',
      button.isHandleMouseEvents());
  assertFalse(
      'Button must not support the custom FOCUSED state',
      button.isSupportedState(goog.ui.Component.State.FOCUSED));
}

function testInitializeDom() {
  var dispatchedActionCount = 0;
  var handleAction = function() { dispatchedActionCount++; };
  goog.events.listen(button, goog.ui.Component.EventType.ACTION, handleAction);

  button.render(sandbox);
  goog.testing.events.fireClickSequence(button.getElement());
  assertEquals(
      'Button must have dispatched ACTION on click', 1, dispatchedActionCount);

  goog.events.unlisten(
      button, goog.ui.Component.EventType.ACTION, handleAction);
}

function testIsFocusable() {
  assertTrue('Enabled button must be focusable', renderer.isFocusable(button));
  button.setEnabled(false);
  assertFalse(
      'Disabled button must not be focusable', renderer.isFocusable(button));
}

function testSetState() {
  button.render(sandbox);
  assertFalse(
      'Button element must not be disabled', button.getElement().disabled);
  renderer.setState(button, goog.ui.Component.State.DISABLED, true);
  assertTrue('Button element must be disabled', button.getElement().disabled);
}

function testGetValue() {
  sandbox.innerHTML = '<button id="foo" value="blah">Hello</button>';
  // Expected to fail on IE.
  expectedFailures.expectFailureFor(goog.userAgent.IE);
  try {
    // See http://www.fourmilab.ch/fourmilog/archives/2007-03/000824.html
    // for a description of the problem.
    assertEquals(
        'Value must be as expected', 'blah',
        renderer.getValue(goog.dom.getElement('foo')));
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testSetValue() {
  button.render(sandbox);
  renderer.setValue(button.getElement(), 'What?');
  assertEquals(
      'Button must have expected value', 'What?',
      renderer.getValue(button.getElement()));
}

function testDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
      goog.ui.NativeButtonRenderer);
}
