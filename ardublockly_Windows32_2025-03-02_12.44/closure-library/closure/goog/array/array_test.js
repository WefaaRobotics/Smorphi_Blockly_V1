// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.arrayTest');
goog.setTestOnly('goog.arrayTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

function testArrayLast() {
  assertEquals(goog.array.last([1, 2, 3]), 3);
  assertEquals(goog.array.last([1]), 1);
  assertUndefined(goog.array.last([]));
}

function testArrayLastWhenDeleted() {
  var a = [1, 2, 3];
  delete a[2];
  assertUndefined(goog.array.last(a));
}

function testArrayIndexOf() {
  assertEquals(goog.array.indexOf([0, 1, 2, 3], 1), 1);
  assertEquals(goog.array.indexOf([0, 1, 1, 1], 1), 1);
  assertEquals(goog.array.indexOf([0, 1, 2, 3], 4), -1);
  assertEquals(goog.array.indexOf([0, 1, 2, 3], 1, 1), 1);
  assertEquals(goog.array.indexOf([0, 1, 2, 3], 1, 2), -1);
  assertEquals(goog.array.indexOf([0, 1, 2, 3], 1, -3), 1);
  assertEquals(goog.array.indexOf([0, 1, 2, 3], 1, -2), -1);
}

function testArrayIndexOfOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  assertEquals(goog.array.indexOf(a, undefined), -1);
}

function testArrayIndexOfString() {
  assertEquals(goog.array.indexOf('abcd', 'd'), 3);
  assertEquals(goog.array.indexOf('abbb', 'b', 2), 2);
  assertEquals(goog.array.indexOf('abcd', 'e'), -1);
  assertEquals(goog.array.indexOf('abcd', 'cd'), -1);
  assertEquals(goog.array.indexOf('0123', 1), -1);
}

function testArrayLastIndexOf() {
  assertEquals(goog.array.lastIndexOf([0, 1, 2, 3], 1), 1);
  assertEquals(goog.array.lastIndexOf([0, 1, 1, 1], 1), 3);
  assertEquals(goog.array.lastIndexOf([0, 1, 1, 1], 1, 2), 2);
}

function testArrayLastIndexOfOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  assertEquals(goog.array.lastIndexOf(a, undefined), -1);
}

function testArrayLastIndexOfString() {
  assertEquals(goog.array.lastIndexOf('abcd', 'b'), 1);
  assertEquals(goog.array.lastIndexOf('abbb', 'b'), 3);
  assertEquals(goog.array.lastIndexOf('abbb', 'b', 2), 2);
  assertEquals(goog.array.lastIndexOf('abcd', 'cd'), -1);
  assertEquals(goog.array.lastIndexOf('0123', 1), -1);
}

function testArrayForEachBasic() {
  var s = '';
  var a = ['a', 'b', 'c', 'd'];
  goog.array.forEach(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('Index is not a number', 'number', typeof index);
    s += val + index;
  });
  assertEquals('a0b1c2d3', s);
}

function testArrayForEachWithEmptyArray() {
  var a = new Array(100);
  goog.array.forEach(a, function(val, index, a2) {
    fail('The function should not be called since no values were assigned.');
  });
}

function testArrayForEachWithOnlySomeValuesAsigned() {
  var count = 0;
  var a = new Array(1000);
  a[100] = undefined;
  goog.array.forEach(a, function(val, index, a2) {
    assertEquals(100, index);
    count++;
  });
  assertEquals(
      'Should only call function when a value of array was assigned.', 1,
      count);
}

function testArrayForEachWithArrayLikeObject() {
  var counter = goog.testing.recordFunction();
  var a = {'length': 1, '0': 0, '100': 100, '101': 102};
  goog.array.forEach(a, counter);
  assertEquals(
      'Number of calls should not exceed the value of its length', 1,
      counter.getCallCount());
}

function testArrayForEachOmitsDeleted() {
  var s = '';
  var a = ['a', 'b', 'c', 'd'];
  delete a[1];
  delete a[3];
  goog.array.forEach(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof index);
    s += val + index;
  });
  assertEquals('a0c2', s);
}

function testArrayForEachScope() {
  var scope = {};
  var a = ['a', 'b', 'c', 'd'];
  goog.array.forEach(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof index);
    assertEquals(this, scope);
  }, scope);
}

function testArrayForEachRight() {
  var s = '';
  var a = ['a', 'b', 'c', 'd'];
  goog.array.forEachRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof index);
    s += val + String(index);
  });
  assertEquals('d3c2b1a0', s);
}

function testArrayForEachRightOmitsDeleted() {
  var s = '';
  var a = ['a', 'b', 'c', 'd'];
  delete a[1];
  delete a[3];
  goog.array.forEachRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof index);
    assertEquals('string', typeof val);
    s += val + String(index);
  });
  assertEquals('c2a0', s);
}

function testArrayFilter() {
  var a = [0, 1, 2, 3];
  a = goog.array.filter(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertArrayEquals([2, 3], a);
}

function testArrayFilterOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  a = goog.array.filter(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof val);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertArrayEquals([2], a);
}

function testArrayFilterPreservesValues() {
  var a = [0, 1, 2, 3];
  a = goog.array.filter(a, function(val, index, a2) {
    assertEquals(a, a2);
    // sometimes functions might be evil and do something like this, but we
    // should still use the original values when returning the filtered array
    a2[index] = a2[index] - 1;
    return a2[index] >= 1;
  });
  assertArrayEquals([2, 3], a);
}

function testArrayMap() {
  var a = [0, 1, 2, 3];
  var result = goog.array.map(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val * val;
  });
  assertArrayEquals([0, 1, 4, 9], result);
}

function testArrayMapOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  var result = goog.array.map(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof val);
    assertEquals('index is not a number', 'number', typeof index);
    return val * val;
  });
  var expected = [0, 1, 4, 9];
  delete expected[1];
  delete expected[3];

  assertArrayEquals(expected, result);
  assertFalse('1' in result);
  assertFalse('3' in result);
}

function testArrayReduce() {
  var a = [0, 1, 2, 3];
  assertEquals(6, goog.array.reduce(a, function(rval, val, i, arr) {
    assertEquals('number', typeof i);
    assertEquals(a, arr);
    return rval + val;
  }, 0));

  var scope = {
    last: 0,
    testFn: function(r, v, i, arr) {
      assertEquals('number', typeof i);
      assertEquals(a, arr);
      var l = this.last;
      this.last = r + v;
      return this.last + l;
    }
  };

  assertEquals(10, goog.array.reduce(a, scope.testFn, 0, scope));
}

function testArrayReduceOmitDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  assertEquals(2, goog.array.reduce(a, function(rval, val, i, arr) {
    assertEquals('number', typeof i);
    assertEquals(a, arr);
    return rval + val;
  }, 0));

  var scope = {
    last: 0,
    testFn: function(r, v, i, arr) {
      assertEquals('number', typeof i);
      assertEquals(a, arr);
      var l = this.last;
      this.last = r + v;
      return this.last + l;
    }
  };

  assertEquals(2, goog.array.reduce(a, scope.testFn, 0, scope));
}

function testArrayReduceRight() {
  var a = [0, 1, 2, 3, 4];
  assertEquals('43210', goog.array.reduceRight(a, function(rval, val, i, arr) {
    assertEquals('number', typeof i);
    assertEquals(a, arr);
    return rval + val;
  }, ''));

  var scope = {
    last: '',
    testFn: function(r, v, i, arr) {
      assertEquals('number', typeof i);
      assertEquals(a, arr);
      var l = this.last;
      this.last = v;
      return r + v + l;
    }
  };

  a = ['a', 'b', 'c'];
  assertEquals('_cbcab', goog.array.reduceRight(a, scope.testFn, '_', scope));
}

function testArrayReduceRightOmitsDeleted() {
  var a = [0, 1, 2, 3, 4];
  delete a[1];
  delete a[4];
  assertEquals('320', goog.array.reduceRight(a, function(rval, val, i, arr) {
    assertEquals('number', typeof i);
    assertEquals(a, arr);
    return rval + val;
  }, ''));

  scope = {
    last: '',
    testFn: function(r, v, i, arr) {
      assertEquals('number', typeof i);
      assertEquals(a, arr);
      var l = this.last;
      this.last = v;
      return r + v + l;
    }
  };

  a = ['a', 'b', 'c', 'd'];
  delete a[1];
  delete a[3];
  assertEquals('_cac', goog.array.reduceRight(a, scope.testFn, '_', scope));
}

function testArrayFind() {
  var a = [0, 1, 2, 3];
  var b = goog.array.find(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertEquals(2, b);

  b = goog.array.find(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertNull(b);

  a = 'abCD';
  b = goog.array.find(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val >= 'A' && val <= 'Z';
  });
  assertEquals('C', b);

  a = 'abcd';
  b = goog.array.find(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val >= 'A' && val <= 'Z';
  });
  assertNull(b);
}

function testArrayFindOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  var b = goog.array.find(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });

  assertEquals(2, b);
  b = goog.array.find(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertNull(b);
}

function testArrayFindIndex() {
  var a = [0, 1, 2, 3];
  var b = goog.array.findIndex(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertEquals(2, b);

  b = goog.array.findIndex(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertEquals(-1, b);

  a = 'abCD';
  b = goog.array.findIndex(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val >= 'A' && val <= 'Z';
  });
  assertEquals(2, b);

  a = 'abcd';
  b = goog.array.findIndex(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val >= 'A' && val <= 'Z';
  });
  assertEquals(-1, b);
}

function testArrayFindIndexOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  var b = goog.array.findIndex(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertEquals(2, b);

  b = goog.array.findIndex(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertEquals(-1, b);
}

function testArrayFindRight() {
  var a = [0, 1, 2, 3];
  var b = goog.array.findRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val < 3;
  });
  assertEquals(2, b);
  b = goog.array.findRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertNull(b);
}

function testArrayFindRightOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  var b = goog.array.findRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val < 3;
  });
  assertEquals(2, b);
  b = goog.array.findRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertNull(b);
}

function testArrayFindIndexRight() {
  var a = [0, 1, 2, 3];
  var b = goog.array.findIndexRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val < 3;
  });
  assertEquals(2, b);

  b = goog.array.findIndexRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertEquals(-1, b);

  a = 'abCD';
  b = goog.array.findIndexRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val >= 'a' && val <= 'z';
  });
  assertEquals(1, b);

  a = 'abcd';
  b = goog.array.findIndexRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val >= 'A' && val <= 'Z';
  });
  assertEquals(-1, b);
}

function testArrayFindIndexRightOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  var b = goog.array.findIndexRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val < 3;
  });
  assertEquals(2, b);
  b = goog.array.findIndexRight(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertEquals(-1, b);
}

function testArraySome() {
  var a = [0, 1, 2, 3];
  var b = goog.array.some(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertTrue(b);
  b = goog.array.some(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertFalse(b);
}

function testArraySomeOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  var b = goog.array.some(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof val);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertTrue(b);
  b = goog.array.some(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof val);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertFalse(b);
}

function testArrayEvery() {
  var a = [0, 1, 2, 3];
  var b = goog.array.every(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val >= 0;
  });
  assertTrue(b);
  b = goog.array.every(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertFalse(b);
}

function testArrayEveryOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  var b = goog.array.every(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof val);
    assertEquals('index is not a number', 'number', typeof index);
    return val >= 0;
  });
  assertTrue(b);
  b = goog.array.every(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('number', typeof val);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertFalse(b);
}

function testArrayCount() {
  var a = [0, 1, 2, 3, 4];
  var context = {};
  assertEquals(3, goog.array.count(a, function(element, index, array) {
    assertTrue(goog.isNumber(index));
    assertEquals(a, array);
    assertEquals(context, this);
    return element % 2 == 0;
  }, context));

  delete a[2];
  assertEquals('deleted element is ignored', 4, goog.array.count(a, function() {
    return true;
  }));
}

function testArrayContains() {
  var a = [0, 1, 2, 3];
  assertTrue('contain, Should contain 3', goog.array.contains(a, 3));
  assertFalse('contain, Should not contain 4', goog.array.contains(a, 4));

  var s = 'abcd';
  assertTrue('contain, Should contain d', goog.array.contains(s, 'd'));
  assertFalse('contain, Should not contain e', goog.array.contains(s, 'e'));
}

function testArrayContainsOmitsDeleted() {
  var a = [0, 1, 2, 3];
  delete a[1];
  delete a[3];
  assertFalse(
      'should not contain undefined', goog.array.contains(a, undefined));
}

function testArrayInsert() {
  var a = [0, 1, 2, 3];

  goog.array.insert(a, 4);
  assertEquals('insert, Should append 4', a[4], 4);
  goog.array.insert(a, 3);
  assertEquals('insert, Should not append 3', a.length, 5);
  assertNotEquals('insert, Should not append 3', a[a.length - 1], 3);
}

function testArrayInsertAt() {
  var a = [0, 1, 2, 3];

  goog.array.insertAt(a, 4, 2);
  assertArrayEquals('insertAt, insert in middle', [0, 1, 4, 2, 3], a);
  goog.array.insertAt(a, 5, 10);
  assertArrayEquals(
      'insertAt, too large value should append', [0, 1, 4, 2, 3, 5], a);
  goog.array.insertAt(a, 6);
  assertArrayEquals(
      'insertAt, null/undefined value should insert at 0',
      [6, 0, 1, 4, 2, 3, 5], a);
  goog.array.insertAt(a, 7, -2);
  assertArrayEquals(
      'insertAt, negative values start from end', [6, 0, 1, 4, 2, 7, 3, 5], a);
}

function testArrayInsertArrayAt() {
  var a = [2, 5];
  goog.array.insertArrayAt(a, [3, 4], 1);
  assertArrayEquals('insertArrayAt, insert in middle', [2, 3, 4, 5], a);
  goog.array.insertArrayAt(a, [0, 1], 0);
  assertArrayEquals(
      'insertArrayAt, insert at beginning', [0, 1, 2, 3, 4, 5], a);
  goog.array.insertArrayAt(a, [6, 7], 6);
  assertArrayEquals(
      'insertArrayAt, insert at end', [0, 1, 2, 3, 4, 5, 6, 7], a);
  goog.array.insertArrayAt(a, ['x'], 4);
  assertArrayEquals(
      'insertArrayAt, insert one element', [0, 1, 2, 3, 'x', 4, 5, 6, 7], a);
  goog.array.insertArrayAt(a, [], 4);
  assertArrayEquals(
      'insertArrayAt, insert 0 elements', [0, 1, 2, 3, 'x', 4, 5, 6, 7], a);
  goog.array.insertArrayAt(a, ['y', 'z']);
  assertArrayEquals(
      'insertArrayAt, undefined value should insert at 0',
      ['y', 'z', 0, 1, 2, 3, 'x', 4, 5, 6, 7], a);
  goog.array.insertArrayAt(a, ['a'], null);
  assertArrayEquals(
      'insertArrayAt, null value should insert at 0',
      ['a', 'y', 'z', 0, 1, 2, 3, 'x', 4, 5, 6, 7], a);
  goog.array.insertArrayAt(a, ['b'], 100);
  assertArrayEquals(
      'insertArrayAt, too large value should append',
      ['a', 'y', 'z', 0, 1, 2, 3, 'x', 4, 5, 6, 7, 'b'], a);
  goog.array.insertArrayAt(a, ['c', 'd'], -2);
  assertArrayEquals(
      'insertArrayAt, negative values start from end',
      ['a', 'y', 'z', 0, 1, 2, 3, 'x', 4, 5, 6, 'c', 'd', 7, 'b'], a);
}

function testArrayInsertBefore() {
  var a = ['a', 'b', 'c', 'd'];
  goog.array.insertBefore(a, 'e', 'b');
  assertArrayEquals(
      'insertBefore, with existing element', ['a', 'e', 'b', 'c', 'd'], a);
  goog.array.insertBefore(a, 'f', 'x');
  assertArrayEquals(
      'insertBefore, with non existing element', ['a', 'e', 'b', 'c', 'd', 'f'],
      a);
}

function testArrayRemove() {
  var a = ['a', 'b', 'c', 'd'];
  goog.array.remove(a, 'c');
  assertArrayEquals('remove, remove existing element', ['a', 'b', 'd'], a);
  goog.array.remove(a, 'x');
  assertArrayEquals('remove, remove non existing element', ['a', 'b', 'd'], a);
}

function testArrayRemoveAt() {
  var a = [0, 1, 2, 3];
  goog.array.removeAt(a, 2);
  assertArrayEquals('removeAt, remove existing index', [0, 1, 3], a);
  a = [0, 1, 2, 3];
  goog.array.removeAt(a, 10);
  assertArrayEquals('removeAt, remove non existing index', [0, 1, 2, 3], a);
  a = [0, 1, 2, 3];
  goog.array.removeAt(a, -2);
  assertArrayEquals('removeAt, remove with negative index', [0, 1, 3], a);
}

function testArrayRemoveIf() {
  var a = [0, 1, 2, 3];
  var b = goog.array.removeIf(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 1;
  });
  assertArrayEquals('removeIf, remove existing element', [0, 1, 3], a);

  a = [0, 1, 2, 3];
  var b = goog.array.removeIf(a, function(val, index, a2) {
    assertEquals(a, a2);
    assertEquals('index is not a number', 'number', typeof index);
    return val > 100;
  });
  assertArrayEquals('removeIf, remove non-existing element', [0, 1, 2, 3], a);
}

function testArrayClone() {
  var a = [0, 1, 2, 3];
  var a2 = goog.array.clone(a);
  assertArrayEquals('clone, should be equal', a, a2);

  var b = {0: 0, 1: 1, 2: 2, 3: 3, length: 4};
  var b2 = goog.array.clone(b);
  for (var i = 0; i < b.length; i++) {
    assertEquals('clone, should be equal', b[i], b2[i]);
  }
}

function testToArray() {
  var a = [0, 1, 2, 3];
  var a2 = goog.array.toArray(a);
  assertArrayEquals('toArray, should be equal', a, a2);

  var b = {0: 0, 1: 1, 2: 2, 3: 3, length: 4};
  var b2 = goog.array.toArray(b);
  for (var i = 0; i < b.length; i++) {
    assertEquals('toArray, should be equal', b[i], b2[i]);
  }
}

function testToArrayOnNonArrayLike() {
  var nonArrayLike = {};
  assertArrayEquals(
      'toArray on non ArrayLike should return an empty array', [],
      goog.array.toArray(nonArrayLike));

  var nonArrayLike2 = {length: 'hello world'};
  assertArrayEquals(
      'toArray on non ArrayLike should return an empty array', [],
      goog.array.toArray(nonArrayLike2));
}

function testExtend() {
  var a = [0, 1];
  goog.array.extend(a, [2, 3]);
  var a2 = [0, 1, 2, 3];
  assertArrayEquals('extend, should be equal', a, a2);

  var b = [0, 1];
  goog.array.extend(b, 2);
  var b2 = [0, 1, 2];
  assertArrayEquals('extend, should be equal', b, b2);

  a = [0, 1];
  goog.array.extend(a, [2, 3], [4, 5]);
  a2 = [0, 1, 2, 3, 4, 5];
  assertArrayEquals('extend, should be equal', a, a2);

  b = [0, 1];
  goog.array.extend(b, 2, 3);
  b2 = [0, 1, 2, 3];
  assertArrayEquals('extend, should be equal', b, b2);

  var c = [0, 1];
  goog.array.extend(c, 2, [3, 4], 5, [6]);
  var c2 = [0, 1, 2, 3, 4, 5, 6];
  assertArrayEquals('extend, should be equal', c, c2);

  var d = [0, 1];
  var arrayLikeObject = {0: 2, 1: 3, length: 2};
  goog.array.extend(d, arrayLikeObject);
  var d2 = [0, 1, 2, 3];
  assertArrayEquals('extend, should be equal', d, d2);

  var e = [0, 1];
  var emptyArrayLikeObject = {length: 0};
  goog.array.extend(e, emptyArrayLikeObject);
  assertArrayEquals('extend, should be equal', e, e);

  var f = [0, 1];
  var length3ArrayLikeObject = {0: 2, 1: 4, 2: 8, length: 3};
  goog.array.extend(f, length3ArrayLikeObject, length3ArrayLikeObject);
  var f2 = [0, 1, 2, 4, 8, 2, 4, 8];
  assertArrayEquals('extend, should be equal', f2, f);

  var result = [];
  var i = 1000000;
  var bigArray = Array(i);
  while (i--) {
    bigArray[i] = i;
  }
  goog.array.extend(result, bigArray);
  assertArrayEquals(bigArray, result);
}

function testExtendWithArguments() {
  function f() { return arguments; }
  var a = [0];
  var a2 = [0, 1, 2, 3, 4, 5];
  goog.array.extend(a, f(1, 2, 3), f(4, 5));
  assertArrayEquals('extend, should be equal', a, a2);
}

function testExtendWithQuerySelector() {
  var a = [0];
  var d = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.DIV, 'foo');
  goog.array.extend(a, d);
  assertEquals(2, a.length);
}

function testArraySplice() {
  var a = [0, 1, 2, 3];
  goog.array.splice(a, 1, 0, 4);
  assertArrayEquals([0, 4, 1, 2, 3], a);
  goog.array.splice(a, 1, 1, 5);
  assertArrayEquals([0, 5, 1, 2, 3], a);
  goog.array.splice(a, 1, 1);
  assertArrayEquals([0, 1, 2, 3], a);
  // var args
  goog.array.splice(a, 1, 1, 4, 5, 6);
  assertArrayEquals([0, 4, 5, 6, 2, 3], a);
}

function testArraySlice() {
  var a = [0, 1, 2, 3];
  a = goog.array.slice(a, 1, 3);
  assertArrayEquals([1, 2], a);
  a = [0, 1, 2, 3];
  a = goog.array.slice(a, 1, 6);
  assertArrayEquals('slice, with too large end', [1, 2, 3], a);
  a = [0, 1, 2, 3];
  a = goog.array.slice(a, 1, -1);
  assertArrayEquals('slice, with negative end', [1, 2], a);
  a = [0, 1, 2, 3];
  a = goog.array.slice(a, -2, 3);
  assertArrayEquals('slice, with negative start', [2], a);
}

function assertRemovedDuplicates(expected, original) {
  var tempArr = goog.array.clone(original);
  goog.array.removeDuplicates(tempArr);
  assertArrayEquals(expected, tempArr);
}

function testRemoveDuplicates() {
  assertRemovedDuplicates([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]);
  assertRemovedDuplicates(
      [9, 4, 2, 1, 3, 6, 0, -9], [9, 4, 2, 4, 4, 2, 9, 1, 3, 6, 0, -9]);
  assertRemovedDuplicates(
      ['four', 'one', 'two', 'three', 'THREE'],
      ['four', 'one', 'two', 'one', 'three', 'THREE', 'four', 'two']);
  assertRemovedDuplicates([], []);
  assertRemovedDuplicates(
      ['abc', 'hasOwnProperty', 'toString'],
      ['abc', 'hasOwnProperty', 'toString', 'abc']);

  var o1 = {}, o2 = {}, o3 = {}, o4 = {};
  assertRemovedDuplicates([o1, o2, o3, o4], [o1, o1, o2, o3, o2, o4]);

  // Mixed object types.
  assertRemovedDuplicates([1, '1', 2, '2'], [1, '1', 2, '2']);
  assertRemovedDuplicates(
      [true, 'true', false, 'false'], [true, 'true', false, 'false']);
  assertRemovedDuplicates(['foo'], [String('foo'), 'foo']);
  assertRemovedDuplicates([12], [Number(12), 12]);

  var obj = {};
  var uid = goog.getUid(obj);
  assertRemovedDuplicates([obj, uid], [obj, uid]);
}

function testRemoveDuplicates_customHashFn() {
  var object1 = {key: 'foo'};
  var object2 = {key: 'bar'};
  var dupeObject = {key: 'foo'};
  var array = [object1, object2, dupeObject, 'bar'];
  var hashFn = function(object) {
    return goog.isObject(object) ? object.key :
                                   (typeof object).charAt(0) + object;
  };
  goog.array.removeDuplicates(array, /* opt_rv */ undefined, hashFn);
  assertArrayEquals([object1, object2, 'bar'], array);
}

function testBinaryInsertRemove() {
  var makeChecker = function(array, fn, opt_compareFn) {
    return function(value, expectResult, expectArray) {
      var result = fn(array, value, opt_compareFn);
      assertEquals(expectResult, result);
      assertArrayEquals(expectArray, array);
    }
  };

  var a = [];
  var check = makeChecker(a, goog.array.binaryInsert);
  check(3, true, [3]);
  check(3, false, [3]);
  check(1, true, [1, 3]);
  check(5, true, [1, 3, 5]);
  check(2, true, [1, 2, 3, 5]);
  check(2, false, [1, 2, 3, 5]);

  check = makeChecker(a, goog.array.binaryRemove);
  check(0, false, [1, 2, 3, 5]);
  check(3, true, [1, 2, 5]);
  check(1, true, [2, 5]);
  check(5, true, [2]);
  check(2, true, []);
  check(2, false, []);

  // test with custom comparison function, which reverse orders numbers
  var revNumCompare = function(a, b) { return b - a; };

  check = makeChecker(a, goog.array.binaryInsert, revNumCompare);
  check(3, true, [3]);
  check(3, false, [3]);
  check(1, true, [3, 1]);
  check(5, true, [5, 3, 1]);
  check(2, true, [5, 3, 2, 1]);
  check(2, false, [5, 3, 2, 1]);

  check = makeChecker(a, goog.array.binaryRemove, revNumCompare);
  check(0, false, [5, 3, 2, 1]);
  check(3, true, [5, 2, 1]);
  check(1, true, [5, 2]);
  check(5, true, [2]);
  check(2, true, []);
  check(2, false, []);
}

function testBinarySearch() {
  var insertionPoint = function(position) { return -(position + 1) };
  var pos;

  // test default comparison on array of String(s)
  var a = [
    '1000',   '9',   'AB',   'ABC', 'ABCABC', 'ABD', 'ABDA', 'B',
    'B',      'B',   'C',    'CA',  'CC',     'ZZZ', 'ab',   'abc',
    'abcabc', 'abd', 'abda', 'b',   'c',      'ca',  'cc',   'zzz'
  ];

  assertEquals(
      '\'1000\' should be found at index 0', 0,
      goog.array.binarySearch(a, '1000'));
  assertEquals(
      '\'zzz\' should be found at index ' + (a.length - 1), a.length - 1,
      goog.array.binarySearch(a, 'zzz'));
  assertEquals(
      '\'C\' should be found at index 10', 10, goog.array.binarySearch(a, 'C'));
  pos = goog.array.binarySearch(a, 'B');
  assertTrue(
      '\'B\' should be found at index 7 || 8 || 9',
      pos == 7 || pos == 8 || pos == 9);
  pos = goog.array.binarySearch(a, '100');
  assertTrue('\'100\' should not be found', pos < 0);
  assertEquals(
      '\'100\' should have an insertion point of 0', 0, insertionPoint(pos));
  pos = goog.array.binarySearch(a, 'zzz0');
  assertTrue('\'zzz0\' should not be found', pos < 0);
  assertEquals(
      '\'zzz0\' should have an insertion point of ' + (a.length), a.length,
      insertionPoint(pos));
  pos = goog.array.binarySearch(a, 'BA');
  assertTrue('\'BA\' should not be found', pos < 0);
  assertEquals(
      '\'BA\' should have an insertion point of 10', 10, insertionPoint(pos));

  // test 0 length array with default comparison
  var b = [];

  pos = goog.array.binarySearch(b, 'a');
  assertTrue('\'a\' should not be found', pos < 0);
  assertEquals(
      '\'a\' should have an insertion point of 0', 0, insertionPoint(pos));

  // test single element array with default lexiographical comparison
  var c = ['only item'];

  assertEquals(
      '\'only item\' should be found at index 0', 0,
      goog.array.binarySearch(c, 'only item'));
  pos = goog.array.binarySearch(c, 'a');
  assertTrue('\'a\' should not be found', pos < 0);
  assertEquals(
      '\'a\' should have an insertion point of 0', 0, insertionPoint(pos));
  pos = goog.array.binarySearch(c, 'z');
  assertTrue('\'z\' should not be found', pos < 0);
  assertEquals(
      '\'z\' should have an insertion point of 1', 1, insertionPoint(pos));

  // test default comparison on array of Number(s)
  var d = [
    -897123.9, -321434.58758, -1321.3124, -324, -9, -3, 0, 0, 0, 0.31255, 5,
    142.88888708, 334, 342, 453, 54254
  ];

  assertEquals(
      '-897123.9 should be found at index 0', 0,
      goog.array.binarySearch(d, -897123.9));
  assertEquals(
      '54254 should be found at index ' + (a.length - 1), d.length - 1,
      goog.array.binarySearch(d, 54254));
  assertEquals(
      '-3 should be found at index 5', 5, goog.array.binarySearch(d, -3));
  pos = goog.array.binarySearch(d, 0);
  assertTrue(
      '0 should be found at index 6 || 7 || 8',
      pos == 6 || pos == 7 || pos == 8);
  pos = goog.array.binarySearch(d, -900000);
  assertTrue('-900000 should not be found', pos < 0);
  assertEquals(
      '-900000 should have an insertion point of 0', 0, insertionPoint(pos));
  pos = goog.array.binarySearch(d, '54255');
  assertTrue('54255 should not be found', pos < 0);
  assertEquals(
      '54255 should have an insertion point of ' + (d.length), d.length,
      insertionPoint(pos));
  pos = goog.array.binarySearch(d, 1.1);
  assertTrue('1.1 should not be found', pos < 0);
  assertEquals(
      '1.1 should have an insertion point of 10', 10, insertionPoint(pos));

  // test with custom comparison function, which reverse orders numbers
  var revNumCompare = function(a, b) { return b - a; };

  var e = [
    54254, 453, 342, 334, 142.88888708, 5, 0.31255, 0, 0, 0, -3, -9, -324,
    -1321.3124, -321434.58758, -897123.9
  ];

  assertEquals(
      '54254 should be found at index 0', 0,
      goog.array.binarySearch(e, 54254, revNumCompare));
  assertEquals(
      '-897123.9 should be found at index ' + (e.length - 1), e.length - 1,
      goog.array.binarySearch(e, -897123.9, revNumCompare));
  assertEquals(
      '-3 should be found at index 10', 10,
      goog.array.binarySearch(e, -3, revNumCompare));
  pos = goog.array.binarySearch(e, 0, revNumCompare);
  assertTrue(
      '0 should be found at index  || 10', pos == 7 || pos == 9 || pos == 10);
  pos = goog.array.binarySearch(e, 54254.1, revNumCompare);
  assertTrue('54254.1 should not be found', pos < 0);
  assertEquals(
      '54254.1 should have an insertion point of 0', 0, insertionPoint(pos));
  pos = goog.array.binarySearch(e, -897124, revNumCompare);
  assertTrue('-897124 should not be found', pos < 0);
  assertEquals(
      '-897124 should have an insertion point of ' + (e.length), e.length,
      insertionPoint(pos));
  pos = goog.array.binarySearch(e, 1.1, revNumCompare);
  assertTrue('1.1 should not be found', pos < 0);
  assertEquals(
      '1.1 should have an insertion point of 6', 6, insertionPoint(pos));

  // test 0 length array with custom comparison function
  var f = [];

  pos = goog.array.binarySearch(f, 0, revNumCompare);
  assertTrue('0 should not be found', pos < 0);
  assertEquals('0 should have an insertion point of 0', 0, insertionPoint(pos));

  // test single element array with custom comparison function
  var g = [1];

  assertEquals(
      '1 should be found at index 0', 0,
      goog.array.binarySearch(g, 1, revNumCompare));
  pos = goog.array.binarySearch(g, 2, revNumCompare);
  assertTrue('2 should not be found', pos < 0);
  assertEquals('2 should have an insertion point of 0', 0, insertionPoint(pos));
  pos = goog.array.binarySearch(g, 0, revNumCompare);
  assertTrue('0 should not be found', pos < 0);
  assertEquals('0 should have an insertion point of 1', 1, insertionPoint(pos));

  assertEquals(
      'binarySearch should find the index of the first 0', 0,
      goog.array.binarySearch([0, 0, 1], 0));
  assertEquals(
      'binarySearch should find the index of the first 1', 1,
      goog.array.binarySearch([0, 1, 1], 1));
}


function testBinarySearchPerformance() {
  // Ensure that Array#slice, Function#apply and Function#call are not called
  // from within binarySearch, since they have performance implications in IE.

  var propertyReplacer = new goog.testing.PropertyReplacer();
  propertyReplacer.replace(Array.prototype, 'slice', function() {
    fail('Should not call Array#slice from binary search.');
  });
  propertyReplacer.replace(Function.prototype, 'apply', function() {
    fail('Should not call Function#apply from binary search.');
  });
  propertyReplacer.replace(Function.prototype, 'call', function() {
    fail('Should not call Function#call from binary search.');
  });

  try {
    var array = [1, 5, 7, 11, 13, 16, 19, 24, 28, 31, 33, 36, 40, 50, 52, 55];
    // Test with the default comparison function.
    goog.array.binarySearch(array, 48);
    // Test with a custom comparison function.
    goog.array.binarySearch(
        array, 13, function(a, b) { return a > b ? 1 : a < b ? -1 : 0; });
  } finally {
    // The test runner uses Function.prototype.apply to call tearDown in the
    // global context so it has to be reset here.
    propertyReplacer.reset();
  }
}


function testBinarySelect() {
  var insertionPoint = function(position) { return -(position + 1) };
  var numbers = [
    -897123.9, -321434.58758, -1321.3124, -324, -9, -3, 0, 0, 0, 0.31255, 5,
    142.88888708, 334, 342, 453, 54254
  ];
  var objects = goog.array.map(numbers, function(n) { return {n: n}; });
  function makeEvaluator(target) {
    return function(obj, i, arr) {
      assertEquals(objects, arr);
      assertEquals(obj, arr[i]);
      return target - obj.n;
    };
  }
  assertEquals(
      '{n:-897123.9} should be found at index 0', 0,
      goog.array.binarySelect(objects, makeEvaluator(-897123.9)));
  assertEquals(
      '{n:54254} should be found at index ' + (objects.length - 1),
      objects.length - 1,
      goog.array.binarySelect(objects, makeEvaluator(54254)));
  assertEquals(
      '{n:-3} should be found at index 5', 5,
      goog.array.binarySelect(objects, makeEvaluator(-3)));
  pos = goog.array.binarySelect(objects, makeEvaluator(0));
  assertTrue(
      '{n:0} should be found at index 6 || 7 || 8',
      pos == 6 || pos == 7 || pos == 8);
  pos = goog.array.binarySelect(objects, makeEvaluator(-900000));
  assertTrue('{n:-900000} should not be found', pos < 0);
  assertEquals(
      '{n:-900000} should have an insertion point of 0', 0,
      insertionPoint(pos));
  pos = goog.array.binarySelect(objects, makeEvaluator('54255'));
  assertTrue('{n:54255} should not be found', pos < 0);
  assertEquals(
      '{n:54255} should have an insertion point of ' + (objects.length),
      objects.length, insertionPoint(pos));
  pos = goog.array.binarySelect(objects, makeEvaluator(1.1));
  assertTrue('{n:1.1} should not be found', pos < 0);
  assertEquals(
      '{n:1.1} should have an insertion point of 10', 10, insertionPoint(pos));
}


function testArrayEquals() {
  // Test argument types.
  assertFalse('array == not array', goog.array.equals([], null));
  assertFalse('not array == array', goog.array.equals(null, []));
  assertFalse('not array == not array', goog.array.equals(null, null));

  // Test with default comparison function.
  assertTrue('[] == []', goog.array.equals([], []));
  assertTrue('[1] == [1]', goog.array.equals([1], [1]));
  assertTrue('["1"] == ["1"]', goog.array.equals(['1'], ['1']));
  assertFalse('[1] == ["1"]', goog.array.equals([1], ['1']));
  assertTrue('[null] == [null]', goog.array.equals([null], [null]));
  assertFalse('[null] == [undefined]', goog.array.equals([null], [undefined]));
  assertTrue('[1, 2] == [1, 2]', goog.array.equals([1, 2], [1, 2]));
  assertFalse('[1, 2] == [2, 1]', goog.array.equals([1, 2], [2, 1]));
  assertFalse('[1, 2] == [1]', goog.array.equals([1, 2], [1]));
  assertFalse('[1] == [1, 2]', goog.array.equals([1], [1, 2]));
  assertFalse('[{}] == [{}]', goog.array.equals([{}], [{}]));

  // Test with custom comparison function.
  var cmp = function(a, b) { return typeof a == typeof b; };
  assertTrue('[] cmp []', goog.array.equals([], [], cmp));
  assertTrue('[1] cmp [1]', goog.array.equals([1], [1], cmp));
  assertTrue('[1] cmp [2]', goog.array.equals([1], [2], cmp));
  assertTrue('["1"] cmp ["1"]', goog.array.equals(['1'], ['1'], cmp));
  assertTrue('["1"] cmp ["2"]', goog.array.equals(['1'], ['2'], cmp));
  assertFalse('[1] cmp ["1"]', goog.array.equals([1], ['1'], cmp));
  assertTrue('[1, 2] cmp [3, 4]', goog.array.equals([1, 2], [3, 4], cmp));
  assertFalse('[1] cmp [2, 3]', goog.array.equals([1], [2, 3], cmp));
  assertTrue('[{}] cmp [{}]', goog.array.equals([{}], [{}], cmp));
  assertTrue('[{}] cmp [{a: 1}]', goog.array.equals([{}], [{a: 1}], cmp));

  // Test with array-like objects.
  assertTrue('[5] == obj [5]', goog.array.equals([5], {0: 5, length: 1}));
  assertTrue('obj [5] == [5]', goog.array.equals({0: 5, length: 1}, [5]));
  assertTrue(
      '["x"] == obj ["x"]', goog.array.equals(['x'], {0: 'x', length: 1}));
  assertTrue(
      'obj ["x"] == ["x"]', goog.array.equals({0: 'x', length: 1}, ['x']));
  assertTrue(
      '[5] == {0: 5, 1: 6, length: 1}',
      goog.array.equals([5], {0: 5, 1: 6, length: 1}));
  assertTrue(
      '{0: 5, 1: 6, length: 1} == [5]',
      goog.array.equals({0: 5, 1: 6, length: 1}, [5]));
  assertFalse(
      '[5, 6] == {0: 5, 1: 6, length: 1}',
      goog.array.equals([5, 6], {0: 5, 1: 6, length: 1}));
  assertFalse(
      '{0: 5, 1: 6, length: 1}, [5, 6]',
      goog.array.equals({0: 5, 1: 6, length: 1}, [5, 6]));
  assertTrue(
      '[5, 6] == obj [5, 6]',
      goog.array.equals([5, 6], {0: 5, 1: 6, length: 2}));
  assertTrue(
      'obj [5, 6] == [5, 6]',
      goog.array.equals({0: 5, 1: 6, length: 2}, [5, 6]));
  assertFalse(
      '{0: 5, 1: 6} == [5, 6]', goog.array.equals({0: 5, 1: 6}, [5, 6]));
}


function testArrayCompare3Basic() {
  assertEquals(0, goog.array.compare3([], []));
  assertEquals(0, goog.array.compare3(['111', '222'], ['111', '222']));
  assertEquals(-1, goog.array.compare3(['111', '222'], ['1111', '']));
  assertEquals(1, goog.array.compare3(['111', '222'], ['111']));
  assertEquals(1, goog.array.compare3(['11', '222', '333'], []));
  assertEquals(-1, goog.array.compare3([], ['11', '222', '333']));
}


function testArrayCompare3ComparatorFn() {
  function cmp(a, b) { return a - b; };
  assertEquals(0, goog.array.compare3([], [], cmp));
  assertEquals(0, goog.array.compare3([8, 4], [8, 4], cmp));
  assertEquals(-1, goog.array.compare3([4, 3], [5, 0]));
  assertEquals(1, goog.array.compare3([6, 2], [6]));
  assertEquals(1, goog.array.compare3([1, 2, 3], []));
  assertEquals(-1, goog.array.compare3([], [1, 2, 3]));
}


function testSort() {
  // Test sorting empty array
  var a = [];
  goog.array.sort(a);
  assertEquals(
      'Sorted empty array is still an empty array (length 0)', 0, a.length);

  // Test sorting homogenous array of String(s) of length > 1
  var b = [
    'JUST', '1', 'test', 'Array', 'to', 'test', 'array', 'Sort', 'about', 'NOW',
    '!!'
  ];
  var bSorted = [
    '!!', '1', 'Array', 'JUST', 'NOW', 'Sort', 'about', 'array', 'test', 'test',
    'to'
  ];
  goog.array.sort(b);
  assertArrayEquals(bSorted, b);

  // Test sorting already sorted array of String(s) of length > 1
  goog.array.sort(b);
  assertArrayEquals(bSorted, b);

  // Test sorting homogenous array of integer Number(s) of length > 1
  var c = [
    100, 1, 2000, -1, 0, 1000023, 12312512, -12331, 123, 54325, -38104783,
    93708, 908, -213, -4, 5423, 0
  ];
  var cSorted = [
    -38104783, -12331, -213, -4, -1, 0, 0, 1, 100, 123, 908, 2000, 5423, 54325,
    93708, 1000023, 12312512
  ];
  goog.array.sort(c);
  assertArrayEquals(cSorted, c);

  // Test sorting already sorted array of integer Number(s) of length > 1
  goog.array.sort(c);
  assertArrayEquals(cSorted, c);

  // Test sorting homogenous array of Number(s) of length > 1
  var e = [
    -1321.3124, 0.31255, 54254, 0, 142.88888708, -321434.58758, -324, 453, 334,
    -3, 5, -9, 342, -897123.9
  ];
  var eSorted = [
    -897123.9, -321434.58758, -1321.3124, -324, -9, -3, 0, 0.31255, 5,
    142.88888708, 334, 342, 453, 54254
  ];
  goog.array.sort(e);
  assertArrayEquals(eSorted, e);

  // Test sorting already sorted array of Number(s) of length > 1
  goog.array.sort(e);
  assertArrayEquals(eSorted, e);

  // Test sorting array of Number(s) of length > 1,
  // using custom comparison function which does reverse ordering
  var f = [
    -1321.3124, 0.31255, 54254, 0, 142.88888708, -321434.58758, -324, 453, 334,
    -3, 5, -9, 342, -897123.9
  ];
  var fSorted = [
    54254, 453, 342, 334, 142.88888708, 5, 0.31255, 0, -3, -9, -324, -1321.3124,
    -321434.58758, -897123.9
  ];
  goog.array.sort(f, function(a, b) { return b - a; });
  assertArrayEquals(fSorted, f);

  // Test sorting already sorted array of Number(s) of length > 1
  // using custom comparison function which does reverse ordering
  goog.array.sort(f, function(a, b) { return b - a; });
  assertArrayEquals(fSorted, f);

  // Test sorting array of custom Object(s) of length > 1 that have
  // an overriden toString
  function ComparedObject(value) { this.value = value; };

  ComparedObject.prototype.toString = function() { return this.value; };

  var co1 = new ComparedObject('a');
  var co2 = new ComparedObject('b');
  var co3 = new ComparedObject('c');
  var co4 = new ComparedObject('d');

  var g = [co3, co4, co2, co1];
  var gSorted = [co1, co2, co3, co4];
  goog.array.sort(g);
  assertArrayEquals(gSorted, g);

  // Test sorting already sorted array of custom Object(s) of length > 1
  // that have an overriden toString
  goog.array.sort(g);
  assertArrayEquals(gSorted, g);

  // Test sorting an array of custom Object(s) of length > 1 using
  // a custom comparison function
  var h = [co4, co2, co1, co3];
  var hSorted = [co1, co2, co3, co4];
  goog.array.sort(h, function(a, b) {
    return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
  });
  assertArrayEquals(hSorted, h);

  // Test sorting already sorted array of custom Object(s) of length > 1
  // using a custom comparison function
  goog.array.sort(h);
  assertArrayEquals(hSorted, h);

  // Test sorting arrays of length 1
  var i = ['one'];
  var iSorted = ['one'];
  goog.array.sort(i);
  assertArrayEquals(iSorted, i);

  var j = [1];
  var jSorted = [1];
  goog.array.sort(j);
  assertArrayEquals(jSorted, j);

  var k = [1.1];
  var kSorted = [1.1];
  goog.array.sort(k);
  assertArrayEquals(kSorted, k);

  var l = [co3];
  var lSorted = [co3];
  goog.array.sort(l);
  assertArrayEquals(lSorted, l);

  var m = [co2];
  var mSorted = [co2];
  goog.array.sort(m, function(a, b) {
    return a.value > b.value ? 1 : a.value < b.value ? -1 : 0;
  });
  assertArrayEquals(mSorted, m);
}

function testStableSort() {
  // Test array with custom comparison function
  var arr = [
    {key: 3, val: 'a'}, {key: 2, val: 'b'}, {key: 3, val: 'c'},
    {key: 4, val: 'd'}, {key: 3, val: 'e'}
  ];
  var arrClone = goog.array.clone(arr);

  function comparisonFn(obj1, obj2) { return obj1.key - obj2.key; }
  goog.array.stableSort(arr, comparisonFn);
  var sortedValues = [];
  for (var i = 0; i < arr.length; i++) {
    sortedValues.push(arr[i].val);
  }
  var wantedSortedValues = ['b', 'a', 'c', 'e', 'd'];
  assertArrayEquals(wantedSortedValues, sortedValues);

  // Test array without custom comparison function
  var arr2 = [];
  for (var i = 0; i < arrClone.length; i++) {
    arr2.push({
      val: arrClone[i].val,
      toString: goog.partial(function(index) { return arrClone[index].key; }, i)
    });
  }
  goog.array.stableSort(arr2);
  var sortedValues2 = [];
  for (var i = 0; i < arr2.length; i++) {
    sortedValues2.push(arr2[i].val);
  }
  assertArrayEquals(wantedSortedValues, sortedValues2);
}

function testSortByKey() {
  function Item(value) {
    this.getValue = function() { return value; };
  }
  var keyFn = function(item) { return item.getValue(); };

  // Test without custom key comparison function
  var arr1 = [new Item(3), new Item(2), new Item(1), new Item(5), new Item(4)];
  goog.array.sortByKey(arr1, keyFn);
  var wantedSortedValues1 = [1, 2, 3, 4, 5];
  for (var i = 0; i < arr1.length; i++) {
    assertEquals(wantedSortedValues1[i], arr1[i].getValue());
  }

  // Test with custom key comparison function
  var arr2 = [new Item(3), new Item(2), new Item(1), new Item(5), new Item(4)];
  function comparisonFn(key1, key2) { return -(key1 - key2); }
  goog.array.sortByKey(arr2, keyFn, comparisonFn);
  var wantedSortedValues2 = [5, 4, 3, 2, 1];
  for (var i = 0; i < arr2.length; i++) {
    assertEquals(wantedSortedValues2[i], arr2[i].getValue());
  }
}

function testArrayBucketModulus() {
  // bucket things by modulus
  var a = {};
  var b = [];

  function modFive(num) { return num % 5; }

  for (var i = 0; i < 20; i++) {
    var mod = modFive(i);
    a[mod] = a[mod] || [];
    a[mod].push(i);
    b.push(i);
  }

  var buckets = goog.array.bucket(b, modFive);

  for (var i = 0; i < 5; i++) {
    // The order isn't defined, but they should be the same sorted.
    goog.array.sort(a[i]);
    goog.array.sort(buckets[i]);
    assertArrayEquals(a[i], buckets[i]);
  }
}

function testArrayBucketEvenOdd() {
  var a = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // test even/odd
  function isEven(value, index, array) {
    assertEquals(value, array[index]);
    assertEquals('number', typeof index);
    assertEquals(a, array);
    return value % 2 == 0;
  }

  var b = goog.array.bucket(a, isEven);

  assertArrayEquals(b[true], [2, 4, 6, 8]);
  assertArrayEquals(b[false], [1, 3, 5, 7, 9]);
}

function testArrayBucketUsingThisObject() {
  var a = [1, 2, 3, 4, 5];

  var obj = {specialValue: 2};

  function isSpecialValue(value, index, array) {
    return value == this.specialValue ? 1 : 0;
  }

  var b = goog.array.bucket(a, isSpecialValue, obj);
  assertArrayEquals(b[0], [1, 3, 4, 5]);
  assertArrayEquals(b[1], [2]);
}

function testArrayToObject() {
  var a = [{name: 'a'}, {name: 'b'}, {name: 'c'}, {name: 'd'}];

  function getName(value, index, array) {
    assertEquals(value, array[index]);
    assertEquals('number', typeof index);
    assertEquals(a, array);
    return value.name;
  }

  var b = goog.array.toObject(a, getName);

  for (var i = 0; i < a.length; i++) {
    assertEquals(a[i], b[a[i].name]);
  }
}

function testRange() {
  assertArrayEquals([], goog.array.range(0));
  assertArrayEquals([], goog.array.range(5, 5, 5));
  assertArrayEquals([], goog.array.range(-3, -3));
  assertArrayEquals([], goog.array.range(10, undefined, -1));
  assertArrayEquals([], goog.array.range(8, 0));
  assertArrayEquals([], goog.array.range(-5, -10, 3));

  assertArrayEquals([0], goog.array.range(1));
  assertArrayEquals([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], goog.array.range(10));

  assertArrayEquals([1], goog.array.range(1, 2));
  assertArrayEquals([-3, -2, -1, 0, 1, 2], goog.array.range(-3, 3));

  assertArrayEquals([4], goog.array.range(4, 40, 400));
  assertArrayEquals([5, 8, 11, 14], goog.array.range(5, 15, 3));
  assertArrayEquals([1, -1, -3], goog.array.range(1, -5, -2));
  assertElementsRoughlyEqual([.2, .3, .4], goog.array.range(.2, .5, .1), 0.001);

  assertArrayEquals([0], goog.array.range(7, undefined, 9));
  assertArrayEquals([0, 2, 4, 6], goog.array.range(8, undefined, 2));
}

function testArrayRepeat() {
  assertArrayEquals([], goog.array.repeat(3, 0));
  assertArrayEquals([], goog.array.repeat(3, -1));
  assertArrayEquals([3], goog.array.repeat(3, 1));
  assertArrayEquals([3, 3, 3], goog.array.repeat(3, 3));
  assertArrayEquals([null, null], goog.array.repeat(null, 2));
}

function testArrayFlatten() {
  assertArrayEquals([1, 2, 3, 4, 5], goog.array.flatten(1, 2, 3, 4, 5));
  assertArrayEquals([1, 2, 3, 4, 5], goog.array.flatten(1, [2, [3, [4, 5]]]));
  assertArrayEquals([1, 2, 3, 4], goog.array.flatten(1, [2, [3, [4]]]));
  assertArrayEquals([1, 2, 3, 4], goog.array.flatten([[[1], 2], 3], 4));
  assertArrayEquals([1], goog.array.flatten([[1]]));
  assertArrayEquals([], goog.array.flatten());
  assertArrayEquals([], goog.array.flatten([]));
  assertArrayEquals(
      goog.array.repeat(3, 180002),
      goog.array.flatten(3, goog.array.repeat(3, 180000), 3));
  assertArrayEquals(
      goog.array.repeat(3, 180000),
      goog.array.flatten([goog.array.repeat(3, 180000)]));
}

function testSortObjectsByKey() {
  var sortedArray = buildSortedObjectArray(4);
  var objects =
      [sortedArray[1], sortedArray[2], sortedArray[0], sortedArray[3]];

  goog.array.sortObjectsByKey(objects, 'name');
  validateObjectArray(sortedArray, objects);
}

function testSortObjectsByKeyWithCompareFunction() {
  var sortedArray = buildSortedObjectArray(4);
  var objects =
      [sortedArray[1], sortedArray[2], sortedArray[0], sortedArray[3]];
  var descSortedArray =
      [sortedArray[3], sortedArray[2], sortedArray[1], sortedArray[0]];

  function descCompare(a, b) { return a < b ? 1 : a > b ? -1 : 0; };

  goog.array.sortObjectsByKey(objects, 'name', descCompare);
  validateObjectArray(descSortedArray, objects);
}

function buildSortedObjectArray(size) {
  var objectArray = [];
  for (var i = 0; i < size; i++) {
    objectArray.push({'name': 'name_' + i, 'id': 'id_' + (size - i)});
  }

  return objectArray;
}

function validateObjectArray(expected, actual) {
  assertEquals(expected.length, actual.length);
  for (var i = 0; i < expected.length; i++) {
    assertEquals(expected[i].name, actual[i].name);
    assertEquals(expected[i].id, actual[i].id);
  }
}

function testIsSorted() {
  assertTrue(goog.array.isSorted([1, 2, 3]));
  assertTrue(goog.array.isSorted([1, 2, 2]));
  assertFalse(goog.array.isSorted([1, 2, 1]));

  assertTrue(goog.array.isSorted([1, 2, 3], null, true));
  assertFalse(goog.array.isSorted([1, 2, 2], null, true));
  assertFalse(goog.array.isSorted([1, 2, 1], null, true));

  function compare(a, b) { return b - a; }

  assertFalse(goog.array.isSorted([1, 2, 3], compare));
  assertTrue(goog.array.isSorted([3, 2, 2], compare));
}

function assertRotated(expect, array, rotate) {
  assertArrayEquals(expect, goog.array.rotate(array, rotate));
}

function testRotate() {
  assertRotated([], [], 3);
  assertRotated([1], [1], 3);
  assertRotated([1, 2, 3, 4, 0], [0, 1, 2, 3, 4], -6);
  assertRotated([0, 1, 2, 3, 4], [0, 1, 2, 3, 4], -5);
  assertRotated([4, 0, 1, 2, 3], [0, 1, 2, 3, 4], -4);
  assertRotated([3, 4, 0, 1, 2], [0, 1, 2, 3, 4], -3);
  assertRotated([2, 3, 4, 0, 1], [0, 1, 2, 3, 4], -2);
  assertRotated([1, 2, 3, 4, 0], [0, 1, 2, 3, 4], -1);
  assertRotated([0, 1, 2, 3, 4], [0, 1, 2, 3, 4], 0);
  assertRotated([4, 0, 1, 2, 3], [0, 1, 2, 3, 4], 1);
  assertRotated([3, 4, 0, 1, 2], [0, 1, 2, 3, 4], 2);
  assertRotated([2, 3, 4, 0, 1], [0, 1, 2, 3, 4], 3);
  assertRotated([1, 2, 3, 4, 0], [0, 1, 2, 3, 4], 4);
  assertRotated([0, 1, 2, 3, 4], [0, 1, 2, 3, 4], 5);
  assertRotated([4, 0, 1, 2, 3], [0, 1, 2, 3, 4], 6);
}

function testMoveItemWithArray() {
  var arr = [0, 1, 2, 3];
  goog.array.moveItem(arr, 1, 3);  // toIndex > fromIndex
  assertArrayEquals([0, 2, 3, 1], arr);
  goog.array.moveItem(arr, 2, 0);  // toIndex < fromIndex
  assertArrayEquals([3, 0, 2, 1], arr);
  goog.array.moveItem(arr, 1, 1);  // toIndex == fromIndex
  assertArrayEquals([3, 0, 2, 1], arr);
  // Out-of-bounds indexes throw assertion errors.
  assertThrows(function() { goog.array.moveItem(arr, -1, 1); });
  assertThrows(function() { goog.array.moveItem(arr, 4, 1); });
  assertThrows(function() { goog.array.moveItem(arr, 1, -1); });
  assertThrows(function() { goog.array.moveItem(arr, 1, 4); });
  // The array should not be modified by the out-of-bound calls.
  assertArrayEquals([3, 0, 2, 1], arr);
}

function testMoveItemWithArgumentsObject() {
  var f = function() {
    goog.array.moveItem(arguments, 0, 1);
    return arguments;
  };
  assertArrayEquals([1, 0], goog.array.toArray(f(0, 1)));
}

function testConcat() {
  var a1 = [1, 2, 3];
  var a2 = [4, 5, 6];
  var a3 = goog.array.concat(a1, a2);
  a1.push(1);
  a2.push(5);
  assertArrayEquals([1, 2, 3, 4, 5, 6], a3);
}

function testConcatWithNoSecondArg() {
  var a1 = [1, 2, 3, 4];
  var a2 = goog.array.concat(a1);
  a1.push(5);
  assertArrayEquals([1, 2, 3, 4], a2);
}

function testConcatWithNonArrayArgs() {
  var a1 = [1, 2, 3, 4];
  var o = {0: 'a', 1: 'b', length: 2};
  var a2 = goog.array.concat(a1, 5, '10', o);
  assertArrayEquals([1, 2, 3, 4, 5, '10', o], a2);
}

function testConcatWithNull() {
  var a1 = goog.array.concat(null, [1, 2, 3]);
  var a2 = goog.array.concat([1, 2, 3], null);
  assertArrayEquals([null, 1, 2, 3], a1);
  assertArrayEquals([1, 2, 3, null], a2);
}

function testZip() {
  var a1 = goog.array.zip([1, 2, 3], [3, 2, 1]);
  var a2 = goog.array.zip([1, 2], [3, 2, 1]);
  var a3 = goog.array.zip();
  assertArrayEquals([[1, 3], [2, 2], [3, 1]], a1);
  assertArrayEquals([[1, 3], [2, 2]], a2);
  assertArrayEquals([], a3);
}

function testShuffle() {
  // Test array. This array should have unique values for the purposes of this
  // test case.
  var testArray = [1, 2, 3, 4, 5];
  var testArrayCopy = goog.array.clone(testArray);

  // Custom random function, which always returns a value approaching 1,
  // resulting in a "shuffle" that preserves the order of original array
  // (for array sizes that we work with here).
  var noChangeShuffleFunction = function() { return .999999; };
  goog.array.shuffle(testArray, noChangeShuffleFunction);
  assertArrayEquals(testArrayCopy, testArray);

  // Custom random function, which always returns 0, resulting in a
  // deterministic "shuffle" that is predictable but differs from the
  // original order of the array.
  var testShuffleFunction = function() { return 0; };
  goog.array.shuffle(testArray, testShuffleFunction);
  assertArrayEquals([2, 3, 4, 5, 1], testArray);

  // Test the use of a real random function(no optional RNG is specified).
  goog.array.shuffle(testArray);

  // Ensure the shuffled array comprises the same elements (without regard to
  // order).
  assertSameElements(testArrayCopy, testArray);
}

function testRemoveAllIf() {
  var testArray = [9, 1, 9, 2, 9, 3, 4, 9, 9, 9, 5];
  var expectedArray = [1, 2, 3, 4, 5];

  var actualOutput =
      goog.array.removeAllIf(testArray, function(el) { return el == 9; });

  assertEquals(6, actualOutput);
  assertArrayEquals(expectedArray, testArray);
}

function testRemoveAllIf_noMatches() {
  var testArray = [1];
  var expectedArray = [1];

  var actualOutput =
      goog.array.removeAllIf(testArray, function(el) { return false; });

  assertEquals(0, actualOutput);
  assertArrayEquals(expectedArray, testArray);
}

function testCopyByIndex() {
  var testArray = [1, 2, 'a', 'b', 'c', 'd'];
  var copyIndexes = [1, 3, 0, 0, 2];
  var expectedArray = [2, 'b', 1, 1, 'a'];

  var actualOutput = goog.array.copyByIndex(testArray, copyIndexes);

  assertArrayEquals(expectedArray, actualOutput);
}

function testComparators() {
  var greater = 42;
  var smaller = 13;

  assertTrue(goog.array.defaultCompare(smaller, greater) < 0);
  assertEquals(0, goog.array.defaultCompare(smaller, smaller));
  assertTrue(goog.array.defaultCompare(greater, smaller) > 0);

  assertTrue(goog.array.inverseDefaultCompare(greater, smaller) < 0);
  assertEquals(0, goog.array.inverseDefaultCompare(greater, greater));
  assertTrue(goog.array.inverseDefaultCompare(smaller, greater) > 0);
}
