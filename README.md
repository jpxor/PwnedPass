# PwnedPass
PwnedPass is an easy to use js module for checking passwords against a set of known exposed passwords. This can be used client side to warn a user of insecure passwords. Exposed password data source: https://haveibeenpwned.com/Passwords

# Demo
Link to demo...

# Basic Usage
The check function accepts a plaintext password or an SHA-1 hash as its first parameter. A plaintext password will be hashed.
The second parameter is a callback for when a match is found. 

    // simple
    pwnedpass.check(password, function(){
        console.log("this password was found in the haveibeenpwned password data");
    });

# Extended Usage
Optionally, the second parameter can be an object with two callbacks: Pwned and Clean. 

    // multiple callbacks
    pwnedpass.check(password, {
        Pwned: function(){ console.log("this password was found in the haveibeenpwned password data"); },
        Clean: function(){ console.log("this password is clean"); },
    });

If a plaintext password resembles an SHA-1 hash, then it wont be hashed automatically. You need to specify the ForceHash value in the second parameter object. 

    // force sha1 hash of input
    pwnedpass.check(password, {
        ForceHash: true,
        Pwned: function(){ console.log("this password was found in the haveibeenpwned password data"); },
    });

# Contributing

# License