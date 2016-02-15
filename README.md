# aws-sdk-s3-copyObject-bug

This repository contains the code to reproduce a bug with the `aws-sdk` library, specifically with the [`S3.copyObject()`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#copyObject-property) method.

The bug is due to `aws-sdk` incorrectly setting the request header for `x-amz-copy-source`. The [documentation](http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectCOPY.html#RESTObjectCOPY-requests) mandates that the header should follow the pattern `x-amz-copy-source: /source_bucket/sourceObject`. The header setted by `aws-sdk` misses the first forward-slash ('/').

In this repo there is a script that logs the request headers sent by call `S3.copyObject(...)`. As you'll notice, `x-amz-copy-source` will miss the initial forward-slash mentioned before.

## Steps to reproduce

### Install
Clone this repository and install its depedencies.

```
$ git clone https://github.com/Sparragus/aws-sdk-s3-copyObject-bug
$ cd aws-sdk-s3-copyObject-bug
$ npm install
```

### Execute
Use `npm start` to execute the main script and reproduce the bug.

```
$ npm start
```

### Results
You should expect to see a result similar to:

```
Headers
{
    "user-agent": "aws-sdk-nodejs/2.2.35 darwin/v5.3.0",
    "x-amz-copy-source": "EXAMPLE_BUCKET/example.png",
    "content-type": "application/octet-stream",
    "content-length": "0",
    "host": "localhost:23456",
    "x-amz-date": "Mon, 15 Feb 2016 19:32:28 GMT",
    "authorization": "AWS ACCESS_KEY_ID:OxONlB41mmWkBM5Pfe8ipTytLhw=",
    "connection": "close"
}
```

## Affected projects
There are affected projects by this inconsistency, [`jamhall/s3rver`](https://github.com/jamhall/s3rver) being one of them. Take a look at this code:
```js
// https://github.com/jamhall/s3rver/blob/master/lib/controllers.js#L265-L268
var copy = req.headers['x-amz-copy-source'];
if (copy) {
  var srcObjectParams = copy.split('/'),
      srcBucket = srcObjectParams[1],
      srcObject = srcObjectParams.slice(2).join('/');

```



It is expecting the initial '/', and therefore hoping to read the bucketName at `srcObjectParams[1]`. However, it is actually at `[0]`.

## Other notes
With all due respect to all developers and API documenters, the documentation needs to be more clear. In the same document where `x-amz-copy-source` is specified, there is conflicting descriptions. 

The 'Syntax' section of the [documentation](http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectCOPY.html#RESTObjectCOPY-requests) says: 

```
x-amz-copy-source: /source_bucket/sourceObject
```

However, in the 'Request Headers' section, the [documentation](http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectCOPY.html#RESTObjectCOPY-requests) says:

```
Name:
   x-amz-copy-source
Description:
   The name of the source bucket and key name of the source object, separated by a slash (/).
  
   Type: String

   Default: None
Required:
   Yes
```

So, which one should be followed?

  1. '/' + bucketName + '/' + keyName
  2. bucketName + '/' + keyName
