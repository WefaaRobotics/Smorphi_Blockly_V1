// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.tweak.TweakUiTest');
goog.setTestOnly('goog.tweak.TweakUiTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.string');
goog.require('goog.testing.jsunit');
goog.require('goog.tweak');
goog.require('goog.tweak.TweakUi');
/** @suppress {extraRequire} needed for createRegistryEntries. */
goog.require('goog.tweak.testhelpers');

var root;
var registry;
var EXPECTED_ENTRIES_COUNT = 14;

function setUp() {
  root = document.getElementById('root');
  // Make both test cases use the same entries in order to be able to test that
  // having two UIs on the same page does not cause trouble.
  createRegistryEntries('');
  registry = goog.tweak.getRegistry();
}

function tearDown() {
  goog.tweak.activeBooleanGroup_ = null;
  // When debugging a single test, don't clear out the DOM.
  if (window.location.search.indexOf('runTests') == -1) {
    goog.dom.removeChildren(root);
  }
}

function tearDownPage() {
  // When debugging a single test, don't clear out the DOM.
  if (window.location.search.indexOf('runTests') != -1) {
    return;
  }
  // Create both registries for interactive testing.
  createRegistryEntries('');
  registry = goog.tweak.getRegistry();
  // Add an extra tweak for testing the creation of tweaks after the UI has
  // already been rendered.
  var entryCounter = 0;
  goog.tweak.registerButton(
      'CreateNewTweak', 'Creates a new tweak. Meant ' +
          'to simulate a tweak being registered in a lazy-loaded module.',
      function() {
        goog.tweak.registerBoolean(
            'Lazy' + ++entryCounter, 'Lazy-loaded tweak.');
      });
  goog.tweak.registerButton(
      'CreateNewTweakInNamespace1',
      'Creates a new tweak within a namespace. Meant to simulate a tweak ' +
          'being registered in a lazy-loaded module.',
      function() {
        goog.tweak.registerString(
            'foo.bar.Lazy' + ++entryCounter, 'Lazy-loaded tweak.');
      });
  goog.tweak.registerButton(
      'CreateNewTweakInNamespace2',
      'Creates a new tweak within a namespace. Meant to simulate a tweak ' +
          'being registered in a lazy-loaded module.',
      function() {
        goog.tweak.registerNumber(
            'foo.bar.baz.Lazy' + ++entryCounter, 'Lazy combo', 3,
            {validValues: [1, 2, 3], label: 'Lazy!'});
      });

  var label = document.createElement('h3');
  goog.dom.setTextContent(label, 'TweakUi:');
  root.appendChild(label);
  createUi(false);

  label = document.createElement('h3');
  goog.dom.setTextContent(label, 'Collapsible:');
  root.appendChild(label);
  createUi(true);
}

function createUi(collapsible) {
  var tweakUiElem = collapsible ? goog.tweak.TweakUi.createCollapsible() :
                                  goog.tweak.TweakUi.create();
  root.appendChild(tweakUiElem);
}

function getAllEntryDivs() {
  return goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.tweak.TweakUi.ENTRY_CSS_CLASS_);
}

function getEntryDiv(entry) {
  var label = goog.tweak.TweakUi.getNamespacedLabel_(entry);
  var allDivs = getAllEntryDivs();
  var ret;
  for (var i = 0, div; div = allDivs[i]; i++) {
    var divText = goog.dom.getTextContent(div);
    if (goog.string.startsWith(divText, label) &&
        goog.string.contains(divText, entry.description)) {
      assertFalse('Found multiple divs matching entry ' + entry.getId(), !!ret);
      ret = div;
    }
  }
  assertTrue('getEntryDiv failed for ' + entry.getId(), !!ret);
  return ret;
}

function getEntryInput(entry) {
  var div = getEntryDiv(entry);
  return div.getElementsByTagName(goog.dom.TagName.INPUT)[0] ||
      div.getElementsByTagName(goog.dom.TagName.SELECT)[0];
}

function testCreate() {
  createUi(false);
  assertEquals(
      'Wrong number of entry divs.', EXPECTED_ENTRIES_COUNT,
      getAllEntryDivs().length);

  assertFalse(
      'checkbox should not be checked 1', getEntryInput(boolEntry).checked);
  assertTrue('checkbox should be checked 2', getEntryInput(boolEntry2).checked);
  // Enusre custom labels are being used.
  var html =
      document.getElementsByTagName(goog.dom.TagName.BUTTON)[0].innerHTML;
  assertTrue('Button label is wrong', html.indexOf('&lt;btn&gt;') > -1);
  html = getEntryDiv(numEnumEntry).innerHTML;
  assertTrue('Enum2 label is wrong', html.indexOf('second&amp;') > -1);
}

function testToggleBooleanSetting() {
  boolEntry.setValue(true);
  createUi(false);

  assertTrue('checkbox should be checked', getEntryInput(boolEntry).checked);

  boolEntry.setValue(false);
  assertFalse(
      'checkbox should not be checked 1', getEntryInput(boolEntry).checked);
}

function testToggleStringSetting() {
  strEntry.setValue('val1');
  createUi(false);

  assertEquals(
      'Textbox has wrong value 1', 'val1', getEntryInput(strEntry).value);

  strEntry.setValue('val2');
  assertEquals(
      'Textbox has wrong value 2', 'val2', getEntryInput(strEntry).value);
}

function testToggleStringEnumSetting() {
  strEnumEntry.setValue('B');
  createUi(false);

  assertEquals('wrong value 1', 'B', getEntryInput(strEnumEntry).value);

  strEnumEntry.setValue('C');
  assertEquals('wrong value 2', 'C', getEntryInput(strEnumEntry).value);
}


function testToggleNumericSetting() {
  numEntry.setValue(3);
  createUi(false);

  assertEquals('wrong value 1', '3', getEntryInput(numEntry).value);

  numEntry.setValue(4);
  assertEquals('wrong value 2', '4', getEntryInput(numEntry).value);
}

function testToggleNumericEnumSetting() {
  numEnumEntry.setValue(2);
  createUi(false);

  assertEquals('wrong value 1', '2', getEntryInput(numEnumEntry).value);

  numEnumEntry.setValue(3);
  assertEquals('wrong value 2', '3', getEntryInput(numEnumEntry).value);
}

function testClickBooleanSetting() {
  createUi(false);

  var input = getEntryInput(boolEntry);
  input.checked = true;
  input.onchange();
  assertTrue('setting should be true', boolEntry.getNewValue());
  input.checked = false;
  input.onchange();
  assertFalse('setting should be false', boolEntry.getNewValue());
}

function testToggleDescriptions() {
  createUi(false);
  var toggleLink = root.getElementsByTagName(goog.dom.TagName.A)[0];
  var heightBefore = root.offsetHeight;
  toggleLink.onclick();
  assertTrue(
      'Expected div height to grow from toggle descriptions.',
      root.offsetHeight > heightBefore);
  toggleLink.onclick();
  assertEquals(
      'Expected div height to revert from toggle descriptions.', heightBefore,
      root.offsetHeight);
}

function assertEntryOrder(entryId1, entryId2) {
  var entry1 = registry.getEntry(entryId1);
  var entry2 = registry.getEntry(entryId2);
  var div1 = getEntryDiv(entry1);
  var div2 = getEntryDiv(entry2);
  var order = goog.dom.compareNodeOrder(div1, div2);
  assertTrue(entry1.getId() + ' should be before ' + entry2.getId(), order < 0);
}

function testAddEntry() {
  createUi(false);
  goog.tweak.registerBoolean('Lazy1', 'Lazy-loaded tweak.');
  goog.tweak.registerBoolean(
      'Lazy2', 'Lazy-loaded tweak.',
      /* defaultValue */ false, {restartRequired: false});
  goog.tweak.beginBooleanGroup('LazyGroup', 'Lazy-loaded tweak.');
  goog.tweak.registerBoolean('Lazy3', 'Lazy-loaded tweak.');
  goog.tweak.endBooleanGroup();

  assertEquals(
      'Wrong number of entry divs.', EXPECTED_ENTRIES_COUNT + 4,
      getAllEntryDivs().length);
  assertEntryOrder('Enum2', 'Lazy1');
  assertEntryOrder('Lazy1', 'Lazy2');
  assertEntryOrder('Lazy2', 'Num');
  assertEntryOrder('BoolGroup', 'Lazy3');
}

function testAddNamespacedEntries() {
  createUi(false);
  goog.tweak.beginBooleanGroup('NS.LazyGroup', 'Lazy-loaded tweak.');
  goog.tweak.registerBoolean('NS.InGroup', 'Lazy-loaded tweak.');
  goog.tweak.endBooleanGroup();
  goog.tweak.registerBoolean('NS.Banana', 'Lazy-loaded tweak.');
  goog.tweak.registerBoolean('NS.Apple', 'Lazy-loaded tweak.');

  assertEquals(
      'Wrong number of entry divs.', EXPECTED_ENTRIES_COUNT + 5,
      getAllEntryDivs().length);
  assertEntryOrder('Enum2', 'NS.Apple');
  assertEntryOrder('NS.Apple', 'NS.Banana');
  assertEntryOrder('NS.Banana', 'NS.InGroup');
}

function testCollapsibleIsLazy() {
  if (document.createEvent) {
    createUi(true);
    assertEquals('Expected no entry divs.', 0, getAllEntryDivs().length);
    var showLink = root.getElementsByTagName(goog.dom.TagName.A)[0];
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent(
        'click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false,
        0, null);
    showLink.dispatchEvent(event);
    assertEquals(
        'Wrong number of entry divs.', EXPECTED_ENTRIES_COUNT,
        getAllEntryDivs().length);
  }
}
