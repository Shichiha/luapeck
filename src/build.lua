local fs, path = require("library.fs"), require("library.path")

---@param file string
---@return string
local function fileId(file)
    if file == "" then error("s") end
	return file:gsub('[^%w]', '_')
end

---@param fileData string
---@return table
local function getRequires(fileData)
	local requires = {}
	for line in fileData:gmatch("[^\r\n]+") do
		if not line:match("^%s*%-%-") then
			local require = line:match("require%s*%(%s*[\'\"](.-)[\'\"]%s*%)")
			if require then
				print(require)
				table.insert(requires, require)
			end
		end
	end
	return requires
end

local requireTemplate = "local pmanager = {loaded = {}, packages = {}} \
local function prequire(b) \
	local c = pmanager.loaded[b] \
	if c then return c end \
	c = pmanager.packages[b] \
	if c then \
		pmanager.loaded[b] = c() \
		return pmanager.loaded[b] \
	end \
end \n"

local function luaPath(module, baseDir) 
	local leftDir = nil;
    leftDir = baseDir == "" and "" or baseDir .. "/"
    local modulePath = module:gsub('%../', 'outdir_buffer')
    if not fs.existsSync(module) then
        modulePath = modulePath:gsub('%outdir_buffer', '../'):gsub('%.', '/') .. '.lua'

        modulePath = leftDir .. modulePath
        if fs.existsSync(modulePath) then
            module = modulePath
        else
            error(modulePath .. " don't exist")
        end
    end
    if not fs.existsSync(module) and module:find('%.') then
        error("file '" .. module .. "' doesnt exist")
    end
	return module
end

local function loadTemplate(hash, data)
    return 'pmanager.packages[\'' .. hash .. '\'] = function()\n\t' .. data .. '\nend\n'
end
local function parseModule(module, hash, modules, baseDir)
	module = luaPath(module, baseDir)
    local moduleData = fs.readFileSync(module)
    local requires = getRequires(moduleData)
    local outputData = moduleData

	for _, v in pairs(requires) do
        local moduleId = fileId(v)
        if not modules[moduleId] then
            parseModule(v, moduleId, modules, baseDir)
        end
        outputData = outputData:gsub('require%s*%(%s*[\'"]' .. v .. '[\'"]%s*%)', 'prequire(\'' .. moduleId .. '\')')
    end

    modules[hash] = outputData:gsub('\n', '\n\t')
end

local function Pack(filePath)
    filePath = path.resolve(filePath)
    local mainHash = fileId(filePath)

    local modules = {}

    parseModule(filePath, mainHash, modules, path.parse(filePath).dir)
    local outputData = requireTemplate

    for hash, data in pairs(modules) do
        outputData = outputData .. loadTemplate(hash, data)
    end

    outputData = outputData .. 'prequire(\'' .. mainHash .. '\')\n'
    return outputData
end
print(Pack("testFiles.main"))
return Pack
