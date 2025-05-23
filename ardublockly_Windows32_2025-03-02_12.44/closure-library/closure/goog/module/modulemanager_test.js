// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.module.ModuleManagerTest');
goog.setTestOnly('goog.module.ModuleManagerTest');

goog.require('goog.array');
goog.require('goog.functions');
goog.require('goog.module.BaseModule');
goog.require('goog.module.ModuleManager');
goog.require('goog.testing');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');



var clock;
var requestCount = 0;


function tearDown() {
  clock.dispose();
}

function setUp() {
  clock = new goog.testing.MockClock(true);
  requestCount = 0;
}

function getModuleManager(infoMap) {
  var mm = new goog.module.ModuleManager();
  mm.setAllModuleInfo(infoMap);

  mm.isModuleLoaded = function(id) {
    return this.getModuleInfo(id).isLoaded();
  };
  return mm;
}

function createSuccessfulBatchLoader(moduleMgr) {
  return {
    loadModules: function(
        ids, moduleInfoMap, opt_successFn, opt_errFn, opt_timeoutFn) {
      requestCount++;
      setTimeout(goog.bind(this.onLoad, this, ids.concat(), 0), 5);
    },
    onLoad: function(ids, idxLoaded) {
      moduleMgr.beforeLoadModuleCode(ids[idxLoaded]);
      moduleMgr.setLoaded(ids[idxLoaded]);
      moduleMgr.afterLoadModuleCode(ids[idxLoaded]);
      var idx = idxLoaded + 1;
      if (idx < ids.length) {
        setTimeout(goog.bind(this.onLoad, this, ids, idx), 2);
      }
    }
  };
}

function createSuccessfulNonBatchLoader(moduleMgr) {
  return {
    loadModules: function(
        ids, moduleInfoMap, opt_successFn, opt_errFn, opt_timeoutFn) {
      requestCount++;
      setTimeout(function() {
        moduleMgr.beforeLoadModuleCode(ids[0]);
        moduleMgr.setLoaded(ids[0]);
        moduleMgr.afterLoadModuleCode(ids[0]);
        if (opt_successFn) {
          opt_successFn();
        }
      }, 5);
    }
  };
}

function createUnsuccessfulLoader(moduleMgr, status) {
  return {
    loadModules: function(
        ids, moduleInfoMap, opt_successFn, opt_errFn, opt_timeoutFn) {
      moduleMgr.beforeLoadModuleCode(ids[0]);
      setTimeout(function() { opt_errFn(status); }, 5);
    }
  };
}

function createUnsuccessfulBatchLoader(moduleMgr, status) {
  return {
    loadModules: function(
        ids, moduleInfoMap, opt_successFn, opt_errFn, opt_timeoutFn) {
      setTimeout(function() { opt_errFn(status); }, 5);
    }
  };
}

function createTimeoutLoader(moduleMgr, status) {
  return {
    loadModules: function(
        ids, moduleInfoMap, opt_successFn, opt_errFn, opt_timeoutFn) {
      setTimeout(function() { opt_timeoutFn(status); }, 5);
    }
  };
}


/**
 * Tests loading a module under different conditions i.e. unloaded
 * module, already loaded module, module loaded through user initiated
 * actions, synchronous callback for a module that has been already
 * loaded. Test both batch and non-batch loaders.
 */
function testExecOnLoad() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));
  execOnLoad_(mm);

  mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createSuccessfulBatchLoader(mm));
  mm.setBatchModeEnabled(true);
  execOnLoad_(mm);
}


/**
 * Tests execOnLoad with the specified module manager.
 * @param {goog.module.ModuleManager} mm The module manager.
 */
function execOnLoad_(mm) {
  // When module is unloaded, execOnLoad is async.
  var execCalled1 = false;
  mm.execOnLoad('a', function() { execCalled1 = true; });
  assertFalse('module "a" should not be loaded', mm.isModuleLoaded('a'));
  assertTrue('module "a" should be loading', mm.isModuleLoading('a'));
  assertFalse('execCalled1 should not be set yet', execCalled1);
  assertTrue('ModuleManager should be active', mm.isActive());
  assertFalse('ModuleManager should not be user active', mm.isUserActive());
  clock.tick(5);
  assertTrue('module "a" should be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "a" should not be loading', mm.isModuleLoading('a'));
  assertTrue('execCalled1 should be set', execCalled1);
  assertFalse('ModuleManager should not be active', mm.isActive());
  assertFalse('ModuleManager should not be user active', mm.isUserActive());

  // When module is already loaded, execOnLoad is still async unless
  // specified otherwise.
  var execCalled2 = false;
  mm.execOnLoad('a', function() { execCalled2 = true; });
  assertTrue('module "a" should be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "a" should not be loading', mm.isModuleLoading('a'));
  assertFalse('execCalled2 should not be set yet', execCalled2);
  clock.tick(5);
  assertTrue('execCalled2 should be set', execCalled2);

  // When module is unloaded, execOnLoad is async (user active).
  var execCalled5 = false;
  mm.execOnLoad('c', function() { execCalled5 = true; }, null, null, true);
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));
  assertTrue('module "c" should be loading', mm.isModuleLoading('c'));
  assertFalse('execCalled1 should not be set yet', execCalled5);
  assertTrue('ModuleManager should be active', mm.isActive());
  assertTrue('ModuleManager should be user active', mm.isUserActive());
  clock.tick(5);
  assertTrue('module "c" should be loaded', mm.isModuleLoaded('c'));
  assertFalse('module "c" should not be loading', mm.isModuleLoading('c'));
  assertTrue('execCalled1 should be set', execCalled5);
  assertFalse('ModuleManager should not be active', mm.isActive());
  assertFalse('ModuleManager should not be user active', mm.isUserActive());

  // When module is already loaded, execOnLoad is still synchronous when
  // so specified
  var execCalled6 = false;
  mm.execOnLoad('c', function() {
    execCalled6 = true;
  }, undefined, undefined, undefined, true);
  assertTrue('module "c" should be loaded', mm.isModuleLoaded('c'));
  assertFalse('module "c" should not be loading', mm.isModuleLoading('c'));
  assertTrue('execCalled6 should be set', execCalled6);
  clock.tick(5);
  assertTrue('execCalled6 should still be set', execCalled6);
}


/**
 * Test aborting the callback called on module load.
 */
function testExecOnLoadAbort() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  // When module is unloaded and abort is called, module still gets
  // loaded, but callback is cancelled.
  var execCalled1 = false;
  var callback1 = mm.execOnLoad('b', function() { execCalled1 = true; });
  callback1.abort();
  clock.tick(5);
  assertTrue('module "b" should be loaded', mm.isModuleLoaded('b'));
  assertFalse('execCalled3 should not be set', execCalled1);

  // When module is already loaded, execOnLoad is still async, so calling
  // abort should still cancel the callback.
  var execCalled2 = false;
  var callback2 = mm.execOnLoad('a', function() { execCalled2 = true; });
  callback2.abort();
  clock.tick(5);
  assertFalse('execCalled2 should not be set', execCalled2);
}


/**
 * Test preloading modules and ensure that the before load, after load
 * and set load called are called only once per module.
 */
function testExecOnLoadWhilePreloadingAndViceVersa() {
  var mm = getModuleManager({'c': [], 'd': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));
  execOnLoadWhilePreloadingAndViceVersa_(mm);

  mm = getModuleManager({'c': [], 'd': []});
  mm.setLoader(createSuccessfulBatchLoader(mm));
  mm.setBatchModeEnabled(true);
  execOnLoadWhilePreloadingAndViceVersa_(mm);
}


/**
 * Perform tests with the specified module manager.
 * @param {goog.module.ModuleManager} mm The module manager.
 */
function execOnLoadWhilePreloadingAndViceVersa_(mm) {
  var mm = getModuleManager({'c': [], 'd': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var origSetLoaded = mm.setLoaded;
  var calls = [0, 0, 0];
  mm.beforeLoadModuleCode = function(id) { calls[0]++; };
  mm.setLoaded = function(id) {
    calls[1]++;
    origSetLoaded.call(mm, id);
  };
  mm.afterLoadModuleCode = function(id) { calls[2]++; };

  mm.preloadModule('c', 2);
  assertFalse('module "c" should not be loading yet', mm.isModuleLoading('c'));
  clock.tick(2);
  assertTrue('module "c" should now be loading', mm.isModuleLoading('c'));
  mm.execOnLoad('c', function() {});
  assertTrue('module "c" should still be loading', mm.isModuleLoading('c'));
  clock.tick(5);
  assertFalse('module "c" should be done loading', mm.isModuleLoading('c'));
  assertEquals('beforeLoad should only be called once for "c"', 1, calls[0]);
  assertEquals('setLoaded should only be called once for "c"', 1, calls[1]);
  assertEquals('afterLoad should only be called once for "c"', 1, calls[2]);

  mm.execOnLoad('d', function() {});
  assertTrue('module "d" should now be loading', mm.isModuleLoading('d'));
  mm.preloadModule('d', 2);
  clock.tick(5);
  assertFalse('module "d" should be done loading', mm.isModuleLoading('d'));
  assertTrue('module "d" should now be loaded', mm.isModuleLoaded('d'));
  assertEquals('beforeLoad should only be called once for "d"', 2, calls[0]);
  assertEquals('setLoaded should only be called once for "d"', 2, calls[1]);
  assertEquals('afterLoad should only be called once for "d"', 2, calls[2]);
}


/**
 * Tests that multiple callbacks on the same module don't cause
 * confusion about the active state after the module is finally loaded.
 */
function testUserInitiatedExecOnLoadEventuallyLeavesManagerIdle() {
  var mm = getModuleManager({'c': [], 'd': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var calledBack1 = false;
  var calledBack2 = false;

  mm.execOnLoad(
      'c', function() { calledBack1 = true; }, undefined, undefined, true);
  mm.execOnLoad(
      'c', function() { calledBack2 = true; }, undefined, undefined, true);
  mm.load('c');

  assertTrue(
      'Manager should be active while waiting for load', mm.isUserActive());

  clock.tick(5);

  assertTrue('First callback should be called', calledBack1);
  assertTrue('Second callback should be called', calledBack2);
  assertFalse(
      'Manager should be inactive after loading is complete',
      mm.isUserActive());
}


/**
 * Tests loading a module by requesting a Deferred object.
 */
function testLoad() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var calledBack = false;
  var error = null;

  var d = mm.load('a');
  d.addCallback(function(ctx) { calledBack = true; });
  d.addErrback(function(err) { error = err; });

  assertFalse(calledBack);
  assertNull(error);
  assertFalse(mm.isUserActive());

  clock.tick(5);

  assertTrue(calledBack);
  assertNull(error);
}


/**
 * Tests loading 2 modules asserting that the loads happen in parallel
 * in one unit of time.
 */
function testLoad_concurrent() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setConcurrentLoadingEnabled(true);
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var calledBack = false;
  var error = null;

  mm.load('a');
  mm.load('b');
  assertEquals(2, requestCount);
  // Only time for one serialized download.
  clock.tick(5);

  assertTrue(mm.getModuleInfo('a').isLoaded());
  assertTrue(mm.getModuleInfo('b').isLoaded());
}

function testLoad_concurrentSecondIsDepOfFist() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setBatchModeEnabled(true);
  mm.setConcurrentLoadingEnabled(true);
  mm.setLoader(createSuccessfulBatchLoader(mm));

  var calledBack = false;
  var error = null;

  mm.loadMultiple(['a', 'b']);
  mm.load('b');
  assertEquals('No 2nd request expected', 1, requestCount);
  // Only time for one serialized download.
  clock.tick(5);
  clock.tick(2);  // Makes second module come in from batch requst.

  assertTrue(mm.getModuleInfo('a').isLoaded());
  assertTrue(mm.getModuleInfo('b').isLoaded());
}

function testLoad_nonConcurrent() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var calledBack = false;
  var error = null;

  mm.load('a');
  mm.load('b');
  assertEquals(1, requestCount);
  // Only time for one serialized download.
  clock.tick(5);

  assertTrue(mm.getModuleInfo('a').isLoaded());
  assertFalse(mm.getModuleInfo('b').isLoaded());
}

function testLoadUnknown() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));
  var e = assertThrows(function() { mm.load('DoesNotExist'); });
  assertEquals('Unknown module: DoesNotExist', e.message);
}


/**
 * Tests loading multiple modules by requesting a Deferred object.
 */
function testLoadMultiple() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setBatchModeEnabled(true);
  mm.setLoader(createSuccessfulBatchLoader(mm));

  var calledBack = false;
  var error = null;
  var calledBack2 = false;
  var error2 = null;

  var dMap = mm.loadMultiple(['a', 'b']);
  dMap['a'].addCallback(function(ctx) { calledBack = true; });
  dMap['a'].addErrback(function(err) { error = err; });
  dMap['b'].addCallback(function(ctx) { calledBack2 = true; });
  dMap['b'].addErrback(function(err) { error2 = err; });

  assertFalse(calledBack);
  assertFalse(calledBack2);

  clock.tick(5);
  assertTrue(calledBack);
  assertFalse(calledBack2);
  assertTrue('module "a" should be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "b" should not be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  clock.tick(2);

  assertTrue(calledBack);
  assertTrue(calledBack2);
  assertTrue('module "a" should be loaded', mm.isModuleLoaded('a'));
  assertTrue('module "b" should be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));
  assertNull(error);
  assertNull(error2);
}


/**
 * Tests loading multiple modules with deps by requesting a Deferred object.
 */
function testLoadMultipleWithDeps() {
  var mm = getModuleManager({'a': [], 'b': ['c'], 'c': []});
  mm.setBatchModeEnabled(true);
  mm.setLoader(createSuccessfulBatchLoader(mm));

  var calledBack = false;
  var error = null;
  var calledBack2 = false;
  var error2 = null;

  var dMap = mm.loadMultiple(['a', 'b']);
  dMap['a'].addCallback(function(ctx) { calledBack = true; });
  dMap['a'].addErrback(function(err) { error = err; });
  dMap['b'].addCallback(function(ctx) { calledBack2 = true; });
  dMap['b'].addErrback(function(err) { error2 = err; });

  assertFalse(calledBack);
  assertFalse(calledBack2);

  clock.tick(5);
  assertTrue(calledBack);
  assertFalse(calledBack2);
  assertTrue('module "a" should be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "b" should not be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  clock.tick(2);

  assertFalse(calledBack2);
  assertTrue('module "a" should be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "b" should not be loaded', mm.isModuleLoaded('b'));
  assertTrue('module "c" should be loaded', mm.isModuleLoaded('c'));

  clock.tick(2);

  assertTrue(calledBack2);
  assertTrue('module "a" should be loaded', mm.isModuleLoaded('a'));
  assertTrue('module "b" should be loaded', mm.isModuleLoaded('b'));
  assertTrue('module "c" should be loaded', mm.isModuleLoaded('c'));
  assertNull(error);
  assertNull(error2);
}


/**
 * Tests loading multiple modules by requesting a Deferred object when
 * a server error occurs.
 */
function testLoadMultipleWithErrors() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setBatchModeEnabled(true);
  mm.setLoader(createUnsuccessfulLoader(mm, 500));

  var calledBack = false;
  var error = null;
  var calledBack2 = false;
  var error2 = null;
  var calledBack3 = false;
  var error3 = null;

  var dMap = mm.loadMultiple(['a', 'b', 'c']);
  dMap['a'].addCallback(function(ctx) { calledBack = true; });
  dMap['a'].addErrback(function(err) { error = err; });
  dMap['b'].addCallback(function(ctx) { calledBack2 = true; });
  dMap['b'].addErrback(function(err) { error2 = err; });
  dMap['c'].addCallback(function(ctx) { calledBack3 = true; });
  dMap['c'].addErrback(function(err) { error3 = err; });

  assertFalse(calledBack);
  assertFalse(calledBack2);
  assertFalse(calledBack3);

  clock.tick(4);

  // A module request is now underway using the unsuccessful loader.
  // We substitute a successful loader for future module load requests.
  mm.setLoader(createSuccessfulBatchLoader(mm));

  clock.tick(1);

  assertFalse(calledBack);
  assertFalse(calledBack2);
  assertFalse(calledBack3);
  assertFalse('module "a" should not be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "b" should not be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  // Retry should happen after a backoff
  clock.tick(5 + mm.getBackOff_());

  assertTrue(calledBack);
  assertFalse(calledBack2);
  assertFalse(calledBack3);
  assertTrue('module "a" should be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "b" should not be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  clock.tick(2);
  assertTrue(calledBack2);
  assertFalse(calledBack3);
  assertTrue('module "b" should be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  clock.tick(2);
  assertTrue(calledBack3);
  assertTrue('module "c" should be loaded', mm.isModuleLoaded('c'));

  assertNull(error);
  assertNull(error2);
  assertNull(error3);
}


/**
 * Tests loading multiple modules by requesting a Deferred object when
 * consecutive server error occur and the loader falls back to serial
 * loads.
 */
function testLoadMultipleWithErrorsFallbackOnSerial() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setBatchModeEnabled(true);
  mm.setLoader(createUnsuccessfulLoader(mm, 500));

  var calledBack = false;
  var error = null;
  var calledBack2 = false;
  var error2 = null;
  var calledBack3 = false;
  var error3 = null;

  var dMap = mm.loadMultiple(['a', 'b', 'c']);
  dMap['a'].addCallback(function(ctx) { calledBack = true; });
  dMap['a'].addErrback(function(err) { error = err; });
  dMap['b'].addCallback(function(ctx) { calledBack2 = true; });
  dMap['b'].addErrback(function(err) { error2 = err; });
  dMap['c'].addCallback(function(ctx) { calledBack3 = true; });
  dMap['c'].addErrback(function(err) { error3 = err; });

  assertFalse(calledBack);
  assertFalse(calledBack2);
  assertFalse(calledBack3);

  clock.tick(5);

  assertFalse(calledBack);
  assertFalse(calledBack2);
  assertFalse(calledBack3);
  assertFalse('module "a" should not be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "b" should not be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  // Retry should happen and fail after a backoff
  clock.tick(5 + mm.getBackOff_());
  assertFalse(calledBack);
  assertFalse(calledBack2);
  assertFalse(calledBack3);
  assertFalse('module "a" should not be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "b" should not be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  // A second retry should happen after a backoff
  clock.tick(4 + mm.getBackOff_());
  // The second retry is now underway using the unsuccessful loader.
  // We substitute a successful loader for future module load requests.
  mm.setLoader(createSuccessfulBatchLoader(mm));

  clock.tick(1);

  // A second retry should fail now
  assertFalse(calledBack);
  assertFalse(calledBack2);
  assertFalse(calledBack3);
  assertFalse('module "a" should not be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "b" should not be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  // Each module should be loaded individually now, each taking 5 ticks

  clock.tick(5);
  assertTrue(calledBack);
  assertFalse(calledBack2);
  assertFalse(calledBack3);
  assertTrue('module "a" should be loaded', mm.isModuleLoaded('a'));
  assertFalse('module "b" should not be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  clock.tick(5);
  assertTrue(calledBack2);
  assertFalse(calledBack3);
  assertTrue('module "b" should be loaded', mm.isModuleLoaded('b'));
  assertFalse('module "c" should not be loaded', mm.isModuleLoaded('c'));

  clock.tick(5);
  assertTrue(calledBack3);
  assertTrue('module "c" should be loaded', mm.isModuleLoaded('c'));

  assertNull(error);
  assertNull(error2);
  assertNull(error3);
}


/**
 * Tests loading a module by user action by requesting a Deferred object.
 */
function testLoadForUser() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var calledBack = false;
  var error = null;

  var d = mm.load('a', true);
  d.addCallback(function(ctx) { calledBack = true; });
  d.addErrback(function(err) { error = err; });

  assertFalse(calledBack);
  assertNull(error);
  assertTrue(mm.isUserActive());

  clock.tick(5);

  assertTrue(calledBack);
  assertNull(error);
}


/**
 * Tests that preloading a module calls back the deferred object.
 */
function testPreloadDeferredWhenNotLoaded() {
  var mm = getModuleManager({'a': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var calledBack = false;

  var d = mm.preloadModule('a');
  d.addCallback(function(ctx) { calledBack = true; });

  // First load should take five ticks.
  assertFalse('module "a" should not be loaded yet', calledBack);
  clock.tick(5);
  assertTrue('module "a" should be loaded', calledBack);
}


/**
 * Tests preloading an already loaded module.
 */
function testPreloadDeferredWhenLoaded() {
  var mm = getModuleManager({'a': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var calledBack = false;

  mm.preloadModule('a');
  clock.tick(5);

  var d = mm.preloadModule('a');
  d.addCallback(function(ctx) { calledBack = true; });

  // Module is already loaded, should be called back after the setTimeout
  // in preloadModule.
  assertFalse('deferred for module "a" should not be called yet', calledBack);
  clock.tick(1);
  assertTrue('module "a" should be loaded', calledBack);
}


/**
 * Tests preloading a module that is currently loading.
 */
function testPreloadDeferredWhenLoading() {
  var mm = getModuleManager({'a': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  mm.preloadModule('a');
  clock.tick(1);

  // 'b' is in the middle of loading, should get called back when it's done.
  var calledBack = false;
  var d = mm.preloadModule('a');
  d.addCallback(function(ctx) { calledBack = true; });

  assertFalse('module "a" should not be loaded yet', calledBack);
  clock.tick(4);
  assertTrue('module "a" should be loaded', calledBack);
}


/**
 * Tests that load doesn't trigger another load if a module is already
 * preloading.
 */
function testLoadWhenPreloading() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var origSetLoaded = mm.setLoaded;
  var calls = [0, 0, 0];
  mm.beforeLoadModuleCode = function(id) { calls[0]++; };
  mm.setLoaded = function(id) {
    calls[1]++;
    origSetLoaded.call(mm, id);
  };
  mm.afterLoadModuleCode = function(id) { calls[2]++; };

  var calledBack = false;
  var error = null;

  mm.preloadModule('c', 2);
  assertFalse('module "c" should not be loading yet', mm.isModuleLoading('c'));
  clock.tick(2);
  assertTrue('module "c" should now be loading', mm.isModuleLoading('c'));

  var d = mm.load('c');
  d.addCallback(function(ctx) { calledBack = true; });
  d.addErrback(function(err) { error = err; });

  assertTrue('module "c" should still be loading', mm.isModuleLoading('c'));
  clock.tick(5);
  assertFalse('module "c" should be done loading', mm.isModuleLoading('c'));
  assertEquals('beforeLoad should only be called once for "c"', 1, calls[0]);
  assertEquals('setLoaded should only be called once for "c"', 1, calls[1]);
  assertEquals('afterLoad should only be called once for "c"', 1, calls[2]);

  assertTrue(calledBack);
  assertNull(error);
}


/**
 * Tests that load doesn't trigger another load if a module is already
 * preloading.
 */
function testLoadMultipleWhenPreloading() {
  var mm = getModuleManager({'a': [], 'b': ['d'], 'c': [], 'd': []});
  mm.setLoader(createSuccessfulBatchLoader(mm));
  mm.setBatchModeEnabled(true);

  var origSetLoaded = mm.setLoaded;
  var calls = {'a': [0, 0, 0], 'b': [0, 0, 0], 'c': [0, 0, 0], 'd': [0, 0, 0]};
  mm.beforeLoadModuleCode = function(id) { calls[id][0]++; };
  mm.setLoaded = function(id) {
    calls[id][1]++;
    origSetLoaded.call(mm, id);
  };
  mm.afterLoadModuleCode = function(id) { calls[id][2]++; };

  var calledBack = false;
  var error = null;
  var calledBack2 = false;
  var error2 = null;
  var calledBack3 = false;
  var error3 = null;

  mm.preloadModule('c', 2);
  mm.preloadModule('d', 3);
  assertFalse('module "c" should not be loading yet', mm.isModuleLoading('c'));
  assertFalse('module "d" should not be loading yet', mm.isModuleLoading('d'));
  clock.tick(2);
  assertTrue('module "c" should now be loading', mm.isModuleLoading('c'));
  clock.tick(1);
  assertTrue('module "d" should now be loading', mm.isModuleLoading('d'));

  var dMap = mm.loadMultiple(['a', 'b', 'c']);
  dMap['a'].addCallback(function(ctx) { calledBack = true; });
  dMap['a'].addErrback(function(err) { error = err; });
  dMap['b'].addCallback(function(ctx) { calledBack2 = true; });
  dMap['b'].addErrback(function(err) { error2 = err; });
  dMap['c'].addCallback(function(ctx) { calledBack3 = true; });
  dMap['c'].addErrback(function(err) { error3 = err; });

  assertTrue('module "a" should be loading', mm.isModuleLoading('a'));
  assertTrue('module "b" should be loading', mm.isModuleLoading('b'));
  assertTrue('module "c" should still be loading', mm.isModuleLoading('c'));
  clock.tick(4);
  assertTrue(calledBack3);

  assertFalse('module "c" should be done loading', mm.isModuleLoading('c'));
  assertTrue('module "d" should still be loading', mm.isModuleLoading('d'));
  clock.tick(5);
  assertFalse('module "d" should be done loading', mm.isModuleLoading('d'));

  assertFalse(calledBack);
  assertFalse(calledBack2);
  assertTrue('module "a" should still be loading', mm.isModuleLoading('a'));
  assertTrue('module "b" should still be loading', mm.isModuleLoading('b'));
  clock.tick(7);

  assertTrue(calledBack);
  assertTrue(calledBack2);
  assertFalse('module "a" should be done loading', mm.isModuleLoading('a'));
  assertFalse('module "b" should be done loading', mm.isModuleLoading('b'));

  assertEquals(
      'beforeLoad should only be called once for "a"', 1, calls['a'][0]);
  assertEquals(
      'setLoaded should only be called once for "a"', 1, calls['a'][1]);
  assertEquals(
      'afterLoad should only be called once for "a"', 1, calls['a'][2]);
  assertEquals(
      'beforeLoad should only be called once for "b"', 1, calls['b'][0]);
  assertEquals(
      'setLoaded should only be called once for "b"', 1, calls['b'][1]);
  assertEquals(
      'afterLoad should only be called once for "b"', 1, calls['b'][2]);
  assertEquals(
      'beforeLoad should only be called once for "c"', 1, calls['c'][0]);
  assertEquals(
      'setLoaded should only be called once for "c"', 1, calls['c'][1]);
  assertEquals(
      'afterLoad should only be called once for "c"', 1, calls['c'][2]);
  assertEquals(
      'beforeLoad should only be called once for "d"', 1, calls['d'][0]);
  assertEquals(
      'setLoaded should only be called once for "d"', 1, calls['d'][1]);
  assertEquals(
      'afterLoad should only be called once for "d"', 1, calls['d'][2]);

  assertNull(error);
  assertNull(error2);
  assertNull(error3);
}


/**
 * Tests that the deferred is still called when loadMultiple loads modules
 * that are already preloading.
 */
function testLoadMultipleWhenPreloadingSameModules() {
  var mm = getModuleManager({'a': [], 'b': ['d'], 'c': [], 'd': []});
  mm.setLoader(createSuccessfulBatchLoader(mm));
  mm.setBatchModeEnabled(true);

  var origSetLoaded = mm.setLoaded;
  var calls = {'c': [0, 0, 0], 'd': [0, 0, 0]};
  mm.beforeLoadModuleCode = function(id) { calls[id][0]++; };
  mm.setLoaded = function(id) {
    calls[id][1]++;
    origSetLoaded.call(mm, id);
  };
  mm.afterLoadModuleCode = function(id) { calls[id][2]++; };

  var calledBack = false;
  var error = null;
  var calledBack2 = false;
  var error2 = null;

  mm.preloadModule('c', 2);
  mm.preloadModule('d', 3);
  assertFalse('module "c" should not be loading yet', mm.isModuleLoading('c'));
  assertFalse('module "d" should not be loading yet', mm.isModuleLoading('d'));
  clock.tick(2);
  assertTrue('module "c" should now be loading', mm.isModuleLoading('c'));
  clock.tick(1);
  assertTrue('module "d" should now be loading', mm.isModuleLoading('d'));

  var dMap = mm.loadMultiple(['c', 'd']);
  dMap['c'].addCallback(function(ctx) { calledBack = true; });
  dMap['c'].addErrback(function(err) { error = err; });
  dMap['d'].addCallback(function(ctx) { calledBack2 = true; });
  dMap['d'].addErrback(function(err) { error2 = err; });

  assertTrue('module "c" should still be loading', mm.isModuleLoading('c'));
  clock.tick(4);
  assertFalse('module "c" should be done loading', mm.isModuleLoading('c'));
  assertTrue('module "d" should still be loading', mm.isModuleLoading('d'));
  clock.tick(5);
  assertFalse('module "d" should be done loading', mm.isModuleLoading('d'));

  assertTrue(calledBack);
  assertTrue(calledBack2);

  assertEquals(
      'beforeLoad should only be called once for "c"', 1, calls['c'][0]);
  assertEquals(
      'setLoaded should only be called once for "c"', 1, calls['c'][1]);
  assertEquals(
      'afterLoad should only be called once for "c"', 1, calls['c'][2]);
  assertEquals(
      'beforeLoad should only be called once for "d"', 1, calls['d'][0]);
  assertEquals(
      'setLoaded should only be called once for "d"', 1, calls['d'][1]);
  assertEquals(
      'afterLoad should only be called once for "d"', 1, calls['d'][2]);

  assertNull(error);
  assertNull(error2);
}


/**
 * Tests loading a module via load when the module is already
 * loaded.  The deferred's callback should be called immediately.
 */
function testLoadWhenLoaded() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var calledBack = false;
  var error = null;

  mm.preloadModule('b', 2);
  clock.tick(10);

  assertFalse('module "b" should be done loading', mm.isModuleLoading('b'));

  var d = mm.load('b');
  d.addCallback(function(ctx) { calledBack = true; });
  d.addErrback(function(err) { error = err; });

  assertTrue(calledBack);
  assertNull(error);
}


/**
 * Tests that the deferred's errbacks are called if the module fails to load.
 */
function testLoadWithFailingModule() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createUnsuccessfulLoader(mm, 401));
  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR,
      function(callbackType, id, cause) {
        assertEquals(
            'Failure cause was not as expected',
            goog.module.ModuleManager.FailureType.UNAUTHORIZED, cause);
        firedLoadFailed = true;
      });
  var calledBack = false;
  var error = null;

  var d = mm.load('a');
  d.addCallback(function(ctx) { calledBack = true; });
  d.addErrback(function(err) { error = err; });

  assertFalse(calledBack);
  assertNull(error);

  clock.tick(500);

  assertFalse(calledBack);

  // NOTE: Deferred always calls errbacks with an Error object.  For now the
  // module manager just passes the FailureType which gets set as the Error
  // object's message.
  assertEquals(
      'Failure cause was not as expected',
      goog.module.ModuleManager.FailureType.UNAUTHORIZED,
      Number(error.message));
}


/**
 * Tests that the deferred's errbacks are called if a module fails to load.
 */
function testLoadMultipleWithFailingModule() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(createUnsuccessfulLoader(mm, 401));
  mm.setBatchModeEnabled(true);
  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR,
      function(callbackType, id, cause) {
        assertEquals(
            'Failure cause was not as expected',
            goog.module.ModuleManager.FailureType.UNAUTHORIZED, cause);
      });
  var calledBack11 = false;
  var error11 = null;
  var calledBack12 = false;
  var error12 = null;
  var calledBack21 = false;
  var error21 = null;
  var calledBack22 = false;
  var error22 = null;

  var dMap = mm.loadMultiple(['a', 'b']);
  dMap['a'].addCallback(function(ctx) { calledBack11 = true; });
  dMap['a'].addErrback(function(err) { error11 = err; });
  dMap['b'].addCallback(function(ctx) { calledBack12 = true; });
  dMap['b'].addErrback(function(err) { error12 = err; });

  var dMap2 = mm.loadMultiple(['b', 'c']);
  dMap2['b'].addCallback(function(ctx) { calledBack21 = true; });
  dMap2['b'].addErrback(function(err) { error21 = err; });
  dMap2['c'].addCallback(function(ctx) { calledBack22 = true; });
  dMap2['c'].addErrback(function(err) { error22 = err; });

  assertFalse(calledBack11);
  assertFalse(calledBack12);
  assertFalse(calledBack21);
  assertFalse(calledBack22);
  assertNull(error11);
  assertNull(error12);
  assertNull(error21);
  assertNull(error22);

  clock.tick(5);

  assertFalse(calledBack11);
  assertFalse(calledBack12);
  assertFalse(calledBack21);
  assertFalse(calledBack22);

  // NOTE: Deferred always calls errbacks with an Error object.  For now the
  // module manager just passes the FailureType which gets set as the Error
  // object's message.
  assertEquals(
      'Failure cause was not as expected',
      goog.module.ModuleManager.FailureType.UNAUTHORIZED,
      Number(error11.message));
  assertEquals(
      'Failure cause was not as expected',
      goog.module.ModuleManager.FailureType.UNAUTHORIZED,
      Number(error12.message));

  // The first deferred of the second load should be called since it asks for
  // one of the failed modules.
  assertEquals(
      'Failure cause was not as expected',
      goog.module.ModuleManager.FailureType.UNAUTHORIZED,
      Number(error21.message));

  // The last deferred should be dropped so it is neither called back nor an
  // error.
  assertFalse(calledBack22);
  assertNull(error22);
}


/**
 * Tests that the right dependencies are cancelled on a loadMultiple failure.
 */
function testLoadMultipleWithFailingModuleDependencies() {
  var mm =
      getModuleManager({'a': [], 'b': [], 'c': ['b'], 'd': ['c'], 'e': []});
  mm.setLoader(createUnsuccessfulLoader(mm, 401));
  mm.setBatchModeEnabled(true);
  var cancelledIds = [];

  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR,
      function(callbackType, id, cause) {
        assertEquals(
            'Failure cause was not as expected',
            goog.module.ModuleManager.FailureType.UNAUTHORIZED, cause);
        cancelledIds.push(id);
      });
  var calledBack11 = false;
  var error11 = null;
  var calledBack12 = false;
  var error12 = null;
  var calledBack21 = false;
  var error21 = null;
  var calledBack22 = false;
  var error22 = null;
  var calledBack23 = false;
  var error23 = null;

  var dMap = mm.loadMultiple(['a', 'b']);
  dMap['a'].addCallback(function(ctx) { calledBack11 = true; });
  dMap['a'].addErrback(function(err) { error11 = err; });
  dMap['b'].addCallback(function(ctx) { calledBack12 = true; });
  dMap['b'].addErrback(function(err) { error12 = err; });

  var dMap2 = mm.loadMultiple(['c', 'd', 'e']);
  dMap2['c'].addCallback(function(ctx) { calledBack21 = true; });
  dMap2['c'].addErrback(function(err) { error21 = err; });
  dMap2['d'].addCallback(function(ctx) { calledBack22 = true; });
  dMap2['d'].addErrback(function(err) { error22 = err; });
  dMap2['e'].addCallback(function(ctx) { calledBack23 = true; });
  dMap2['e'].addErrback(function(err) { error23 = err; });

  assertFalse(calledBack11);
  assertFalse(calledBack12);
  assertFalse(calledBack21);
  assertFalse(calledBack22);
  assertFalse(calledBack23);
  assertNull(error11);
  assertNull(error12);
  assertNull(error21);
  assertNull(error22);
  assertNull(error23);

  clock.tick(5);

  assertFalse(calledBack11);
  assertFalse(calledBack12);
  assertFalse(calledBack21);
  assertFalse(calledBack22);
  assertFalse(calledBack23);

  // NOTE: Deferred always calls errbacks with an Error object.  For now the
  // module manager just passes the FailureType which gets set as the Error
  // object's message.
  assertEquals(
      'Failure cause was not as expected',
      goog.module.ModuleManager.FailureType.UNAUTHORIZED,
      Number(error11.message));
  assertEquals(
      'Failure cause was not as expected',
      goog.module.ModuleManager.FailureType.UNAUTHORIZED,
      Number(error12.message));

  // Check that among the failed modules, 'c' and 'd' are also cancelled
  // due to dependencies.
  assertTrue(goog.array.equals(['a', 'b', 'c', 'd'], cancelledIds.sort()));
}


/**
 * Tests that when loading multiple modules, the input array is not modified
 * when it has duplicates.
 */
function testLoadMultipleWithDuplicates() {
  var mm = getModuleManager({'a': [], 'b': []});
  mm.setBatchModeEnabled(true);
  mm.setLoader(createSuccessfulBatchLoader(mm));

  var listWithDuplicates = ['a', 'a', 'b'];
  mm.loadMultiple(listWithDuplicates);
  assertArrayEquals(
      'loadMultiple should not modify its input', ['a', 'a', 'b'],
      listWithDuplicates);
}


/**
 * Test loading dependencies transitively.
 */
function testLoadingDepsInNonBatchMode1() {
  var mm =
      getModuleManager({'i': [], 'j': [], 'k': ['j'], 'l': ['i', 'j', 'k']});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  mm.preloadModule('j');
  clock.tick(5);
  assertTrue('module "j" should be loaded', mm.isModuleLoaded('j'));
  assertFalse('module "i" should not be loaded (1)', mm.isModuleLoaded('i'));
  assertFalse('module "k" should not be loaded (1)', mm.isModuleLoaded('k'));
  assertFalse('module "l" should not be loaded (1)', mm.isModuleLoaded('l'));

  // When loading a module in non-batch mode, its dependencies should be
  // requested independently, and in dependency order.
  mm.preloadModule('l');
  clock.tick(5);
  assertTrue('module "i" should be loaded', mm.isModuleLoaded('i'));
  assertFalse('module "k" should not be loaded (2)', mm.isModuleLoaded('k'));
  assertFalse('module "l" should not be loaded (2)', mm.isModuleLoaded('l'));
  clock.tick(5);
  assertTrue('module "k" should be loaded', mm.isModuleLoaded('k'));
  assertFalse('module "l" should not be loaded (3)', mm.isModuleLoaded('l'));
  clock.tick(5);
  assertTrue('module "l" should be loaded', mm.isModuleLoaded('l'));
}


/**
 * Test loading dependencies transitively and in dependency order.
 */
function testLoadingDepsInNonBatchMode2() {
  var mm = getModuleManager({
    'h': [],
    'i': ['h'],
    'j': ['i'],
    'k': ['j'],
    'l': ['i', 'j', 'k'],
    'm': ['l']
  });
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  // When loading a module in non-batch mode, its dependencies should be
  // requested independently, and in dependency order. The order in this
  // case should be h,i,j,k,l,m.
  mm.preloadModule('m');
  clock.tick(5);
  assertTrue('module "h" should be loaded', mm.isModuleLoaded('h'));
  assertFalse('module "i" should not be loaded (1)', mm.isModuleLoaded('i'));
  assertFalse('module "j" should not be loaded (1)', mm.isModuleLoaded('j'));
  assertFalse('module "k" should not be loaded (1)', mm.isModuleLoaded('k'));
  assertFalse('module "l" should not be loaded (1)', mm.isModuleLoaded('l'));
  assertFalse('module "m" should not be loaded (1)', mm.isModuleLoaded('m'));

  clock.tick(5);
  assertTrue('module "i" should be loaded', mm.isModuleLoaded('i'));
  assertFalse('module "j" should not be loaded (2)', mm.isModuleLoaded('j'));
  assertFalse('module "k" should not be loaded (2)', mm.isModuleLoaded('k'));
  assertFalse('module "l" should not be loaded (2)', mm.isModuleLoaded('l'));
  assertFalse('module "m" should not be loaded (2)', mm.isModuleLoaded('m'));

  clock.tick(5);
  assertTrue('module "j" should be loaded', mm.isModuleLoaded('j'));
  assertFalse('module "k" should not be loaded (3)', mm.isModuleLoaded('k'));
  assertFalse('module "l" should not be loaded (3)', mm.isModuleLoaded('l'));
  assertFalse('module "m" should not be loaded (3)', mm.isModuleLoaded('m'));

  clock.tick(5);
  assertTrue('module "k" should be loaded', mm.isModuleLoaded('k'));
  assertFalse('module "l" should not be loaded (4)', mm.isModuleLoaded('l'));
  assertFalse('module "m" should not be loaded (4)', mm.isModuleLoaded('m'));

  clock.tick(5);
  assertTrue('module "l" should be loaded', mm.isModuleLoaded('l'));
  assertFalse('module "m" should not be loaded (5)', mm.isModuleLoaded('m'));

  clock.tick(5);
  assertTrue('module "m" should be loaded', mm.isModuleLoaded('m'));
}

function testLoadingDepsInBatchMode() {
  var mm =
      getModuleManager({'e': [], 'f': [], 'g': ['f'], 'h': ['e', 'f', 'g']});
  mm.setLoader(createSuccessfulBatchLoader(mm));
  mm.setBatchModeEnabled(true);

  mm.preloadModule('f');
  clock.tick(5);
  assertTrue('module "f" should be loaded', mm.isModuleLoaded('f'));
  assertFalse('module "e" should not be loaded (1)', mm.isModuleLoaded('e'));
  assertFalse('module "g" should not be loaded (1)', mm.isModuleLoaded('g'));
  assertFalse('module "h" should not be loaded (1)', mm.isModuleLoaded('h'));

  // When loading a module in batch mode, its not-yet-loaded dependencies
  // should be requested at the same time, and in dependency order.
  mm.preloadModule('h');
  clock.tick(5);
  assertTrue('module "e" should be loaded', mm.isModuleLoaded('e'));
  assertFalse('module "g" should not be loaded (2)', mm.isModuleLoaded('g'));
  assertFalse('module "h" should not be loaded (2)', mm.isModuleLoaded('h'));
  clock.tick(2);
  assertTrue('module "g" should be loaded', mm.isModuleLoaded('g'));
  assertFalse('module "h" should not be loaded (3)', mm.isModuleLoaded('h'));
  clock.tick(2);
  assertTrue('module "h" should be loaded', mm.isModuleLoaded('h'));
}


/**
 * Test unauthorized errors while loading modules.
 */
function testUnauthorizedLoading() {
  var mm = getModuleManager({'m': [], 'n': [], 'o': ['n']});
  mm.setLoader(createUnsuccessfulLoader(mm, 401));

  // Callback checks for an unauthorized error
  var firedLoadFailed = false;
  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR,
      function(callbackType, id, cause) {
        assertEquals(
            'Failure cause was not as expected',
            goog.module.ModuleManager.FailureType.UNAUTHORIZED, cause);
        firedLoadFailed = true;
      });
  mm.execOnLoad('o', function() {});
  assertTrue('module "o" should be loading', mm.isModuleLoading('o'));
  assertTrue('module "n" should be loading', mm.isModuleLoading('n'));
  clock.tick(5);
  assertTrue(
      'should have called unauthorized module callback', firedLoadFailed);
  assertFalse('module "o" should not be loaded', mm.isModuleLoaded('o'));
  assertFalse('module "o" should not be loading', mm.isModuleLoading('o'));
  assertFalse('module "n" should not be loaded', mm.isModuleLoaded('n'));
  assertFalse('module "n" should not be loading', mm.isModuleLoading('n'));
}


/**
 * Test error loading modules which are retried.
 */
function testErrorLoadingModule() {
  var mm = getModuleManager({'p': ['q'], 'q': [], 'r': ['q', 'p']});
  mm.setLoader(createUnsuccessfulLoader(mm, 500));

  mm.preloadModule('r');
  clock.tick(4);

  // A module request is now underway using the unsuccessful loader.
  // We substitute a successful loader for future module load requests.
  mm.setLoader(createSuccessfulNonBatchLoader(mm));
  clock.tick(1);
  assertFalse('module "q" should not be loaded (1)', mm.isModuleLoaded('q'));
  assertFalse('module "p" should not be loaded (1)', mm.isModuleLoaded('p'));
  assertFalse('module "r" should not be loaded (1)', mm.isModuleLoaded('r'));

  // Failed loads are automatically retried after a backOff.
  clock.tick(5 + mm.getBackOff_());
  assertTrue('module "q" should be loaded', mm.isModuleLoaded('q'));
  assertFalse('module "p" should not be loaded (2)', mm.isModuleLoaded('p'));
  assertFalse('module "r" should not be loaded (2)', mm.isModuleLoaded('r'));

  // A successful load decrements the backOff.
  clock.tick(5);
  assertTrue('module "p" should be loaded', mm.isModuleLoaded('p'));
  assertFalse('module "r" should not be loaded (3)', mm.isModuleLoaded('r'));
  clock.tick(5);
  assertTrue('module "r" should be loaded', mm.isModuleLoaded('r'));
}


/**
 * Tests error loading modules which are retried.
 */
function testErrorLoadingModule_batchMode() {
  var mm = getModuleManager({'p': ['q'], 'q': [], 'r': ['q', 'p']});
  mm.setLoader(createUnsuccessfulBatchLoader(mm, 500));
  mm.setBatchModeEnabled(true);

  mm.preloadModule('r');
  clock.tick(4);

  // A module request is now underway using the unsuccessful loader.
  // We substitute a successful loader for future module load requests.
  mm.setLoader(createSuccessfulBatchLoader(mm));
  clock.tick(1);
  assertFalse('module "q" should not be loaded (1)', mm.isModuleLoaded('q'));
  assertFalse('module "p" should not be loaded (1)', mm.isModuleLoaded('p'));
  assertFalse('module "r" should not be loaded (1)', mm.isModuleLoaded('r'));

  // Failed loads are automatically retried after a backOff.
  clock.tick(5 + mm.getBackOff_());
  assertTrue('module "q" should be loaded', mm.isModuleLoaded('q'));
  clock.tick(2);
  assertTrue('module "p" should not be loaded (2)', mm.isModuleLoaded('p'));
  clock.tick(2);
  assertTrue('module "r" should not be loaded (2)', mm.isModuleLoaded('r'));
}


/**
 * Test consecutive errors in loading modules.
 */
function testConsecutiveErrors() {
  var mm = getModuleManager({'s': []});
  mm.setLoader(createUnsuccessfulLoader(mm, 500));

  // Register an error callback for consecutive failures.
  var firedLoadFailed = false;
  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR,
      function(callbackType, id, cause) {
        assertEquals(
            'Failure cause was not as expected',
            goog.module.ModuleManager.FailureType.CONSECUTIVE_FAILURES, cause);
        firedLoadFailed = true;
      });

  mm.preloadModule('s');
  assertFalse('module "s" should not be loaded (0)', mm.isModuleLoaded('s'));

  // Fail twice.
  for (var i = 0; i < 2; i++) {
    clock.tick(5 + mm.getBackOff_());
    assertFalse('module "s" should not be loaded (1)', mm.isModuleLoaded('s'));
    assertFalse('should not fire failed callback (1)', firedLoadFailed);
  }

  // Fail a third time and check that the callback is fired.
  clock.tick(5 + mm.getBackOff_());
  assertFalse('module "s" should not be loaded (2)', mm.isModuleLoaded('s'));
  assertTrue('should have fired failed callback', firedLoadFailed);

  // Check that it doesn't attempt to load the module anymore after it has
  // failed.
  var triedLoad = false;
  mm.setLoader({
    loadModules: function(ids, moduleInfoMap, opt_successFn, opt_errFn) {
      triedLoad = true;
    }
  });

  // Also reset the failed callback flag and make sure it isn't called
  // again.
  firedLoadFailed = false;
  clock.tick(10 + mm.getBackOff_());
  assertFalse('module "s" should not be loaded (3)', mm.isModuleLoaded('s'));
  assertFalse('No more loads should have been tried', triedLoad);
  assertFalse(
      'The load failed callback should be fired only once', firedLoadFailed);
}


/**
 * Test loading errors due to old code.
 */
function testOldCodeGoneError() {
  var mm = getModuleManager({'s': []});
  mm.setLoader(createUnsuccessfulLoader(mm, 410));

  // Callback checks for an old code failure
  var firedLoadFailed = false;
  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR,
      function(callbackType, id, cause) {
        assertEquals(
            'Failure cause was not as expected',
            goog.module.ModuleManager.FailureType.OLD_CODE_GONE, cause);
        firedLoadFailed = true;
      });

  mm.preloadModule('s', 0);
  assertFalse('module "s" should not be loaded (0)', mm.isModuleLoaded('s'));
  clock.tick(5);
  assertFalse('module "s" should not be loaded (1)', mm.isModuleLoaded('s'));
  assertTrue('should have called old code gone callback', firedLoadFailed);
}


/**
 * Test timeout.
 */
function testTimeout() {
  var mm = getModuleManager({'s': []});
  mm.setLoader(createTimeoutLoader(mm));

  // Callback checks for timeout
  var firedTimeout = false;
  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR,
      function(callbackType, id, cause) {
        assertEquals(
            'Failure cause was not as expected',
            goog.module.ModuleManager.FailureType.TIMEOUT, cause);
        firedTimeout = true;
      });

  mm.preloadModule('s', 0);
  assertFalse('module "s" should not be loaded (0)', mm.isModuleLoaded('s'));
  clock.tick(5);
  assertFalse('module "s" should not be loaded (1)', mm.isModuleLoaded('s'));
  assertTrue('should have called timeout callback', firedTimeout);
}


/**
 * Tests that an error during execOnLoad will trigger the error callback.
 */
function testExecOnLoadError() {
  // Expect two callbacks, each of which will be called with callback type
  // ERROR, the right module id and failure type INIT_ERROR.
  var errorCallback1 = goog.testing.createFunctionMock('callback1');
  errorCallback1(
      goog.module.ModuleManager.CallbackType.ERROR, 'b',
      goog.module.ModuleManager.FailureType.INIT_ERROR);

  var errorCallback2 = goog.testing.createFunctionMock('callback2');
  errorCallback2(
      goog.module.ModuleManager.CallbackType.ERROR, 'b',
      goog.module.ModuleManager.FailureType.INIT_ERROR);

  errorCallback1.$replay();
  errorCallback2.$replay();

  var mm = new goog.module.ModuleManager();
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  // Register the first callback before setting the module info map.
  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR, errorCallback1);

  mm.setAllModuleInfo({'a': [], 'b': [], 'c': []});

  // Register the second callback after setting the module info map.
  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR, errorCallback2);

  var execOnLoadBCalled = false;
  mm.execOnLoad('b', function() {
    execOnLoadBCalled = true;
    throw new Error();
  });

  assertThrows(function() { clock.tick(5); });

  assertTrue(
      'execOnLoad should have been called on module b.', execOnLoadBCalled);
  errorCallback1.$verify();
  errorCallback2.$verify();
}


/**
 * Tests that an error during execOnLoad will trigger the error callback.
 * Uses setAllModuleInfoString rather than setAllModuleInfo.
 */
function testExecOnLoadErrorModuleInfoString() {
  // Expect a callback to be called with callback type ERROR, the right module
  // id and failure type INIT_ERROR.
  var errorCallback = goog.testing.createFunctionMock('callback');
  errorCallback(
      goog.module.ModuleManager.CallbackType.ERROR, 'b',
      goog.module.ModuleManager.FailureType.INIT_ERROR);

  errorCallback.$replay();

  var mm = new goog.module.ModuleManager();
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  // Register the first callback before setting the module info map.
  mm.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR, errorCallback);

  mm.setAllModuleInfoString('a/b/c');

  var execOnLoadBCalled = false;
  mm.execOnLoad('b', function() {
    execOnLoadBCalled = true;
    throw new Error();
  });

  assertThrows(function() { clock.tick(5); });

  assertTrue(
      'execOnLoad should have been called on module b.', execOnLoadBCalled);
  errorCallback.$verify();
}


/**
 * Make sure ModuleInfo objects in moduleInfoMap_ get disposed.
 */
function testDispose() {
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});

  var moduleInfoA = mm.getModuleInfo('a');
  assertNotNull(moduleInfoA);
  var moduleInfoB = mm.getModuleInfo('b');
  assertNotNull(moduleInfoB);
  var moduleInfoC = mm.getModuleInfo('c');
  assertNotNull(moduleInfoC);

  mm.dispose();
  assertTrue(moduleInfoA.isDisposed());
  assertTrue(moduleInfoB.isDisposed());
  assertTrue(moduleInfoC.isDisposed());
}

function testDependencyOrderingWithSimpleDeps() {
  var mm = getModuleManager({
    'a': ['b', 'c'],
    'b': ['d'],
    'c': ['e', 'f'],
    'd': [],
    'e': [],
    'f': []
  });
  var ids = mm.getNotYetLoadedTransitiveDepIds_('a');
  assertDependencyOrder(ids, mm);
  assertArrayEquals(['d', 'e', 'f', 'b', 'c', 'a'], ids);
}

function testDependencyOrderingWithCommonDepsInDeps() {
  // Tests to make sure that if dependencies of the root are loaded before
  // their common dependencies.
  var mm = getModuleManager({'a': ['b', 'c'], 'b': ['d'], 'c': ['d'], 'd': []});
  var ids = mm.getNotYetLoadedTransitiveDepIds_('a');
  assertDependencyOrder(ids, mm);
  assertArrayEquals(['d', 'b', 'c', 'a'], ids);
}

function testDependencyOrderingWithCommonDepsInRoot1() {
  // Tests the case where a dependency of the root depends on another
  // dependency of the root.  Irregardless of ordering in the root's
  // deps.
  var mm = getModuleManager({'a': ['b', 'c'], 'b': ['c'], 'c': []});
  var ids = mm.getNotYetLoadedTransitiveDepIds_('a');
  assertDependencyOrder(ids, mm);
  assertArrayEquals(['c', 'b', 'a'], ids);
}

function testDependencyOrderingWithCommonDepsInRoot2() {
  // Tests the case where a dependency of the root depends on another
  // dependency of the root.  Irregardless of ordering in the root's
  // deps.
  var mm = getModuleManager({'a': ['b', 'c'], 'b': [], 'c': ['b']});
  var ids = mm.getNotYetLoadedTransitiveDepIds_('a');
  assertDependencyOrder(ids, mm);
  assertArrayEquals(['b', 'c', 'a'], ids);
}

function testDependencyOrderingWithGmailExample() {
  // Real dependency graph taken from gmail.
  var mm = getModuleManager({
    's': ['dp', 'ml', 'md'],
    'dp': ['a'],
    'ml': ['ld', 'm'],
    'ld': ['a'],
    'm': ['ad', 'mh', 'n'],
    'md': ['mh', 'ld'],
    'a': [],
    'mh': [],
    'ad': [],
    'n': []
  });

  mm.setLoaded('a');
  mm.setLoaded('m');
  mm.setLoaded('n');
  mm.setLoaded('ad');
  mm.setLoaded('mh');

  var ids = mm.getNotYetLoadedTransitiveDepIds_('s');
  assertDependencyOrder(ids, mm);
  assertArrayEquals(['ld', 'dp', 'ml', 'md', 's'], ids);
}

function assertDependencyOrder(list, mm) {
  var seen = {};
  for (var i = 0; i < list.length; i++) {
    var id = list[i];
    seen[id] = true;
    var deps = mm.getModuleInfo(id).getDependencies();
    for (var j = 0; j < deps.length; j++) {
      var dep = deps[j];
      assertTrue(
          'Unresolved dependency [' + dep + '] for [' + id + '].',
          seen[dep] || mm.getModuleInfo(dep).isLoaded());
    }
  }
}

function testRegisterInitializationCallback() {
  var initCalled = 0;
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  mm.setLoader(
      createSuccessfulNonBatchLoaderWithRegisterInitCallback(
          mm, function() { ++initCalled; }));
  execOnLoad_(mm);
  // execOnLoad_ loads modules a and c
  assertTrue(initCalled == 2);
}

function createSuccessfulNonBatchLoaderWithRegisterInitCallback(moduleMgr, fn) {
  return {
    loadModules: function(
        ids, moduleInfoMap, opt_successFn, opt_errFn, opt_timeoutFn) {
      moduleMgr.beforeLoadModuleCode(ids[0]);
      moduleMgr.registerInitializationCallback(fn);
      setTimeout(function() {
        moduleMgr.setLoaded(ids[0]);
        moduleMgr.afterLoadModuleCode(ids[0]);
        if (opt_successFn) {
          opt_successFn();
        }
      }, 5);
    }
  };
}

function testSetModuleConstructor() {
  var initCalled = 0;
  var mm = getModuleManager({'a': [], 'b': [], 'c': []});
  var info = {
    'a': {ctor: AModule, count: 0},
    'b': {ctor: BModule, count: 0},
    'c': {ctor: CModule, count: 0}
  };
  function AModule() {
    ++info['a'].count;
    goog.module.BaseModule.call(this);
  }
  goog.inherits(AModule, goog.module.BaseModule);
  function BModule() {
    ++info['b'].count;
    goog.module.BaseModule.call(this);
  }
  goog.inherits(BModule, goog.module.BaseModule);
  function CModule() {
    ++info['c'].count;
    goog.module.BaseModule.call(this);
  }
  goog.inherits(CModule, goog.module.BaseModule);

  mm.setLoader(createSuccessfulNonBatchLoaderWithConstructor(mm, info));
  execOnLoad_(mm);
  assertTrue(info['a'].count == 1);
  assertTrue(info['b'].count == 0);
  assertTrue(info['c'].count == 1);
  assertTrue(mm.getModuleInfo('a').getModule() instanceof AModule);
  assertTrue(mm.getModuleInfo('c').getModule() instanceof CModule);
}


/**
 * Tests that a call to load the loading module during module initialization
 * doesn't trigger a second load.
 */
function testLoadWhenInitializing() {
  var mm = getModuleManager({'a': []});
  mm.setLoader(createSuccessfulNonBatchLoader(mm));

  var info = {'a': {ctor: AModule, count: 0}};
  function AModule() {
    ++info['a'].count;
    goog.module.BaseModule.call(this);
  }
  goog.inherits(AModule, goog.module.BaseModule);
  AModule.prototype.initialize = function() { mm.load('a'); };
  mm.setLoader(createSuccessfulNonBatchLoaderWithConstructor(mm, info));
  mm.preloadModule('a');
  clock.tick(5);
  assertEquals(info['a'].count, 1);
}

function testErrorInEarlyCallback() {
  var errback = goog.testing.recordFunction();
  var callback = goog.testing.recordFunction();
  var mm = getModuleManager({'a': [], 'b': ['a']});
  mm.getModuleInfo('a').registerEarlyCallback(goog.functions.error('error'));
  mm.getModuleInfo('a').registerCallback(callback);
  mm.getModuleInfo('a').registerErrback(errback);

  mm.setLoader(
      createSuccessfulNonBatchLoaderWithConstructor(
          mm, createModulesFor('a', 'b')));
  mm.preloadModule('b');
  var e = assertThrows(function() { clock.tick(5); });

  assertEquals('error', e.message);
  assertEquals(0, callback.getCallCount());
  assertEquals(1, errback.getCallCount());
  assertEquals(
      goog.module.ModuleManager.FailureType.INIT_ERROR,
      errback.getLastCall().getArguments()[0]);
  assertTrue(mm.getModuleInfo('a').isLoaded());
  assertFalse(mm.getModuleInfo('b').isLoaded());

  clock.tick(5);
  assertTrue(mm.getModuleInfo('b').isLoaded());
}

function testErrorInNormalCallback() {
  var earlyCallback = goog.testing.recordFunction();
  var errback = goog.testing.recordFunction();
  var mm = getModuleManager({'a': [], 'b': ['a']});
  mm.getModuleInfo('a').registerEarlyCallback(earlyCallback);
  mm.getModuleInfo('a').registerEarlyCallback(goog.functions.error('error'));
  mm.getModuleInfo('a').registerErrback(errback);

  mm.setLoader(
      createSuccessfulNonBatchLoaderWithConstructor(
          mm, createModulesFor('a', 'b')));
  mm.preloadModule('b');
  var e = assertThrows(function() { clock.tick(10); });
  clock.tick(10);

  assertEquals('error', e.message);
  assertEquals(1, errback.getCallCount());
  assertEquals(
      goog.module.ModuleManager.FailureType.INIT_ERROR,
      errback.getLastCall().getArguments()[0]);
  assertTrue(mm.getModuleInfo('a').isLoaded());
  assertTrue(mm.getModuleInfo('b').isLoaded());
}

function testErrorInErrback() {
  var mm = getModuleManager({'a': [], 'b': ['a']});
  mm.getModuleInfo('a').registerCallback(goog.functions.error('error1'));
  mm.getModuleInfo('a').registerErrback(goog.functions.error('error2'));

  mm.setLoader(
      createSuccessfulNonBatchLoaderWithConstructor(
          mm, createModulesFor('a', 'b')));
  mm.preloadModule('a');
  var e = assertThrows(function() { clock.tick(10); });
  assertEquals('error1', e.message);
  var e = assertThrows(function() { clock.tick(10); });
  assertEquals('error2', e.message);
  assertTrue(mm.getModuleInfo('a').isLoaded());
}

function createModulesFor(var_args) {
  var result = {};
  for (var i = 0; i < arguments.length; i++) {
    var key = arguments[i];
    result[key] = {ctor: goog.module.BaseModule};
  }
  return result;
}

function createSuccessfulNonBatchLoaderWithConstructor(moduleMgr, info) {
  return {
    loadModules: function(
        ids, moduleInfoMap, opt_successFn, opt_errFn, opt_timeoutFn) {
      setTimeout(function() {
        moduleMgr.beforeLoadModuleCode(ids[0]);
        moduleMgr.setModuleConstructor(info[ids[0]].ctor);
        moduleMgr.setLoaded(ids[0]);
        moduleMgr.afterLoadModuleCode(ids[0]);
        if (opt_successFn) {
          opt_successFn();
        }
      }, 5);
    }
  };
}

function testInitCallbackInBaseModule() {
  var mm = new goog.module.ModuleManager();
  var called = false;
  var context;
  mm.registerInitializationCallback(function(mcontext) {
    called = true;
    context = mcontext;
  });
  mm.setAllModuleInfo({'a': [], 'b': ['a']});
  assertTrue('Base initialization not called', called);
  assertNull('Context should still be null', context);

  var mm = new goog.module.ModuleManager();
  called = false;
  mm.registerInitializationCallback(function(mcontext) {
    called = true;
    context = mcontext;
  });
  var appContext = {};
  mm.setModuleContext(appContext);
  assertTrue('Base initialization not called after setModuleContext', called);
  assertEquals('Did not receive module context', appContext, context);
}

function testSetAllModuleInfoString() {
  var info = 'base/one:0/two:0/three:0,1,2/four:0,3/five:';
  var mm = new goog.module.ModuleManager();
  mm.setAllModuleInfoString(info);

  assertNotNull('Base should exist', mm.getModuleInfo('base'));
  assertNotNull('One should exist', mm.getModuleInfo('one'));
  assertNotNull('Two should exist', mm.getModuleInfo('two'));
  assertNotNull('Three should exist', mm.getModuleInfo('three'));
  assertNotNull('Four should exist', mm.getModuleInfo('four'));
  assertNotNull('Five should exist', mm.getModuleInfo('five'));

  assertArrayEquals(
      ['base', 'one', 'two'], mm.getModuleInfo('three').getDependencies());
  assertArrayEquals(
      ['base', 'three'], mm.getModuleInfo('four').getDependencies());
  assertArrayEquals([], mm.getModuleInfo('five').getDependencies());
}

function testSetAllModuleInfoStringWithEmptyString() {
  var mm = new goog.module.ModuleManager();
  var called = false;
  var context;
  mm.registerInitializationCallback(function(mcontext) {
    called = true;
    context = mcontext;
  });
  mm.setAllModuleInfoString('');
  assertTrue('Initialization not called', called);
}

function testBackOffAmounts() {
  var mm = new goog.module.ModuleManager();
  assertEquals(0, mm.getBackOff_());

  mm.consecutiveFailures_++;
  assertEquals(5000, mm.getBackOff_());

  mm.consecutiveFailures_++;
  assertEquals(20000, mm.getBackOff_());
}


/**
 * Tests that the IDLE callbacks are executed for active->idle transitions
 * after setAllModuleInfoString with currently loading modules.
 */
function testIdleCallbackWithInitialModules() {
  var callback = goog.testing.recordFunction();

  var mm = new goog.module.ModuleManager();
  mm.setAllModuleInfoString('a', ['a']);
  mm.registerCallback(goog.module.ModuleManager.CallbackType.IDLE, callback);

  assertTrue(mm.isActive());

  mm.beforeLoadModuleCode('a');

  assertEquals(0, callback.getCallCount());

  mm.setLoaded('a');
  mm.afterLoadModuleCode('a');

  assertFalse(mm.isActive());

  assertEquals(1, callback.getCallCount());
}
