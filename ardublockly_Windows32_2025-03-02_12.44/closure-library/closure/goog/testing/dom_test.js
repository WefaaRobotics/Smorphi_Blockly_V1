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

goog.provide('goog.testing.domTest');
goog.setTestOnly('goog.testing.domTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var root;
function setUpPage() {
  // TODO(b/25875505): Fix unreported assertions (go/failonunreportedasserts).
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = false;

  root = goog.dom.getElement('root');
}

function setUp() {
  goog.dom.removeChildren(root);
}

function testFindNode() {
  // Test the easiest case.
  root.innerHTML = 'a<br>b';
  assertEquals(goog.testing.dom.findTextNode('a', root), root.firstChild);
  assertEquals(goog.testing.dom.findTextNode('b', root), root.lastChild);
  assertNull(goog.testing.dom.findTextNode('c', root));
}

function testFindNodeDuplicate() {
  // Test duplicate.
  root.innerHTML = 'c<br>c';
  assertEquals(
      'Should return first duplicate', goog.testing.dom.findTextNode('c', root),
      root.firstChild);
}

function findNodeWithHierarchy() {
  // Test a more complicated hierarchy.
  root.innerHTML = '<div>a<p>b<span>c</span>d</p>e</div>';
  assertEquals(
      goog.dom.TagName.DIV,
      goog.testing.dom.findTextNode('a', root).parentNode.tagName);
  assertEquals(
      goog.dom.TagName.P,
      goog.testing.dom.findTextNode('b', root).parentNode.tagName);
  assertEquals(
      goog.dom.TagName.SPAN,
      goog.testing.dom.findTextNode('c', root).parentNode.tagName);
  assertEquals(
      goog.dom.TagName.P,
      goog.testing.dom.findTextNode('d', root).parentNode.tagName);
  assertEquals(
      goog.dom.TagName.DIV,
      goog.testing.dom.findTextNode('e', root).parentNode.tagName);
}

function setUpAssertHtmlMatches() {
  var tag1, tag2;
  if (goog.userAgent.EDGE_OR_IE) {
    tag1 = goog.dom.TagName.DIV;
  } else if (goog.userAgent.WEBKIT) {
    tag1 = goog.dom.TagName.P;
    tag2 = goog.dom.TagName.BR;
  } else if (goog.userAgent.GECKO) {
    tag1 = goog.dom.TagName.SPAN;
    tag2 = goog.dom.TagName.BR;
  }

  var parent = goog.dom.createDom(goog.dom.TagName.DIV);
  root.appendChild(parent);
  parent.style.fontSize = '2em';
  parent.style.display = 'none';
  if (!goog.userAgent.WEBKIT) {
    parent.appendChild(goog.dom.createTextNode('NonWebKitText'));
  }

  if (tag1) {
    var e1 = goog.dom.createDom(tag1);
    parent.appendChild(e1);
    parent = e1;
  }
  if (tag2) {
    parent.appendChild(goog.dom.createDom(tag2));
  }
  parent.appendChild(goog.dom.createTextNode('Text'));
  if (goog.userAgent.WEBKIT) {
    root.firstChild.appendChild(goog.dom.createTextNode('WebKitText'));
  }
}

function testAssertHtmlContentsMatch() {
  setUpAssertHtmlMatches();

  goog.testing.dom.assertHtmlContentsMatch(
      '<div style="display: none; font-size: 2em">' +
          '[[!WEBKIT]]NonWebKitText<div class="IE EDGE"><p class="WEBKIT">' +
          '<span class="GECKO"><br class="GECKO WEBKIT">Text</span></p></div>' +
          '</div>[[WEBKIT]]WebKitText',
      root);
}

function testAssertHtmlMismatchText() {
  setUpAssertHtmlMatches();

  var e = assertThrows('Should fail due to mismatched text', function() {
    goog.testing.dom.assertHtmlContentsMatch(
        '<div style="display: none; font-size: 2em">' +
            '[[IE GECKO]]NonWebKitText<div class="IE"><p class="WEBKIT">' +
            '<span class="GECKO"><br class="GECKO WEBKIT">Bad</span></p></div>' +
            '</div>[[WEBKIT]]Extra',
        root);
  });
  assertContains('Text should match', e.message);
}

function testAssertHtmlMismatchTag() {
  setUpAssertHtmlMatches();

  var e = assertThrows('Should fail due to mismatched tag', function() {
    goog.testing.dom.assertHtmlContentsMatch(
        '<span style="display: none; font-size: 2em">' +
            '[[IE GECKO]]NonWebKitText<div class="IE"><p class="WEBKIT">' +
            '<span class="GECKO"><br class="GECKO WEBKIT">Text</span></p></div>' +
            '</span>[[WEBKIT]]Extra',
        root);
  });
  assertContains('Tag names should match', e.message);
}

function testAssertHtmlMismatchStyle() {
  setUpAssertHtmlMatches();

  var e = assertThrows('Should fail due to mismatched style', function() {
    goog.testing.dom.assertHtmlContentsMatch(
        '<div style="display: none; font-size: 3em">' +
            '[[IE GECKO]]NonWebKitText<div class="IE"><p class="WEBKIT">' +
            '<span class="GECKO"><br class="GECKO WEBKIT">Text</span></p></div>' +
            '</div>[[WEBKIT]]Extra',
        root);
  });
  assertContains('Should have same styles', e.message);
}

function testAssertHtmlMismatchOptionalText() {
  setUpAssertHtmlMatches();

  var e = assertThrows('Should fail due to mismatched text', function() {
    goog.testing.dom.assertHtmlContentsMatch(
        '<div style="display: none; font-size: 2em">' +
            '[[IE GECKO]]Bad<div class="IE"><p class="WEBKIT">' +
            '<span class="GECKO"><br class="GECKO WEBKIT">Text</span></p></div>' +
            '</div>[[WEBKIT]]Bad',
        root);
  });
  assertContains('Text should match', e.message);
}

function testAssertHtmlMismatchExtraActualAfterText() {
  root.innerHTML = '<div>abc</div>def';

  var e = assertThrows('Should fail due to extra actual nodes', function() {
    goog.testing.dom.assertHtmlContentsMatch('<div>abc</div>', root);
  });
  assertContains('Finished expected HTML before', e.message);
}

function testAssertHtmlMismatchExtraActualAfterElement() {
  root.innerHTML = '<br>def';

  var e = assertThrows('Should fail due to extra actual nodes', function() {
    goog.testing.dom.assertHtmlContentsMatch('<br>', root);
  });
  assertContains('Finished expected HTML before', e.message);
}

function testAssertHtmlMatchesWithSplitTextNodes() {
  root.appendChild(goog.dom.createTextNode('1'));
  root.appendChild(goog.dom.createTextNode('2'));
  root.appendChild(goog.dom.createTextNode('3'));
  goog.testing.dom.assertHtmlContentsMatch('123', root);
}

function testAssertHtmlMatchesWithDifferentlyOrderedAttributes() {
  root.innerHTML = '<div foo="a" bar="b" class="className"></div>';

  goog.testing.dom.assertHtmlContentsMatch(
      '<div bar="b" class="className" foo="a"></div>', root, true);
}

function testAssertHtmlMismatchWithDifferentNumberOfAttributes() {
  root.innerHTML = '<div foo="a" bar="b"></div>';

  var e = assertThrows(function() {
    goog.testing.dom.assertHtmlContentsMatch('<div foo="a"></div>', root, true);
  });
  assertContains('Unexpected attribute with name bar in element', e.message);
}

function testAssertHtmlMismatchWithDifferentAttributeNames() {
  root.innerHTML = '<div foo="a" bar="b"></div>';

  var e = assertThrows(function() {
    goog.testing.dom.assertHtmlContentsMatch(
        '<div foo="a" baz="b"></div>', root, true);
  });
  assertContains('Expected to find attribute with name baz', e.message);
}

function testAssertHtmlMismatchWithDifferentClassNames() {
  root.innerHTML = '<div class="className1"></div>';

  var e = assertThrows(function() {
    goog.testing.dom.assertHtmlContentsMatch(
        '<div class="className2"></div>', root, true);
  });
  assertContains(
      'Expected class was: className2, but actual class was: className1',
      e.message);
}

function testAssertHtmlMatchesWithClassNameAndUserAgentSpecified() {
  root.innerHTML = '<div>' +
      (goog.userAgent.GECKO ? '<div class="foo"></div>' : '') + '</div>';

  goog.testing.dom.assertHtmlContentsMatch(
      '<div><div class="foo GECKO"></div></div>', root, true);
}

function testAssertHtmlMatchesWithClassesInDifferentOrder() {
  root.innerHTML = '<div class="class1 class2"></div>';

  goog.testing.dom.assertHtmlContentsMatch(
      '<div class="class2 class1"></div>', root, true);
}

function testAssertHtmlMismatchWithDifferentAttributeValues() {
  root.innerHTML = '<div foo="b" bar="a"></div>';

  var e = assertThrows(function() {
    goog.testing.dom.assertHtmlContentsMatch(
        '<div foo="a" bar="a"></div>', root, true);
  });
  assertContains('Expected attribute foo has a different value', e.message);
}

function testAssertHtmlMatchesWhenStrictAttributesIsFalse() {
  root.innerHTML = '<div foo="a" bar="b"></div>';

  goog.testing.dom.assertHtmlContentsMatch('<div foo="a"></div>', root);
}

function testAssertHtmlMatchesForMethodsAttribute() {
  root.innerHTML = '<a methods="get"></a>';

  goog.testing.dom.assertHtmlContentsMatch('<a></a>', root);
  goog.testing.dom.assertHtmlContentsMatch('<a methods="get"></a>', root);
  goog.testing.dom.assertHtmlContentsMatch('<a methods="get"></a>', root, true);
}

function testAssertHtmlMatchesForMethodsAttribute() {
  root.innerHTML = '<input></input>';

  goog.testing.dom.assertHtmlContentsMatch('<input></input>', root);
  goog.testing.dom.assertHtmlContentsMatch('<input></input>', root, true);
}

function testAssertHtmlMatchesForIdAttribute() {
  root.innerHTML = '<div id="foo"></div>';

  goog.testing.dom.assertHtmlContentsMatch('<div></div>', root);
  goog.testing.dom.assertHtmlContentsMatch('<div id="foo"></div>', root);
  goog.testing.dom.assertHtmlContentsMatch('<div id="foo"></div>', root, true);
}

function testAssertHtmlMatchesWhenIdIsNotSpecified() {
  root.innerHTML = '<div id="someId"></div>';

  goog.testing.dom.assertHtmlContentsMatch('<div></div>', root);
}

function testAssertHtmlMismatchWhenIdIsNotSpecified() {
  root.innerHTML = '<div id="someId"></div>';

  var e = assertThrows(function() {
    goog.testing.dom.assertHtmlContentsMatch('<div></div>', root, true);
  });
  assertContains('Unexpected attribute with name id in element', e.message);
}

function testAssertHtmlMismatchWhenIdIsSpecified() {
  root.innerHTML = '<div></div>';

  var e = assertThrows(function() {
    goog.testing.dom.assertHtmlContentsMatch('<div id="someId"></div>', root);
  });
  assertContains(
      'Expected to find attribute with name id, in element', e.message);

  e = assertThrows(function() {
    goog.testing.dom.assertHtmlContentsMatch(
        '<div id="someId"></div>', root, true);
  });
  assertContains(
      'Expected to find attribute with name id, in element', e.message);
}

function testAssertHtmlMatchesWhenIdIsEmpty() {
  root.innerHTML = '<div></div>';

  goog.testing.dom.assertHtmlContentsMatch('<div></div>', root);
  goog.testing.dom.assertHtmlContentsMatch('<div></div>', root, true);
}

function testAssertHtmlMatchesWithDisabledAttribute() {
  var disabledShortest = '<input disabled="disabled">';
  var disabledShort = '<input disabled="">';
  var disabledLong = '<input disabled="disabled">';
  var enabled = '<input>';

  root.innerHTML = disabledLong;
  goog.testing.dom.assertHtmlContentsMatch(disabledShortest, root, true);
  goog.testing.dom.assertHtmlContentsMatch(disabledShort, root, true);
  goog.testing.dom.assertHtmlContentsMatch(disabledLong, root, true);


  var e = assertThrows('Should fail due to mismatched text', function() {
    goog.testing.dom.assertHtmlContentsMatch(enabled, root, true);
  });
  // Attribute value mismatch in IE.
  // Unexpected attribute error in other browsers.
  assertContains('disabled', e.message);
}

function testAssertHtmlMatchesWithCheckedAttribute() {
  var checkedShortest = '<input type="radio" name="x" checked="checked">';
  var checkedShort = '<input type="radio" name="x" checked="">';
  var checkedLong = '<input type="radio" name="x" checked="checked">';
  var unchecked = '<input type="radio" name="x">';

  root.innerHTML = checkedLong;
  goog.testing.dom.assertHtmlContentsMatch(checkedShortest, root, true);
  goog.testing.dom.assertHtmlContentsMatch(checkedShort, root, true);
  goog.testing.dom.assertHtmlContentsMatch(checkedLong, root, true);
  if (!goog.userAgent.IE) {
    // CHECKED attribute is ignored because it's among BAD_IE_ATTRIBUTES_.
    var e = assertThrows('Should fail due to mismatched text', function() {
      goog.testing.dom.assertHtmlContentsMatch(unchecked, root, true);
    });
    assertContains('Unexpected attribute with name checked', e.message);
  }
}

function testAssertHtmlMatchesWithWhitespace() {
  goog.dom.removeChildren(root);
  root.appendChild(goog.dom.createTextNode('  A  '));
  goog.testing.dom.assertHtmlContentsMatch('  A  ', root);

  goog.dom.removeChildren(root);
  root.appendChild(goog.dom.createTextNode('  A  '));
  root.appendChild(goog.dom.createDom(goog.dom.TagName.SPAN, null, '  B  '));
  root.appendChild(goog.dom.createTextNode('  C  '));
  goog.testing.dom.assertHtmlContentsMatch(
      '  A  <span>  B  </span>  C  ', root);

  goog.dom.removeChildren(root);
  root.appendChild(goog.dom.createTextNode('  A'));
  root.appendChild(goog.dom.createDom(goog.dom.TagName.SPAN, null, '  B'));
  root.appendChild(goog.dom.createTextNode('  C'));
  goog.testing.dom.assertHtmlContentsMatch('  A<span>  B</span>  C', root);
}

function testAssertHtmlMatchesWithWhitespaceAndNesting() {
  goog.dom.removeChildren(root);
  root.appendChild(
      goog.dom.createDom(
          goog.dom.TagName.DIV, null,
          goog.dom.createDom(goog.dom.TagName.B, null, '  A  '),
          goog.dom.createDom(goog.dom.TagName.B, null, '  B  ')));
  root.appendChild(
      goog.dom.createDom(
          goog.dom.TagName.DIV, null,
          goog.dom.createDom(goog.dom.TagName.B, null, '  C  '),
          goog.dom.createDom(goog.dom.TagName.B, null, '  D  ')));

  goog.testing.dom.assertHtmlContentsMatch(
      '<div><b>  A  </b><b>  B  </b></div>' +
          '<div><b>  C  </b><b>  D  </b></div>',
      root);

  goog.dom.removeChildren(root);
  root.appendChild(
      goog.dom.createDom(
          goog.dom.TagName.B, null,
          goog.dom.createDom(
              goog.dom.TagName.B, null,
              goog.dom.createDom(goog.dom.TagName.B, null, '  A  '))));
  root.appendChild(goog.dom.createDom(goog.dom.TagName.B, null, '  B  '));

  goog.testing.dom.assertHtmlContentsMatch(
      '<b><b><b>  A  </b></b></b><b>  B  </b>', root);

  goog.dom.removeChildren(root);
  root.appendChild(
      goog.dom.createDom(
          goog.dom.TagName.DIV, null,
          goog.dom.createDom(
              goog.dom.TagName.B, null,
              goog.dom.createDom(goog.dom.TagName.B, null, '  A  '))));
  root.appendChild(goog.dom.createDom(goog.dom.TagName.B, null, '  B  '));

  goog.testing.dom.assertHtmlContentsMatch(
      '<div><b><b>  A  </b></b></div><b>  B  </b>', root);

  root.innerHTML = '&nbsp;';
  goog.testing.dom.assertHtmlContentsMatch('&nbsp;', root);
}

function testAssertHtmlMatches() {
  // Since assertHtmlMatches is based on assertHtmlContentsMatch, we leave the
  // majority of edge case testing to the above.  Here we just do a sanity
  // check.
  goog.testing.dom.assertHtmlMatches('<div>abc</div>', '<div>abc</div>');
  goog.testing.dom.assertHtmlMatches('<div>abc</div>', '<div>abc</div> ');
  goog.testing.dom.assertHtmlMatches(
      '<div style="font-size: 1px; color: red">abc</div>',
      '<div style="color: red;  font-size: 1px;;">abc</div>');

  var e = assertThrows('Should fail due to mismatched text', function() {
    goog.testing.dom.assertHtmlMatches('<div>abc</div>', '<div>abd</div>');
  });
  assertContains('Text should match', e.message);
}

function testAssertHtmlMatchesWithSvgAttributes() {
  goog.testing.dom.assertHtmlMatches(
      '<svg height="10px"></svg>', '<svg height="10px"></svg>');
}

function testAssertHtmlMatchesWithScriptWithNewLines() {
  goog.testing.dom.assertHtmlMatches(
      '<script>var a;\nvar b;</script>', '<script>var a;\nvar b;</script>');
}
