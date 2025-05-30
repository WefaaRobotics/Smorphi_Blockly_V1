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

goog.provide('goog.net.cookiesTest');
goog.setTestOnly('goog.net.cookiesTest');

goog.require('goog.array');
goog.require('goog.net.cookies');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

var cookies = goog.net.cookies;
var baseCount = 0;
var stubs = new goog.testing.PropertyReplacer();

function checkForCookies() {
  if (!cookies.isEnabled()) {
    var message = 'Cookies must be enabled to run this test.';
    if (location.protocol == 'file:') {
      message += '\nNote that cookies for local files are disabled in some ' +
          'browsers.\nThey can be enabled in Chrome with the ' +
          '--enable-file-cookies flag.';
    }

    fail(message);
  }
}

function setUp() {
  checkForCookies();

  // Make sure there are no cookies set by previous, bad tests.
  cookies.clear();
  baseCount = cookies.getCount();
}

function tearDown() {
  // Clear up after ourselves.
  cookies.clear();
  stubs.reset();
}

function testIsEnabled() {
  assertEquals(navigator.cookieEnabled, cookies.isEnabled());
}

function testCount() {
  // setUp empties the cookies

  cookies.set('testa', 'A');
  assertEquals(baseCount + 1, cookies.getCount());
  cookies.set('testb', 'B');
  cookies.set('testc', 'C');
  assertEquals(baseCount + 3, cookies.getCount());
  cookies.remove('testa');
  cookies.remove('testb');
  assertEquals(baseCount + 1, cookies.getCount());
  cookies.remove('testc');
  assertEquals(baseCount + 0, cookies.getCount());
}

function testSet() {
  cookies.set('testa', 'testb');
  assertEquals('testb', cookies.get('testa'));
  cookies.remove('testa');
  assertEquals(undefined, cookies.get('testa'));
  // check for invalid characters in name and value
}

function testGetKeys() {
  cookies.set('testa', 'A');
  cookies.set('testb', 'B');
  cookies.set('testc', 'C');
  var keys = cookies.getKeys();
  assertTrue(goog.array.contains(keys, 'testa'));
  assertTrue(goog.array.contains(keys, 'testb'));
  assertTrue(goog.array.contains(keys, 'testc'));
}


function testGetValues() {
  cookies.set('testa', 'A');
  cookies.set('testb', 'B');
  cookies.set('testc', 'C');
  var values = cookies.getValues();
  assertTrue(goog.array.contains(values, 'A'));
  assertTrue(goog.array.contains(values, 'B'));
  assertTrue(goog.array.contains(values, 'C'));
}


function testContainsKey() {
  assertFalse(cookies.containsKey('testa'));
  cookies.set('testa', 'A');
  assertTrue(cookies.containsKey('testa'));
  cookies.set('testb', 'B');
  assertTrue(cookies.containsKey('testb'));
  cookies.remove('testb');
  assertFalse(cookies.containsKey('testb'));
  cookies.remove('testa');
  assertFalse(cookies.containsKey('testa'));
}


function testContainsValue() {
  assertFalse(cookies.containsValue('A'));
  cookies.set('testa', 'A');
  assertTrue(cookies.containsValue('A'));
  cookies.set('testb', 'B');
  assertTrue(cookies.containsValue('B'));
  cookies.remove('testb');
  assertFalse(cookies.containsValue('B'));
  cookies.remove('testa');
  assertFalse(cookies.containsValue('A'));
}


function testIsEmpty() {
  // we cannot guarantee that we have no cookies so testing for the true
  // case cannot be done without a mock document.cookie
  cookies.set('testa', 'A');
  assertFalse(cookies.isEmpty());
  cookies.set('testb', 'B');
  assertFalse(cookies.isEmpty());
  cookies.remove('testb');
  assertFalse(cookies.isEmpty());
  cookies.remove('testa');
}


function testRemove() {
  assertFalse(
      '1. Cookie should not contain "testa"', cookies.containsKey('testa'));
  cookies.set('testa', 'A', undefined, '/');
  assertTrue('2. Cookie should contain "testa"', cookies.containsKey('testa'));
  cookies.remove('testa', '/');
  assertFalse(
      '3. Cookie should not contain "testa"', cookies.containsKey('testa'));

  cookies.set('testa', 'A');
  assertTrue('4. Cookie should contain "testa"', cookies.containsKey('testa'));
  cookies.remove('testa');
  assertFalse(
      '5. Cookie should not contain "testa"', cookies.containsKey('testa'));
}

function testStrangeValue() {
  // This ensures that the pattern key2=value in the value does not match
  // the key2 cookie.
  var value = 'testb=bbb';
  var value2 = 'ccc';

  cookies.set('testa', value);
  cookies.set('testb', value2);

  assertEquals(value, cookies.get('testa'));
  assertEquals(value2, cookies.get('testb'));
}

function testSetCookiePath() {
  assertEquals('foo=bar;path=/xyz', mockSetCookie('foo', 'bar', -1, '/xyz'));
}

function testSetCookieDomain() {
  assertEquals(
      'foo=bar;domain=google.com',
      mockSetCookie('foo', 'bar', -1, null, 'google.com'));
}

function testSetCookieSecure() {
  assertEquals(
      'foo=bar;secure', mockSetCookie('foo', 'bar', -1, null, null, true));
}

function testSetCookieMaxAgeZero() {
  var result = mockSetCookie('foo', 'bar', 0);
  var pattern =
      new RegExp('foo=bar;expires=' + new Date(1970, 1, 1).toUTCString());
  if (!result.match(pattern)) {
    fail('expected match against ' + pattern + ' got ' + result);
  }
}

function testGetEmptyCookie() {
  var value = '';

  cookies.set('test', value);

  assertEquals(value, cookies.get('test'));
}

function testGetEmptyCookieIE() {
  stubs.set(
      cookies, 'getCookie_', function() { return 'test1; test2; test3'; });

  assertEquals('', cookies.get('test1'));
  assertEquals('', cookies.get('test2'));
  assertEquals('', cookies.get('test3'));
}

// TODO(chrisn): Testing max age > 0 requires a mock clock.

function mockSetCookie(var_args) {
  var setCookie = cookies.setCookie_;
  try {
    var result;
    cookies.setCookie_ = function(arg) { result = arg; };
    cookies.set.apply(cookies, arguments);
    return result;
  } finally {
    cookies.setCookie_ = setCookie;
  }
}

function assertValidName(name) {
  assertTrue(name + ' should be valid', cookies.isValidName(name));
}

function assertInvalidName(name) {
  assertFalse(name + ' should be invalid', cookies.isValidName(name));
  assertThrows(function() { cookies.set(name, 'value'); });
}

function assertValidValue(val) {
  assertTrue(val + ' should be valid', cookies.isValidValue(val));
}

function assertInvalidValue(val) {
  assertFalse(val + ' should be invalid', cookies.isValidValue(val));
  assertThrows(function() { cookies.set('name', val); });
}

function testValidName() {
  assertValidName('foo');
  assertInvalidName('foo bar');
  assertInvalidName('foo=bar');
  assertInvalidName('foo;bar');
  assertInvalidName('foo\nbar');
}

function testValidValue() {
  assertValidValue('foo');
  assertValidValue('foo bar');
  assertValidValue('foo=bar');
  assertInvalidValue('foo;bar');
  assertInvalidValue('foo\nbar');
}
