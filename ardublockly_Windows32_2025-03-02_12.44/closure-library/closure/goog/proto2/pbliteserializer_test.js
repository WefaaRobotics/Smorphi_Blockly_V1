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

goog.provide('goog.proto2.PbLiteSerializerTest');
goog.setTestOnly('goog.proto2.PbLiteSerializerTest');

goog.require('goog.proto2.PbLiteSerializer');
goog.require('goog.testing.jsunit');
goog.require('proto2.TestAllTypes');

function testSerializationAndDeserialization() {
  var message = createPopulatedMessage();

  // Serialize.
  var serializer = new goog.proto2.PbLiteSerializer();
  var pblite = serializer.serialize(message);

  assertTrue(goog.isArray(pblite));

  // Assert that everything serialized properly.
  assertEquals(101, pblite[1]);
  assertEquals('102', pblite[2]);
  assertEquals(103, pblite[3]);
  assertEquals('104', pblite[4]);
  assertEquals(105, pblite[5]);
  assertEquals('106', pblite[6]);
  assertEquals(107, pblite[7]);
  assertEquals('108', pblite[8]);
  assertEquals(109, pblite[9]);
  assertEquals('110', pblite[10]);
  assertEquals(111.5, pblite[11]);
  assertEquals(112.5, pblite[12]);
  assertEquals(1, pblite[13]);  // true is serialized as 1
  assertEquals('test', pblite[14]);
  assertEquals('abcd', pblite[15]);

  assertEquals(111, pblite[16][17]);
  assertEquals(112, pblite[18][1]);

  assertTrue(pblite[19] === undefined);
  assertTrue(pblite[20] === undefined);

  assertEquals(proto2.TestAllTypes.NestedEnum.FOO, pblite[21]);

  assertEquals(201, pblite[31][0]);
  assertEquals(202, pblite[31][1]);
  assertEquals('foo', pblite[44][0]);
  assertEquals('bar', pblite[44][1]);

  var serializer = new goog.proto2.PbLiteSerializer();
  // Deserialize.
  var messageCopy =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), pblite);

  assertNotEquals(messageCopy, message);

  assertDeserializationMatches(messageCopy);
}

function testZeroBasedSerializationAndDeserialization() {
  var message = createPopulatedMessage();

  // Serialize.
  var serializer = new goog.proto2.PbLiteSerializer();
  serializer.setZeroIndexed(true);

  var pblite = serializer.serialize(message);

  assertTrue(goog.isArray(pblite));

  // Assert that everything serialized properly.
  assertEquals(101, pblite[0]);
  assertEquals('102', pblite[1]);
  assertEquals(103, pblite[2]);
  assertEquals('104', pblite[3]);
  assertEquals(105, pblite[4]);
  assertEquals('106', pblite[5]);
  assertEquals(107, pblite[6]);
  assertEquals('108', pblite[7]);
  assertEquals(109, pblite[8]);
  assertEquals('110', pblite[9]);
  assertEquals(111.5, pblite[10]);
  assertEquals(112.5, pblite[11]);
  assertEquals(1, pblite[12]);  // true is serialized as 1
  assertEquals('test', pblite[13]);
  assertEquals('abcd', pblite[14]);

  assertEquals(111, pblite[15][16]);
  assertEquals(112, pblite[17][0]);

  assertTrue(pblite[18] === undefined);
  assertTrue(pblite[19] === undefined);

  assertEquals(proto2.TestAllTypes.NestedEnum.FOO, pblite[20]);

  assertEquals(201, pblite[30][0]);
  assertEquals(202, pblite[30][1]);
  assertEquals('foo', pblite[43][0]);
  assertEquals('bar', pblite[43][1]);

  // Deserialize.
  var messageCopy =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), pblite);

  assertNotEquals(messageCopy, message);

  assertEquals(message.getOptionalInt32(), messageCopy.getOptionalInt32());
  assertDeserializationMatches(messageCopy);
}

function createPopulatedMessage() {
  var message = new proto2.TestAllTypes();

  // Set the fields.
  // Singular.
  message.setOptionalInt32(101);
  message.setOptionalInt64('102');
  message.setOptionalUint32(103);
  message.setOptionalUint64('104');
  message.setOptionalSint32(105);
  message.setOptionalSint64('106');
  message.setOptionalFixed32(107);
  message.setOptionalFixed64('108');
  message.setOptionalSfixed32(109);
  message.setOptionalSfixed64('110');
  message.setOptionalFloat(111.5);
  message.setOptionalDouble(112.5);
  message.setOptionalBool(true);
  message.setOptionalString('test');
  message.setOptionalBytes('abcd');

  var group = new proto2.TestAllTypes.OptionalGroup();
  group.setA(111);

  message.setOptionalgroup(group);

  var nestedMessage = new proto2.TestAllTypes.NestedMessage();
  nestedMessage.setB(112);

  message.setOptionalNestedMessage(nestedMessage);

  message.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.FOO);

  // Repeated.
  message.addRepeatedInt32(201);
  message.addRepeatedInt32(202);

  // Skip a few repeated fields so we can test how null array values are
  // handled.
  message.addRepeatedString('foo');
  message.addRepeatedString('bar');
  return message;
}

function testDeserializationFromExternalSource() {
  // Test deserialization where the JSON array is initialized from something
  // outside the Closure proto2 library, such as the JsPbLite library, or
  // manually as in this test.
  var pblite = [
    ,        // 0
    101,     // 1
    '102',   // 2
    103,     // 3
    '104',   // 4
    105,     // 5
    '106',   // 6
    107,     // 7
    '108',   // 8
    109,     // 9
    '110',   // 10
    111.5,   // 11
    112.5,   // 12
    1,       // 13
    'test',  // 14
    'abcd',  // 15
    [
      , , , , , , , , , , , , , , , , , 111
    ],        // 16, note the 17 commas so value is index 17
    ,         // 17
    [, 112],  // 18
    ,
    ,                                    // 19-20
    proto2.TestAllTypes.NestedEnum.FOO,  // 21
    , , , , , , , , ,                    // 22-30
    [201, 202],                          // 31
    , , , , , , , , , , , ,              // 32-43
    ['foo', 'bar'],                      // 44
    , , , ,                              // 45-49
  ];

  // Deserialize.
  var serializer = new goog.proto2.PbLiteSerializer();
  var messageCopy =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), pblite);

  assertDeserializationMatches(messageCopy);

  // http://b/issue?id=2928075
  assertFalse(messageCopy.hasRepeatedInt64());
  assertEquals(0, messageCopy.repeatedInt64Count());
  messageCopy.repeatedInt64Array();
  assertFalse(messageCopy.hasRepeatedInt64());
  assertEquals(0, messageCopy.repeatedInt64Count());

  // Access a nested message to ensure it is deserialized.
  assertNotNull(messageCopy.getOptionalNestedMessage());

  // Verify that the pblite array itself has not been replaced by the
  // deserialization.
  assertEquals('array', goog.typeOf(pblite[16]));

  // Update some fields and verify that the changes work with the lazy
  // deserializer.
  messageCopy.setOptionalBool(true);
  assertTrue(messageCopy.getOptionalBool());

  messageCopy.setOptionalBool(false);
  assertFalse(messageCopy.getOptionalBool());

  messageCopy.setOptionalInt32(1234);
  assertEquals(1234, messageCopy.getOptionalInt32());
}

function testModifyLazyDeserializedMessage() {
  var pblite = [
    ,        // 0
    101,     // 1
    '102',   // 2
    103,     // 3
    '104',   // 4
    105,     // 5
    '106',   // 6
    107,     // 7
    '108',   // 8
    109,     // 9
    '110',   // 10
    111.5,   // 11
    112.5,   // 12
    1,       // 13
    'test',  // 14
    'abcd',  // 15
    [
      , , , , , , , , , , , , , , , , , 111
    ],        // 16, note the 17 commas so value is index 17
    ,         // 17
    [, 112],  // 18
    ,
    ,                                    // 19-20
    proto2.TestAllTypes.NestedEnum.FOO,  // 21
    , , , , , , , , ,                    // 22-30
    [201, 202],                          // 31
    , , , , , , , , , , , ,              // 32-43
    ['foo', 'bar'],                      // 44
    , , , ,                              // 45-49
  ];

  // Deserialize.
  var serializer = new goog.proto2.PbLiteSerializer();
  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), pblite);

  // Conduct some operations, ensuring that they all work as expected, even with
  // the lazily deserialized data.
  assertEquals(101, message.getOptionalInt32());
  message.setOptionalInt32(401);
  assertEquals(401, message.getOptionalInt32());

  assertEquals(2, message.repeatedInt32Count());
  assertEquals(201, message.getRepeatedInt32(0));
  assertEquals(202, message.getRepeatedInt32(1));

  message.clearRepeatedInt32();
  assertEquals(0, message.repeatedInt32Count());

  message.addRepeatedInt32(101);
  assertEquals(1, message.repeatedInt32Count());
  assertEquals(101, message.getRepeatedInt32(0));

  message.setUnknown(12345, 601);
  message.forEachUnknown(function(tag, value) {
    assertEquals(12345, tag);
    assertEquals(601, value);
  });

  // Create a copy of the message.
  var messageCopy = new proto2.TestAllTypes();
  messageCopy.copyFrom(message);

  assertEquals(1, messageCopy.repeatedInt32Count());
  assertEquals(101, messageCopy.getRepeatedInt32(0));
}

function testModifyLazyDeserializedMessageByAddingMessage() {
  var pblite = [
    ,        // 0
    101,     // 1
    '102',   // 2
    103,     // 3
    '104',   // 4
    105,     // 5
    '106',   // 6
    107,     // 7
    '108',   // 8
    109,     // 9
    '110',   // 10
    111.5,   // 11
    112.5,   // 12
    1,       // 13
    'test',  // 14
    'abcd',  // 15
    [
      , , , , , , , , , , , , , , , , , 111
    ],        // 16, note the 17 commas so value is index 17
    ,         // 17
    [, 112],  // 18
    ,
    ,                                    // 19-20
    proto2.TestAllTypes.NestedEnum.FOO,  // 21
    , , , , , , , , ,                    // 22-30
    [201, 202],                          // 31
    , , , , , , , , , , , ,              // 32-43
    ['foo', 'bar'],                      // 44
    , , , ,                              // 45-49
  ];

  // Deserialize.
  var serializer = new goog.proto2.PbLiteSerializer();
  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), pblite);

  // Add a new nested message.
  var nested1 = new proto2.TestAllTypes.NestedMessage();
  nested1.setB(1234);

  var nested2 = new proto2.TestAllTypes.NestedMessage();
  nested2.setB(4567);

  message.addRepeatedNestedMessage(nested1);

  // Check the new nested message.
  assertEquals(1, message.repeatedNestedMessageArray().length);
  assertTrue(message.repeatedNestedMessageArray()[0].equals(nested1));

  // Add another nested message.
  message.addRepeatedNestedMessage(nested2);

  // Check both nested messages.
  assertEquals(2, message.repeatedNestedMessageArray().length);
  assertTrue(message.repeatedNestedMessageArray()[0].equals(nested1));
  assertTrue(message.repeatedNestedMessageArray()[1].equals(nested2));
}

function assertDeserializationMatches(messageCopy) {
  assertNotNull(messageCopy);

  assertTrue(messageCopy.hasOptionalInt32());
  assertTrue(messageCopy.hasOptionalInt64());
  assertTrue(messageCopy.hasOptionalUint32());
  assertTrue(messageCopy.hasOptionalUint64());
  assertTrue(messageCopy.hasOptionalSint32());
  assertTrue(messageCopy.hasOptionalSint64());
  assertTrue(messageCopy.hasOptionalFixed32());
  assertTrue(messageCopy.hasOptionalFixed64());
  assertTrue(messageCopy.hasOptionalSfixed32());
  assertTrue(messageCopy.hasOptionalSfixed64());
  assertTrue(messageCopy.hasOptionalFloat());
  assertTrue(messageCopy.hasOptionalDouble());
  assertTrue(messageCopy.hasOptionalBool());
  assertTrue(messageCopy.hasOptionalString());
  assertTrue(messageCopy.hasOptionalBytes());
  assertTrue(messageCopy.hasOptionalgroup());
  assertTrue(messageCopy.hasOptionalNestedMessage());
  assertTrue(messageCopy.hasOptionalNestedEnum());

  assertTrue(messageCopy.hasRepeatedInt32());
  assertFalse(messageCopy.hasRepeatedInt64());
  assertFalse(messageCopy.hasRepeatedUint32());
  assertFalse(messageCopy.hasRepeatedUint64());
  assertFalse(messageCopy.hasRepeatedSint32());
  assertFalse(messageCopy.hasRepeatedSint64());
  assertFalse(messageCopy.hasRepeatedFixed32());
  assertFalse(messageCopy.hasRepeatedFixed64());
  assertFalse(messageCopy.hasRepeatedSfixed32());
  assertFalse(messageCopy.hasRepeatedSfixed64());
  assertFalse(messageCopy.hasRepeatedFloat());
  assertFalse(messageCopy.hasRepeatedDouble());
  assertFalse(messageCopy.hasRepeatedBool());
  assertTrue(messageCopy.hasRepeatedString());
  assertFalse(messageCopy.hasRepeatedBytes());
  assertFalse(messageCopy.hasRepeatedgroup());
  assertFalse(messageCopy.hasRepeatedNestedMessage());
  assertFalse(messageCopy.hasRepeatedNestedEnum());

  assertEquals(1, messageCopy.optionalInt32Count());
  assertEquals(1, messageCopy.optionalInt64Count());
  assertEquals(1, messageCopy.optionalUint32Count());
  assertEquals(1, messageCopy.optionalUint64Count());
  assertEquals(1, messageCopy.optionalSint32Count());
  assertEquals(1, messageCopy.optionalSint64Count());
  assertEquals(1, messageCopy.optionalFixed32Count());
  assertEquals(1, messageCopy.optionalFixed64Count());
  assertEquals(1, messageCopy.optionalSfixed32Count());
  assertEquals(1, messageCopy.optionalSfixed64Count());
  assertEquals(1, messageCopy.optionalFloatCount());
  assertEquals(1, messageCopy.optionalDoubleCount());
  assertEquals(1, messageCopy.optionalBoolCount());
  assertEquals(1, messageCopy.optionalStringCount());
  assertEquals(1, messageCopy.optionalBytesCount());
  assertEquals(1, messageCopy.optionalgroupCount());
  assertEquals(1, messageCopy.optionalNestedMessageCount());
  assertEquals(1, messageCopy.optionalNestedEnumCount());

  assertEquals(2, messageCopy.repeatedInt32Count());
  assertEquals(0, messageCopy.repeatedInt64Count());
  assertEquals(0, messageCopy.repeatedUint32Count());
  assertEquals(0, messageCopy.repeatedUint64Count());
  assertEquals(0, messageCopy.repeatedSint32Count());
  assertEquals(0, messageCopy.repeatedSint64Count());
  assertEquals(0, messageCopy.repeatedFixed32Count());
  assertEquals(0, messageCopy.repeatedFixed64Count());
  assertEquals(0, messageCopy.repeatedSfixed32Count());
  assertEquals(0, messageCopy.repeatedSfixed64Count());
  assertEquals(0, messageCopy.repeatedFloatCount());
  assertEquals(0, messageCopy.repeatedDoubleCount());
  assertEquals(0, messageCopy.repeatedBoolCount());
  assertEquals(2, messageCopy.repeatedStringCount());
  assertEquals(0, messageCopy.repeatedBytesCount());
  assertEquals(0, messageCopy.repeatedgroupCount());
  assertEquals(0, messageCopy.repeatedNestedMessageCount());
  assertEquals(0, messageCopy.repeatedNestedEnumCount());

  assertEquals(101, messageCopy.getOptionalInt32());
  assertEquals('102', messageCopy.getOptionalInt64());
  assertEquals(103, messageCopy.getOptionalUint32());
  assertEquals('104', messageCopy.getOptionalUint64());
  assertEquals(105, messageCopy.getOptionalSint32());
  assertEquals('106', messageCopy.getOptionalSint64());
  assertEquals(107, messageCopy.getOptionalFixed32());
  assertEquals('108', messageCopy.getOptionalFixed64());
  assertEquals(109, messageCopy.getOptionalSfixed32());
  assertEquals('110', messageCopy.getOptionalSfixed64());
  assertEquals(111.5, messageCopy.getOptionalFloat());
  assertEquals(112.5, messageCopy.getOptionalDouble());
  assertEquals(true, messageCopy.getOptionalBool());
  assertEquals('test', messageCopy.getOptionalString());
  assertEquals('abcd', messageCopy.getOptionalBytes());
  assertEquals(111, messageCopy.getOptionalgroup().getA());

  assertEquals(112, messageCopy.getOptionalNestedMessage().getB());

  assertEquals(
      proto2.TestAllTypes.NestedEnum.FOO, messageCopy.getOptionalNestedEnum());

  assertEquals(201, messageCopy.getRepeatedInt32(0));
  assertEquals(202, messageCopy.getRepeatedInt32(1));
}

function testMergeFromLazyTarget() {
  var serializer = new goog.proto2.PbLiteSerializer();

  var source = new proto2.TestAllTypes();
  var nested = new proto2.TestAllTypes.NestedMessage();
  nested.setB(66);
  source.setOptionalNestedMessage(nested);
  source.setOptionalInt32(32);
  source.setOptionalString('foo');
  source.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.FOO);
  source.addRepeatedInt32(2);

  var target = new proto2.TestAllTypes();
  nested = new proto2.TestAllTypes.NestedMessage();
  nested.setC(77);
  target.setOptionalNestedMessage(nested);
  target.setOptionalInt64('64');
  target.setOptionalString('bar');
  target.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.BAR);
  target.addRepeatedInt32(1);
  var pbliteTarget = serializer.serialize(target);
  var lazyTarget =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), pbliteTarget);

  var expected = new proto2.TestAllTypes();
  nested = new proto2.TestAllTypes.NestedMessage();
  nested.setB(66);
  nested.setC(77);
  expected.setOptionalNestedMessage(nested);
  expected.setOptionalInt32(32);
  expected.setOptionalInt64('64');
  expected.setOptionalString('foo');
  expected.setOptionalNestedEnum(proto2.TestAllTypes.NestedEnum.FOO);
  expected.addRepeatedInt32(1);
  expected.addRepeatedInt32(2);

  lazyTarget.mergeFrom(source);
  assertTrue(
      'expected and lazyTarget are equal after mergeFrom',
      lazyTarget.equals(expected));
}
