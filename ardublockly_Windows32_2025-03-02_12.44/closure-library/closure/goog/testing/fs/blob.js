// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Mock blob object.
 *
 */

goog.provide('goog.testing.fs.Blob');

goog.require('goog.crypt.base64');



/**
 * A mock Blob object. The data is stored as a string.
 *
 * @param {string=} opt_data The string data encapsulated by the blob.
 * @param {string=} opt_type The mime type of the blob.
 * @constructor
 */
goog.testing.fs.Blob = function(opt_data, opt_type) {
  /**
   * @see http://www.w3.org/TR/FileAPI/#dfn-type
   * @type {string}
   */
  this.type = opt_type || '';

  this.setDataInternal(opt_data || '');
};


/**
 * The string data encapsulated by the blob.
 * @type {string}
 * @private
 */
goog.testing.fs.Blob.prototype.data_;


/**
 * @see http://www.w3.org/TR/FileAPI/#dfn-size
 * @type {number}
 */
goog.testing.fs.Blob.prototype.size;


/**
 * Creates a blob with bytes of a blob ranging from the optional start
 * parameter up to but not including the optional end parameter, and with a type
 * attribute that is the value of the optional contentType parameter.
 * @see http://www.w3.org/TR/FileAPI/#dfn-slice
 * @param {number=} opt_start The start byte offset.
 * @param {number=} opt_end The end point of a slice.
 * @param {string=} opt_contentType The type of the resulting Blob.
 * @return {!goog.testing.fs.Blob} The result blob of the slice operation.
 */
goog.testing.fs.Blob.prototype.slice = function(
    opt_start, opt_end, opt_contentType) {
  var relativeStart;
  if (goog.isNumber(opt_start)) {
    relativeStart = (opt_start < 0) ?
        Math.max(this.data_.length + opt_start, 0) :
        Math.min(opt_start, this.data_.length);
  } else {
    relativeStart = 0;
  }
  var relativeEnd;
  if (goog.isNumber(opt_end)) {
    relativeEnd = (opt_end < 0) ? Math.max(this.data_.length + opt_end, 0) :
                                  Math.min(opt_end, this.data_.length);
  } else {
    relativeEnd = this.data_.length;
  }
  var span = Math.max(relativeEnd - relativeStart, 0);
  return new goog.testing.fs.Blob(
      this.data_.substr(relativeStart, span), opt_contentType);
};


/**
 * @return {string} The string data encapsulated by the blob.
 * @override
 */
goog.testing.fs.Blob.prototype.toString = function() {
  return this.data_;
};


/**
 * @return {!ArrayBuffer} The string data encapsulated by the blob as an
 *     ArrayBuffer.
 */
goog.testing.fs.Blob.prototype.toArrayBuffer = function() {
  var buf = new ArrayBuffer(this.data_.length * 2);
  var arr = new Uint16Array(buf);
  for (var i = 0; i < this.data_.length; i++) {
    arr[i] = this.data_.charCodeAt(i);
  }
  return buf;
};


/**
 * @return {string} The string data encapsulated by the blob as a data: URI.
 */
goog.testing.fs.Blob.prototype.toDataUrl = function() {
  return 'data:' + this.type + ';base64,' +
      goog.crypt.base64.encodeString(this.data_);
};


/**
 * Sets the internal contents of the blob. This should only be called by other
 * functions inside the {@code goog.testing.fs} namespace.
 *
 * @param {string} data The data for this Blob.
 */
goog.testing.fs.Blob.prototype.setDataInternal = function(data) {
  this.data_ = data;
  this.size = data.length;
};
