// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.fx.DragListGroupTest');
goog.setTestOnly('goog.fx.DragListGroupTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.fx.DragEvent');
goog.require('goog.fx.DragListDirection');
goog.require('goog.fx.DragListGroup');
goog.require('goog.fx.Dragger');
goog.require('goog.math.Coordinate');
goog.require('goog.object');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');


/** @type {goog.fx.DragListGroup} */
var dlg;


/** @type {goog.dom.Element} */
var list;


/** @type {goog.events.BrowserEvent} */
var event;


/**
 * The number of event listeners registered by the DragListGroup after the
 * init() call.
 * @type {number}
 */
var initialListenerCount;


/**
 * Type of events fired by the DragListGroup.
 * @type {!Array<string>}
 */
var firedEventTypes;

function setUp() {
  var sandbox = goog.dom.getElement('sandbox');
  list = goog.dom.createDom(goog.dom.TagName.DIV, {'id': 'horiz_div'});
  list.appendChild(
      goog.dom.createDom(
          goog.dom.TagName.DIV, null, goog.dom.createTextNode('1')));
  list.appendChild(
      goog.dom.createDom(
          goog.dom.TagName.DIV, null, goog.dom.createTextNode('2')));
  list.appendChild(
      goog.dom.createDom(
          goog.dom.TagName.DIV, null, goog.dom.createTextNode('3')));
  sandbox.appendChild(list);

  dlg = new goog.fx.DragListGroup();
  dlg.setDragItemHoverClass('opacity_40', 'cursor_move');
  dlg.setDragItemHandleHoverClass('opacity_40', 'cursor_pointer');
  dlg.setCurrDragItemClass('blue_bg', 'opacity_40');
  dlg.setDraggerElClass('cursor_move', 'blue_bg');
  dlg.addDragList(list, goog.fx.DragListDirection.RIGHT);
  dlg.init();

  initialListenerCount = goog.object.getCount(dlg.eventHandler_.keys_);

  event = new goog.events.BrowserEvent();
  event.currentTarget = list.getElementsByTagName(goog.dom.TagName.DIV)[0];

  firedEventTypes = [];
  goog.events.listen(
      dlg, goog.object.getValues(goog.fx.DragListGroup.EventType),
      function(e) { firedEventTypes.push(e.type); });
}

function tearDown() {
  dlg.dispose();
  goog.dom.removeChildren(goog.dom.getElement('sandbox'));
}


/**
 * Test the initial assumptions.
 *
 * Verify that the setter methods work properly, i.e., the CSS classes are
 * stored in the private arrays after init() but are not added yet to target.
 * (Since initially, we are not yet hovering over any list, in particular,
 * over this target.)
 */
function testSettersAfterInit() {
  assertTrue(
      goog.array.equals(
          dlg.dragItemHoverClasses_, ['opacity_40', 'cursor_move']));
  assertTrue(
      goog.array.equals(
          dlg.dragItemHandleHoverClasses_, ['opacity_40', 'cursor_pointer']));
  assertTrue(
      goog.array.equals(dlg.currDragItemClasses_, ['blue_bg', 'opacity_40']));

  assertFalse(
      'Should have no cursor_move class after init',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_move'));
  assertFalse(
      'Should have no cursor_pointer class after init',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_pointer'));
  assertFalse(
      'Should have no opacity_40 class after init',
      goog.dom.classlist.contains(event.currentTarget, 'opacity_40'));
  assertFalse(
      'Should not have blue_bg class after init',
      goog.dom.classlist.contains(event.currentTarget, 'blue_bg'));
}


/**
 * Test the effect of hovering over a list.
 *
 * Check that after the MOUSEOVER browser event these classes are added to
 * the current target of the event.
 */
function testAddDragItemHoverClasses() {
  dlg.handleDragItemMouseover_(event);

  assertTrue(
      'Should have cursor_move class after MOUSEOVER',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_move'));
  assertTrue(
      'Should have opacity_40 class after MOUSEOVER',
      goog.dom.classlist.contains(event.currentTarget, 'opacity_40'));
  assertFalse(
      'Should not have cursor_pointer class after MOUSEOVER',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_pointer'));
  assertFalse(
      'Should not have blue_bg class after MOUSEOVER',
      goog.dom.classlist.contains(event.currentTarget, 'blue_bg'));
}

function testAddDragItemHandleHoverClasses() {
  dlg.handleDragItemHandleMouseover_(event);

  assertFalse(
      'Should not have cursor_move class after MOUSEOVER',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_move'));
  assertTrue(
      'Should have opacity_40 class after MOUSEOVER',
      goog.dom.classlist.contains(event.currentTarget, 'opacity_40'));
  assertTrue(
      'Should have cursor_pointer class after MOUSEOVER',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_pointer'));
  assertFalse(
      'Should not have blue_bg class after MOUSEOVER',
      goog.dom.classlist.contains(event.currentTarget, 'blue_bg'));
}


/**
 * Test the effect of stopping hovering over a list.
 *
 * Check that after the MOUSEOUT browser event all CSS classes are removed
 * from the target (as we are no longer hovering over the it).
 */
function testRemoveDragItemHoverClasses() {
  dlg.handleDragItemMouseover_(event);
  dlg.handleDragItemMouseout_(event);

  assertFalse(
      'Should have no cursor_move class after MOUSEOUT',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_move'));
  assertFalse(
      'Should have no cursor_pointer class after MOUSEOUT',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_pointer'));
  assertFalse(
      'Should have no opacity_40 class after MOUSEOUT',
      goog.dom.classlist.contains(event.currentTarget, 'opacity_40'));
  assertFalse(
      'Should have no blue_bg class after MOUSEOUT',
      goog.dom.classlist.contains(event.currentTarget, 'blue_bg'));
}

function testRemoveDragItemHandleHoverClasses() {
  dlg.handleDragItemHandleMouseover_(event);
  dlg.handleDragItemHandleMouseout_(event);

  assertFalse(
      'Should have no cursor_move class after MOUSEOUT',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_move'));
  assertFalse(
      'Should have no cursor_pointer class after MOUSEOUT',
      goog.dom.classlist.contains(event.currentTarget, 'cursor_pointer'));
  assertFalse(
      'Should have no opacity_40 class after MOUSEOUT',
      goog.dom.classlist.contains(event.currentTarget, 'opacity_40'));
  assertFalse(
      'Should have no blue_bg class after MOUSEOUT',
      goog.dom.classlist.contains(event.currentTarget, 'blue_bg'));
}


/**
 * Test the effect of dragging an item. (DRAGSTART event.)
 *
 * Check that after the MOUSEDOWN browser event is handled by the
 * handlePotentialDragStart_() method the currDragItem has the CSS classes
 * set by the setter method.
 */
function testAddCurrentDragItemClasses() {
  var be = new goog.events.BrowserEvent({
    type: goog.events.EventType.MOUSEDOWN,
    button: goog.events.BrowserFeature.HAS_W3C_BUTTON ? 0 : 1
  });
  event.event_ = be;

  dlg.handlePotentialDragStart_(event);

  assertFalse(
      'Should have no cursor_move class after MOUSEDOWN',
      goog.dom.classlist.contains(dlg.currDragItem_, 'cursor_move'));
  assertFalse(
      'Should have no cursor_pointer class after MOUSEDOWN',
      goog.dom.classlist.contains(dlg.currDragItem_, 'cursor_pointer'));
  assertTrue(
      'Should have opacity_40 class after MOUSEDOWN',
      goog.dom.classlist.contains(dlg.currDragItem_, 'opacity_40'));
  assertTrue(
      'Should have blue_bg class after MOUSEDOWN',
      goog.dom.classlist.contains(dlg.currDragItem_, 'blue_bg'));
}


/**
 * Test the effect of dragging an item. (DRAGEND event.)
 *
 * Check that after the MOUSEUP browser event handled by the handleDragEnd_()
 * method the currDragItem has no CSS classes set in the dispatched event.
 */
function testRemoveCurrentDragItemClasses() {
  var be = new goog.events.BrowserEvent({
    type: goog.events.EventType.MOUSEDOWN,
    button: goog.events.BrowserFeature.HAS_W3C_BUTTON ? 0 : 1
  });
  event.event_ = be;
  dlg.handlePotentialDragStart_(event);

  // Need to catch the dispatched event because the temporary fields
  // including dlg.currentDragItem_ are cleared after the dragging has ended.
  var currDragItem = goog.dom.createDom(
      goog.dom.TagName.DIV, ['cursor_move', 'blue_bg'],
      goog.dom.createTextNode('4'));
  goog.events.listen(dlg, goog.fx.DragListGroup.EventType.DRAGEND, function(e) {
    currDragItem = dlg.currDragItem_;
  });

  var dragger = new goog.fx.Dragger(event.currentTarget);
  be.type = goog.events.EventType.MOUSEUP;
  be.clientX = 1;
  be.clientY = 2;
  var dragEvent = new goog.fx.DragEvent(
      goog.fx.Dragger.EventType.END, dragger, be.clientX, be.clientY, be);
  dlg.handleDragEnd_(dragEvent);  // this method dispatches the DRAGEND event
  dragger.dispose();

  assertFalse(
      'Should have no cursor_move class after MOUSEUP',
      goog.dom.classlist.contains(currDragItem, 'cursor_move'));
  assertFalse(
      'Should have no cursor_pointer class after MOUSEUP',
      goog.dom.classlist.contains(currDragItem, 'cursor_pointer'));
  assertFalse(
      'Should have no opacity_40 class after MOUSEUP',
      goog.dom.classlist.contains(currDragItem, 'opacity_40'));
  assertFalse(
      'Should have no blue_bg class after MOUSEUP',
      goog.dom.classlist.contains(currDragItem, 'blue_bg'));
}


/**
 * Asserts that the DragListGroup is in idle state.
 * @param {!goog.fx.DragListGroup} dlg The DragListGroup to examine.
 */
function assertIdle(dlg) {
  assertNull('dragger element has been cleaned up', dlg.draggerEl_);
  assertNull('dragger has been cleaned up', dlg.dragger_);
  assertEquals(
      'the additional event listeners have been removed', initialListenerCount,
      goog.object.getCount(dlg.eventHandler_.keys_));
}

function testFiredEvents() {
  goog.testing.events.fireClickSequence(list.firstChild);
  assertArrayEquals(
      'event types in case of zero distance dragging',
      [
        goog.fx.DragListGroup.EventType.BEFOREDRAGSTART,
        goog.fx.DragListGroup.EventType.DRAGSTART,
        goog.fx.DragListGroup.EventType.BEFOREDRAGEND,
        goog.fx.DragListGroup.EventType.DRAGEND
      ],
      firedEventTypes);
  assertIdle(dlg);
}

function testFiredEventsWithHysteresis() {
  dlg.setHysteresis(2);

  goog.testing.events.fireClickSequence(list.firstChild);
  assertArrayEquals(
      'no events fired on click if hysteresis is enabled', [], firedEventTypes);
  assertIdle(dlg);

  goog.testing.events.fireMouseDownEvent(
      list.firstChild, null, new goog.math.Coordinate(0, 0));
  goog.testing.events.fireMouseMoveEvent(
      list.firstChild, new goog.math.Coordinate(1, 0));
  assertArrayEquals(
      'no events fired below hysteresis distance', [], firedEventTypes);

  goog.testing.events.fireMouseMoveEvent(
      list.firstChild, new goog.math.Coordinate(3, 0));
  assertArrayEquals(
      'start+move events are fired over hysteresis distance',
      [
        goog.fx.DragListGroup.EventType.BEFOREDRAGSTART,
        goog.fx.DragListGroup.EventType.DRAGSTART,
        goog.fx.DragListGroup.EventType.BEFOREDRAGMOVE,
        goog.fx.DragListGroup.EventType.DRAGMOVE
      ],
      firedEventTypes);

  firedEventTypes.length = 0;
  goog.testing.events.fireMouseUpEvent(
      list.firstChild, null, new goog.math.Coordinate(3, 0));
  assertArrayEquals(
      'end events are fired on mouseup',
      [
        goog.fx.DragListGroup.EventType.BEFOREDRAGEND,
        goog.fx.DragListGroup.EventType.DRAGEND
      ],
      firedEventTypes);
  assertIdle(dlg);
}

function testPreventDefaultBeforeDragStart() {
  goog.events.listen(
      dlg, goog.fx.DragListGroup.EventType.BEFOREDRAGSTART,
      goog.events.Event.preventDefault);

  goog.testing.events.fireMouseDownEvent(list.firstChild);
  assertArrayEquals(
      'event types if dragging is prevented',
      [goog.fx.DragListGroup.EventType.BEFOREDRAGSTART], firedEventTypes);
  assertIdle(dlg);
}

function testPreventDefaultBeforeDragStartWithHysteresis() {
  dlg.setHysteresis(5);
  goog.events.listen(
      dlg, goog.fx.DragListGroup.EventType.BEFOREDRAGSTART,
      goog.events.Event.preventDefault);

  goog.testing.events.fireMouseDownEvent(
      list.firstChild, null, new goog.math.Coordinate(0, 0));
  goog.testing.events.fireMouseMoveEvent(
      list.firstChild, new goog.math.Coordinate(10, 0));
  assertArrayEquals(
      'event types if dragging is prevented',
      [goog.fx.DragListGroup.EventType.BEFOREDRAGSTART], firedEventTypes);
  assertIdle(dlg);
}

function testRightClick() {
  goog.testing.events.fireMouseDownEvent(
      list.firstChild, goog.events.BrowserEvent.MouseButton.RIGHT);
  goog.testing.events.fireMouseUpEvent(
      list.firstChild, goog.events.BrowserEvent.MouseButton.RIGHT);

  assertArrayEquals('no events fired', [], firedEventTypes);
  assertIdle(dlg);
}


/**
 * Tests that a new item can be added to a drag list after the control has
 * been initialized.
 */
function testAddItemToDragList() {
  var item = goog.dom.createDom(
      goog.dom.TagName.DIV, null, goog.dom.createTextNode('newItem'));

  dlg.addItemToDragList(list, item);

  assertEquals(item, list.lastChild);
  assertEquals(4, goog.dom.getChildren(list).length);

  goog.events.listen(
      dlg, goog.fx.DragListGroup.EventType.BEFOREDRAGSTART,
      goog.events.Event.preventDefault);

  goog.testing.events.fireMouseDownEvent(item);
  assertTrue(
      'Should fire beforedragstart event when clicked',
      goog.array.equals(
          [goog.fx.DragListGroup.EventType.BEFOREDRAGSTART], firedEventTypes));
}


/**
 * Tests that a new item added to a drag list after the control has been
 * initialized is inserted at the correct position.
 */
function testInsertItemInDragList() {
  var item = goog.dom.createDom(
      goog.dom.TagName.DIV, null, goog.dom.createTextNode('newItem'));

  dlg.addItemToDragList(list, item, 0);

  assertEquals(item, list.firstChild);
  assertEquals(4, goog.dom.getChildren(list).length);

  goog.events.listen(
      dlg, goog.fx.DragListGroup.EventType.BEFOREDRAGSTART,
      goog.events.Event.preventDefault);

  goog.testing.events.fireMouseDownEvent(item);
  assertTrue(
      'Should fire beforedragstart event when clicked',
      goog.array.equals(
          [goog.fx.DragListGroup.EventType.BEFOREDRAGSTART], firedEventTypes));
}
