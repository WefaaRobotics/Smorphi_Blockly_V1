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

goog.provide('goog.ui.ComboBoxTest');
goog.setTestOnly('goog.ui.ComboBoxTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.ComboBoxItem');
goog.require('goog.ui.Component');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');

var comboBox;
var input;

function setUp() {
  goog.dom.removeChildren(goog.dom.getElement('combo'));

  comboBox = new goog.ui.ComboBox();
  comboBox.setDefaultText('Select a color...');
  comboBox.addItem(new goog.ui.ComboBoxItem('Red'));
  comboBox.addItem(new goog.ui.ComboBoxItem('Maroon'));
  comboBox.addItem(new goog.ui.ComboBoxItem('Gre<en'));
  comboBox.addItem(new goog.ui.ComboBoxItem('Blue'));
  comboBox.addItem(new goog.ui.ComboBoxItem('Royal Blue'));
  comboBox.addItem(new goog.ui.ComboBoxItem('Yellow'));
  comboBox.addItem(new goog.ui.ComboBoxItem('Magenta'));
  comboBox.addItem(new goog.ui.ComboBoxItem('Mouve'));
  comboBox.addItem(new goog.ui.ComboBoxItem('Grey'));
  comboBox.render(goog.dom.getElement('combo'));

  input = comboBox.getInputElement();
}

function tearDown() {
  comboBox.dispose();
}

function testInputElementAttributes() {
  var comboBox = new goog.ui.ComboBox();
  comboBox.setFieldName('a_form_field');
  comboBox.createDom();
  var inputElement = comboBox.getInputElement();
  assertEquals('text', inputElement.type);
  assertEquals('a_form_field', inputElement.name);
  assertEquals('off', inputElement.autocomplete);
  comboBox.dispose();
}

function testSetDefaultText() {
  assertEquals('Select a color...', comboBox.getDefaultText());
  comboBox.setDefaultText('new default text...');
  assertEquals('new default text...', comboBox.getDefaultText());
  assertEquals('new default text...', comboBox.labelInput_.getLabel());
}

function testGetMenu() {
  assertTrue(
      'Menu should be instance of goog.ui.Menu',
      comboBox.getMenu() instanceof goog.ui.Menu);
  assertEquals(
      'Menu should have correct number of children', 9,
      comboBox.getMenu().getChildCount());
}

function testMenuBeginsInvisible() {
  assertFalse('Menu should begin invisible', comboBox.getMenu().isVisible());
}

function testClickCausesPopup() {
  goog.testing.events.fireClickSequence(input);
  assertTrue(
      'Menu becomes visible after click', comboBox.getMenu().isVisible());
}

function testUpKeyCausesPopup() {
  goog.testing.events.fireKeySequence(input, goog.events.KeyCodes.UP);
  assertTrue(
      'Menu becomes visible after UP key', comboBox.getMenu().isVisible());
}

function testActionSelectsItem() {
  comboBox.getMenu().getItemAt(2).dispatchEvent(
      goog.ui.Component.EventType.ACTION);
  assertEquals('Gre<en', input.value);
}

function testActionSelectsItemWithModel() {
  var itemWithModel = new goog.ui.MenuItem('one', 1);
  comboBox.addItem(itemWithModel);
  itemWithModel.dispatchEvent(goog.ui.Component.EventType.ACTION);
  assertEquals('one', comboBox.getValue());
}

function testRedisplayMenuAfterBackspace() {
  input.value = 'mx';
  comboBox.onInputEvent_();
  input.value = 'm';
  comboBox.onInputEvent_();
  assertEquals(
      'Three items should be displayed', 3,
      comboBox.getNumberOfVisibleItems_());
}

function testExternallyCreatedMenu() {
  var menu = new goog.ui.Menu();
  menu.decorate(goog.dom.getElement('menu'));
  assertTrue(
      'Menu items should be instances of goog.ui.ComboBoxItem',
      menu.getChildAt(0) instanceof goog.ui.ComboBoxItem);

  comboBox = new goog.ui.ComboBox(null, menu);
  comboBox.render(goog.dom.getElement('combo'));

  input = comboBox.getElement().getElementsByTagName(goog.dom.TagName.INPUT)[0];
  menu.getItemAt(2).dispatchEvent(goog.ui.Component.EventType.ACTION);
  assertEquals('Blue', input.value);
}

function testRecomputeVisibleCountAfterChangingItems() {
  input.value = 'Black';
  comboBox.onInputEvent_();
  assertEquals(
      'No items should be displayed', 0, comboBox.getNumberOfVisibleItems_());
  comboBox.addItem(new goog.ui.ComboBoxItem('Black'));
  assertEquals(
      'One item should be displayed', 1, comboBox.getNumberOfVisibleItems_());

  input.value = 'Red';
  comboBox.onInputEvent_();
  assertEquals(
      'One item should be displayed', 1, comboBox.getNumberOfVisibleItems_());
  comboBox.removeItemAt(0);  // Red
  assertEquals(
      'No items should be displayed', 0, comboBox.getNumberOfVisibleItems_());
}

function testSetEnabled() {
  // By default, everything should be enabled.
  assertFalse('Text input should initially not be disabled', input.disabled);
  assertFalse(
      'Text input should initially not look disabled',
      goog.dom.classlist.contains(
          input,
          goog.getCssName(
              goog.ui.LabelInput.prototype.labelCssClassName, 'disabled')));
  assertFalse(
      'Combo box should initially not look disabled',
      goog.dom.classlist.contains(
          comboBox.getElement(), goog.getCssName('goog-combobox-disabled')));
  goog.testing.events.fireClickSequence(comboBox.getElement());
  assertTrue(
      'Menu initially becomes visible after click',
      comboBox.getMenu().isVisible());
  goog.testing.events.fireClickSequence(document);
  assertFalse(
      'Menu initially becomes invisible after document click',
      comboBox.getMenu().isVisible());

  assertTrue(comboBox.isEnabled());
  comboBox.setEnabled(false);
  assertFalse(comboBox.isEnabled());
  assertTrue(
      'Text input should be disabled after being disabled', input.disabled);
  assertTrue(
      'Text input should appear disabled after being disabled',
      goog.dom.classlist.contains(
          input,
          goog.getCssName(
              goog.ui.LabelInput.prototype.labelCssClassName, 'disabled')));
  assertTrue(
      'Combo box should appear disabled after being disabled',
      goog.dom.classlist.contains(
          comboBox.getElement(), goog.getCssName('goog-combobox-disabled')));
  goog.testing.events.fireClickSequence(comboBox.getElement());
  assertFalse(
      'Menu should not become visible after click if disabled',
      comboBox.getMenu().isVisible());

  comboBox.setEnabled(true);
  assertTrue(comboBox.isEnabled());
  assertFalse(
      'Text input should not be disabled after being re-enabled',
      input.disabled);
  assertFalse(
      'Text input should not appear disabled after being re-enabled',
      goog.dom.classlist.contains(
          input,
          goog.getCssName(
              goog.ui.LabelInput.prototype.labelCssClassName, 'disabled')));
  assertFalse(
      'Combo box should not appear disabled after being re-enabled',
      goog.dom.classlist.contains(
          comboBox.getElement(), goog.getCssName('goog-combobox-disabled')));
  goog.testing.events.fireClickSequence(comboBox.getElement());
  assertTrue(
      'Menu becomes visible after click when re-enabled',
      comboBox.getMenu().isVisible());
  goog.testing.events.fireClickSequence(document);
  assertFalse(
      'Menu becomes invisible after document click when re-enabled',
      comboBox.getMenu().isVisible());
}

function testSetFormatFromToken() {
  var item = new goog.ui.ComboBoxItem('ABc');
  item.setFormatFromToken('b');
  var div = goog.dom.createDom(goog.dom.TagName.DIV);
  new goog.ui.ControlRenderer().setContent(div, item.getContent());
  assertTrue(div.innerHTML == 'A<b>B</b>c' || div.innerHTML == 'A<B>B</B>c');
}

function testSetValue() {
  var clock = new goog.testing.MockClock(/* autoInstall */ true);

  // Get the input focus. Note that both calls are needed to correctly
  // simulate the focus (and setting document.activeElement) across all
  // browsers.
  input.focus();
  goog.testing.events.fireClickSequence(input);

  // Simulate text input.
  input.value = 'Black';
  comboBox.onInputEvent_();
  clock.tick();
  assertEquals(
      'No items should be displayed', 0, comboBox.getNumberOfVisibleItems_());
  assertFalse('Menu should be invisible', comboBox.getMenu().isVisible());

  // Programmatic change with the input focus causes the menu visibility to
  // change if needed.
  comboBox.setValue('Blue');
  clock.tick();
  assertTrue('Menu should be visible1', comboBox.getMenu().isVisible());
  assertEquals(
      'One item should be displayed', 1, comboBox.getNumberOfVisibleItems_());

  // Simulate user input to ensure all the items are invisible again, then
  // blur away.
  input.value = 'Black';
  comboBox.onInputEvent_();
  clock.tick();
  input.blur();
  document.body.focus();
  clock.tick(goog.ui.ComboBox.BLUR_DISMISS_TIMER_MS);
  assertEquals(
      'No items should be displayed', 0, comboBox.getNumberOfVisibleItems_());
  assertFalse('Menu should be invisible', comboBox.getMenu().isVisible());

  // Programmatic change without the input focus does not pop up the menu,
  // but still updates the list of visible items within it.
  comboBox.setValue('Blue');
  clock.tick();
  assertFalse('Menu should be invisible', comboBox.getMenu().isVisible());
  assertEquals(
      'Menu should contain one item', 1, comboBox.getNumberOfVisibleItems_());

  // Click on the combobox. The entire menu becomes visible, the last item
  // (programmatically) set is highlighted.
  goog.testing.events.fireClickSequence(comboBox.getElement());
  assertTrue('Menu should be visible2', comboBox.getMenu().isVisible());
  assertEquals(
      'All items should be displayed', comboBox.getMenu().getItemCount(),
      comboBox.getNumberOfVisibleItems_());
  assertEquals(
      'The last item set should be highlighted',
      /* Blue= */ 3, comboBox.getMenu().getHighlightedIndex());

  clock.uninstall();
}
