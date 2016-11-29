/**
 * isDefined
 *
 * if it's anything other than `undefined` we're good
 *
 * @param {Any} val
 * @returns {Boolean}
 */
export function isDefined(val) {
  return val !== void 0; // eslint-disable-line no-void
}

/**
 * isNil
 *
 * Not strictly null: could also be undefined, but lazy
 * type-checking can result in unexpected consequences.
 *
 * It's a pretty common occurence that by 'null' we may
 * also mean 'undefined' - 'nil' is in-between without
 * being totally confusing or ambiguous.
 *
 * @param {Any} val
 * @returns {Boolean}
 */
export function isNil(val) {
  return !isDefined(val) || val === null;
}
