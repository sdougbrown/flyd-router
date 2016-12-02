import { isNil } from './is';

/**
 * parse
 *
 * Accepts a query string and parses it out into
 * real values.
 *
 * @param {string} query
 * @returns {Object}
 */
export default function parse(query) {
  if (!query) {
    return {};
  }

  const data = {};
  const counters = {};

  query.slice((query.charAt(0) === '?') ? 1 : 0)
    .split('&')
    .forEach(parseEntry);

  function parseEntry(raw) {
    const entry = raw.split('=');
    const key = decodeURIComponent(entry[0]);
    const value = (entry.length > 1) ? parseValue(entry[1]) : '';

    walkLevels({
      key,
      data,
      value,
      counters,
      parentKey: key,
      levels: key.split(/\]\[?|\[/)
    });
  }

  return data;
}

function parseValue(raw) {
  const value = decodeURIComponent(raw);
  const number = Number(value);

  if (value !== '' && !isNaN(number) || value === 'NaN') {
    return number;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (value.charAt(0) !== '/') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return value;
}

function walkLevels({ data, value, counters, parentKey, levels }) {
  let cursor = data;

  if (parentKey.includes('[')) {
    levels.pop();
  }

  levels.forEach((level, i) => {
    const nextLevel = levels[parentKey + 1];
    const isNumber = nextLevel === '' || !isNaN(parseInt(nextLevel, 10));
    const isValue = i === levels.length - 1;

    walkLevel({ i, value, cursor, counters, level, isNumber, isValue });

    cursor = cursor[level];
  });
}

function walkLevel({ i, value, cursor, counters, level, isNumber, isValue }) {
  if (level === '') {
    const key = level.slice(0, i).join();
    if (isNil(counters[key])) {
      counters[key] = 0;
    }
    level = counters[key] + 1;
  }
  if (isNil(cursor[level])) {
    cursor[level] = (isValue) ? value : (isNumber) ? [] : {};
  }
}
