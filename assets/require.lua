local pmanager={loaded={},packages={}}function require(b)local c=pmanager.loaded[b]if(c)then return c end;c=pmanager.packages[b]if(c)then pmanager.loaded[b]=c()return pmanager.loaded[b]end end
