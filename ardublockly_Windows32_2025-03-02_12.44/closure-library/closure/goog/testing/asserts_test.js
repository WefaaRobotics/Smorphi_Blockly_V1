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

goog.provide('goog.testing.assertsTest');
goog.setTestOnly('goog.testing.assertsTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.labs.userAgent.browser');
goog.require('goog.string');
goog.require('goog.structs.Map');
goog.require('goog.structs.Set');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

function setUp() {
  // TODO(b/25875505): Fix unreported assertions (go/failonunreportedasserts).
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = false;
}

function testAssertTrue() {
  assertTrue(true);
  assertTrue('Good assertion', true);
  assertThrowsJsUnitException(function() {
    assertTrue(false);
  }, 'Call to assertTrue(boolean) with false');
  assertThrowsJsUnitException(function() {
    assertTrue('Should be true', false);
  }, 'Should be true\nCall to assertTrue(boolean) with false');
  assertThrowsJsUnitException(function() {
    assertTrue(null);
  }, 'Bad argument to assertTrue(boolean)');
  assertThrowsJsUnitException(function() {
    assertTrue(undefined);
  }, 'Bad argument to assertTrue(boolean)');
}

function testAssertFalse() {
  assertFalse(false);
  assertFalse('Good assertion', false);
  assertThrowsJsUnitException(function() {
    assertFalse(true);
  }, 'Call to assertFalse(boolean) with true');
  assertThrowsJsUnitException(function() {
    assertFalse('Should be false', true);
  }, 'Should be false\nCall to assertFalse(boolean) with true');
  assertThrowsJsUnitException(function() {
    assertFalse(null);
  }, 'Bad argument to assertFalse(boolean)');
  assertThrowsJsUnitException(function() {
    assertFalse(undefined);
  }, 'Bad argument to assertFalse(boolean)');
}

function testAssertEqualsWithString() {
  assertEquals('a', 'a');
  assertEquals('Good assertion', 'a', 'a');
  assertThrowsJsUnitException(function() {
    assertEquals('a', 'b');
  }, 'Expected <a> (String) but was <b> (String)');
  assertThrowsJsUnitException(function() {
    assertEquals('Bad assertion', 'a', 'b');
  }, 'Bad assertion\nExpected <a> (String) but was <b> (String)');
}

function testAssertEqualsWithInteger() {
  assertEquals(1, 1);
  assertEquals('Good assertion', 1, 1);
  assertThrowsJsUnitException(function() {
    assertEquals(1, 2);
  }, 'Expected <1> (Number) but was <2> (Number)');
  assertThrowsJsUnitException(function() {
    assertEquals('Bad assertion', 1, 2);
  }, 'Bad assertion\nExpected <1> (Number) but was <2> (Number)');
}

function testAssertNotEquals() {
  assertNotEquals('a', 'b');
  assertNotEquals('a', 'a', 'b');
  assertThrowsJsUnitException(function() {
    assertNotEquals('a', 'a');
  }, 'Expected not to be <a> (String)');
  assertThrowsJsUnitException(function() {
    assertNotEquals('a', 'a', 'a');
  }, 'a\nExpected not to be <a> (String)');
}

function testAssertNull() {
  assertNull(null);
  assertNull('Good assertion', null);
  assertThrowsJsUnitException(function() {
    assertNull(true);
  }, 'Expected <null> but was <true> (Boolean)');
  assertThrowsJsUnitException(function() {
    assertNull('Should be null', false);
  }, 'Should be null\nExpected <null> but was <false> (Boolean)');
  assertThrowsJsUnitException(function() {
    assertNull(undefined);
  }, 'Expected <null> but was <undefined>');
  assertThrowsJsUnitException(function() {
    assertNull(1);
  }, 'Expected <null> but was <1> (Number)');
}

function testAssertNotNull() {
  assertNotNull(true);
  assertNotNull('Good assertion', true);
  assertNotNull(false);
  assertNotNull(undefined);
  assertNotNull(1);
  assertNotNull('a');
  assertThrowsJsUnitException(function() {
    assertNotNull(null);
  }, 'Expected not to be <null>');
  assertThrowsJsUnitException(function() {
    assertNotNull('Should not be null', null);
  }, 'Should not be null\nExpected not to be <null>');
}

function testAssertUndefined() {
  assertUndefined(undefined);
  assertUndefined('Good assertion', undefined);
  assertThrowsJsUnitException(function() {
    assertUndefined(true);
  }, 'Expected <undefined> but was <true> (Boolean)');
  assertThrowsJsUnitException(function() {
    assertUndefined('Should be undefined', false);
  }, 'Should be undefined\nExpected <undefined> but was <false> (Boolean)');
  assertThrowsJsUnitException(function() {
    assertUndefined(null);
  }, 'Expected <undefined> but was <null>');
  assertThrowsJsUnitException(function() {
    assertUndefined(1);
  }, 'Expected <undefined> but was <1> (Number)');
}

function testAssertNotUndefined() {
  assertNotUndefined(true);
  assertNotUndefined('Good assertion', true);
  assertNotUndefined(false);
  assertNotUndefined(null);
  assertNotUndefined(1);
  assertNotUndefined('a');
  assertThrowsJsUnitException(function() {
    assertNotUndefined(undefined);
  }, 'Expected not to be <undefined>');
  assertThrowsJsUnitException(function() {
    assertNotUndefined('Should not be undefined', undefined);
  }, 'Should not be undefined\nExpected not to be <undefined>');
}

function testAssertNotNullNorUndefined() {
  assertNotNullNorUndefined(true);
  assertNotNullNorUndefined('Good assertion', true);
  assertNotNullNorUndefined(false);
  assertNotNullNorUndefined(1);
  assertNotNullNorUndefined(0);
  assertNotNullNorUndefined('a');
  assertThrowsJsUnitException(function() {
    assertNotNullNorUndefined(undefined);
  }, 'Expected not to be <undefined>');
  assertThrowsJsUnitException(function() {
    assertNotNullNorUndefined('Should not be undefined', undefined);
  }, 'Should not be undefined\nExpected not to be <undefined>');
  assertThrowsJsUnitException(function() {
    assertNotNullNorUndefined(null);
  }, 'Expected not to be <null>');
  assertThrowsJsUnitException(function() {
    assertNotNullNorUndefined('Should not be null', null);
  }, 'Should not be null\nExpected not to be <null>');
}

function testAssertNonEmptyString() {
  assertNonEmptyString('hello');
  assertNonEmptyString('Good assertion', 'hello');
  assertNonEmptyString('true');
  assertNonEmptyString('false');
  assertNonEmptyString('1');
  assertNonEmptyString('null');
  assertNonEmptyString('undefined');
  assertNonEmptyString('\n');
  assertNonEmptyString(' ');
  assertThrowsJsUnitException(function() {
    assertNonEmptyString('');
  }, 'Expected non-empty string but was <> (String)');
  assertThrowsJsUnitException(
      function() { assertNonEmptyString('Should be non-empty string', ''); },
      'Should be non-empty string\n' +
          'Expected non-empty string but was <> (String)');
  assertThrowsJsUnitException(function() {
    assertNonEmptyString(true);
  }, 'Expected non-empty string but was <true> (Boolean)');
  assertThrowsJsUnitException(function() {
    assertNonEmptyString(false);
  }, 'Expected non-empty string but was <false> (Boolean)');
  assertThrowsJsUnitException(function() {
    assertNonEmptyString(1);
  }, 'Expected non-empty string but was <1> (Number)');
  assertThrowsJsUnitException(function() {
    assertNonEmptyString(null);
  }, 'Expected non-empty string but was <null>');
  assertThrowsJsUnitException(function() {
    assertNonEmptyString(undefined);
  }, 'Expected non-empty string but was <undefined>');
  assertThrowsJsUnitException(function() {
    assertNonEmptyString(['hello']);
  }, 'Expected non-empty string but was <hello> (Array)');
  // Different browsers return different values/types in the failure message
  // so don't bother checking if the message is exactly as expected.
  assertThrowsJsUnitException(function() {
    assertNonEmptyString(goog.dom.createTextNode('hello'));
  });
}

function testAssertNaN() {
  assertNaN(NaN);
  assertNaN('Good assertion', NaN);
  assertThrowsJsUnitException(function() { assertNaN(1); }, 'Expected NaN');
  assertThrowsJsUnitException(function() {
    assertNaN('Should be NaN', 1);
  }, 'Should be NaN\nExpected NaN');
  assertThrowsJsUnitException(function() { assertNaN(true); }, 'Expected NaN');
  assertThrowsJsUnitException(function() { assertNaN(false); }, 'Expected NaN');
  assertThrowsJsUnitException(function() { assertNaN(null); }, 'Expected NaN');
  assertThrowsJsUnitException(function() { assertNaN(''); }, 'Expected NaN');

  // TODO(user): These assertions fail. We should decide on the
  // semantics of assertNaN
  // assertThrowsJsUnitException(function() { assertNaN(undefined); },
  //    'Expected NaN');
  // assertThrowsJsUnitException(function() { assertNaN('a'); },
  //    'Expected NaN');
}

function testAssertNotNaN() {
  assertNotNaN(1);
  assertNotNaN('Good assertion', 1);
  assertNotNaN(true);
  assertNotNaN(false);
  assertNotNaN('');
  assertNotNaN(null);

  // TODO(user): These assertions fail. We should decide on the
  // semantics of assertNotNaN
  // assertNotNaN(undefined);
  // assertNotNaN('a');

  assertThrowsJsUnitException(function() {
    assertNotNaN(Number.NaN);
  }, 'Expected not NaN');
  assertThrowsJsUnitException(function() {
    assertNotNaN('Should not be NaN', Number.NaN);
  }, 'Should not be NaN\nExpected not NaN');
}

function testAssertObjectEquals() {
  var obj1 = [{'a': 'hello', 'b': 'world'}];
  var obj2 = [{'a': 'hello', 'c': 'dear', 'b': 'world'}];

  // Check with obj1 and obj2 as first and second arguments respectively.
  assertThrows('Objects should not be equal', function() {
    assertObjectEquals(obj1, obj2);
  });

  // Check with obj1 and obj2 as second and first arguments respectively.
  assertThrows('Objects should not be equal', function() {
    assertObjectEquals(obj2, obj1);
  });

  // Test if equal objects are considered equal.
  var obj3 = [{'b': 'world', 'a': 'hello'}];
  assertObjectEquals(obj1, obj3);
  assertObjectEquals(obj3, obj1);

  // Test with a case where one of the members has an undefined value.
  var obj4 = [{'a': 'hello', 'b': undefined}];
  var obj5 = [{'a': 'hello'}];

  // Check with obj4 and obj5 as first and second arguments respectively.
  assertThrows('Objects should not be equal', function() {
    assertObjectEquals(obj4, obj5);
  });

  // Check with obj5 and obj4 as first and second arguments respectively.
  assertThrows('Objects should not be equal', function() {
    assertObjectEquals(obj5, obj4);
  });
}

function testAssertObjectNotEquals() {
  var obj1 = [{'a': 'hello', 'b': 'world'}];
  var obj2 = [{'a': 'hello', 'c': 'dear', 'b': 'world'}];

  // Check with obj1 and obj2 as first and second arguments respectively.
  assertObjectNotEquals(obj1, obj2);

  // Check with obj1 and obj2 as second and first arguments respectively.
  assertObjectNotEquals(obj2, obj1);

  // Test if equal objects are considered equal.
  var obj3 = [{'b': 'world', 'a': 'hello'}];
  var error = assertThrows('Objects should be equal', function() {
    assertObjectNotEquals(obj1, obj3);
  });
  assertContains('Objects should not be equal', error.message);
  error = assertThrows('Objects should be equal', function() {
    assertObjectNotEquals(obj3, obj1);
  });
  assertContains('Objects should not be equal', error.message);

  // Test with a case where one of the members has an undefined value.
  var obj4 = [{'a': 'hello', 'b': undefined}];
  var obj5 = [{'a': 'hello'}];

  // Check with obj4 and obj5 as first and second arguments respectively.
  assertObjectNotEquals(obj4, obj5);

  // Check with obj5 and obj4 as first and second arguments respectively.
  assertObjectNotEquals(obj5, obj4);
}

function testAssertObjectEquals2() {
  // NOTE: (0 in [undefined]) is true on FF but false on IE.
  // (0 in {'0': undefined}) is true on both.
  // grrr.
  assertObjectEquals('arrays should be equal', [undefined], [undefined]);
  assertThrows('arrays should not be equal', function() {
    assertObjectEquals([undefined, undefined], [undefined]);
  });
  assertThrows('arrays should not be equal', function() {
    assertObjectEquals([undefined], [undefined, undefined]);
  });
}

function testAssertObjectEquals3() {
  // Check that objects that contain identical Map objects compare
  // as equals. We can't do a negative test because on browsers that
  // implement __iterator__ we can't check the values of the iterated
  // properties.
  var obj1 = [
    {'a': 'hi', 'b': new goog.structs.Map('hola', 'amigo', 'como', 'estas?')},
    14, 'yes', true
  ];
  var obj2 = [
    {'a': 'hi', 'b': new goog.structs.Map('hola', 'amigo', 'como', 'estas?')},
    14, 'yes', true
  ];
  assertObjectEquals('Objects should be equal', obj1, obj2);

  var obj3 = {'a': [1, 2]};
  var obj4 = {'a': [1, 2, 3]};
  assertThrows('inner arrays should not be equal', function() {
    assertObjectEquals(obj3, obj4);
  });
  assertThrows('inner arrays should not be equal', function() {
    assertObjectEquals(obj4, obj3);
  });
}

function testAssertObjectEqualsSet() {
  // verify that Sets compare equal, when run in an environment that
  // supports iterators
  var set1 = new goog.structs.Set();
  var set2 = new goog.structs.Set();

  set1.add('a');
  set1.add('b');
  set1.add(13);

  set2.add('a');
  set2.add('b');
  set2.add(13);

  assertObjectEquals('sets should be equal', set1, set2);

  set2.add('hey');
  assertThrows('sets should not be equal', function() {
    assertObjectEquals(set1, set2);
  });
}

function testAssertObjectEqualsIterNoEquals() {
  // an object with an iterator but no equals() and no map_ cannot
  // be compared
  function Thing() { this.what = []; }
  Thing.prototype.add = function(n, v) { this.what.push(n + '@' + v); };
  Thing.prototype.get = function(n) {
    var m = new RegExp('^' + n + '@(.*)$', '');
    for (var i = 0; i < this.what.length; ++i) {
      var match = this.what[i].match(m);
      if (match) {
        return match[1];
      }
    }
    return null;
  };
  Thing.prototype.__iterator__ = function() {
    var iter = new goog.iter.Iterator;
    iter.index = 0;
    iter.thing = this;
    iter.next = function() {
      if (this.index < this.thing.what.length) {
        return this.thing.what[this.index++].split('@')[0];
      } else {
        throw goog.iter.StopIteration;
      }
    };
    return iter;
  };

  var thing1 = new Thing();
  thing1.name = 'thing1';
  var thing2 = new Thing();
  thing2.name = 'thing2';
  thing1.add('red', 'fish');
  thing1.add('blue', 'fish');

  thing2.add('red', 'fish');
  thing2.add('blue', 'fish');

  assertThrows('things should not be equal', function() {
    assertObjectEquals(thing1, thing2);
  });
}

function testAssertObjectEqualsWithDates() {
  var date = new Date(2010, 0, 1);
  var dateWithMilliseconds = new Date(2010, 0, 1, 0, 0, 0, 1);
  assertObjectEquals(new Date(2010, 0, 1), date);
  assertThrows(goog.partial(assertObjectEquals, date, dateWithMilliseconds));
}

function testAssertObjectEqualsSparseArrays() {
  var arr1 = [, 2, , 4];
  var arr2 = [1, 2, 3, 4, 5];

  assertThrows('Sparse arrays should not be equal', function() {
    assertObjectEquals(arr1, arr2);
  });

  assertThrows('Sparse arrays should not be equal', function() {
    assertObjectEquals(arr2, arr1);
  });
}

function testAssertObjectEqualsSparseArrays2() {
  // On IE6-8, the expression "1 in [4,undefined]" evaluates to false,
  // but true on other browsers. FML. This test verifies a regression
  // where IE reported that arr4 was not equal to arr1 or arr2.
  var arr1 = [1, , 3];
  var arr2 = [1, undefined, 3];
  var arr3 = goog.array.clone(arr1);
  var arr4 = [];
  arr4.push(1, undefined, 3);

  // Assert that all those arrays are equivalent pairwise.
  var arrays = [arr1, arr2, arr3, arr4];
  for (var i = 0; i < arrays.length; i++) {
    for (var j = 0; j < arrays.length; j++) {
      assertArrayEquals(arrays[i], arrays[j]);
    }
  }
}

function testAssertObjectEqualsArraysWithExtraProps() {
  var arr1 = [1];
  var arr2 = [1];
  arr2.foo = 3;

  assertThrows('Aarrays should not be equal', function() {
    assertObjectEquals(arr1, arr2);
  });

  assertThrows('Arrays should not be equal', function() {
    assertObjectEquals(arr2, arr1);
  });
}

function testAssertSameElementsOnArray() {
  assertSameElements([1, 2], [2, 1]);
  assertSameElements('Good assertion', [1, 2], [2, 1]);
  assertSameElements('Good assertion with duplicates', [1, 1, 2], [2, 1, 1]);
  assertThrowsJsUnitException(function() {
    assertSameElements([1, 2], [1]);
  }, 'Expected 2 elements: [1,2], got 1 elements: [1]');
  assertThrowsJsUnitException(function() {
    assertSameElements('Should match', [1, 2], [1]);
  }, 'Should match\nExpected 2 elements: [1,2], got 1 elements: [1]');
  assertThrowsJsUnitException(function() {
    assertSameElements([1, 2], [1, 3]);
  }, 'Expected [1,2], got [1,3]');
  assertThrowsJsUnitException(function() {
    assertSameElements('Should match', [1, 2], [1, 3]);
  }, 'Should match\nExpected [1,2], got [1,3]');
  assertThrowsJsUnitException(function() {
    assertSameElements([1, 1, 2], [2, 2, 1]);
  }, 'Expected [1,1,2], got [2,2,1]');
}

function testAssertSameElementsOnArrayLike() {
  assertSameElements({0: 0, 1: 1, length: 2}, {length: 2, 1: 1, 0: 0});
  assertThrowsJsUnitException(function() {
    assertSameElements({0: 0, 1: 1, length: 2}, {0: 0, length: 1});
  }, 'Expected 2 elements: [0,1], got 1 elements: [0]');
}

function testAssertSameElementsWithBadArguments() {
  assertThrowsJsUnitException(
      function() { assertSameElements([], new goog.structs.Set()); },
      'Bad arguments to assertSameElements(opt_message, expected: ' +
          'ArrayLike, actual: ArrayLike)\n' +
          'Call to assertTrue(boolean) with false');
}

var implicitlyTrue = [true, 1, -1, ' ', 'string', Infinity, new Object()];

var implicitlyFalse = [false, 0, '', null, undefined, NaN];

function testAssertEvaluatesToTrue() {
  assertEvaluatesToTrue(true);
  assertEvaluatesToTrue('', true);
  assertEvaluatesToTrue('Good assertion', true);
  assertThrowsJsUnitException(function() {
    assertEvaluatesToTrue(false);
  }, 'Expected to evaluate to true');
  assertThrowsJsUnitException(function() {
    assertEvaluatesToTrue('Should be true', false);
  }, 'Should be true\nExpected to evaluate to true');
  for (var i = 0; i < implicitlyTrue.length; i++) {
    assertEvaluatesToTrue(
        String('Test ' + implicitlyTrue[i] + ' [' + i + ']'),
        implicitlyTrue[i]);
  }
  for (var i = 0; i < implicitlyFalse.length; i++) {
    assertThrowsJsUnitException(function() {
      assertEvaluatesToTrue(implicitlyFalse[i]);
    }, 'Expected to evaluate to true');
  }
}

function testAssertEvaluatesToFalse() {
  assertEvaluatesToFalse(false);
  assertEvaluatesToFalse('Good assertion', false);
  assertThrowsJsUnitException(function() {
    assertEvaluatesToFalse(true);
  }, 'Expected to evaluate to false');
  assertThrowsJsUnitException(function() {
    assertEvaluatesToFalse('Should be false', true);
  }, 'Should be false\nExpected to evaluate to false');
  for (var i = 0; i < implicitlyFalse.length; i++) {
    assertEvaluatesToFalse(
        String('Test ' + implicitlyFalse[i] + ' [' + i + ']'),
        implicitlyFalse[i]);
  }
  for (var i = 0; i < implicitlyTrue.length; i++) {
    assertThrowsJsUnitException(function() {
      assertEvaluatesToFalse(implicitlyTrue[i]);
    }, 'Expected to evaluate to false');
  }
}

function testAssertHTMLEquals() {
  // TODO
}

function testAssertHashEquals() {
  assertHashEquals({a: 1, b: 2}, {b: 2, a: 1});
  assertHashEquals('Good assertion', {a: 1, b: 2}, {b: 2, a: 1});
  assertHashEquals({a: undefined}, {a: undefined});
  // Missing key.
  assertThrowsJsUnitException(function() {
    assertHashEquals({a: 1, b: 2}, {a: 1});
  }, 'Expected hash had key b that was not found');
  assertThrowsJsUnitException(function() {
    assertHashEquals('Should match', {a: 1, b: 2}, {a: 1});
  }, 'Should match\nExpected hash had key b that was not found');
  assertThrowsJsUnitException(function() {
    assertHashEquals({a: undefined}, {});
  }, 'Expected hash had key a that was not found');
  // Not equal key.
  assertThrowsJsUnitException(function() {
    assertHashEquals({a: 1}, {a: 5});
  }, 'Value for key a mismatch - expected = 1, actual = 5');
  assertThrowsJsUnitException(function() {
    assertHashEquals('Should match', {a: 1}, {a: 5});
  }, 'Should match\nValue for key a mismatch - expected = 1, actual = 5');
  assertThrowsJsUnitException(function() {
    assertHashEquals({a: undefined}, {a: 1})
  }, 'Value for key a mismatch - expected = undefined, actual = 1');
  // Extra key.
  assertThrowsJsUnitException(function() {
    assertHashEquals({a: 1}, {a: 1, b: 1});
  }, 'Actual hash had key b that was not expected');
  assertThrowsJsUnitException(function() {
    assertHashEquals('Should match', {a: 1}, {a: 1, b: 1});
  }, 'Should match\nActual hash had key b that was not expected');
}

function testAssertRoughlyEquals() {
  assertRoughlyEquals(1, 1, 0);
  assertRoughlyEquals('Good assertion', 1, 1, 0);
  assertRoughlyEquals(1, 1.1, 0.11);
  assertRoughlyEquals(1.1, 1, 0.11);
  assertThrowsJsUnitException(function() {
    assertRoughlyEquals(1, 1.1, 0.05);
  }, 'Expected 1, but got 1.1 which was more than 0.05 away');
  assertThrowsJsUnitException(function() {
    assertRoughlyEquals('Close enough', 1, 1.1, 0.05);
  }, 'Close enough\nExpected 1, but got 1.1 which was more than 0.05 away');
}

function testAssertContains() {
  var a = [1, 2, 3];
  assertContains(1, [1, 2, 3]);
  assertContains('Should contain', 1, [1, 2, 3]);
  assertThrowsJsUnitException(function() {
    assertContains(4, [1, 2, 3]);
  }, 'Expected \'1,2,3\' to contain \'4\'');
  assertThrowsJsUnitException(function() {
    assertContains('Should contain', 4, [1, 2, 3]);
  }, 'Should contain\nExpected \'1,2,3\' to contain \'4\'');
  // assertContains uses ===.
  var o = new Object();
  assertContains(o, [o, 2, 3]);
  assertThrowsJsUnitException(function() {
    assertContains(o, [1, 2, 3]);
  }, 'Expected \'1,2,3\' to contain \'[object Object]\'');
}

function testAssertNotContains() {
  var a = [1, 2, 3];
  assertNotContains(4, [1, 2, 3]);
  assertNotContains('Should not contain', 4, [1, 2, 3]);
  assertThrowsJsUnitException(function() {
    assertNotContains(1, [1, 2, 3]);
  }, 'Expected \'1,2,3\' not to contain \'1\'');
  assertThrowsJsUnitException(function() {
    assertNotContains('Should not contain', 1, [1, 2, 3]);
  }, "Should not contain\nExpected '1,2,3' not to contain '1'");
  // assertNotContains uses ===.
  var o = new Object();
  assertNotContains({}, [o, 2, 3]);
  assertThrowsJsUnitException(function() {
    assertNotContains(o, [o, 2, 3]);
  }, 'Expected \'[object Object],2,3\' not to contain \'[object Object]\'');
}

function testAssertRegExp() {
  var a = 'I like turtles';
  assertRegExp(/turtles$/, a);
  assertRegExp('turtles$', a);
  assertRegExp('Expected subject to be about turtles', /turtles$/, a);
  assertRegExp('Expected subject to be about turtles', 'turtles$', a);

  var b = 'Hello';
  assertThrowsJsUnitException(function() {
    assertRegExp(/turtles$/, b);
  }, 'Expected \'Hello\' to match RegExp /turtles$/');
  assertThrowsJsUnitException(function() {
    assertRegExp('turtles$', b);
  }, 'Expected \'Hello\' to match RegExp /turtles$/');
}

function testAssertThrows() {
  var failed = false;
  try {
    assertThrows('assertThrows should not pass with null param', null);
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);

  try {
    assertThrows(
        'assertThrows should not pass with undefined param', undefined);
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);

  try {
    assertThrows('assertThrows should not pass with number param', 1);
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);

  try {
    assertThrows('assertThrows should not pass with string param', 'string');
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);

  try {
    assertThrows('assertThrows should not pass with object param', {});
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);

  try {
    var error = assertThrows(
        'valid function throws Error', function() { throw new Error('test'); });
  } catch (e) {
    fail('assertThrows incorrectly doesn\'t detect a thrown exception');
  }
  assertEquals('error message', 'test', error.message);

  try {
    var stringError = assertThrows(
        'valid function throws string error',
        function() { throw 'string error test'; });
  } catch (e) {
    fail('assertThrows doesn\'t detect a thrown string exception');
  }
  assertEquals('string error', 'string error test', stringError);
}

function testAssertThrowsThrowsIfJsUnitException() {
  // TODO(b/25875505): We currently need this true for this part of the test.
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = true;

  // Asserts that assertThrows will throw a JsUnitException if the method
  // passed to assertThrows throws a JsUnitException of its own. assertThrows
  // should not be used for catching JsUnitExceptions with
  // "failOnUnreportedAsserts" enabled.
  var e = assertThrowsJsUnitException(function() {
    assertThrows(function() {
      // We need to invalidate this exception so it's not flagged as a
      // legitimate failure by the test framework. The only way to get at the
      // exception thrown by assertTrue is to catch it so we can invalidate it.
      // We then need to rethrow it so the surrounding assertThrows behaves as
      // expected.
      try {
        assertTrue(false);
      } catch (ex) {
        goog.testing.TestCase.getActiveTestCase().invalidateAssertionException(
            ex);
        throw ex;
      }
    });
  });
  assertContains(
      'Function passed to assertThrows caught a JsUnitException', e.message);

  // TODO(b/25875505): Set back to false so the rest of the tests pass.
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = false;
}

function testAssertThrowsJsUnitException() {
  var error = assertThrowsJsUnitException(function() { assertTrue(false); });
  assertEquals('Call to assertTrue(boolean) with false', error.message);

  error = assertThrowsJsUnitException(function() {
    assertThrowsJsUnitException(function() { throw new Error('fail'); });
  });
  assertEquals('Call to fail()\nExpected a JsUnitException', error.message);

  error = assertThrowsJsUnitException(function() {
    assertThrowsJsUnitException(goog.nullFunction);
  });
  assertEquals('Expected a failure', error.message);
}

function testAssertNotThrows() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  var failed = false;
  try {
    assertNotThrows('assertNotThrows should not pass with null param', null);
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);

  try {
    assertNotThrows(
        'assertNotThrows should not pass with undefined param', undefined);
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);

  try {
    assertNotThrows('assertNotThrows should not pass with number param', 1);
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);

  try {
    assertNotThrows(
        'assertNotThrows should not pass with string param', 'string');
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);


  try {
    assertNotThrows('assertNotThrows should not pass with object param', {});
    failed = true;
  } catch (e) {
  }
  assertFalse('Fail should not get set to true', failed);


  var result;
  try {
    result =
        assertNotThrows('valid function', function() { return 'some value'; });
  } catch (e) {
    // Shouldn't be here: throw exception.
    fail('assertNotThrows returned failure on a valid function');
  }
  assertEquals(
      'assertNotThrows should return the result of the function.', 'some value',
      result);

  var errorDescription = 'a test error exception';
  try {
    assertNotThrows('non valid error throwing function', function() {
      throw new Error(errorDescription);
    });
    failed = true;
  } catch (e) {
    // Some browsers don't have a stack trace so expect to at least have the
    // error description. For Gecko and IE7 not even that is included.
    if (!goog.userAgent.GECKO &&
        (!goog.userAgent.IE || goog.userAgent.isVersionOrHigher('8'))) {
      assertContains(errorDescription, e.message);
    }
  }
  assertFalse('assertNotThrows did not fail on a thrown exception', failed);
}

function testAssertArrayEquals() {
  var a1 = [0, 1, 2];
  var a2 = [0, 1, 2];
  assertArrayEquals('Arrays should be equal', a1, a2);

  assertThrows('Should have thrown because args are not arrays', function() {
    assertArrayEquals(true, true);
  });

  a1 = [0, undefined, 2];
  a2 = [0, , 2];
  // The following test fails unexpectedly. The bug is tracked at
  // http://code.google.com/p/closure-library/issues/detail?id=419
  // assertThrows(
  //     'assertArrayEquals distinguishes undefined items from sparse arrays',
  //     function() {
  //       assertArrayEquals(a1, a2);
  //     });

  // For the record. This behavior will probably change in the future.
  assertArrayEquals(
      'Bug: sparse arrays and undefined items are not distinguished',
      [0, undefined, 2], [0, , 2]);

  assertThrows('The array elements should be compared with ===', function() {
    assertArrayEquals([0], ['0']);
  });

  assertThrows('Arrays with different length should be different', function() {
    assertArrayEquals([0, undefined], [0]);
  });

  a1 = [0];
  a2 = [0];
  a2[-1] = -1;
  assertArrayEquals('Negative indexes are ignored', a1, a2);

  a1 = [0];
  a2 = [0];
  a2['extra'] = 1;
  assertArrayEquals(
      'Extra properties are ignored. Use assertObjectEquals to compare them.',
      a1, a2);

  assertArrayEquals(
      'An example where assertObjectEquals would fail in IE.', ['x'],
      'x'.match(/x/g));
}

function testAssertObjectsEqualsDifferentArrays() {
  assertThrows('Should have thrown because args are different', function() {
    var a1 = ['className1'];
    var a2 = ['className2'];
    assertObjectEquals(a1, a2);
  });
}

function testAssertObjectsEqualsNegativeArrayIndexes() {
  var a1 = [0];
  var a2 = [0];
  a2[-1] = -1;
  // The following test fails unexpectedly. The bug is tracked at
  // http://code.google.com/p/closure-library/issues/detail?id=418
  // assertThrows('assertObjectEquals compares negative indexes', function() {
  //   assertObjectEquals(a1, a2);
  // });
}

function testAssertObjectsEqualsDifferentTypeSameToString() {
  assertThrows('Should have thrown because args are different', function() {
    var a1 = 'className1';
    var a2 = ['className1'];
    assertObjectEquals(a1, a2);
  });

  assertThrows('Should have thrown because args are different', function() {
    var a1 = ['className1'];
    var a2 = {'0': 'className1'};
    assertObjectEquals(a1, a2);
  });

  assertThrows('Should have thrown because args are different', function() {
    var a1 = ['className1'];
    var a2 = [['className1']];
    assertObjectEquals(a1, a2);
  });
}

function testAssertObjectsRoughlyEquals() {
  assertObjectRoughlyEquals({'a': 1}, {'a': 1.2}, 0.3);
  assertThrowsJsUnitException(
      function() { assertObjectRoughlyEquals({'a': 1}, {'a': 1.2}, 0.1); },
      'Expected <[object Object]> (Object) but was <[object Object]> ' +
          '(Object)\n   a: Expected <1> (Number) but was <1.2> (Number) which ' +
          'was more than 0.1 away');
}

function testFindDifferences_equal() {
  assertNull(goog.testing.asserts.findDifferences(true, true));
  assertNull(goog.testing.asserts.findDifferences(null, null));
  assertNull(goog.testing.asserts.findDifferences(undefined, undefined));
  assertNull(goog.testing.asserts.findDifferences(1, 1));
  assertNull(goog.testing.asserts.findDifferences([1, 'a'], [1, 'a']));
  assertNull(
      goog.testing.asserts.findDifferences([[1, 2], [3, 4]], [[1, 2], [3, 4]]));
  assertNull(
      goog.testing.asserts.findDifferences([{a: 1, b: 2}], [{b: 2, a: 1}]));
  assertNull(goog.testing.asserts.findDifferences(null, null));
  assertNull(goog.testing.asserts.findDifferences(undefined, undefined));
}

function testFindDifferences_unequal() {
  assertNotNull(goog.testing.asserts.findDifferences(true, false));
  assertNotNull(
      goog.testing.asserts.findDifferences([{a: 1, b: 2}], [{a: 2, b: 1}]));
  assertNotNull(
      goog.testing.asserts.findDifferences([{a: 1}], [{a: 1, b: [2]}]));
  assertNotNull(
      goog.testing.asserts.findDifferences([{a: 1, b: [2]}], [{a: 1}]));
}

function testFindDifferences_objectsAndNull() {
  assertNotNull(goog.testing.asserts.findDifferences({a: 1}, null));
  assertNotNull(goog.testing.asserts.findDifferences(null, {a: 1}));
  assertNotNull(goog.testing.asserts.findDifferences(null, []));
  assertNotNull(goog.testing.asserts.findDifferences([], null));
  assertNotNull(goog.testing.asserts.findDifferences([], undefined));
}

function testFindDifferences_basicCycle() {
  var a = {};
  var b = {};
  a.self = a;
  b.self = b;
  assertNull(goog.testing.asserts.findDifferences(a, b));

  a.unique = 1;
  assertNotNull(goog.testing.asserts.findDifferences(a, b));
}

function testFindDifferences_crossedCycle() {
  var a = {};
  var b = {};
  a.self = b;
  b.self = a;
  assertNull(goog.testing.asserts.findDifferences(a, b));

  a.unique = 1;
  assertNotNull(goog.testing.asserts.findDifferences(a, b));
}

function testFindDifferences_asymmetricCycle() {
  var a = {};
  var b = {};
  var c = {};
  var d = {};
  var e = {};
  a.self = b;
  b.self = a;
  c.self = d;
  d.self = e;
  e.self = c;
  assertNotNull(goog.testing.asserts.findDifferences(a, c));
}

function testFindDifferences_basicCycleArray() {
  var a = [];
  var b = [];
  a[0] = a;
  b[0] = b;
  assertNull(goog.testing.asserts.findDifferences(a, b));

  a[1] = 1;
  assertNotNull(goog.testing.asserts.findDifferences(a, b));
}

function testFindDifferences_crossedCycleArray() {
  var a = [];
  var b = [];
  a[0] = b;
  b[0] = a;
  assertNull(goog.testing.asserts.findDifferences(a, b));

  a[1] = 1;
  assertNotNull(goog.testing.asserts.findDifferences(a, b));
}

function testFindDifferences_asymmetricCycleArray() {
  var a = [];
  var b = [];
  var c = [];
  var d = [];
  var e = [];
  a[0] = b;
  b[0] = a;
  c[0] = d;
  d[0] = e;
  e[0] = c;
  assertNotNull(goog.testing.asserts.findDifferences(a, c));
}

function testFindDifferences_multiCycles() {
  var a = {};
  a.cycle1 = a;
  a.test = {cycle2: a};

  var b = {};
  b.cycle1 = b;
  b.test = {cycle2: b};
  assertNull(goog.testing.asserts.findDifferences(a, b));
}

function testFindDifferences_binaryTree() {
  function createBinTree(depth, root) {
    if (depth == 0) {
      return {root: root};
    } else {
      var node = {};
      node.left = createBinTree(depth - 1, root || node);
      node.right = createBinTree(depth - 1, root || node);
      return node;
    }
  }

  // TODO(gboyer,user): This test does not terminate with the current
  // algorithm. Can be enabled when (if) the algorithm is improved.
  // assertNull(goog.testing.asserts.findDifferences(
  //    createBinTree(5, null), createBinTree(5, null)));
  assertNotNull(
      goog.testing.asserts.findDifferences(
          createBinTree(4, null), createBinTree(5, null)));
}

function testStringForWindowIE() {
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8')) {
    // NOTE(user): This test sees of we are being affected by a JScript bug
    // in try/finally handling. This bug only affects the lowest try/finally
    // block in the stack. Calling this function via VBScript allows
    // us to run the test synchronously in an empty JS stack.
    window.execScript('stringForWindowIEHelper()', 'vbscript');
    assertEquals('<[object]> (Object)', window.stringForWindowIEResult);
  }
}

function testStringSamePrefix() {
  assertThrowsJsUnitException(
      function() { assertEquals('abcdefghi', 'abcdefghx'); },
      'Expected <abcdefghi> (String) but was <abcdefghx> (String)\n' +
          'Difference was at position 8. Expected [...ghi] vs. actual [...ghx]');
}

function testStringSameSuffix() {
  assertThrowsJsUnitException(
      function() { assertEquals('xbcdefghi', 'abcdefghi'); },
      'Expected <xbcdefghi> (String) but was <abcdefghi> (String)\n' +
          'Difference was at position 0. Expected [xbc...] vs. actual [abc...]');
}

function testStringDissimilarShort() {
  assertThrowsJsUnitException(function() {
    assertEquals('x', 'y');
  }, 'Expected <x> (String) but was <y> (String)');
}

function testStringDissimilarLong() {
  assertThrowsJsUnitException(function() {
    assertEquals('xxxxxxxxxx', 'yyyyyyyyyy');
  }, 'Expected <xxxxxxxxxx> (String) but was <yyyyyyyyyy> (String)');
}

function testAssertElementsEquals() {
  assertElementsEquals([1, 2], [1, 2]);
  assertElementsEquals([1, 2], {0: 1, 1: 2, length: 2});
  assertElementsEquals('Good assertion', [1, 2], [1, 2]);
  assertThrowsJsUnitException(
      function() {
        assertElementsEquals('Message', [1, 2], [1]);
      },
      'length mismatch: Message\n' +
          'Expected <2> (Number) but was <1> (Number)');
}

function testStackTrace() {
  try {
    assertTrue(false);
  } catch (e) {
    if (Error.captureStackTrace) {
      assertNotUndefined(e.stack);
    }
    if (e.stack) {
      var stack = e.stack;
      var stackTraceContainsTestName =
          goog.string.contains(stack, 'testStackTrace');
      if (!stackTraceContainsTestName &&
          goog.labs.userAgent.browser.isChrome()) {
        // Occasionally Chrome does not give us a full stack trace, making for
        // a flaky test. If we don't have the full stack trace, at least
        // check that we got the error string.
        // Filed a bug on Chromium here:
        // https://code.google.com/p/chromium/issues/detail?id=403029
        var expected = 'Call to assertTrue(boolean) with false';
        assertContains(expected, stack);
        return;
      }

      assertTrue(
          'Expected the stack trace to contain string "testStackTrace"',
          stackTraceContainsTestName);
    }
  }
}

function stringForWindowIEHelper() {
  window.stringForWindowIEResult = _displayStringForValue(window);
}

function testDisplayStringForValue() {
  assertEquals('<hello> (String)', _displayStringForValue('hello'));
  assertEquals('<1> (Number)', _displayStringForValue(1));
  assertEquals('<null>', _displayStringForValue(null));
  assertEquals('<undefined>', _displayStringForValue(undefined));
  assertEquals(
      '<hello,,,,1> (Array)',
      _displayStringForValue(['hello', /* array hole */, undefined, null, 1]));
}

function testDisplayStringForValue_exception() {
  assertEquals(
      '<toString failed: foo message> (Object)',
      _displayStringForValue(
          {toString: function() { throw Error('foo message'); }}));
}

function testDisplayStringForValue_cycle() {
  var cycle = ['cycle'];
  cycle.push(cycle);
  assertTrue(
      'Computing string should terminate and result in a reasonable length',
      _displayStringForValue(cycle).length < 1000);
}
