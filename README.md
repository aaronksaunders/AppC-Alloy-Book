Welcome to your Appcelerator Titanium Mobile Project
====

### Overview

### Be Sure to Setup ACS

### CREATING HASH FOR ANDROID FACEBOOK SSO
```
$ keytool -v -exportcert -keystore "/Users/aaronksaunders/Library/Application Support/Titanium/mobilesdk/osx/3.1.1.GA/android/dev_keystore" -storepass tirocks -alias tidev > ./exportedtidevcert.txt
$ openssl sha1 -binary ./exportedtidevcert.txt  > ./exportedtidevcert_sha.txt
$ openssl enc -a -e < ./exportedtidevcert_sha.txt  > ./output.txt
```
### Getting Google Maps & Android Cloud Push to play nice

https://jira.appcelerator.org/browse/TIMOB-14963

The work around was to remove the google play jar from ti.map module directory since the ti.cloudpush
module includes it already

#### Here is my work around

1. create plugin directory at root level of project
1. create folder structure `modules/android`
1. copy both the `ti.cloudpush` and `ti.map` from your default module directory.
    `/Users/[username]/Library/Application Support/Titanium/modules/android/`
1. copy the `google-play-services.jar` from the lib directory of one of the modules
 to the other so that they are both using the same version
1. adjust the version numbers of both modules by changing the version number in the 
 name of the directory
1. goto to `tiapp.xml` and selected the newly created versions of the modules
1. Clean Project & recompile application and you should be good to go


----------------------------------
Stuff our legal folk make us say: