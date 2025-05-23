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

goog.provide('goog.ui.ComponentTest');
goog.setTestOnly('goog.ui.ComponentTest');

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventTarget');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');

var component;
var propertyReplacer = new goog.testing.PropertyReplacer();
var sandbox;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  component = new goog.ui.Component();
}

function tearDown() {
  component.dispose();
  goog.dom.removeChildren(sandbox);
  propertyReplacer.reset();
}

function testConstructor() {
  assertTrue(
      'Instance must be non-null and have the expected class',
      component instanceof goog.ui.Component);
  assertTrue(
      'DOM helper must be non-null and have the expected class',
      component.dom_ instanceof goog.dom.DomHelper);

  var fakeDom = {};
  var otherComponent = new goog.ui.Component(fakeDom);
  assertEquals(
      'DOM helper must refer to expected object', fakeDom, otherComponent.dom_);

  otherComponent.dispose();
}

function testGetId() {
  assertNull('Component ID should be initialized to null', component.id_);
  var id = component.getId();
  assertNotNull('Component ID should be generated on demand', id);
  assertEquals(
      'Subsequent calls to getId() must return same value', id,
      component.getId());
}

function testSetId() {
  component.setId('myId');
  assertEquals(
      'getId() must return explicitly set ID', 'myId', component.getId());

  var child = new goog.ui.Component();
  var childId = child.getId();
  component.addChild(child);
  assertEquals(
      'Parent component must find child by ID', child,
      component.getChild(childId));

  child.setId('someNewId');
  assertEquals(
      'Parent component must find child by new ID', child,
      component.getChild('someNewId'));

  child.dispose();
}

function testGetSetElement() {
  assertNull('Element must be null by default', component.getElement());
  var element = goog.dom.createElement(goog.dom.TagName.DIV);
  component.setElementInternal(element);
  assertEquals(
      'getElement() must return expected element', element,
      component.getElement());
}

function testGetSetParent() {
  assertNull('Parent must be null by default', component.getParent());

  var parent = new goog.ui.Component();
  component.setParent(parent);
  assertEquals(
      'getParent() must return expected component', parent,
      component.getParent());

  component.setParent(null);
  assertNull('Parent must be null', component.getParent());

  assertThrows(
      'Setting a component\'s parent to itself must throw error',
      function() { component.setParent(component); });

  parent.addChild(component);
  assertEquals(
      'getParent() must return expected component', parent,
      component.getParent());
  assertThrows(
      'Changing a child component\'s parent must throw error',
      function() { component.setParent(new goog.ui.Component()); });

  parent.dispose();
}

function testGetParentEventTarget() {
  assertNull(
      'Parent event target must be null by default',
      component.getParentEventTarget());

  var parent = new goog.ui.Component();
  component.setParent(parent);
  assertEquals(
      'Parent event target must be the parent component', parent,
      component.getParentEventTarget());
  assertThrows(
      'Directly setting the parent event target to other than ' +
          'the parent component when the parent component is set must throw ' +
          'error',
      function() { component.setParentEventTarget(new goog.ui.Component()); });

  parent.dispose();
}

function testSetParentEventTarget() {
  var parentEventTarget = new goog.events.EventTarget();
  component.setParentEventTarget(parentEventTarget);
  assertEquals('Parent component must be null', null, component.getParent());

  parentEventTarget.dispose();
}

function testGetDomHelper() {
  var domHelper = new goog.dom.DomHelper();
  var component = new goog.ui.Component(domHelper);
  assertEquals(
      'Component must return the same DomHelper passed', domHelper,
      component.getDomHelper());
}

function testIsInDocument() {
  assertFalse(
      'Component must not be in the document by default',
      component.isInDocument());
  component.enterDocument();
  assertTrue('Component must be in the document', component.isInDocument());
}

function testCreateDom() {
  assertNull('Component must not have DOM by default', component.getElement());
  component.createDom();
  assertEquals(
      'Component\'s DOM must be an element node', goog.dom.NodeType.ELEMENT,
      component.getElement().nodeType);
}

function testRender() {
  assertFalse(
      'Component must not be in the document by default',
      component.isInDocument());
  assertNull('Component must not have DOM by default', component.getElement());
  assertFalse(
      'wasDecorated() must be false before component is rendered',
      component.wasDecorated());

  component.render(sandbox);
  assertTrue(
      'Rendered component must be in the document', component.isInDocument());
  assertEquals(
      'Component\'s element must be a child of the parent element', sandbox,
      component.getElement().parentNode);
  assertFalse(
      'wasDecorated() must still be false for rendered component',
      component.wasDecorated());

  assertThrows('Trying to re-render component must throw error', function() {
    component.render();
  });
}

function testRender_NoParent() {
  component.render();
  assertTrue(
      'Rendered component must be in the document', component.isInDocument());
  assertEquals(
      'Component\'s element must be a child of the document body',
      document.body, component.getElement().parentNode);
}

function testRender_ParentNotInDocument() {
  var parent = new goog.ui.Component();
  component.setParent(parent);

  assertFalse(
      'Parent component must not be in the document', parent.isInDocument());
  assertFalse(
      'Child component must not be in the document', component.isInDocument());
  assertNull('Child component must not have DOM', component.getElement());

  component.render();
  assertFalse(
      'Parent component must not be in the document', parent.isInDocument());
  assertFalse(
      'Child component must not be in the document', component.isInDocument());
  assertNotNull('Child component must have DOM', component.getElement());

  parent.dispose();
}


function testRenderBefore() {
  var sibling = goog.dom.createElement(goog.dom.TagName.DIV);
  sandbox.appendChild(sibling);

  component.renderBefore(sibling);
  assertTrue(
      'Rendered component must be in the document', component.isInDocument());
  assertEquals(
      'Component\'s element must be a child of the parent element', sandbox,
      component.getElement().parentNode);
  assertEquals(
      'Component\'s element must have expected nextSibling', sibling,
      component.getElement().nextSibling);
}


function testRenderChild() {
  var parent = new goog.ui.Component();

  parent.createDom();
  assertFalse('Parent must not be in the document', parent.isInDocument());
  assertNotNull('Parent must have a DOM', parent.getElement());

  parent.addChild(component);
  assertFalse('Child must not be in the document', component.isInDocument());
  assertNull('Child must not have a DOM', component.getElement());

  component.render(parent.getElement());
  assertFalse('Parent must not be in the document', parent.isInDocument());
  assertFalse(
      'Child must not be in the document if the parent isn\'t',
      component.isInDocument());
  assertNotNull('Child must have a DOM', component.getElement());
  assertEquals(
      'Child\'s element must be a child of the parent\'s element',
      parent.getElement(), component.getElement().parentNode);

  parent.render(sandbox);
  assertTrue('Parent must be in the document', parent.isInDocument());
  assertTrue('Child must be in the document', component.isInDocument());

  parent.dispose();
}

function testDecorate() {
  sandbox.innerHTML = '<div id="foo">Foo</div>';
  var foo = goog.dom.getElement('foo');

  assertFalse(
      'wasDecorated() must be false by default', component.wasDecorated());

  component.decorate(foo);
  assertTrue('Component must be in the document', component.isInDocument());
  assertEquals(
      'Component\'s element must be the decorated element', foo,
      component.getElement());
  assertTrue(
      'wasDecorated() must be true for decorated component',
      component.wasDecorated());

  assertThrows(
      'Trying to decorate with a control already in the document' +
          ' must throw error',
      function() { component.decorate(foo); });
}

function testDecorate_AllowDetached_NotInDocument() {
  goog.ui.Component.ALLOW_DETACHED_DECORATION = true;
  var element = document.createElement(goog.dom.TagName.DIV);
  component.decorate(element);
  assertFalse(
      'Component should not call enterDocument when decorated ' +
          'with an element that is not in the document.',
      component.isInDocument());
  goog.ui.Component.ALLOW_DETACHED_DECORATION = false;
}

function testDecorate_AllowDetached_InDocument() {
  goog.ui.Component.ALLOW_DETACHED_DECORATION = true;
  var element = document.createElement(goog.dom.TagName.DIV);
  sandbox.appendChild(element);
  component.decorate(element);
  assertTrue(
      'Component should call enterDocument when decorated ' +
          'with an element that is in the document.',
      component.isInDocument());
  goog.ui.Component.ALLOW_DETACHED_DECORATION = false;
}

function testCannotDecorate() {
  sandbox.innerHTML = '<div id="foo">Foo</div>';
  var foo = goog.dom.getElement('foo');

  // Have canDecorate() return false.
  propertyReplacer.set(component, 'canDecorate', function() { return false; });

  assertThrows(
      'Trying to decorate an element for which canDecorate()' +
          ' returns false must throw error',
      function() { component.decorate(foo); });
}

function testCanDecorate() {
  assertTrue(
      'canDecorate() must return true by default',
      component.canDecorate(sandbox));
}

function testWasDecorated() {
  assertFalse(
      'wasDecorated() must return false by default', component.wasDecorated());
}

function testDecorateInternal() {
  assertNull('Element must be null by default', component.getElement());
  var element = goog.dom.createElement(goog.dom.TagName.DIV);
  component.decorateInternal(element);
  assertEquals(
      'Element must have expected value', element, component.getElement());
}

function testGetElementAndGetElementsByClass() {
  sandbox.innerHTML = '<ul id="task-list">' +
      '<li class="task">Unclog drain' +
      '</ul>' +
      '<ul id="completed-tasks">' +
      '<li id="groceries" class="task">Buy groceries' +
      '<li class="task">Rotate tires' +
      '<li class="task">Clean kitchen' +
      '</ul>' +
      assertNull('Should be nothing to return before the component has a DOM',
                 component.getElementByClass('task'));
  assertEquals(
      'Should return an empty list before the component has a DOM', 0,
      component.getElementsByClass('task').length);

  component.decorate(goog.dom.getElement('completed-tasks'));
  assertEquals(
      'getElementByClass() should return the first completed task', 'groceries',
      component.getElementByClass('task').id);
  assertEquals(
      'getElementsByClass() should return only the completed tasks', 3,
      component.getElementsByClass('task').length);
}

function testGetRequiredElementByClass() {
  sandbox.innerHTML = '<ul id="task-list">' +
      '<li class="task">Unclog drain' +
      '</ul>' +
      '<ul id="completed-tasks">' +
      '<li id="groceries" class="task">Buy groceries' +
      '<li class="task">Rotate tires' +
      '<li class="task">Clean kitchen' +
      '</ul>';
  component.decorate(goog.dom.getElement('completed-tasks'));
  assertEquals(
      'getRequiredElementByClass() should return the first completed task',
      'groceries', component.getRequiredElementByClass('task').id);
  assertThrows(
      'Attempting to retrieve a required element that does not' +
          'exist should fail',
      function() { component.getRequiredElementByClass('undefinedClass'); });
}

function testEnterExitDocument() {
  var c1 = new goog.ui.Component();
  var c2 = new goog.ui.Component();

  component.addChild(c1);
  component.addChild(c2);

  component.createDom();
  c1.createDom();
  c2.createDom();

  assertFalse('Parent must not be in the document', component.isInDocument());
  assertFalse(
      'Neither child must be in the document',
      c1.isInDocument() || c2.isInDocument());

  component.enterDocument();
  assertTrue('Parent must be in the document', component.isInDocument());
  assertTrue(
      'Both children must be in the document',
      c1.isInDocument() && c2.isInDocument());

  component.exitDocument();
  assertFalse('Parent must not be in the document', component.isInDocument());
  assertFalse(
      'Neither child must be in the document',
      c1.isInDocument() || c2.isInDocument());

  c1.dispose();
  c2.dispose();
}

function testDispose() {
  var c1, c2;

  component.createDom();
  component.addChild((c1 = new goog.ui.Component()), true);
  component.addChild((c2 = new goog.ui.Component()), true);

  var element = component.getElement();
  var c1Element = c1.getElement();
  var c2Element = c2.getElement();

  component.render(sandbox);
  assertTrue('Parent must be in the document', component.isInDocument());
  assertEquals(
      'Parent\'s element must be a child of the sandbox element', sandbox,
      element.parentNode);
  assertTrue(
      'Both children must be in the document',
      c1.isInDocument() && c2.isInDocument());
  assertEquals(
      'First child\'s element must be a child of the parent\'s' +
          ' element',
      element, c1Element.parentNode);
  assertEquals(
      'Second child\'s element must be a child of the parent\'s' +
          ' element',
      element, c2Element.parentNode);

  assertFalse('Parent must not have been disposed of', component.isDisposed());
  assertFalse(
      'Neither child must have been disposed of',
      c1.isDisposed() || c2.isDisposed());

  component.dispose();
  assertTrue('Parent must have been disposed of', component.isDisposed());
  assertFalse('Parent must not be in the document', component.isInDocument());
  assertNotEquals(
      'Parent\'s element must no longer be a child of the' +
          ' sandbox element',
      sandbox, element.parentNode);
  assertTrue(
      'Both children must have been disposed of',
      c1.isDisposed() && c2.isDisposed());
  assertFalse(
      'Neither child must be in the document',
      c1.isInDocument() || c2.isInDocument());
  assertNotEquals(
      'First child\'s element must no longer be a child of' +
          ' the parent\'s element',
      element, c1Element.parentNode);
  assertNotEquals(
      'Second child\'s element must no longer be a child of' +
          ' the parent\'s element',
      element, c2Element.parentNode);
}

function testDispose_Decorated() {
  sandbox.innerHTML = '<div id="foo">Foo</div>';
  var foo = goog.dom.getElement('foo');

  component.decorate(foo);
  assertTrue('Component must be in the document', component.isInDocument());
  assertFalse(
      'Component must not have been disposed of', component.isDisposed());
  assertEquals(
      'Component\'s element must have expected value', foo,
      component.getElement());
  assertEquals(
      'Decorated element must be a child of the sandbox', sandbox,
      foo.parentNode);

  component.dispose();
  assertFalse(
      'Component must not be in the document', component.isInDocument());
  assertTrue('Component must have been disposed of', component.isDisposed());
  assertNull('Component\'s element must be null', component.getElement());
  assertEquals(
      'Previously decorated element must still be a child of the' +
          ' sandbox',
      sandbox, foo.parentNode);
}

function testMakeIdAndGetFragmentFromId() {
  assertEquals(
      'Unique id must have expected value', component.getId() + '.foo',
      component.makeId('foo'));
  assertEquals(
      'Fragment must have expected value', 'foo',
      component.getFragmentFromId(component.makeId('foo')));
}

function testMakeIdsWithObject() {
  var EnumDef = {ENUM_1: 'enum 1', ENUM_2: 'enum 2', ENUM_3: 'enum 3'};
  var ids = component.makeIds(EnumDef);
  assertEquals(component.makeId(EnumDef.ENUM_1), ids.ENUM_1);
  assertEquals(component.makeId(EnumDef.ENUM_2), ids.ENUM_2);
  assertEquals(component.makeId(EnumDef.ENUM_3), ids.ENUM_3);
}

function testGetElementByFragment() {
  component.render(sandbox);

  var element = component.dom_.createDom(
      goog.dom.TagName.DIV, {id: component.makeId('foo')}, 'Hello');
  sandbox.appendChild(element);

  assertEquals(
      'Element must have expected value', element,
      component.getElementByFragment('foo'));
}

function testGetSetModel() {
  assertNull('Model must be null by default', component.getModel());

  var model = 'someModel';
  component.setModel(model);
  assertEquals('Model must have expected value', model, component.getModel());

  component.setModel(null);
  assertNull('Model must be null', component.getModel());
}

function testAddChild() {
  var child = new goog.ui.Component();
  child.setId('child');

  assertFalse('Parent must not be in the document', component.isInDocument());

  component.addChild(child);
  assertTrue('Parent must have children.', component.hasChildren());
  assertEquals('Child must have expected parent', component, child.getParent());
  assertEquals(
      'Parent must find child by ID', child, component.getChild('child'));
}

function testAddChild_Render() {
  var child = new goog.ui.Component();

  component.render(sandbox);
  assertTrue('Parent must be in the document', component.isInDocument());
  assertEquals(
      'Parent must be in the sandbox', sandbox,
      component.getElement().parentNode);

  component.addChild(child, true);
  assertTrue('Child must be in the document', child.isInDocument());
  assertEquals(
      'Child element must be a child of the parent element',
      component.getElement(), child.getElement().parentNode);
}

function testAddChild_DomOnly() {
  var child = new goog.ui.Component();

  component.createDom();
  assertNotNull('Parent must have a DOM', component.getElement());
  assertFalse('Parent must not be in the document', component.isInDocument());

  component.addChild(child, true);
  assertNotNull('Child must have a DOM', child.getElement());
  assertEquals(
      'Child element must be a child of the parent element',
      component.getElement(), child.getElement().parentNode);
  assertFalse('Child must not be in the document', child.isInDocument());
}

function testAddChildAt() {
  var a = new goog.ui.Component();
  var b = new goog.ui.Component();
  var c = new goog.ui.Component();
  var d = new goog.ui.Component();

  a.setId('a');
  b.setId('b');
  c.setId('c');
  d.setId('d');

  component.addChildAt(b, 0);
  assertEquals('b', component.getChildIds().join(''));
  component.addChildAt(d, 1);
  assertEquals('bd', component.getChildIds().join(''));
  component.addChildAt(a, 0);
  assertEquals('abd', component.getChildIds().join(''));
  component.addChildAt(c, 2);
  assertEquals('abcd', component.getChildIds().join(''));

  assertEquals(a, component.getChildAt(0));
  assertEquals(b, component.getChildAt(1));
  assertEquals(c, component.getChildAt(2));
  assertEquals(d, component.getChildAt(3));

  assertThrows(
      'Adding child at out-of-bounds index must throw error',
      function() { component.addChildAt(new goog.ui.Component(), 5); });
}

function testAddChildAtThrowsIfNull() {
  assertThrows('Adding a null child must throw an error', function() {
    component.addChildAt(null, 0);
  });
}

function testHasChildren() {
  assertFalse('Component must not have children', component.hasChildren());

  component.addChildAt(new goog.ui.Component(), 0);
  assertTrue('Component must have children', component.hasChildren());

  component.removeChildAt(0);
  assertFalse('Component must not have children', component.hasChildren());
}

function testGetChildCount() {
  assertEquals('Component must have 0 children', 0, component.getChildCount());

  component.addChild(new goog.ui.Component());
  assertEquals('Component must have 1 child', 1, component.getChildCount());

  component.addChild(new goog.ui.Component());
  assertEquals('Component must have 2 children', 2, component.getChildCount());

  component.removeChildAt(1);
  assertEquals('Component must have 1 child', 1, component.getChildCount());

  component.removeChildAt(0);
  assertEquals('Component must have 0 children', 0, component.getChildCount());
}

function testGetChildIds() {
  var a = new goog.ui.Component();
  var b = new goog.ui.Component();

  a.setId('a');
  b.setId('b');

  component.addChild(a);
  assertEquals('a', component.getChildIds().join(''));

  component.addChild(b);
  assertEquals('ab', component.getChildIds().join(''));

  var ids = component.getChildIds();
  ids.push('c');
  assertEquals(
      'Changes to the array returned by getChildIds() must not' +
          ' affect the component',
      'ab', component.getChildIds().join(''));
}

function testGetChild() {
  assertNull('Parent must have no children', component.getChild('myId'));

  var c = new goog.ui.Component();
  c.setId('myId');
  component.addChild(c);
  assertEquals('Parent must find child by ID', c, component.getChild('myId'));

  c.setId('newId');
  assertNull(
      'Parent must not find child by old ID', component.getChild('myId'));
  assertEquals(
      'Parent must find child by new ID', c, component.getChild('newId'));
}

function testGetChildAt() {
  var a = new goog.ui.Component();
  var b = new goog.ui.Component();

  a.setId('a');
  b.setId('b');

  component.addChildAt(a, 0);
  assertEquals('Parent must find child by index', a, component.getChildAt(0));

  component.addChildAt(b, 1);
  assertEquals('Parent must find child by index', b, component.getChildAt(1));

  assertNull(
      'Parent must return null for out-of-bounds index',
      component.getChildAt(3));
}

function testForEachChild() {
  var invoked = false;
  component.forEachChild(function(child) {
    assertNotNull('Child must never be null', child);
    invoked = true;
  });
  assertFalse(
      'forEachChild must not call its argument if the parent has ' +
          'no children',
      invoked);

  component.addChild(new goog.ui.Component());
  component.addChild(new goog.ui.Component());
  component.addChild(new goog.ui.Component());
  var callCount = 0;
  component.forEachChild(function(child, index) {
    assertEquals(component, this);
    callCount++;
  }, component);
  assertEquals(3, callCount);
}

function testIndexOfChild() {
  var a = new goog.ui.Component();
  var b = new goog.ui.Component();
  var c = new goog.ui.Component();

  a.setId('a');
  b.setId('b');
  c.setId('c');

  component.addChild(a);
  assertEquals(0, component.indexOfChild(a));

  component.addChild(b);
  assertEquals(1, component.indexOfChild(b));

  component.addChild(c);
  assertEquals(2, component.indexOfChild(c));

  assertEquals(
      'indexOfChild must return -1 for nonexistent child', -1,
      component.indexOfChild(new goog.ui.Component()));
}

function testRemoveChild() {
  var a = new goog.ui.Component();
  var b = new goog.ui.Component();
  var c = new goog.ui.Component();

  a.setId('a');
  b.setId('b');
  c.setId('c');

  component.addChild(a);
  component.addChild(b);
  component.addChild(c);

  assertEquals(
      'Parent must remove and return child', c, component.removeChild(c));
  assertNull(
      'Parent must no longer contain this child', component.getChild('c'));

  assertEquals(
      'Parent must remove and return child by ID', b,
      component.removeChild('b'));
  assertNull(
      'Parent must no longer contain this child', component.getChild('b'));

  assertEquals(
      'Parent must remove and return child by index', a,
      component.removeChildAt(0));
  assertNull(
      'Parent must no longer contain this child', component.getChild('a'));
}

function testMovingChildrenUsingAddChildAt() {
  component.render(sandbox);

  var a = new goog.ui.Component();
  var b = new goog.ui.Component();
  var c = new goog.ui.Component();
  var d = new goog.ui.Component();
  a.setElementInternal(goog.dom.createElement(goog.dom.TagName.A));
  b.setElementInternal(goog.dom.createElement(goog.dom.TagName.B));
  c.setElementInternal(goog.dom.createElement(goog.dom.TagName.C));
  d.setElementInternal(goog.dom.createElement(goog.dom.TagName.D));

  a.setId('a');
  b.setId('b');
  c.setId('c');
  d.setId('d');

  component.addChild(a, true);
  component.addChild(b, true);
  component.addChild(c, true);
  component.addChild(d, true);

  assertEquals('abcd', component.getChildIds().join(''));
  assertEquals(a, component.getChildAt(0));
  assertEquals(b, component.getChildAt(1));
  assertEquals(c, component.getChildAt(2));
  assertEquals(d, component.getChildAt(3));

  // Move child d to the top and b to the bottom.
  component.addChildAt(d, 0);
  component.addChildAt(b, 3);

  assertEquals('dacb', component.getChildIds().join(''));
  assertEquals(d, component.getChildAt(0));
  assertEquals(a, component.getChildAt(1));
  assertEquals(c, component.getChildAt(2));
  assertEquals(b, component.getChildAt(3));

  // Move child a to the top, and check that DOM nodes are in correct order.
  component.addChildAt(a, 0);
  assertEquals('adcb', component.getChildIds().join(''));
  assertEquals(a, component.getChildAt(0));
  assertEquals(a.getElement(), component.getElement().childNodes[0]);
}

function testAddChildAfterDomCreatedDoesNotEnterDocument() {
  var parent = new goog.ui.Component();
  var child = new goog.ui.Component();

  var nestedDiv = goog.dom.createDom(goog.dom.TagName.DIV);
  parent.setElementInternal(
      goog.dom.createDom(goog.dom.TagName.DIV, undefined, nestedDiv));
  parent.render();

  // Now add a child, whose DOM already exists. This happens, for example,
  // if the child itself performs an addChild(x, true).
  child.createDom();
  parent.addChild(child, false);
  // The parent shouldn't call enterDocument on the child, since the child
  // actually isn't in the document yet.
  assertFalse(child.isInDocument());

  // Now, actually render the child; it should be in the document.
  child.render(nestedDiv);
  assertTrue(child.isInDocument());
  assertEquals(
      'Child should be rendered in the expected div', nestedDiv,
      child.getElement().parentNode);
}

function testAddChildAfterDomManuallyInserted() {
  var parent = new goog.ui.Component();
  var child = new goog.ui.Component();

  var nestedDiv = goog.dom.createDom(goog.dom.TagName.DIV);
  parent.setElementInternal(
      goog.dom.createDom(goog.dom.TagName.DIV, undefined, nestedDiv));
  parent.render();

  // This sequence is weird, but some people do it instead of just manually
  // doing render.  The addChild will detect that the child is in the DOM
  // and call enterDocument.
  child.createDom();
  nestedDiv.appendChild(child.getElement());
  parent.addChild(child, false);

  assertTrue(child.isInDocument());
  assertEquals(
      'Child should be rendered in the expected div', nestedDiv,
      child.getElement().parentNode);
}

function testRemoveChildren() {
  var a = new goog.ui.Component();
  var b = new goog.ui.Component();
  var c = new goog.ui.Component();

  component.addChild(a);
  component.addChild(b);
  component.addChild(c);

  a.setId('a');
  b.setId('b');
  c.setId('c');

  assertArrayEquals(
      'Parent must remove and return children.', [a, b, c],
      component.removeChildren());
  assertNull(
      'Parent must no longer contain this child', component.getChild('a'));
  assertNull(
      'Parent must no longer contain this child', component.getChild('b'));
  assertNull(
      'Parent must no longer contain this child', component.getChild('c'));
}

function testRemoveChildren_Unrender() {
  var a = new goog.ui.Component();
  var b = new goog.ui.Component();

  component.render(sandbox);
  component.addChild(a);
  component.addChild(b);

  assertArrayEquals(
      'Prent must remove and return children.', [a, b],
      component.removeChildren(true));
  assertNull(
      'Parent must no longer contain this child', component.getChild('a'));
  assertFalse('Child must no longer be in the document.', a.isInDocument());
  assertNull(
      'Parent must no longer contain this child', component.getChild('b'));
  assertFalse('Child must no longer be in the document.', b.isInDocument());
}
