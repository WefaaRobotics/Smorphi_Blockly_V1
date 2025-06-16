/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Generating Arduino code for the logic blocks.
 */
'use strict';

goog.provide('Blockly.Arduino.smorphi_variables');

goog.require('Blockly.Arduino');

Blockly.Arduino['serialbt_available'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'SerialBT.available()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['serialbt_read'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'SerialBT.read()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['temp_sensor_status'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'tempsensors.getTempCByIndex(0)';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['right_sensor_status'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'right_sensor_status';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['left_sensor_status'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'left_sensor_status';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['front_sensor_status'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'front_sensor_status';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['rear_sensor_status'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'rear_sensor_status';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['shape_status'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'my_robot.sm_getShape()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['color_status'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'color_signature';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['huskylens_available'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'huskylens.available()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
/// 
Blockly.Arduino['ultrasonic_distance'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'cm';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};


// Blockly.Arduino['robot_get_shape'] = function(block) {
//   var dropdown_name = block.getFieldValue('NAME');
//   //var value_name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC);
//   // TODO: Assemble Arduino into code variable.
//   var code = 'my_robot.sm_getShape() ';
//   return [code,Blockly.Arduino.ORDER_NONE] ;
// };
// Blockly.Arduino['robot_get_shape'] = function(block) {
//   var dropdown_name = block.getFieldValue('NAME');
//   //var value_name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC);
//   // TODO: Assemble Arduino into code variable.
//   var code = 'my_robot.'+dropdown_name;
//   return [code,Blockly.Arduino.ORDER_NONE] ;
// };
// Blockly.Arduino['robot_get_shape_for_husky'] = function(block) {
//   var dropdown_name = block.getFieldValue('NAME');
//   //var value_name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC);
//   // TODO: Assemble Arduino into code variable.
//   var code = dropdown_name;
//   return [code,Blockly.Arduino.ORDER_NONE] ;
// };
Blockly.Arduino['available_shapes'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  //var value_name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC);
  // TODO: Assemble Arduino into code variable.
  var code = dropdown_name;
  return [code,Blockly.Arduino.ORDER_NONE] ;
};


Blockly.Arduino['color_ID'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'result.ID';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['command_return_block'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'result.command == COMMAND_RETURN_BLOCK';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};
Blockly.Arduino['command_return_arrow'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  var code = 'result.command == COMMAND_RETURN_ARROW';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_NONE];
};


