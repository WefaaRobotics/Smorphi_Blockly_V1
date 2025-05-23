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

goog.provide('goog.proto2.ObjectSerializerTest');
goog.setTestOnly('goog.proto2.ObjectSerializerTest');

goog.require('goog.proto2.ObjectSerializer');
goog.require('goog.proto2.Serializer');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('proto2.TestAllTypes');

var propertyReplacer = new goog.testing.PropertyReplacer();

function tearDown() {
  propertyReplacer.reset();
}

function testSerialization() {
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

  // Serialize to a simplified object.
  var simplified = new goog.proto2.ObjectSerializer().serialize(message);

  // Assert that everything serialized properly.
  assertEquals(101, simplified[1]);
  assertEquals('102', simplified[2]);
  assertEquals(103, simplified[3]);
  assertEquals('104', simplified[4]);
  assertEquals(105, simplified[5]);
  assertEquals('106', simplified[6]);
  assertEquals(107, simplified[7]);
  assertEquals('108', simplified[8]);
  assertEquals(109, simplified[9]);
  assertEquals('110', simplified[10]);
  assertEquals(111.5, simplified[11]);
  assertEquals(112.5, simplified[12]);
  assertEquals(true, simplified[13]);
  assertEquals('test', simplified[14]);
  assertEquals('abcd', simplified[15]);

  assertEquals(111, simplified[16][17]);
  assertEquals(112, simplified[18][1]);
  assertEquals(proto2.TestAllTypes.NestedEnum.FOO, simplified[21]);

  assertEquals(201, simplified[31][0]);
  assertEquals(202, simplified[31][1]);

  // Serialize to a simplified object (with key as name).
  simplified =
      new goog.proto2
          .ObjectSerializer(goog.proto2.ObjectSerializer.KeyOption.NAME)
          .serialize(message);

  // Assert that everything serialized properly.
  assertEquals(101, simplified['optional_int32']);
  assertEquals('102', simplified['optional_int64']);
  assertEquals(103, simplified['optional_uint32']);
  assertEquals('104', simplified['optional_uint64']);
  assertEquals(105, simplified['optional_sint32']);
  assertEquals('106', simplified['optional_sint64']);
  assertEquals(107, simplified['optional_fixed32']);
  assertEquals('108', simplified['optional_fixed64']);
  assertEquals(109, simplified['optional_sfixed32']);
  assertEquals('110', simplified['optional_sfixed64']);
  assertEquals(111.5, simplified['optional_float']);
  assertEquals(112.5, simplified['optional_double']);
  assertEquals(true, simplified['optional_bool']);
  assertEquals('test', simplified['optional_string']);
  assertEquals('abcd', simplified['optional_bytes']);

  assertEquals(111, simplified['optionalgroup']['a']);
  assertEquals(112, simplified['optional_nested_message']['b']);

  assertEquals(
      proto2.TestAllTypes.NestedEnum.FOO, simplified['optional_nested_enum']);

  assertEquals(201, simplified['repeated_int32'][0]);
  assertEquals(202, simplified['repeated_int32'][1]);
}


function testSerializationOfUnknown() {
  var message = new proto2.TestAllTypes();

  // Set the fields.
  // Known.
  message.setOptionalInt32(101);
  message.setOptionalInt64('102');
  message.addRepeatedInt32(201);
  message.addRepeatedInt32(202);

  // Unknown.
  message.setUnknown(1000, 301);
  message.setUnknown(1001, 302);

  // Serialize.
  var simplified = new goog.proto2.ObjectSerializer().serialize(message);

  assertEquals(101, simplified['1']);
  assertEquals('102', simplified['2']);

  assertEquals(201, simplified['31'][0]);
  assertEquals(202, simplified['31'][1]);

  assertEquals(301, simplified['1000']);
  assertEquals(302, simplified['1001']);
}

function testDeserializationOfUnknown() {
  var simplified = {1: 101, 2: '102', 1000: 103, 1001: 104};

  var serializer = new goog.proto2.ObjectSerializer();

  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);

  assertNotNull(message);
  assertTrue(message.hasOptionalInt32());
  assertTrue(message.hasOptionalInt64());

  assertEquals(101, message.getOptionalInt32());
  assertEquals('102', message.getOptionalInt64());

  var count = 0;

  message.forEachUnknown(function(tag, value) {
    if (tag == 1000) {
      assertEquals(103, value);
    }

    if (tag == 1001) {
      assertEquals(104, value);
    }

    ++count;
  });

  assertEquals(2, count);
}

function testDeserializationRepeated() {
  var simplified = {
    31: [101, 102],
    41: [201.5, 202.5, 203.5],
    42: [],
    43: [true, false],
    44: ['he', 'llo'],
    46: [{47: [101]}, {47: [102]}],
    48: [{1: 201}, {1: 202}]
  };

  var serializer = new goog.proto2.ObjectSerializer();

  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);

  assertNotNull(message);

  // Ensure the fields are set as expected.
  assertTrue(message.hasRepeatedInt32());
  assertTrue(message.hasRepeatedFloat());

  assertFalse(message.hasRepeatedDouble());

  assertTrue(message.hasRepeatedBool());
  assertTrue(message.hasRepeatedgroup());
  assertTrue(message.hasRepeatedNestedMessage());

  // Ensure the counts match.
  assertEquals(2, message.repeatedInt32Count());
  assertEquals(3, message.repeatedFloatCount());

  assertEquals(0, message.repeatedDoubleCount());

  assertEquals(2, message.repeatedBoolCount());
  assertEquals(2, message.repeatedStringCount());
  assertEquals(2, message.repeatedgroupCount());
  assertEquals(2, message.repeatedNestedMessageCount());

  // Ensure the values match.
  assertEquals(101, message.getRepeatedInt32(0));
  assertEquals(102, message.getRepeatedInt32(1));

  assertEquals(201.5, message.getRepeatedFloat(0));
  assertEquals(202.5, message.getRepeatedFloat(1));
  assertEquals(203.5, message.getRepeatedFloat(2));

  assertEquals(true, message.getRepeatedBool(0));
  assertEquals(false, message.getRepeatedBool(1));

  assertEquals('he', message.getRepeatedString(0));
  assertEquals('llo', message.getRepeatedString(1));

  assertEquals(101, message.getRepeatedgroup(0).getA(0));
  assertEquals(102, message.getRepeatedgroup(1).getA(0));

  assertEquals(201, message.getRepeatedNestedMessage(0).getB());
  assertEquals(202, message.getRepeatedNestedMessage(1).getB());
}

function testDeserialization() {
  var simplified = {
    1: 101,
    2: '102',
    3: 103,
    4: '104',
    5: 105,
    6: '106',
    7: 107,
    8: '108',
    9: 109,
    10: '110',
    11: 111.5,
    12: 112.5,
    13: true,
    14: 'test',
    15: 'abcd',
    16: {17: 113},
    18: {1: 114},
    21: proto2.TestAllTypes.NestedEnum.FOO
  };

  var serializer = new goog.proto2.ObjectSerializer();

  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);

  assertNotNull(message);

  assertTrue(message.hasOptionalInt32());
  assertTrue(message.hasOptionalInt64());
  assertTrue(message.hasOptionalUint32());
  assertTrue(message.hasOptionalUint64());
  assertTrue(message.hasOptionalSint32());
  assertTrue(message.hasOptionalSint64());
  assertTrue(message.hasOptionalFixed32());
  assertTrue(message.hasOptionalFixed64());
  assertTrue(message.hasOptionalSfixed32());
  assertTrue(message.hasOptionalSfixed64());
  assertTrue(message.hasOptionalFloat());
  assertTrue(message.hasOptionalDouble());
  assertTrue(message.hasOptionalBool());
  assertTrue(message.hasOptionalString());
  assertTrue(message.hasOptionalBytes());
  assertTrue(message.hasOptionalgroup());
  assertTrue(message.hasOptionalNestedMessage());
  assertTrue(message.hasOptionalNestedEnum());

  assertEquals(1, message.optionalInt32Count());
  assertEquals(1, message.optionalInt64Count());
  assertEquals(1, message.optionalUint32Count());
  assertEquals(1, message.optionalUint64Count());
  assertEquals(1, message.optionalSint32Count());
  assertEquals(1, message.optionalSint64Count());
  assertEquals(1, message.optionalFixed32Count());
  assertEquals(1, message.optionalFixed64Count());
  assertEquals(1, message.optionalSfixed32Count());
  assertEquals(1, message.optionalSfixed64Count());
  assertEquals(1, message.optionalFloatCount());
  assertEquals(1, message.optionalDoubleCount());
  assertEquals(1, message.optionalBoolCount());
  assertEquals(1, message.optionalStringCount());
  assertEquals(1, message.optionalBytesCount());
  assertEquals(1, message.optionalgroupCount());
  assertEquals(1, message.optionalNestedMessageCount());
  assertEquals(1, message.optionalNestedEnumCount());

  assertEquals(101, message.getOptionalInt32());
  assertEquals('102', message.getOptionalInt64());
  assertEquals(103, message.getOptionalUint32());
  assertEquals('104', message.getOptionalUint64());
  assertEquals(105, message.getOptionalSint32());
  assertEquals('106', message.getOptionalSint64());
  assertEquals(107, message.getOptionalFixed32());
  assertEquals('108', message.getOptionalFixed64());
  assertEquals(109, message.getOptionalSfixed32());
  assertEquals('110', message.getOptionalSfixed64());
  assertEquals(111.5, message.getOptionalFloat());
  assertEquals(112.5, message.getOptionalDouble());
  assertEquals(true, message.getOptionalBool());
  assertEquals('test', message.getOptionalString());
  assertEquals('abcd', message.getOptionalBytes());
  assertEquals(113, message.getOptionalgroup().getA());
  assertEquals(114, message.getOptionalNestedMessage().getB());

  assertEquals(
      proto2.TestAllTypes.NestedEnum.FOO, message.getOptionalNestedEnum());
}

function testDeserializationUnknownEnumValue() {
  var simplified = {21: 1001};

  var serializer = new goog.proto2.ObjectSerializer();

  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);

  assertNotNull(message);

  assertEquals(1001, message.getOptionalNestedEnum());
}

function testDeserializationSymbolicEnumValue() {
  var simplified = {21: 'BAR'};

  propertyReplacer.set(goog.proto2.Serializer, 'DECODE_SYMBOLIC_ENUMS', true);

  var serializer = new goog.proto2.ObjectSerializer();

  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);

  assertNotNull(message);

  assertEquals(
      proto2.TestAllTypes.NestedEnum.BAR, message.getOptionalNestedEnum());
}

function testDeserializationSymbolicEnumValueTurnedOff() {
  var simplified = {21: 'BAR'};

  var serializer = new goog.proto2.ObjectSerializer();

  assertThrows(
      'Should have an assertion failure in deserialization', function() {
        serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);
      });
}

function testDeserializationUnknownSymbolicEnumValue() {
  var simplified = {21: 'BARRED'};

  var serializer = new goog.proto2.ObjectSerializer();

  assertThrows(
      'Should have an assertion failure in deserialization', function() {
        serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);
      });
}

function testDeserializationNumbersOrStrings() {
  // 64-bit types may have been serialized as numbers or strings.
  // Deserialization should be able to handle either.

  var simplifiedWithNumbers =
      {50: 5000, 51: 5100, 52: [5200, 5201], 53: [5300, 5301]};

  var simplifiedWithStrings =
      {50: '5000', 51: '5100', 52: ['5200', '5201'], 53: ['5300', '5301']};

  var serializer = new goog.proto2.ObjectSerializer();

  var message = serializer.deserialize(
      proto2.TestAllTypes.getDescriptor(), simplifiedWithNumbers);

  assertNotNull(message);

  assertEquals(5000, message.getOptionalInt64Number());
  assertEquals('5100', message.getOptionalInt64String());
  assertEquals(5200, message.getRepeatedInt64Number(0));
  assertEquals(5201, message.getRepeatedInt64Number(1));
  assertEquals('5300', message.getRepeatedInt64String(0));
  assertEquals('5301', message.getRepeatedInt64String(1));

  assertArrayEquals([5200, 5201], message.repeatedInt64NumberArray());
  assertArrayEquals(['5300', '5301'], message.repeatedInt64StringArray());

  message = serializer.deserialize(
      proto2.TestAllTypes.getDescriptor(), simplifiedWithStrings);

  assertNotNull(message);

  assertEquals(5000, message.getOptionalInt64Number());
  assertEquals('5100', message.getOptionalInt64String());
  assertEquals(5200, message.getRepeatedInt64Number(0));
  assertEquals(5201, message.getRepeatedInt64Number(1));
  assertEquals('5300', message.getRepeatedInt64String(0));
  assertEquals('5301', message.getRepeatedInt64String(1));

  assertArrayEquals([5200, 5201], message.repeatedInt64NumberArray());
  assertArrayEquals(['5300', '5301'], message.repeatedInt64StringArray());
}

function testSerializationSpecialFloatDoubleValues() {
  // NaN, Infinity and -Infinity should get serialized as strings.
  var message = new proto2.TestAllTypes();
  message.setOptionalFloat(Infinity);
  message.setOptionalDouble(-Infinity);
  message.addRepeatedFloat(Infinity);
  message.addRepeatedFloat(-Infinity);
  message.addRepeatedFloat(NaN);
  message.addRepeatedDouble(Infinity);
  message.addRepeatedDouble(-Infinity);
  message.addRepeatedDouble(NaN);
  var simplified = new goog.proto2.ObjectSerializer().serialize(message);

  // Assert that everything serialized properly.
  assertEquals('Infinity', simplified[11]);
  assertEquals('-Infinity', simplified[12]);
  assertEquals('Infinity', simplified[41][0]);
  assertEquals('-Infinity', simplified[41][1]);
  assertEquals('NaN', simplified[41][2]);
  assertEquals('Infinity', simplified[42][0]);
  assertEquals('-Infinity', simplified[42][1]);
  assertEquals('NaN', simplified[42][2]);
}

function testDeserializationSpecialFloatDoubleValues() {
  // NaN, Infinity and -Infinity values should be de-serialized from their
  // string representation.
  var simplified = {
    41: ['Infinity', '-Infinity', 'NaN'],
    42: ['Infinity', '-Infinity', 'NaN']
  };

  var serializer = new goog.proto2.ObjectSerializer();

  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);

  assertNotNull(message);

  var floatArray = message.repeatedFloatArray();
  assertEquals(Infinity, floatArray[0]);
  assertEquals(-Infinity, floatArray[1]);
  assertTrue(isNaN(floatArray[2]));

  var doubleArray = message.repeatedDoubleArray();
  assertEquals(Infinity, doubleArray[0]);
  assertEquals(-Infinity, doubleArray[1]);
  assertTrue(isNaN(doubleArray[2]));
}

function testDeserializationConversionProhibited() {
  // 64-bit types may have been serialized as numbers or strings.
  // But 32-bit types must be serialized as numbers.
  // Test deserialization fails on 32-bit numbers as strings.

  var simplified = {
    1: '1000'  // optionalInt32
  };
  var serializer = new goog.proto2.ObjectSerializer();

  assertThrows(
      'Should have an assertion failure in deserialization', function() {
        serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);
      });
}

function testDefaultValueNumbersOrStrings() {
  // 64-bit types may have been serialized as numbers or strings.
  // The default values should have the correct type.

  var serializer = new goog.proto2.ObjectSerializer();
  var message = serializer.deserialize(proto2.TestAllTypes.getDescriptor(), {});

  assertNotNull(message);

  // Default when using Number is a number, and precision is lost.
  var value = message.getOptionalInt64NumberOrDefault();
  assertTrue('Expecting a number', typeof value === 'number');
  assertEquals(1000000000000000000, value);
  assertEquals(1000000000000000001, value);
  assertEquals(1000000000000000002, value);
  assertEquals('1000000000000000000', String(value));  // Value is rounded!

  // When using a String, the value is preserved.
  assertEquals(
      '1000000000000000001', message.getOptionalInt64StringOrDefault());
}

function testBooleanAsNumberFalse() {
  // Some libraries, such as GWT, can serialize boolean values as 0/1

  var simplified = {13: 0};

  var serializer = new goog.proto2.ObjectSerializer();

  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);

  assertNotNull(message);

  assertFalse(message.getOptionalBool());
}

function testBooleanAsNumberTrue() {
  var simplified = {13: 1};

  var serializer = new goog.proto2.ObjectSerializer();

  var message =
      serializer.deserialize(proto2.TestAllTypes.getDescriptor(), simplified);

  assertNotNull(message);

  assertTrue(message.getOptionalBool());
}
