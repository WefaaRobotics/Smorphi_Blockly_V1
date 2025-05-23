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

goog.provide('goog.net.xpc.CrossPageChannelTest');
goog.setTestOnly('goog.net.xpc.CrossPageChannelTest');

goog.require('goog.Disposable');
goog.require('goog.Promise');
goog.require('goog.Timer');
goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.labs.userAgent.browser');
goog.require('goog.log');
goog.require('goog.log.Level');
goog.require('goog.net.xpc');
goog.require('goog.net.xpc.CfgFields');
goog.require('goog.net.xpc.CrossPageChannel');
goog.require('goog.net.xpc.CrossPageChannelRole');
goog.require('goog.net.xpc.TransportTypes');
goog.require('goog.object');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');

// Set this to false when working on this test.  It needs to be true for
// automated testing, as some browsers (eg IE8) choke on the large numbers of
// iframes this test would otherwise leave active.
var CLEAN_UP_IFRAMES = true;

var IFRAME_LOAD_WAIT_MS = 1000;
var stubs = new goog.testing.PropertyReplacer();
var uniqueId = 0;
var driver;
var canAccessSameDomainIframe = true;
var accessCheckPromise = null;

function setUpPage() {
  // This test is insanely slow on IE8 for some reason.
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 20 * 1000;

  // Show debug log
  var debugDiv = goog.dom.getElement('debugDiv');
  var logger = goog.log.getLogger('goog.net.xpc');
  logger.setLevel(goog.log.Level.ALL);
  goog.log.addHandler(logger, function(logRecord) {
    var msgElm = goog.dom.createDom(goog.dom.TagName.DIV);
    msgElm.innerHTML = logRecord.getMessage();
    goog.dom.appendChild(debugDiv, msgElm);
  });

  accessCheckPromise = new goog.Promise(function(resolve, reject) {
    var accessCheckIframes = [];

    accessCheckIframes.push(
        create1x1Iframe('nonexistant', 'testdata/i_am_non_existant.html'));
    window.setTimeout(function() {
      accessCheckIframes.push(
          create1x1Iframe('existant', 'testdata/access_checker.html'));
    }, 10);

    // Called from testdata/access_checker.html
    window['sameDomainIframeAccessComplete'] = function(canAccess) {
      canAccessSameDomainIframe = canAccess;
      for (var i = 0; i < accessCheckIframes.length; i++) {
        document.body.removeChild(accessCheckIframes[i]);
      }
      resolve();
    };
  });
}


function setUp() {
  driver = new Driver();
  // Ensure that the access check is complete before starting each test.
  return accessCheckPromise;
}


function tearDown() {
  stubs.reset();
  driver.dispose();
}


function create1x1Iframe(iframeId, src) {
  var iframeAccessChecker = goog.dom.createElement(goog.dom.TagName.IFRAME);
  iframeAccessChecker.id = iframeAccessChecker.name = iframeId;
  iframeAccessChecker.style.width = iframeAccessChecker.style.height = '1px';
  iframeAccessChecker.src = src;
  document.body.insertBefore(iframeAccessChecker, document.body.firstChild);
  return iframeAccessChecker;
}


function testCreateIframeSpecifyId() {
  driver.createPeerIframe('new_iframe');

  return goog.Timer.promise(IFRAME_LOAD_WAIT_MS).then(function() {
    driver.checkPeerIframe();
  });
}


function testCreateIframeRandomId() {
  driver.createPeerIframe();

  return goog.Timer.promise(IFRAME_LOAD_WAIT_MS).then(function() {
    driver.checkPeerIframe();
  });
}


function testGetRole() {
  var cfg = {};
  cfg[goog.net.xpc.CfgFields.ROLE] = goog.net.xpc.CrossPageChannelRole.OUTER;
  var channel = new goog.net.xpc.CrossPageChannel(cfg);
  // If the configured role is ignored, this will cause the dynamicly
  // determined role to become INNER.
  channel.peerWindowObject_ = window.parent;
  assertEquals(
      'Channel should use role from the config.',
      goog.net.xpc.CrossPageChannelRole.OUTER, channel.getRole());
  channel.dispose();
}


// The following batch of tests:
// * Establishes a peer iframe
// * Connects an XPC channel between the frames
// * From the connection callback in each frame, sends an 'echo' request, and
//   expects a 'response' response.
// * Reconnects the inner frame, sends an 'echo', expects a 'response'.
// * Optionally, reconnects the outer frame, sends an 'echo', expects a
//   'response'.
// * Optionally, reconnects the inner frame, but first reconfigures it to the
//   alternate protocol version, simulating an inner frame navigation that
//   picks up a new/old version.
//
// Every valid combination of protocol versions is tested, with both single and
// double ended handshakes.  Two timing scenarios are tested per combination,
// which is what the 'reverse' parameter distinguishes.
//
// Where single sided handshake is in use, reconnection by the outer frame is
// not supported, and therefore is not tested.
//
// The only known issue migrating to V2 is that once two V2 peers have
// connected, replacing either peer with a V1 peer will not work.  Upgrading V1
// peers to v2 is supported, as is replacing the only v2 peer in a connection
// with a v1.


function testLifeCycle_v1_v1() {
  return checkLifeCycle(
      false /* oneSidedHandshake */, 1 /* innerProtocolVersion */,
      1 /* outerProtocolVersion */, true /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, false /* reverse */);
}


function testLifeCycle_v1_v1_rev() {
  return checkLifeCycle(
      false /* oneSidedHandshake */, 1 /* innerProtocolVersion */,
      1 /* outerProtocolVersion */, true /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, true /* reverse */);
}


function testLifeCycle_v1_v1_onesided() {
  return checkLifeCycle(
      true /* oneSidedHandshake */, 1 /* innerProtocolVersion */,
      1 /* outerProtocolVersion */, false /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, false /* reverse */);
}


function testLifeCycle_v1_v1_onesided_rev() {
  return checkLifeCycle(
      true /* oneSidedHandshake */, 1 /* innerProtocolVersion */,
      1 /* outerProtocolVersion */, false /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, true /* reverse */);
}


function testLifeCycle_v1_v2() {
  return checkLifeCycle(
      false /* oneSidedHandshake */, 1 /* innerProtocolVersion */,
      2 /* outerProtocolVersion */, true /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, false /* reverse */);
}


function testLifeCycle_v1_v2_rev() {
  return checkLifeCycle(
      false /* oneSidedHandshake */, 1 /* innerProtocolVersion */,
      2 /* outerProtocolVersion */, true /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, true /* reverse */);
}


function testLifeCycle_v1_v2_onesided() {
  return checkLifeCycle(
      true /* oneSidedHandshake */, 1 /* innerProtocolVersion */,
      2 /* outerProtocolVersion */, false /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, false /* reverse */);
}


function testLifeCycle_v1_v2_onesided_rev() {
  return checkLifeCycle(
      true /* oneSidedHandshake */, 1 /* innerProtocolVersion */,
      2 /* outerProtocolVersion */, false /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, true /* reverse */);
}


function testLifeCycle_v2_v1() {
  return checkLifeCycle(
      false /* oneSidedHandshake */, 2 /* innerProtocolVersion */,
      1 /* outerProtocolVersion */, true /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, false /* reverse */);
}


function testLifeCycle_v2_v1_rev() {
  return checkLifeCycle(
      false /* oneSidedHandshake */, 2 /* innerProtocolVersion */,
      1 /* outerProtocolVersion */, true /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, true /* reverse */);
}


function testLifeCycle_v2_v1_onesided() {
  return checkLifeCycle(
      true /* oneSidedHandshake */, 2 /* innerProtocolVersion */,
      1 /* outerProtocolVersion */, false /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, false /* reverse */);
}


function testLifeCycle_v2_v1_onesided_rev() {
  return checkLifeCycle(
      true /* oneSidedHandshake */, 2 /* innerProtocolVersion */,
      1 /* outerProtocolVersion */, false /* outerFrameReconnectSupported */,
      true /* innerFrameMigrationSupported */, true /* reverse */);
}


function testLifeCycle_v2_v2() {
  // Test flakes on IE 10+ and Chrome: see b/22873770 and b/18595666.
  if ((goog.labs.userAgent.browser.isIE() &&
       goog.labs.userAgent.browser.isVersionOrHigher(10)) ||
      goog.labs.userAgent.browser.isChrome()) {
    return;
  }

  return checkLifeCycle(
      false /* oneSidedHandshake */, 2 /* innerProtocolVersion */,
      2 /* outerProtocolVersion */, true /* outerFrameReconnectSupported */,
      false /* innerFrameMigrationSupported */, false /* reverse */);
}


function testLifeCycle_v2_v2_rev() {
  return checkLifeCycle(
      false /* oneSidedHandshake */, 2 /* innerProtocolVersion */,
      2 /* outerProtocolVersion */, true /* outerFrameReconnectSupported */,
      false /* innerFrameMigrationSupported */, true /* reverse */);
}


function testLifeCycle_v2_v2_onesided() {
  return checkLifeCycle(
      true /* oneSidedHandshake */, 2 /* innerProtocolVersion */,
      2 /* outerProtocolVersion */, false /* outerFrameReconnectSupported */,
      false /* innerFrameMigrationSupported */, false /* reverse */);
}


function testLifeCycle_v2_v2_onesided_rev() {
  return checkLifeCycle(
      true /* oneSidedHandshake */, 2 /* innerProtocolVersion */,
      2 /* outerProtocolVersion */, false /* outerFrameReconnectSupported */,
      false /* innerFrameMigrationSupported */, true /* reverse */);
}


function checkLifeCycle(
    oneSidedHandshake, innerProtocolVersion, outerProtocolVersion,
    outerFrameReconnectSupported, innerFrameMigrationSupported, reverse) {
  driver.createPeerIframe(
      'new_iframe', oneSidedHandshake, innerProtocolVersion,
      outerProtocolVersion);
  return driver.connect(
      true /* fullLifeCycleTest */, outerFrameReconnectSupported,
      innerFrameMigrationSupported, reverse);
}

// testConnectMismatchedNames have been flaky on IEs.
// Flakiness is tracked in http://b/18595666
// For now, not running these tests on IE.

function testConnectMismatchedNames_v1_v1() {
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  return checkConnectMismatchedNames(
      1 /* innerProtocolVersion */, 1 /* outerProtocolVersion */,
      false /* reverse */);
}


function testConnectMismatchedNames_v1_v1_rev() {
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  return checkConnectMismatchedNames(
      1 /* innerProtocolVersion */, 1 /* outerProtocolVersion */,
      true /* reverse */);
}


function testConnectMismatchedNames_v1_v2() {
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  return checkConnectMismatchedNames(
      1 /* innerProtocolVersion */, 2 /* outerProtocolVersion */,
      false /* reverse */);
}


function testConnectMismatchedNames_v1_v2_rev() {
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  return checkConnectMismatchedNames(
      1 /* innerProtocolVersion */, 2 /* outerProtocolVersion */,
      true /* reverse */);
}


function testConnectMismatchedNames_v2_v1() {
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  return checkConnectMismatchedNames(
      2 /* innerProtocolVersion */, 1 /* outerProtocolVersion */,
      false /* reverse */);
}


function testConnectMismatchedNames_v2_v1_rev() {
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  return checkConnectMismatchedNames(
      2 /* innerProtocolVersion */, 1 /* outerProtocolVersion */,
      true /* reverse */);
}


function testConnectMismatchedNames_v2_v2() {
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  return checkConnectMismatchedNames(
      2 /* innerProtocolVersion */, 2 /* outerProtocolVersion */,
      false /* reverse */);
}


function testConnectMismatchedNames_v2_v2_rev() {
  if (goog.labs.userAgent.browser.isIE()) {
    return;
  }

  return checkConnectMismatchedNames(
      2 /* innerProtocolVersion */, 2 /* outerProtocolVersion */,
      true /* reverse */);
}


function checkConnectMismatchedNames(
    innerProtocolVersion, outerProtocolVersion, reverse) {
  driver.createPeerIframe(
      'new_iframe', false /* oneSidedHandshake */, innerProtocolVersion,
      outerProtocolVersion, true /* opt_randomChannelNames */);
  return driver.connect(
      false /* fullLifeCycleTest */, false /* outerFrameReconnectSupported */,
      false /* innerFrameMigrationSupported */, reverse /* reverse */);
}


function testEscapeServiceName() {
  var escape = goog.net.xpc.CrossPageChannel.prototype.escapeServiceName_;
  assertEquals(
      'Shouldn\'t escape alphanumeric name', 'fooBar123', escape('fooBar123'));
  assertEquals(
      'Shouldn\'t escape most non-alphanumeric characters',
      '`~!@#$^&*()_-=+ []{}\'";,<.>/?\\',
      escape('`~!@#$^&*()_-=+ []{}\'";,<.>/?\\'));
  assertEquals(
      'Should escape %, |, and :', 'foo%3ABar%7C123%25',
      escape('foo:Bar|123%'));
  assertEquals('Should escape tp', '%25tp', escape('tp'));
  assertEquals('Should escape %tp', '%25%25tp', escape('%tp'));
  assertEquals('Should not escape stp', 'stp', escape('stp'));
  assertEquals('Should not escape s%tp', 's%25tp', escape('s%tp'));
}


function testSameDomainCheck_noMessageOrigin() {
  var channel = new goog.net.xpc.CrossPageChannel(
      goog.object.create(
          goog.net.xpc.CfgFields.PEER_HOSTNAME, 'http://foo.com'));
  assertTrue(channel.isMessageOriginAcceptable_(undefined));
}


function testSameDomainCheck_noPeerHostname() {
  var channel = new goog.net.xpc.CrossPageChannel({});
  assertTrue(channel.isMessageOriginAcceptable_('http://foo.com'));
}


function testSameDomainCheck_unconfigured() {
  var channel = new goog.net.xpc.CrossPageChannel({});
  assertTrue(channel.isMessageOriginAcceptable_(undefined));
}


function testSameDomainCheck_originsMatch() {
  var channel = new goog.net.xpc.CrossPageChannel(
      goog.object.create(
          goog.net.xpc.CfgFields.PEER_HOSTNAME, 'http://foo.com'));
  assertTrue(channel.isMessageOriginAcceptable_('http://foo.com'));
}


function testSameDomainCheck_originsMismatch() {
  var channel = new goog.net.xpc.CrossPageChannel(
      goog.object.create(
          goog.net.xpc.CfgFields.PEER_HOSTNAME, 'http://foo.com'));
  assertFalse(channel.isMessageOriginAcceptable_('http://nasty.com'));
}


function testUnescapeServiceName() {
  var unescape = goog.net.xpc.CrossPageChannel.prototype.unescapeServiceName_;
  assertEquals(
      'Shouldn\'t modify alphanumeric name', 'fooBar123',
      unescape('fooBar123'));
  assertEquals(
      'Shouldn\'t modify most non-alphanumeric characters',
      '`~!@#$^&*()_-=+ []{}\'";,<.>/?\\',
      unescape('`~!@#$^&*()_-=+ []{}\'";,<.>/?\\'));
  assertEquals(
      'Should unescape URL-escapes', 'foo:Bar|123%',
      unescape('foo%3ABar%7C123%25'));
  assertEquals('Should unescape tp', 'tp', unescape('%25tp'));
  assertEquals('Should unescape %tp', '%tp', unescape('%25%25tp'));
  assertEquals('Should not escape stp', 'stp', unescape('stp'));
  assertEquals('Should not escape s%tp', 's%tp', unescape('s%25tp'));
}


/**
 * Tests the case where the channel is disposed before it is fully connected.
 */
function testDisposeBeforeConnect() {
  // Test flakes on IE: see b/22873770 and b/18595666.
  if (goog.labs.userAgent.browser.isIE() &&
      goog.labs.userAgent.browser.isVersionOrHigher(9)) {
    return;
  }

  driver.createPeerIframe(
      'new_iframe', false /* oneSidedHandshake */, 2 /* innerProtocolVersion */,
      2 /* outerProtocolVersion */, true /* opt_randomChannelNames */);
  return driver.connectOuterAndDispose();
}



/**
 * Driver for the tests for CrossPageChannel.
 *
 * @constructor
 * @extends {goog.Disposable}
 */
Driver = function() {
  goog.Disposable.call(this);

  /**
   * The peer iframe.
   * @type {!Element}
   * @private
   */
  this.iframe_ = null;

  /**
   * The channel to use.
   * @type {goog.net.xpc.CrossPageChannel}
   * @private
   */
  this.channel_ = null;

  /**
   * Outer frame configuration object.
   * @type {Object}
   * @private
   */
  this.outerFrameCfg_ = null;

  /**
   * The initial name of the outer channel.
   * @type {?string}
   * @private
   */
  this.initialOuterChannelName_ = null;

  /**
   * Inner frame configuration object.
   * @type {Object}
   * @private
   */
  this.innerFrameCfg_ = null;

  /**
   * The contents of the payload of the 'echo' request sent by the inner frame.
   * @type {?string}
   * @private
   */
  this.innerFrameEchoPayload_ = null;

  /**
   * The contents of the payload of the 'echo' request sent by the outer frame.
   * @type {?string}
   * @private
   */
  this.outerFrameEchoPayload_ = null;

  /**
   * A resolver which fires its promise when the inner frame receives an echo.
   * @type {!goog.promise.Resolver}
   * @private
   */
  this.innerFrameResponseReceived_ = goog.Promise.withResolver();

  /**
   * A resolver which fires its promise when the outer frame receives an echo.
   * @type {!goog.promise.Resolver}
   * @private
   */
  this.outerFrameResponseReceived_ = goog.Promise.withResolver();

};
goog.inherits(Driver, goog.Disposable);


/** @override */
Driver.prototype.disposeInternal = function() {
  // Required to make this test perform acceptably (and pass) on slow browsers,
  // esp IE8.
  if (CLEAN_UP_IFRAMES) {
    goog.dom.removeNode(this.iframe_);
    delete this.iframe_;
  }
  goog.dispose(this.channel_);
  this.innerFrameResponseReceived_.promise.cancel();
  this.outerFrameResponseReceived_.promise.cancel();
  Driver.base(this, 'disposeInternal');
};


/**
 * Returns the child peer's window object.
 * @return {Window} Child peer's window.
 * @private
 */
Driver.prototype.getInnerPeer_ = function() {
  return this.iframe_.contentWindow;
};


/**
 * Sets up the configuration objects for the inner and outer frames.
 * @param {string=} opt_iframeId If present, the ID of the iframe to use,
 *     otherwise, tells the channel to generate an iframe ID.
 * @param {boolean=} opt_oneSidedHandshake Whether the one sided handshake
 *     config option should be set.
 * @param {string=} opt_channelName The name of the channel to use, or null
 *     to generate one.
 * @param {number=} opt_innerProtocolVersion The native transport protocol
 *     version used in the inner iframe.
 * @param {number=} opt_outerProtocolVersion The native transport protocol
 *     version used in the outer iframe.
 * @param {boolean=} opt_randomChannelNames Whether the different ends of the
 *     channel should be allowed to pick differing, random names.
 * @return {string} The name of the created channel.
 * @private
 */
Driver.prototype.setConfiguration_ = function(
    opt_iframeId, opt_oneSidedHandshake, opt_channelName,
    opt_innerProtocolVersion, opt_outerProtocolVersion,
    opt_randomChannelNames) {
  var cfg = {};
  if (opt_iframeId) {
    cfg[goog.net.xpc.CfgFields.IFRAME_ID] = opt_iframeId;
  }
  cfg[goog.net.xpc.CfgFields.PEER_URI] = 'testdata/inner_peer.html';
  if (!opt_randomChannelNames) {
    var channelName = opt_channelName || 'test_channel' + uniqueId++;
    cfg[goog.net.xpc.CfgFields.CHANNEL_NAME] = channelName;
  }
  cfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI] = 'does-not-exist.html';
  cfg[goog.net.xpc.CfgFields.PEER_POLL_URI] = 'does-not-exist.html';
  cfg[goog.net.xpc.CfgFields.ONE_SIDED_HANDSHAKE] = !!opt_oneSidedHandshake;
  cfg[goog.net.xpc.CfgFields.NATIVE_TRANSPORT_PROTOCOL_VERSION] =
      opt_outerProtocolVersion;
  function resolveUri(fieldName) {
    cfg[fieldName] =
        goog.Uri.resolve(window.location.href, cfg[fieldName]).toString();
  }
  resolveUri(goog.net.xpc.CfgFields.PEER_URI);
  resolveUri(goog.net.xpc.CfgFields.LOCAL_POLL_URI);
  resolveUri(goog.net.xpc.CfgFields.PEER_POLL_URI);
  this.outerFrameCfg_ = cfg;
  this.innerFrameCfg_ = goog.object.clone(cfg);
  this.innerFrameCfg_[goog.net.xpc.CfgFields
                          .NATIVE_TRANSPORT_PROTOCOL_VERSION] =
      opt_innerProtocolVersion;
};


/**
 * Creates an outer frame channel object.
 * @private
 */
Driver.prototype.createChannel_ = function() {
  if (this.channel_) {
    this.channel_.dispose();
  }
  this.channel_ = new goog.net.xpc.CrossPageChannel(this.outerFrameCfg_);
  this.channel_.registerService('echo', goog.bind(this.echoHandler_, this));
  this.channel_.registerService(
      'response', goog.bind(this.responseHandler_, this));

  return this.channel_.name;
};


/**
 * Checks the names of the inner and outer frames meet expectations.
 * @private
 */
Driver.prototype.checkChannelNames_ = function() {
  var outerName = this.channel_.name;
  var innerName = this.getInnerPeer_().channel.name;
  var configName =
      this.innerFrameCfg_[goog.net.xpc.CfgFields.CHANNEL_NAME] || null;

  // The outer channel never changes its name.
  assertEquals(this.initialOuterChannelName_, outerName);
  // The name should be as configured, if it was configured.
  if (configName) {
    assertEquals(configName, innerName);
  }
  // The names of both ends of the channel should match.
  assertEquals(innerName, outerName);
  G_testRunner.log('Channel name: ' + innerName);
};


/**
 * Returns the configuration of the xpc.
 * @return {?Object} The configuration of the xpc.
 */
Driver.prototype.getInnerFrameConfiguration = function() {
  return this.innerFrameCfg_;
};


/**
 * Creates the peer iframe.
 * @param {string=} opt_iframeId If present, the ID of the iframe to create,
 *     otherwise, generates an iframe ID.
 * @param {boolean=} opt_oneSidedHandshake Whether a one sided handshake is
 *     specified.
 * @param {number=} opt_innerProtocolVersion The native transport protocol
 *     version used in the inner iframe.
 * @param {number=} opt_outerProtocolVersion The native transport protocol
 *     version used in the outer iframe.
 * @param {boolean=} opt_randomChannelNames Whether the ends of the channel
 *     should be allowed to pick differing, random names.
 * @return {!Array<string>} The id of the created iframe and the name of the
 *     created channel.
 */
Driver.prototype.createPeerIframe = function(
    opt_iframeId, opt_oneSidedHandshake, opt_innerProtocolVersion,
    opt_outerProtocolVersion, opt_randomChannelNames) {
  var expectedIframeId;

  if (opt_iframeId) {
    expectedIframeId = opt_iframeId = opt_iframeId + uniqueId++;
  } else {
    // Have createPeerIframe() generate an ID
    stubs.set(goog.net.xpc, 'getRandomString', function(length) {
      return '' + length;
    });
    expectedIframeId = 'xpcpeer4';
  }
  assertNull(
      'element[id=' + expectedIframeId + '] exists',
      goog.dom.getElement(expectedIframeId));

  this.setConfiguration_(
      opt_iframeId, opt_oneSidedHandshake, undefined /* opt_channelName */,
      opt_innerProtocolVersion, opt_outerProtocolVersion,
      opt_randomChannelNames);
  var channelName = this.createChannel_();
  this.initialOuterChannelName_ = channelName;
  this.iframe_ = this.channel_.createPeerIframe(document.body);

  assertEquals(expectedIframeId, this.iframe_.id);
};


/**
 * Checks if the peer iframe has been created.
 */
Driver.prototype.checkPeerIframe = function() {
  assertNotNull(this.iframe_);
  var peer = this.getInnerPeer_();
  assertNotNull(peer);
  assertNotNull(peer.document);
};


/**
 * Starts the connection. The connection happens asynchronously.
 */
Driver.prototype.connect = function(
    fullLifeCycleTest, outerFrameReconnectSupported,
    innerFrameMigrationSupported, reverse) {
  if (!this.isTransportTestable_()) {
    return;
  }

  // Set the criteria for the initial handshake portion of the test.
  this.reinitializePromises_();

  this.innerFrameResponseReceived_.promise.then(
      this.checkChannelNames_, null, this);

  if (fullLifeCycleTest) {
    this.innerFrameResponseReceived_.promise.then(
        goog.bind(
            this.testReconnects_, this, outerFrameReconnectSupported,
            innerFrameMigrationSupported));
  }

  this.continueConnect_(reverse);
  return this.innerFrameResponseReceived_.promise;
};


Driver.prototype.continueConnect_ = function(reverse) {
  // Wait until the peer is fully established.  Establishment is sometimes very
  // slow indeed, especially on virtual machines, so a fixed timeout is not
  // suitable.  This wait is required because we want to take precise control
  // of the channel startup timing, and shouldn't be needed in production use,
  // where the inner frame's channel is typically not started by a DOM call as
  // it is here.
  if (!this.getInnerPeer_() || !this.getInnerPeer_().instantiateChannel) {
    window.setTimeout(goog.bind(this.continueConnect_, this, reverse), 100);
    return;
  }

  var connectFromOuterFrame = goog.bind(
      this.channel_.connect, this.channel_,
      goog.bind(this.outerFrameConnected_, this));
  var innerConfig = this.innerFrameCfg_;
  var connectFromInnerFrame = goog.bind(
      this.getInnerPeer_().instantiateChannel, this.getInnerPeer_(),
      innerConfig);

  // Take control of the timing and reverse of each frame's first SETUP call. If
  // these happen to fire right on top of each other, that tends to mask
  // problems that reliably occur when there is a short delay.
  window.setTimeout(connectFromOuterFrame, reverse ? 1 : 10);
  window.setTimeout(connectFromInnerFrame, reverse ? 10 : 1);
};


/**
 * Called by the outer frame connection callback.
 * @private
 */
Driver.prototype.outerFrameConnected_ = function() {
  var payload = this.outerFrameEchoPayload_ = goog.net.xpc.getRandomString(10);
  this.channel_.send('echo', payload);
};


/**
 * Called by the inner frame connection callback in inner_peer.html.
 */
Driver.prototype.innerFrameConnected = function() {
  var payload = this.innerFrameEchoPayload_ = goog.net.xpc.getRandomString(10);
  this.getInnerPeer_().sendEcho(payload);
};


/**
 * The handler function for incoming echo requests.
 * @param {string} payload The message payload.
 * @private
 */
Driver.prototype.echoHandler_ = function(payload) {
  assertTrue('outer frame should be connected', this.channel_.isConnected());
  var peer = this.getInnerPeer_();
  assertTrue('child should be connected', peer.isConnected());
  this.channel_.send('response', payload);
};


/**
 * The handler function for incoming echo responses.
 * @param {string} payload The message payload.
 * @private
 */
Driver.prototype.responseHandler_ = function(payload) {
  assertTrue('outer frame should be connected', this.channel_.isConnected());
  var peer = this.getInnerPeer_();
  assertTrue('child should be connected', peer.isConnected());
  assertEquals(this.outerFrameEchoPayload_, payload);
  this.outerFrameResponseReceived_.resolve(true);
};


/**
 * The handler function for incoming echo replies. Called from inner_peer.html.
 * @param {string} payload The message payload.
 */
Driver.prototype.innerFrameGotResponse = function(payload) {
  assertTrue('outer frame should be connected', this.channel_.isConnected());
  var peer = this.getInnerPeer_();
  assertTrue('child should be connected', peer.isConnected());
  assertEquals(this.innerFrameEchoPayload_, payload);
  this.innerFrameResponseReceived_.resolve(true);
};


/**
 * The second phase of the standard test, where reconnections of both the inner
 * and outer frames are performed.
 * @param {boolean} outerFrameReconnectSupported Whether outer frame reconnects
 *     are supported, and should be tested.
 * @private
 */
Driver.prototype.testReconnects_ = function(
    outerFrameReconnectSupported, innerFrameMigrationSupported) {
  G_testRunner.log('Performing inner frame reconnect');
  this.reinitializePromises_();
  this.innerFrameResponseReceived_.promise.then(
      this.checkChannelNames_, null, this);

  if (outerFrameReconnectSupported) {
    this.innerFrameResponseReceived_.promise.then(
        goog.bind(
            this.performOuterFrameReconnect_, this,
            innerFrameMigrationSupported));
  } else if (innerFrameMigrationSupported) {
    this.innerFrameResponseReceived_.promise.then(
        this.migrateInnerFrame_, null, this);
  }

  this.performInnerFrameReconnect_();
};


/**
 * Initializes the promise resolvers and clears the echo payloads, ready for
 * another sub-test.
 * @private
 */
Driver.prototype.reinitializePromises_ = function() {
  this.innerFrameEchoPayload_ = null;
  this.outerFrameEchoPayload_ = null;
  this.innerFrameResponseReceived_.promise.cancel();
  this.innerFrameResponseReceived_ = goog.Promise.withResolver();
  this.outerFrameResponseReceived_.promise.cancel();
  this.outerFrameResponseReceived_ = goog.Promise.withResolver();
};


/**
 * Get the inner frame to reconnect, and repeat the echo test.
 * @private
 */
Driver.prototype.performInnerFrameReconnect_ = function() {
  var peer = this.getInnerPeer_();
  peer.instantiateChannel(this.innerFrameCfg_);
};


/**
 * Get the outer frame to reconnect, and repeat the echo test.
 * @private
 */
Driver.prototype.performOuterFrameReconnect_ = function(
    innerFrameMigrationSupported) {
  G_testRunner.log('Closing channel');
  this.channel_.close();

  // If there is another channel still open, the native transport's global
  // postMessage listener will still be active.  This will mean that messages
  // being sent to the now-closed channel will still be received and delivered,
  // such as transport service traffic from its previous correspondent in the
  // other frame.  Ensure these messages don't cause exceptions.
  try {
    this.channel_.xpcDeliver(goog.net.xpc.TRANSPORT_SERVICE_, 'payload');
  } catch (e) {
    fail('Should not throw exception');
  }

  G_testRunner.log('Reconnecting outer frame');
  this.reinitializePromises_();
  this.innerFrameResponseReceived_.promise.then(
      this.checkChannelNames_, null, this);
  if (innerFrameMigrationSupported) {
    this.outerFrameResponseReceived_.promise.then(
        this.migrateInnerFrame_, null, this);
  }
  this.channel_.connect(goog.bind(this.outerFrameConnected_, this));
};


/**
 * Migrate the inner frame to the alternate protocol version and reconnect it.
 * @private
 */
Driver.prototype.migrateInnerFrame_ = function() {
  G_testRunner.log('Migrating inner frame');
  this.reinitializePromises_();
  var innerFrameProtoVersion =
      this.innerFrameCfg_[goog.net.xpc.CfgFields
                              .NATIVE_TRANSPORT_PROTOCOL_VERSION];
  this.innerFrameResponseReceived_.promise.then(
      this.checkChannelNames_, null, this);
  this.innerFrameCfg_[goog.net.xpc.CfgFields
                          .NATIVE_TRANSPORT_PROTOCOL_VERSION] =
      innerFrameProtoVersion == 1 ? 2 : 1;
  this.performInnerFrameReconnect_();
};


/**
 * Determines if the transport type for the channel is testable.
 * Some transports are misusing global state or making other
 * assumptions that cause connections to fail.
 * @return {boolean} Whether the transport is testable.
 * @private
 */
Driver.prototype.isTransportTestable_ = function() {
  var testable = false;

  var transportType = this.channel_.determineTransportType_();
  switch (transportType) {
    case goog.net.xpc.TransportTypes.IFRAME_RELAY:
    case goog.net.xpc.TransportTypes.IFRAME_POLLING:
      testable = canAccessSameDomainIframe;
      break;
    case goog.net.xpc.TransportTypes.NATIVE_MESSAGING:
    case goog.net.xpc.TransportTypes.FLASH:
    case goog.net.xpc.TransportTypes.DIRECT:
    case goog.net.xpc.TransportTypes.NIX:
      testable = true;
      break;
  }

  return testable;
};


/**
 * Connect the outer channel but not the inner one.  Wait a short time, then
 * dispose the outer channel and make sure it was torn down properly.
 */
Driver.prototype.connectOuterAndDispose = function() {
  this.channel_.connect();
  return goog.Timer.promise(2000).then(this.disposeAndCheck_, null, this);
};


/**
 * Dispose the cross-page channel. Check that the transport was also
 * disposed, and allow to run briefly to make sure no timers which will cause
 * failures are still running.
 * @private
 */
Driver.prototype.disposeAndCheck_ = function() {
  assertFalse(this.channel_.isConnected());
  var transport = this.channel_.transport_;
  this.channel_.dispose();
  assertNull(this.channel_.transport_);
  assertTrue(this.channel_.isDisposed());
  assertTrue(transport.isDisposed());

  // Let any errors caused by erroneous retries happen.
  return goog.Timer.promise(2000);
};
