export default function nth(arr, n) {
  if (!(arr && arr.length)) {
    return;
  }
  const length = arr.length;
  n += n < 0 ? length : 0;

  return (n >= 0 && n < length) ? arr[n] : void 0;
}
