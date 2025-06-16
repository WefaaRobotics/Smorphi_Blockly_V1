/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Generating Arduino code for the logic blocks.
 */
'use strict';

goog.provide('Blockly.Arduino.smorphi_initializers');

goog.require('Blockly.Arduino');

Blockly.Arduino['smorphi_function_initializer'] = function(block) {
  var smorphiName = 'my_robot';
  // TODO: Assemble JavaScript into code variable.
  Blockly.Arduino.addInclude('smorphi', '#include <smorphi.h>\n'+'Smorphi_single my_robot;');
  //Blockly.Arduino.addInclude('smorphi_', 'Smorphi ' + smorphiName + ';');
  //Blockly.Arduino.addDeclaration('smorphi_1', 'String last_action = "";');
  Blockly.Arduino.addSetup('smorphi_0', 'Serial.begin(115200);');
  Blockly.Arduino.addSetup('smorphi_1', 'my_robot.BeginSmorphi();');
  // Edited version of Blockly.Generator.prototype.statementToCode
  function statementToCodeNoTab(block, name) {
    var targetBlock = block.getInputTargetBlock(name);
    var code = Blockly.Arduino.blockToCode(targetBlock);
    if (!goog.isString(code)) {
      throw 'Expecting code from statement block "' + targetBlock.type + '".';
    }
    return code;
  }

  var setupBranch = Blockly.Arduino.statementToCode(block, 'SETUP_FUNC');
  //var setupCode = Blockly.Arduino.scrub_(block, setupBranch); No comment block
  if (setupBranch) {
    Blockly.Arduino.addSetup('userSetupCode', setupBranch, true);
  }

  var loopBranch = statementToCodeNoTab(block, 'LOOP_FUNC');
  //var loopcode = Blockly.Arduino.scrub_(block, loopBranch); No comment block
  return loopBranch;
};

//smorphi_single  setup-loop
Blockly.Arduino['smorphi_single_initializer'] = function(block) {
  var smorphiName = 'my_robot';
  // Add necessary includes and declarations for Smorphi
  var smorphiName = 'my_robot';
  // TODO: Assemble JavaScript into code variable.
  Blockly.Arduino.addInclude('smorphi', '#include <smorphi_single.h>\n'+'Smorphi_single my_robot;');
  //Blockly.Arduino.addDeclaration('smorphi_2', 'Smorphi_single ' + smorphiName + ';');
  //Blockly.Arduino.addDeclaration('smorphi_1', 'String last_action = "";');
  Blockly.Arduino.addSetup('smorphi_2', 'Serial.begin(115200);');
  Blockly.Arduino.addSetup('smorphi_3', 'my_robot.BeginSmorphi_single();');
  
  // Get the setup and loop user code
  var setupBranch = Blockly.Arduino.statementToCode(block, 'SINGLE_SETUP_FUNC');
  var loopBranch = Blockly.Arduino.statementToCode(block, 'SINGLE_LOOP_FUNC');
  
  // Add the user's setup code to Arduino setup
  if (setupBranch) {
    Blockly.Arduino.addSetup('userSingleSetupCode', setupBranch, true);
  }

  // Return the user's loop code
  return loopBranch;
};



// Blockly.Arduino['smorphi_single_function_initializer'] = function(block) {
//   var smorphiName = 'my_robot';
//   // TODO: Assemble JavaScript into code variable.
//   Blockly.Arduino.addInclude('smorphi', '#include <smorphi_single.h>');
//   Blockly.Arduino.addDeclaration('smorphi_2', 'Smorphi_single ' + smorphiName + ';');
//   //Blockly.Arduino.addDeclaration('smorphi_1', 'String last_action = "";');
//   Blockly.Arduino.addSetup('smorphi_2', 'Serial.begin(115200);');
//   Blockly.Arduino.addSetup('smorphi_3', 'my_robot.BeginSmorphi_single();');
//   // Edited version of Blockly.Generator.prototype.statementToCode
//   function statementToCodeNoTab(block, name) {
//     var targetBlock = block.getInputTargetBlock(name);
//     var code = Blockly.Arduino.blockToCode(targetBlock);
//     if (!goog.isString(code)) {
//       throw 'Expecting code from statement block "' + targetBlock.type + '".';
//     }
//     return code;
//   }

//   var setupBranch = Blockly.Arduino.statementToCode(block, 'SETUP_FUNC');
//   //var setupCode = Blockly.Arduino.scrub_(block, setupBranch); No comment block
//   if (setupBranch) {
//     Blockly.Arduino.addSetup('userSetupCode', setupBranch, true);
//   }

//   var loopBranch = statementToCodeNoTab(block, 'LOOP_FUNC');
//   //var loopcode = Blockly.Arduino.scrub_(block, loopBranch); No comment block
//   return loopBranch;
// };

//////


Blockly.Arduino['initialize_smorphi'] = function(block) {
  /**
 * Code generator to create if/if else/else statement.
 * Arduino code: loop { if (X)/else if ()/else { X } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
  var smorphiName = 'my_robot';
  // TODO: Assemble JavaScript into code variable.
  Blockly.Arduino.addInclude('smorphi', '#include <smorphi.h>\n'+'Smorphi my_robot;');
  //Blockly.Arduino.addDeclaration('smorphi_', 'Smorphi ' + smorphiName + ';');
  //Blockly.Arduino.addDeclaration('smorphi_1', 'String last_action = "";');
  Blockly.Arduino.addSetup('smorphi_', 'Serial.begin(115200);');
  Blockly.Arduino.addSetup('smorphi_1', 'my_robot.BeginSmorphi();');
  var code = '';
  return code;
};

//intialize smorphi_single        #######################################
Blockly.Arduino['initialize_smorphi_single'] = function(block) {
  /**
 * Code generator to create if/if else/else statement.
 * Arduino code: loop { if (X)/else if ()/else { X } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
  var smorphiName = 'my_robot';
  // TODO: Assemble JavaScript into code variable.
  Blockly.Arduino.addInclude('smorphi', '#include <smorphi_single.h>\n'+'Smorphi_single my_robot;');
  //Blockly.Arduino.addDeclaration('smorphi_2', 'Smorphi_single ' + smorphiName + ';');
  //Blockly.Arduino.addDeclaration('smorphi_1', 'String last_action = "";');
  Blockly.Arduino.addSetup('smorphi_2', 'Serial.begin(115200);');
  Blockly.Arduino.addSetup('smorphi_3', 'my_robot.BeginSmorphi_single();');
  var code = '';
  return code;
};

// ultrasonic sensor
Blockly.Arduino['initialize_ultrasonic'] = function(block) {
  /**
 * Code generator to create if/if else/else statement.
 * Arduino code: loop { if (X)/else if ()/else { X } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
  var smorphiName = 'my_robot';
  // TODO: Assemble JavaScript into code variable.
  Blockly.Arduino.addDeclaration('ultra_','\nlong duration, cm, inches;\n');
  //Blockly.Arduino.addDeclaration('smorphi_1', 'String last_action = "";');
  Blockly.Arduino.addSetup('ultra_0', 'pinMode(trigPin, OUTPUT);\npinMode(echoPin, INPUT);\n'); 
  var code = '\ndigitalWrite(trigPin, LOW);\ndelayMicroseconds(5);\ndigitalWrite(trigPin, HIGH);\ndelayMicroseconds(10);\ndigitalWrite(trigPin, LOW);\n'+
  'pinMode(echoPin, INPUT);\nduration = pulseIn(echoPin, HIGH);\ncm = (duration / 2) / 29.1;\ninches = (duration / 2) / 74;\nSerial.print(inches);\nSerial.print("in, ");'+
  'Serial.print(cm);\nSerial.print("cm");\nSerial.println();\n';
  return code;
};

////

Blockly.Arduino['initialize_bluetooth'] = function(block) {
  /**
 * Code generator to create if/if else/else statement.
 * Arduino code: loop { if (X)/else if ()/else { X } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
  var BtName = 'SerialBT';
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  Blockly.Arduino.addInclude('bluetooth', '#include "BluetoothSerial.h"');
  Blockly.Arduino.addInclude('esp_bt', '#include "esp_bt_main.h"');
  Blockly.Arduino.addInclude('esp_gap_bt', '#include "esp_gap_bt_api.h"');
  Blockly.Arduino.addInclude('esp_bt_device', '#include "esp_bt_device.h"');
  Blockly.Arduino.addInclude('if', '#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)');
  Blockly.Arduino.addInclude('error', '#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it');
  Blockly.Arduino.addInclude('endif', '#endif');
  Blockly.Arduino.addDeclaration('bt_', 'BluetoothSerial ' + BtName + ';');
  //Blockly.Arduino.addDeclaration('smorphi_1', 'String last_action = "";');
  Blockly.Arduino.addSetup('bt_', 'SerialBT.begin('+dropdown_name+');');
  Blockly.Arduino.addSetup('bt_1', 'Wire.begin(); ');
  var code = '';
  return code;
};

// Blockly.Arduino['initialize_huskylens'] = function(block) {
//   /**
//  * Code generator to create if/if else/else statement.
//  * Arduino code: loop { if (X)/else if ()/else { X } }
//  * @param {!Blockly.Block} block Block to generate the code from.
//  * @return {string} Completed code.
//  */
//   var pixyName = 'pixy';
//   // TODO: Assemble JavaScript into code variable.
//   Blockly.Arduino.addInclude('pixy', '#include <Pixy2ICSP_ESP32.h>');
//   Blockly.Arduino.addDeclaration('pixy_', 'Pixy2ICSP_ESP32 ' + pixyName + ';');
//   Blockly.Arduino.addDeclaration('smorphi_1', 'int color_signature;');
//   //Blockly.Arduino.addSetup('pixy_', 'Serial.begin(115200);');
//   Blockly.Arduino.addSetup('pixy_1', 'pixy.init();');
//   var code = 'pixy.ccc.getBlocks();\n'+ 'if (pixy.ccc.numBlocks){\n'+'for (int i=0; i<pixy.ccc.numBlocks; i++){\n'+
//       'pixy.ccc.blocks[i].print();\n'+'color_signature = pixy.ccc.blocks[i].m_signature;\n}\n}\n';
//   return code;
// };

Blockly.Arduino['initialize_pixycam'] = function(block) {
  /**
 * Code generator to create if/if else/else statement.
 * Arduino code: loop { if (X)/else if ()/else { X } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
  var pixyName = 'pixy';
  // TODO: Assemble JavaScript into code variable.
  Blockly.Arduino.addInclude('pixy', '#include <Pixy2ICSP_ESP32.h>');
  Blockly.Arduino.addDeclaration('pixy_', 'Pixy2ICSP_ESP32 ' + pixyName + ';');
  Blockly.Arduino.addDeclaration('smorphi_1', 'int color_signature;');
  //Blockly.Arduino.addSetup('pixy_', 'Serial.begin(115200);');
  Blockly.Arduino.addSetup('pixy_1', 'pixy.init();');
  var code = 'pixy.ccc.getBlocks();\n'+ 'if (pixy.ccc.numBlocks){\n'+'for (int i=0; i<pixy.ccc.numBlocks; i++){\n'+
      'pixy.ccc.blocks[i].print();\n'+'color_signature = pixy.ccc.blocks[i].m_signature;\n}\n}\n';
  return code;
};


//husky lens trial-2
// husky lens camera intialization
Blockly.Arduino['initialize_huskylens'] = function(block) {
  // TODO: Assemble Arduino into code variable.
  Blockly.Arduino.addInclude('husky','#include "HUSKYLENS.h"\n#include "SoftwareSerial.h"\nHUSKYLENS huskylens;\nSoftwareSerial myHuskySerial(16, 17);\n'+
    '\nvoid printResult(HUSKYLENSResult result){\n'+''+'if (result.command == COMMAND_RETURN_BLOCK){\nSerial.println(result.ID);\n}\n'+
    '\nelse if (result.command == COMMAND_RETURN_ARROW){\n'+'Serial.println("Wrong mode");\n'+'}\n'+'else{\n'+'Serial.println("Object unknown!");\n'+
    '}'+'\n}'+
    '\nint color_signature;\nint command_block;\n'
  );
  Blockly.Arduino.addSetup('husky_','myHuskySerial.begin(9600);\n\twhile (!huskylens.begin(myHuskySerial)){\n\t'+
    'Serial.println(F("Begin failed!"));\n\tSerial.println(F("1.Please recheck the \\"Protocol Type\\" in HUSKYLENS (General Settings>>Protocol Type>>Serial 9600)"));'+
    '\n\tSerial.println(F("2.Please recheck the connection."));\n\tdelay(100);\n}\n'
  );
  
  // var code = '\nif (!huskylens.request()) Serial.println(F("Fail to request data from HUSKYLENS, recheck the connection!"));\n'+
  //             'else if(!huskylens.isLearned()) Serial.println(F("Nothing learned, press learn button on HUSKYLENS to learn one!"));\n'+
  //             'else if(!huskylens.available()) Serial.println(F("No block or arrow appears on the screen!"));\nelse{\n';
  // return code;

  var code = '\nint x = 0;'+'\nif (huskylens.request()) {\n'+'if (huskylens.available())  {\n'+'HUSKYLENSResult result = huskylens.read();\n'+
              'printResult(result);\n' + 'if (result.command == COMMAND_RETURN_BLOCK) {\n'+'x=result.ID;\n'+'}\n'+'}\n'+'}else{\n'+'Serial.println("Error!");'+
              '}\n';
  return code;
};




Blockly.Arduino['initialize_humidity_sensor'] = function(block) {
  /**
 * Code generator to create if/if else/else statement.
 * Arduino code: loop { if (X)/else if ()/else { X } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
  var pixyName = 'pixy';
  // TODO: Assemble JavaScript into code variable.
  Blockly.Arduino.addInclude('hdt', ' #include <DHT.h>');
  Blockly.Arduino.addDeclaration('hdt_', '#define DHTPIN 16');
  Blockly.Arduino.addDeclaration('hdt_1', '#define DHTTYPE DHT11');
  Blockly.Arduino.addDeclaration('hdt_2', 'DHT dht(DHTPIN, DHTTYPE);');
  //Blockly.Arduino.addSetup('pixy_', 'Serial.begin(115200);');
  Blockly.Arduino.addSetup('hdt_', 'dht.begin();');
  var code = 'float humidity = dht.readHumidity();\n'+ 'float temperature = dht.readTemperature();\n';
  return code;
};

Blockly.Arduino['initialize_temp_sensors'] = function(block) {
  /**
 * Code generator to create if/if else/else statement.
 * Arduino code: loop { if (X)/else if ()/else { X } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
  //var pixyName = 'pixy';
  // TODO: Assemble JavaScript into code variable.
  //Blockly.Arduino.addInclude('pixy', '#include <OneWire.h>');
  Blockly.Arduino.addInclude('temp', '#include <DallasTemperature.h>');
  Blockly.Arduino.addDeclaration('temp_', '#define ONE_WIRE_BUS 16');
  Blockly.Arduino.addDeclaration('temp_1', 'OneWire oneWire(ONE_WIRE_BUS);');
  Blockly.Arduino.addDeclaration('temp_2', 'DallasTemperature tempsensors(&oneWire);');
  //Blockly.Arduino.addSetup('pixy_', 'Serial.begin(115200);');
  Blockly.Arduino.addSetup('temp_1', 'tempsensors.begin();');
  var code = 'tempsensors.requestTemperatures();\n';
  return code;
};


Blockly.Arduino['initialize_sensors'] = function(block) {
  var statements_initialize_sensors = Blockly.Arduino.statementToCode(block, 'Initialize_IR_sensors');
  // TODO: Assemble Arduino into code variable.
  Blockly.Arduino.addDecleration( 'left_ir','int'+' left_sensor_status;');
  Blockly.Arduino.addDeclaration( 'right_ir','int'+' right_sensor_status;');
  Blockly.Arduino.addDeclaration( 'front_ir','int'+' front_sensor_status;');
  Blockly.Arduino.addDeclaration( 'rear_ir','int'+' rear_sensor_status;');
  var code = statements_initialize_sensors;//Blockly.Arduino.valueToCode(block, 'Initialize_sensors', Blockly.Arduino.ORDER_ATOMIC);
  return code;
};
/**
 * Code generator to read an angle value from a servo pin (X).
 * Arduino code: #include <Servo.h>
 *               Servo myServoX;
 *               setup { myServoX.attach(X); }
 *               loop  { myServoX.read();    }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */
// Blockly.Arduino['sensor_name_'] = function(block) {
//   var dropdown_ir_sensor = block.getFieldValue('Ir-Sensor');
//   // TODO: Assemble Arduino into code variable.
//   Blockly.Arduino.addDeclaration( dropdown_ir_sensor,'int'+' '+ dropdown_ir_sensor +';');
//   code ='';
//   return code;
// };
// Blockly.Arduino['sensor_name'] = function(block) {
//   var dropdown_module_no_ = block.getFieldValue('Module no:');
//   var value_module_number = Blockly.Arduino.valueToCode(block, 'Module_number', Blockly.Arduino.ORDER_ATOMIC);
//   var value_name = Blockly.Arduino.valueToCode(block, 'NAME', Blockly.Arduino.ORDER_ATOMIC);
//   // TODO: Assemble Arduino into code variable.
//   Blockly.Arduino.addDeclaration( dropdown_module_no_,'int'+' '+ dropdown_module_no_ +';');
//   var code = 'int '+ dropdown_module_no_+ '= my_robot.module'+value_module_number+'_sensor_status('+value_name+');';
//   return code;
// };
Blockly.Arduino['number_input'] = function(block) {
  var text_number = block.getFieldValue('number');
  // TODO: Assemble Arduino into code variable.
  var code = text_number;
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
};
Blockly.Arduino['new_ir'] = function(block) {
  var text_sensor_name = block.getFieldValue('sensor_name');
  var text_module_num = block.getFieldValue('module_num');
  var text_status_num = block.getFieldValue('status_num');
  // TODO: Assemble Arduino into code variable.
  //Blockly.Arduino.addDeclaration( text_module_num,'int'+' left_sensor_status;');
  //var state = 'int left_ir';
  // Blockly.Arduino.addInclude('hdt0', 'int '+text_sensor_name+' = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n');
  Blockly.Arduino.addInclude('hdt0', 'int '+text_sensor_name+';\n');

  var code = text_sensor_name+' = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n';
  return code;
};
Blockly.Arduino['left_ir'] = function(block) {
  var text_module_num = block.getFieldValue('module_num');
  var text_status_num = block.getFieldValue('status_num');
  // Blockly.Arduino.addInclude('hdt1', 'int left_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+'); \n');
  Blockly.Arduino.addInclude('hdt1', 'int left_sensor_status; \n');
  
  // TODO: Assemble Arduino into code variable.
  //Blockly.Arduino.addDeclaration( text_module_num,'int'+' left_sensor_status;');
  //var state = 'int left_ir';
  var code = 'left_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n';
  return code;
};
Blockly.Arduino['right_ir'] = function(block) {
  var text_module_num = block.getFieldValue('module_num');
  var text_status_num = block.getFieldValue('status_num');
  // Blockly.Arduino.addInclude('hdt2', 'int right_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n');
  Blockly.Arduino.addInclude('hdt2', 'int right_sensor_status;\n');
  
  // TODO: Assemble Arduino into code variable.
  //Blockly.Arduino.addDeclaration( text_module_num,'int'+' right_sensor_status;');
  var code = 'right_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n';
  return code;
};
Blockly.Arduino['front_ir'] = function(block) {
  var text_module_num = block.getFieldValue('module_num');
  var text_status_num = block.getFieldValue('status_num');
  // Blockly.Arduino.addInclude('hdt3', 'int front_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n\n');
  Blockly.Arduino.addInclude('hdt3', 'int front_sensor_status;\n\n');
  
  // TODO: Assemble Arduino into code variable.
 // Blockly.Arduino.addDeclaration( text_module_num,'int'+' front_sensor_status;');
  var code = 'front_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n';
  return code;
};
Blockly.Arduino['rear_ir'] = function(block) {
  var text_module_num = block.getFieldValue('module_num');
  var text_status_num = block.getFieldValue('status_num');
  // Blockly.Arduino.addInclude('hdt4', 'int rear_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n');
  Blockly.Arduino.addInclude('hdt4', 'int rear_sensor_status ;\n');
  
  // TODO: Assemble Arduino into code variable.
  //Blockly.Arduino.addDeclaration( text_module_num,'int'+' rear_sensor_status;');
  var code = 'rear_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n';
  return code;
};
Blockly.Arduino['bottom_left_ir'] = function(block) {
  var text_module_num = block.getFieldValue('module_num');
  var text_status_num = block.getFieldValue('status_num');
  // Blockly.Arduino.addInclude('hdt5', 'int bottom_left_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n');
  Blockly.Arduino.addInclude('hdt5', 'int bottom_left_sensor_status;\n');
  
  // TODO: Assemble Arduino into code variable.
  //Blockly.Arduino.addDeclaration( text_module_num,'int'+' rear_sensor_status;');
  var code = 'bottom_left_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n';
  return code;
};
Blockly.Arduino['bottom_right_ir'] = function(block) {
  var text_module_num = block.getFieldValue('module_num');
  var text_status_num = block.getFieldValue('status_num');
  // Blockly.Arduino.addInclude('hdt6', 'int bottom_right_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n');
  Blockly.Arduino.addInclude('hdt6', 'int bottom_right_sensor_status;\n');
  
  // TODO: Assemble Arduino into code variable.
  //Blockly.Arduino.addDeclaration( text_module_num,'int'+' rear_sensor_status;');
  var code = 'bottom_right_sensor_status = my_robot.module'+text_module_num+'_sensor_status('+text_status_num+');\n';
  return code;
};
Blockly.Arduino['read_husky'] = function(block) {
  var code = '\nHUSKYLENSResult result = huskylens.read();\n';
  return code;
};
Blockly.Arduino['end_husky_loop'] = function(block) {
  var code = '\n}\n';
  return code;
};
Blockly.Arduino['end_ultrasonic_loop'] = function(block) {
  var code = '\n}\n';
  return code;
};
Blockly.Arduino['LED_initialise'] = function(block) {
  Blockly.Arduino.addSetup('xyz','pinMode(25, OUTPUT);\npinMode(26, OUTPUT);\npinMode(27, OUTPUT);');
  var code = '';
  return code;
};


