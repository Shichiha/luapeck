local fs = require("library.fs")
local path = require("library.path")

local function getIdentifier(file)
    return file:gsub('/', '_'):gsub('\\', '_'):gsub('%.', '_')
end

local function getRequires(fileData)
    local requires = {}
    for require in fileData:gmatch('require%s*%(%s*[\'"](.-)[\'"]%s*%)') do
        table.insert(requires, require)
    end
    return requires
end

local requireTemplate = fs.readFileSync(path.absolute("../assets/require.lua"))
local function parseModule(module, hash, modules)
    if not fs.existsSync(module) then
        module = module:gsub('%../', 'a1234567890')
        module = module:gsub('%.', '\\')
        module = module:gsub('%a1234567890', '../')
        
        module = module .. '.lua'
    end

    if not fs.existsSync(module) then
        error ("file " .. module .." doesnt exist")
    end
    local moduleFolder = path.dirname(module)

    local moduleData = fs.readFileSync(module)

    local requires = getRequires(moduleData) or {}
    local outputData = moduleData
    for _, require in pairs(requires) do
        local reqPath = path.resolve(moduleFolder, require)
        local reqHash = getIdentifier(reqPath)
        if not modules[reqHash] then
            parseModule(reqPath, reqHash, modules)
        end
        outputData = outputData:gsub('require%s*%(%s*"' .. require .. '"%s*%)', 'require(\'' .. reqHash .. '\')')
    end

    modules[hash] = outputData:gsub('\n', '\n\t')
end

local function loadTemplate(hash, data)
    return 'pmanager.packages[\'' .. hash .. '\'] = function()\n\t' .. data .. '\nend\n'
end

local function Pack(filePath)
    filePath = path.resolve(filePath)
    local mainHash = getIdentifier(filePath)

    local modules = {}

    parseModule(filePath, mainHash, modules)
    local outputData = requireTemplate

    for hash, data in pairs(modules) do
        outputData = outputData .. loadTemplate(hash, data)
    end

    outputData = outputData .. 'require(\'' .. mainHash .. '\')\n'
    return outputData
end

return Pack
