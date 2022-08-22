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
	require('afcd7d08')
end
proxy_package.packages['afcd7d08'] = function()
	print('くるくる回るペンギンわ頭の中から笑う')
end
require('c36e8531')
