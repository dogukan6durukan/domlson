export const RULES = {
  definition: /^([a-z]\w*)\s*:\s*([a-z0-9]+|"[^"]*"|\[\s*(.*)\s*\])$/,
  fileSource: /[a-zA-z0-9]+.dms/,
  array: /^\[\s*(.*)\s*\]$/,
  comment: /^#\s(.+)+?$/,
  reference: /^@(\w+)/,
};
