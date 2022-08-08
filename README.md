# luapeck

the thing i built because other luapack-like projects use require as a fucking proxy.  

# Setup
Download and install [NodeJS](https://nodejs.org/)  
open terminal in the luapeck directory and enter `npm i`  

## (optional) installing luapeck globally
open terminal in the luapeck directory and enter `npm install -g .`

# Usage
open terminal in the luapeck directory and enter `luapeck --version` (only works if you have installed luapeck globally)  

```
luapeck -o test/packed.lua build test/test.lua
```
# Running tests
open terminal in the luapeck directory and enter `npm run test`  
check the output for errors  
built file will be in `test/packed.lua`


### to-do list

- [ ] currently needs fixes (breaks stack traces)
- [ ] add support for beautifying output
- [ ] support for lua libraries