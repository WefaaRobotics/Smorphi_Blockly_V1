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


/**
 * @fileoverview Represents a path used with a Graphics implementation.
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.math.Path');
goog.provide('goog.math.Path.Segment');

goog.require('goog.array');
goog.require('goog.math');



/**
 * Creates a path object. A path is a sequence of segments and may be open or
 * closed. Path uses the EVEN-ODD fill rule for determining the interior of the
 * path. A path must start with a moveTo command.
 *
 * A "simple" path does not contain any arcs and may be transformed using
 * the {@code transform} method.
 *
 * @struct
 * @constructor
 * @final
 */
goog.math.Path = function() {
  /**
   * The segment types that constitute this path.
   * @private {!Array<goog.math.Path.Segment>}
   */
  this.segments_ = [];

  /**
   * The number of repeated segments of the current type.
   * @type {!Array<number>}
   * @private
   */
  this.count_ = [];

  /**
   * The arguments corresponding to each of the segments.
   * @type {!Array<number>}
   * @private
   */
  this.arguments_ = [];

  /**
   * The coordinates of the point which closes the path (the point of the
   * last moveTo command).
   * @type {Array<number>?}
   * @private
   */
  this.closePoint_ = null;

  /**
   * The coordinates most recently added to the end of the path.
   * @type {Array<number>?}
   * @private
   */
  this.currentPoint_ = null;

  /**
   * Flag for whether this is a simple path (contains no arc segments).
   * @type {boolean}
   * @private
   */
  this.simple_ = true;
};


/**
 * Path segment types.
 * @enum {number}
 */
goog.math.Path.Segment = {
  MOVETO: 0,
  LINETO: 1,
  CURVETO: 2,
  ARCTO: 3,
  CLOSE: 4
};


/**
 * The number of points for each segment type.
 * @type {!Array<number>}
 * @private
 */
goog.math.Path.segmentArgCounts_ = (function() {
  var counts = [];
  counts[goog.math.Path.Segment.MOVETO] = 2;
  counts[goog.math.Path.Segment.LINETO] = 2;
  counts[goog.math.Path.Segment.CURVETO] = 6;
  counts[goog.math.Path.Segment.ARCTO] = 6;
  counts[goog.math.Path.Segment.CLOSE] = 0;
  return counts;
})();


/**
 * Returns an array of the segment types in this path, in the order of their
 * appearance. Adjacent segments of the same type are collapsed into a single
 * entry in the array. The returned array is a copy; modifications are not
 * reflected in the Path object.
 * @return {!Array<number>}
 */
goog.math.Path.prototype.getSegmentTypes = function() {
  return this.segments_.concat();
};


/**
 * Returns an array of the number of times each segment type repeats in this
 * path, in order. The returned array is a copy; modifications are not reflected
 * in the Path object.
 * @return {!Array<number>}
 */
goog.math.Path.prototype.getSegmentCounts = function() {
  return this.count_.concat();
};


/**
 * Returns an array of all arguments for the segments of this path object, in
 * order. The returned array is a copy; modifications are not reflected in the
 * Path object.
 * @return {!Array<number>}
 */
goog.math.Path.prototype.getSegmentArgs = function() {
  return this.arguments_.concat();
};


/**
 * Returns the number of points for a segment type.
 *
 * @param {number} segment The segment type.
 * @return {number} The number of points.
 */
goog.math.Path.getSegmentCount = function(segment) {
  return goog.math.Path.segmentArgCounts_[segment];
};


/**
 * Appends another path to the end of this path.
 *
 * @param {!goog.math.Path} path The path to append.
 * @return {!goog.math.Path} This path.
 */
goog.math.Path.prototype.appendPath = function(path) {
  if (path.currentPoint_) {
    Array.prototype.push.apply(this.segments_, path.segments_);
    Array.prototype.push.apply(this.count_, path.count_);
    Array.prototype.push.apply(this.arguments_, path.arguments_);
    this.currentPoint_ = path.currentPoint_.concat();
    this.closePoint_ = path.closePoint_.concat();
    this.simple_ = this.simple_ && path.simple_;
  }
  return this;
};


/**
 * Clears the path.
 *
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.clear = function() {
  this.segments_.length = 0;
  this.count_.length = 0;
  this.arguments_.length = 0;
  this.closePoint_ = null;
  this.currentPoint_ = null;
  this.simple_ = true;
  return this;
};


/**
 * Adds a point to the path by moving to the specified point. Repeated moveTo
 * commands are collapsed into a single moveTo.
 *
 * @param {number} x X coordinate of destination point.
 * @param {number} y Y coordinate of destination point.
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.moveTo = function(x, y) {
  if (goog.array.peek(this.segments_) == goog.math.Path.Segment.MOVETO) {
    this.arguments_.length -= 2;
  } else {
    this.segments_.push(goog.math.Path.Segment.MOVETO);
    this.count_.push(1);
  }
  this.arguments_.push(x, y);
  this.currentPoint_ = this.closePoint_ = [x, y];
  return this;
};


/**
 * Adds points to the path by drawing a straight line to each point.
 *
 * @param {...number} var_args The coordinates of each destination point as x, y
 *     value pairs.
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.lineTo = function(var_args) {
  return this.lineTo_(arguments);
};


/**
 * Adds points to the path by drawing a straight line to each point.
 *
 * @param {!Array<number>} coordinates The coordinates of each
 *     destination point as x, y value pairs.
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.lineToFromArray = function(coordinates) {
  return this.lineTo_(coordinates);
};


/**
 * Adds points to the path by drawing a straight line to each point.
 *
 * @param {!Array<number>|Arguments} coordinates The coordinates of each
 *     destination point as x, y value pairs.
 * @return {!goog.math.Path} The path itself.
 * @private
 */
goog.math.Path.prototype.lineTo_ = function(coordinates) {
  var lastSegment = goog.array.peek(this.segments_);
  if (lastSegment == null) {
    throw Error('Path cannot start with lineTo');
  }
  if (lastSegment != goog.math.Path.Segment.LINETO) {
    this.segments_.push(goog.math.Path.Segment.LINETO);
    this.count_.push(0);
  }
  for (var i = 0; i < coordinates.length; i += 2) {
    var x = coordinates[i];
    var y = coordinates[i + 1];
    this.arguments_.push(x, y);
  }
  this.count_[this.count_.length - 1] += i / 2;
  this.currentPoint_ = [x, y];
  return this;
};


/**
 * Adds points to the path by drawing cubic Bezier curves. Each curve is
 * specified using 3 points (6 coordinates) - two control points and the end
 * point of the curve.
 *
 * @param {...number} var_args The coordinates specifiying each curve in sets of
 *     6 points: {@code [x1, y1]} the first control point, {@code [x2, y2]} the
 *     second control point and {@code [x, y]} the end point.
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.curveTo = function(var_args) {
  return this.curveTo_(arguments);
};


/**
 * Adds points to the path by drawing cubic Bezier curves. Each curve is
 * specified using 3 points (6 coordinates) - two control points and the end
 * point of the curve.
 *
 * @param {!Array<number>} coordinates The coordinates specifiying
 *     each curve in sets of 6 points: {@code [x1, y1]} the first control point,
 *     {@code [x2, y2]} the second control point and {@code [x, y]} the end
 *     point.
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.curveToFromArray = function(coordinates) {
  return this.curveTo_(coordinates);
};


/**
 * Adds points to the path by drawing cubic Bezier curves. Each curve is
 * specified using 3 points (6 coordinates) - two control points and the end
 * point of the curve.
 *
 * @param {!Array<number>|Arguments} coordinates The coordinates specifiying
 *     each curve in sets of 6 points: {@code [x1, y1]} the first control point,
 *     {@code [x2, y2]} the second control point and {@code [x, y]} the end
 *     point.
 * @return {!goog.math.Path} The path itself.
 * @private
 */
goog.math.Path.prototype.curveTo_ = function(coordinates) {
  var lastSegment = goog.array.peek(this.segments_);
  if (lastSegment == null) {
    throw Error('Path cannot start with curve');
  }
  if (lastSegment != goog.math.Path.Segment.CURVETO) {
    this.segments_.push(goog.math.Path.Segment.CURVETO);
    this.count_.push(0);
  }
  for (var i = 0; i < coordinates.length; i += 6) {
    var x = coordinates[i + 4];
    var y = coordinates[i + 5];
    this.arguments_.push(
        coordinates[i], coordinates[i + 1], coordinates[i + 2],
        coordinates[i + 3], x, y);
  }
  this.count_[this.count_.length - 1] += i / 6;
  this.currentPoint_ = [x, y];
  return this;
};


/**
 * Adds a path command to close the path by connecting the
 * last point to the first point.
 *
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.close = function() {
  var lastSegment = goog.array.peek(this.segments_);
  if (lastSegment == null) {
    throw Error('Path cannot start with close');
  }
  if (lastSegment != goog.math.Path.Segment.CLOSE) {
    this.segments_.push(goog.math.Path.Segment.CLOSE);
    this.count_.push(1);
    this.currentPoint_ = this.closePoint_;
  }
  return this;
};


/**
 * Adds a path command to draw an arc centered at the point {@code (cx, cy)}
 * with radius {@code rx} along the x-axis and {@code ry} along the y-axis from
 * {@code startAngle} through {@code extent} degrees. Positive rotation is in
 * the direction from positive x-axis to positive y-axis.
 *
 * @param {number} cx X coordinate of center of ellipse.
 * @param {number} cy Y coordinate of center of ellipse.
 * @param {number} rx Radius of ellipse on x axis.
 * @param {number} ry Radius of ellipse on y axis.
 * @param {number} fromAngle Starting angle measured in degrees from the
 *     positive x-axis.
 * @param {number} extent The span of the arc in degrees.
 * @param {boolean} connect If true, the starting point of the arc is connected
 *     to the current point.
 * @return {!goog.math.Path} The path itself.
 * @deprecated Use {@code arcTo} or {@code arcToAsCurves} instead.
 */
goog.math.Path.prototype.arc = function(
    cx, cy, rx, ry, fromAngle, extent, connect) {
  var startX = cx + goog.math.angleDx(fromAngle, rx);
  var startY = cy + goog.math.angleDy(fromAngle, ry);
  if (connect) {
    if (!this.currentPoint_ || startX != this.currentPoint_[0] ||
        startY != this.currentPoint_[1]) {
      this.lineTo(startX, startY);
    }
  } else {
    this.moveTo(startX, startY);
  }
  return this.arcTo(rx, ry, fromAngle, extent);
};


/**
 * Adds a path command to draw an arc starting at the path's current point,
 * with radius {@code rx} along the x-axis and {@code ry} along the y-axis from
 * {@code startAngle} through {@code extent} degrees. Positive rotation is in
 * the direction from positive x-axis to positive y-axis.
 *
 * This method makes the path non-simple.
 *
 * @param {number} rx Radius of ellipse on x axis.
 * @param {number} ry Radius of ellipse on y axis.
 * @param {number} fromAngle Starting angle measured in degrees from the
 *     positive x-axis.
 * @param {number} extent The span of the arc in degrees.
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.arcTo = function(rx, ry, fromAngle, extent) {
  var cx = this.currentPoint_[0] - goog.math.angleDx(fromAngle, rx);
  var cy = this.currentPoint_[1] - goog.math.angleDy(fromAngle, ry);
  var ex = cx + goog.math.angleDx(fromAngle + extent, rx);
  var ey = cy + goog.math.angleDy(fromAngle + extent, ry);
  this.segments_.push(goog.math.Path.Segment.ARCTO);
  this.count_.push(1);
  this.arguments_.push(rx, ry, fromAngle, extent, ex, ey);
  this.simple_ = false;
  this.currentPoint_ = [ex, ey];
  return this;
};


/**
 * Same as {@code arcTo}, but approximates the arc using bezier curves.
.* As a result, this method does not affect the simplified status of this path.
 * The algorithm is adapted from {@code java.awt.geom.ArcIterator}.
 *
 * @param {number} rx Radius of ellipse on x axis.
 * @param {number} ry Radius of ellipse on y axis.
 * @param {number} fromAngle Starting angle measured in degrees from the
 *     positive x-axis.
 * @param {number} extent The span of the arc in degrees.
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.arcToAsCurves = function(rx, ry, fromAngle, extent) {
  var cx = this.currentPoint_[0] - goog.math.angleDx(fromAngle, rx);
  var cy = this.currentPoint_[1] - goog.math.angleDy(fromAngle, ry);
  var extentRad = goog.math.toRadians(extent);
  var arcSegs = Math.ceil(Math.abs(extentRad) / Math.PI * 2);
  var inc = extentRad / arcSegs;
  var angle = goog.math.toRadians(fromAngle);
  for (var j = 0; j < arcSegs; j++) {
    var relX = Math.cos(angle);
    var relY = Math.sin(angle);
    var z = 4 / 3 * Math.sin(inc / 2) / (1 + Math.cos(inc / 2));
    var c0 = cx + (relX - z * relY) * rx;
    var c1 = cy + (relY + z * relX) * ry;
    angle += inc;
    relX = Math.cos(angle);
    relY = Math.sin(angle);
    this.curveTo(
        c0, c1, cx + (relX + z * relY) * rx, cy + (relY - z * relX) * ry,
        cx + relX * rx, cy + relY * ry);
  }
  return this;
};


/**
 * Iterates over the path calling the supplied callback once for each path
 * segment. The arguments to the callback function are the segment type and
 * an array of its arguments.
 *
 * The {@code LINETO} and {@code CURVETO} arrays can contain multiple
 * segments of the same type. The number of segments is the length of the
 * array divided by the segment length (2 for lines, 6 for  curves).
 *
 * As a convenience the {@code ARCTO} segment also includes the end point as the
 * last two arguments: {@code rx, ry, fromAngle, extent, x, y}.
 *
 * @param {function(!goog.math.Path.Segment, !Array<number>)} callback
 *     The function to call with each path segment.
 */
goog.math.Path.prototype.forEachSegment = function(callback) {
  var points = this.arguments_;
  var index = 0;
  for (var i = 0, length = this.segments_.length; i < length; i++) {
    var seg = this.segments_[i];
    var n = goog.math.Path.segmentArgCounts_[seg] * this.count_[i];
    callback(seg, points.slice(index, index + n));
    index += n;
  }
};


/**
 * Returns the coordinates most recently added to the end of the path.
 *
 * @return {Array<number>?} An array containing the ending coordinates of the
 *     path of the form {@code [x, y]}.
 */
goog.math.Path.prototype.getCurrentPoint = function() {
  return this.currentPoint_ && this.currentPoint_.concat();
};


/**
 * @return {!goog.math.Path} A copy of this path.
 */
goog.math.Path.prototype.clone = function() {
  var path = new goog.math.Path();
  path.segments_ = this.segments_.concat();
  path.count_ = this.count_.concat();
  path.arguments_ = this.arguments_.concat();
  path.closePoint_ = this.closePoint_ && this.closePoint_.concat();
  path.currentPoint_ = this.currentPoint_ && this.currentPoint_.concat();
  path.simple_ = this.simple_;
  return path;
};


/**
 * Returns true if this path contains no arcs. Simplified paths can be
 * created using {@code createSimplifiedPath}.
 *
 * @return {boolean} True if the path contains no arcs.
 */
goog.math.Path.prototype.isSimple = function() {
  return this.simple_;
};


/**
 * A map from segment type to the path function to call to simplify a path.
 * @private {!Object<goog.math.Path.Segment, function(this: goog.math.Path)>}
 */
goog.math.Path.simplifySegmentMap_ = (function() {
  var map = {};
  map[goog.math.Path.Segment.MOVETO] = goog.math.Path.prototype.moveTo;
  map[goog.math.Path.Segment.LINETO] = goog.math.Path.prototype.lineTo;
  map[goog.math.Path.Segment.CLOSE] = goog.math.Path.prototype.close;
  map[goog.math.Path.Segment.CURVETO] = goog.math.Path.prototype.curveTo;
  map[goog.math.Path.Segment.ARCTO] = goog.math.Path.prototype.arcToAsCurves;
  return map;
})();


/**
 * Creates a copy of the given path, replacing {@code arcTo} with
 * {@code arcToAsCurves}. The resulting path is simplified and can
 * be transformed.
 *
 * @param {!goog.math.Path} src The path to simplify.
 * @return {!goog.math.Path} A new simplified path.
 */
goog.math.Path.createSimplifiedPath = function(src) {
  if (src.isSimple()) {
    return src.clone();
  }
  var path = new goog.math.Path();
  src.forEachSegment(function(segment, args) {
    goog.math.Path.simplifySegmentMap_[segment].apply(path, args);
  });
  return path;
};


// TODO(chrisn): Delete this method
/**
 * Creates a transformed copy of this path. The path is simplified
 * {@see #createSimplifiedPath} prior to transformation.
 *
 * @param {!goog.math.AffineTransform} tx The transformation to perform.
 * @return {!goog.math.Path} A new, transformed path.
 */
goog.math.Path.prototype.createTransformedPath = function(tx) {
  var path = goog.math.Path.createSimplifiedPath(this);
  path.transform(tx);
  return path;
};


/**
 * Transforms the path. Only simple paths are transformable. Attempting
 * to transform a non-simple path will throw an error.
 *
 * @param {!goog.math.AffineTransform} tx The transformation to perform.
 * @return {!goog.math.Path} The path itself.
 */
goog.math.Path.prototype.transform = function(tx) {
  if (!this.isSimple()) {
    throw Error('Non-simple path');
  }
  tx.transform(
      this.arguments_, 0, this.arguments_, 0, this.arguments_.length / 2);
  if (this.closePoint_) {
    tx.transform(this.closePoint_, 0, this.closePoint_, 0, 1);
  }
  if (this.currentPoint_ && this.closePoint_ != this.currentPoint_) {
    tx.transform(this.currentPoint_, 0, this.currentPoint_, 0, 1);
  }
  return this;
};


/**
 * @return {boolean} Whether the path is empty.
 */
goog.math.Path.prototype.isEmpty = function() {
  return this.segments_.length == 0;
};
