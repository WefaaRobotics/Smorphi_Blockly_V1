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

goog.provide('Blockly.Blocks.smorphi_initializers');

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');
goog.require('Blockly.Events');
Blockly.Blocks.procedures.HUE = 290;


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks['smorphi_function_initializer'] = {
  /**
   * Block for defining the Arduino setup() and loop() functions.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField("Smorphi-Setup");
    this.appendStatementInput('SETUP_FUNC');
    this.appendDummyInput()
        .appendField("Smorphi-Loop");
    this.appendStatementInput('LOOP_FUNC');
    this.setInputsInline(false);
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.ARD_FUN_RUN_TIP);
    this.setHelpUrl('https://arduino.cc/en/Reference/Loop');
    this.contextMenu = false;
  },
  /** @return {!boolean} True if the block instance is in the workspace. */
  getArduinoLoopsInstance: function() {
    return true;
  }
};
//single setup-looop
Blockly.Blocks['smorphi_single_initializer'] = {
  /**
   * Block for defining the single Smorphi setup() and loop() functions.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField("Smorphi_single-Setup");
    this.appendStatementInput('SINGLE_SETUP_FUNC')
        .setCheck(null);  // Allows any type of statements inside
    this.appendDummyInput()
        .appendField("Smorphi_single-Loop");
    this.appendStatementInput('SINGLE_LOOP_FUNC')
        .setCheck(null);  // Allows loop-related statements
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);  // Can connect to a block above
    this.setNextStatement(true, null);      // Can connect to a block below
    this.setColour(Blockly.Blocks.procedures.HUE);  // Assign block color
    this.setTooltip('Initializes single setup and loop for Smorphi.');
    this.setHelpUrl('https://arduino.cc/en/Reference/Setup');
    this.contextMenu = false;
  }
};




// Blockly.Blocks['smorphi_single_function_initializer'] = {
  
//   init: function() {
//     this.appendDummyInput()
//         .appendField("Smorphi_single-Setup");
//     this.appendStatementInput('SETUP_FUNC');
//     this.appendDummyInput()
//         .appendField("Smorphi_single-Loop");
//     this.appendStatementInput('LOOP_FUNC');
//     this.setInputsInline(false);
//     this.setColour(Blockly.Blocks.procedures.HUE);
//     this.setTooltip(Blockly.Msg.ARD_FUN_RUN_TIP);
//     this.setHelpUrl('https://arduino.cc/en/Reference/Loop');
//     this.contextMenu = false;
//   },
//   /** @return {!boolean} True if the block instance is in the workspace. */
//   getArduinoLoopsInstance: function() {
//     return true;
//   }
// };
////
 Blockly.Blocks['initialize_smorphi'] = {
    /**
   * Block for if/elseif/else condition.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(120);
    // nithul edit
    this.appendDummyInput()
        .appendField("Initialize Smorphi");
    // this.appendDummyInput()
    // .appendField(new Blockly.FieldDropdown([["Initialize-Smorphi","'smorphi'"],["Initialize-Smorphi_single","'smorphi_single"]]),"NAME");
    // //

    this.setNextStatement(true, "null");
    this.setTooltip('');
  }
};

//smorphi single intialization
Blockly.Blocks['initialize_smorphi_single'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Initialize Smorphi_single");
    this.setColour(120);
    this.setNextStatement(true, "null");
    this.setTooltip("smorphi_single");
    this.setHelpUrl("");
  }
};
// Blockly.Blocks['initialize_smorphi_single'] = {
//   /**
//  * Block for initialization of smorphi_single
//  * @this Blockly.Block
//  */
//   init: function() {
//     this.setHelpUrl('http://www.example.com/');
//     this.setColour(120);
//     this.appendDummyInput()
//         .appendField("Initialize Smorphi_single");
 
//     this.setNextStatement(true, "null");
//     this.setTooltip('');
//   }
// };

// Ultra sonic sensor
Blockly.Blocks['initialize_ultrasonic'] = {
  /**
 * Block for if/elseif/else condition.
 * @this Blockly.Block
 */
init: function() {
  this.setHelpUrl('http://www.example.com/');
  this.setColour(120);
  // nithul edit
  this.appendDummyInput()
      .appendField("Initialize Ultrasonic Sensor");
  // this.appendDummyInput()
  // .appendField(new Blockly.FieldDropdown([["Initialize-Smorphi","'smorphi'"],["Initialize-Smorphi_single","'smorphi_single"]]),"NAME");
  // //

  this.setNextStatement(true, "null");
  this.setTooltip('');
}
};

///

Blockly.Blocks['initialize_bluetooth'] = {
  /**
 * Block for if/elseif/else condition.
 * @this Blockly.Block
 */
init: function() {
  this.setHelpUrl('http://www.example.com/');
  this.setColour(120);
  this.appendDummyInput()
  .appendField(new Blockly.FieldDropdown([["Initialize bluetooth- Smorphi2", "'smorphi2'"], ["Initialize bluetooth- Smorphi", "'smorphi'"]]), "NAME");
     // .appendField("Initialize Bluetooth");
  this.setPreviousStatement(true, "null");
  this.setNextStatement(true, "null");
  this.setTooltip('');
}
};
Blockly.Blocks['initialize_pixycam'] = {
  /**
 * Block for if/elseif/else condition.
 * @this Blockly.Block
 */
init: function() {
  this.setHelpUrl('http://www.example.com/');
  this.setColour(120);
  this.appendDummyInput()
      .appendField("Initialize PixyCam");
  this.setPreviousStatement(true, "null");
  this.setNextStatement(true, "null");
  this.setTooltip('');
}
};
Blockly.Blocks['initialize_huskylens'] = {
//   /**
//  * Block for if/elseif/else condition.
//  * @this Blockly.Block
//  */
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(120);
    this.appendDummyInput()
        .appendField("Initialize Husky Lens");
    this.setPreviousStatement(true, "null");
    this.setNextStatement(true, "null");
    this.setTooltip('');
}
};







//husky lens initialization
// Blockly.Blocks['initialize_huskylens'] = {
//   /**
//  * Block for if/elseif/else condition.
//  * @this Blockly.Block
//  */
  
//   init: function(){
//     this.setColour(120);
//     this.appendDummyInput()
//         .appendField("Initialize Husky_Lens");
//     this.setPreviousStatement(true, "null");
//     this.setNextStatement(true, "null");
//     this.setTooltip('');

//   }

// };


Blockly.Blocks['initialize_humidity_sensor'] = {
  /**
 * Block for if/elseif/else condition.
 * @this Blockly.Block
 */
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(120);
    this.appendDummyInput()
        .appendField("Initialize Humidity_Sensor");
    this.setPreviousStatement(true, "null");
    this.setNextStatement(true, "null");
    this.setTooltip('');
}
};
Blockly.Blocks['initialize_temp_sensors'] = {
  /**
 * Block for if/elseif/else condition.
 * @this Blockly.Block
 */
init: function() {
  this.setHelpUrl('http://www.example.com/');
  this.setColour(120);
  this.appendDummyInput()
      .appendField("Initialize Temperature Sensor");
  this.setPreviousStatement(true, "null");
  this.setNextStatement(true, "null");
  this.setTooltip('');
}
};

Blockly.Blocks['initialize_sensors'] = {
  init: function() {
    this.appendStatementInput("Initialize_sensors")
        .setCheck("String")
        .appendField("Initialize_Sensors");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['sensor_name_'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField(new Blockly.FieldDropdown([["front_IR", "front_sensor_status"], ["rear_IR", "rear_sensor_status"], ["left_IR", "left_sensor_status"], ["right_IR", "right_sensor_status"]]), "Ir-Sensor");
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
// Blockly.Blocks['sensor_name'] = {
//   init: function() {
//     this.appendValueInput("Module_number")
//         .setCheck("String")
//         .appendField(new Blockly.FieldDropdown([["Left_IR module no:", "left_sensor_status"], ["Rear_IR module no:", "rear_sensor_status"], ["Right_IR module no:", "right_sensor_status"], ["Front_IR module no:", "front_sensor_status"]]), "Module no:");
//     this.appendValueInput("NAME")
//         .setCheck("String")
//         .appendField("                    status no:");
//     this.setPreviousStatement(true, "String");
//     this.setNextStatement(true, "String");
//     this.setColour(120);
//     this.setTooltip('');
//     this.setHelpUrl('http://www.example.com/');
//   }
// };
Blockly.Blocks['number_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("0"), "number");
    this.setOutput(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['new_ir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("sensor_name"), "sensor_name")
        .appendField(new Blockly.FieldTextInput("module_num"), "module_num")
        .appendField(new Blockly.FieldTextInput("status_num"), "status_num");
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['left_ir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Left_IR")
        .appendField(new Blockly.FieldTextInput("module_num"), "module_num")
        .appendField(new Blockly.FieldTextInput("status_num"), "status_num");
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['right_ir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Right_IR")
        .appendField(new Blockly.FieldTextInput("module_num"), "module_num")
        .appendField(new Blockly.FieldTextInput("status_num"), "status_num");
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['front_ir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Front_IR")
        .appendField(new Blockly.FieldTextInput("module_num"), "module_num")
        .appendField(new Blockly.FieldTextInput("status_num"), "status_num");
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['rear_ir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Rear_IR")
        .appendField(new Blockly.FieldTextInput("module_num"), "module_num")
        .appendField(new Blockly.FieldTextInput("status_num"), "status_num");
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['bottom_left_ir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Bottom_Left_IR")
        .appendField(new Blockly.FieldTextInput("module_num"), "module_num")
        .appendField(new Blockly.FieldTextInput("status_num"), "status_num");
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['bottom_right_ir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Bottom_Right_IR")
        .appendField(new Blockly.FieldTextInput("module_num"), "module_num")
        .appendField(new Blockly.FieldTextInput("status_num"), "status_num");
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['read_husky'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Read Husky")        
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['end_husky_loop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("end_husky_loop")        
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['end_ultrasonic_loop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("End Ultrasoinc Sensor Loop")        
    this.setInputsInline(false);
    this.setPreviousStatement(true, "String");
    this.setNextStatement(true, "String");
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};  
// Blockly.Blocks['LED_initialise'] = {
//   init: function() {
//     this.appendDummyInput()
//         .appendField("LED_initialise")        
//     this.setInputsInline(false);
//     this.setPreviousStatement(true, "String");
//     this.setNextStatement(true, "String");
//     this.setColour(210);
//     this.setTooltip('');
//     this.setHelpUrl('http://www.example.com/');
//   }
// };
// Blockly.Blocks['LED_initialise'] = {
//   init: function() {
//     this.appendDummyInput()
//         .appendField("Right_IR")
//         .appendField(new Blockly.FieldTextInput("pin_num"), "pin_num");
//     this.setInputsInline(false);
//     this.setPreviousStatement(true, "String");
//     this.setNextStatement(true, "String");
//     this.setColour(210);
//     this.setTooltip('');
//     this.setHelpUrl('http://www.example.com/');
//   }
// };
Blockly.Blocks['LED_initialise'] = {
  //   /**
  //  * Block for if/elseif/else condition.
  //  * @this Blockly.Block
  //  */
    init: function() {
      this.setHelpUrl('http://www.example.com/');
      this.setColour(120);
      this.appendDummyInput()
          .appendField("RGB initialise");
      this.setPreviousStatement(true, "null");
      this.setNextStatement(true, "null");
      this.setTooltip('');
  }
  };



