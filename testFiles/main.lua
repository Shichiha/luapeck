local class = require('library.class')
local Animal = class()
function Animal:init(name, sound)
    self.name = name
    self.sound = sound
end
function Animal:getName()
    return self.name
end
function Animal:say()
    print(self.sound)
end

local Dog = class(Animal)
function Dog:init(name)
    Animal.init(self, name, 'wangwang')
end

local d = Dog('wangcai', 'bark')
d:say()
print(d:getName())
print(d:is_a(Animal))
print(d:is_a(Dog))
