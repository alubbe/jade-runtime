'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = jade_merge;
function jade_merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = jade_merge(attrs, a[i]);
    }
    return attrs;
  }

  for (var key in b) {
    if (key === 'class') {
      var ac = a[key] || [];
      a[key] = (Array.isArray(ac) ? ac : [ac]).concat(b[key] || []);
    } else if (key === 'style') {
      a[key] = jade_style(a[key]);
      b[key] = jade_style(b[key]);
      a[key] = a[key] + (a[key] && b[key] && ';') + b[key];
    } else {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Process array, object, or string as a string of classes delimited by a space.
 *
 * If `val` is an array, all members of it and its subarrays are counted as
 * classes. If `escaping` is an array, then whether or not the item in `val` is
 * escaped depends on the corresponding item in `escaping`. If `escaping` is
 * not an array, no escaping is done.
 *
 * If `val` is an object, all the keys whose value is truthy are counted as
 * classes. No escaping is done.
 *
 * If `val` is a string, it is counted as a class. No escaping is done.
 *
 * @param {(Array.<string>|Object.<string, boolean>|string)} val
 * @param {?Array.<string>} escaping
 * @return {String}
 */
exports.classes = jade_classes;
function jade_classes_array(val, escaping) {
  var classString = '', className, padding = '', escapeEnabled = Array.isArray(escaping);
  for (var i = 0; i < val.length; i++) {
    className = jade_classes(val[i]);
    if (!className) continue;
    escapeEnabled && escaping[i] && (className = jade_escape(className));
    classString = classString + padding + className;
    padding = ' ';
  }
  return classString;
}
function jade_classes_object(val) {
  var classString = '', padding = '';
  for (var key in val) {
    if (key && val[key] && val.hasOwnProperty(key)) {
      classString = classString + padding + key;
      padding = ' ';
    }
  }
  return classString;
}
function jade_classes(val, escaping) {
  if (Array.isArray(val)) {
    return jade_classes_array(val, escaping);
  } else if (val && typeof val === 'object') {
    return jade_classes_object(val);
  } else {
    return val || '';
  }
}

/**
 * Convert object or string to a string of CSS styles delimited by a semicolon.
 *
 * @param {(Object.<string, string>|string)} val
 * @return {String}
 */

exports.style = jade_style;
function jade_style(val) {
  if (!val) return '';
  if (typeof val === 'object') {
    var out = '', delim = '';
    for (var style in val) {
      /* istanbul ignore else */
      if (val.hasOwnProperty(style)) {
        out = out + delim + style + ':' + val[style];
        delim = ';';
      }
    }
    return out;
  } else {
    val = '' + val;
    if (val[val.length - 1] === ';') return val.slice(0, -1);
    return val;
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = jade_attr;
function jade_attr(key, val, escaped, terse) {
  if ((key === 'class' || key === 'style') && !val) return '';
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  }
  if (val && typeof val.toISOString === 'function') {
    val = val.toISOString();
  } else if (typeof val !== 'string') {
    val = JSON.stringify(val);
    if (!escaped && val.indexOf('"') !== -1) {
      return ' ' + key + '=\'' + val.replace(/'/g, '&apos;') + '\'';
    }
  }
  if (escaped) {
    return ' ' + key + '="' + jade_escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} terse whether to use HTML5 terse boolean attributes
 * @return {String}
 */
exports.attrs = jade_attrs;
function jade_attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i]
      , val = obj[key];

    if ('class' == key) {
      val = jade_classes(val);
    }
    if ('style' === key) {
      val = jade_style(val);
    }
    buf.push(jade_attr(key, val, false, terse));
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var jade_encode_html_rules = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};
var jade_match_html = /[&<>"]/g;
/* istanbul ignore next */
function jade_encode_char(c) {
  return jade_encode_html_rules[c] || c;
}
exports.escape = jade_escape;
function jade_escape(_html){
  var html = String(_html);
  var result = '';
  var i, lastIndex;
  for (i = 0, lastIndex = 0; i < html.length; i++) {
    var c = html[i];
    if (c === '&' || c === '<' || c === '>' || c === '"') {
      if (lastIndex !== i) result += html.substring(lastIndex, i);
      result += jade_encode_html_rules[c];
      lastIndex = i + 1;
    }
  }
  if (lastIndex !== i) result += html.substring(lastIndex, i);

  if (html === result) return _html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @param {String} str original source
 * @api private
 */

exports.rethrow = jade_rethrow;
function jade_rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    jade_rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};
