import { shapeSize, iota } from "./utils";

export class NdArray<T> {
  public data: StaticArray<T>;
  public shape: i32[];
  public stride: i32[];
  public offset: i32;
  public dim: i32;

  private _indicesCache: StaticArray<i32[]>;

  constructor(
    data: StaticArray<T>,
    shape: i32[] | null = null,
    stride: i32[] | null = null,
    offset: i32 = 0,
    indexCache: StaticArray<i32[]> | null = null
  ) {
    if (!isInteger<T>() && !isFloat<T>())
      throw new Error("Type must be of integer or float.");

    this.shape = shape == null ? [data.length] : shape;
    const d = this.shape.length;

    if (stride == null) {
      this.stride = new Array(d);
      for (let i = d - 1, sz = 1; i >= 0; i--) {
        this.stride[i] = sz;
        sz *= this.shape[i];
      }
    } else {
      this.stride = stride;
    }

    this.data = data;
    this.offset = offset;
    this.dim = d;

    this._indicesCache =
      indexCache == null
        ? new StaticArray<i32[]>(this.data.length).fill([])
        : indexCache;
    if (indexCache == null) {
      for (let i = 0; i < this.data.length; i++) {
        this._indicesCache[i] = this.indices(i);
      }
    }
  }

  //* Array accessor / setter

  @operator("[]")
  get(indices: i32[]): T {
    // ...indices
    assert(
      indices.length == this.shape.length,
      "Only getter with same size as shape are accepted."
    );

    let acc: i32 = 0;
    for (let i = 0; i < indices.length; i++) {
      acc += this.stride[i] * indices[i];
    }
    return this.data[this.offset + acc];
  }

  @operator("[]=")
  set(value: T, indices: i32[]): void {
    // ...indices
    assert(
      indices.length == this.shape.length,
      "Only getter with same size as shape are accepted."
    );

    let acc: i32 = 0;
    for (let i = 0; i < indices.length; i++) {
      acc += this.stride[i] * indices[i];
    }
    this.data[this.offset + acc] = value;
  }

  @operator("{}")
  geti(index: i32): T {
    return this.get(this.indices(index));
  }

  @operator("{}=")
  seti(index: i32, value: T): void {
    this.set(value, this.indices(index));
  }

  //* Math operators

  @operator("+")
  add(other: NdArray<T>): NdArray<T> {
    this.shapeCheck(other);

    for (let i = 0; i < this.data.length; i++) {
      // @ts-expect-error
      // this.data[i] += other.data[i];
      this.seti(i, this.geti(i) + other.geti(i));
    }
    return this;
  }

  @operator("-")
  sub(other: NdArray<T>): NdArray<T> {
    this.shapeCheck(other);

    for (let i = 0; i < this.data.length; i++) {
      // @ts-expect-error
      // this.data[i] -= other.data[i];
      this.seti(i, this.geti(i) - other.geti(i));
    }
    return this;
  }

  @operator("*")
  mult(other: NdArray<T>): NdArray<T> {
    this.shapeCheck(other);

    for (let i = 0; i < this.data.length; i++) {
      // @ts-expect-error
      // this.data[i] *= other.data[i];
      this.seti(i, this.geti(i) * other.geti(i));
    }
    return this;
  }

  //* Comparison operators

  @operator("/")
  div(other: NdArray<T>): NdArray<T> {
    this.shapeCheck(other);

    for (let i = 0; i < this.data.length; i++) {
      // @ts-expect-error
      // this.data[i] /= other.data[i];
      this.seti(i, this.geti(i) / other.geti(i));
    }
    return this;
  }

  @operator("==")
  eq(other: NdArray<T>): bool {
    if (!this.shapeCheck(other, true)) return false;

    for (let i = 0; i < this.data.length; i++) {
      // if (!(this.data[i] == other.data[i])) return false;
      if (!(this.geti(i) == other.geti(i))) return false;
    }
    return true;
  }

  @operator("!=")
  uneq(other: NdArray<T>): bool {
    return !this.eq(other);
  }

  @operator("<")
  ltAll(other: NdArray<T>): bool {
    this.shapeCheck(other);

    for (let i = 0; i < this.data.length; i++) {
      // if (!(this.data[i] < other.data[i])) return false;
      if (!(this.geti(i) < other.geti(i))) return false;
    }
    return true;
  }

  @operator(">")
  gtAll(other: NdArray<T>): bool {
    this.shapeCheck(other);

    for (let i = 0; i < this.data.length; i++) {
      // if (!(this.data[i] > other.data[i])) return false;
      if (!(this.geti(i) > other.geti(i))) return false;
    }
    return true;
  }

  @operator("<=")
  leAll(other: NdArray<T>): bool {
    return this < other || this == other;
  }

  @operator(">=")
  geAll(other: NdArray<T>): bool {
    return this > other || this == other;
  }

  //* Methods

  transpose(): NdArray<T> {
    return new NdArray<T>(
      this.data,
      this.shape.slice(0).reverse(),
      this.stride.slice(0).reverse(),
      this.offset
    );
  }

  T(): NdArray<T> {
    return this.transpose();
  }

  copy(): NdArray<T> {
    return new NdArray<T>(
      StaticArray.fromArray(this.data.slice(0)),
      this.shape.slice(0),
      this.stride.slice(0),
      this.offset,
      this._indicesCache
    );
  }

  index(indices: i32[]): i32 {
    //TODO Cache[?]
    assert(
      indices.length == this.shape.length,
      "Only getter with same size as shape are accepted."
    );

    let acc: i32 = 0;
    for (let i = 0; i < indices.length; i++) {
      acc += this.stride[i] * indices[i];
    }
    return this.offset + acc;
  }

  indices(index: i32): i32[] {
    const cached = this._indicesCache[index];
    if (cached.length > 0) return cached;

    const indices = new Array<i32>(this.shape.length);
    let last: i32 = 1;
    for (let i = 0; i < indices.length; i++) {
      last = i == 0 ? last : last * this.shape[i];
      indices[i] = (Mathf.floor((index / last) as f32) as i32) % this.shape[i];
    }
    return (this._indicesCache[index] = indices.reverse());
    // return indices.reverse();
  }

  /**
   * Code from https://github.com/nicolaspanel/numjs
   */
  reshape(indices: i32[]): NdArray<T> {
    if (indices.length === 0) {
      throw new Error("function takes at least one argument (0 given)");
    }
    let shape: i32[] = [];
    if (indices.length === 1 && indices[0] === -1) {
      shape = [this.size()];
    }
    if (indices.length === 1) {
      shape = [indices[0]];
    }
    if (indices.length > 1) {
      shape = indices.slice(0);
    }
    if (
      shape.filter(function (s) {
        return s === -1;
      }).length > 1
    ) {
      throw new Error("can only specify one unknown dimension");
    }

    const currentShapeSize = shapeSize(shape);
    for (let i = 0; i < shape.length; i++) {
      const s = shape[i];
      shape[i] = s == -1 ? (-1 * this.size()) / currentShapeSize : s;
    }

    if (this.size() !== shapeSize(shape)) {
      throw new Error("total size of new array must be unchanged");
    }
    const selfShape = this.shape;
    const selfOffset = this.offset;
    const selfStride = this.stride;
    const selfDim = selfShape.length;
    const d = shape.length;
    let stride: i32[];
    let offset: i32;
    let i: i32;
    let sz: i32;

    if (selfDim === d) {
      let sameShapes = true;
      for (i = 0; i < d; ++i) {
        if (selfShape[i] !== shape[i]) {
          sameShapes = false;
          break;
        }
      }
      if (sameShapes) {
        return new NdArray(this.data, selfShape, selfStride, selfOffset);
      }
    } else if (selfDim === 1) {
      // 1d view
      stride = new Array(d);
      for (i = d - 1, sz = 1; i >= 0; --i) {
        stride[i] = sz;
        sz *= shape[i];
      }
      offset = selfOffset;
      for (i = 0; i < d; ++i) {
        if (stride[i] < 0) {
          offset -= (shape[i] - 1) * stride[i];
        }
      }
      return new NdArray(this.data, shape, stride, offset);
    }

    const minDim = Math.min(selfDim, d);
    let areCompatible = true;
    for (i = 0; i < minDim; i++) {
      if (selfShape[i] !== shape[i]) {
        areCompatible = false;
        break;
      }
    }
    if (areCompatible) {
      stride = new Array(d);
      for (i = 0; i < d; i++) {
        stride[i] = selfStride[i] || 1;
      }
      offset = selfOffset;
      return new NdArray(this.data, shape, stride, offset);
    }
    return this.reshape(shape);
    // return this.flatten().reshape(shape);
  }

  //* Properties
  /**
   * Code from https://github.com/scijs/ndarray
   */
  order(): i32[] {
    switch (this.dim) {
      case 1:
        return [0];
      case 2:
        return Math.abs(this.stride[0]) > Math.abs(this.stride[1])
          ? [1, 0]
          : [0, 1];
      case 3:
        const s0 = Math.abs(this.stride[0]),
          s1 = Math.abs(this.stride[1]),
          s2 = Math.abs(this.stride[2]);
        if (s0 > s1) {
          if (s1 > s2) {
            return [2, 1, 0];
          } else if (s0 > s2) {
            return [1, 2, 0];
          } else {
            return [1, 0, 2];
          }
        } else if (s0 > s2) {
          return [2, 0, 1];
        } else if (s2 > s1) {
          return [0, 1, 2];
        } else {
          return [0, 2, 1];
        }

      default:
        const s = this.stride;
        return s[0] > s[s.length - 1]
          ? iota(this.dim).reverse()
          : iota(this.dim);
    }
  }

  size(): i32 {
    return shapeSize(this.shape);
  }

  //* Slicing
  // copied from https://github.com/scijs/ndarray

  pick(indices: i32[]): NdArray<T> {
    const shape: i32[] = [],
      stride: i32[] = [];

    let offset: i32 = this.offset;

    for (let i = 0; i < this.dim; i++) {
      if (indices.length > i && indices[i] >= 0) {
        offset = (offset + this.stride[i] * indices[i]) | 0;
      } else {
        shape.push(this.shape[i]);
        stride.push(this.stride[i]);
      }
    }
    return new NdArray<T>(this.data, shape, stride, offset);
  }

  lo(indices: i32[]): NdArray<T> {
    assert(indices.length == this.shape.length, "Wrong shapes");

    let b = this.offset,
      d = 0;
    const a_args = this.shape.slice(0),
      c_args = this.stride.slice(0);

    for (let i = 0; i < this.dim; i++) {
      if (indices[i] >= 0) {
        d = indices[i];
        b += c_args[i] * d;
        a_args[i] -= d;
      }
    }
    return new NdArray<T>(this.data, a_args, c_args, b);
  }

  hi(indices: i32[]): NdArray<T> {
    assert(indices.length == this.shape.length, "Wrong shapes");

    const shape = this.shape.slice(0);
    for (let i = 0; i < this.dim; i++) {
      shape[i] = indices[i] < 0 ? shape[i] : indices[i];
    }
    return new NdArray<T>(this.data, shape, this.stride, this.offset);
  }

  /**
   * Code from https://github.com/scijs/ndarray
   */
  step(indices: i32[]): NdArray<T> {
    // assert(indices.length == this.shape.length, "Wrong shapes");

    let offset = this.offset;
    let d = 0;

    const shape = this.shape.slice(0);
    const stride = this.stride.slice(0);

    for (let i = 0; i < this.dim; i++) {
      if (indices.length > i && indices[i] != 0) {
        d = indices[i] | 0;
        if (d < 0) {
          offset += stride[i] * (shape[i] - 1);
          shape[i] = Mathf.ceil((-shape[i] / d) as f32) as i32;
        } else if (d != 0) {
          shape[i] = Mathf.ceil((shape[i] / d) as f32) as i32;
        }
        stride[i] *= d;
      }
    }

    return new NdArray<T>(this.data, shape, stride, offset);
  }

  slice<I>(indices: Array<I>): NdArray<T> {
    if (!isInteger<I>() && !isArray<I>())
      throw new Error(
        "Only a array with integers or arrays of integers are accepted."
      );

    const d = this.dim;
    const hi = new Array<i32>(d).fill(-1);
    const lo = new Array<i32>(d).fill(-1);
    const step = new Array<i32>(d).fill(0);
    const tShape = this.shape;

    for (let i = 0; i < d; i++) {
      if (indices.length <= i) {
        break;
      }
      let arg = indices[i];

      if (!isArray(arg)) {
        // @ts-expect-error
        lo[i] = arg < 0 ? (arg as i32) + tShape[i] : arg;
        // hi[i] = null;
        step[i] = 1;
      } else if ((arg as i32[]).length === 2) {
        // pattern: a[start::step]
        // we infere from length of given arguments
        const s = arg[0] < 0 ? arg[0] + tShape[i] : arg[0];
        lo[i] = s;
        // hi[i] = null;
        step[i] = arg[1] || 1;
      } else {
        // pattern start:end:step
        const start = arg[0] < 0 ? arg[0] + tShape[i] : arg[0];
        const end = arg[1] < 0 ? arg[1] + tShape[i] : arg[1];
        lo[i] = end ? start : 0;
        hi[i] = end ? end - start : start;
        step[i] = arg[2] || 1;
      }
    }

    const slo = this.lo(lo);
    const shi = slo.hi(hi);
    const sstep = shi.step(step);

    return sstep;
  }

  //* Helpers
  shapeCheck(other: NdArray<T>, ret: bool = false): bool {
    let check: bool = false;

    check = this.shape.length == other.shape.length;

    if (ret) {
      if (!check) return false;
    } else {
      assert(
        check,
        `Cannot operate on array with different lengths. (${this.shape.length}) (${other.shape.length})`
      );
    }

    for (let i = 0; i < other.shape.length; i++) {
      check = this.shape[i] == other.shape[i];
    }

    if (ret) {
      if (!check) return false;
    } else {
      assert(
        check,
        `Cannot operate on arrays with different shapes. (${this.shape}) (${other.shape})`
      );
    }

    return true;
  }

  toString(): string {
    const dims = this.shape.slice(this.shape.length - 2);
    let outStr = "\n";
    let idx = 0;
    let outer = 0;

    while (idx < this.data.length) {
      for (let inner = 0; inner < dims[1]; inner++) {
        outStr = outStr + `${this.geti(idx)}\t`;
        if (idx >= this.data.length) return outStr;
        idx++;
      }
      outStr = outStr + "\n";
      if (outer > dims[0]) {
        outStr = outStr;
        outer = 0;
      }
      outer++;
    }

    return outStr;
  }
}

// export function _dim<T>(x:T[]):T {
//   const ret:i32[] = [];
//   let tmp = x
//   while (typeof x === "object" && isArray<T>()) {
//     ret.push(x.length);
//     tmp = tmp[0];
//   }
//   return ret;
// }

// export function getShape<T>(array:T):i32[] {
//   // let y:T[][], z:T[];
//   if (typeof array == "object" && isArray<T>()) {
//     let y = array[0];
//     if (typeof y == "object" && isArray(y)) {
//       let z = y[0];
//       if (typeof z == "object") {
//         const tmp = [array.length, y.length]
//         // return _dim<T>(array);
//         return tmp.concat(getShape<T>(z))
//       }
//       return [array.length, y.length];
//     }
//     return [array.length];
//   }
//   return [];
// }
