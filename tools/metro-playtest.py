import sys
src, out = sys.argv[1], sys.argv[2]
h = open(src, encoding='utf8').read()
n = h.count('location.search'); assert n > 5, n
h = h.replace('location.search', '__QS')
inj = "<script>var __QS=(function(){var s='';try{s=location.search||'';}catch(e){}return /[?&]dev\\b/.test(s)?s:'?dev&wx=clear'+(s?'&'+s.slice(1):'');})();</script>"
i = h.find('<head>'); assert i >= 0
h = h[:i+6] + inj + h[i+6:]
open(out, 'w', encoding='utf8').write(h); print(n, len(h))
