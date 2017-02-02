function getMax(arr) {
  let max = 0;
  arr.forEach(d => {
    if (d[1] > max) max = d[1];
  });
  return max;
}

export { getMax }
