Building Cross-Platform Apps using Titanium, Alloy, and Appcelerator Cloud Services
====
![Book Cover Image](http://ecx.images-amazon.com/images/I/519RGyDDVIL.jpg)
### Overview

### Be Sure to Setup ACS

### CREATING HASH FOR ANDROID FACEBOOK SSO
```
$ keytool -v -exportcert -keystore "/Users/aaronksaunders/Library/Application Support/Titanium/mobilesdk/osx/3.1.1.GA/android/dev_keystore" -storepass tirocks -alias tidev > ./exportedtidevcert.txt
$ openssl sha1 -binary ./exportedtidevcert.txt  > ./exportedtidevcert_sha.txt
$ openssl enc -a -e < ./exportedtidevcert_sha.txt  > ./output.txt
```
