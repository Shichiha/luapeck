local fs = require("library.fs")
local path = require("library.path")

local function getIdentifier(file)
    if file == "" then
        error("supplied getIdentifier with empty string.")
    else
    end
    return file:gsub('/', '_'):gsub('\\', '_'):gsub('%.', '_')
end

local function getRequires(fileData)
    local requires = {}
    for require in fileData:gmatch('require%s*%(%s*[\'"](.-)[\'"]%s*%)') do
        table.insert(requires, require)
    end

    return requires
end

local requireTemplate = "local pmanager={loaded={},packages={}}function prequire(b)local c=pmanager.loaded[b]if(c)then return c end;c=pmanager.packages[b]if(c)then pmanager.loaded[b]=c()return pmanager.loaded[b]end end;local _G=_G;"
local function parseModule(module, hash, modules, baseDir)
    local leftDir = nil;
    if baseDir == "" then leftDir = "" else leftDir = baseDir.."/" end
    if not baseDir then baseDir = "" end
    local modulePath = module:gsub('%../', 'outdir_buffer')
    if not fs.existsSync(module) then
        modulePath = modulePath:gsub('%outdir_buffer', '../')
        modulePath = modulePath:gsub('%.', '/')
        modulePath = modulePath .. '.lua'

        modulePath = leftDir..modulePath
        if fs.existsSync(modulePath) then
            module = modulePath
        else
            error(modulePath.." don't exist")
        end
    end
    if not fs.existsSync(module) and module:find('%.') then
        error("file '" .. module .. "' doesnt exist")
    end
    local moduleData = fs.readFileSync(module)

    local requires = getRequires(moduleData)
    local outputData = moduleData
    for k, v in pairs(requires) do
        local reqHash = getIdentifier(v)
        if not modules[reqHash] then
            parseModule(v, reqHash, modules, baseDir)
        end
        outputData = outputData:gsub('require%s*%(%s*"' .. v .. '"%s*%)', 'prequire(\'' .. reqHash .. '\')')
    end

    modules[hash] = outputData:gsub('\n', '\n\t'):gsub('_G', '_G_' .. hash)
end

local function loadTemplate(hash, data)
    return 'pmanager.packages[\'' .. hash .. '\'] = function()\n\t' .. data .. '\nend\n'
end

local function Pack(filePath)
    filePath = path.resolve(filePath)
    local mainHash = getIdentifier(filePath)

    local modules = {}

    parseModule(filePath, mainHash, modules, path.parse(filePath).dir)
    local outputData = requireTemplate

    for hash, data in pairs(modules) do
        outputData = outputData .. loadTemplate(hash, data)
    end

    outputData = outputData .. 'prequire(\'' .. mainHash .. '\')\n'
    return outputData
end

return Pack
