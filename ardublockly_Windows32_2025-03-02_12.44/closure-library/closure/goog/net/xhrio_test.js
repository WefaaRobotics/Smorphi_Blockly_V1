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

goog.provide('goog.net.XhrIoTest');
goog.setTestOnly('goog.net.XhrIoTest');

goog.require('goog.Uri');
goog.require('goog.debug.EntryPointMonitor');
goog.require('goog.debug.ErrorHandler');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.events');
goog.require('goog.functions');
goog.require('goog.net.EventType');
goog.require('goog.net.WrapperXmlHttpFactory');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XmlHttp');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.net.XhrIo');
goog.require('goog.testing.recordFunction');
goog.require('goog.userAgent.product');

function MockXmlHttp() {
  /**
   * The headers for this XmlHttpRequest.
   * @type {!Object<string>}
   */
  this.headers = {};

  /**
   * The upload object associated with this XmlHttpRequest.
   * @type {!Object}
   */
  this.upload = {};
}

MockXmlHttp.prototype.readyState = goog.net.XmlHttp.ReadyState.UNINITIALIZED;

MockXmlHttp.prototype.status = 200;

MockXmlHttp.syncSend = false;

MockXmlHttp.prototype.send = function(opt_data) {
  this.readyState = goog.net.XmlHttp.ReadyState.UNINITIALIZED;

  if (MockXmlHttp.syncSend) {
    this.complete();
  }
};

MockXmlHttp.prototype.complete = function() {
  this.readyState = goog.net.XmlHttp.ReadyState.LOADING;
  this.onreadystatechange();

  this.readyState = goog.net.XmlHttp.ReadyState.LOADED;
  this.onreadystatechange();

  this.readyState = goog.net.XmlHttp.ReadyState.INTERACTIVE;
  this.onreadystatechange();

  this.readyState = goog.net.XmlHttp.ReadyState.COMPLETE;
  this.onreadystatechange();
};


MockXmlHttp.prototype.open = function(verb, uri, async) {};

MockXmlHttp.prototype.abort = function() {};

MockXmlHttp.prototype.setRequestHeader = function(key, value) {
  this.headers[key] = value;
};

var lastMockXmlHttp;
goog.net.XmlHttp.setGlobalFactory(
    new goog.net.WrapperXmlHttpFactory(
        function() {
          lastMockXmlHttp = new MockXmlHttp();
          return lastMockXmlHttp;
        },
        function() { return {}; }));


var propertyReplacer = new goog.testing.PropertyReplacer();
var clock;
var originalEntryPoint = goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_;

function setUp() {
  lastMockXmlHttp = null;
  clock = new goog.testing.MockClock(true);
}

function tearDown() {
  propertyReplacer.reset();
  clock.dispose();
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = originalEntryPoint;
}


function testSyncSend() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertTrue('Should be succesful', e.target.isSuccess());
    count++;

  });

  var inSend = true;
  x.send('url');
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}

function testSyncSendFailure() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertFalse('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send('url');
  lastMockXmlHttp.status = 404;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendRelativeZeroStatus() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertEquals(
        'Should be the same as ', e.target.isSuccess(),
        window.location.href.toLowerCase().indexOf('file:') == 0);
    count++;
  });

  var inSend = true;
  x.send('relative');
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendRelativeUriZeroStatus() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertEquals(
        'Should be the same as ', e.target.isSuccess(),
        window.location.href.toLowerCase().indexOf('file:') == 0);
    count++;
  });

  var inSend = true;
  x.send(goog.Uri.parse('relative'));
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendHttpZeroStatusFailure() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertFalse('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send('http://foo');
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendHttpUpperZeroStatusFailure() {
  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertFalse('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send('HTTP://foo');
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendHttpUpperUriZeroStatusFailure() {
  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertFalse('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send(goog.Uri.parse('HTTP://foo'));
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendHttpUriZeroStatusFailure() {
  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertFalse('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send(goog.Uri.parse('http://foo'));
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendHttpUriZeroStatusFailure() {
  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertFalse('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send(goog.Uri.parse('HTTP://foo'));
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendHttpsZeroStatusFailure() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertFalse('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send('https://foo');
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendFileUpperZeroStatusSuccess() {
  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertTrue('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send('FILE:///foo');
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendFileUriZeroStatusSuccess() {
  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertTrue('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send(goog.Uri.parse('file:///foo'));
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendDummyUriZeroStatusSuccess() {
  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertTrue('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send(goog.Uri.parse('dummy:///foo'));
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendFileUpperUriZeroStatusSuccess() {
  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertFalse('Should not fire complete from inside send', inSend);
    assertTrue('Should not be succesful', e.target.isSuccess());
    count++;
  });

  var inSend = true;
  x.send(goog.Uri.parse('FILE:///foo'));
  lastMockXmlHttp.status = 0;
  inSend = false;

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testSendFromListener() {
  MockXmlHttp.syncSend = true;
  var count = 0;

  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    count++;

    var e = assertThrows(function() { x.send('url2'); });
    assertEquals(
        '[goog.net.XhrIo] Object is active with another request=url' +
            '; newUri=url2',
        e.message);
  });

  x.send('url');

  clock.tick(1);  // callOnce(f, 0, ...)

  assertEquals('Complete should have been called once', 1, count);
}


function testStatesDuringEvents() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  MockXmlHttp.syncSend = true;

  var x = new goog.net.XhrIo;
  var readyState = goog.net.XmlHttp.ReadyState.UNINITIALIZED;
  goog.events.listen(x, goog.net.EventType.READY_STATE_CHANGE, function(e) {
    readyState++;
    assertObjectEquals(e.target, x);
    assertEquals(x.getReadyState(), readyState);
    assertTrue(x.isActive());
  });
  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    assertObjectEquals(e.target, x);
    assertTrue(x.isActive());
  });
  goog.events.listen(x, goog.net.EventType.SUCCESS, function(e) {
    assertObjectEquals(e.target, x);
    assertTrue(x.isActive());
  });
  goog.events.listen(x, goog.net.EventType.READY, function(e) {
    assertObjectEquals(e.target, x);
    assertFalse(x.isActive());
  });

  x.send('url');

  clock.tick(1);  // callOnce(f, 0, ...)
}


function testProtectEntryPointCalledOnAsyncSend() {
  MockXmlHttp.syncSend = false;

  var errorHandlerCallbackCalled = false;
  var errorHandler = new goog.debug.ErrorHandler(function() {
    errorHandlerCallbackCalled = true;
  });

  goog.net.XhrIo.protectEntryPoints(errorHandler);

  var x = new goog.net.XhrIo;
  goog.events.listen(
      x, goog.net.EventType.READY_STATE_CHANGE, function(e) { throw Error(); });

  x.send('url');
  assertThrows(function() { lastMockXmlHttp.complete(); });

  assertTrue(
      'Error handler callback should be called on async send.',
      errorHandlerCallbackCalled);
}

function testXHRIsDiposedEvenIfAListenerThrowsAnExceptionOnComplete() {
  MockXmlHttp.syncSend = false;

  var x = new goog.net.XhrIo;

  goog.events.listen(
      x, goog.net.EventType.COMPLETE, function(e) { throw Error(); }, false, x);

  x.send('url');
  assertThrows(function() { lastMockXmlHttp.complete(); });

  // The XHR should have been disposed, even though the listener threw an
  // exception.
  assertNull(x.xhr_);
}

function testDisposeInternalDoesNotAbortXhrRequestObjectWhenActiveIsFalse() {
  MockXmlHttp.syncSend = false;

  var xmlHttp = goog.net.XmlHttp;
  var abortCalled = false;
  var x = new goog.net.XhrIo;

  goog.net.XmlHttp.prototype.abort = function() { abortCalled = true; };

  goog.events.listen(x, goog.net.EventType.COMPLETE, function(e) {
    this.active_ = false;
    this.dispose();
  }, false, x);

  x.send('url');
  lastMockXmlHttp.complete();

  goog.net.XmlHttp = xmlHttp;
  assertFalse(abortCalled);
}

function testCallingAbortFromWithinAbortCallbackDoesntLoop() {
  var x = new goog.net.XhrIo;
  goog.events.listen(x, goog.net.EventType.ABORT, function(e) {
    x.abort();  // Shouldn't get a stack overflow
  });
  x.send('url');
  x.abort();
}

function testPostSetsContentTypeHeader() {
  var x = new goog.net.XhrIo;

  x.send('url', 'POST', 'content');
  var headers = lastMockXmlHttp.headers;
  assertEquals(1, goog.object.getCount(headers));
  assertEquals(
      headers[goog.net.XhrIo.CONTENT_TYPE_HEADER],
      goog.net.XhrIo.FORM_CONTENT_TYPE);
}

function testNonPostSetsContentTypeHeader() {
  var x = new goog.net.XhrIo;

  x.send('url', 'PUT', 'content');
  headers = lastMockXmlHttp.headers;
  assertEquals(1, goog.object.getCount(headers));
  assertEquals(
      headers[goog.net.XhrIo.CONTENT_TYPE_HEADER],
      goog.net.XhrIo.FORM_CONTENT_TYPE);
}

function testContentTypeIsTreatedCaseInsensitively() {
  var x = new goog.net.XhrIo;

  x.send('url', 'POST', 'content', {'content-type': 'testing'});

  assertObjectEquals(
      'Headers should not be modified since they already contain a ' +
          'content type definition',
      {'content-type': 'testing'}, lastMockXmlHttp.headers);
}

function testIsContentTypeHeader_() {
  assertTrue(goog.net.XhrIo.isContentTypeHeader_('content-type'));
  assertTrue(goog.net.XhrIo.isContentTypeHeader_('Content-type'));
  assertTrue(goog.net.XhrIo.isContentTypeHeader_('CONTENT-TYPE'));
  assertTrue(goog.net.XhrIo.isContentTypeHeader_('Content-Type'));
  assertFalse(goog.net.XhrIo.isContentTypeHeader_('Content Type'));
}

function testPostFormDataDoesNotSetContentTypeHeader() {
  function FakeFormData() {}

  propertyReplacer.set(goog.global, 'FormData', FakeFormData);

  var x = new goog.net.XhrIo;
  x.send('url', 'POST', new FakeFormData());
  var headers = lastMockXmlHttp.headers;
  assertTrue(goog.object.isEmpty(headers));
}

function testNonPostFormDataDoesNotSetContentTypeHeader() {
  function FakeFormData() {}

  propertyReplacer.set(goog.global, 'FormData', FakeFormData);

  var x = new goog.net.XhrIo;
  x.send('url', 'PUT', new FakeFormData());
  headers = lastMockXmlHttp.headers;
  assertTrue(goog.object.isEmpty(headers));
}

function testFactoryInjection() {
  var xhr = new MockXmlHttp();
  var optionsFactoryCalled = 0;
  var xhrFactoryCalled = 0;
  var wrapperFactory = new goog.net.WrapperXmlHttpFactory(
      function() {
        xhrFactoryCalled++;
        return xhr;
      },
      function() {
        optionsFactoryCalled++;
        return {};
      });
  var xhrIo = new goog.net.XhrIo(wrapperFactory);

  xhrIo.send('url');

  assertEquals('XHR factory should have been called', 1, xhrFactoryCalled);
  assertEquals(
      'Options factory should have been called', 1, optionsFactoryCalled);
}

function testGoogTestingNetXhrIoIsInSync() {
  var xhrIo = new goog.net.XhrIo();
  var testingXhrIo = new goog.testing.net.XhrIo();

  var propertyComparator = function(value, key, obj) {
    if (goog.string.endsWith(key, '_')) {
      // Ignore private properties/methods
      return true;
    } else if (typeof value == 'function' && typeof this[key] != 'function') {
      // Only type check is sufficient for functions
      fail(
          'Mismatched property:' + key + ': goog.net.XhrIo has:<' + value +
          '>; while goog.testing.net.XhrIo has:<' + this[key] + '>');
      return true;
    } else {
      // Ignore all other type of properties.
      return true;
    }
  };

  goog.object.every(xhrIo, propertyComparator, testingXhrIo);
}

function testEntryPointRegistry() {
  var monitor = new goog.debug.EntryPointMonitor();
  var replacement = function() {};
  monitor.wrap =
      goog.testing.recordFunction(goog.functions.constant(replacement));

  goog.debug.entryPointRegistry.monitorAll(monitor);
  assertTrue(monitor.wrap.getCallCount() >= 1);
  assertEquals(
      replacement, goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_);
}

function testSetWithCredentials() {
  // Test on XHR objects that don't have the withCredentials property (older
  // browsers).
  var x = new goog.net.XhrIo;
  x.setWithCredentials(true);
  x.send('url');
  assertFalse(
      'withCredentials should not be set on an XHR object if the property ' +
          'does not exist.',
      goog.object.containsKey(lastMockXmlHttp, 'withCredentials'));

  // Test on XHR objects that have the withCredentials property.
  MockXmlHttp.prototype.withCredentials = false;
  x = new goog.net.XhrIo;
  x.setWithCredentials(true);
  x.send('url');
  assertTrue(
      'withCredentials should be set on an XHR object if the property exists',
      goog.object.containsKey(lastMockXmlHttp, 'withCredentials'));

  assertTrue(
      'withCredentials value not set on XHR object',
      lastMockXmlHttp.withCredentials);

  // Reset the prototype so it does not effect other tests.
  delete MockXmlHttp.prototype.withCredentials;
}

function testSetProgressEventsEnabled() {
  // The default MockXhr object contained by the XhrIo object has no
  // reference to the necessary onprogress field. This is equivalent
  // to a browser which does not support progress events.
  var progressNotSupported = new goog.net.XhrIo;
  progressNotSupported.setProgressEventsEnabled(true);
  assertTrue(progressNotSupported.getProgressEventsEnabled());
  progressNotSupported.send('url');
  assertUndefined(
      'Progress is not supported for downloads on this request.',
      progressNotSupported.xhr_.onprogress);
  assertUndefined(
      'Progress is not supported for uploads on this request.',
      progressNotSupported.xhr_.upload.onprogress);

  // The following tests will include the necessary onprogress fields
  // indicating progress events are supported.
  MockXmlHttp.prototype.onprogress = null;

  var progressDisabled = new goog.net.XhrIo;
  progressDisabled.setProgressEventsEnabled(false);
  assertFalse(progressDisabled.getProgressEventsEnabled());
  progressDisabled.send('url');
  assertNull(
      'No progress handler should be set for downloads.',
      progressDisabled.xhr_.onprogress);
  assertUndefined(
      'No progress handler should be set for uploads.',
      progressDisabled.xhr_.upload.onprogress);

  var progressEnabled = new goog.net.XhrIo;
  progressEnabled.setProgressEventsEnabled(true);
  assertTrue(progressEnabled.getProgressEventsEnabled());
  progressEnabled.send('url');
  assertTrue(
      'Progress handler should be set for downloads.',
      goog.isFunction(progressEnabled.xhr_.onprogress));
  assertTrue(
      'Progress handler should be set for uploads.',
      goog.isFunction(progressEnabled.xhr_.upload.onprogress));

  // Clean-up.
  delete MockXmlHttp.prototype.onprogress;
}


function testGetResponse() {
  var x = new goog.net.XhrIo;

  // No XHR yet
  assertEquals(null, x.getResponse());

  // XHR with no .response and no response type, gets text.
  x.xhr_ = {};
  x.xhr_.responseText = 'text';
  assertEquals('text', x.getResponse());

  // Response type of text gets text as well.
  x.setResponseType(goog.net.XhrIo.ResponseType.TEXT);
  x.xhr_.responseText = '';
  assertEquals('', x.getResponse());

  // Response type of array buffer gets the array buffer.
  x.xhr_.mozResponseArrayBuffer = 'ab';
  x.setResponseType(goog.net.XhrIo.ResponseType.ARRAY_BUFFER);
  assertEquals('ab', x.getResponse());

  // With a response field, it is returned no matter what value it has.
  x.xhr_.response = undefined;
  assertEquals(undefined, x.getResponse());

  x.xhr_.response = null;
  assertEquals(null, x.getResponse());

  x.xhr_.response = '';
  assertEquals('', x.getResponse());

  x.xhr_.response = 'resp';
  assertEquals('resp', x.getResponse());
}

function testGetResponseHeaders() {
  var x = new goog.net.XhrIo();

  // No XHR yet
  assertEquals(0, goog.object.getCount(x.getResponseHeaders()));

  // Simulate an XHR with 2 headers.
  var headersRaw = 'test1: foo\r\ntest2: bar';

  propertyReplacer.set(
      x, 'getAllResponseHeaders', goog.functions.constant(headersRaw));

  var headers = x.getResponseHeaders();
  assertEquals(2, goog.object.getCount(headers));
  assertEquals('foo', headers['test1']);
  assertEquals('bar', headers['test2']);
}

function testGetResponseHeadersWithColonInValue() {
  var x = new goog.net.XhrIo();

  // Simulate an XHR with a colon in the http header value.
  var headersRaw = 'test1: f:o:o';

  propertyReplacer.set(
      x, 'getAllResponseHeaders', goog.functions.constant(headersRaw));

  var headers = x.getResponseHeaders();
  assertEquals(1, goog.object.getCount(headers));
  assertEquals('f:o:o', headers['test1']);
}

function testGetResponseHeadersMultipleValuesForOneKey() {
  var x = new goog.net.XhrIo();

  // No XHR yet
  assertEquals(0, goog.object.getCount(x.getResponseHeaders()));

  // Simulate an XHR with 2 headers.
  var headersRaw = 'test1: foo\r\ntest1: bar';

  propertyReplacer.set(
      x, 'getAllResponseHeaders', goog.functions.constant(headersRaw));

  var headers = x.getResponseHeaders();
  assertEquals(1, goog.object.getCount(headers));
  assertEquals('foo, bar', headers['test1']);
}

function testGetResponseHeadersEmptyHeader() {
  var x = new goog.net.XhrIo();

  // No XHR yet
  assertEquals(0, goog.object.getCount(x.getResponseHeaders()));

  // Simulate an XHR with 2 headers, the last of which is empty.
  var headersRaw = 'test2: bar\r\n';

  propertyReplacer.set(
      x, 'getAllResponseHeaders', goog.functions.constant(headersRaw));

  var headers = x.getResponseHeaders();
  assertEquals(1, goog.object.getCount(headers));
  assertEquals('bar', headers['test2']);
}
