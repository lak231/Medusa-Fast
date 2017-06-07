

// setting up AWS configurations
AWS.config.region = 'us-east-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
IdentityPoolId: IdentityPoolId ,
RoleArn: RoleArn
});
// initiate AWS
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

// constants 
const tableName = "Gazers";
// variable
var gazer_id = "";
var cur_url = "";
var time = "";
var elem_array = {};
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

// record gaze location into x and y arrays. Used to control sample rate
// otherwise, collect_data() will collect data at maximum sample rate
function record_gaze_location(){
    var prediction = webgazer.getCurrentPrediction();
    if (prediction) {
        x_array.push(prediction.x);
        y_array.push(prediction.y);
    }
}

// Load Webgazer Once load, start the collect data procedure
function loadWebgazer() {
    $.getScript( "js/webgazer.js" )
        .done(function( script, textStatus ) {
            collect_data();
        })
        .fail(function( jqxhr, settings, exception ) {
            $( "div.log" ).text( "Triggered ajaxError handler." );
        });
}

// start WebGazer and collect data
function collect_data(){
    createID();
    cur_url = window.location.href;
    time = (new Date).getTime().toString();
    webgazer.clearData()
        .setRegression('ridge') 
  	    .setTracker('clmtrackr')
        .setGazeListener(function(data, elapsedTime) {
            if (data == null) {
                return;
            }
            x_array.push(data.x);
            y_array.push(data.y);
            get_elements_seen(data.x,data.y);
        })
    	.begin()
        .showPredictionPoints(false); /* shows a square every 100 milliseconds where current prediction is */
    // setInterval(function(){ record_gaze_location() }, 1000);
    checkWebgazer();
}

// Check Webgazer
function checkWebgazer() {
    if (webgazer.isReady()) {
        console.log('webgazer is ready.');
        // Create database
        createGazersTable();
    } else {
        setTimeout(checkWebgazer, 100);
    }
}

// Create data table in the database if haven't already exists
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
function sendGazerToServer(data = {"url": cur_url, "gaze_x": x_array, "gaze_y":y_array}){ 
    var params = {
        TableName :tableName,
        Item: {
            "gazer_id": gazer_id,
            "time_collected":time,
            "info":data
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

// clean up webgazer and send data to server. Must call once the validation ends
function finish_collection(){
    // end web gazer 
    // webgazer.end(); 
    // send data to server
    sendGazerToServer();
}

// get element from point
function get_elements_seen(x,y){
    var element = document.elementFromPoint(x, y);
    if (element in elem_array ){
        elem_array[element] = elem_array[element] + 1
    }
    else{
        elem_array[element] = 1
       
    }
}
  

