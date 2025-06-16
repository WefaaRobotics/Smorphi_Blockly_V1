/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Logic blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';
goog.provide('Blockly.Blocks.smorphi_variables');
goog.require('Blockly.Blocks');
goog.require('Blockly.Types');


/**
 * Common HSV hue for all blocks in this category.
 */
 Blockly.Blocks['serialbt_available'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("BluetoothSerial.available");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['serialbt_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("BluetoothSerial.read");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['temp_sensor_status'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Temp_Sensor_State");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
 Blockly.Blocks['right_sensor_status'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Right_IR_State");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['left_sensor_status'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Left_IR_State");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['front_sensor_status'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Front_IR_State");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['rear_sensor_status'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Rear_IR_State");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};Blockly.Blocks['shape_status'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Shape_State");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['color_status'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Color_State");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['huskylens_available'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("huskylens_available");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
/// ultrasonic distance cm
Blockly.Blocks['ultrasonic_distance'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Ultrasonic Sensor Distance");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


// Blockly.Blocks['robot_get_shape'] = {
//   init: function() {
//     this.appendDummyInput()
//         .appendField("get_shape_of_robot");
//     this.setOutput(true, null);
//     this.setColour(210);
//     this.setTooltip('');
//     this.setHelpUrl('http://www.example.com/');
//   }
  
// };


// Blockly.Blocks['robot_get_shape'] = {
//   init: function() {
//     this.appendValueInput("NAME")
//         .setCheck("Number")
//         .appendField(new Blockly.FieldDropdown([["get I_shape", "sm.getShape() != 'i'"], ["get O_shape", "sm.getShape() != 'o'"], ["get L_shape", "sm.getShape() != 'l'"], ["get J_shape", "sm.getShape() != 'j'"], ["get T_shape", "sm.getShape() != 't'"], ["get S_shape", "sm.getShape() != 's'"], ["get Z_shape", "sm.getShape() != 'z'"]]), "NAME");
//     this.setOutput(true, null);
//     this.setColour(210);
//     this.setTooltip('');
//     this.setHelpUrl('http://www.example.com/');
//   }
// };
// Blockly.Blocks['robot_get_shape_for_husky'] = {
//   init: function() {
//     this.appendValueInput("NAME")
//         .setCheck("Number")
//         .appendField(new Blockly.FieldDropdown([["husky_lens get I_shape", "(result.command == COMMAND_RETURN_BLOCK) && (my_robot.sm_getShape() != 'i')"], ["husky_lens get O_shape", "(result.command == COMMAND_RETURN_BLOCK) && (my_robot.sm_getShape() != 'o')"], ["husky_lens get L_shape", "(result.command == COMMAND_RETURN_BLOCK) && (my_robot.sm_getShape() != 'l')"], ["husky_lens get J_shape", "(result.command == COMMAND_RETURN_BLOCK) && (my_robot.sm_getShape() != 'j')"], ["husky_lens get T_shape", "(result.command == COMMAND_RETURN_BLOCK) && (my_robot.sm_getShape() != 't')"], ["husky_lens get S_shape", "(result.command == COMMAND_RETURN_BLOCK) && (my_robot.sm_getShape() != 's')"], ["husky_lens get Z_shape", "(result.command == COMMAND_RETURN_BLOCK) && (my_robot.sm_getShape() != 'z')"]]), "NAME");
//     this.setOutput(true, null);
//     this.setColour(210);
//     this.setTooltip('');
//     this.setHelpUrl('http://www.example.com/');
//   }
// };
Blockly.Blocks['available_shapes'] = {
  init: function() {
    this.appendValueInput("NAME")
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([["I_shape", "'i'"], ["O_shape", "'o'"], ["L_shape", "'l'"], ["J_shape", "'j'"], ["T_shape", "'t'"], ["S_shape", "'s'"], ["Z_shape", "'z'"]]), "NAME");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['color_ID'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Color ID");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['command_return_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Husky-COMMAND RETURN BLOCK");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['command_return_arrow'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Husky-COMMAND RETURN ARROW");
    this.setOutput(true, null);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


