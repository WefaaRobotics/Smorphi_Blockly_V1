// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.cssom.iframe.styleTest');
goog.setTestOnly('goog.cssom.iframe.styleTest');

goog.require('goog.cssom');
goog.require('goog.cssom.iframe.style');
goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

// unit tests
var propertiesToTest = [
  'color', 'font-family', 'font-style', 'font-size', 'font-variant',
  'border-top-style', 'border-top-width', 'border-top-color',
  'background-color', 'margin-bottom'
];

function crawlDom(startNode, func) {
  if (startNode.nodeType != 1) {
    return;
  }
  func(startNode);
  for (var i = 0; i < startNode.childNodes.length; i++) {
    crawlDom(startNode.childNodes[i], func);
  }
}

function getCurrentCssProperties(node, propList) {
  var props = {};
  if (node.nodeType != 1) {
    return;
  }
  for (var i = 0; i < propList.length; i++) {
    var prop = propList[i];
    if (node.currentStyle) {  // IE
      var propCamelCase = '';
      var propParts = prop.split('-');
      for (var j = 0; j < propParts.length; j++) {
        propCamelCase += propParts[j].charAt(0).toUpperCase() +
            propParts[j].substring(1, propParts[j].length);
      }
      props[prop] = node.currentStyle[propCamelCase];
    } else {  // standards-compliant browsers
      props[prop] = node.ownerDocument.defaultView.getComputedStyle(node, '')
                        .getPropertyValue(prop);
    }
  }
  return props;
}

function CssPropertyCollector() {
  var propsList = [];
  this.propsList = propsList;

  this.collectProps = function(node) {
    var nodeProps = getCurrentCssProperties(node, propertiesToTest);
    if (nodeProps) {
      propsList.push([nodeProps, node]);
    }
  };
}

function recursivelyListCssProperties(el) {
  var collector = new CssPropertyCollector();
  crawlDom(el, collector.collectProps);
  return collector.propsList;
}

function testMatchCssSelector() {
  var container = document.createElement(goog.dom.TagName.DIV);
  container.className = 'container';
  var el = document.createElement(goog.dom.TagName.DIV);
  x = el;
  el.id = 'mydiv';
  el.className = 'colorful foo';
  // set some arbirtrary content
  el.innerHTML = '<div><ul><li>One</li><li>Two</li></ul></div>';
  container.appendChild(el);
  document.body.appendChild(container);

  var elementAncestry = new goog.cssom.iframe.style.NodeAncestry_(el);
  assertEquals(5, elementAncestry.nodes.length);

  // list of input/output results. Output is the index of the selector
  // that we expect to match - for example, in 'body div div.colorful',
  // 'div.colorful' has an index of 2.
  var expectedResults = [
    ['body div', [4, 1]], ['h1', null], ['body div h1', [4, 1]],
    ['body div.colorful h1', [4, 1]], ['body div div', [4, 2]],
    ['body div div div', [4, 2]], ['body div div.somethingelse div', [4, 1]],
    ['body div.somethingelse div', [2, 0]], ['div.container', [3, 0]],
    ['div.container div', [4, 1]], ['#mydiv', [4, 0]], ['div#mydiv', [4, 0]],
    ['div.colorful', [4, 0]], ['div#mydiv .colorful', [4, 0]],
    ['.colorful', [4, 0]], ['body * div', [4, 2]], ['body * *', [4, 2]]
  ];
  for (var i = 0; i < expectedResults.length; i++) {
    var input = expectedResults[i][0];
    var expectedResult = expectedResults[i][1];
    var selector = new goog.cssom.iframe.style.CssSelector_(input);
    var result = selector.matchElementAncestry(elementAncestry);
    if (expectedResult == null) {
      assertEquals('Expected null result', expectedResult, result);
    } else {
      assertEquals(
          'Expected element index for ' + input, expectedResult[0],
          result.elementIndex);
      assertEquals(
          'Expected selector part index for ' + input, expectedResult[1],
          result.selectorPartIndex);
    }
  }
  document.body.removeChild(container);
}

function makeIframeDocument(iframe) {
  var doc = goog.dom.getFrameContentDocument(iframe);
  doc.open();
  doc.write('<html><head>');
  doc.write('<style>html,body { background-color: transparent; }</style>');
  doc.write('</head><body></body></html>');
  doc.close();
  return doc;
}

function testCopyCss() {
  for (var i = 1; i <= 4; i++) {
    var sourceElement = document.getElementById('source' + i);
    var newFrame = document.createElement(goog.dom.TagName.IFRAME);
    newFrame.allowTransparency = true;
    sourceElement.parentNode.insertBefore(newFrame, sourceElement.nextSibling);
    var doc = makeIframeDocument(newFrame);
    goog.cssom.addCssText(
        goog.cssom.iframe.style.getElementContext(sourceElement),
        new goog.dom.DomHelper(doc));
    doc.body.innerHTML = sourceElement.innerHTML;

    var oldProps = recursivelyListCssProperties(sourceElement);
    var newProps = recursivelyListCssProperties(doc.body);

    assertEquals(oldProps.length, newProps.length);
    for (var j = 0; j < oldProps.length; j++) {
      for (var k = 0; k < propertiesToTest.length; k++) {
        assertEquals(
            'testing property ' + propertiesToTest[k],
            oldProps[j][0][propertiesToTest[k]],
            newProps[j][0][propertiesToTest[k]]);
      }
    }
  }
}

function normalizeCssText(cssText) {
  // Normalize cssText for testing purposes.
  return cssText.replace(/\s/g, '').toLowerCase();
}

function testAImportantInFF2() {
  var testDiv = document.getElementById('source1');
  var cssText =
      normalizeCssText(goog.cssom.iframe.style.getElementContext(testDiv));
  var color = standardizeCSSValue('color', 'red');
  var NORMAL_RULE = 'a{color:' + color;
  var FF_2_RULE = 'a{color:' + color + '!important';
  if (goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('1.9a')) {
    assertContains(FF_2_RULE, cssText);
  } else {
    assertContains(NORMAL_RULE, cssText);
    assertNotContains(FF_2_RULE, cssText);
  }
}

function testCopyBackgroundContext() {
  var testDiv = document.getElementById('backgroundTest');
  var cssText = goog.cssom.iframe.style.getElementContext(testDiv, null, true);
  var iframe = document.createElement(goog.dom.TagName.IFRAME);
  var ancestor = document.getElementById('backgroundTest-ancestor-1');
  ancestor.parentNode.insertBefore(iframe, ancestor.nextSibling);
  iframe.style.width = '100%';
  iframe.style.height = '100px';
  iframe.style.borderWidth = '0px';
  var doc = makeIframeDocument(iframe);
  goog.cssom.addCssText(cssText, new goog.dom.DomHelper(doc));
  doc.body.innerHTML = testDiv.innerHTML;
  var normalizedCssText = normalizeCssText(cssText);
  assertTrue(
      'Background color should be copied from parent element',
      /body{[^{]*background-color:(?:rgb\(128,0,128\)|#800080)/.test(
          normalizedCssText));
  assertTrue(
      'Background image should be copied from ancestor element',
      /body{[^{]*background-image:url\(/.test(normalizedCssText));
  // Background-position can't be calculated in FF2, due to this bug:
  // http://bugzilla.mozilla.org/show_bug.cgi?id=316981
  if (!(goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('1.9'))) {
    // Expected x position is:
    // originalBackgroundPositionX - elementOffsetLeft
    // 40px - (1px + 8px) == 31px
    // Expected y position is:
    // originalBackgroundPositionY - elementOffsetLeft
    // 70px - (1px + 10px + 5px) == 54px;
    assertTrue(
        'Background image position should be adjusted correctly',
        /body{[^{]*background-position:31px54px/.test(normalizedCssText));
  }
}

function testCopyBackgroundContextFromIframe() {
  var testDiv = document.getElementById('backgroundTest');
  var iframe = document.createElement(goog.dom.TagName.IFRAME);
  iframe.allowTransparency = true;
  iframe.style.position = 'absolute';
  iframe.style.top = '5px';
  iframe.style.left = '5px';
  iframe.style.borderWidth = '2px';
  iframe.style.borderStyle = 'solid';
  testDiv.appendChild(iframe);
  var doc = makeIframeDocument(iframe);
  doc.body.backgroundColor = 'transparent';
  doc.body.style.margin = '0';
  doc.body.style.padding = '0';
  doc.body.innerHTML = '<p style="margin: 0">I am transparent!</p>';
  var normalizedCssText = normalizeCssText(
      goog.cssom.iframe.style.getElementContext(
          doc.body.firstChild, null, true));
  // Background properties should get copied through from the parent
  // document since the iframe is transparent
  assertTrue(
      'Background color should be copied from parent element',
      /body{[^{]*background-color:(?:rgb\(128,0,128\)|#800080)/.test(
          normalizedCssText));
  assertTrue(
      'Background image should be copied from ancestor element',
      /body{[^{]*background-image:url\(/.test(normalizedCssText));
  // Background-position can't be calculated in FF2, due to this bug:
  // http://bugzilla.mozilla.org/show_bug.cgi?id=316981
  if (!(goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('1.9'))) {
    // Image offset should have been calculated to be the same as the
    // above example, but adding iframe offset and borderWidth.
    // Expected x position is:
    // originalBackgroundPositionX - elementOffsetLeft
    // 40px - (1px + 8px + 5px + 2px) == 24px
    // Expected y position is:
    // originalBackgroundPositionY - elementOffsetLeft
    // 70px - (1px + 10px + 5px + 5px + 2px) == 47px;
    assertTrue(
        'Background image position should be adjusted correctly',
        !!/body{[^{]*background-position:24px47px/.exec(normalizedCssText));
  }
  iframe.parentNode.removeChild(iframe);
}

function testCopyFontFaceRules() {
  var isFontFaceCssomSupported = goog.userAgent.WEBKIT ||
      goog.userAgent.OPERA ||
      (goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9.1'));
  // We cannot use goog.testing.ExpectedFailures since it dynamically
  // brings in CSS which causes the background context tests to fail
  // in IE6.
  if (isFontFaceCssomSupported) {
    var cssText = goog.cssom.iframe.style.getElementContext(
        document.getElementById('cavalier'));
    assertTrue(
        'The font face rule should have been copied correctly',
        /@font-face/.test(cssText));
  }
}
