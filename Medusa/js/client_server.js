

// setting up AWS configurations
AWS.config.region = 'us-east-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
IdentityPoolId: 'us-east-2:3b25824a-8344-494d-99ee-91a2815b71a3',
RoleArn: "arn:aws:iam::790084491156:role/Cognito_MedusaUnauth_Role"
});
// initiate AWS
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

// constants 
const tableName = "Gazers";
var gazer_id = "";
var cur_url = "";
var time = "";
var x_array = [];
var y_array = [];

// Create unique id from time + RNG
function createID() {
    // check if there is a gazer_id already stored
    if (typeof(Storage) !== "undefined") {
        console.log(localStorage.getItem("gazer_id"));
        if (localStorage.getItem("gazer_id") !== null){
            gazer_id = localStorage.getItem("gazer_id");
        }
        else{
            gazer_id = "id-"+((new Date).getTime().toString(16)+Math.floor(1E7*Math.random()).toString(16));
            localStorage.setItem("gazer_id", gazer_id);
        }
    } 
    else{
        gazer_id = "id-"+((new Date).getTime().toString(16)+Math.floor(1E7*Math.random()).toString(16));
    }
}

// record gaze location into an array
function record_gaze_location(){
    var prediction = webgazer.getCurrentPrediction();
    if (prediction) {
        x_array.push([prediction.x]);
        y_array.push([prediction.y]);
    }
}

// start WebGazer and collect data
function collect_data(){
    createID();
    cur_url = window.location.href;
    time = (new Date).getTime().toString();
    webgazer.setRegression('ridge') 
  	    .setTracker('clmtrackr')
        .setGazeListener(function(data, elapsedTime) {
            if (data == null) {
                return;
            }
            x_array.push([data.x]);
            y_array.push([data.y]);
        })
    	.begin()
    // setInterval(function(){ record_gaze_location() }, 1000);
    
}



// Create data table
function createGazersTable() {
    var params = {
        TableName : tableName,
        KeySchema: [
            { AttributeName: "gazer_id", KeyType: "HASH"},
            { AttributeName: "time_collected", KeyType: "RANGE" }  //Sort key
        ],
        AttributeDefinitions: [       
            { AttributeName: "gazer_id", AttributeType: "S" },              
            { AttributeName: "time_collected", AttributeType: "S" }
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.log("Unable to create table: " + "\n" + JSON.stringify(err, undefined, 2));
        } else {
            console.log("Created table: " + "\n" + JSON.stringify(data, undefined, 2));
        }
    });
}

// create data form and push to database
function sendGazerToServer() {
    var params = {
        TableName :tableName,
        Item:{
            "gazer_id": gazer_id,
            "time_collected":time,
            "info":{
                "url": cur_url,
                "gaze_x": x_array,
                "gaze_y":y_array
            }
        }
    };
    docClient.put(params, function(err, data) {
        if (err) {
            console.log("Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2));
        } else {
            console.log("PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2));
        }
    });
}
function finish_collection(){
    // end web gazer 
    webgazer.end(); 
    // send data to server
    sendGazerToServer();
}

window.onbeforeunload = function(event){
        return confirm("Confirm refresh");
};

