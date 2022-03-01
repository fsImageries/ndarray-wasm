import { NdArray } from ".";

export function arange<T>(
  start: i32,
  stop: i32 = -1,
  step: i32 = 1
): NdArray<T> {
  if (!isInteger<T>() && !isFloat<T>())
    throw new Error("Only integers or floats are supported.");
  if (stop < 0) {
    stop = start;
    start = 0;
  }

  const result: T[] = [];
  let i = 0;
  while (start < stop) {
    // @ts-expect-error
    result[i++] = start as T;
    start += step;
  }
  return createArray(result);
}

export function shapeSize(shape: i32[]): i32 {
  let s = 1;
  for (let i = 0; i < shape.length; i++) {
    s *= shape[i];
  }
  return s;
}

export function iota(n: i32): i32[] {
  var result = new Array<i32>(n);
  for (var i = 0; i < n; ++i) {
    result[i] = i;
  }
  return result;
}

export function createArray<T>(arr: T[]): NdArray<T> {
  if (arr.length == 1 && isInteger<T>())
    // @ts-expect-error
    return new NdArray<T>(new StaticArray<T>(arr[0] as i32), [arr.length]);
  else {
    return new NdArray<T>(StaticArray.fromArray(arr), [arr.length]);
  }
}

export function initNativeArray(shape: i32[], i: i32): string {
  // if (!isInteger<T>() && !isFloat<T>()) throw new Error("Only integers or floats are accepted.")

  i = i || 0;
  const c = shape[i] | 0;
  if (c <= 0) {
    return `[]`;
  }
  let j: i32;
  if (i === shape.length - 1) {
    let result = new StaticArray<i32>(c);
    for (j = 0; j < c; ++j) {
      result[j] = 0;
    }
    return `\n[${result.join(",")}]`;
  } else {
    let result = new StaticArray<string>(c);
    for (j = 0; j < c; ++j) {
      result[j] = initNativeArray(shape, i + 1);
    }
    return `[${result.join(",")}]`;
  }
}

export function iterNd<T>(arr: NdArray<T>, fn: usize): void {
  // if (fn) const func = changetype<(val:T)=>void>(fn)

  const func = changetype<(val: T) => T>(fn);

  const shapeSum:i32 = shapeSize(arr.shape)

  for (let i = 0; i < shapeSum; i++) {
    // func(arr.geti(i));
    log<T>(arr.geti(i))
  }
}

export function iterNdxNd<T>(
  arr1: NdArray<T>,
  arr2: NdArray<T>,
  fn: usize
): void {
  arr1.shapeCheck(arr2);
  const func = changetype<(val: T, val2: T) => T>(fn);

  for (let i = 0; i < arr1.data.length; i++) {
    // log<T>())
    func(arr1.geti(i), arr2.geti(i));
  }
}

export function logArray<T>(arr: NdArray<T>): string {
  let out: string = "\n";

  out += `${arr.dim}-dimensional array.\n`;
  out += `Shape:\t${arr.shape}\n`;
  out += `Stride:\t${arr.stride}\n`;
  out += `Offset:\t${arr.offset}\n`;

  // out += arr.toString() + "\n"

  return out;
}
