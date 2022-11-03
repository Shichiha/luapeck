local fs = {}

function fs.readFileSync(fp)
  local f = io.open(fp, "r")
  if f == nil then error("supplied an invalid filepath.") end
  local content = f:read("*all")
  f:close()
  return tostring(content)
end

function fs.writeFileSync(fp, content)
  local f = io.open(fp, "w")
  if f == nil then warn("file is nil, writing new file") end
  f:write(content)
  f:close()
end

function fs.existsSync(fp)
  local f = io.open(fp, "r")
  if f then
    f:close()
    return true
  else
    return false
  end
end

return fs