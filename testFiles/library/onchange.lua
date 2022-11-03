local lib = {}

local mt = {}

function mt.__index(t, k)
	return t.value[k]
end

function mt.__newindex(t, k, v)
	t.value[k] = v
	t.onChange(t.value)
end

function lib.new(value, onChange)
	return setmetatable({value = value, onChange = onChange}, mt)
end


return lib