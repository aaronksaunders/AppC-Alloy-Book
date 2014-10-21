Building Cross-Platform Apps using Titanium, Alloy, and Appcelerator Cloud Services
====
![Book Cover Image](http://ecx.images-amazon.com/images/I/519RGyDDVIL.jpg)
### Where to get the book

Book is available at 
* [Barnes & Noble](http://www.barnesandnoble.com/w/building-cross-platform-apps-using-titanium-alloy-and-appcelerator-cloud-services-aaron-saunders/1119684143?ean=9781118673256) 
* [Amazon](http://www.amazon.com/Building-Cross-Platform-Titanium-Appcelerator-Services/dp/1118673255)
* [Wiley](http://www.wiley.com/WileyCDA/WileyTitle/productCd-1118673255.html)

### Overview

This is a working application based on the code examples from the book.  A user can login/logout, see an activity feed and map, upload photos, and add friends.  ACS features include users, comments, friends, maps/locations, push notifications, and more.  Also note the use of Alloy, models, progress windows, and the ACS sync adapter.  

This repo of the source code will be updated to ensure the application functions on the latest version of Appcelerator Titanium Alloy. Please feel free to add issues and submit pull request where appropriate.

A few updates have already been made since the release of the book.  Check out this [blog post](http://www.clearlyinnovative.com/building-cross-platform-apps-using-titanium-alloy-appcelerator-cloud-services-released-kindle-code-updates/) for further details, or follow along the commit history.

As the materials in the repo begin to diverge from the original contents of the book we will create a branch so there will always remain the historical context of the application.

### Be Sure to Setup ACS

Setup your application in ACS and replace the following keys in tiapp.xml:

```
<property name="acs-oauth-secret-production" type="string"></property>
<property name="acs-oauth-key-production" type="string"></property>
<property name="acs-api-key-production" type="string"></property>
<property name="acs-oauth-secret-development" type="string"></property>
<property name="acs-oauth-key-development" type="string"></property>
<property name="acs-api-key-development" type="string"></property>
```

### Setup google maps API key

Refer to the "Obtain a Google Maps API key" section [here](https://developers.google.com/maps/documentation/android/start#getting_the_google_maps_android_api_v2) and replace the google maps API key in tiapp.xml:

```
<meta-data
android:name="com.google.android.maps.v2.API_KEY" android:value="..."/>
```


### CREATING HASH FOR ANDROID FACEBOOK SSO
```
$ keytool -v -exportcert -keystore "/Users/<your username>/Library/Application Support/Titanium/mobilesdk/osx/<3.4.0.GA or your version>/android/dev_keystore" -storepass tirocks -alias tidev > ./exportedtidevcert.txt
$ openssl sha1 -binary ./exportedtidevcert.txt  > ./exportedtidevcert_sha.txt
$ openssl enc -a -e < ./exportedtidevcert_sha.txt  > ./output.txt
```
