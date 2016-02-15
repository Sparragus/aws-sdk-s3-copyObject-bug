var http = require('http')
var AWS = require('aws-sdk')

var port = 23456

var server = http.createServer(function (req, res) {
  console.log('Headers')
  console.log(JSON.stringify(req.headers, null, 4))
  res.end()
})

server.listen(port, function () {
  main()
})

function main () {
  var bucketName = 'EXAMPLE_BUCKET'

  var options = {
    region: 'us-east-1',
    s3ForcePathStyle: true,
    accessKeyId: 'ACCESS_KEY_ID',
    secretAccessKey: 'ACCESS_KEY_SECRET',
    endpoint: new AWS.Endpoint('http://localhost:' + port)
  }

  var s3 = new AWS.S3(options)

  s3.copyObject({
    CopySource: bucketName + '/' + 'example.png',
    Bucket: bucketName,
    Key: 'example.copy.png'
  }, function () {})
}
