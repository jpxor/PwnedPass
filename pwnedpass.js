

// module for checking passwords against a set of known exposed passwords
var PwnedPass = (function () {


    //haveibeenpwned.com/Passwords
    var apiURL = "https://api.pwnedpasswords.com/range/";
    var GitHubSrc = "jpxor-pwnedpass.js";


    // Calls to haveibeenpwned should be rate limited
    var RateLimit = 2000; // ms
    var throttle = throttler(RateLimit);


    // A User-Agent HTTP header is required by haveibeenpwned 
    var UserAgent = GitHubSrc;


    // httpGET used to call haveibeenpwned API
    function httpGET(url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                callback(request.responseText);
            }
        }
        request.open("GET", url, true);
        request.setRequestHeader("User-Agent", UserAgent);
        request.send(null);
    }


    // isValidSHA1 allows us to check whether a 
    // password input is plaintext or sha-1 hash.
    function isValidSHA1(str) {
        const regex = /[a-fA-F0-9]{40}/g;
        return str.search(regex) >= 0;
    }


    // doSHA1 is used because we need the SHA-1 hash of a password
    function doSHA1(plaintext) {
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


    // cleanInput parses the input types and provides a single config object 
    // in the format accepted by the doCheck function. A promise is used solely
    // for the ability to write: "cleanInput(,).then(doCheck)".
    function cleanInput(first, second) {
        return new Promise(async function (resolve, error) {
            var config = {}

            if (!first || 'string' !== typeof first) {
                error("must provide password or SHA-1 hash as first parameter");
                return;
            }
            if (!second) {
                error("must provide callbacks as the second parameter");
                return;
            }

            if ('function' === typeof second) {
                config.Pwned = second;
                config.Clean = function () { };
            } else {
                config = second;
                if (!config.Pwned) { config.Pwned = function (count) { console.log("This password is compromised, frequency: " + count); } }
                if (!config.Clean) { config.Clean = function () { }; }
            }

            if (!isValidSHA1(first) || config.ForceHash) {
                config.SHA1Hash = await Promise.resolve(doSHA1(first));
            } else {
                config.SHA1Hash = first;
            }
            resolve(config);
        });
    }


    // doCheck calls the haveibeenpwned API and compares password hashes,
    // A throttler is applied because calls to the haveibeenpwned API should 
    // be limited to one per 2 seconds.
    function doCheck(config) {
        throttle.apply(function () {
            var first5 = config.SHA1Hash.substr(0, 5);
            var remainder = config.SHA1Hash.substr(5).toUpperCase();

            httpGET(apiURL + first5, function (response) {
                var lines = response.split('\n');

                for (var i = 0; i < lines.length; ++i) {
                    respSplit = lines[i].split(':');
                    respHash = respSplit[0];
                    if (respHash === remainder) {
                        config.Pwned(parseInt(respSplit[1]));
                        return;
                    }
                }
                config.Clean();
            });
        });
    }


    // exposed module functions
    return {
        setUserAgent: function (userAgent) {
            UserAgent = userAgent + "-via-" + GitHubSrc;
        },
        check: function (password, callbacks) {
            cleanInput(password, callbacks).then(doCheck).catch(console.error);
        }
    }
}());


//throttler module provided for rate limiting API calls
function throttler(period) {
    return (function () {

        var active = false
        var lastrun = 0;

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        return {
            apply: async function (targetfunc) {
                if (active) {
                    return
                } active = true;

                var now = new Date().getTime();
                var remainder = lastrun + period - now;

                if (remainder > 0) {
                    await sleep(remainder);
                }
                targetfunc();
                lastrun = new Date().getTime();
                active = false;
            }
        }
    }());
}


