local pmanager={loaded={},packages={}}local function prequire(b)local c=pmanager.loaded[b]if(c)then return c end;c=pmanager.packages[b]if(c)then pmanager.loaded[b]=c()return pmanager.loaded[b]end end;
pmanager.packages['___testFiles_main_lua'] = function()
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

end
pmanager.packages['library_class'] = function()
        -- simple class implementation by shichihachi ≡ƒÿ╝
        local function class(base, init)
            local c = {}
            if not init and type(base) == 'function' then
                init = base
                base = nil
            elseif type(base) == 'table' then
                for i, v in pairs(base) do
                    c[i] = v
                end
                c._base = base
            end
            c.__index = c

            local mt = {}
            mt.__call = function(class_tbl, ...)
                local obj = {}
                setmetatable(obj, c)
                if init then
                    init(obj, ...)
                else
                    if base and base.init then
                        base.init(obj, ...)
                    end
                end
                return obj
            end
            c.init = init
            c.is_a = function(self, klass)
                local m = getmetatable(self)
                while m do
                    if m == klass then
                        return true
                    end
                    m = m._base
                end
                return false
            end
            setmetatable(c, mt)
            return c
        end
        return class
end
prequire('___testFiles_main_lua')
