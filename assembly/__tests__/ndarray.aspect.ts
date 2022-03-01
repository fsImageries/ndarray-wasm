import { NdArray } from "../ndarray";
import * as utils from "../utils";

describe("NDArray Testing", () => {
  it("should test NDArray getters/setters", () => {
    const testarr: f64[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const A = new NdArray<f64>(StaticArray.fromArray(testarr), [3, 3]);

    // @ts-expect-error
    expect<f64>(A[[1, 1]]).toBe(
      4.0,
      "Testing bracket getter. [NdArray[[i,j,...,n]]]"
    );

    expect<f64>(A.get([2, 2])).toBe(
      8.0,
      "Testing get getter function. [NdArray.get([i,j,...,n])]"
    );

    A.set(666.0, [2, 2]);
    expect<f64>(A.get([2, 2])).toBe(
      666.0,
      "Testing set setter function. [NdArray.set(value, [i,j,...,n])]"
    );

    const testarr2: f64[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const E = new NdArray<f64>(StaticArray.fromArray(testarr2), [3, 3]);
    expect<f64>(E.get([2, 1])).toBe(
      8.0,
      "Testing getter before transpose. [NdArray.get(value, [i,j,...,n])]"
    );
    expect<f64>(E.transpose().get([2, 1])).toBe(
      6.0,
      "Testing getter after transpose. [NdArray.get(value, [i,j,...,n])]"
    );

    const F = utils.arange<f64>(3 * 3).reshape([3, 3]);
    // @ts-expect-error
    expect<f64>(unchecked(F[5])).toBe(
      5.0,
      "Testing 'unchecked' getter. [unchecked(NdArray[idx])]"
    );

    // @ts-expect-error
    unchecked((F[5] = 666.0));
    // @ts-expect-error
    expect<f64>(unchecked(F[5])).toBe(
      666.0,
      "Testing 'unchecked' setter. [unchecked(NdArray[idx] = value)]"
    );

    const FT = F.T();
    // @ts-expect-error
    expect<f64>(unchecked(FT[5])).toBe(
      7.0,
      "Testing 'unchecked' getter after transpose. [unchecked(NdArray[idx])]"
    );

    // @ts-expect-error
    unchecked((FT[5] = 1313.0));
    // @ts-expect-error
    expect<f64>(unchecked(FT[5])).toBe(
      1313.0,
      "Testing 'unchecked' setter. [unchecked(NdArray[idx] = value)]"
    );
  });

  it("should test math operations", () => {
    const testarr: f64[] = [2, 4, 6, 8];
    const B = new NdArray<f64>(StaticArray.fromArray(testarr), [2, 2]);

    let checkarr: f64[] = [2, 2, 2, 2];
    const C = new NdArray<f64>(StaticArray.fromArray(checkarr), [2, 2]);

    let resultarr: f64[] = [4, 6, 8, 10];
    let result = new NdArray<f64>(StaticArray.fromArray(resultarr), [2, 2]);

    // @ts-expect-error
    expect<NdArray<f64>>(B.copy() + C).toStrictEqual(
      result,
      "Testing addition operator. [NdArray + NdArray]"
    );

    resultarr = [0, 2, 4, 6];
    result = new NdArray<f64>(StaticArray.fromArray(resultarr), [2, 2]);

    // @ts-expect-error
    expect<NdArray<f64>>(B.copy() - C).toStrictEqual(
      result,
      "Testing substraction operator. [NdArray - NdArray]"
    );

    resultarr = [4, 8, 12, 16];
    result = new NdArray<f64>(StaticArray.fromArray(resultarr), [2, 2]);

    // @ts-expect-error
    expect<NdArray<f64>>(B.copy() * C).toStrictEqual(
      result,
      "Testing multiplication operator. [NdArray * NdArray]"
    );

    resultarr = [1, 2, 3, 4];
    result = new NdArray<f64>(StaticArray.fromArray(resultarr), [2, 2]);

    // @ts-expect-error
    expect<NdArray<f64>>(B.copy() / C).toStrictEqual(
      result,
      "Testing division operator. [NdArray / NdArray]"
    );
  });

  it("should test comparison operators", () => {
    const testarr: f64[] = [2, 4, 6, 8];
    const B = new NdArray<f64>(StaticArray.fromArray(testarr), [2, 2]);
    const C = new NdArray<f64>(StaticArray.fromArray(testarr), [2, 2]);
    const D = new NdArray<f64>(
      StaticArray.fromArray([3.0, 5.0, 7.0, 9.0]),
      [2, 2]
    );

    expect<bool>(B == C).toBe(
      true,
      "Testing equality operator. [NdArray == NdArray]"
    );
    expect<bool>(B != C).toBe(
      false,
      "Testing inequality operator. [NdArray != NdArray]"
    );
    expect<bool>(B != C.transpose()).toBe(
      true,
      "Testing inequality operator. [NdArray != NdArray]"
    );

    expect<bool>(B < D).toBe(
      true,
      "Testing less than operator. [NdArray < NdArray]"
    );
    expect<bool>(B > D).toBe(
      false,
      "Testing greater than operator. [NdArray > NdArray]"
    );

    expect<bool>(B >= B).toBe(
      true,
      "Testing greater than equals operator. [NdArray >= NdArray]"
    );
    expect<bool>(B >= D).toBe(
      false,
      "Testing greater than equals operator. [NdArray >= NdArray]"
    );

    expect<bool>(B <= D).toBe(
      true,
      "Testing less than equals operator. [NdArray <= NdArray]"
    );
    expect<bool>(B <= B).toBe(
      true,
      "Testing less than equals operator. [NdArray <= NdArray]"
    );
  });

  it("should test slicing operators", () => {
    // const testarr: f64[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // const B = new NdArray<f64>(StaticArray.fromArray(testarr), [3, 3]);
    const B = utils.arange<f64>(3 * 3).reshape([3, 3]);
    const BT = B.transpose();
    const Blo = B.lo([1, 2]);
    const Bhi = B.hi([1, 2]);
    const Bst = B.step([-1]);

    expect<i32[]>(B.shape).toStrictEqual(
      [3, 3],
      "Testing base shape. [NdArray.shape]"
    );
    expect<i32[]>(B.stride).toStrictEqual(
      [3, 1],
      "Testing base stride. [NdArray.stride]"
    );
    expect<i32>(B.offset).toBe(0, "Testing base offset. [NdArray.offset]");

    //* Transpose       //TODO convert to checkArrBase function

    expect<i32[]>(BT.shape).toStrictEqual(
      [3, 3],
      "Testing transpose shape. [NdArray.transpose().shape]"
    );
    expect<i32[]>(BT.stride).toStrictEqual(
      [1, 3],
      "Testing transpose stride. [NdArray.transpose().stride]"
    );
    expect<i32>(BT.offset).toBe(
      0,
      "Testing transpose offset. [NdArray.transpose().offset]"
    );

    //* Lo        //TODO convert to checkArrBase function

    expect<i32[]>(Blo.shape).toStrictEqual(
      [2, 1],
      "Testing lo shape. [NdArray.lo(...).shape]"
    );
    expect<i32[]>(Blo.stride).toStrictEqual(
      [3, 1],
      "Testing lo stride. [NdArray.lo(...).stride]"
    );
    expect<i32>(Blo.offset).toBe(
      5,
      "Testing lo offset. [NdArray.lo(...).offset]"
    );

    //* Hi        //TODO convert to checkArrBase function

    expect<i32[]>(Bhi.shape).toStrictEqual(
      [1, 2],
      "Testing hi shape. [NdArray.hi(...).shape]"
    );
    expect<i32[]>(Bhi.stride).toStrictEqual(
      [3, 1],
      "Testing hi stride. [NdArray.hi(...).stride]"
    );
    expect<i32>(Bhi.offset).toBe(
      0,
      "Testing hi offset. [NdArray.hi(...).offset]"
    );

    //* Step        //TODO convert to checkArrBase function

    expect<i32[]>(Bst.shape).toStrictEqual(
      [3, 3],
      "Testing step shape. [NdArray.step(...).shape]"
    );
    expect<i32[]>(Bst.stride).toStrictEqual(
      [-3, 1],
      "Testing step stride. [NdArray.step(...).stride]"
    );
    expect<i32>(Bst.offset).toBe(
      6,
      "Testing step offset. [NdArray.step(...).offset]"
    );

    //* Pick

    const F = utils.arange<f64>(3 * 3 * 3 * 4).reshape([3, 3, 3, 4]);
    const pick1 = F.pick([1]);
    const pick1_check = new NdArray<f64>(
      new StaticArray<f64>(0),
      [3, 3, 4],
      [12, 4, 1],
      36
    );
    checkArrBase(pick1, pick1_check, "pick1", "NdArray.pick");

    expect<f64>(pick1.get([0, 0, 0])).toBe(
      36,
      "Testing pick 1dim get. [NdArray.pick([n]).get([...])]"
    );

    const pick3 = F.pick([2, 2, 2]);
    const pick3_check = new NdArray<f64>(
      new StaticArray<f64>(0),
      [4],
      [1],
      104
    );
    checkArrBase(pick3, pick3_check, "pick3", "NdArray.pick");

    expect<f64>(pick3.get([0])).toBe(
      104,
      "Testing pick 3dim get. [NdArray.pick([n,j,k]).get([...])]"
    );

    const Bslice = B.slice([[1, 2, 1]]);
    const Bslice_check = new NdArray<f64>(
      new StaticArray<f64>(0),
      [1, 3],
      [3, 1],
      3
    );
    checkArrBase(Bslice, Bslice_check, "slice", "NdArray.slice");

    expect<f64>(Bslice.get([0, 0])).toBe(
      3.0,
      "Testing slice 2dim get. [NdArray.slice(...).get([0,0])]"
    );
    expect<f64>(Bslice.get([0, 1])).toBe(
      4.0,
      "Testing slice 2dim get. [NdArray.slice(...).get([0,1])]"
    );
    expect<f64>(Bslice.get([0, 2])).toBe(
      5.0,
      "Testing slice 2dim get. [NdArray.slice(...).get([0,2])]"
    );

    // B.slice([[1,1]]) //! not working
    // // log<NdArray<f64>>(B.slice([[1,1]]))

    const Bslice2 = B.slice([2]);
    const Bslice2_check = new NdArray<f64>(
      new StaticArray<f64>(0),
      [1, 3],
      [3, 1],
      6
    );
    checkArrBase(Bslice2, Bslice2_check, "slice2", "NdArray.slice");
  });

  it("should test transpose and order operations", () => {
    const C = utils.arange<f64>(3 * 3 * 3).reshape([3, 3, 3]);
    const D = utils.arange<f64>(3).reshape([3]);
    const E = utils.arange<f64>(2 * 2 * 2 * 2).reshape([2, 2, 2, 2]);

    function checkOrderTranspose(
      arr: NdArray<f64>,
      order: i32[],
      Torder: i32[],
      varName: string
    ): void {
      expect<i32[]>(arr.order()).toStrictEqual(
        order,
        `Testing order before transpose (var:${varName}). [NdArray.order()]`
      );
      expect<i32[]>(arr.T().order()).toStrictEqual(
        Torder,
        `Testing order after transpose (var:${varName}). [NdArray.order()]`
      );
    }

    checkOrderTranspose(C, [2, 1, 0], [0, 1, 2], "C");
    checkOrderTranspose(D, [0], [0], "D");
    checkOrderTranspose(E, [3, 2, 1, 0], [0, 1, 2, 3], "D");
  });

  it("should test playground operators", () => {
    const A = utils.arange<f64>(3 * 3 * 3).reshape([3, 3, 3]);

    // function logStr(str: string): void {
    //   log<string>(str);
    // }

    function add(a: f64, b: f64): f64 {
      // log<f64[]>([a,b])
      return a + b;
    }

    const pow = function fn(a: f64): f64 {
      return a ** a;
    };
    const fn = changetype<usize>(add);

    const B = utils.arange<f64>(3*3).reshape([3,3])
    log<i32[]>(B.pick([0]).shape)
    utils.iterNd(B.pick([0]), fn)

    // for (let i = 0; i < 100; i++) {
    //   // utils.iterNdxNd<f64>(A, A.transpose(), fn);
    // }

    // log<StaticArray<i32[]>>(A._indicesCache)
    // log<StaticArray<i32[]>>(A.T()._indicesCache)
    // log<bool>(A._indicesCache == A.T()._indicesCache)

    // utils.iterNd(A, fn)

    // log<string>("Ende\n")
    // iterateOver(A.transpose())

    // log<i32[]>(A.indices(5))
    // log<NdArray<f64>>(arange<f64>(3))
    // log<f64>(A.get([0,1]))
    // const ids = ind2sub(A.shape, 2)
    // log<i32[]>(ids)
    // log<f64>(A.get(ids))
    // log<NdArray<f64>>(A)
    // log<string>(A.toString())
  });
});

function checkArrBase<T>(
  arr1: NdArray<T>,
  counterCheck: NdArray<T>,
  name: string,
  log: string
): void {
  expect<i32[]>(arr1.shape).toStrictEqual(
    counterCheck.shape,
    `Testing ${name} ${arr1.dim}dim shape. [${log}(...).shape]`
  );
  expect<i32[]>(arr1.stride).toStrictEqual(
    counterCheck.stride,
    `Testing ${name} ${arr1.dim}dim stride. [${log}(...).stride]`
  );
  expect<i32>(arr1.offset).toBe(
    counterCheck.offset,
    `Testing ${name} ${arr1.dim}dim offset. [${log}(...).offset]`
  );
}
