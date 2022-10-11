local path = {}

local is_windows = package.config:sub(1,1) == "\\"

local function split(str, sep)
  local sep, fields = sep or ":", {}
  local pattern = string.format("([^%s]+)", sep)
  str:gsub(pattern, function(c) fields[#fields+1] = c end)
  return fields
end

function path.parse(fp)
  local dir, file = fp:match("(.*)/(.*)")
  return {
    dir = dir,
    file = file,
    ext = file:match("%.(.*)"),
    name = file:match("(.*)%.")
  }
end

function path.resolve(...)
  local args = {...}
  local fp = ""
  for i, v in ipairs(args) do
    if i == 1 then
      fp = v
    else
      if is_windows then
        fp = fp .. "\\" .. v
      else
        fp = fp .. "/" .. v
      end
    end
  end
  return fp
end

function path.relative(from, to)
  if not from then
    return to
  end
  local from_dir, from_file = from:match("(.*)/(.*)")
  local to_dir, to_file = to:match("(.*)/(.*)")
  local from_dir_parts = split(from_dir, "/")
  local to_dir_parts = split(to_dir, "/")
  local common_parts = {}
  for i, v in ipairs(from_dir_parts) do
    if v == to_dir_parts[i] then
      table.insert(common_parts, v)
    else
      break
    end
  end
  local common_dir = table.concat(common_parts, "/")
  local from_dir_remainder = from_dir:sub(#common_dir + 1)
  local to_dir_remainder = to_dir:sub(#common_dir + 1)
  local from_dir_remainder_parts = split(from_dir_remainder, "/")
  local to_dir_remainder_parts = split(to_dir_remainder, "/")
  local up_dirs = {}
  for i, v in ipairs(from_dir_remainder_parts) do
    table.insert(up_dirs, "..")
  end
  local down_dirs = to_dir_remainder_parts
  local fp = table.concat(up_dirs, "/") .. "/" .. table.concat(down_dirs, "/") .. "/" .. to_file
  return fp
end

function path.dirname(fp)
  local dir, file = fp:match("(.*)/(.*)")
  return dir
end

function path.absolute(fp)
  local dir, file = fp:match("(.*)/(.*)")
  
  return io.popen"cd":read'*l' .. "\\" .. fp:gsub("/", "\\")
end

return path