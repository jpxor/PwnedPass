# Pwnedpass
Javascript module for checking passwords against a set of known exposed passwords. This can be used client side to warn a user of insecure passwords. Exposed password data source: https://haveibeenpwned.com/Passwords

# Sample

    <script src="pwnedpass.js"></script>
    <script>
        function CheckPass(password){                    
            pwnedpass.sha1(password).then(function(hash){
                pwnedpass.check(hash,
                {
                    Pwned:function(){infodiv.innerHTML = "This password is compromised";},
                    Clean:function(){infodiv.innerHTML = "This password is clean";}
                });
            });
        }
    </script>
See demo.html for full sample.

The check function is called with the sha1 hash and two callback functions grouped in an object. 
