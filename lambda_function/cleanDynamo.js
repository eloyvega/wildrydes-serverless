var assert = require('assert');
var AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const randomBytes = require("crypto").randomBytes;


exports.handler = function(event, context) {

    var codepipeline = new AWS.CodePipeline();
    
    // Retrieve the Job ID from the Lambda action
    var jobId = event["CodePipeline.job"].id;
    
    // Retrieve the value of UserParameters from the Lambda action configuration in AWS CodePipeline, in this case a URL which will be
    // health checked by this function.
    var url = event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters; 
    
    const rideId = toUrlString(randomBytes(16));
    
    // Notify AWS CodePipeline of a successful job
    var putJobSuccess = function(message) {
        var params = {
            jobId: jobId
        };
        codepipeline.putJobSuccessResult(params, function(err, data) {
            if(err) {
                context.fail(err);      
            } else {
                context.succeed(message);      
            }
        });
    };
    
    // Notify AWS CodePipeline of a failed job
    var putJobFailure = function(message) {
        var params = {
            jobId: jobId,
            failureDetails: {
                message: JSON.stringify(message),
                type: 'JobFailed',
                externalExecutionId: context.awsRequestId
            }
        };
        codepipeline.putJobFailureResult(params, function(err, data) {
            context.fail(message);      
        });
    };

  putItem()
    .then(() => {
      putJobSuccess("success")
    })
    .catch(err => {
      console.error(err);

      putJobFailure(err.message);
    });
    
};

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function putItem(rideId) {
    
  return ddb
    .put({
      TableName: process.env.dynamoTableName,
      Item: {
          RideId: makeid(10),
        value: "dummy"
      }
    })
    .promise();
}

function toUrlString(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}