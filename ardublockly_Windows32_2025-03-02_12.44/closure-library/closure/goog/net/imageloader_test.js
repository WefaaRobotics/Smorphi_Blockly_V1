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

goog.provide('goog.net.ImageLoaderTest');
goog.setTestOnly('goog.net.ImageLoaderTest');

goog.require('goog.Promise');
goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.dispose');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.net.ImageLoader');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


var TEST_EVENT_TYPES = [
  goog.events.EventType.LOAD, goog.net.EventType.COMPLETE,
  goog.net.EventType.ERROR
];


/**
 * Mapping from test image file name to:
 * [expected width, expected height, expected event to be fired].
 */
var TEST_IMAGES = {
  'imageloader_testimg1.gif': [20, 20, goog.events.EventType.LOAD],
  'imageloader_testimg2.gif': [20, 20, goog.events.EventType.LOAD],
  'imageloader_testimg3.gif': [32, 32, goog.events.EventType.LOAD],

  'this-is-not-image-1.gif': [0, 0, goog.net.EventType.ERROR],
  'this-is-not-image-2.gif': [0, 0, goog.net.EventType.ERROR]
};


var startTime;
var loader;


function setUpPage() {
  // Increase the timeout to 5 seconds to allow more time for images to load.
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 5 * 1000;
}


function setUp() {
  startTime = goog.now();

  loader = new goog.net.ImageLoader();

  // Adds test images to the loader.
  var i = 0;
  for (var key in TEST_IMAGES) {
    var imageId = 'img_' + i++;
    loader.addImage(imageId, key);
  }
}


function tearDown() {
  goog.dispose(loader);
}


/**
 * Tests loading image and disposing before loading completes.
 */
function testDisposeInTheMiddleOfLoadingWorks() {
  var resolver = goog.Promise.withResolver();

  goog.events.listen(loader, TEST_EVENT_TYPES, function(e) {
    assertFalse(
        'Handler is still invoked after loader is disposed.',
        loader.isDisposed());

    switch (e.type) {
      case goog.net.EventType.COMPLETE:
        resolver.reject('This test should never get COMPLETE event.');
        return;

      case goog.events.EventType.LOAD:
      case goog.net.EventType.ERROR:
        loader.dispose();
        break;
    }

    // Make sure that handler is never called again after disposal before
    // marking test as successful.
    goog.Timer.callOnce(function() { resolver.resolve(); }, 500);
  });

  loader.start();
  return resolver.promise;
}


/**
 * Tests loading of images until completion.
 */
function testLoadingUntilCompletion() {
  var resolver = goog.Promise.withResolver();
  var results = {};
  goog.events.listen(loader, TEST_EVENT_TYPES, function(e) {
    switch (e.type) {
      case goog.events.EventType.LOAD:
        var image = e.target;
        results[image.src.substring(image.src.lastIndexOf('/') + 1)] =
            [image.naturalWidth, image.naturalHeight, e.type];
        return;

      case goog.net.EventType.ERROR:
        var image = e.target;
        results[image.src.substring(image.src.lastIndexOf('/') + 1)] =
            [image.naturalWidth, image.naturalHeight, e.type];
        return;

      case goog.net.EventType.COMPLETE:
        try {
          assertImagesAreCorrect(results);
        } catch (e) {
          resolver.reject(e);
          return;
        }
        resolver.resolve();
        return;
    }
  });

  loader.start();
  return resolver.promise;
}


function assertImagesAreCorrect(results) {
  assertEquals(
      goog.object.getCount(TEST_IMAGES), goog.object.getCount(results));
  goog.object.forEach(TEST_IMAGES, function(value, key) {
    // Check if fires the COMPLETE event.
    assertTrue('Image is not loaded completely.', key in results);

    var image = results[key];

    // Check image size.
    assertEquals('Image width is not correct', value[0], image[0]);
    assertEquals('Image length is not correct', value[1], image[1]);

    // Check if fired the correct event.
    assertEquals('Event *' + value[2] + '* must be fired', value[2], image[2]);
  });
}


/**
 * Overrides the loader's loadImage_ method so that it dispatches an image
 * loaded event immediately, causing any event listners to receive them
 * synchronously.  This allows tests to assume synchronous execution.
 */
function makeLoaderSynchronous(loader) {
  var originalLoadImage = loader.loadImage_;
  loader.loadImage_ = function(request, id) {
    originalLoadImage.call(this, request, id);

    var event = new goog.events.Event(goog.events.EventType.LOAD);
    event.currentTarget = this.imageIdToImageMap_[id];
    loader.onNetworkEvent_(event);
  };

  // Make listen() a no-op.
  loader.handler_.listen = goog.nullFunction;
}


/**
 * Verifies that if an additional image is added after start() was called, but
 * before COMPLETE was dispatched, no COMPLETE event is sent.  Verifies COMPLETE
 * is finally sent when .start() is called again and all images have now
 * completed loading.
 */
function testImagesAddedAfterStart() {
  // Use synchronous image loading.
  makeLoaderSynchronous(loader);

  // Add another image once the first images finishes loading.
  goog.events.listenOnce(loader, goog.events.EventType.LOAD, function() {
    loader.addImage('extra_image', 'extra_image.gif');
  });

  // Keep track of the total # of image loads.
  var loadRecordFn = goog.testing.recordFunction();
  goog.events.listen(loader, goog.events.EventType.LOAD, loadRecordFn);

  // Keep track of how many times COMPLETE was dispatched.
  var completeRecordFn = goog.testing.recordFunction();
  goog.events.listen(loader, goog.net.EventType.COMPLETE, completeRecordFn);

  // Start testing.
  loader.start();
  assertEquals(
      'COMPLETE event should not have been dispatched yet: An image was ' +
          'added after the initial batch was started.',
      0, completeRecordFn.getCallCount());
  assertEquals(
      'Just the test images should have loaded',
      goog.object.getCount(TEST_IMAGES), loadRecordFn.getCallCount());

  loader.start();
  assertEquals(
      'COMPLETE should have been dispatched once.', 1,
      completeRecordFn.getCallCount());
  assertEquals(
      'All images should have been loaded',
      goog.object.getCount(TEST_IMAGES) + 1, loadRecordFn.getCallCount());
}


/**
 * Verifies that more images can be added after an upload starts, and start()
 * can be called for them, resulting in just one COMPLETE event once all the
 * images have completed.
 */
function testImagesAddedAndStartedAfterStart() {
  // Use synchronous image loading.
  makeLoaderSynchronous(loader);

  // Keep track of the total # of image loads.
  var loadRecordFn = goog.testing.recordFunction();
  goog.events.listen(loader, goog.events.EventType.LOAD, loadRecordFn);

  // Add more images once the first images finishes loading, and call start()
  // to get them going.
  goog.events.listenOnce(loader, goog.events.EventType.LOAD, function(e) {
    loader.addImage('extra_image', 'extra_image.gif');
    loader.addImage('extra_image2', 'extra_image2.gif');
    loader.start();
  });

  // Keep track of how many times COMPLETE was dispatched.
  var completeRecordFn = goog.testing.recordFunction();
  goog.events.listen(loader, goog.net.EventType.COMPLETE, completeRecordFn);

  // Start testing.  Make sure all 7 images loaded.
  loader.start();
  assertEquals(
      'COMPLETE should have been dispatched once.', 1,
      completeRecordFn.getCallCount());
  assertEquals(
      'All images should have been loaded',
      goog.object.getCount(TEST_IMAGES) + 2, loadRecordFn.getCallCount());
}


/**
 * Verifies that if images are removed after loading has started, COMPLETE
 * is dispatched once the remaining images have finished.
 */
function testImagesRemovedAfterStart() {
  // Use synchronous image loading.
  makeLoaderSynchronous(loader);

  // Remove 2 images once the first image finishes loading.
  goog.events.listenOnce(loader, goog.events.EventType.LOAD, function(e) {
    loader.removeImage(
        goog.array.peek(goog.object.getKeys(this.imageIdToRequestMap_)));
    loader.removeImage(
        goog.array.peek(goog.object.getKeys(this.imageIdToRequestMap_)));
  });

  // Keep track of the total # of image loads.
  var loadRecordFn = goog.testing.recordFunction();
  goog.events.listen(loader, goog.events.EventType.LOAD, loadRecordFn);

  // Keep track of how many times COMPLETE was dispatched.
  var completeRecordFn = goog.testing.recordFunction();
  goog.events.listen(loader, goog.net.EventType.COMPLETE, completeRecordFn);

  // Start testing.  Make sure only the 3 images remaining loaded.
  loader.start();
  assertEquals(
      'COMPLETE should have been dispatched once.', 1,
      completeRecordFn.getCallCount());
  assertEquals(
      'All images should have been loaded',
      goog.object.getCount(TEST_IMAGES) - 2, loadRecordFn.getCallCount());
}


/**
 * Verifies that the correct image attribute is set when using CORS requests.
 */
function testSetsCorsAttribute() {
  // Use synchronous image loading.
  makeLoaderSynchronous(loader);

  // Verify the crossOrigin attribute of the requested images.
  goog.events.listen(loader, goog.events.EventType.LOAD, function(e) {
    var image = e.target;
    if (image.id == 'cors_request') {
      assertEquals(
          'CORS requested image should have a crossOrigin attribute set',
          'anonymous', image.crossOrigin);
    } else {
      assertTrue(
          'Non-CORS requested images should not have a crossOrigin attribute',
          goog.string.isEmptyOrWhitespace(
              goog.string.makeSafe(image.crossOrigin)));
    }
  });

  // Make a new request for one of the images, this time using CORS.
  var srcs = goog.object.getKeys(TEST_IMAGES);
  loader.addImage(
      'cors_request', srcs[0], goog.net.ImageLoader.CorsRequestType.ANONYMOUS);
  loader.start();
}
