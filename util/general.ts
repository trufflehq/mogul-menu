// this function is only safe for generating
// small numbers of ids; don't trust this to
// be globally unique
export const uniqueId = () => Math.random().toString(16).slice(2);
