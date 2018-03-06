

function throttler(period){
    return (function(){

        var active = false
        var lastrun = 0;

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        return{
            apply: async function(targetfunc){
                if(active) {
                    return
                } active = true;

                var now = new Date().getTime();
                var remainder = lastrun + period - now;

                if(remainder > 0){
                    await sleep(remainder);
                }
                targetfunc();
                lastrun = new Date().getTime();
                active = false;
            }
        }
    }());
}

var pwnedpass = (function() {

    var apiURL = "https://api.pwnedpasswords.com/range/";
    var GitHubSrc = "jpxor/pwnedpass.js";

    var RateLimit = 2000; // ms
    var throttle = throttler(RateLimit);

    var UserAgent = GitHubSrc;

    var isValidSHA1 = function(str) {
        const regex = /[a-fA-F0-9]{40}/g;
        return str.search(regex) >= 0;
    }

    var httpGET = function(url, callback){
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() { 
            if (request.readyState == 4 && request.status == 200)
                callback(request.responseText);
        }
        request.open("GET", url, true);
        request.send(null);
    }

    return {
        init:function(userAgent) {
            UserAgent = GitHubSrc + "/" + userAgent;
        },
        check:function(sha1hash, callbacks) {
            if(!sha1hash){
                console.error("missing: sha1 hash");
                return;
            }
            if(!isValidSHA1(sha1hash)){
                console.error("input must be valid sha1 hash hex");
                return;
            }
            if(!callbacks){
                callbacks = {};
            }
            if(!callbacks.Pwned){
                callbacks.Pwned = function(){
                    console.log("PWNED!");
                }
            }
            if(!callbacks.Clean){
                callbacks.Clean = function(){
                    console.log("CLEAN!");
                }
            }
            throttle.apply(function(){
                var first5 = sha1hash.substr(0,5);
                var remainder = sha1hash.substr(5).toUpperCase();

                httpGET(apiURL + first5, function(response){
                    var lines = response.split('\n');
                    for(var i = 0; i < lines.length; ++i){
                        respHash = lines[i].split(':')[0];
                        if(respHash === remainder){
                            callbacks.Pwned();
                            return;
                        }
                    }
                    callbacks.Clean();
                });
            });
        },
        sha1:function(plaintext){
            var buffer = new TextEncoder("utf-8").encode(plaintext);
            return crypto.subtle.digest("SHA-1", buffer).then(function (hashbuffer) {
                var hexCodes = [];
                var padding = '00000000';
                var view = new DataView(hashbuffer);
                for (var i = 0; i < view.byteLength; i += 4) {
                    var value = view.getUint32(i);
                    var stringValue = value.toString(16);
                    var paddedValue = (padding + stringValue).slice(-padding.length);
                    hexCodes.push(paddedValue);
                }
                return hexCodes.join("");
            });
        }
    }   
}());
