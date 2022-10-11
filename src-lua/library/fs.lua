local fs = {}

function fs.readFileSync(fp)
  local f = io.open(fp, "r")
  if f == nil then return "file is nil" end
  local content = f:read("*all")
  f:close()
  return content
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