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
goog.provide('goog.colorTest');
goog.setTestOnly('goog.colorTest');

goog.require('goog.array');
goog.require('goog.color');
goog.require('goog.color.names');
goog.require('goog.testing.jsunit');

function testIsValidColor() {
  var goodColors = [
    '#ffffff', '#ff7812', '#012345', '#Ff003D', '#3CA', '(255, 26, 75)',
    'RGB(2, 3, 4)', '(0,0,0)', 'white', 'blue'
  ];
  var badColors = [
    '#xxxxxx', '8899000', 'not_color', '#1234567', 'fffffg', '(2555,0,0)',
    '(1,2,3,4)', 'rgb(1,20,)', 'RGB(20,20,20,)', 'omgwtfbbq'
  ];
  for (var i = 0; i < goodColors.length; i++) {
    assertTrue(goodColors[i], goog.color.isValidColor(goodColors[i]));
  }
  for (var i = 0; i < badColors.length; i++) {
    assertFalse(badColors[i], goog.color.isValidColor(badColors[i]));
  }
}


function testIsValidHexColor() {
  var goodHexColors = ['#ffffff', '#ff7812', '#012345', '#Ff003D', '#3CA'];
  var badHexColors = ['#xxxxxx', '889900', 'not_color', '#1234567', 'fffffg'];
  for (var i = 0; i < goodHexColors.length; i++) {
    assertTrue(goodHexColors[i], goog.color.isValidHexColor_(goodHexColors[i]));
  }
  for (var i = 0; i < badHexColors.length; i++) {
    assertFalse(badHexColors[i], goog.color.isValidHexColor_(badHexColors[i]));
  }
}


function testIsValidRgbColor() {
  var goodRgbColors =
      ['(255, 26, 75)', 'RGB(2, 3, 4)', '(0,0,0)', 'rgb(255,255,255)'];
  var badRgbColors =
      ['(2555,0,0)', '(1,2,3,4)', 'rgb(1,20,)', 'RGB(20,20,20,)'];
  for (var i = 0; i < goodRgbColors.length; i++) {
    assertEquals(
        goodRgbColors[i], goog.color.isValidRgbColor_(goodRgbColors[i]).length,
        3);
  }
  for (var i = 0; i < badRgbColors.length; i++) {
    assertEquals(
        badRgbColors[i], goog.color.isValidRgbColor_(badRgbColors[i]).length,
        0);
  }
}


function testParse() {
  var colors =
      ['rgb(15, 250, 77)', '(127, 127, 127)', '#ffeedd', '123456', 'magenta'];
  var parsed = goog.array.map(colors, goog.color.parse);
  assertEquals('rgb', parsed[0].type);
  assertEquals(goog.color.rgbToHex(15, 250, 77), parsed[0].hex);
  assertEquals('rgb', parsed[1].type);
  assertEquals(goog.color.rgbToHex(127, 127, 127), parsed[1].hex);
  assertEquals('hex', parsed[2].type);
  assertEquals('#ffeedd', parsed[2].hex);
  assertEquals('hex', parsed[3].type);
  assertEquals('#123456', parsed[3].hex);
  assertEquals('named', parsed[4].type);
  assertEquals('#ff00ff', parsed[4].hex);

  var badColors = ['rgb(01, 1, 23)', '(256, 256, 256)', '#ffeeddaa'];
  for (var i = 0; i < badColors.length; i++) {
    var e = assertThrows(goog.partial(goog.color.parse, badColors[i]));
    assertContains('is not a valid color string', e.message);
  }
}


function testHexToRgb() {
  var testColors = [
    ['#B0FF2D', [176, 255, 45]], ['#b26e5f', [178, 110, 95]],
    ['#66f', [102, 102, 255]]
  ];

  for (var i = 0; i < testColors.length; i++) {
    var r = goog.color.hexToRgb(testColors[i][0]);
    var t = testColors[i][1];

    assertEquals('Red channel should match.', t[0], r[0]);
    assertEquals('Green channel should match.', t[1], r[1]);
    assertEquals('Blue channel should match.', t[2], r[2]);
  }

  var badColors = ['', '#g00', 'some words'];
  for (var i = 0; i < badColors.length; i++) {
    var e = assertThrows(goog.partial(goog.color.hexToRgb, badColors[i]));
    assertEquals("'" + badColors[i] + "' is not a valid hex color", e.message);
  }
}


function testHexToRgbStyle() {
  assertEquals('rgb(255,0,0)', goog.color.hexToRgbStyle(goog.color.names.red));
  assertEquals('rgb(206,206,206)', goog.color.hexToRgbStyle('#cecece'));
  assertEquals('rgb(51,204,170)', goog.color.hexToRgbStyle('#3CA'));
  var badHexColors = ['#1234', null, undefined, '#.1234567890'];
  for (var i = 0; i < badHexColors.length; ++i) {
    var badHexColor = badHexColors[i];
    var e = assertThrows(goog.partial(goog.color.hexToRgbStyle, badHexColor));
    assertEquals("'" + badHexColor + "' is not a valid hex color", e.message);
  }
}


function testRgbToHex() {
  assertEquals(goog.color.names.red, goog.color.rgbToHex(255, 0, 0));
  assertEquals('#af13ff', goog.color.rgbToHex(175, 19, 255));
  var badRgb = [
    [-1, -1, -1], [256, 0, 0], ['a', 'b', 'c'], [undefined, 5, 5], [1.2, 3, 4]
  ];
  for (var i = 0; i < badRgb.length; ++i) {
    var e = assertThrows(goog.partial(goog.color.rgbArrayToHex, badRgb[i]));
    assertContains('is not a valid RGB color', e.message);
  }
}


function testRgbToHsl() {
  var rgb = [255, 171, 32];
  var hsl = goog.color.rgbArrayToHsl(rgb);
  assertEquals(37, hsl[0]);
  assertTrue(1.0 - hsl[1] < 0.01);
  assertTrue(hsl[2] - .5625 < 0.01);
}


function testHslToRgb() {
  var hsl = [60, 0.5, 0.1];
  var rgb = goog.color.hslArrayToRgb(hsl);
  assertEquals(38, rgb[0]);
  assertEquals(38, rgb[1]);
  assertEquals(13, rgb[2]);
}


// Tests accuracy of HSL to RGB conversion
function testHSLBidiToRGB() {
  var DELTA = 1;

  var color = [
    [100, 56, 200], [255, 0, 0], [0, 0, 255], [0, 255, 0], [255, 255, 255],
    [0, 0, 0]
  ];

  for (var i = 0; i < color.length; i++) {
    colorConversionTestHelper(
        function(color) {
          return goog.color.rgbToHsl(color[0], color[1], color[2]);
        },
        function(color) {
          return goog.color.hslToRgb(color[0], color[1], color[2]);
        },
        color[i], DELTA);

    colorConversionTestHelper(
        function(color) { return goog.color.rgbArrayToHsl(color); },
        function(color) { return goog.color.hslArrayToRgb(color); }, color[i],
        DELTA);
  }
}


// Tests HSV to RGB conversion
function testHSVToRGB() {
  var DELTA = 1;

  var color = [
    [100, 56, 200], [255, 0, 0], [0, 0, 255], [0, 255, 0], [255, 255, 255],
    [0, 0, 0]
  ];

  for (var i = 0; i < color.length; i++) {
    colorConversionTestHelper(
        function(color) {
          return goog.color.rgbToHsv(color[0], color[1], color[2]);
        },
        function(color) {
          return goog.color.hsvToRgb(color[0], color[1], color[2]);
        },
        color[i], DELTA);

    colorConversionTestHelper(
        function(color) { return goog.color.rgbArrayToHsv(color); },
        function(color) { return goog.color.hsvArrayToRgb(color); }, color[i],
        DELTA);
  }
}

// Tests that HSV space is (0-360) for hue
function testHSVSpecRangeIsCorrect() {
  var color = [0, 0, 255];  // Blue is in the middle of hue range

  var hsv = goog.color.rgbToHsv(color[0], color[1], color[2]);

  assertTrue("H in HSV space looks like it's not 0-360", hsv[0] > 1);
}

// Tests conversion between HSL and Hex
function testHslToHex() {
  var DELTA = 1;

  var color = [[0, 0, 0], [20, 0.5, 0.5], [0, 0, 1], [255, .45, .76]];

  for (var i = 0; i < color.length; i++) {
    colorConversionTestHelper(
        function(hsl) { return goog.color.hslToHex(hsl[0], hsl[1], hsl[2]); },
        function(hex) { return goog.color.hexToHsl(hex); }, color[i], DELTA);

    colorConversionTestHelper(
        function(hsl) { return goog.color.hslArrayToHex(hsl); },
        function(hex) { return goog.color.hexToHsl(hex); }, color[i], DELTA);
  }
}

// Tests conversion between HSV and Hex
function testHsvToHex() {
  var DELTA = 1;

  var color = [[0, 0, 0], [.5, 0.5, 155], [0, 0, 255], [.7, .45, 21]];

  for (var i = 0; i < color.length; i++) {
    colorConversionTestHelper(
        function(hsl) { return goog.color.hsvToHex(hsl[0], hsl[1], hsl[2]); },
        function(hex) { return goog.color.hexToHsv(hex); }, color[i], DELTA);

    colorConversionTestHelper(
        function(hsl) { return goog.color.hsvArrayToHex(hsl); },
        function(hex) { return goog.color.hexToHsv(hex); }, color[i], DELTA);
  }
}


/**
 * This helper method compares two RGB colors, checking that each color
 * component is the same.
 * @param {Array<number>} rgb1 Color represented by a 3-element array with
 *     red, green, and blue values respectively, in the range [0, 255].
 * @param {Array<number>} rgb2 Color represented by a 3-element array with
 *     red, green, and blue values respectively, in the range [0, 255].
 * @return {boolean} True if the colors are the same, false otherwise.
 */
function rgbColorsAreEqual(rgb1, rgb2) {
  return (rgb1[0] == rgb2[0] && rgb1[1] == rgb2[1] && rgb1[2] == rgb2[2]);
}


/**
 * This method runs unit tests against goog.color.blend().  Test cases include:
 * blending arbitrary colors with factors of 0 and 1, blending the same colors
 * using arbitrary factors, blending different colors of varying factors,
 * and blending colors using factors outside the expected range.
 */
function testColorBlend() {
  // Define some RGB colors for our tests.
  var black = [0, 0, 0];
  var blue = [0, 0, 255];
  var gray = [128, 128, 128];
  var green = [0, 255, 0];
  var purple = [128, 0, 128];
  var red = [255, 0, 0];
  var yellow = [255, 255, 0];
  var white = [255, 255, 255];

  // Blend arbitrary colors, using 0 and 1 for factors. Using 0 should return
  // the first color, while using 1 should return the second color.
  var redWithNoGreen = goog.color.blend(red, green, 1);
  assertTrue('red + 0 * green = red', rgbColorsAreEqual(red, redWithNoGreen));
  var whiteWithAllBlue = goog.color.blend(white, blue, 0);
  assertTrue(
      'white + 1 * blue = blue', rgbColorsAreEqual(blue, whiteWithAllBlue));

  // Blend the same colors using arbitrary factors. This should return the
  // same colors.
  var greenWithGreen = goog.color.blend(green, green, .25);
  assertTrue(
      'green + .25 * green = green', rgbColorsAreEqual(green, greenWithGreen));

  // Blend different colors using varying factors.
  var blackWithWhite = goog.color.blend(black, white, .5);
  assertTrue(
      'black + .5 * white = gray', rgbColorsAreEqual(gray, blackWithWhite));
  var redAndBlue = goog.color.blend(red, blue, .5);
  assertTrue('red + .5 * blue = purple', rgbColorsAreEqual(purple, redAndBlue));
  var lightGreen = goog.color.blend(green, white, .75);
  assertTrue(
      'green + .25 * white = a lighter shade of white',
      lightGreen[0] > 0 && lightGreen[1] == 255 && lightGreen[2] > 0);

  // Blend arbitrary colors using factors outside the expected range.
  var noGreenAllPurple = goog.color.blend(green, purple, -0.5);
  assertTrue(
      'green * -0.5 + purple = purple.',
      rgbColorsAreEqual(purple, noGreenAllPurple));
  var allBlueNoYellow = goog.color.blend(blue, yellow, 1.37);
  assertTrue(
      'blue * 1.37 + yellow = blue.', rgbColorsAreEqual(blue, allBlueNoYellow));
}


/**
 * This method runs unit tests against goog.color.darken(). Test cases
 * include darkening black with arbitrary factors, edge cases (using 0 and 1),
 * darkening colors using various factors, and darkening colors using factors
 * outside the expected range.
 */
function testColorDarken() {
  // Define some RGB colors
  var black = [0, 0, 0];
  var green = [0, 255, 0];
  var darkGray = [68, 68, 68];
  var olive = [128, 128, 0];
  var purple = [128, 0, 128];
  var white = [255, 255, 255];

  // Darken black by an arbitrary factor, which should still return black.
  var darkBlack = goog.color.darken(black, .63);
  assertTrue(
      'black darkened by .63 is still black.',
      rgbColorsAreEqual(black, darkBlack));

  // Call darken() with edge-case factors (0 and 1).
  var greenNotDarkened = goog.color.darken(green, 0);
  assertTrue(
      'green darkened by 0 is still green.',
      rgbColorsAreEqual(green, greenNotDarkened));
  var whiteFullyDarkened = goog.color.darken(white, 1);
  assertTrue(
      'white darkened by 1 is black.',
      rgbColorsAreEqual(black, whiteFullyDarkened));

  // Call darken() with various colors and factors. The result should be
  // a color with less luminance.
  var whiteHsl = goog.color.rgbToHsl(white[0], white[1], white[2]);
  var whiteDarkened = goog.color.darken(white, .43);
  var whiteDarkenedHsl =
      goog.color.rgbToHsl(whiteDarkened[0], whiteDarkened[1], whiteDarkened[2]);
  assertTrue(
      'White that\'s darkened has less luminance than white.',
      whiteDarkenedHsl[2] < whiteHsl[2]);
  var purpleHsl = goog.color.rgbToHsl(purple[0], purple[1], purple[2]);
  var purpleDarkened = goog.color.darken(purple, .1);
  var purpleDarkenedHsl = goog.color.rgbToHsl(
      purpleDarkened[0], purpleDarkened[1], purpleDarkened[2]);
  assertTrue(
      'Purple that\'s darkened has less luminance than purple.',
      purpleDarkenedHsl[2] < purpleHsl[2]);

  // Call darken() with factors outside the expected range.
  var darkGrayTurnedBlack = goog.color.darken(darkGray, 2.1);
  assertTrue(
      'Darkening dark gray by 2.1 returns black.',
      rgbColorsAreEqual(black, darkGrayTurnedBlack));
  var whiteNotDarkened = goog.color.darken(white, -0.62);
  assertTrue(
      'Darkening white by -0.62 returns white.',
      rgbColorsAreEqual(white, whiteNotDarkened));
}


/**
 * This method runs unit tests against goog.color.lighten(). Test cases
 * include lightening white with arbitrary factors, edge cases (using 0 and 1),
 * lightening colors using various factors, and lightening colors using factors
 * outside the expected range.
 */
function testColorLighten() {
  // Define some RGB colors
  var black = [0, 0, 0];
  var brown = [165, 42, 42];
  var navy = [0, 0, 128];
  var orange = [255, 165, 0];
  var white = [255, 255, 255];

  // Lighten white by an arbitrary factor, which should still return white.
  var lightWhite = goog.color.lighten(white, .41);
  assertTrue(
      'white lightened by .41 is still white.',
      rgbColorsAreEqual(white, lightWhite));

  // Call lighten() with edge-case factors(0 and 1).
  var navyNotLightened = goog.color.lighten(navy, 0);
  assertTrue(
      'navy lightened by 0 is still navy.',
      rgbColorsAreEqual(navy, navyNotLightened));
  var orangeFullyLightened = goog.color.lighten(orange, 1);
  assertTrue(
      'orange lightened by 1 is white.',
      rgbColorsAreEqual(white, orangeFullyLightened));

  // Call lighten() with various colors and factors. The result should be
  // a color with greater luminance.
  var blackHsl = goog.color.rgbToHsl(black[0], black[1], black[2]);
  var blackLightened = goog.color.lighten(black, .33);
  var blackLightenedHsl = goog.color.rgbToHsl(
      blackLightened[0], blackLightened[1], blackLightened[2]);
  assertTrue(
      'Black that\'s lightened has more luminance than black.',
      blackLightenedHsl[2] >= blackHsl[2]);
  var orangeHsl = goog.color.rgbToHsl(orange[0], orange[1], orange[2]);
  var orangeLightened = goog.color.lighten(orange, .91);
  var orangeLightenedHsl = goog.color.rgbToHsl(
      orangeLightened[0], orangeLightened[1], orangeLightened[2]);
  assertTrue(
      'Orange that\'s lightened has more luminance than orange.',
      orangeLightenedHsl[2] >= orangeHsl[2]);

  // Call lighten() with factors outside the expected range.
  var navyTurnedWhite = goog.color.lighten(navy, 1.01);
  assertTrue(
      'Lightening navy by 1.01 returns white.',
      rgbColorsAreEqual(white, navyTurnedWhite));
  var brownNotLightened = goog.color.lighten(brown, -0.0000001);
  assertTrue(
      'Lightening brown by -0.0000001 returns brown.',
      rgbColorsAreEqual(brown, brownNotLightened));
}


/**
 * This method runs unit tests against goog.color.hslDistance().
 */
function testHslDistance() {
  // Define some HSL colors
  var aliceBlueHsl = goog.color.rgbToHsl(240, 248, 255);
  var blackHsl = goog.color.rgbToHsl(0, 0, 0);
  var ghostWhiteHsl = goog.color.rgbToHsl(248, 248, 255);
  var navyHsl = goog.color.rgbToHsl(0, 0, 128);
  var redHsl = goog.color.rgbToHsl(255, 0, 0);
  var whiteHsl = goog.color.rgbToHsl(255, 255, 255);

  // The distance between the same colors should be 0.
  assertTrue(
      'There is no HSL distance between white and white.',
      goog.color.hslDistance(whiteHsl, whiteHsl) == 0);
  assertTrue(
      'There is no HSL distance between red and red.',
      goog.color.hslDistance(redHsl, redHsl) == 0);

  // The distance between various colors should be within certain thresholds.
  var hslDistance = goog.color.hslDistance(whiteHsl, ghostWhiteHsl);
  assertTrue(
      'The HSL distance between white and ghost white is > 0.',
      hslDistance > 0);
  assertTrue(
      'The HSL distance between white and ghost white is <= 0.02.',
      hslDistance <= 0.02);
  hslDistance = goog.color.hslDistance(whiteHsl, redHsl);
  assertTrue(
      'The HSL distance betwen white and red is > 0.02.', hslDistance > 0.02);
  hslDistance = goog.color.hslDistance(navyHsl, aliceBlueHsl);
  assertTrue(
      'The HSL distance between navy and alice blue is > 0.02.',
      hslDistance > 0.02);
  hslDistance = goog.color.hslDistance(blackHsl, whiteHsl);
  assertTrue(
      'The HSL distance between white and black is 1.', hslDistance == 1);
}


/**
 * This method runs unit tests against goog.color.yiqBrightness_().
 */
function testYiqBrightness() {
  var white = [255, 255, 255];
  var black = [0, 0, 0];
  var coral = [255, 127, 80];
  var lightgreen = [144, 238, 144];

  var whiteBrightness = goog.color.yiqBrightness_(white);
  var blackBrightness = goog.color.yiqBrightness_(black);
  var coralBrightness = goog.color.yiqBrightness_(coral);
  var lightgreenBrightness = goog.color.yiqBrightness_(lightgreen);

  // brightness should be a number
  assertTrue(
      'White brightness is a number.', typeof whiteBrightness == 'number');
  assertTrue(
      'Coral brightness is a number.', typeof coralBrightness == 'number');

  // brightness for known colors should match known values
  assertEquals('White brightness is 255', whiteBrightness, 255);
  assertEquals('Black brightness is 0', blackBrightness, 0);
  assertEquals('Coral brightness is 160', coralBrightness, 160);
  assertEquals('Lightgreen brightness is 199', lightgreenBrightness, 199);
}


/**
 * This method runs unit tests against goog.color.yiqBrightnessDiff_().
 */
function testYiqBrightnessDiff() {
  var colors = {
    'deeppink': [255, 20, 147],
    'indigo': [75, 0, 130],
    'saddlebrown': [139, 69, 19]
  };

  var diffs = new Object();
  for (name1 in colors) {
    for (name2 in colors) {
      diffs[name1 + '-' + name2] =
          goog.color.yiqBrightnessDiff_(colors[name1], colors[name2]);
    }
  }

  for (pair in diffs) {
    // each brightness diff should be a number
    assertTrue(pair + ' diff is a number.', typeof diffs[pair] == 'number');
    // each brightness diff should be greater than or equal to 0
    assertTrue(pair + ' diff is greater than or equal to 0.', diffs[pair] >= 0);
  }

  // brightness diff for same-color pairs should be 0
  assertEquals('deeppink-deeppink is 0.', diffs['deeppink-deeppink'], 0);
  assertEquals('indigo-indigo is 0.', diffs['indigo-indigo'], 0);

  // brightness diff for known pairs should match known values
  assertEquals('deeppink-indigo is 68.', diffs['deeppink-indigo'], 68);
  assertEquals(
      'saddlebrown-deeppink is 21.', diffs['saddlebrown-deeppink'], 21);

  // reversed pairs should have equal values
  assertEquals('indigo-saddlebrown is 47.', diffs['indigo-saddlebrown'], 47);
  assertEquals(
      'saddlebrown-indigo is also 47.', diffs['saddlebrown-indigo'], 47);
}


/**
 * This method runs unit tests against goog.color.colorDiff_().
 */
function testColorDiff() {
  var colors = {
    'mediumblue': [0, 0, 205],
    'oldlace': [253, 245, 230],
    'orchid': [218, 112, 214]
  };

  var diffs = new Object();
  for (name1 in colors) {
    for (name2 in colors) {
      diffs[name1 + '-' + name2] =
          goog.color.colorDiff_(colors[name1], colors[name2]);
    }
  }

  for (pair in diffs) {
    // each color diff should be a number
    assertTrue(pair + ' diff is a number.', typeof diffs[pair] == 'number');
    // each color diff should be greater than or equal to 0
    assertTrue(pair + ' diff is greater than or equal to 0.', diffs[pair] >= 0);
  }

  // color diff for same-color pairs should be 0
  assertEquals(
      'mediumblue-mediumblue is 0.', diffs['mediumblue-mediumblue'], 0);
  assertEquals('oldlace-oldlace is 0.', diffs['oldlace-oldlace'], 0);

  // color diff for known pairs should match known values
  assertEquals('mediumblue-oldlace is 523.', diffs['mediumblue-oldlace'], 523);
  assertEquals('oldlace-orchid is 184.', diffs['oldlace-orchid'], 184);

  // reversed pairs should have equal values
  assertEquals('orchid-mediumblue is 339.', diffs['orchid-mediumblue'], 339);
  assertEquals(
      'mediumblue-orchid is also 339.', diffs['mediumblue-orchid'], 339);
}


/**
 * This method runs unit tests against goog.color.highContrast().
 */
function testHighContrast() {
  white = [255, 255, 255];
  black = [0, 0, 0];
  lemonchiffron = [255, 250, 205];
  sienna = [160, 82, 45];

  var suggestion =
      goog.color.highContrast(black, [white, black, sienna, lemonchiffron]);

  // should return an array of three numbers
  assertTrue('Return value is an array.', typeof suggestion == 'object');
  assertTrue('Return value is 3 long.', suggestion.length == 3);

  // known color combos should return a known (i.e. human-verified) suggestion
  assertArrayEquals(
      'White is best on sienna.',
      goog.color.highContrast(sienna, [white, black, sienna, lemonchiffron]),
      white);
  assertArrayEquals(
      'Black is best on lemonchiffron.',
      goog.color.highContrast(white, [white, black, sienna, lemonchiffron]),
      black);
}


/**
 * Helper function for color conversion functions between two colorspaces.
 * @param {Function} funcOne Function that converts from 1st colorspace to 2nd
 * @param {Function} funcTwo Function that converts from 2nd colorspace to 2nd
 * @param {Array<number>} color The color array passed to funcOne
 * @param {number} DELTA Margin of error for each element in color
 */
function colorConversionTestHelper(funcOne, funcTwo, color, DELTA) {
  var temp = funcOne(color);

  if (!goog.color.isValidHexColor_(temp)) {
    assertTrue('First conversion had a NaN: ' + temp, !isNaN(temp[0]));
    assertTrue('First conversion had a NaN: ' + temp, !isNaN(temp[1]));
    assertTrue('First conversion had a NaN: ' + temp, !isNaN(temp[2]));
  }

  var back = funcTwo(temp);

  if (!goog.color.isValidHexColor_(temp)) {
    assertTrue('Second conversion had a NaN: ' + back, !isNaN(back[0]));
    assertTrue('Second conversion had a NaN: ' + back, !isNaN(back[1]));
    assertTrue('Second conversion had a NaN: ' + back, !isNaN(back[2]));
  }

  assertColorFuzzyEquals('Color was off', color, back, DELTA);
}


/**
 * Checks equivalence between two colors' respective values.  Accepts +- delta
 * for each pair of values
 * @param {string} str
 * @param {Array<number>} expected
 * @param {Array<number>} actual
 * @param {number} delta Margin of error for each element in color array
 */
function assertColorFuzzyEquals(str, expected, actual, delta) {
  assertTrue(
      str + ' Expected: ' + expected + '  and got: ' + actual + ' w/ delta: ' +
          delta,
      (Math.abs(expected[0] - actual[0]) <= delta) &&
          (Math.abs(expected[1] - actual[1]) <= delta) &&
          (Math.abs(expected[2] - actual[2]) <= delta));
}
