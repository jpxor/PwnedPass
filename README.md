# PwnedPass
PwnedPass is an easy to use js module for checking passwords against a set of known exposed passwords from past data breaches. This can be used client side to warn a user of insecure passwords. Exposed password data provided by https://haveibeenpwned.com/Passwords. 

<p align="center"> 
<img src="https://github.com/jpxor/pwnedpass/blob/master/images/sample.png">
</p>

## Demo
View live demo on [jsfiddle](https://jsfiddle.net/jpxor/edpg1dxc/10/).

## Basic Usage
The check function accepts a plaintext password or an SHA-1 hash as its first parameter. A plaintext password will be hashed.
The second parameter is a callback for when a match is found. 
```javascript
    PwnedPass.check(password, function(){
        console.log("this password was found in the haveibeenpwned password data");
    });
```
## Extended Usage
Optionally, the second parameter can be an object with two callbacks: Pwned and Clean. 
```javascript
    // multiple callbacks
    PwnedPass.check(password, {
        Pwned: function(){ console.log("this password was found in the haveibeenpwned password data"); },
        Clean: function(){ console.log("this password is clean"); },
    });
```
If a plaintext password resembles an SHA-1 hash, then it wont be hashed automatically. You need to specify the ForceHash value in the second parameter object. 
```javascript
    // force sha1 hashing of input
    PwnedPass.check(password, {
        ForceHash: true,
        Pwned: function(){ console.log("this password was found in the haveibeenpwned password data"); },
    });
```
## Browser Compatibility
The SHA-1 hashing relies on crypto.subtle (Specification status: Recommended). See its [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle#Browser_compatibility). If this does not suit your needs, you can 
use another solution to perform the hash, then provide PwnedPass with an SHA-1 hash instead of a plaintext password.

TextEncoder is also used for performing the SHA-1 hashing. See [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder/TextEncoder#Browser_compatibility). As of this writing, it is not broadly supported, but there is a polyfill here: [Polyfill for the Encoding Living Standard's API](https://github.com/inexorabletash/text-encoding).

Some other JS features used (click for browser compatibility): [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#Browser_compatibility),   [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/async_function#Browser_compatibility)

## Contributing
If you have feature requests or bug reports, feel free to help out by sending pull requests or by creating new issues.

## License
PwnedPass is distributed under the terms and conditions of the MIT license. 
The "Have I Been Pwned?" Data and API is licensed under a Creative Commons Attribution 4.0 International License.
