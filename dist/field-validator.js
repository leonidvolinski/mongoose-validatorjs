'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _defaultErrors = require('./default-errors');

var _defaultErrors2 = _interopRequireDefault(_defaultErrors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FieldValidator {

	/**
  * @param schema
  * @param field
  */
	constructor(schema, field) {
		this._schema = schema;
		this._field = field;
	}

	/**
  * Get mongoose schema for field
  * @returns {Schema}
  */
	getSchema() {
		return this._schema;
	}

	/**
  * Get field name
  * @returns String
  */
	getField() {
		return this._field;
	}

	/**
  * Create mongoose path for field
  * @returns {SchemaString}
  */
	createPath() {
		return this.getSchema().path(this.getField());
	}

	/**
  * Add a validator by name with argument and error message.
  * A validator can be a built-in / validator.js validator.
  * @param name
  * @param arg
  * @param message
  * @returns {*}
  */
	addValidator(name, arg, message) {
		if (name in this) {
			return this[name](arg, message);
		}
		if (name in _validator2.default) {
			return this.useValidatorJS(name, arg, message);
		}
		throw new Error('Validator `' + name + '` does not exist');
	}

	/**
  * Add a validator.js's validator
  * @param name
  * @param args
  * @param message
  */
	useValidatorJS(name, args, message) {
		this.buildValidator({
			validator: function (value) {
				if (isEmpty(value)) {
					return true;
				}
				return _validator2.default[name](value, args);
			},
			message: message || _defaultErrors2.default[name]
		}, args);
	}

	/**
  * Set field as required
  * @param args
  * @param message
  */
	required(args, message) {
		this.buildValidator({
			validator: function (value) {
				return !isEmpty(value);
			},
			message: message || this.getField() + ' is required'
		});
	}

	/**
  * Add a custom validator.
  * @param fn
  * @param message
  */
	custom(fn, message) {
		this.buildValidator({
			validator: fn,
			message: message || this.getField() + ' is invalid'
		});
	}

	/**
  * Shorthand for creating any kind of validator
  * @param obj
  * @param args
  */
	buildValidator(obj, args) {
		this.createPath().validate({
			isAsync: false,
			validator: obj.validator,
			message: interpolateMessage(obj.message, args)
		});
	}

}

exports.default = FieldValidator; /**
                                   * Interploate error message with arguments
                                   * @param message
                                   * @param args
                                   * @returns {string}
                                   */

function interpolateMessage(message, args) {
	if (args === null || typeof args === 'undefined') {
		args = '';
	}
	if (typeof args === 'string') {
		args = [args];
	} else if (typeof args === 'object') {
		args = Object.values(args);
	}
	return message.replace(/{ARGS\[(\d+)\]}/g, (replace, argIndex) => {
		let val = args[argIndex];
		return typeof val !== 'undefined' ? val : '';
	});
}

/**
 * Check if a value is empty: zero-length string, null or undefined
 * @param value
 * @returns {boolean}
 */
function isEmpty(value) {
	return value === '' || value === null || typeof value === 'undefined';
}