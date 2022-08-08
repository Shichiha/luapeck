print('Hello world!')

local test2 = load_module('mathematics')
load_module('sub/test3.lua')
print(test2:add(1,2))