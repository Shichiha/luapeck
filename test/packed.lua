local proxy_package = {
    loaded = {},
    packages = {}
}

function require(h)
    if (proxy_package.loaded[h]) then
        return proxy_package.loaded[h]
    elseif (proxy_package.packages[h]) then
        proxy_package.loaded[h] = proxy_package.packages[h]()
        return proxy_package.loaded[h]
    end
end

proxy_package.packages['c36e8531'] = function()
	local lib = {add = function(a, b) return a + b end}
	return lib
	
end
require('c36e8531')
