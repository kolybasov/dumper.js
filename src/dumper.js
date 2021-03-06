const kindOf = require('kind-of');
const {red, cyan, blue, black, green, magenta} = require('kleur');
const {decycle} = require('cycle');

/**
 * Generate structured information about one or more objects that
 * includes each item type and value.
 *
 * @author Zeeshan Ahmad <ziishaned@gmail.com>
 */
class Dumper {
  /**
   * @param {int} indentCount Number of spaces to indent the object with
   */
  constructor(indentCount = 4) {
    this.spaces = ' '.repeat(indentCount);
  }

  /**
   * Iterates over each property of the provided object and make the output.
   *
   * @param {*} toDump
   * @param {string|null} indent
   * @return {string}
   */
  generateDump(toDump, indent = '') {
    let dump = '';

    let startWith = '';
    let endWith = '';

    switch (kindOf(toDump)) {
      case 'array':
        startWith = `${black.bold('array')} (size=${toDump.length}) [\n`;
        endWith = `${indent}]`;
        break;
      case 'object':
        toDump = decycle(toDump);
        startWith = `${black.bold('object')} (size=${Object.keys(toDump).length}) {\n`;
        endWith = `${indent}}`;
        break;
      default:
        return this.prepareValueDump(indent, toDump);
    }

    // For each key of the object, keep
    // preparing the inspection output
    for (let itemKey in toDump) {
      if (!Object.prototype.hasOwnProperty.call(toDump, itemKey)) {
        continue;
      }

      const originalValue = toDump[itemKey];
      const originalParamType = kindOf(originalValue);
      const valueDump = this.prepareValueDump(indent, originalValue);

      dump += this.makeArrowString(originalParamType, indent, itemKey, valueDump);
    }

    return startWith + dump + endWith;
  }

  /**
   * Prepare the dump output for the given value
   *
   * @param indent
   * @param originalValue
   * @return {*|string}
   */
  prepareValueDump(indent, originalValue) {
    let displayType = '';
    let displayValue = '';

    const paramType = kindOf(originalValue);
    switch (paramType) {
      case 'array':
      case 'object':
        displayType = '';
        displayValue = this.generateDump(originalValue, `${indent}${this.spaces}`);
        break;
      case 'boolean':
        displayType = 'boolean';
        displayValue = originalValue ? magenta('true') : magenta('false');
        break;
      case 'string':
        displayType = 'string';
        displayValue = `${red(`"${originalValue}"`)} (length=${originalValue.length})`;
        break;
      case 'null':
        displayValue = `${blue('null')}`;
        break;
      case 'number':
        displayType = Number.isInteger(originalValue) ? 'int' : 'float';
        displayValue = green(originalValue);
        break;
      case 'function':
        displayType = '';
        displayValue = 'function () {}';
        break;
      case 'regexp':
        displayType = '';
        displayValue = `${blue(originalValue)}`;
        break;
      default:
        displayType = '';
        displayValue = originalValue;
        break;
    }

    return `${cyan(displayType)} ${displayValue}`;
  }

  /**
   * Make the arrow string.
   *
   * @param {string} paramType
   * @param {string} indent
   * @param {string|number} key
   * @param {*} valueDump
   * @return {string}
   */
  makeArrowString(paramType, indent, key, valueDump) {
    if (paramType === 'array') {
      if (typeof key === 'string') {
        return `${indent}${this.spaces}'${key}' => ${valueDump},\n`;
      }

      return `${indent}${this.spaces}[${key}] => ${valueDump},\n`;
    }

    if (Number.isInteger(parseInt(key))) {
      return `${indent}${this.spaces}[${key}] => ${valueDump},\n`;
    }

    return `${indent}${this.spaces}'${key}' => ${valueDump},\n`;
  }
}

module.exports = Dumper;
