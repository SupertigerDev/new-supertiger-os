/**
 * Splits the path into parts and removes the last part to obtain the directory name.
 *
 * @param {string} path - The path to be processed.
 * @return {string} The directory name.
 */
export const dirname = (path) => {
  const parts = path.split("/");
  parts.pop();
  if (parts[0] === "") return "/";
  return parts.join("/");
}

export const basename = (path) => {
  if (path === "/") {
    return "/";
  }
  const parts = path.split("/");
  return parts[parts.length - 1];
}

export const join = (...paths) => {
  return paths.join("/")
}

export const stripTrailingSlash = (str) => {
  return str.endsWith('/') ?
      str.slice(0, -1) :
      str;
};

export default {
  basename,
  dirname,
  join,
  stripTrailingSlash
}