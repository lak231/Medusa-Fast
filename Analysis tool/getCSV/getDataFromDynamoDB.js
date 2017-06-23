var AWS = require("aws-sdk");
var fs = require('fs');
AWS.config.region = 'us-east-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
IdentityPoolId: 'us-east-2:3b25824a-8344-494d-99ee-91a2815b71a3',
RoleArn: "arn:aws:iam::790084491156:role/Cognito_MedusaUnauth_Role"
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var params = {
    TableName: "GAZE_DATA",
};
var i = 1;
var all_data = {};
function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        // print all the movies
        console.log("Scan succeeded.");
        data.Items.forEach(function(adata) {
           all_data[i] = adata;
           i++;
        });
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
        }
        else{
          process_data();
        }
    }
}

function process_data(){
  all_data = JSON.stringify(all_data);
  fs.writeFile('data.json', all_data, function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
});
}

docClient.scan(params, onScan);


