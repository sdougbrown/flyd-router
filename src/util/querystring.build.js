import reduce from 'lodash/reduce';
import isObject from 'lodash/isObject';

/**
 * build
 *
 * Accepts an object of data parameters and returns
 * a joined query string.
 *
 * @param {Object} data
 * @returns {string}
 */
export default function build(data) {
  if (!isObject(data)) {
    return '';
  }

  return reduce(data, destructure, []).join('&');
}

function destructure(args, value, key) {
  // arrays are ok with this too
  if (isObject(value)) {
    Object.keys(value).forEach((k) => {
      destructure(args, value[k], `${key}[${k}]`);
    });
  } else {
    args.push(`${encodeURIComponent(key)}${encodeVal(value)}`);
  }

  return args;
}

function encodeVal(value) {
  return (value) ? `=${encodeURIComponent(value)}` : '';
}

