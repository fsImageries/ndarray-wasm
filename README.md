# ndarray-wasm

Inspired and mostly ported from [ndarray](https://github.com/scijs/ndarray) and [numjs](https://github.com/nicolaspanel/numjs).
Modular multidimensional arrays for [AssemblyScript](https://github.com/AssemblyScript/assemblyscript).

This is a WIP and definitely needs some work, especially in the field of component-wise operations.
From my perspective it also needs to have a printing module which is at the moment not workable, so definitely open for contributions.

## Usage:
AssemblyScript
```
import { NdArray, utils } from  "../node_modules/ndarray-wasm/assembly";

// numjs syntax
utils.arange<f64>(3 * 3 * 3).reshape([3, 3, 3]);

// raw syntax
new NdArray<f64>(StaticArray.fromArray([...], shape)
```

## TODOS:
- [x] multi-getter/setter
- [x] single-getter/setter
- [x] math operation
- [x] reshape
- [x] arange
- [ ] array printing (no idea at the moment, probably recursion)
- [ ] nested array to NdArray (same as array printing, needs `toArray` function)  
- [ ] vector operations
- [ ] matrix operations
- [ ] component-wise operations


