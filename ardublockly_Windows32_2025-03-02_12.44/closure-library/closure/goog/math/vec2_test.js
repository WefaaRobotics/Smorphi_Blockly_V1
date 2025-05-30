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

goog.provide('goog.math.Vec2Test');
goog.setTestOnly('goog.math.Vec2Test');

goog.require('goog.math.Vec2');
goog.require('goog.testing.jsunit');

function assertVectorEquals(a, b) {
  assertTrue(b + ' should be equal to ' + a, goog.math.Vec2.equals(a, b));
}


function testVec2() {
  var v = new goog.math.Vec2(3.14, 2.78);
  assertEquals(3.14, v.x);
  assertEquals(2.78, v.y);
}


function testRandomUnit() {
  var a = goog.math.Vec2.randomUnit();
  assertRoughlyEquals(1.0, a.magnitude(), 1e-10);
}


function testRandom() {
  var a = goog.math.Vec2.random();
  assertTrue(a.magnitude() <= 1.0);
}


function testClone() {
  var a = new goog.math.Vec2(1, 2);
  var b = a.clone();

  assertEquals(a.x, b.x);
  assertEquals(a.y, b.y);
}


function testMagnitude() {
  var a = new goog.math.Vec2(0, 10);
  var b = new goog.math.Vec2(3, 4);

  assertEquals(10, a.magnitude());
  assertEquals(5, b.magnitude());
}


function testSquaredMagnitude() {
  var a = new goog.math.Vec2(-3, -4);
  assertEquals(25, a.squaredMagnitude());
}


function testScaleFactor() {
  var a = new goog.math.Vec2(1, 2);
  var scaled = a.scale(0.5);

  assertTrue(
      'The type of the return value should be goog.math.Vec2',
      scaled instanceof goog.math.Vec2);
  assertVectorEquals(new goog.math.Vec2(0.5, 1), a);
}


function testScaleXY() {
  var a = new goog.math.Vec2(10, 15);
  var scaled = a.scale(2, 3);
  assertEquals('The function should return the target instance', a, scaled);
  assertTrue(
      'The type of the return value should be goog.math.Vec2',
      scaled instanceof goog.math.Vec2);
  assertVectorEquals(new goog.math.Vec2(20, 45), a);
}


function testInvert() {
  var a = new goog.math.Vec2(3, 4);
  a.invert();

  assertEquals(-3, a.x);
  assertEquals(-4, a.y);
}


function testNormalize() {
  var a = new goog.math.Vec2(5, 5);
  a.normalize();
  assertRoughlyEquals(1.0, a.magnitude(), 1e-10);
}


function testAdd() {
  var a = new goog.math.Vec2(1, -1);
  a.add(new goog.math.Vec2(3, 3));
  assertVectorEquals(new goog.math.Vec2(4, 2), a);
}


function testSubtract() {
  var a = new goog.math.Vec2(1, -1);
  a.subtract(new goog.math.Vec2(3, 3));
  assertVectorEquals(new goog.math.Vec2(-2, -4), a);
}


function testRotate() {
  var a = new goog.math.Vec2(1, -1);
  a.rotate(Math.PI / 2);
  assertRoughlyEquals(1, a.x, 0.000001);
  assertRoughlyEquals(1, a.y, 0.000001);
  a.rotate(-Math.PI);
  assertRoughlyEquals(-1, a.x, 0.000001);
  assertRoughlyEquals(-1, a.y, 0.000001);
}


function testRotateAroundPoint() {
  var a = goog.math.Vec2.rotateAroundPoint(
      new goog.math.Vec2(1, -1), new goog.math.Vec2(1, 0), Math.PI / 2);
  assertRoughlyEquals(2, a.x, 0.000001);
  assertRoughlyEquals(0, a.y, 0.000001);
}


function testEquals() {
  var a = new goog.math.Vec2(1, 2);

  assertFalse(a.equals(null));
  assertFalse(a.equals(new goog.math.Vec2(1, 3)));
  assertFalse(a.equals(new goog.math.Vec2(2, 2)));

  assertTrue(a.equals(a));
  assertTrue(a.equals(new goog.math.Vec2(1, 2)));
}


function testSum() {
  var a = new goog.math.Vec2(0.5, 0.25);
  var b = new goog.math.Vec2(0.5, 0.75);

  var c = goog.math.Vec2.sum(a, b);
  assertVectorEquals(new goog.math.Vec2(1, 1), c);
}


function testDifference() {
  var a = new goog.math.Vec2(0.5, 0.25);
  var b = new goog.math.Vec2(0.5, 0.75);

  var c = goog.math.Vec2.difference(a, b);
  assertVectorEquals(new goog.math.Vec2(0, -0.5), c);
}


function testDistance() {
  var a = new goog.math.Vec2(3, 4);
  var b = new goog.math.Vec2(-3, -4);

  assertEquals(10, goog.math.Vec2.distance(a, b));
}


function testSquaredDistance() {
  var a = new goog.math.Vec2(3, 4);
  var b = new goog.math.Vec2(-3, -4);

  assertEquals(100, goog.math.Vec2.squaredDistance(a, b));
}


function testVec2Equals() {
  assertTrue(goog.math.Vec2.equals(null, null));
  assertFalse(goog.math.Vec2.equals(null, new goog.math.Vec2()));

  var a = new goog.math.Vec2(1, 3);
  assertTrue(goog.math.Vec2.equals(a, a));
  assertTrue(goog.math.Vec2.equals(a, new goog.math.Vec2(1, 3)));
  assertFalse(goog.math.Vec2.equals(1, new goog.math.Vec2(3, 1)));
}


function testDot() {
  var a = new goog.math.Vec2(0, 5);
  var b = new goog.math.Vec2(3, 0);
  assertEquals(0, goog.math.Vec2.dot(a, b));

  var c = new goog.math.Vec2(-5, -5);
  var d = new goog.math.Vec2(0, 7);
  assertEquals(-35, goog.math.Vec2.dot(c, d));
}

function testDeterminant() {
  var a = new goog.math.Vec2(0, 5);
  var b = new goog.math.Vec2(0, 10);
  assertEquals(0, goog.math.Vec2.determinant(a, b));

  var c = new goog.math.Vec2(0, 5);
  var d = new goog.math.Vec2(10, 0);
  assertEquals(-50, goog.math.Vec2.determinant(c, d));

  var e = new goog.math.Vec2(-5, -5);
  var f = new goog.math.Vec2(0, 7);
  assertEquals(-35, goog.math.Vec2.determinant(e, f));
}

function testLerp() {
  var a = new goog.math.Vec2(0, 0);
  var b = new goog.math.Vec2(10, 10);

  for (var i = 0; i <= 10; i++) {
    var c = goog.math.Vec2.lerp(a, b, i / 10);
    assertEquals(i, c.x);
    assertEquals(i, c.y);
  }
}


function testToString() {
  testEquals('(0, 0)', new goog.math.Vec2(0, 0).toString());
}
