// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.BrowserChannelTest');
goog.setTestOnly('goog.net.BrowserChannelTest');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.functions');
goog.require('goog.json');
goog.require('goog.net.BrowserChannel');
goog.require('goog.net.ChannelDebug');
goog.require('goog.net.ChannelRequest');
goog.require('goog.net.tmpnetwork');
goog.require('goog.structs.Map');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


/**
 * Delay between a network failure and the next network request.
 */
var RETRY_TIME = 1000;


/**
 * A really long time - used to make sure no more timeouts will fire.
 */
var ALL_DAY_MS = 1000 * 60 * 60 * 24;

var stubs = new goog.testing.PropertyReplacer();

var browserChannel;
var deliveredMaps;
var handler;
var mockClock;
var gotError;
var numStatEvents;
var lastStatEvent;
var numTimingEvents;
var lastPostSize;
var lastPostRtt;
var lastPostRetryCount;

// Set to true to see the channel debug output in the browser window.
var debug = false;
// Debug message to print out when debug is true.
var debugMessage = '';

function debugToWindow(message) {
  if (debug) {
    debugMessage += message + '<br>';
    goog.dom.getElement('debug').innerHTML = debugMessage;
  }
}


/**
 * Stubs goog.net.tmpnetwork to always time out. It maintains the
 * contract given by goog.net.tmpnetwork.testGoogleCom, but always
 * times out (calling callback(false)).
 *
 * stubTmpnetwork should be called in tests that require it before
 * a call to testGoogleCom happens. It is reset at tearDown.
 */
function stubTmpnetwork() {
  stubs.set(
      goog.net.tmpnetwork, 'testLoadImage', function(url, timeout, callback) {
        goog.Timer.callOnce(goog.partial(callback, false), timeout);
      });
}



/**
 * Mock ChannelRequest.
 * @constructor
 */
var MockChannelRequest = function(
    channel, channelDebug, opt_sessionId, opt_requestId, opt_retryId) {
  this.channel_ = channel;
  this.channelDebug_ = channelDebug;
  this.sessionId_ = opt_sessionId;
  this.requestId_ = opt_requestId;
  this.successful_ = true;
  this.lastError_ = null;
  this.lastStatusCode_ = 200;

  // For debugging, keep track of whether this is a back or forward channel.
  this.isBack = !!(opt_requestId == 'rpc');
  this.isForward = !this.isBack;
};

MockChannelRequest.prototype.postData_ = null;

MockChannelRequest.prototype.requestStartTime_ = null;

MockChannelRequest.prototype.setExtraHeaders = function(extraHeaders) {};

MockChannelRequest.prototype.setTimeout = function(timeout) {};

MockChannelRequest.prototype.setReadyStateChangeThrottle = function(throttle) {
};

MockChannelRequest.prototype.xmlHttpPost = function(
    uri, postData, decodeChunks) {
  this.channelDebug_.debug(
      '---> POST: ' + uri + ', ' + postData + ', ' + decodeChunks);
  this.postData_ = postData;
  this.requestStartTime_ = goog.now();
};

MockChannelRequest.prototype.xmlHttpGet = function(
    uri, decodeChunks, opt_noClose) {
  this.channelDebug_.debug(
      '<--- GET: ' + uri + ', ' + decodeChunks + ', ' + opt_noClose);
  this.requestStartTime_ = goog.now();
};

MockChannelRequest.prototype.tridentGet = function(uri, usingSecondaryDomain) {
  this.channelDebug_.debug('<---GET (T): ' + uri);
  this.requestStartTime_ = goog.now();
};

MockChannelRequest.prototype.sendUsingImgTag = function(uri) {
  this.requestStartTime_ = goog.now();
};

MockChannelRequest.prototype.cancel = function() {
  this.successful_ = false;
};

MockChannelRequest.prototype.getSuccess = function() {
  return this.successful_;
};

MockChannelRequest.prototype.getLastError = function() {
  return this.lastError_;
};

MockChannelRequest.prototype.getLastStatusCode = function() {
  return this.lastStatusCode_;
};

MockChannelRequest.prototype.getSessionId = function() {
  return this.sessionId_;
};

MockChannelRequest.prototype.getRequestId = function() {
  return this.requestId_;
};

MockChannelRequest.prototype.getPostData = function() {
  return this.postData_;
};

MockChannelRequest.prototype.getRequestStartTime = function() {
  return this.requestStartTime_;
};


function setUpPage() {
  // Use our MockChannelRequests instead of the real ones.
  goog.net.BrowserChannel.createChannelRequest = function(
      channel, channelDebug, opt_sessionId, opt_requestId, opt_retryId) {
    return new MockChannelRequest(
        channel, channelDebug, opt_sessionId, opt_requestId, opt_retryId);
  };

  // Mock out the stat notification code.
  goog.net.BrowserChannel.notifyStatEvent = function(stat) {
    numStatEvents++;
    lastStatEvent = stat;
  };

  goog.net.BrowserChannel.notifyTimingEvent = function(size, rtt, retries) {
    numTimingEvents++;
    lastPostSize = size;
    lastPostRtt = rtt;
    lastPostRetryCount = retries;
  };
}


function setUp() {
  numTimingEvents = 0;
  lastPostSize = null;
  lastPostRtt = null;
  lastPostRetryCount = null;

  mockClock = new goog.testing.MockClock(true);
  browserChannel = new goog.net.BrowserChannel('1');
  gotError = false;

  handler = new goog.net.BrowserChannel.Handler();
  handler.channelOpened = function() {};
  handler.channelError = function(channel, error) { gotError = true; };
  handler.channelSuccess = function(channel, maps) {
    deliveredMaps = goog.array.clone(maps);
  };
  handler.channelClosed = function(
      channel, opt_pendingMaps, opt_undeliveredMaps) {
    // Mock out the handler, and let it set a formatted user readable string
    // of the undelivered maps which we can use when verifying our assertions.
    if (opt_pendingMaps) {
      this.pendingMapsString = formatArrayOfMaps(opt_pendingMaps);
    }
    if (opt_undeliveredMaps) {
      this.undeliveredMapsString = formatArrayOfMaps(opt_undeliveredMaps);
    }
  };
  handler.channelHandleMultipleArrays = function() {};
  handler.channelHandleArray = function() {};

  browserChannel.setHandler(handler);

  // Provide a predictable retry time for testing.
  browserChannel.getRetryTime_ = function(retryCount) { return RETRY_TIME; };

  var channelDebug = new goog.net.ChannelDebug();
  channelDebug.debug = function(message) { debugToWindow(message); };
  browserChannel.setChannelDebug(channelDebug);

  numStatEvents = 0;
  lastStatEvent = null;
}


function tearDown() {
  mockClock.dispose();
  stubs.reset();
  debugToWindow('<hr>');
}


/**
 * Helper function to return a formatted string representing an array of maps.
 */
function formatArrayOfMaps(arrayOfMaps) {
  var result = [];
  for (var i = 0; i < arrayOfMaps.length; i++) {
    var map = arrayOfMaps[i];
    var keys = map.map.getKeys();
    for (var j = 0; j < keys.length; j++) {
      var tmp = keys[j] + ':' + map.map.get(keys[j]) +
          (map.context ? ':' + map.context : '');
      result.push(tmp);
    }
  }
  return result.join(', ');
}


function testFormatArrayOfMaps() {
  // This function is used in a non-trivial test, so let's verify that it works.
  var map1 = new goog.structs.Map();
  map1.set('k1', 'v1');
  map1.set('k2', 'v2');
  var map2 = new goog.structs.Map();
  map2.set('k3', 'v3');
  var map3 = new goog.structs.Map();
  map3.set('k4', 'v4');
  map3.set('k5', 'v5');
  map3.set('k6', 'v6');

  // One map.
  var a = [];
  a.push(new goog.net.BrowserChannel.QueuedMap(0, map1));
  assertEquals('k1:v1, k2:v2', formatArrayOfMaps(a));

  // Many maps.
  var b = [];
  b.push(new goog.net.BrowserChannel.QueuedMap(0, map1));
  b.push(new goog.net.BrowserChannel.QueuedMap(0, map2));
  b.push(new goog.net.BrowserChannel.QueuedMap(0, map3));
  assertEquals(
      'k1:v1, k2:v2, k3:v3, k4:v4, k5:v5, k6:v6', formatArrayOfMaps(b));

  // One map with a context.
  var c = [];
  c.push(new goog.net.BrowserChannel.QueuedMap(0, map1, 'c1'));
  assertEquals('k1:v1:c1, k2:v2:c1', formatArrayOfMaps(c));
}


function connectForwardChannel(
    opt_serverVersion, opt_hostPrefix, opt_uriPrefix) {
  var uriPrefix = opt_uriPrefix || '';
  browserChannel.connect(uriPrefix + '/test', uriPrefix + '/bind', null);
  mockClock.tick(0);
  completeTestConnection();
  completeForwardChannel(opt_serverVersion, opt_hostPrefix);
}


function connect(opt_serverVersion, opt_hostPrefix, opt_uriPrefix) {
  connectForwardChannel(opt_serverVersion, opt_hostPrefix, opt_uriPrefix);
  completeBackChannel();
}


function disconnect() {
  browserChannel.disconnect();
  mockClock.tick(0);
}


function completeTestConnection() {
  completeForwardTestConnection();
  completeBackTestConnection();
  assertEquals(
      goog.net.BrowserChannel.State.OPENING, browserChannel.getState());
}


function completeForwardTestConnection() {
  browserChannel.connectionTest_.onRequestData(
      browserChannel.connectionTest_, '["b"]');
  browserChannel.connectionTest_.onRequestComplete(
      browserChannel.connectionTest_);
  mockClock.tick(0);
}


function completeBackTestConnection() {
  browserChannel.connectionTest_.onRequestData(
      browserChannel.connectionTest_, '11111');
  mockClock.tick(0);
}


function completeForwardChannel(opt_serverVersion, opt_hostPrefix) {
  var responseData = '[[0,["c","1234567890ABCDEF",' +
      (opt_hostPrefix ? '"' + opt_hostPrefix + '"' : 'null') +
      (opt_serverVersion ? ',' + opt_serverVersion : '') + ']]]';
  browserChannel.onRequestData(
      browserChannel.forwardChannelRequest_, responseData);
  browserChannel.onRequestComplete(browserChannel.forwardChannelRequest_);
  mockClock.tick(0);
}


function completeBackChannel() {
  browserChannel.onRequestData(
      browserChannel.backChannelRequest_, '[[1,["foo"]]]');
  browserChannel.onRequestComplete(browserChannel.backChannelRequest_);
  mockClock.tick(0);
}


function responseVersion7() {
  browserChannel.onRequestData(
      browserChannel.forwardChannelRequest_,
      goog.net.BrowserChannel.MAGIC_RESPONSE_COOKIE);
  browserChannel.onRequestComplete(browserChannel.forwardChannelRequest_);
  mockClock.tick(0);
}

function responseNoBackchannel(lastArrayIdSentFromServer, outstandingDataSize) {
  responseData =
      goog.json.serialize([0, lastArrayIdSentFromServer, outstandingDataSize]);
  browserChannel.onRequestData(
      browserChannel.forwardChannelRequest_, responseData);
  browserChannel.onRequestComplete(browserChannel.forwardChannelRequest_);
  mockClock.tick(0);
}

function response(lastArrayIdSentFromServer, outstandingDataSize) {
  responseData =
      goog.json.serialize([1, lastArrayIdSentFromServer, outstandingDataSize]);
  browserChannel.onRequestData(
      browserChannel.forwardChannelRequest_, responseData);
  browserChannel.onRequestComplete(browserChannel.forwardChannelRequest_);
  mockClock.tick(0);
}


function receive(data) {
  browserChannel.onRequestData(
      browserChannel.backChannelRequest_, '[[1,' + data + ']]');
  browserChannel.onRequestComplete(browserChannel.backChannelRequest_);
  mockClock.tick(0);
}


function responseTimeout() {
  browserChannel.forwardChannelRequest_lastError_ =
      goog.net.ChannelRequest.Error.TIMEOUT;
  browserChannel.forwardChannelRequest_.successful_ = false;
  browserChannel.onRequestComplete(browserChannel.forwardChannelRequest_);
  mockClock.tick(0);
}


function responseRequestFailed(opt_statusCode) {
  browserChannel.forwardChannelRequest_.lastError_ =
      goog.net.ChannelRequest.Error.STATUS;
  browserChannel.forwardChannelRequest_.lastStatusCode_ = opt_statusCode || 503;
  browserChannel.forwardChannelRequest_.successful_ = false;
  browserChannel.onRequestComplete(browserChannel.forwardChannelRequest_);
  mockClock.tick(0);
}


function responseUnknownSessionId() {
  browserChannel.forwardChannelRequest_.lastError_ =
      goog.net.ChannelRequest.Error.UNKNOWN_SESSION_ID;
  browserChannel.forwardChannelRequest_.successful_ = false;
  browserChannel.onRequestComplete(browserChannel.forwardChannelRequest_);
  mockClock.tick(0);
}


function responseActiveXBlocked() {
  browserChannel.backChannelRequest_.lastError_ =
      goog.net.ChannelRequest.Error.ACTIVE_X_BLOCKED;
  browserChannel.backChannelRequest_.successful_ = false;
  browserChannel.onRequestComplete(browserChannel.backChannelRequest_);
  mockClock.tick(0);
}


function sendMap(key, value, opt_context) {
  var map = new goog.structs.Map();
  map.set(key, value);
  browserChannel.sendMap(map, opt_context);
  mockClock.tick(0);
}


function hasForwardChannel() {
  return !!browserChannel.forwardChannelRequest_;
}


function hasBackChannel() {
  return !!browserChannel.backChannelRequest_;
}


function hasDeadBackChannelTimer() {
  return goog.isDefAndNotNull(browserChannel.deadBackChannelTimerId_);
}


function assertHasForwardChannel() {
  assertTrue('Forward channel missing.', hasForwardChannel());
}


function assertHasBackChannel() {
  assertTrue('Back channel missing.', hasBackChannel());
}


function testConnect() {
  connect();
  assertEquals(goog.net.BrowserChannel.State.OPENED, browserChannel.getState());
  // If the server specifies no version, the client assumes 6
  assertEquals(6, browserChannel.channelVersion_);
  assertFalse(browserChannel.isBuffered());
}

function testConnect_backChannelEstablished() {
  connect();
  assertHasBackChannel();
}

function testConnect_withServerHostPrefix() {
  connect(undefined, 'serverHostPrefix');
  assertEquals('serverHostPrefix', browserChannel.hostPrefix_);
}

function testConnect_withClientHostPrefix() {
  handler.correctHostPrefix = function(hostPrefix) {
    return 'clientHostPrefix';
  };
  connect();
  assertEquals('clientHostPrefix', browserChannel.hostPrefix_);
}

function testConnect_overrideServerHostPrefix() {
  handler.correctHostPrefix = function(hostPrefix) {
    return 'clientHostPrefix';
  };
  connect(undefined, 'serverHostPrefix');
  assertEquals('clientHostPrefix', browserChannel.hostPrefix_);
}

function testConnect_withServerVersion() {
  connect(8);
  assertEquals(8, browserChannel.channelVersion_);
}

function testConnect_notOkToMakeRequestForTest() {
  handler.okToMakeRequest =
      goog.functions.constant(goog.net.BrowserChannel.Error.NETWORK);
  browserChannel.connect('/test', '/bind', null);
  mockClock.tick(0);
  assertEquals(goog.net.BrowserChannel.State.CLOSED, browserChannel.getState());
}

function testConnect_notOkToMakeRequestForBind() {
  browserChannel.connect('/test', '/bind', null);
  mockClock.tick(0);
  completeTestConnection();
  handler.okToMakeRequest =
      goog.functions.constant(goog.net.BrowserChannel.Error.NETWORK);
  completeForwardChannel();
  assertEquals(goog.net.BrowserChannel.State.CLOSED, browserChannel.getState());
}


function testSendMap() {
  connect();
  assertEquals(1, numTimingEvents);
  sendMap('foo', 'bar');
  responseVersion7();
  assertEquals(2, numTimingEvents);
  assertEquals('foo:bar', formatArrayOfMaps(deliveredMaps));
}


function testSendMap_twice() {
  connect();
  sendMap('foo1', 'bar1');
  responseVersion7();
  assertEquals('foo1:bar1', formatArrayOfMaps(deliveredMaps));
  sendMap('foo2', 'bar2');
  responseVersion7();
  assertEquals('foo2:bar2', formatArrayOfMaps(deliveredMaps));
}


function testSendMap_andReceive() {
  connect();
  sendMap('foo', 'bar');
  responseVersion7();
  receive('["the server reply"]');
}


function testReceive() {
  connect();
  receive('["message from server"]');
  assertHasBackChannel();
}


function testReceive_twice() {
  connect();
  receive('["message one from server"]');
  receive('["message two from server"]');
  assertHasBackChannel();
}


function testReceive_andSendMap() {
  connect();
  receive('["the server reply"]');
  sendMap('foo', 'bar');
  responseVersion7();
  assertHasBackChannel();
}


function testBackChannelRemainsEstablished_afterSingleSendMap() {
  connect();

  sendMap('foo', 'bar');
  responseVersion7();
  receive('["ack"]');

  assertHasBackChannel();
}


function testBackChannelRemainsEstablished_afterDoubleSendMap() {
  connect();

  sendMap('foo1', 'bar1');
  sendMap('foo2', 'bar2');
  responseVersion7();
  receive('["ack"]');

  // This assertion would fail prior to CL 13302660.
  assertHasBackChannel();
}


function testTimingEvent() {
  connect();
  assertEquals(1, numTimingEvents);
  sendMap('', '');
  assertEquals(1, numTimingEvents);
  mockClock.tick(20);
  var expSize = browserChannel.forwardChannelRequest_.getPostData().length;
  responseVersion7();

  assertEquals(2, numTimingEvents);
  assertEquals(expSize, lastPostSize);
  assertEquals(20, lastPostRtt);
  assertEquals(0, lastPostRetryCount);

  sendMap('abcdefg', '123456');
  expSize = browserChannel.forwardChannelRequest_.getPostData().length;
  responseTimeout();
  assertEquals(2, numTimingEvents);
  mockClock.tick(RETRY_TIME + 1);
  responseVersion7();
  assertEquals(3, numTimingEvents);
  assertEquals(expSize, lastPostSize);
  assertEquals(1, lastPostRetryCount);
  assertEquals(1, lastPostRtt);
}


/**
 * Make sure that dropping the forward channel retry limit below the retry count
 * reports an error, and prevents another request from firing.
 */
function testSetFailFastWhileWaitingForRetry() {
  stubTmpnetwork();

  connect();
  assertEquals(1, numTimingEvents);

  sendMap('foo', 'bar');
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNotNull(browserChannel.forwardChannelRequest_);
  assertEquals(0, browserChannel.forwardChannelRetryCount_);

  // Watchdog timeout.
  responseTimeout();
  assertNotNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(1, browserChannel.forwardChannelRetryCount_);

  // Almost finish the between-retry timeout.
  mockClock.tick(RETRY_TIME - 1);
  assertNotNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(1, browserChannel.forwardChannelRetryCount_);

  // Setting max retries to 0 should cancel the timer and raise an error.
  browserChannel.setFailFast(true);
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(1, browserChannel.forwardChannelRetryCount_);

  assertTrue(gotError);
  assertEquals(0, deliveredMaps.length);
  // We get the error immediately before starting to ping google.com.
  // Simulate that timing out. We should get a network error in addition to the
  // initial failure.
  gotError = false;
  mockClock.tick(goog.net.tmpnetwork.GOOGLECOM_TIMEOUT);
  assertTrue('No error after tmpnetwork ping timed out.', gotError);

  // Make sure no more retry timers are firing.
  mockClock.tick(ALL_DAY_MS);
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(1, browserChannel.forwardChannelRetryCount_);
  assertEquals(1, numTimingEvents);
}


/**
 * Make sure that dropping the forward channel retry limit below the retry count
 * reports an error, and prevents another request from firing.
 */
function testSetFailFastWhileRetryXhrIsInFlight() {
  stubTmpnetwork();

  connect();
  assertEquals(1, numTimingEvents);

  sendMap('foo', 'bar');
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNotNull(browserChannel.forwardChannelRequest_);
  assertEquals(0, browserChannel.forwardChannelRetryCount_);

  // Watchdog timeout.
  responseTimeout();
  assertNotNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(1, browserChannel.forwardChannelRetryCount_);

  // Wait for the between-retry timeout.
  mockClock.tick(RETRY_TIME);
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNotNull(browserChannel.forwardChannelRequest_);
  assertEquals(1, browserChannel.forwardChannelRetryCount_);

  // Simulate a second watchdog timeout.
  responseTimeout();
  assertNotNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(2, browserChannel.forwardChannelRetryCount_);

  // Wait for another between-retry timeout.
  mockClock.tick(RETRY_TIME);
  // Now the third req is in flight.
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNotNull(browserChannel.forwardChannelRequest_);
  assertEquals(2, browserChannel.forwardChannelRetryCount_);

  // Set fail fast, killing the request
  browserChannel.setFailFast(true);
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(2, browserChannel.forwardChannelRetryCount_);

  assertTrue(gotError);
  // We get the error immediately before starting to ping google.com.
  // Simulate that timing out. We should get a network error in addition to the
  gotError = false;
  mockClock.tick(goog.net.tmpnetwork.GOOGLECOM_TIMEOUT);
  assertTrue('No error after tmpnetwork ping timed out.', gotError);

  // Make sure no more retry timers are firing.
  mockClock.tick(ALL_DAY_MS);
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(2, browserChannel.forwardChannelRetryCount_);
  assertEquals(1, numTimingEvents);
}


/**
 * Makes sure that setting fail fast while not retrying doesn't cause a failure.
 */
function testSetFailFastAtRetryCount() {
  stubTmpnetwork();

  connect();
  assertEquals(1, numTimingEvents);

  sendMap('foo', 'bar');
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNotNull(browserChannel.forwardChannelRequest_);
  assertEquals(0, browserChannel.forwardChannelRetryCount_);

  // Set fail fast.
  browserChannel.setFailFast(true);
  // Request should still be alive.
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNotNull(browserChannel.forwardChannelRequest_);
  assertEquals(0, browserChannel.forwardChannelRetryCount_);

  // Watchdog timeout. Now we should get an error.
  responseTimeout();
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(0, browserChannel.forwardChannelRetryCount_);

  assertTrue(gotError);
  // We get the error immediately before starting to ping google.com.
  // Simulate that timing out. We should get a network error in addition to the
  // initial failure.
  gotError = false;
  mockClock.tick(goog.net.tmpnetwork.GOOGLECOM_TIMEOUT);
  assertTrue('No error after tmpnetwork ping timed out.', gotError);

  // Make sure no more retry timers are firing.
  mockClock.tick(ALL_DAY_MS);
  assertNull(browserChannel.forwardChannelTimerId_);
  assertNull(browserChannel.forwardChannelRequest_);
  assertEquals(0, browserChannel.forwardChannelRetryCount_);
  assertEquals(1, numTimingEvents);
}


function testRequestFailedClosesChannel() {
  stubTmpnetwork();

  connect();
  assertEquals(1, numTimingEvents);

  sendMap('foo', 'bar');
  responseRequestFailed();

  assertEquals(
      'Should be closed immediately after request failed.',
      goog.net.BrowserChannel.State.CLOSED, browserChannel.getState());

  mockClock.tick(goog.net.tmpnetwork.GOOGLECOM_TIMEOUT);

  assertEquals(
      'Should remain closed after the ping timeout.',
      goog.net.BrowserChannel.State.CLOSED, browserChannel.getState());
  assertEquals(1, numTimingEvents);
}


function testStatEventReportedOnlyOnce() {
  stubTmpnetwork();

  connect();
  sendMap('foo', 'bar');
  numStatEvents = 0;
  lastStatEvent = null;
  responseUnknownSessionId();

  assertEquals(1, numStatEvents);
  assertEquals(goog.net.BrowserChannel.Stat.ERROR_OTHER, lastStatEvent);

  numStatEvents = 0;
  mockClock.tick(goog.net.tmpnetwork.GOOGLECOM_TIMEOUT);
  assertEquals('No new stat events should be reported.', 0, numStatEvents);
}


function testActiveXBlockedEventReportedOnlyOnce() {
  stubTmpnetwork();

  connectForwardChannel();
  numStatEvents = 0;
  lastStatEvent = null;
  responseActiveXBlocked();

  assertEquals(1, numStatEvents);
  assertEquals(goog.net.BrowserChannel.Stat.ERROR_OTHER, lastStatEvent);

  mockClock.tick(goog.net.tmpnetwork.GOOGLECOM_TIMEOUT);
  assertEquals('No new stat events should be reported.', 1, numStatEvents);
}


function testStatEventReportedOnlyOnce_onNetworkUp() {
  stubTmpnetwork();

  connect();
  sendMap('foo', 'bar');
  numStatEvents = 0;
  lastStatEvent = null;
  responseRequestFailed();

  assertEquals(
      'No stat event should be reported before we know the reason.', 0,
      numStatEvents);

  // Let the ping time out.
  mockClock.tick(goog.net.tmpnetwork.GOOGLECOM_TIMEOUT);

  // Assert we report the correct stat event.
  assertEquals(1, numStatEvents);
  assertEquals(goog.net.BrowserChannel.Stat.ERROR_NETWORK, lastStatEvent);
}


function testStatEventReportedOnlyOnce_onNetworkDown() {
  stubTmpnetwork();

  connect();
  sendMap('foo', 'bar');
  numStatEvents = 0;
  lastStatEvent = null;
  responseRequestFailed();

  assertEquals(
      'No stat event should be reported before we know the reason.', 0,
      numStatEvents);

  // Wait half the ping timeout period, and then fake the network being up.
  mockClock.tick(goog.net.tmpnetwork.GOOGLECOM_TIMEOUT / 2);
  browserChannel.testGoogleComCallback_(true);

  // Assert we report the correct stat event.
  assertEquals(1, numStatEvents);
  assertEquals(goog.net.BrowserChannel.Stat.ERROR_OTHER, lastStatEvent);
}


function testOutgoingMapsAwaitsResponse() {
  connect();
  assertEquals(0, browserChannel.outgoingMaps_.length);

  sendMap('foo1', 'bar');
  assertEquals(0, browserChannel.outgoingMaps_.length);
  sendMap('foo2', 'bar');
  assertEquals(1, browserChannel.outgoingMaps_.length);
  sendMap('foo3', 'bar');
  assertEquals(2, browserChannel.outgoingMaps_.length);
  sendMap('foo4', 'bar');
  assertEquals(3, browserChannel.outgoingMaps_.length);

  responseVersion7();
  // Now the forward channel request is completed and a new started, so all maps
  // are dequeued from the array of outgoing maps into this new forward request.
  assertEquals(0, browserChannel.outgoingMaps_.length);
}


function testUndeliveredMaps_doesNotNotifyWhenSuccessful() {
  handler.channelClosed = function(
      channel, opt_pendingMaps, opt_undeliveredMaps) {
    if (opt_pendingMaps || opt_undeliveredMaps) {
      fail('No pending or undelivered maps should be reported.');
    }
  };

  connect();
  sendMap('foo1', 'bar1');
  responseVersion7();
  sendMap('foo2', 'bar2');
  responseVersion7();
  disconnect();
}


function testUndeliveredMaps_doesNotNotifyIfNothingWasSent() {
  handler.channelClosed = function(
      channel, opt_pendingMaps, opt_undeliveredMaps) {
    if (opt_pendingMaps || opt_undeliveredMaps) {
      fail('No pending or undelivered maps should be reported.');
    }
  };

  connect();
  mockClock.tick(ALL_DAY_MS);
  disconnect();
}


function testUndeliveredMaps_clearsPendingMapsAfterNotifying() {
  connect();
  sendMap('foo1', 'bar1');
  sendMap('foo2', 'bar2');
  sendMap('foo3', 'bar3');

  assertEquals(1, browserChannel.pendingMaps_.length);
  assertEquals(2, browserChannel.outgoingMaps_.length);

  disconnect();

  assertEquals(0, browserChannel.pendingMaps_.length);
  assertEquals(0, browserChannel.outgoingMaps_.length);
}


function testUndeliveredMaps_notifiesWithContext() {
  connect();

  // First send two messages that succeed.
  sendMap('foo1', 'bar1', 'context1');
  responseVersion7();
  sendMap('foo2', 'bar2', 'context2');
  responseVersion7();

  // Pretend the server hangs and no longer responds.
  sendMap('foo3', 'bar3', 'context3');
  sendMap('foo4', 'bar4', 'context4');
  sendMap('foo5', 'bar5', 'context5');

  // Give up.
  disconnect();

  // Assert that we are informed of any undelivered messages; both about
  // #3 that was sent but which we don't know if the server received, and
  // #4 and #5 which remain in the outgoing maps and have not yet been sent.
  assertEquals('foo3:bar3:context3', handler.pendingMapsString);
  assertEquals(
      'foo4:bar4:context4, foo5:bar5:context5', handler.undeliveredMapsString);
}


function testUndeliveredMaps_serviceUnavailable() {
  // Send a few maps, and let one fail.
  connect();
  sendMap('foo1', 'bar1');
  responseVersion7();
  sendMap('foo2', 'bar2');
  responseRequestFailed();

  // After a failure, the channel should be closed.
  disconnect();

  assertEquals('foo2:bar2', handler.pendingMapsString);
  assertEquals('', handler.undeliveredMapsString);
}


function testUndeliveredMaps_onPingTimeout() {
  stubTmpnetwork();

  connect();

  // Send a message.
  sendMap('foo1', 'bar1');

  // Fake REQUEST_FAILED, triggering a ping to check the network.
  responseRequestFailed();

  // Let the ping time out, unsuccessfully.
  mockClock.tick(goog.net.tmpnetwork.GOOGLECOM_TIMEOUT);

  // Assert channel is closed.
  assertEquals(goog.net.BrowserChannel.State.CLOSED, browserChannel.getState());

  // Assert that the handler is notified about the undelivered messages.
  assertEquals('foo1:bar1', handler.pendingMapsString);
  assertEquals('', handler.undeliveredMapsString);
}


function testResponseNoBackchannelPostNotBeforeBackchannel() {
  connect(8);
  sendMap('foo1', 'bar1');

  mockClock.tick(10);
  assertFalse(
      browserChannel.backChannelRequest_.getRequestStartTime() <
      browserChannel.forwardChannelRequest_.getRequestStartTime());
  responseNoBackchannel();
  assertNotEquals(
      goog.net.BrowserChannel.Stat.BACKCHANNEL_MISSING, lastStatEvent);
}


function testResponseNoBackchannel() {
  connect(8);
  sendMap('foo1', 'bar1');
  response(-1, 0);
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE + 1);
  sendMap('foo2', 'bar2');
  assertTrue(
      browserChannel.backChannelRequest_.getRequestStartTime() +
          goog.net.BrowserChannel.RTT_ESTIMATE <
      browserChannel.forwardChannelRequest_.getRequestStartTime());
  responseNoBackchannel();
  assertEquals(goog.net.BrowserChannel.Stat.BACKCHANNEL_MISSING, lastStatEvent);
}


function testResponseNoBackchannelWithNoBackchannel() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertNull(browserChannel.backChannelTimerId_);
  browserChannel.backChannelRequest_.cancel();
  browserChannel.backChannelRequest_ = null;
  responseNoBackchannel();
  assertEquals(goog.net.BrowserChannel.Stat.BACKCHANNEL_MISSING, lastStatEvent);
}


function testResponseNoBackchannelWithStartTimer() {
  connect(8);
  sendMap('foo1', 'bar1');

  browserChannel.backChannelRequest_.cancel();
  browserChannel.backChannelRequest_ = null;
  browserChannel.backChannelTimerId_ = 123;
  responseNoBackchannel();
  assertNotEquals(
      goog.net.BrowserChannel.Stat.BACKCHANNEL_MISSING, lastStatEvent);
}


function testResponseWithNoArraySent() {
  connect(8);
  sendMap('foo1', 'bar1');

  // Send a response as if the server hasn't sent down an array.
  response(-1, 0);

  // POST response with an array ID lower than our last received is OK.
  assertEquals(1, browserChannel.lastArrayId_);
  assertEquals(-1, browserChannel.lastPostResponseArrayId_);
}


function testResponseWithArraysMissing() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, browserChannel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays.
  response(7, 111);

  assertEquals(1, browserChannel.lastArrayId_);
  assertEquals(7, browserChannel.lastPostResponseArrayId_);
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE * 2);
  assertEquals(goog.net.BrowserChannel.Stat.BACKCHANNEL_DEAD, lastStatEvent);
}


function testMultipleResponsesWithArraysMissing() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, browserChannel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays.
  response(7, 111);

  assertEquals(1, browserChannel.lastArrayId_);
  assertEquals(7, browserChannel.lastPostResponseArrayId_);
  sendMap('foo2', 'bar2');
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE);
  response(8, 119);
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE);
  // The original timer should still fire.
  assertEquals(goog.net.BrowserChannel.Stat.BACKCHANNEL_DEAD, lastStatEvent);
}


function testOnlyRetryOnceBasedOnResponse() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, browserChannel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays.
  response(7, 111);

  assertEquals(1, browserChannel.lastArrayId_);
  assertEquals(7, browserChannel.lastPostResponseArrayId_);
  assertTrue(hasDeadBackChannelTimer());
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE * 2);
  assertEquals(goog.net.BrowserChannel.Stat.BACKCHANNEL_DEAD, lastStatEvent);
  assertEquals(1, browserChannel.backChannelRetryCount_);
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE);
  sendMap('foo2', 'bar2');
  assertFalse(hasDeadBackChannelTimer());
  response(8, 119);
  assertFalse(hasDeadBackChannelTimer());
}


function testResponseWithArraysMissingAndLiveChannel() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, browserChannel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays.
  response(7, 111);

  assertEquals(1, browserChannel.lastArrayId_);
  assertEquals(7, browserChannel.lastPostResponseArrayId_);
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE);
  assertTrue(hasDeadBackChannelTimer());
  receive('["ack"]');
  assertFalse(hasDeadBackChannelTimer());
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE);
  assertNotEquals(goog.net.BrowserChannel.Stat.BACKCHANNEL_DEAD, lastStatEvent);
}


function testResponseWithBigOutstandingData() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, browserChannel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays and 50kbytes.
  response(7, 50000);

  assertEquals(1, browserChannel.lastArrayId_);
  assertEquals(7, browserChannel.lastPostResponseArrayId_);
  assertFalse(hasDeadBackChannelTimer());
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE * 2);
  assertNotEquals(goog.net.BrowserChannel.Stat.BACKCHANNEL_DEAD, lastStatEvent);
}


function testResponseInBufferedMode() {
  connect(8);
  browserChannel.useChunked_ = false;
  sendMap('foo1', 'bar1');
  assertEquals(-1, browserChannel.lastPostResponseArrayId_);
  response(7, 111);

  assertEquals(1, browserChannel.lastArrayId_);
  assertEquals(7, browserChannel.lastPostResponseArrayId_);
  assertFalse(hasDeadBackChannelTimer());
  mockClock.tick(goog.net.BrowserChannel.RTT_ESTIMATE * 2);
  assertNotEquals(goog.net.BrowserChannel.Stat.BACKCHANNEL_DEAD, lastStatEvent);
}


function testResponseWithGarbage() {
  connect(8);
  sendMap('foo1', 'bar1');
  browserChannel.onRequestData(
      browserChannel.forwardChannelRequest_, 'garbage');
  assertEquals(goog.net.BrowserChannel.State.CLOSED, browserChannel.getState());
}


function testResponseWithGarbageInArray() {
  connect(8);
  sendMap('foo1', 'bar1');
  browserChannel.onRequestData(
      browserChannel.forwardChannelRequest_, '["garbage"]');
  assertEquals(goog.net.BrowserChannel.State.CLOSED, browserChannel.getState());
}


function testResponseWithEvilData() {
  connect(8);
  sendMap('foo1', 'bar1');
  browserChannel.onRequestData(
      browserChannel.forwardChannelRequest_,
      goog.net.BrowserChannel.LAST_ARRAY_ID_RESPONSE_PREFIX +
          '=<script>evil()\<\/script>&' +
          goog.net.BrowserChannel.OUTSTANDING_DATA_RESPONSE_PREFIX +
          '=<script>moreEvil()\<\/script>');
  assertEquals(goog.net.BrowserChannel.State.CLOSED, browserChannel.getState());
}


function testPathAbsolute() {
  connect(8, undefined, '/talkgadget');
  assertEquals(
      browserChannel.backChannelUri_.getDomain(), window.location.hostname);
  assertEquals(
      browserChannel.forwardChannelUri_.getDomain(), window.location.hostname);
}


function testPathRelative() {
  connect(8, undefined, 'talkgadget');
  assertEquals(
      browserChannel.backChannelUri_.getDomain(), window.location.hostname);
  assertEquals(
      browserChannel.forwardChannelUri_.getDomain(), window.location.hostname);
}


function testPathWithHost() {
  connect(8, undefined, 'https://example.com');
  assertEquals(browserChannel.backChannelUri_.getScheme(), 'https');
  assertEquals(browserChannel.backChannelUri_.getDomain(), 'example.com');
  assertEquals(browserChannel.forwardChannelUri_.getScheme(), 'https');
  assertEquals(browserChannel.forwardChannelUri_.getDomain(), 'example.com');
}

function testCreateXhrIo() {
  var xhr = browserChannel.createXhrIo(null);
  assertFalse(xhr.getWithCredentials());

  assertThrows(
      'Error connection to different host without CORS',
      goog.bind(browserChannel.createXhrIo, browserChannel, 'some_host'));

  browserChannel.setSupportsCrossDomainXhrs(true);

  xhr = browserChannel.createXhrIo(null);
  assertTrue(xhr.getWithCredentials());

  xhr = browserChannel.createXhrIo('some_host');
  assertTrue(xhr.getWithCredentials());
}

function testSetParser() {
  var recordUnsafeParse = goog.testing.recordFunction(goog.json.unsafeParse);
  var parser = {};
  parser.parse = recordUnsafeParse;
  browserChannel.setParser(parser);

  connect();
  assertEquals(3, recordUnsafeParse.getCallCount());

  var call3 = recordUnsafeParse.popLastCall();
  var call2 = recordUnsafeParse.popLastCall();
  var call1 = recordUnsafeParse.popLastCall();

  assertEquals(1, call1.getArguments().length);
  assertEquals('["b"]', call1.getArgument(0));

  assertEquals(1, call2.getArguments().length);
  assertEquals('[[0,["c","1234567890ABCDEF",null]]]', call2.getArgument(0));

  assertEquals(1, call3.getArguments().length);
  assertEquals('[[1,["foo"]]]', call3.getArgument(0));
}
