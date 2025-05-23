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

/**
 * @fileoverview Unit tests for goog.Uri.
 *
 */

goog.provide('goog.UriTest');

goog.require('goog.Uri');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.UriTest');

function testUriParse() {
  var uri = new goog.Uri('http://www.google.com:80/path?q=query#fragmento');
  assertEquals('http', uri.getScheme());
  assertEquals('', uri.getUserInfo());
  assertEquals('www.google.com', uri.getDomain());
  assertEquals(80, uri.getPort());
  assertEquals('/path', uri.getPath());
  assertEquals('q=query', uri.getQuery());
  assertEquals('fragmento', uri.getFragment());

  assertEquals(
      'terer258+foo@gmail.com',
      goog.Uri.parse('mailto:terer258+foo@gmail.com').getPath());
}

function testUriParseAcceptsThingsWithToString() {
  // Ensure that the goog.Uri constructor coerces random types to strings.
  var uriStr = 'http://www.google.com:80/path?q=query#fragmento';
  var uri = new goog.Uri({toString: function() { return uriStr; }});
  assertEquals(
      'http://www.google.com:80/path?q=query#fragmento', uri.toString());
}

function testUriCreate() {
  assertEquals(
      'http://www.google.com:81/search%20path?q=what%20to%20eat%2Bdrink%3F',
      goog.Uri
          .create(
              'http', null, 'www.google.com', 81, '/search path',
              (new goog.Uri.QueryData).set('q', 'what to eat+drink?'), null)
          .toString());

  assertEquals(
      'http://www.google.com:80/search%20path?q=what%20to%20eat%2Bdrink%3F',
      goog.Uri
          .create(
              'http', null, 'www.google.com', 80, '/search path',
              (new goog.Uri.QueryData).set('q', 'what to eat+drink?'), null)
          .toString());

  assertEquals(
      'http://www.google.com/search%20path?q=what%20to%20eat%2Bdrink%3F',
      goog.Uri
          .create(
              'http', null, 'www.google.com', null, '/search path',
              (new goog.Uri.QueryData).set('q', 'what to eat+drink?'), null)
          .toString());

  var createdUri = goog.Uri.create(
      'http', null, 'www.google.com', null, '/search path',
      new goog.Uri.QueryData(null, null, true).set('Q', 'what to eat+drink?'),
      null);

  assertEquals(
      'http://www.google.com/search%20path?q=what%20to%20eat%2Bdrink%3F',
      createdUri.toString());
}

function testClone() {
  var uri1 =
      new goog.Uri('http://user:pass@www.google.com:8080/foo?a=1&b=2#c=3');
  // getCount forces instantiation of internal data structures to more
  // thoroughly test clone.
  uri1.getQueryData().getCount();
  var uri2 = uri1.clone();

  assertNotEquals(uri1, uri2);
  assertEquals(uri1.toString(), uri2.toString());
  assertEquals(2, uri2.getQueryData().getCount());

  uri2.setParameterValues('q', 'bar');
  assertFalse(uri1.getParameterValue('q') == 'bar');
}

function testRelativeUris() {
  assertFalse(new goog.Uri('?hello').hasPath());
}

function testAbsolutePathResolution() {
  var uri1 = new goog.Uri('http://www.google.com:8080/path?q=query#fragmento');

  assertEquals(
      'http://www.google.com:8080/foo',
      uri1.resolve(new goog.Uri('/foo')).toString());

  assertEquals(
      'http://www.google.com:8080/foo/bar',
      goog.Uri.resolve('http://www.google.com:8080/search/', '/foo/bar')
          .toString());
}

function testRelativePathResolution() {
  var uri1 = new goog.Uri('http://www.google.com:8080/path?q=query#fragmento');
  assertEquals(
      'http://www.google.com:8080/foo',
      uri1.resolve(goog.Uri.parse('foo')).toString());

  var uri2 = new goog.Uri('http://www.google.com:8080/search');
  assertEquals(
      'http://www.google.com:8080/foo/bar',
      uri2.resolve(new goog.Uri('foo/bar')).toString());

  var uri3 = new goog.Uri('http://www.google.com:8080/search/');
  assertEquals(
      'http://www.google.com:8080/search/foo/bar',
      uri3.resolve(new goog.Uri('foo/bar')).toString());

  var uri4 = new goog.Uri('foo');
  assertEquals('bar', uri4.resolve(new goog.Uri('bar')).toString());

  var uri5 = new goog.Uri('http://www.google.com:8080/search/');
  assertEquals(
      'http://www.google.com:8080/search/..%2ffoo/bar',
      uri3.resolve(new goog.Uri('..%2ffoo/bar')).toString());
}

function testDomainResolution() {
  assertEquals(
      'https://www.google.com/foo/bar',
      new goog.Uri('https://www.fark.com:443/search/')
          .resolve(new goog.Uri('//www.google.com/foo/bar'))
          .toString());

  assertEquals(
      'http://www.google.com/',
      goog.Uri.resolve('http://www.fark.com/search/', '//www.google.com/')
          .toString());
}

function testQueryResolution() {
  assertEquals(
      'http://www.google.com/search?q=new%20search',
      goog.Uri.parse('http://www.google.com/search?q=old+search')
          .resolve(goog.Uri.parse('?q=new%20search'))
          .toString());

  assertEquals(
      'http://www.google.com/search?q=new%20search',
      goog.Uri.parse('http://www.google.com/search?q=old+search#hi')
          .resolve(goog.Uri.parse('?q=new%20search'))
          .toString());
}

function testFragmentResolution() {
  assertEquals(
      'http://www.google.com/foo/bar?q=hi#there',
      goog.Uri.resolve('http://www.google.com/foo/bar?q=hi', '#there')
          .toString());

  assertEquals(
      'http://www.google.com/foo/bar?q=hi#there',
      goog.Uri.resolve('http://www.google.com/foo/bar?q=hi#you', '#there')
          .toString());
}

function testBogusResolution() {
  var uri = goog.Uri.parse('some:base/url')
                .resolve(goog.Uri.parse('a://completely.different/url'));
  assertEquals('a://completely.different/url', uri.toString());
}

function testDotSegmentsRemovalRemoveLeadingDots() {
  // Test removing leading "../" and "./"
  assertEquals('bar', goog.Uri.removeDotSegments('../bar'));
  assertEquals('bar', goog.Uri.removeDotSegments('./bar'));
  assertEquals('bar', goog.Uri.removeDotSegments('.././bar'));
  assertEquals('bar', goog.Uri.removeDotSegments('.././bar'));
}

function testDotSegmentRemovalRemoveSingleDot() {
  // Tests replacing "/./" with "/"
  assertEquals('/foo/bar', goog.Uri.removeDotSegments('/foo/./bar'));
  assertEquals('/bar/', goog.Uri.removeDotSegments('/bar/./'));

  // Test replacing trailing "/." with "/"
  assertEquals('/', goog.Uri.removeDotSegments('/.'));
  assertEquals('/bar/', goog.Uri.removeDotSegments('/bar/.'));
}

function testDotSegmentRemovalRemoveDoubleDot() {
  // Test resolving "/../"
  assertEquals('/bar', goog.Uri.removeDotSegments('/foo/../bar'));
  assertEquals('/', goog.Uri.removeDotSegments('/bar/../'));

  // Test resolving trailing "/.."
  assertEquals('/', goog.Uri.removeDotSegments('/..'));
  assertEquals('/', goog.Uri.removeDotSegments('/bar/..'));
  assertEquals('/foo/', goog.Uri.removeDotSegments('/foo/bar/..'));
}

function testDotSegmentRemovalRemovePlainDots() {
  // RFC 3986, section 5.2.4, point 2.D.
  // Test resolving plain ".." or "."
  assertEquals('', goog.Uri.removeDotSegments('.'));
  assertEquals('', goog.Uri.removeDotSegments('..'));
}

function testPathConcatenation() {
  // Check accordenance with RFC 3986, section 5.2.4
  assertResolvedEquals('bar', '', 'bar');
  assertResolvedEquals('/bar', '/', 'bar');
  assertResolvedEquals('/bar', '/foo', '/bar');
  assertResolvedEquals('/foo/foo', '/foo/bar', 'foo');
}

function testPathConcatenationDontRemoveForEmptyUri() {
  // Resolving URIs with empty path should not result in dot segments removal.
  // See: algorithm in section 5.2.2: code inside 'if (R.path == "")' clause.
  assertResolvedEquals('/search/../foo', '/search/../foo', '');
  assertResolvedEquals('/search/./foo', '/search/./foo', '');
}


function testParameterGetters() {
  function assertArraysEqual(l1, l2) {
    if (!l1 || !l2) {
      assertEquals(l1, l2);
      return;
    }
    var l1s = l1.toString(), l2s = l2.toString();
    assertEquals(l1s, l2s);
    assertEquals(l1s, l1.length, l2.length);
    for (var i = 0; i < l1.length; ++i) {
      assertEquals(
          'part ' + i + ' of ' + l1.length + ' in ' + l1s, l1[i], l2[i]);
    }
  }

  assertArraysEqual(
      ['v1', 'v2'],
      goog.Uri.parse('/path?a=b&key=v1&c=d&key=v2&keywithsuffix=v3')
          .getParameterValues('key'));

  assertArraysEqual(
      ['v1', 'v2'],
      goog.Uri.parse('/path?a=b&keY=v1&c=d&KEy=v2&keywithsuffix=v3', true)
          .getParameterValues('kEy'));

  assertEquals(
      'v1', goog.Uri.parse('/path?key=v1&c=d&keywithsuffix=v3&key=v2')
                .getParameterValue('key'));

  assertEquals(
      'v1', goog.Uri.parse('/path?kEY=v1&c=d&keywithsuffix=v3&key=v2', true)
                .getParameterValue('Key'));

  assertEquals(
      'v1=v2',
      goog.Uri.parse('/path?key=v1=v2', true).getParameterValue('key'));

  assertEquals(
      'v1=v2=v3',
      goog.Uri.parse('/path?key=v1=v2=v3', true).getParameterValue('key'));

  assertArraysEqual(
      undefined, goog.Uri.parse('/path?key=v1&c=d&keywithsuffix=v3&key=v2')
                     .getParameterValue('nosuchkey'));

  // test boundary conditions
  assertArraysEqual(
      ['v1', 'v2'], goog.Uri.parse('/path?key=v1&c=d&key=v2&keywithsuffix=v3')
                        .getParameterValues('key'));
  assertArraysEqual(
      ['v1', 'v2'], goog.Uri.parse('/path?key=v1&c=d&keywithsuffix=v3&key=v2')
                        .getParameterValues('key'));

  // test no =
  assertArraysEqual(
      [''], goog.Uri.parse('/path?key').getParameterValues('key'));
  assertArraysEqual(
      [''], goog.Uri.parse('/path?key', true).getParameterValues('key'));

  assertArraysEqual(
      [''], goog.Uri.parse('/path?foo=bar&key').getParameterValues('key'));
  assertArraysEqual(
      [''],
      goog.Uri.parse('/path?foo=bar&key', true).getParameterValues('key'));

  assertEquals('', goog.Uri.parse('/path?key').getParameterValue('key'));
  assertEquals('', goog.Uri.parse('/path?key', true).getParameterValue('key'));

  assertEquals(
      '', goog.Uri.parse('/path?foo=bar&key').getParameterValue('key'));
  assertEquals(
      '', goog.Uri.parse('/path?foo=bar&key', true).getParameterValue('key'));

  var u = new goog.Uri('/path?a=b&key=v1&c=d&key=v2&keywithsuffix=v3');
  assertArraysEqual(u.getParameterValues('a'), ['b']);
  assertArraysEqual(u.getParameterValues('key'), ['v1', 'v2']);
  assertArraysEqual(u.getParameterValues('c'), ['d']);
  assertArraysEqual(u.getParameterValues('keywithsuffix'), ['v3']);
  assertArraysEqual(u.getParameterValues('KeyWITHSuffix'), []);

  // Make sure constructing from another URI preserves case-sensitivity
  var u2 = new goog.Uri(u);
  assertArraysEqual(u2.getParameterValues('a'), ['b']);
  assertArraysEqual(u2.getParameterValues('key'), ['v1', 'v2']);
  assertArraysEqual(u2.getParameterValues('c'), ['d']);
  assertArraysEqual(u2.getParameterValues('keywithsuffix'), ['v3']);
  assertArraysEqual(u2.getParameterValues('KeyWITHSuffix'), []);

  u = new goog.Uri('/path?a=b&key=v1&c=d&kEy=v2&keywithsuffix=v3', true);
  assertArraysEqual(u.getParameterValues('A'), ['b']);
  assertArraysEqual(u.getParameterValues('keY'), ['v1', 'v2']);
  assertArraysEqual(u.getParameterValues('c'), ['d']);
  assertArraysEqual(u.getParameterValues('keyWITHsuffix'), ['v3']);

  // Make sure constructing from another URI preserves case-insensitivity
  u2 = new goog.Uri(u);
  assertArraysEqual(u2.getParameterValues('A'), ['b']);
  assertArraysEqual(u2.getParameterValues('keY'), ['v1', 'v2']);
  assertArraysEqual(u2.getParameterValues('c'), ['d']);
  assertArraysEqual(u2.getParameterValues('keyWITHsuffix'), ['v3']);
}

function testRemoveParameter() {
  assertEquals(
      '/path?a=b&c=d&keywithsuffix=v3',
      goog.Uri.parse('/path?a=b&key=v1&c=d&key=v2&keywithsuffix=v3')
          .removeParameter('key')
          .toString());
}

function testParameterSetters() {
  assertEquals(
      '/path?a=b&key=newval&c=d&keywithsuffix=v3',
      goog.Uri.parse('/path?a=b&key=v1&c=d&key=v2&keywithsuffix=v3')
          .setParameterValue('key', 'newval')
          .toString());

  assertEquals(
      '/path?a=b&key=1&key=2&key=3&c=d&keywithsuffix=v3',
      goog.Uri.parse('/path?a=b&key=v1&c=d&key=v2&keywithsuffix=v3')
          .setParameterValues('key', ['1', '2', '3'])
          .toString());

  assertEquals(
      '/path', goog.Uri.parse('/path?key=v1&key=v2')
                   .setParameterValues('key', [])
                   .toString());

  // Test case-insensitive setters
  assertEquals(
      '/path?a=b&key=newval&c=d&keywithsuffix=v3',
      goog.Uri.parse('/path?a=b&key=v1&c=d&key=v2&keywithsuffix=v3', true)
          .setParameterValue('KEY', 'newval')
          .toString());

  assertEquals(
      '/path?a=b&key=1&key=2&key=3&c=d&keywithsuffix=v3',
      goog.Uri.parse('/path?a=b&key=v1&c=d&key=v2&keywithsuffix=v3', true)
          .setParameterValues('kEY', ['1', '2', '3'])
          .toString());
}

function testEncoding() {
  assertEquals('/foo bar baz', goog.Uri.parse('/foo%20bar%20baz').getPath());
  assertEquals('/foo+bar+baz', goog.Uri.parse('/foo+bar+baz').getPath());
}

function testSetScheme() {
  var uri = new goog.Uri('http://www.google.com:80/path?q=query#fragmento');

  uri.setScheme('https');
  assertTrue(uri.hasScheme());
  assertEquals('https', uri.getScheme());
  assertEquals(
      'https://www.google.com:80/path?q=query#fragmento', uri.toString());

  uri.setScheme(encodeURIComponent('ab cd'), true);
  assertTrue(uri.hasScheme());
  assertEquals('ab cd', uri.getScheme());
  assertEquals(
      'ab%20cd://www.google.com:80/path?q=query#fragmento', uri.toString());

  uri.setScheme('http:');
  assertTrue(uri.hasScheme());
  assertEquals('http', uri.getScheme());
  assertEquals(
      'http://www.google.com:80/path?q=query#fragmento', uri.toString());

  uri.setScheme('');
  assertFalse(uri.hasScheme());
  assertEquals('', uri.getScheme());
  assertEquals('//www.google.com:80/path?q=query#fragmento', uri.toString());
}

function testSetDomain() {
  var uri = new goog.Uri('http://www.google.com:80/path?q=query#fragmento');

  uri.setDomain('\u1e21oogle.com');
  assertTrue(uri.hasDomain());
  assertEquals('\u1e21oogle.com', uri.getDomain());
  assertEquals(
      'http://%E1%B8%A1oogle.com:80/path?q=query#fragmento', uri.toString());

  uri.setDomain(encodeURIComponent('\u1e21oogle.com'), true);
  assertTrue(uri.hasDomain());
  assertEquals('\u1e21oogle.com', uri.getDomain());
  assertEquals(
      'http://%E1%B8%A1oogle.com:80/path?q=query#fragmento', uri.toString());

  uri.setDomain('');
  assertFalse(uri.hasDomain());
  assertEquals('', uri.getDomain());
  assertEquals('http:/path?q=query#fragmento', uri.toString());
}

function testSetPort() {
  var uri = new goog.Uri('http://www.google.com:80/path?q=query#fragmento');

  assertThrows(function() { uri.setPort(-1); });
  assertEquals(80, uri.getPort());

  assertThrows(function() { uri.setPort('a'); });
  assertEquals(80, uri.getPort());

  uri.setPort(443);
  assertTrue(uri.hasPort());
  assertEquals(443, uri.getPort());
  assertEquals(
      'http://www.google.com:443/path?q=query#fragmento', uri.toString());

  // TODO(chrishenry): This is undocumented, but exist in previous unit
  // test. We should clarify whether this is intended (alternatively,
  // setPort(0) also works).
  uri.setPort(null);
  assertFalse(uri.hasPort());
  assertEquals(null, uri.getPort());
  assertEquals('http://www.google.com/path?q=query#fragmento', uri.toString());
}

function testSetPath() {
  var uri = new goog.Uri('http://www.google.com:80/path?q=query#fragmento');

  uri.setPath('/search path/');
  assertTrue(uri.hasPath());
  assertEquals('/search path/', uri.getPath());
  assertEquals(
      'http://www.google.com:80/search%20path/?q=query#fragmento',
      uri.toString());

  uri.setPath(encodeURIComponent('search path 2/'), true);
  assertTrue(uri.hasPath());
  assertEquals('search path 2%2F', uri.getPath());
  assertEquals(
      'http://www.google.com:80/search%20path%202%2F?q=query#fragmento',
      uri.toString());

  uri.setPath('');
  assertFalse(uri.hasPath());
  assertEquals('', uri.getPath());
  assertEquals('http://www.google.com:80?q=query#fragmento', uri.toString());
}

function testSetFragment() {
  var uri = new goog.Uri('http://www.google.com:80/path?q=query#fragmento');

  uri.setFragment('foo?bar=a b&baz=2');
  assertTrue(uri.hasFragment());
  assertEquals('foo?bar=a b&baz=2', uri.getFragment());
  assertEquals(
      'http://www.google.com:80/path?q=query#foo?bar=a%20b&baz=2',
      uri.toString());

  uri.setFragment(encodeURIComponent('foo?bar=a b&baz=3'), true);
  assertTrue(uri.hasFragment());
  assertEquals('foo?bar=a b&baz=3', uri.getFragment());
  assertEquals(
      'http://www.google.com:80/path?q=query#foo?bar=a%20b&baz=3',
      uri.toString());

  uri.setFragment('');
  assertFalse(uri.hasFragment());
  assertEquals('', uri.getFragment());
  assertEquals('http://www.google.com:80/path?q=query', uri.toString());
}

function testSetUserInfo() {
  var uri = new goog.Uri('http://www.google.com:80/path?q=query#fragmento');

  uri.setUserInfo('user:pw d');
  assertTrue(uri.hasUserInfo());
  assertEquals('user:pw d', uri.getUserInfo());
  assertEquals(
      'http://user:pw%20d@www.google.com:80/path?q=query#fragmento',
      uri.toString());

  uri.setUserInfo(encodeURIComponent('user:pw d2'), true);
  assertTrue(uri.hasUserInfo());
  assertEquals('user:pw d2', uri.getUserInfo());
  assertEquals(
      'http://user:pw%20d2@www.google.com:80/path?q=query#fragmento',
      uri.toString());

  uri.setUserInfo('user');
  assertTrue(uri.hasUserInfo());
  assertEquals('user', uri.getUserInfo());
  assertEquals(
      'http://user@www.google.com:80/path?q=query#fragmento', uri.toString());

  uri.setUserInfo('');
  assertFalse(uri.hasUserInfo());
  assertEquals('', uri.getUserInfo());
  assertEquals(
      'http://www.google.com:80/path?q=query#fragmento', uri.toString());
}

function testSetParameterValues() {
  var uri = new goog.Uri('http://www.google.com:80/path?q=query#fragmento');

  uri.setParameterValues('q', ['foo', 'other query']);
  assertEquals(
      'http://www.google.com:80/path?q=foo&q=other%20query#fragmento',
      uri.toString());

  uri.setParameterValues('lang', 'en');
  assertEquals(
      'http://www.google.com:80/path?q=foo&q=other%20query&lang=en#fragmento',
      uri.toString());
}

function testTreatmentOfAt1() {
  var uri = new goog.Uri('http://www.google.com?q=johndoe@gmail.com');
  assertEquals('http', uri.getScheme());
  assertEquals('www.google.com', uri.getDomain());
  assertEquals('johndoe@gmail.com', uri.getParameterValue('q'));

  uri = goog.Uri.create(
      'http', null, 'www.google.com', null, null, 'q=johndoe@gmail.com', null);
  assertEquals('http://www.google.com?q=johndoe%40gmail.com', uri.toString());
}

function testTreatmentOfAt2() {
  var uri = new goog.Uri('http://www/~johndoe@gmail.com/foo');
  assertEquals('http', uri.getScheme());
  assertEquals('www', uri.getDomain());
  assertEquals('/~johndoe@gmail.com/foo', uri.getPath());

  assertEquals(
      'http://www/~johndoe@gmail.com/foo',
      goog.Uri
          .create(
              'http', null, 'www', null, '/~johndoe@gmail.com/foo', null, null)
          .toString());
}

function testTreatmentOfAt3() {
  var uri = new goog.Uri('ftp://skroob:1234@teleport/~skroob@vacuum');
  assertEquals('ftp', uri.getScheme());
  assertEquals('skroob:1234', uri.getUserInfo());
  assertEquals('teleport', uri.getDomain());
  assertEquals('/~skroob@vacuum', uri.getPath());

  assertEquals(
      'ftp://skroob:1234@teleport/~skroob@vacuum',
      goog.Uri
          .create(
              'ftp', 'skroob:1234', 'teleport', null, '/~skroob@vacuum', null,
              null)
          .toString());
}

function testTreatmentOfAt4() {
  assertEquals(
      'ftp://darkhelmet:45%4078@teleport/~dhelmet@vacuum',
      goog.Uri
          .create(
              'ftp', 'darkhelmet:45@78', 'teleport', null, '/~dhelmet@vacuum',
              null, null)
          .toString());
}

function testSameDomain1() {
  var uri1 = 'http://www.google.com/a';
  var uri2 = 'http://www.google.com/b';
  assertTrue(goog.Uri.haveSameDomain(uri1, uri2));
  assertTrue(goog.Uri.haveSameDomain(uri2, uri1));
}

function testSameDomain2() {
  var uri1 = 'http://www.google.com:1234/a';
  var uri2 = 'http://www.google.com/b';
  assertFalse(goog.Uri.haveSameDomain(uri1, uri2));
  assertFalse(goog.Uri.haveSameDomain(uri2, uri1));
}

function testSameDomain3() {
  var uri1 = 'www.google.com/a';
  var uri2 = 'http://www.google.com/b';
  assertFalse(goog.Uri.haveSameDomain(uri1, uri2));
  assertFalse(goog.Uri.haveSameDomain(uri2, uri1));
}

function testSameDomain4() {
  var uri1 = '/a';
  var uri2 = 'http://www.google.com/b';
  assertFalse(goog.Uri.haveSameDomain(uri1, uri2));
  assertFalse(goog.Uri.haveSameDomain(uri2, uri1));
}

function testSameDomain5() {
  var uri1 = 'http://www.google.com/a';
  var uri2 = 'http://mail.google.com/b';
  assertFalse(goog.Uri.haveSameDomain(uri1, uri2));
  assertFalse(goog.Uri.haveSameDomain(uri2, uri1));
}

function testSameDomain6() {
  var uri1 = '/a';
  var uri2 = '/b';
  assertTrue(goog.Uri.haveSameDomain(uri1, uri2));
  assertTrue(goog.Uri.haveSameDomain(uri2, uri1));
}

function testMakeUnique() {
  var uri1 = new goog.Uri('http://www.google.com/setgmail');
  uri1.makeUnique();
  var uri2 = new goog.Uri('http://www.google.com/setgmail');
  uri2.makeUnique();
  assertTrue(uri1.getQueryData().containsKey(goog.Uri.RANDOM_PARAM));
  assertTrue(uri1.toString() != uri2.toString());
}

function testSetReadOnly() {
  var uri = new goog.Uri('http://www.google.com/setgmail');
  uri.setReadOnly(true);
  assertThrows(function() { uri.setParameterValue('cant', 'dothis'); });
}

function testSetReadOnlyChained() {
  var uri = new goog.Uri('http://www.google.com/setgmail').setReadOnly(true);
  assertThrows(function() { uri.setParameterValue('cant', 'dothis'); });
}

function testQueryDataCount() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');
  assertEquals(5, qd.getCount());
}

function testQueryDataRemove() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');
  qd.remove('c');
  assertEquals(4, qd.getCount());
  assertEquals('a=A&a=A2&b=B&b=B2', String(qd));
  qd.remove('a');
  assertEquals(2, qd.getCount());
  assertEquals('b=B&b=B2', String(qd));
}

function testQueryDataClear() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');
  qd.clear();
  assertEquals(0, qd.getCount());
  assertEquals('', String(qd));
}

function testQueryDataIsEmpty() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');
  qd.remove('a');
  assertFalse(qd.isEmpty());
  qd.remove('b');
  assertFalse(qd.isEmpty());
  qd.remove('c');
  assertTrue(qd.isEmpty());

  qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');
  qd.clear();
  assertTrue(qd.isEmpty());

  qd = new goog.Uri.QueryData('');
  assertTrue(qd.isEmpty());
}

function testQueryDataContainsKey() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');
  assertTrue(qd.containsKey('a'));
  assertTrue(qd.containsKey('b'));
  assertTrue(qd.containsKey('c'));
  qd.remove('a');
  assertFalse(qd.containsKey('a'));
  assertTrue(qd.containsKey('b'));
  assertTrue(qd.containsKey('c'));
  qd.remove('b');
  assertFalse(qd.containsKey('a'));
  assertFalse(qd.containsKey('b'));
  assertTrue(qd.containsKey('c'));
  qd.remove('c');
  assertFalse(qd.containsKey('a'));
  assertFalse(qd.containsKey('b'));
  assertFalse(qd.containsKey('c'));

  qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');
  qd.clear();
  assertFalse(qd.containsKey('a'));
  assertFalse(qd.containsKey('b'));
  assertFalse(qd.containsKey('c'));

  // Test case-insensitive
  qd = new goog.Uri.QueryData('aaa=A&bbb=B&aaa=A2&bbbb=B2&ccc=C', null, true);
  assertTrue(qd.containsKey('aaa'));
  assertTrue(qd.containsKey('bBb'));
  assertTrue(qd.containsKey('CCC'));

  qd = new goog.Uri.QueryData('a=b=c');
  assertTrue(qd.containsKey('a'));
  assertFalse(qd.containsKey('b'));
}

function testQueryDataContainsValue() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');

  assertTrue(qd.containsValue('A'));
  assertTrue(qd.containsValue('B'));
  assertTrue(qd.containsValue('A2'));
  assertTrue(qd.containsValue('B2'));
  assertTrue(qd.containsValue('C'));
  qd.remove('a');
  assertFalse(qd.containsValue('A'));
  assertTrue(qd.containsValue('B'));
  assertFalse(qd.containsValue('A2'));
  assertTrue(qd.containsValue('B2'));
  assertTrue(qd.containsValue('C'));
  qd.remove('b');
  assertFalse(qd.containsValue('A'));
  assertFalse(qd.containsValue('B'));
  assertFalse(qd.containsValue('A2'));
  assertFalse(qd.containsValue('B2'));
  assertTrue(qd.containsValue('C'));
  qd.remove('c');
  assertFalse(qd.containsValue('A'));
  assertFalse(qd.containsValue('B'));
  assertFalse(qd.containsValue('A2'));
  assertFalse(qd.containsValue('B2'));
  assertFalse(qd.containsValue('C'));

  qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');
  qd.clear();
  assertFalse(qd.containsValue('A'));
  assertFalse(qd.containsValue('B'));
  assertFalse(qd.containsValue('A2'));
  assertFalse(qd.containsValue('B2'));
  assertFalse(qd.containsValue('C'));

  qd = new goog.Uri.QueryData('a=b=c');
  assertTrue(qd.containsValue('b=c'));
  assertFalse(qd.containsValue('b'));
  assertFalse(qd.containsValue('c'));
}

function testQueryDataGetKeys() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C=extra');

  assertEquals('aabbc', qd.getKeys().join(''));
  qd.remove('a');
  assertEquals('bbc', qd.getKeys().join(''));
  qd.add('d', 'D');
  qd.add('d', 'D');
  assertEquals('bbcdd', qd.getKeys().join(''));

  // Test case-insensitive
  qd = new goog.Uri.QueryData('A=A&B=B&a=A2&b=B2&C=C=extra', null, true);

  assertEquals('aabbc', qd.getKeys().join(''));
  qd.remove('a');
  assertEquals('bbc', qd.getKeys().join(''));
  qd.add('d', 'D');
  qd.add('D', 'D');
  assertEquals('bbcdd', qd.getKeys().join(''));
}

function testQueryDataGetValues() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C=extra');

  assertArrayEquals(['A', 'A2', 'B', 'B2', 'C=extra'], qd.getValues());
  qd.remove('a');
  assertArrayEquals(['B', 'B2', 'C=extra'], qd.getValues());
  qd.add('d', 'D');
  qd.add('d', 'D');
  assertArrayEquals(['B', 'B2', 'C=extra', 'D', 'D'], qd.getValues());

  qd.add('e', new String('Eee'));
  assertArrayEquals(['B', 'B2', 'C=extra', 'D', 'D', 'Eee'], qd.getValues());

  assertArrayEquals(['Eee'], qd.getValues('e'));
}

function testQueryDataSet() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');

  qd.set('d', 'D');
  assertEquals('a=A&a=A2&b=B&b=B2&c=C&d=D', String(qd));
  qd.set('d', 'D2');
  assertEquals('a=A&a=A2&b=B&b=B2&c=C&d=D2', String(qd));
  qd.set('a', 'A3');
  assertEquals('a=A3&b=B&b=B2&c=C&d=D2', String(qd));
  qd.remove('a');
  qd.set('a', 'A4');
  // this is different in IE and Mozilla so we cannot use the toString to test
  assertEquals('A4', qd.get('a'));
}

function testQueryDataGet() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C=extra');

  assertEquals('A', qd.get('a'));
  assertEquals('B', qd.get('b'));
  assertEquals('C=extra', qd.get('c'));
  assertEquals('Default', qd.get('d', 'Default'));

  qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C=extra', null, true);

  assertEquals('A', qd.get('A'));
  assertEquals('B', qd.get('b'));
  assertEquals('C=extra', qd.get('C'));
  assertEquals('Default', qd.get('D', 'Default'));

  // Some unit tests pass undefined to get method (even though the type
  // for key is {string}). This is not caught by JsCompiler as
  // tests aren't typically compiled.
  assertUndefined(qd.get(undefined));
}


function testQueryDataSetValues() {
  var qd = new goog.Uri.QueryData('a=A&b=B&a=A2&b=B2&c=C');

  qd.setValues('a', ['A3', 'A4', 'A5']);
  assertEquals('a=A3&a=A4&a=A5&b=B&b=B2&c=C', String(qd));
  qd.setValues('d', ['D']);
  assertEquals('a=A3&a=A4&a=A5&b=B&b=B2&c=C&d=D', String(qd));
  qd.setValues('e', []);
  assertEquals('a=A3&a=A4&a=A5&b=B&b=B2&c=C&d=D', String(qd));
}

function testQueryDataSetIgnoreCase() {
  var qd = new goog.Uri.QueryData('aaA=one&BBb=two&cCc=three');
  assertEquals('one', qd.get('aaA'));
  assertEquals(undefined, qd.get('aaa'));
  qd.setIgnoreCase(true);
  assertEquals('one', qd.get('aaA'));
  assertEquals('one', qd.get('aaa'));
  qd.setIgnoreCase(false);
  assertEquals(undefined, qd.get('aaA'));
  assertEquals('one', qd.get('aaa'));
  qd.add('DdD', 'four');
  assertEquals('four', qd.get('DdD'));
  assertEquals(undefined, qd.get('ddd'));
}

function testQueryDataSetIgnoreCaseWithMultipleValues() {
  var qd = new goog.Uri.QueryData('aaA=one&aaA=two');
  qd.setIgnoreCase(true);
  assertArrayEquals(['one', 'two'], qd.getValues('aaA'));
  assertArrayEquals(['one', 'two'], qd.getValues('aaa'));
}

function testQueryDataExtend() {
  var qd1 = new goog.Uri.QueryData('a=A&b=B&c=C');
  var qd2 = new goog.Uri.QueryData('d=D&e=E');
  qd1.extend(qd2);
  assertEquals('a=A&b=B&c=C&d=D&e=E', String(qd1));

  qd1 = new goog.Uri.QueryData('a=A&b=B&c=C');
  qd2 = new goog.Uri.QueryData('d=D&e=E');
  var qd3 = new goog.Uri.QueryData('f=F&g=G');
  qd1.extend(qd2, qd3);
  assertEquals('a=A&b=B&c=C&d=D&e=E&f=F&g=G', String(qd1));

  qd1 = new goog.Uri.QueryData('a=A&b=B&c=C');
  qd2 = new goog.Uri.QueryData('a=A&c=C');
  qd1.extend(qd2);
  assertEquals('a=A&a=A&b=B&c=C&c=C', String(qd1));
}

function testQueryDataCreateFromMap() {
  assertEquals('', String(goog.Uri.QueryData.createFromMap({})));
  assertEquals(
      'a=A&b=B&c=C',
      String(goog.Uri.QueryData.createFromMap({a: 'A', b: 'B', c: 'C'})));
  assertEquals(
      'a=foo%26bar', String(goog.Uri.QueryData.createFromMap({a: 'foo&bar'})));
}

function testQueryDataCreateFromMapWithArrayValues() {
  var obj = {'key': ['1', '2', '3']};
  var qd = goog.Uri.QueryData.createFromMap(obj);
  assertEquals('key=1&key=2&key=3', qd.toString());
  qd.add('breakCache', 1);
  obj.key.push('4');
  assertEquals('key=1&key=2&key=3&breakCache=1', qd.toString());
}

function testQueryDataCreateFromKeysValues() {
  assertEquals('', String(goog.Uri.QueryData.createFromKeysValues([], [])));
  assertEquals(
      'a=A&b=B&c=C', String(
                         goog.Uri.QueryData.createFromKeysValues(
                             ['a', 'b', 'c'], ['A', 'B', 'C'])));
  assertEquals(
      'a=A&a=B&a=C', String(
                         goog.Uri.QueryData.createFromKeysValues(
                             ['a', 'a', 'a'], ['A', 'B', 'C'])));
}

function testQueryDataAddMultipleValuesWithSameKey() {
  var qd = new goog.Uri.QueryData();
  qd.add('abc', 'v');
  qd.add('abc', 'v2');
  qd.add('abc', 'v3');
  assertEquals('abc=v&abc=v2&abc=v3', qd.toString());
}

function testQueryDataAddWithArray() {
  var qd = new goog.Uri.QueryData();
  qd.add('abc', ['v', 'v2']);
  assertEquals('abc=v%2Cv2', qd.toString());
}

function testFragmentEncoding() {
  var allowedInFragment = /[A-Za-z0-9\-._~!$&'()*+,;=:@/?]/g;

  var sb = [];
  for (var i = 33; i < 500; i++) {  // arbitrarily use first 500 chars.
    sb.push(String.fromCharCode(i));
  }
  var testString = sb.join('');

  var fragment = new goog.Uri().setFragment(testString).toString();

  // Remove first '#' character.
  fragment = fragment.substr(1);

  // Strip all percent encoded characters, as they're ok.
  fragment = fragment.replace(/%[0-9A-F][0-9A-F]/g, '');

  // Remove allowed characters.
  fragment = fragment.replace(allowedInFragment, '');

  // Only illegal characters should remain, which is a fail.
  assertEquals('String should be empty', 0, fragment.length);
}

function testStrictDoubleEncodingRemoval() {
  var url = goog.Uri.parse('dummy/a%25invalid');
  assertEquals('dummy/a%25invalid', url.toString());
  url = goog.Uri.parse('dummy/a%252fdouble-encoded-slash');
  assertEquals('dummy/a%252fdouble-encoded-slash', url.toString());
  url = goog.Uri.parse('https://example.com/a%25%2f%25bcd%25%25');
  assertEquals('https://example.com/a%25%2f%25bcd%25%25', url.toString());
}


// Tests, that creating URI from components and then
// getting the components back yields equal results.
// The special attention is payed to test proper encoding
// and decoding of URI components.
function testComponentsAfterUriCreate() {
  var createdUri = new goog.Uri.create(
      '%40',   // scheme
      '%41',   // user info
      '%42',   // domain
      43,      // port
      '%44',   // path
      '%45',   // query
      '%46');  // fragment

  assertEquals('%40', createdUri.getScheme());
  assertEquals('%41', createdUri.getUserInfo());
  assertEquals('%42', createdUri.getDomain());
  assertEquals(43, createdUri.getPort());
  assertEquals('%44', createdUri.getPath());
  assertEquals('%2545', createdUri.getQuery());  // returns encoded value
  assertEquals('%45', createdUri.getDecodedQuery());
  assertEquals('%2545', createdUri.getEncodedQuery());
  assertEquals('%46', createdUri.getFragment());
}

// Tests setting the query string and then reading back
// query parameter values.
function testSetQueryAndGetParameterValue() {
  var uri = new goog.Uri();

  // Sets query as decoded string.
  uri.setQuery('i=j&k');
  assertEquals('?i=j&k', uri.toString());
  assertEquals('i=j&k', uri.getDecodedQuery());
  assertEquals('i=j&k', uri.getEncodedQuery());
  assertEquals('i=j&k', uri.getQuery());  // returns encoded value
  assertEquals('j', uri.getParameterValue('i'));
  assertEquals('', uri.getParameterValue('k'));

  // Sets query as encoded string.
  uri.setQuery('i=j&k', true);
  assertEquals('?i=j&k', uri.toString());
  assertEquals('i=j&k', uri.getDecodedQuery());
  assertEquals('i=j&k', uri.getEncodedQuery());
  assertEquals('i=j&k', uri.getQuery());  // returns encoded value
  assertEquals('j', uri.getParameterValue('i'));
  assertEquals('', uri.getParameterValue('k'));

  // Sets query as decoded string.
  uri.setQuery('i=j%26k');
  assertEquals('?i=j%2526k', uri.toString());
  assertEquals('i=j%26k', uri.getDecodedQuery());
  assertEquals('i=j%2526k', uri.getEncodedQuery());
  assertEquals('i=j%2526k', uri.getQuery());  // returns encoded value
  assertEquals('j%26k', uri.getParameterValue('i'));
  assertUndefined(uri.getParameterValue('k'));

  // Sets query as encoded string.
  uri.setQuery('i=j%26k', true);
  assertEquals('?i=j%26k', uri.toString());
  assertEquals('i=j&k', uri.getDecodedQuery());
  assertEquals('i=j%26k', uri.getEncodedQuery());
  assertEquals('i=j%26k', uri.getQuery());  // returns encoded value
  assertEquals('j&k', uri.getParameterValue('i'));
  assertUndefined(uri.getParameterValue('k'));
}

// Tests setting query parameter values and the reading back the query string.
function testSetParameterValueAndGetQuery() {
  var uri = new goog.Uri();

  uri.setParameterValue('a', 'b&c');
  assertEquals('?a=b%26c', uri.toString());
  assertEquals('a=b&c', uri.getDecodedQuery());
  assertEquals('a=b%26c', uri.getEncodedQuery());
  assertEquals('a=b%26c', uri.getQuery());  // returns encoded value

  uri.setParameterValue('a', 'b%26c');
  assertEquals('?a=b%2526c', uri.toString());
  assertEquals('a=b%26c', uri.getDecodedQuery());
  assertEquals('a=b%2526c', uri.getEncodedQuery());
  assertEquals('a=b%2526c', uri.getQuery());  // returns encoded value
}


// Tests that building a URI with a query string and then reading it back
// gives the same result.
function testQueryNotModified() {
  assertEquals('?foo', new goog.Uri('?foo').toString());
  assertEquals('?foo=', new goog.Uri('?foo=').toString());
  assertEquals('?foo=bar', new goog.Uri('?foo=bar').toString());
  assertEquals('?&=&=&', new goog.Uri('?&=&=&').toString());
}


function testRelativePathEscapesColon() {
  assertEquals(
      'javascript%3aalert(1)',
      new goog.Uri().setPath('javascript:alert(1)').toString());
}


function testAbsolutePathDoesNotEscapeColon() {
  assertEquals(
      '/javascript:alert(1)', new goog.Uri('/javascript:alert(1)').toString());
}


function testColonInPathNotUnescaped() {
  assertEquals(
      '/javascript%3aalert(1)',
      new goog.Uri('/javascript%3aalert(1)').toString());
  assertEquals(
      'javascript%3aalert(1)',
      new goog.Uri('javascript%3aalert(1)').toString());
  assertEquals(
      'javascript:alert(1)', new goog.Uri('javascript:alert(1)').toString());
  assertEquals(
      'http://www.foo.bar/path:with:colon/x',
      new goog.Uri('http://www.foo.bar/path:with:colon/x').toString());
  assertEquals(
      '//www.foo.bar/path:with:colon/x',
      new goog.Uri('//www.foo.bar/path:with:colon/x').toString());
}


// verifies bug http://b/9821952
function testGetQueryForEmptyString() {
  var queryData = new goog.Uri.QueryData('a=b&c=d');
  assertArrayEquals(['b', 'd'], queryData.getValues());
  assertArrayEquals([], queryData.getValues(''));

  queryData = new goog.Uri.QueryData('a=b&c=d&=e');
  assertArrayEquals(['e'], queryData.getValues(''));
}


function testRestrictedCharactersArePreserved() {
  var uri = new goog.Uri(
      'ht%74p://hos%74.example.%2f.com/pa%74h%2f-with-embedded-slash/');
  assertEquals('http', uri.getScheme());
  assertEquals('host.example.%2f.com', uri.getDomain());
  assertEquals('/path%2f-with-embedded-slash/', uri.getPath());
  assertEquals(
      'http://host.example.%2f.com/path%2f-with-embedded-slash/',
      uri.toString());
}


function testFileUriWithNoDomainToString() {
  // Regression test for https://github.com/google/closure-library/issues/104.
  var uri = new goog.Uri('file:///a/b');
  assertEquals('file:///a/b', uri.toString());
}

function assertDotRemovedEquals(expected, path) {
  assertEquals(expected, goog.Uri.removeDotSegments(path));
}

function assertResolvedEquals(expected, base, other) {
  assertEquals(expected, goog.Uri.resolve(base, other).toString());
}
