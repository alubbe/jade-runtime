function jade_classes(e,a){return Array.isArray(e)&&Array.isArray(a)?jade_classes(e.map(jade_classes).map(function(e,r){return a[r]?jade_escape(e):e})):(Array.isArray(e)?e.map(jade_classes):e&&"object"==typeof e?Object.keys(e).filter(function(a){return e[a]}):[e]).filter(Boolean).join(" ")}