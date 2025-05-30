#!/usr/bin/python

# Generate .js files defining Blockly core and language messages.
#
# Copyright 2013 Google Inc.
# https://developers.google.com/blockly/
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import argparse
import codecs
import os
import re
import sys
from common import read_json_file


_NEWLINE_PATTERN = re.compile('[\n\r]')


def string_is_ascii(s):
  try:
    s.decode('ascii')
    return True
  except UnicodeEncodeError:
    return False
  

def main():
  """Generate .js files defining Blockly core and language messages."""

  # Process command-line arguments.
  parser = argparse.ArgumentParser(description='Convert JSON files to JS.')
  parser.add_argument('--source_lang', default='en',
                      help='ISO 639-1 source language code')
  parser.add_argument('--source_lang_file',
                      default=os.path.join('json', 'en.json'),
                      help='Path to .json file for source language')
  parser.add_argument('--source_synonym_file',
                      default=os.path.join('json', 'synonyms.json'),
                      help='Path to .json file with synonym definitions')
  parser.add_argument('--output_dir', default='js/',
                      help='relative directory for output files')
  parser.add_argument('--key_file', default='keys.json',
                      help='relative path to input keys file')
  parser.add_argument('--quiet', action='store_true', default=False,
                      help='do not write anything to standard output')
  parser.add_argument('--ardublockly', action='store_true', default=False,
                      help='Attach Ardublockly strings to lang js files')
  parser.add_argument('files', nargs='+', help='input files')
  args = parser.parse_args()
  if not args.output_dir.endswith(os.path.sep):
    args.output_dir += os.path.sep

  # Read in source language .json file, which provides any values missing
  # in target languages' .json files.
  source_defs = read_json_file(os.path.join(os.curdir, args.source_lang_file))
  # Make sure the source file doesn't contain a newline or carriage return.
  for key, value in source_defs.items():
    if _NEWLINE_PATTERN.search(value):
      print('ERROR: definition of {0} in {1} contained a newline character.'.
            format(key, args.source_lang_file))
      sys.exit(1)
  sorted_keys = source_defs.keys()
  sorted_keys.sort()

  # Read in synonyms file, which must be output in every language.
  synonym_defs = read_json_file(os.path.join(
      os.curdir, args.source_synonym_file))
  synonym_text = '\n'.join(['Blockly.Msg.{0} = Blockly.Msg.{1};'.format(
      key, synonym_defs[key]) for key in synonym_defs])

  # Create each output file.
  for arg_file in args.files:
    (dir_, filename) = os.path.split(arg_file)
    target_lang = filename[:filename.index('.')]
    if target_lang not in ('qqq', 'keys', 'synonyms'):
      if args.ardublockly:
        # For Ardublockly pass search for {lang}_ardublockly.json target file
        target_defs = {}
        ardu_json = os.path.join(dir_, target_lang + '_ardublockly.json')
        if os.path.isfile(ardu_json):
          target_defs = read_json_file(os.path.join(os.curdir, ardu_json))
          print(u'Processed Ardublockly translation: {0}'.format(ardu_json))
      else:
        target_defs = read_json_file(os.path.join(os.curdir, arg_file))

      # Verify that keys are 'ascii'
      bad_keys = [key for key in target_defs if not string_is_ascii(key)]
      if bad_keys:
        print(u'These keys in {0} contain non ascii characters: {1}'.format(
            filename, ', '.join(bad_keys)))

      # If there's a '\n' or '\r', remove it and print a warning.
      for key, value in target_defs.items():
        if _NEWLINE_PATTERN.search(value):
          print(u'WARNING: definition of {0} in {1} contained '
                'a newline character.'.
                format(key, arg_file))
          target_defs[key] = _NEWLINE_PATTERN.sub(' ', value)

      # Prepare differences from parsing lang.json and lang_ardublockly.json
      if args.ardublockly:
        file_write_mode = 'a'
        start_str = '\n\n// Ardublockly strings\n'
      else:
        file_write_mode = 'w'
        start_str = ("// This file was automatically generated.  "
                     "Do not modify.\n\n"
                      "'use strict';\n\n"
                      "goog.provide('Blockly.Msg.{0}');\n\n"
                      "goog.require('Blockly.Msg');\n\n").format(
                          target_lang.replace('-', '.'))

      # Output file.
      outname = os.path.join(os.curdir, args.output_dir, target_lang + '.js')
      with codecs.open(outname, file_write_mode, 'utf-8') as outfile:
        outfile.write(start_str)
        # For each key in the source language file, output the target value
        # if present; otherwise, output the source language value with a
        # warning comment.
        for key in sorted_keys:
          if key in target_defs:
            value = target_defs[key]
            comment = ''
            del target_defs[key]
          else:
            value = source_defs[key]
            comment = '  // untranslated'
          value = value.replace('"', '\\"')
          outfile.write(u'Blockly.Msg.{0} = "{1}";{2}\n'.format(
              key, value, comment))

        # Announce any keys defined only for target language.
        if target_defs:
          extra_keys = [key for key in target_defs if key not in synonym_defs]
          synonym_keys = [key for key in target_defs if key in synonym_defs]
          if not args.quiet:
            if extra_keys:
              print(u'These extra keys appeared in {0}: {1}'.format(
                  filename, ', '.join(extra_keys)))
            if synonym_keys:
              print(u'These synonym keys appeared in {0}: {1}'.format(
                  filename, ', '.join(synonym_keys)))

        outfile.write(synonym_text)

      if not args.quiet:
        print('Created {0}.'.format(outname))


if __name__ == '__main__':
  main()
