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
    else
        local f, err = loadfile(h)
        if (f) then
            proxy_package.packages[h] = f
            proxy_package.loaded[h] = f()
            return proxy_package.loaded[h]
        else
            return nil, err
        end
    end
end

proxy_package.packages['c36e8531'] = function()
	local math = require('4d912eca')
	math.add(1,2)
end
proxy_package.packages['4d912eca'] = function()
	local lib = {}
	function lib:add(a, b)
	    return a + b
	end
	return lib
	
end
require('c36e8531')
