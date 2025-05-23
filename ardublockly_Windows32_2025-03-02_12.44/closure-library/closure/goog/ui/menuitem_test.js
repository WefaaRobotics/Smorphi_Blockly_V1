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

goog.provide('goog.ui.MenuItemTest');
goog.setTestOnly('goog.ui.MenuItemTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events.KeyCodes');
goog.require('goog.math.Coordinate');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.Component');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuItemRenderer');

var sandbox;
var item;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  item = new goog.ui.MenuItem('Item');
}

function tearDown() {
  item.dispose();
  goog.dom.removeChildren(sandbox);
}

function testMenuItem() {
  assertNotNull('Instance must not be null', item);
  assertEquals(
      'Renderer must default to MenuItemRenderer singleton',
      goog.ui.MenuItemRenderer.getInstance(), item.getRenderer());
  assertEquals('Content must have expected value', 'Item', item.getContent());
  assertEquals(
      'Caption must default to the content', item.getContent(),
      item.getCaption());
  assertEquals(
      'Value must default to the caption', item.getCaption(), item.getValue());
}

function testMenuItemConstructor() {
  var model = 'Hello';
  var fakeDom = {};
  var fakeRenderer = {};

  var menuItem = new goog.ui.MenuItem('Item', model, fakeDom, fakeRenderer);
  assertEquals(
      'Content must have expected value', 'Item', menuItem.getContent());
  assertEquals(
      'Caption must default to the content', menuItem.getContent(),
      menuItem.getCaption());
  assertEquals('Model must be set', model, menuItem.getModel());
  assertNotEquals(
      'Value must not equal the caption', menuItem.getCaption(),
      menuItem.getValue());
  assertEquals('Value must equal the model', model, menuItem.getValue());
  assertEquals('DomHelper must be set', fakeDom, menuItem.getDomHelper());
  assertEquals('Renderer must be set', fakeRenderer, menuItem.getRenderer());
}

function testGetValue() {
  assertUndefined('Model must be undefined by default', item.getModel());
  assertEquals(
      'Without a model, value must default to the caption', item.getCaption(),
      item.getValue());
  item.setModel('Foo');
  assertEquals(
      'With a model, value must default to the model', item.getModel(),
      item.getValue());
}

function testSetValue() {
  assertUndefined('Model must be undefined by default', item.getModel());
  assertEquals(
      'Without a model, value must default to the caption', item.getCaption(),
      item.getValue());
  item.setValue(17);
  assertEquals('Value must be set', 17, item.getValue());
  assertEquals(
      'Value and model must be the same', item.getValue(), item.getModel());
}

function testGetSetContent() {
  assertEquals('Content must have expected value', 'Item', item.getContent());
  item.setContent(goog.dom.createDom(goog.dom.TagName.DIV, 'foo', 'Foo'));
  assertEquals(
      'Content must be an element', goog.dom.NodeType.ELEMENT,
      item.getContent().nodeType);
  assertHTMLEquals(
      'Content must be the expected element', '<div class="foo">Foo</div>',
      goog.dom.getOuterHtml(item.getContent()));
}

function testGetSetCaption() {
  assertEquals('Caption must have expected value', 'Item', item.getCaption());
  item.setCaption('Hello, world!');
  assertTrue('Caption must be a string', goog.isString(item.getCaption()));
  assertEquals(
      'Caption must have expected value', 'Hello, world!', item.getCaption());
  item.setContent(goog.dom.createDom(goog.dom.TagName.DIV, 'foo', 'Foo'));
  assertTrue('Caption must be a string', goog.isString(item.getCaption()));
  assertEquals('Caption must have expected value', 'Foo', item.getCaption());
}

function testGetSetContentAfterCreateDom() {
  item.createDom();
  assertEquals('Content must have expected value', 'Item', item.getContent());
  item.setContent(goog.dom.createDom(goog.dom.TagName.DIV, 'foo', 'Foo'));
  assertEquals(
      'Content must be an element', goog.dom.NodeType.ELEMENT,
      item.getContent().nodeType);
  assertHTMLEquals(
      'Content must be the expected element', '<div class="foo">Foo</div>',
      goog.dom.getOuterHtml(item.getContent()));
}

function testGetSetCaptionAfterCreateDom() {
  item.createDom();
  assertEquals('Caption must have expected value', 'Item', item.getCaption());
  item.setCaption('Hello, world!');
  assertTrue('Caption must be a string', goog.isString(item.getCaption()));
  assertEquals(
      'Caption must have expected value', 'Hello, world!', item.getCaption());
  item.setContent(goog.dom.createDom(goog.dom.TagName.DIV, 'foo', 'Foo'));
  assertTrue('Caption must be a string', goog.isString(item.getCaption()));
  assertEquals('Caption must have expected value', 'Foo', item.getCaption());

  var arrayContent = goog.array.clone(
      goog.dom.htmlToDocumentFragment(' <b> \xa0foo</b><i>  bar</i> ')
          .childNodes);
  item.setContent(arrayContent);
  assertEquals(
      'whitespaces must be normalized in the caption', '\xa0foo bar',
      item.getCaption());
}

function testSetSelectable() {
  assertFalse(
      'Item must not be selectable by default',
      item.isSupportedState(goog.ui.Component.State.SELECTED));
  item.setSelectable(true);
  assertTrue(
      'Item must be selectable',
      item.isSupportedState(goog.ui.Component.State.SELECTED));
  item.setSelected(true);
  assertTrue('Item must be selected', item.isSelected());
  assertFalse('Item must not be checked', item.isChecked());
  item.setSelectable(false);
  assertFalse(
      'Item must not no longer be selectable',
      item.isSupportedState(goog.ui.Component.State.SELECTED));
  assertFalse('Item must no longer be selected', item.isSelected());
  assertFalse('Item must not be checked', item.isChecked());
}

function testSetCheckable() {
  assertFalse(
      'Item must not be checkable by default',
      item.isSupportedState(goog.ui.Component.State.CHECKED));
  item.setCheckable(true);
  assertTrue(
      'Item must be checkable',
      item.isSupportedState(goog.ui.Component.State.CHECKED));
  item.setChecked(true);
  assertTrue('Item must be checked', item.isChecked());
  assertFalse('Item must not be selected', item.isSelected());
  item.setCheckable(false);
  assertFalse(
      'Item must not no longer be checkable',
      item.isSupportedState(goog.ui.Component.State.CHECKED));
  assertFalse('Item must no longer be checked', item.isChecked());
  assertFalse('Item must not be selected', item.isSelected());
}

function testSetSelectableBeforeCreateDom() {
  item.setSelectable(true);
  item.createDom();
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  item.setSelectable(false);
  assertFalse(
      'Item must no longer have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
}

function testSetCheckableBeforeCreateDom() {
  item.setCheckable(true);
  item.createDom();
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertEquals(
      'Element must have ARIA role menuitemcheckbox',
      goog.a11y.aria.Role.MENU_ITEM_CHECKBOX,
      goog.a11y.aria.getRole(item.getElement()));
  item.setCheckable(false);
  assertFalse(
      'Item must no longer have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
}

function testSetSelectableAfterCreateDom() {
  item.createDom();
  item.setSelectable(true);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertEquals(
      'Element must have ARIA role menuitemradio',
      goog.a11y.aria.Role.MENU_ITEM_RADIO,
      goog.a11y.aria.getRole(item.getElement()));
  item.setSelectable(false);
  assertFalse(
      'Item must no longer have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
}

function testSetCheckableAfterCreateDom() {
  item.createDom();
  item.setCheckable(true);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  item.setCheckable(false);
  assertFalse(
      'Item must no longer have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
}

function testSelectableBehavior() {
  item.setSelectable(true);
  item.render(sandbox);
  assertFalse('Item must not be selected by default', item.isSelected());
  item.performActionInternal();
  assertTrue('Item must be selected', item.isSelected());
  item.performActionInternal();
  assertTrue('Item must still be selected', item.isSelected());
}

function testCheckableBehavior() {
  item.setCheckable(true);
  item.render(sandbox);
  assertFalse('Item must not be checked by default', item.isChecked());
  item.performActionInternal();
  assertTrue('Item must be checked', item.isChecked());
  item.performActionInternal();
  assertFalse('Item must no longer be checked', item.isChecked());
}

function testGetSetContentForItemWithCheckBox() {
  item.setSelectable(true);
  item.createDom();

  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertEquals(
      'getContent() must not return the checkbox structure', 'Item',
      item.getContent());

  item.setContent('Hello');
  assertEquals(
      'getContent() must not return the checkbox structure', 'Hello',
      item.getContent());
  assertTrue(
      'Item must still have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));

  item.setContent(goog.dom.createDom(goog.dom.TagName.SPAN, 'foo', 'Foo'));
  assertEquals(
      'getContent() must return element', goog.dom.NodeType.ELEMENT,
      item.getContent().nodeType);
  assertTrue(
      'Item must still have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));

  item.setContent(null);
  assertNull('getContent() must return null', item.getContent());
  assertTrue(
      'Item must still have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
}

function testGetSetCaptionForItemWithCheckBox() {
  item.setCheckable(true);
  item.createDom();

  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertEquals(
      'getCaption() must not return the checkbox structure', 'Item',
      item.getCaption());

  item.setCaption('Hello');
  assertEquals(
      'getCaption() must not return the checkbox structure', 'Hello',
      item.getCaption());
  assertTrue(
      'Item must still have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));

  item.setContent(goog.dom.createDom(goog.dom.TagName.SPAN, 'foo', 'Foo'));
  assertEquals(
      'getCaption() must return text content', 'Foo', item.getCaption());
  assertTrue(
      'Item must still have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));

  item.setCaption('');
  assertEquals('getCaption() must return empty string', '', item.getCaption());
  assertTrue(
      'Item must still have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
}

function testGetSetCaptionForItemWithAccelerators() {
  var contentArr = [];
  contentArr.push(
      goog.dom.createDom(
          goog.dom.TagName.SPAN, goog.getCssName('goog-menuitem-accel'),
          'Ctrl+1'));
  contentArr.push(goog.dom.createTextNode('Hello'));
  item.setCaption(contentArr);
  assertEquals(
      'getCaption() must not return the accelerator', 'Hello',
      item.getCaption());

  item.setCaption([goog.dom.createDom(
      goog.dom.TagName.SPAN, goog.getCssName('goog-menuitem-accel'),
      'Ctrl+1')]);
  assertEquals('getCaption() must return empty string', '', item.getCaption());

  assertEquals(
      'getAccelerator() should return the accelerator', 'Ctrl+1',
      item.getAccelerator());
}

function testGetSetCaptionForItemWithMnemonics() {
  var contentArr = [];
  contentArr.push(
      goog.dom.createDom(
          goog.dom.TagName.SPAN, goog.getCssName('goog-menuitem-mnemonic-hint'),
          'H'));
  contentArr.push(goog.dom.createTextNode('ello'));
  item.setCaption(contentArr);
  assertEquals(
      'getCaption() must not return hint markup', 'Hello', item.getCaption());

  contentArr = [];
  contentArr.push(goog.dom.createTextNode('Hello'));
  contentArr.push(
      goog.dom.createDom(
          goog.dom.TagName.SPAN,
          goog.getCssName('goog-menuitem-mnemonic-separator'), '(',
          goog.dom.createDom(
              goog.dom.TagName.SPAN,
              goog.getCssName('goog-menuitem-mnemonic-hint'), 'J'),
          ')'));
  item.setCaption(contentArr);
  assertEquals(
      'getCaption() must not return the paranethetical mnemonic', 'Hello',
      item.getCaption());

  item.setCaption('');
  assertEquals(
      'getCaption() must return the empty string', '', item.getCaption());
}

function testHandleKeyEventInternalWithMnemonic() {
  item.performActionInternal =
      goog.testing.recordFunction(item.performActionInternal);
  item.setMnemonic(goog.events.KeyCodes.F);
  item.handleKeyEventInternal({'keyCode': goog.events.KeyCodes.F});
  assertEquals(
      'performActionInternal must be called', 1,
      item.performActionInternal.getCallCount());
}

function testHandleKeyEventInternalWithoutMnemonic() {
  item.performActionInternal =
      goog.testing.recordFunction(item.performActionInternal);
  item.handleKeyEventInternal({'keyCode': goog.events.KeyCodes.F});
  assertEquals(
      'performActionInternal must not be called without a' +
          ' mnemonic',
      0, item.performActionInternal.getCallCount());
}

function testRender() {
  item.render(sandbox);
  var contentElement = item.getContentElement();
  assertNotNull('Content element must exist', contentElement);
  assertTrue(
      'Content element must have expected class name',
      goog.dom.classlist.contains(
          contentElement,
          item.getRenderer().getStructuralCssClass() + '-content'));
  assertHTMLEquals(
      'Content element must have expected structure', 'Item',
      contentElement.innerHTML);
}

function testRenderSelectableItem() {
  item.setSelectable(true);
  item.render(sandbox);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertEquals('getCaption() return expected value', 'Item', item.getCaption());
}

function testRenderSelectedItem() {
  item.setSelectable(true);
  item.setSelected(true);
  item.render(sandbox);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertTrue(
      'Item must have selected style',
      goog.dom.classlist.contains(
          item.getElement(), item.getRenderer().getClassForState(
                                 goog.ui.Component.State.SELECTED)));
}

function testRenderCheckableItem() {
  item.setCheckable(true);
  item.render(sandbox);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertEquals('getCaption() return expected value', 'Item', item.getCaption());
}

function testRenderCheckedItem() {
  item.setCheckable(true);
  item.setChecked(true);
  item.render(sandbox);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertTrue(
      'Item must have checked style',
      goog.dom.classlist.contains(
          item.getElement(), item.getRenderer().getClassForState(
                                 goog.ui.Component.State.CHECKED)));
}

function testDecorate() {
  sandbox.innerHTML = '<div id="foo">Foo</div>';
  var foo = goog.dom.getElement('foo');
  item.decorate(foo);
  assertEquals('Decorated element must be as expected', foo, item.getElement());
  assertTrue(
      'Decorated element must have expected class name',
      goog.dom.classlist.contains(
          item.getElement(), item.getRenderer().getCssClass()));
  assertEquals(
      'Content element must be the decorated element\'s child',
      item.getContentElement(), item.getElement().firstChild);
  assertHTMLEquals(
      'Content must have expected structure', 'Foo',
      item.getContentElement().innerHTML);
}

function testDecorateCheckableItem() {
  sandbox.innerHTML = '<div id="foo" class="goog-option">Foo</div>';
  var foo = goog.dom.getElement('foo');
  item.decorate(foo);
  assertEquals('Decorated element must be as expected', foo, item.getElement());
  assertTrue(
      'Decorated element must have expected class name',
      goog.dom.classlist.contains(
          item.getElement(), item.getRenderer().getCssClass()));
  assertEquals(
      'Content element must be the decorated element\'s child',
      item.getContentElement(), item.getElement().firstChild);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertFalse('Item must not be checked', item.isChecked());
}

function testDecorateCheckedItem() {
  sandbox.innerHTML =
      '<div id="foo" class="goog-option goog-option-selected">Foo</div>';
  var foo = goog.dom.getElement('foo');
  item.decorate(foo);
  assertEquals('Decorated element must be as expected', foo, item.getElement());
  assertSameElements(
      'Decorated element must have expected class names',
      ['goog-menuitem', 'goog-option', 'goog-option-selected'],
      goog.dom.classlist.get(item.getElement()));
  assertEquals(
      'Content element must be the decorated element\'s child',
      item.getContentElement(), item.getElement().firstChild);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertTrue('Item must be checked', item.isChecked());
}

function testDecorateTemplate() {
  sandbox.innerHTML = '<div id="foo" class="goog-menuitem">' +
      '<div class="goog-menuitem-content">Foo</div></div>';
  var foo = goog.dom.getElement('foo');
  item.decorate(foo);
  assertEquals('Decorated element must be as expected', foo, item.getElement());
  assertTrue(
      'Decorated element must have expected class name',
      goog.dom.classlist.contains(
          item.getElement(), item.getRenderer().getCssClass()));
  assertEquals(
      'Content element must be the decorated element\'s child',
      item.getContentElement(), item.getElement().firstChild);
  assertHTMLEquals(
      'Content must have expected structure', 'Foo',
      item.getContentElement().innerHTML);
}

function testDecorateCheckableItemTemplate() {
  sandbox.innerHTML = '<div id="foo" class="goog-menuitem goog-option">' +
      '<div class="goog-menuitem-content">' +
      '<div class="goog-menuitem-checkbox"></div>' +
      'Foo</div></div>';
  var foo = goog.dom.getElement('foo');
  item.decorate(foo);
  assertEquals('Decorated element must be as expected', foo, item.getElement());
  assertTrue(
      'Decorated element must have expected class name',
      goog.dom.classlist.contains(
          item.getElement(), item.getRenderer().getCssClass()));
  assertEquals(
      'Content element must be the decorated element\'s child',
      item.getContentElement(), item.getElement().firstChild);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertEquals(
      'Item must have exactly one checkbox structure', 1,
      goog.dom
          .getElementsByTagNameAndClass(
              goog.dom.TagName.DIV, 'goog-menuitem-checkbox', item.getElement())
          .length);
  assertFalse('Item must not be checked', item.isChecked());
}

function testDecorateCheckedItemTemplate() {
  sandbox.innerHTML = '<div id="foo" ' +
      'class="goog-menuitem goog-option goog-option-selected">' +
      '<div class="goog-menuitem-content">' +
      '<div class="goog-menuitem-checkbox"></div>' +
      'Foo</div></div>';
  var foo = goog.dom.getElement('foo');
  item.decorate(foo);
  assertEquals('Decorated element must be as expected', foo, item.getElement());
  assertSameElements(
      'Decorated element must have expected class names',
      ['goog-menuitem', 'goog-option', 'goog-option-selected'],
      goog.dom.classlist.get(item.getElement()));
  assertEquals(
      'Content element must be the decorated element\'s child',
      item.getContentElement(), item.getElement().firstChild);
  assertTrue(
      'Item must have checkbox structure',
      item.getRenderer().hasCheckBoxStructure(item.getElement()));
  assertEquals(
      'Item must have exactly one checkbox structure', 1,
      goog.dom
          .getElementsByTagNameAndClass(
              goog.dom.TagName.DIV, 'goog-menuitem-checkbox', item.getElement())
          .length);
  assertTrue('Item must be checked', item.isChecked());
}


/** @bug 1463524 */
function testHandleMouseUp() {
  var COORDS_1 = new goog.math.Coordinate(1, 1);
  var COORDS_2 = new goog.math.Coordinate(2, 2);
  item.setActive(true);
  // Override performActionInternal() for testing purposes.
  var actionPerformed;
  item.performActionInternal = function() {
    actionPerformed = true;
    return true;
  };
  item.render(sandbox);

  // Scenario 1: item has no parent.
  actionPerformed = false;
  item.setActive(true);
  goog.testing.events.fireMouseUpEvent(item.getElement());
  assertTrue('Action should be performed on mouseup', actionPerformed);

  // Scenario 2: item has a parent.
  actionPerformed = false;
  item.setActive(true);
  var parent = new goog.ui.Component();
  var parentElem = goog.dom.getElement('parentComponent');
  parent.render(parentElem);
  parent.addChild(item);
  parent.openingCoords = COORDS_1;
  goog.testing.events.fireMouseUpEvent(item.getElement(), undefined, COORDS_2);
  assertTrue('Action should be performed on mouseup', actionPerformed);

  // Scenario 3: item has a parent which was opened during mousedown, and
  // item, and now the mouseup fires at the same coords.
  actionPerformed = false;
  item.setActive(true);
  parent.openingCoords = COORDS_2;
  goog.testing.events.fireMouseUpEvent(item.getElement(), undefined, COORDS_2);
  assertFalse('Action should not be performed on mouseup', actionPerformed);
}

function testSetAriaLabel() {
  assertNull('Item must not have aria label by default', item.getAriaLabel());
  item.setAriaLabel('Item 1');
  item.render(sandbox);
  var el = item.getElementStrict();
  assertEquals(
      'Item element must have expected aria-label', 'Item 1',
      el.getAttribute('aria-label'));
  assertEquals(
      'Item element must have expected aria-role', 'menuitem',
      el.getAttribute('role'));
  item.setAriaLabel('Item 2');
  assertEquals(
      'Item element must have updated aria-label', 'Item 2',
      el.getAttribute('aria-label'));
  assertEquals(
      'Item element must have expected aria-role', 'menuitem',
      el.getAttribute('role'));
}
