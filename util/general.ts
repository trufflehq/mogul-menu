// this function is only safe for generating
// small numbers of ids; don't trust this to
// be globally unique
export const uniqueId = () => Math.random().toString(16).slice(2);

export function pad(num: number, size = 2) {
  let _num = num.toString();
  while (_num.length < size) _num = `0${num}`;
  return _num;
}
