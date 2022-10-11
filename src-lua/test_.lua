local fileData = 'require("hi.library.hello")\nrequire("hi.library.hello")'

local function getRequires(fileData)
	local requires = {}
	for require in fileData:gmatch('require%("(.-)"%)') do
		table.insert(requires, require)
	end
	return requires
end

local requires = getRequires(fileData)

for i, require in ipairs(requires) do
	print(require)
end