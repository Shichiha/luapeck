local proxy_package = {
  loaded = {},
  packages = {}
}
local _load_module = load_module

function load_module(h)
  if (proxy_package.loaded[h]) then
    return proxy_package.loaded[h]
  elseif (proxy_package.packages[h]) then
    proxy_package.loaded[h] = proxy_package.packages[h]()
    return proxy_package.loaded[h]
  else
    return _load_module(h)
  end
end

proxy_package.packages['c36e8531'] = function()
print('Hello world!')

local test2 = load_module('1cd9fb73')
load_module('1af74717')
print(test2:add(1,2))
end
proxy_package.packages['1cd9fb73'] = function()
local lib = {}
function lib:add(a, b)
    return a + b
end
return lib

end
proxy_package.packages['1af74717'] = function()
print('78 from within subdirectories!')
end
load_module('c36e8531')
