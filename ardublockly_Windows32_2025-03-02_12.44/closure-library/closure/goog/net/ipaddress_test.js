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

goog.provide('goog.net.IpAddressTest');
goog.setTestOnly('goog.net.IpAddressTest');

goog.require('goog.math.Integer');
goog.require('goog.net.IpAddress');
goog.require('goog.net.Ipv4Address');
goog.require('goog.net.Ipv6Address');
goog.require('goog.testing.jsunit');

function testInvalidStrings() {
  assertEquals(null, goog.net.IpAddress.fromString(''));
  assertEquals(null, goog.net.IpAddress.fromString('016.016.016.016'));
  assertEquals(null, goog.net.IpAddress.fromString('016.016.016'));
  assertEquals(null, goog.net.IpAddress.fromString('016.016'));
  assertEquals(null, goog.net.IpAddress.fromString('016'));
  assertEquals(null, goog.net.IpAddress.fromString('000.000.000.000'));
  assertEquals(null, goog.net.IpAddress.fromString('000'));
  assertEquals(null, goog.net.IpAddress.fromString('0x0a.0x0a.0x0a.0x0a'));
  assertEquals(null, goog.net.IpAddress.fromString('0x0a.0x0a.0x0a'));
  assertEquals(null, goog.net.IpAddress.fromString('0x0a.0x0a'));
  assertEquals(null, goog.net.IpAddress.fromString('0x0a'));
  assertEquals(null, goog.net.IpAddress.fromString('42.42.42.42.42'));
  assertEquals(null, goog.net.IpAddress.fromString('42.42.42'));
  assertEquals(null, goog.net.IpAddress.fromString('42.42'));
  assertEquals(null, goog.net.IpAddress.fromString('42'));
  assertEquals(null, goog.net.IpAddress.fromString('42..42.42'));
  assertEquals(null, goog.net.IpAddress.fromString('42..42.42.42'));
  assertEquals(null, goog.net.IpAddress.fromString('42.42.42.42.'));
  assertEquals(null, goog.net.IpAddress.fromString('42.42.42.42...'));
  assertEquals(null, goog.net.IpAddress.fromString('.42.42.42.42'));
  assertEquals(null, goog.net.IpAddress.fromString('...42.42.42.42'));
  assertEquals(null, goog.net.IpAddress.fromString('42.42.42.-0'));
  assertEquals(null, goog.net.IpAddress.fromString('42.42.42.+0'));
  assertEquals(null, goog.net.IpAddress.fromString('.'));
  assertEquals(null, goog.net.IpAddress.fromString('...'));
  assertEquals(null, goog.net.IpAddress.fromString('bogus'));
  assertEquals(null, goog.net.IpAddress.fromString('bogus.com'));
  assertEquals(null, goog.net.IpAddress.fromString('192.168.0.1.com'));
  assertEquals(
      null, goog.net.IpAddress.fromString('12345.67899.-54321.-98765'));
  assertEquals(null, goog.net.IpAddress.fromString('257.0.0.0'));
  assertEquals(null, goog.net.IpAddress.fromString('42.42.42.-42'));
  assertEquals(null, goog.net.IpAddress.fromString('3ff3:::1'));
  assertEquals(null, goog.net.IpAddress.fromString('3ffe::1.net'));
  assertEquals(null, goog.net.IpAddress.fromString('3ffe::1::1'));
  assertEquals(null, goog.net.IpAddress.fromString('1::2::3::4:5'));
  assertEquals(null, goog.net.IpAddress.fromString('::7:6:5:4:3:2:'));
  assertEquals(null, goog.net.IpAddress.fromString(':6:5:4:3:2:1::'));
  assertEquals(null, goog.net.IpAddress.fromString('2001::db:::1'));
  assertEquals(null, goog.net.IpAddress.fromString('FEDC:9878'));
  assertEquals(null, goog.net.IpAddress.fromString('+1.+2.+3.4'));
  assertEquals(null, goog.net.IpAddress.fromString('1.2.3.4e0'));
  assertEquals(null, goog.net.IpAddress.fromString('::7:6:5:4:3:2:1:0'));
  assertEquals(null, goog.net.IpAddress.fromString('7:6:5:4:3:2:1:0::'));
  assertEquals(null, goog.net.IpAddress.fromString('9:8:7:6:5:4:3::2:1'));
  assertEquals(null, goog.net.IpAddress.fromString('0:1:2:3::4:5:6:7'));
  assertEquals(null, goog.net.IpAddress.fromString('3ffe:0:0:0:0:0:0:0:1'));
  assertEquals(null, goog.net.IpAddress.fromString('3ffe::10000'));
  assertEquals(null, goog.net.IpAddress.fromString('3ffe::goog'));
  assertEquals(null, goog.net.IpAddress.fromString('3ffe::-0'));
  assertEquals(null, goog.net.IpAddress.fromString('3ffe::+0'));
  assertEquals(null, goog.net.IpAddress.fromString('3ffe::-1'));
  assertEquals(null, goog.net.IpAddress.fromString(':'));
  assertEquals(null, goog.net.IpAddress.fromString(':::'));
  assertEquals(null, goog.net.IpAddress.fromString('a:'));
  assertEquals(null, goog.net.IpAddress.fromString('::a:'));
  assertEquals(null, goog.net.IpAddress.fromString('0xa::'));
  assertEquals(null, goog.net.IpAddress.fromString('::1.2.3'));
  assertEquals(null, goog.net.IpAddress.fromString('::1.2.3.4.5'));
  assertEquals(null, goog.net.IpAddress.fromString('::1.2.3.4:'));
  assertEquals(null, goog.net.IpAddress.fromString('1.2.3.4::'));
  assertEquals(null, goog.net.IpAddress.fromString('2001:db8::1:'));
  assertEquals(null, goog.net.IpAddress.fromString(':2001:db8::1'));
}

function testVersion() {
  var ip4 = goog.net.IpAddress.fromString('1.2.3.4');
  assertEquals(ip4.getVersion(), 4);

  var ip6 = goog.net.IpAddress.fromString('2001:dead::beef:1');
  assertEquals(ip6.getVersion(), 6);

  ip6 = goog.net.IpAddress.fromString('::192.168.1.1');
  assertEquals(ip6.getVersion(), 6);
}

function testStringIpv4Address() {
  assertEquals(
      '192.168.1.1', new goog.net.Ipv4Address('192.168.1.1').toString());
  assertEquals('1.1.1.1', new goog.net.Ipv4Address('1.1.1.1').toString());
  assertEquals(
      '224.56.33.2', new goog.net.Ipv4Address('224.56.33.2').toString());
  assertEquals(
      '255.255.255.255',
      new goog.net.Ipv4Address('255.255.255.255').toString());
  assertEquals('0.0.0.0', new goog.net.Ipv4Address('0.0.0.0').toString());
}

function testIntIpv4Address() {
  var ip4Str = new goog.net.Ipv4Address('1.1.1.1');
  var ip4Int = new goog.net.Ipv4Address(new goog.math.Integer([16843009], 0));

  assertTrue(ip4Str.equals(ip4Int));
  assertEquals(ip4Str.toString(), ip4Int.toString());

  assertThrows(
      'Ipv4(-1)',
      goog.partial(goog.net.Ipv4Address, goog.math.Integer.fromInt(-1)));
  assertThrows(
      'Ipv4(2**32)',
      goog.partial(goog.net.Ipv4Address, goog.math.Integer.ONE.shiftLeft(32)));
}

function testStringIpv6Address() {
  assertEquals(
      '1:2:3:4:5:6:7:8',
      new goog.net.Ipv6Address('1:2:3:4:5:6:7:8').toString());
  assertEquals(
      '::1:2:3:4:5:6:7',
      new goog.net.Ipv6Address('::1:2:3:4:5:6:7').toString());
  assertEquals(
      '1:2:3:4:5:6:7::',
      new goog.net.Ipv6Address('1:2:3:4:5:6:7:0').toString());
  assertEquals(
      '2001:0:0:4::8',
      new goog.net.Ipv6Address('2001:0:0:4:0:0:0:8').toString());
  assertEquals(
      '2001::4:5:6:7:8',
      new goog.net.Ipv6Address('2001:0:0:4:5:6:7:8').toString());
  assertEquals(
      '2001::3:4:5:6:7:8',
      new goog.net.Ipv6Address('2001:0:3:4:5:6:7:8').toString());
  assertEquals(
      '0:0:3::ffff', new goog.net.Ipv6Address('0:0:3:0:0:0:0:ffff').toString());
  assertEquals(
      '::4:0:0:0:ffff',
      new goog.net.Ipv6Address('0:0:0:4:0:0:0:ffff').toString());
  assertEquals(
      '::5:0:0:ffff',
      new goog.net.Ipv6Address('0:0:0:0:5:0:0:ffff').toString());
  assertEquals(
      '1::4:0:0:7:8', new goog.net.Ipv6Address('1:0:0:4:0:0:7:8').toString());
  assertEquals('::', new goog.net.Ipv6Address('0:0:0:0:0:0:0:0').toString());
  assertEquals('::1', new goog.net.Ipv6Address('0:0:0:0:0:0:0:1').toString());
  assertEquals(
      '2001:658:22a:cafe::',
      new goog.net.Ipv6Address('2001:0658:022a:cafe:0000:0000:0000:0000')
          .toString());
  assertEquals('::102:304', new goog.net.Ipv6Address('::1.2.3.4').toString());
  assertEquals(
      '::ffff:303:303', new goog.net.Ipv6Address('::ffff:3.3.3.3').toString());
  assertEquals(
      '::ffff:ffff', new goog.net.Ipv6Address('::255.255.255.255').toString());
}

function testIntIpv6Address() {
  var ip6Str = new goog.net.Ipv6Address('2001::dead:beef:1');
  var ip6Int = new goog.net.Ipv6Address(
      new goog.math.Integer([3203334145, 57005, 0, 536936448], 0));

  assertTrue(ip6Str.equals(ip6Int));
  assertEquals(ip6Str.toString(), ip6Int.toString());

  assertThrows(
      'Ipv6(-1)',
      goog.partial(goog.net.Ipv6Address, goog.math.Integer.fromInt(-1)));
  assertThrows(
      'Ipv6(2**128)',
      goog.partial(goog.net.Ipv6Address, goog.math.Integer.ONE.shiftLeft(128)));
}

function testDottedQuadIpv6() {
  var ip6 = new goog.net.Ipv6Address('7::0.128.0.127');
  ip6 = new goog.net.Ipv6Address('7::0.128.0.128');
  ip6 = new goog.net.Ipv6Address('7::128.128.0.127');
  ip6 = new goog.net.Ipv6Address('7::0.128.128.127');
}

function testMappedIpv4Address() {
  var testAddresses = ['::ffff:1.2.3.4', '::FFFF:102:304'];
  var ipv4Str = '1.2.3.4';

  var ip1 = new goog.net.Ipv6Address(testAddresses[0]);
  var ip2 = new goog.net.Ipv6Address(testAddresses[1]);
  var ipv4 = new goog.net.Ipv4Address(ipv4Str);

  assertTrue(ip1.isMappedIpv4Address());
  assertTrue(ip2.isMappedIpv4Address());
  assertTrue(ip1.equals(ip2));
  assertTrue(ipv4.equals(ip1.getMappedIpv4Address()));
  assertTrue(ipv4.equals(ip2.getMappedIpv4Address()));
}


function testUriString() {
  var ip4Str = '192.168.1.1';
  var ip4Uri = goog.net.IpAddress.fromUriString(ip4Str);
  var ip4 = goog.net.IpAddress.fromString(ip4Str);
  assertTrue(ip4Uri.equals(ip4));

  var ip6Str = '2001:dead::beef:1';
  assertEquals(null, goog.net.IpAddress.fromUriString(ip6Str));

  var ip6Uri = goog.net.IpAddress.fromUriString('[' + ip6Str + ']');
  var ip6 = goog.net.IpAddress.fromString(ip6Str);
  assertTrue(ip6Uri.equals(ip6));
  assertEquals(ip6Uri.toString(), ip6Str);
  assertEquals(ip6Uri.toUriString(), '[' + ip6Str + ']');
}
