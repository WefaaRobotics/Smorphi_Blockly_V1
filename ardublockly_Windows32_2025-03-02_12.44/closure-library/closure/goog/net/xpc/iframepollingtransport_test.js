// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.xpc.IframePollingTransportTest');
goog.setTestOnly('goog.net.xpc.IframePollingTransportTest');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.functions');
goog.require('goog.net.xpc.CfgFields');
goog.require('goog.net.xpc.CrossPageChannel');
goog.require('goog.net.xpc.CrossPageChannelRole');
goog.require('goog.net.xpc.TransportTypes');
goog.require('goog.object');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var mockClock = null;
var outerChannel = null;
var innerChannel = null;

function setUp() {
  mockClock = new goog.testing.MockClock(true /* opt_autoInstall */);

  // Create the peer windows.
  var outerPeerHostName = 'https://www.youtube.com';
  var outerPeerWindow = createMockPeerWindow(outerPeerHostName);

  var innerPeerHostName = 'https://www.google.com';
  var innerPeerWindow = createMockPeerWindow(innerPeerHostName);

  // Create the channels.
  outerChannel = createChannel(
      goog.net.xpc.CrossPageChannelRole.OUTER, 'test', outerPeerHostName,
      outerPeerWindow, innerPeerHostName, innerPeerWindow);
  innerChannel = createChannel(
      goog.net.xpc.CrossPageChannelRole.INNER, 'test', innerPeerHostName,
      innerPeerWindow, outerPeerHostName, outerPeerWindow);
}


function tearDown() {
  outerChannel.dispose();
  innerChannel.dispose();
  mockClock.uninstall();
}


/** Tests that connection happens normally and callbacks are invoked. */
function testConnect() {
  var outerConnectCallback = goog.testing.recordFunction();
  var innerConnectCallback = goog.testing.recordFunction();

  // Connect the two channels.
  outerChannel.connect(outerConnectCallback);
  innerChannel.connect(innerConnectCallback);
  mockClock.tick(1000);

  // Check that channels were connected and callbacks invoked.
  assertEquals(1, outerConnectCallback.getCallCount());
  assertEquals(1, innerConnectCallback.getCallCount());
  assertTrue(outerChannel.isConnected());
  assertTrue(innerChannel.isConnected());
}


/** Tests that messages are successfully delivered to the inner peer. */
function testSend_outerToInner() {
  var serviceCallback = goog.testing.recordFunction();

  // Register a service handler in the inner channel.
  innerChannel.registerService('svc', function(payload) {
    assertEquals('hello', payload);
    serviceCallback();
  });

  // Connect the two channels.
  outerChannel.connect();
  innerChannel.connect();
  mockClock.tick(1000);

  // Send a message.
  outerChannel.send('svc', 'hello');
  mockClock.tick(1000);

  // Check that the message was handled.
  assertEquals(1, serviceCallback.getCallCount());
}


/** Tests that messages are successfully delivered to the outer peer. */
function testSend_innerToOuter() {
  var serviceCallback = goog.testing.recordFunction();

  // Register a service handler in the inner channel.
  outerChannel.registerService('svc', function(payload) {
    assertEquals('hello', payload);
    serviceCallback();
  });

  // Connect the two channels.
  outerChannel.connect();
  innerChannel.connect();
  mockClock.tick(1000);

  // Send a message.
  innerChannel.send('svc', 'hello');
  mockClock.tick(1000);

  // Check that the message was handled.
  assertEquals(1, serviceCallback.getCallCount());
}


/** Tests that closing the outer peer does not cause an error. */
function testSend_outerPeerClosed() {
  // Connect the inner channel.
  innerChannel.connect();
  mockClock.tick(1000);

  // Close the outer peer before it has a chance to connect.
  closeWindow(innerChannel.getPeerWindowObject());

  // Allow timers to execute (and fail).
  mockClock.tick(1000);
}


/** Tests that closing the inner peer does not cause an error. */
function testSend_innerPeerClosed() {
  // Connect the outer channel.
  outerChannel.connect();
  mockClock.tick(1000);

  // Close the inner peer before it has a chance to connect.
  closeWindow(outerChannel.getPeerWindowObject());

  // Allow timers to execute (and fail).
  mockClock.tick(1000);
}


/** Tests that partially closing the outer peer does not cause an error. */
function testSend_outerPeerClosing() {
  // Connect the inner channel.
  innerChannel.connect();
  mockClock.tick(1000);

  // Close the outer peer before it has a chance to connect, but
  // leave closed set to false to simulate a partially closed window.
  closeWindow(innerChannel.getPeerWindowObject());
  innerChannel.getPeerWindowObject().closed = false;

  // Allow timers to execute (and fail).
  mockClock.tick(1000);
}


/** Tests that partially closing the inner peer does not cause an error. */
function testSend_innerPeerClosing() {
  // Connect the outer channel.
  outerChannel.connect();
  mockClock.tick(1000);

  // Close the inner peer before it has a chance to connect, but
  // leave closed set to false to simulate a partially closed window.
  closeWindow(outerChannel.getPeerWindowObject());
  outerChannel.getPeerWindowObject().closed = false;

  // Allow timers to execute (and fail).
  mockClock.tick(1000);
}


/**
 * Creates a channel with the specified configuration, using frame polling.
 * @param {!goog.net.xpc.CrossPageChannelRole} role The channel role.
 * @param {string} channelName The channel name.
 * @param {string} fromHostName The host name of the window hosting the channel.
 * @param {!Object} fromWindow The window hosting the channel.
 * @param {string} toHostName The host name of the peer window.
 * @param {!Object} toWindow The peer window.
 */
function createChannel(
    role, channelName, fromHostName, fromWindow, toHostName, toWindow) {
  // Build a channel config using frame polling.
  var channelConfig = goog.object.create(
      goog.net.xpc.CfgFields.ROLE, role, goog.net.xpc.CfgFields.PEER_HOSTNAME,
      toHostName, goog.net.xpc.CfgFields.CHANNEL_NAME, channelName,
      goog.net.xpc.CfgFields.LOCAL_POLL_URI, fromHostName + '/robots.txt',
      goog.net.xpc.CfgFields.PEER_POLL_URI, toHostName + '/robots.txt',
      goog.net.xpc.CfgFields.TRANSPORT,
      goog.net.xpc.TransportTypes.IFRAME_POLLING);

  // Build the channel.
  var channel = new goog.net.xpc.CrossPageChannel(channelConfig);
  channel.setPeerWindowObject(toWindow);

  // Update the transport's getWindow, to return the correct host window.
  channel.createTransport_();
  channel.transport_.getWindow = goog.functions.constant(fromWindow);
  return channel;
}


/**
 * Creates a mock window to use as a peer. The peer window will host the frame
 * elements.
 * @param {string} url The peer window's initial URL.
 */
function createMockPeerWindow(url) {
  var mockPeer = createMockWindow(url);

  // Update the appendChild method to use a mock frame window.
  mockPeer.document.body.appendChild = function(el) {
    assertEquals(goog.dom.TagName.IFRAME, el.tagName);
    mockPeer.frames[el.name] = createMockWindow(el.src);
    mockPeer.document.body.element.appendChild(el);
  };

  return mockPeer;
}


/**
 * Creates a mock window.
 * @param {string} url The window's initial URL.
 */
function createMockWindow(url) {
  // Create the mock window, document and body.
  var mockWindow = {};
  var mockDocument = {};
  var mockBody = {};
  var mockLocation = {};

  // Configure the mock window's document body.
  mockBody.element = goog.dom.createDom(goog.dom.TagName.BODY);

  // Configure the mock window's document.
  mockDocument.body = mockBody;

  // Configure the mock window's location.
  mockLocation.href = url;
  mockLocation.replace = function(value) { mockLocation.href = value; };

  // Configure the mock window.
  mockWindow.document = mockDocument;
  mockWindow.frames = {};
  mockWindow.location = mockLocation;
  mockWindow.setTimeout = goog.Timer.callOnce;

  return mockWindow;
}


/**
 * Emulates closing the specified window by clearing frames, document and
 * location.
 */
function closeWindow(targetWindow) {
  // Close any child frame windows.
  for (var frameName in targetWindow.frames) {
    closeWindow(targetWindow.frames[frameName]);
  }

  // Clear the target window, set closed to true.
  targetWindow.closed = true;
  targetWindow.frames = null;
  targetWindow.document = null;
  targetWindow.location = null;
}
