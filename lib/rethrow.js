function jade_rethrow(e,n,r,t){if(!(e instanceof Error))throw e;if(!("undefined"==typeof window&&n||t))throw e.message+=" on line "+r,e;try{t=t||require("fs").readFileSync(n,"utf8")}catch(a){jade_rethrow(e,null,r)}var i=3,o=t.split("\n"),h=Math.max(r-i,0),s=Math.min(o.length,r+i),i=o.slice(h,s).map(function(e,n){var t=n+h+1;return(t==r?"  > ":"    ")+t+"| "+e}).join("\n");throw e.path=n,e.message=(n||"Jade")+":"+r+"\n"+i+"\n\n"+e.message,e}