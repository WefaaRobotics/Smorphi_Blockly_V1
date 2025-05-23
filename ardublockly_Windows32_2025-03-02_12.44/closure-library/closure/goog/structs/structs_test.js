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

goog.provide('goog.structsTest');
goog.setTestOnly('goog.structsTest');

goog.require('goog.array');
goog.require('goog.dom.TagName');
goog.require('goog.structs');
goog.require('goog.structs.Map');
goog.require('goog.structs.Set');  // needed for filter
goog.require('goog.testing.jsunit');

/*

 This one does not test Map or Set
 It tests Array, Object, String and a NodeList

*/



function stringifyObject(obj) {
  var sb = [];
  for (var key in obj) {
    sb.push(key + obj[key]);
  }
  return sb.join('');
}


function getTestElement() {
  return document.getElementById('test');
}


function getAll() {
  return getTestElement().getElementsByTagName('*');
}


var node;


function addNode() {
  node = document.createElement(goog.dom.TagName.SPAN);
  getTestElement().appendChild(node);
}


function removeNode() {
  getTestElement().removeChild(node);
}


function nodeNames(nl) {
  var sb = [];
  for (var i = 0, n; n = nl[i]; i++) {
    sb.push(n.nodeName);
  }
  return sb.join(',');
}


var allTagNames1 = 'HR,P,P,P,P,P,P,P,P,H1';
var allTagNames2 = allTagNames1 + ',SPAN';


function testGetCount() {
  var arr = ['a', 'b', 'c'];
  assertEquals('count, should be 3', 3, goog.structs.getCount(arr));
  arr.push('d');
  assertEquals('count, should be 4', 4, goog.structs.getCount(arr));
  goog.array.remove(arr, 'd');
  assertEquals('count, should be 3', 3, goog.structs.getCount(arr));

  var obj = {a: 0, b: 1, c: 2};
  assertEquals('count, should be 3', 3, goog.structs.getCount(obj));
  obj.d = 3;
  assertEquals('count, should be 4', 4, goog.structs.getCount(obj));
  delete obj.d;
  assertEquals('count, should be 3', 3, goog.structs.getCount(obj));

  var s = 'abc';
  assertEquals('count, should be 3', 3, goog.structs.getCount(s));
  s += 'd';
  assertEquals('count, should be 4', 4, goog.structs.getCount(s));

  var all = getAll();
  assertEquals('count, should be 10', 10, goog.structs.getCount(all));
  addNode();
  assertEquals('count, should be 11', 11, goog.structs.getCount(all));
  removeNode();
  assertEquals('count, should be 10', 10, goog.structs.getCount(all));

  var aMap = new goog.structs.Map({a: 0, b: 1, c: 2});
  assertEquals('count, should be 3', 3, goog.structs.getCount(aMap));
  aMap.set('d', 3);
  assertEquals('count, should be 4', 4, goog.structs.getCount(aMap));
  aMap.remove('a');
  assertEquals('count, should be 3', 3, goog.structs.getCount(aMap));

  var aSet = new goog.structs.Set('abc');
  assertEquals('count, should be 3', 3, goog.structs.getCount(aSet));
  aSet.add('d');
  assertEquals('count, should be 4', 4, goog.structs.getCount(aSet));
  aSet.remove('a');
  assertEquals('count, should be 3', 3, goog.structs.getCount(aSet));
}


function testGetValues() {
  var arr = ['a', 'b', 'c', 'd'];
  assertEquals('abcd', goog.structs.getValues(arr).join(''));

  var obj = {a: 0, b: 1, c: 2, d: 3};
  assertEquals('0123', goog.structs.getValues(obj).join(''));

  var s = 'abc';
  assertEquals('abc', goog.structs.getValues(s).join(''));
  s += 'd';
  assertEquals('abcd', goog.structs.getValues(s).join(''));

  var all = getAll();
  assertEquals(allTagNames1, nodeNames(goog.structs.getValues(all)));
  addNode();
  assertEquals(allTagNames2, nodeNames(goog.structs.getValues(all)));
  removeNode();
  assertEquals(allTagNames1, nodeNames(goog.structs.getValues(all)));

  var aMap = new goog.structs.Map({a: 1, b: 2, c: 3});
  assertEquals('123', goog.structs.getValues(aMap).join(''));

  var aSet = new goog.structs.Set([1, 2, 3]);
  assertEquals('123', goog.structs.getValues(aMap).join(''));
}


function testGetKeys() {
  var arr = ['a', 'b', 'c', 'd'];
  assertEquals('0123', goog.structs.getKeys(arr).join(''));

  var obj = {a: 0, b: 1, c: 2, d: 3};
  assertEquals('abcd', goog.structs.getKeys(obj).join(''));

  var s = 'abc';
  assertEquals('012', goog.structs.getKeys(s).join(''));
  s += 'd';
  assertEquals('0123', goog.structs.getKeys(s).join(''));

  var all = getAll();
  assertEquals('0123456789', goog.structs.getKeys(all).join(''));
  addNode();
  assertEquals('012345678910', goog.structs.getKeys(all).join(''));
  removeNode();
  assertEquals('0123456789', goog.structs.getKeys(all).join(''));

  var aMap = new goog.structs.Map({a: 1, b: 2, c: 3});
  assertEquals('abc', goog.structs.getKeys(aMap).join(''));

  var aSet = new goog.structs.Set([1, 2, 3]);
  assertUndefined(goog.structs.getKeys(aSet));
}

function testContains() {
  var arr = ['a', 'b', 'c', 'd'];
  assertTrue("contains, Should contain 'a'", goog.structs.contains(arr, 'a'));
  assertFalse(
      "contains, Should not contain 'e'", goog.structs.contains(arr, 'e'));

  var obj = {a: 0, b: 1, c: 2, d: 3};
  assertTrue("contains, Should contain '0'", goog.structs.contains(obj, 0));
  assertFalse(
      "contains, Should not contain '4'", goog.structs.contains(obj, 4));

  var s = 'abc';
  assertTrue("contains, Should contain 'a'", goog.structs.contains(s, 'a'));
  assertFalse(
      "contains, Should not contain 'd'", goog.structs.contains(s, 'd'));

  var all = getAll();
  assertTrue(
      "contains, Should contain 'h1'",
      goog.structs.contains(all, document.getElementById('h1')));
  assertFalse(
      "contains, Should not contain 'document.body'",
      goog.structs.contains(all, document.body));

  var aMap = new goog.structs.Map({a: 1, b: 2, c: 3});
  assertTrue("contains, Should contain '1'", goog.structs.contains(aMap, 1));
  assertFalse(
      "contains, Should not contain '4'", goog.structs.contains(aMap, 4));

  var aSet = new goog.structs.Set([1, 2, 3]);
  assertTrue("contains, Should contain '1'", goog.structs.contains(aSet, 1));
  assertFalse(
      "contains, Should not contain '4'", goog.structs.contains(aSet, 4));
}


function testClear() {
  var arr = ['a', 'b', 'c', 'd'];
  goog.structs.clear(arr);
  assertTrue('cleared so it should be empty', goog.structs.isEmpty(arr));
  assertFalse(
      "cleared so it should not contain 'a'", goog.structs.contains(arr, 'a'));

  var obj = {a: 0, b: 1, c: 2, d: 3};
  goog.structs.clear(obj);
  assertTrue('cleared so it should be empty', goog.structs.isEmpty(obj));
  assertFalse(
      "cleared so it should not contain 'a' key",
      goog.structs.contains(obj, 0));

  var aMap = new goog.structs.Map({a: 1, b: 2, c: 3});
  goog.structs.clear(aMap);
  assertTrue('cleared map so it should be empty', goog.structs.isEmpty(aMap));
  assertFalse(
      "cleared map so it should not contain '1' value",
      goog.structs.contains(aMap, 1));

  var aSet = new goog.structs.Set([1, 2, 3]);
  goog.structs.clear(aSet);
  assertTrue('cleared set so it should be empty', goog.structs.isEmpty(aSet));
  assertFalse(
      "cleared set so it should not contain '1'",
      goog.structs.contains(aSet, 1));

  // cannot clear a string or a NodeList
}



// Map

function testMap() {
  var RV = {};
  var obj = {
    map: function(g) {
      assertEquals(f, g);
      assertEquals(this, obj);
      return RV;
    }
  };
  function f() {}
  assertEquals(RV, goog.structs.map(obj, f));
}

function testMap2() {
  var THIS_OBJ = {};
  var RV = {};
  var obj = {
    map: function(g, obj2) {
      assertEquals(f, g);
      assertEquals(this, obj);
      assertEquals(THIS_OBJ, obj2);
      return RV;
    }
  };
  function f() {}
  assertEquals(RV, goog.structs.map(obj, f, THIS_OBJ));
}

function testMapArrayLike() {
  var col = [0, 1, 2];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    return v * v;
  }
  assertArrayEquals([0, 1, 4], goog.structs.map(col, f));
}

function testMapArrayLike2() {
  var THIS_OBJ = {};
  var col = [0, 1, 2];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return v * v;
  }
  assertArrayEquals([0, 1, 4], goog.structs.map(col, f, THIS_OBJ));
}

function testMapString() {
  var col = '012';
  function f(v, i, col2) {
    // Teh SpiderMonkey Array.map for strings turns the string into a String
    // so we cannot use assertEquals because it uses ===.
    assertTrue(col == col2);
    assertEquals('number', typeof i);
    return Number(v) * Number(v);
  }
  assertArrayEquals([0, 1, 4], goog.structs.map(col, f));
}

function testMapString2() {
  var THIS_OBJ = {};
  var col = '012';
  function f(v, i, col2) {
    // for some reason the strings are equal but identical???
    assertEquals(String(col), String(col2));
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return Number(v) * Number(v);
  }
  assertArrayEquals([0, 1, 4], goog.structs.map(col, f, THIS_OBJ));
}

function testMapMap() {
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    return v * v;
  }
  assertObjectEquals({a: 0, b: 1, c: 4}, goog.structs.map(col, f));
}

function testMapMap2() {
  var THIS_OBJ = {};
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    assertEquals(THIS_OBJ, this);
    return v * v;
  }
  assertObjectEquals({a: 0, b: 1, c: 4}, goog.structs.map(col, f, THIS_OBJ));
}

function testMapSet() {
  var col = new goog.structs.Set([0, 1, 2]);
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    return v * v;
  }
  assertArrayEquals([0, 1, 4], goog.structs.map(col, f));
}

function testMapSet2() {
  var THIS_OBJ = {};
  var col = new goog.structs.Set([0, 1, 2]);
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    assertEquals(THIS_OBJ, this);
    return v * v;
  }
  assertArrayEquals([0, 1, 4], goog.structs.map(col, f, THIS_OBJ));
}

function testMapNodeList() {
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    return v.tagName;
  }
  assertEquals('HRPPPPPPPPH1', goog.structs.map(col, f).join(''));
}

function testMapNodeList2() {
  var THIS_OBJ = {};
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return v.tagName;
  }
  assertEquals('HRPPPPPPPPH1', goog.structs.map(col, f, THIS_OBJ).join(''));
}

// Filter

function testFilter() {
  var RV = {};
  var obj = {
    filter: function(g) {
      assertEquals(f, g);
      assertEquals(this, obj);
      return RV;
    }
  };
  function f() {}
  assertEquals(RV, goog.structs.filter(obj, f));
}

function testFilter2() {
  var THIS_OBJ = {};
  var RV = {};
  var obj = {
    filter: function(g, obj2) {
      assertEquals(f, g);
      assertEquals(this, obj);
      assertEquals(THIS_OBJ, obj2);
      return RV;
    }
  };
  function f() {}
  assertEquals(RV, goog.structs.filter(obj, f, THIS_OBJ));
}

function testFilterArrayLike() {
  var col = [0, 1, 2];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    return v > 0;
  }
  assertArrayEquals([1, 2], goog.structs.filter(col, f));
}

function testFilterArrayLike2() {
  var THIS_OBJ = {};
  var col = [0, 1, 2];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return v > 0;
  }
  assertArrayEquals([1, 2], goog.structs.filter(col, f, THIS_OBJ));
}

function testFilterString() {
  var col = '012';
  function f(v, i, col2) {
    // for some reason the strings are equal but identical???
    assertEquals(String(col), String(col2));
    assertEquals('number', typeof i);
    return Number(v) > 0;
  }
  assertArrayEquals(['1', '2'], goog.structs.filter(col, f));
}

function testFilterString2() {
  var THIS_OBJ = {};
  var col = '012';
  function f(v, i, col2) {
    // for some reason the strings are equal but identical???
    assertEquals(String(col), String(col2));
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return Number(v) > 0;
  }
  assertArrayEquals(['1', '2'], goog.structs.filter(col, f, THIS_OBJ));
}

function testFilterMap() {
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    return v > 0;
  }
  assertObjectEquals({b: 1, c: 2}, goog.structs.filter(col, f));
}

function testFilterMap2() {
  var THIS_OBJ = {};
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    assertEquals(THIS_OBJ, this);
    return v > 0;
  }
  assertObjectEquals({b: 1, c: 2}, goog.structs.filter(col, f, THIS_OBJ));
}

function testFilterSet() {
  var col = new goog.structs.Set([0, 1, 2]);
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    return v > 0;
  }
  assertArrayEquals([1, 2], goog.structs.filter(col, f));
}

function testFilterSet2() {
  var THIS_OBJ = {};
  var col = new goog.structs.Set([0, 1, 2]);
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    assertEquals(THIS_OBJ, this);
    return v > 0;
  }
  assertArrayEquals([1, 2], goog.structs.filter(col, f, THIS_OBJ));
}

function testFilterNodeList() {
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    return v.tagName == goog.dom.TagName.P;
  }
  assertEquals('P,P,P,P,P,P,P,P', nodeNames(goog.structs.filter(col, f)));
}

function testFilterNodeList2() {
  var THIS_OBJ = {};
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return v.tagName == goog.dom.TagName.P;
  }
  assertEquals(
      'P,P,P,P,P,P,P,P', nodeNames(goog.structs.filter(col, f, THIS_OBJ)));
}

// Some

function testSome() {
  var RV = {};
  var obj = {
    some: function(g) {
      assertEquals(f, g);
      assertEquals(this, obj);
      return RV;
    }
  };
  function f() {}
  assertEquals(RV, goog.structs.some(obj, f));
}

function testSome2() {
  var THIS_OBJ = {};
  var RV = {};
  var obj = {
    some: function(g, obj2) {
      assertEquals(f, g);
      assertEquals(this, obj);
      assertEquals(THIS_OBJ, obj2);
      return RV;
    }
  };
  function f() {}
  assertEquals(RV, goog.structs.some(obj, f, THIS_OBJ));
}

function testSomeArrayLike() {
  var limit = 0;
  var col = [0, 1, 2];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    return v > limit;
  }
  assertTrue(goog.structs.some(col, f));
  limit = 2;
  assertFalse(goog.structs.some(col, f));
}

function testSomeArrayLike2() {
  var THIS_OBJ = {};
  var limit = 0;
  var col = [0, 1, 2];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return v > limit;
  }
  assertTrue(goog.structs.some(col, f, THIS_OBJ));
  limit = 2;
  assertFalse(goog.structs.some(col, f, THIS_OBJ));
}

function testSomeString() {
  var limit = 0;
  var col = '012';
  function f(v, i, col2) {
    // for some reason the strings are equal but identical???
    assertEquals(String(col), String(col2));
    assertEquals('number', typeof i);
    return Number(v) > limit;
  }
  assertTrue(goog.structs.some(col, f));
  limit = 2;
  assertFalse(goog.structs.some(col, f));
}

function testSomeString2() {
  var THIS_OBJ = {};
  var limit = 0;
  var col = '012';
  function f(v, i, col2) {
    // for some reason the strings are equal but identical???
    assertEquals(String(col), String(col2));
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return Number(v) > limit;
  }
  assertTrue(goog.structs.some(col, f, THIS_OBJ));
  limit = 2;
  assertFalse(goog.structs.some(col, f, THIS_OBJ));
}

function testSomeMap() {
  var limit = 0;
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    return v > limit;
  }
  assertObjectEquals(true, goog.structs.some(col, f));
  limit = 2;
  assertFalse(goog.structs.some(col, f));
}

function testSomeMap2() {
  var THIS_OBJ = {};
  var limit = 0;
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    assertEquals(THIS_OBJ, this);
    return v > limit;
  }
  assertObjectEquals(true, goog.structs.some(col, f, THIS_OBJ));
  limit = 2;
  assertFalse(goog.structs.some(col, f, THIS_OBJ));
}

function testSomeSet() {
  var limit = 0;
  var col = new goog.structs.Set([0, 1, 2]);
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    return v > limit;
  }
  assertTrue(goog.structs.some(col, f));
  limit = 2;
  assertFalse(goog.structs.some(col, f));
}

function testSomeSet2() {
  var THIS_OBJ = {};
  var limit = 0;
  var col = new goog.structs.Set([0, 1, 2]);
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    assertEquals(THIS_OBJ, this);
    return v > limit;
  }
  assertTrue(goog.structs.some(col, f, THIS_OBJ));
  limit = 2;
  assertFalse(goog.structs.some(col, f, THIS_OBJ));
}

function testSomeNodeList() {
  var tagName = goog.dom.TagName.P;
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    return v.tagName == tagName;
  }
  assertTrue(goog.structs.some(col, f));
  tagName = 'MARQUEE';
  assertFalse(goog.structs.some(col, f));
}

function testSomeNodeList2() {
  var THIS_OBJ = {};
  var tagName = goog.dom.TagName.P;
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return v.tagName == tagName;
  }
  assertTrue(goog.structs.some(col, f, THIS_OBJ));
  tagName = 'MARQUEE';
  assertFalse(goog.structs.some(col, f, THIS_OBJ));
}

// Every

function testEvery() {
  var RV = {};
  var obj = {
    every: function(g) {
      assertEquals(f, g);
      assertEquals(this, obj);
      return RV;
    }
  };
  function f() {}
  assertEquals(RV, goog.structs.every(obj, f));
}

function testEvery2() {
  var THIS_OBJ = {};
  var RV = {};
  var obj = {
    every: function(g, obj2) {
      assertEquals(f, g);
      assertEquals(this, obj);
      assertEquals(THIS_OBJ, obj2);
      return RV;
    }
  };
  function f() {}
  assertEquals(RV, goog.structs.every(obj, f, THIS_OBJ));
}

function testEveryArrayLike() {
  var limit = -1;
  var col = [0, 1, 2];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    return v > limit;
  }
  assertTrue(goog.structs.every(col, f));
  limit = 1;
  assertFalse(goog.structs.every(col, f));
}

function testEveryArrayLike2() {
  var THIS_OBJ = {};
  var limit = -1;
  var col = [0, 1, 2];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return v > limit;
  }
  assertTrue(goog.structs.every(col, f, THIS_OBJ));
  limit = 1;
  assertFalse(goog.structs.every(col, f, THIS_OBJ));
}

function testEveryString() {
  var limit = -1;
  var col = '012';
  function f(v, i, col2) {
    // for some reason the strings are equal but identical???
    assertEquals(String(col), String(col2));
    assertEquals('number', typeof i);
    return Number(v) > limit;
  }
  assertTrue(goog.structs.every(col, f));
  limit = 1;
  assertFalse(goog.structs.every(col, f));
}

function testEveryString2() {
  var THIS_OBJ = {};
  var limit = -1;
  var col = '012';
  function f(v, i, col2) {
    // for some reason the strings are equal but identical???
    assertEquals(String(col), String(col2));
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return Number(v) > limit;
  }
  assertTrue(goog.structs.every(col, f, THIS_OBJ));
  limit = 1;
  assertFalse(goog.structs.every(col, f, THIS_OBJ));
}

function testEveryMap() {
  var limit = -1;
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    return v > limit;
  }
  assertObjectEquals(true, goog.structs.every(col, f));
  limit = 1;
  assertFalse(goog.structs.every(col, f));
}

function testEveryMap2() {
  var THIS_OBJ = {};
  var limit = -1;
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    assertEquals(THIS_OBJ, this);
    return v > limit;
  }
  assertObjectEquals(true, goog.structs.every(col, f, THIS_OBJ));
  limit = 1;
  assertFalse(goog.structs.every(col, f, THIS_OBJ));
}

function testEverySet() {
  var limit = -1;
  var col = new goog.structs.Set([0, 1, 2]);
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    return v > limit;
  }
  assertTrue(goog.structs.every(col, f));
  limit = 1;
  assertFalse(goog.structs.every(col, f));
}

function testEverySet2() {
  var THIS_OBJ = {};
  var limit = -1;
  var col = new goog.structs.Set([0, 1, 2]);
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    assertEquals(THIS_OBJ, this);
    return v > limit;
  }
  assertTrue(goog.structs.every(col, f, THIS_OBJ));
  limit = 1;
  assertFalse(goog.structs.every(col, f, THIS_OBJ));
}

function testEveryNodeList() {
  var nodeType = 1;  // ELEMENT
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    return v.nodeType == nodeType;
  }
  assertTrue(goog.structs.every(col, f));
  nodeType = 3;  // TEXT
  assertFalse(goog.structs.every(col, f));
}

function testEveryNodeList2() {
  var THIS_OBJ = {};
  var nodeType = 1;  // ELEMENT
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    return v.nodeType == nodeType;
  }
  assertTrue(goog.structs.every(col, f, THIS_OBJ));
  nodeType = 3;  // TEXT
  assertFalse(goog.structs.every(col, f, THIS_OBJ));
}

// For each

function testForEach() {
  var called = false;
  var obj = {
    forEach: function(g) {
      assertEquals(f, g);
      assertEquals(this, obj);
      called = true;
    }
  };
  function f() {}
  goog.structs.forEach(obj, f);
  assertTrue(called);
}

function testForEach2() {
  var called = false;
  var THIS_OBJ = {};
  var obj = {
    forEach: function(g, obj2) {
      assertEquals(f, g);
      assertEquals(this, obj);
      assertEquals(THIS_OBJ, obj2);
      called = true;
    }
  };
  function f() {}
  goog.structs.forEach(obj, f, THIS_OBJ);
  assertTrue(called);
}

function testForEachArrayLike() {
  var col = [0, 1, 2];
  var values = [];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    values.push(v * v);
  }
  goog.structs.forEach(col, f);
  assertArrayEquals([0, 1, 4], values);
}

function testForEachArrayLike2() {
  var THIS_OBJ = {};
  var col = [0, 1, 2];
  var values = [];
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    values.push(v * v);
  }
  goog.structs.forEach(col, f, THIS_OBJ);
  assertArrayEquals([0, 1, 4], values);
}

function testForEachString() {
  var col = '012';
  var values = [];
  function f(v, i, col2) {
    // for some reason the strings are equal but identical???
    assertEquals(String(col), String(col2));
    assertEquals('number', typeof i);
    values.push(Number(v) * Number(v));
  }
  goog.structs.forEach(col, f);
  assertArrayEquals([0, 1, 4], values);
}

function testForEachString2() {
  var THIS_OBJ = {};
  var col = '012';
  var values = [];
  function f(v, i, col2) {
    // for some reason the strings are equal but identical???
    assertEquals(String(col), String(col2));
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    values.push(Number(v) * Number(v));
  }
  goog.structs.forEach(col, f, THIS_OBJ);
  assertArrayEquals([0, 1, 4], values);
}

function testForEachMap() {
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  var values = [];
  var keys = [];
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    values.push(v * v);
    keys.push(key);
  }
  goog.structs.forEach(col, f);
  assertArrayEquals([0, 1, 4], values);
  assertArrayEquals(['a', 'b', 'c'], keys);
}

function testForEachMap2() {
  var THIS_OBJ = {};
  var col = new goog.structs.Map({a: 0, b: 1, c: 2});
  var values = [];
  var keys = [];
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('string', typeof key);
    assertEquals(THIS_OBJ, this);
    values.push(v * v);
    keys.push(key);
  }
  goog.structs.forEach(col, f, THIS_OBJ);
  assertArrayEquals([0, 1, 4], values);
  assertArrayEquals(['a', 'b', 'c'], keys);
}

function testForEachSet() {
  var col = new goog.structs.Set([0, 1, 2]);
  var values = [];
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    values.push(v * v);
  }
  goog.structs.forEach(col, f);
  assertArrayEquals([0, 1, 4], values);
}

function testForEachSet2() {
  var THIS_OBJ = {};
  var col = new goog.structs.Set([0, 1, 2]);
  var values = [];
  function f(v, key, col2) {
    assertEquals(col, col2);
    assertEquals('undefined', typeof key);
    assertEquals(THIS_OBJ, this);
    values.push(v * v);
  }
  goog.structs.forEach(col, f, THIS_OBJ);
  assertArrayEquals([0, 1, 4], values);
}

function testForEachNodeList() {
  var values = [];
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    values.push(v.tagName);
  }
  goog.structs.forEach(col, f);
  assertEquals('HRPPPPPPPPH1', values.join(''));
}

function testForEachNodeList2() {
  var THIS_OBJ = {};
  var values = [];
  var col = getAll();
  function f(v, i, col2) {
    assertEquals(col, col2);
    assertEquals('number', typeof i);
    assertEquals(THIS_OBJ, this);
    values.push(v.tagName);
  }
  goog.structs.forEach(col, f, THIS_OBJ);
  assertEquals('HRPPPPPPPPH1', values.join(''));
}
