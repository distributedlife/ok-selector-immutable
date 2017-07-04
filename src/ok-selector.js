'use strict';

const BASE = 10;
const DOT = '.';
const ID = ':';
const ALL = '*';
const AllChildren = '*.';

const splitHistory = {};

const isInString = (string, toFind) => string.indexOf(toFind) !== -1;

function splitString (path) {
  if (splitHistory[path] === undefined) {
    splitHistory[path] = path.split(DOT);
  }

  return splitHistory[path];
}

function getFromImmutable (node, path) {
  return node !== undefined ? node.getIn(splitString(path)) : node;
}

function findImmutable (node, path, id) {
  const array = getFromImmutable(node, path);
  if (!array) {
    return undefined;
  }
  return array.find((x) => x.get('id') === id);
}

function getArrayById (node, key, findNode, read) {
  const path = key.split(ID)[0];
  const suffix = key.split(ID).slice(1).join(ID);

  if (isInString(suffix, DOT)) {
    const id = parseInt(suffix.split(DOT)[0], BASE);
    const subPath = suffix.replace(/^[0-9]+\./, '');

    const child = findNode(node, path, id);
    if (!child) {
      console.warn(`The path reference by ${key} could not be found.`);
      return undefined;
    }
    return read(child, subPath);
  }

  const id = parseInt(suffix, BASE);
  return findNode(node, path, id);
}

let read;
function mapImmutableChildren (node, path, suffix) {
  const obj = getFromImmutable(node, path);
  if (!obj) {
    return undefined;
  }
  return obj.map((child) => read(child, suffix));
}

function getChildren (node, key, mapChildren) {
  const path = key.split(AllChildren)[0];
  const suffix = key.split(AllChildren)[1];

  return mapChildren(node, path, suffix);
}

read = (node, key) => {
  if (isInString(key, ID)) {
    return getArrayById(node, key, findImmutable, read);
  } else if (isInString(key, ALL)) {
    return getChildren(node, key, mapImmutableChildren);
  }

  return getFromImmutable(node, key);
};

export const has = (node, key) => read(node, key) !== undefined;
export const unwrap = (node, key) => read(node, key).toJS();

export default read;
