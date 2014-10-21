Building Cross-Platform Apps using Titanium, Alloy, and Appcelerator Cloud Services
====
![Book Cover Image](http://ecx.images-amazon.com/images/I/519RGyDDVIL.jpg)
### Where to get the book

Book is available at 
* [Barnes & Noble](http://www.barnesandnoble.com/w/building-cross-platform-apps-using-titanium-alloy-and-appcelerator-cloud-services-aaron-saunders/1119684143?ean=9781118673256) 
* [Amazon](http://www.amazon.com/Building-Cross-Platform-Titanium-Appcelerator-Services/dp/1118673255)
* [Wiley](http://www.wiley.com/WileyCDA/WileyTitle/productCd-1118673255.html)

### Overview
This repo of the source code will be updated to ensure the application functions on the latest version of Appcelerator Titanium Alloy. Please feel free to add issues and submit pull request where appropriate.

As the materials in the repo begin to diverge from the original contents of the book we wil create a branch so there will always remain the historical context of the application.

### Be Sure to Setup ACS

### CREATING HASH FOR ANDROID FACEBOOK SSO
```
$ keytool -v -exportcert -keystore "/Users/aaronksaunders/Library/Application Support/Titanium/mobilesdk/osx/3.1.1.GA/android/dev_keystore" -storepass tirocks -alias tidev > ./exportedtidevcert.txt
$ openssl sha1 -binary ./exportedtidevcert.txt  > ./exportedtidevcert_sha.txt
$ openssl enc -a -e < ./exportedtidevcert_sha.txt  > ./output.txt
```
