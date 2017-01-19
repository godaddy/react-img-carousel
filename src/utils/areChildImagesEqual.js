function areChildImagesEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    const src1 = arr1[i].props.src;
    const src2 = arr2[i].props.src;

    if (src1 !== src2) {
      return false;
    }
  }
  return true;
}

export default areChildImagesEqual;
