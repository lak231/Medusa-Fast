
//global var


/************************************
* COLLECTION VARIABLES
************************************/
// name of table in database
const tableName = "Gazers";
// id of current user.
var gazer_id = "";
// url of the current website
var cur_url = "";
// time stamp of this session
var time = "";
// task number
var task = 1;
var x_array = [];
var y_array = [];


/************************************
* SETTING UP AWS
************************************/
AWS.config.region = 'us-east-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
IdentityPoolId: IdentityPoolId ,
RoleArn: RoleArn
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();


/************************************
* HELPER FUNCTIONS
************************************/
/**
 * Shuffles array in place.
 * @param array items The array containing the items.
 * @author http://stackoverflow.com/a/2450976/4175553
 */
    function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/**
 * Dot object
 * @param {*} x - x_coordinate of the center
 * @param {*} y - y_coordinate of the center
 * @param {*} r - radius
 */
var Dot = function (x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.left = x - r;
    this.top = y - r;
    this.right = x + r;
    this.bottom = y + r;
};

/************************************
* MAIN FUNCTIONS
************************************/

/**
 * record gaze location into x and y arrays. Used to control sample rate
 * otherwise, collect_data() will collect data at maximum sample rate
 */
function record_gaze_location(){
    var prediction = webgazer.getCurrentPrediction();
    if (prediction) {
        x_array.push(prediction.x);
        y_array.push(prediction.y);
    }
}

/**
 * Create unique ID from time + RNG. Load the ID from local storage if it's already there.
 */
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

/**
 * Load Webgazer. Once loaded, start the collect data procedure
 * @author 
 */
function load_webgazer() {
    $.getScript( "js/webgazer.js" )
        .done(function( script, textStatus ) {
            initiate_webgazer();
        })
        .fail(function( jqxhr, settings, exception ) {
            $( "div.log" ).text( "Triggered ajaxError handler." );
        });
}

/**
 * start WebGazer and collect data
 */
function initiate_webgazer(){
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
    check_webgazer_status();
}

/**
 * Check if webgazer successfully initiated.
 */
function check_webgazer_status() {
    if (webgazer.isReady()) {
        console.log('webgazer is ready.');
        // Create database
        create_gazer_database_table();
    } else {
        setTimeout(check_webgazer_status, 100);
    }
}

/**
 * Create data table in the database if haven't already exists
 */
function create_gazer_database_table() {
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

/**
 * send data to server
 * @param {*} data - the type of data to be sent to server. 
 */
function send_data_to_database(data = {"url": cur_url, "gaze_x": x_array, "gaze_y":y_array}){ 
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


/**
 * Navigate to a specific task. Task is selected with the task variable. 
 */
function task_navigation(){
    if (task === 1){
        prepare_calibration_1();
    }
}


/************************************
* HTML PREP FUNCTIONS
* functions which interact with the html files.
************************************/

// create the overlay for calibration and validation
function create_overlay(){
    var canvas = document.createElement('canvas');
    canvas.id     = "canvas-overlay";
    canvas.addEventListener("mousedown", dotEvent, false);
    // style the newly created canvas
    canvas.style.zIndex   = 10;
    canvas.style.position = "fixed";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.backgroundColor = "#1c1d21";
    // add the canvas to web page
    document.body.appendChild(canvas);
}


// show the consent form before doing calibration
function create_consent_form() {
    // hide the background and create canvas
    create_overlay();
    var form = document.createElement("div");
    form.id = "consent_form";
    form.className += "overlay-div";
    form.innerHTML +=
                            "<header class=\"form__header\">" +
                                "<h2 class=\"form__title\">Are you cool with us using your webcam to collect data about your eye movement?</h2>" +
                            "</header>" +

                            "<form>" +
                                "<fieldset class=\"form__options\">" +
                                    "<p class=\"form__answer\">" +
                                        "<input name=\"consent\" type=\"radio\" id=\"consent-yes\" value=\"yes\">" +
                                        "<label for=\"consent-yes\"> Yeah sure. </br>" +
                                                                    "I'm cool with that."+
                                        "</label>" +
                                    "</p>" +

                                    "<p class=\"form__answer\">" +
                                        "<input name=\"consent\" type=\"radio\" id=\"consent-no\" value=\"no\">" +
                                        "<label for=\"consent-no\">No thanks. </br>" +
                                                                "That sounds creepy..." +
                                        "</label>" +
                                    "</p>" +
                                "</fieldset>" +

                                "<button class=\"form__button\" type=\"button\" onclick=\"create_calibration_instruction() \">Next ></button>" +
                            "</form>";
    form.style.zIndex = 11;
    document.body.appendChild(form);
}

// show the calibration instruction 
function create_calibration_instruction() {
     
    var instruction = document.createElement("div");
    instruction.id = "instruction";
    instruction.className += "overlay-div";
    instruction.style.zIndex = 12;
    instruction.innerHTML += "<header class=\"form__header\">" +
                                "<h2 class=\"form__title\">Thank you for participating. </br> Please click at the dots while looking at them.</h2>" +
                             "</header>" +
                             "<button class=\"form__button\" type=\"button\" onclick=\"task_navigation()\">Start ></button>";
    document.body.appendChild(instruction);
}

// clear all the canvas
function clear_canvas () {
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Get html element from a point
 * @param {*} x - x_coordinate of point
 * @param {*} y - y_coordinate of point
 */
function get_elements_seen(x,y){
    var element = document.elementFromPoint(x, y);
    if (element in elem_array ){
        elem_array[element] = elem_array[element] + 1
    }
    else{
        elem_array[element] = 1
       
    }
}

/**
 * Delete an element with id
 * @param {*} name - id the of element
 */
function delete_elem(id) {
    var elem = document.getElementById(id);
    elem.parentNode.removeChild(elem);
}

/************************************
* TASK 1 - WEBSITE GAZING POSITION
* Collect gazing data on the website, then draw the heatmap of gazing positions. Include points and html elements
* Has calibration, validation and data collection.
************************************/
var dots = [];
var currDot = 0;

/**
 * Prepare the calibration of task 1
 */
function prepare_calibration_1() {
    if ($("#consent-yes").is(':checked')) {
        var canvas = document.getElementById("canvas-overlay");
        delete_elem("consent_form");
        currDot = 0;
        dots = shuffle([
            new Dot(canvas.width * 0.2, canvas.height * 0.2, 10),
            new Dot(canvas.width * 0.8, canvas.height * 0.2, 10),
            new Dot(canvas.width * 0.2, canvas.height * 0.5, 10),
            new Dot(canvas.width * 0.5, canvas.height * 0.5, 10),
            new Dot(canvas.width * 0.8, canvas.height * 0.5, 10),
            new Dot(canvas.width * 0.2, canvas.height * 0.8, 10),
            new Dot(canvas.width * 0.5, canvas.height * 0.8, 10),
            new Dot(canvas.width * 0.8, canvas.height * 0.8, 10),
            new Dot(canvas.width * 0.35, canvas.height * 0.35, 10),
            new Dot(canvas.width * 0.65, canvas.height * 0.35, 10),
            new Dot(canvas.width * 0.35, canvas.height * 0.65, 10),
            new Dot(canvas.width * 0.65, canvas.height * 0.65, 10),
            new Dot(canvas.width * 0.5, canvas.height * 0.2, 10)
        ]);
    }
    start_calibration_1();
}

/**
 * start the calibration process
 */
function start_calibration_1() {
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    delete_elem("instruction");
    draw_dot_1(context, dots[0], "#EEEFF7");
}

/**
 * Draw the dots for calibration and validation of task 1
 * @param {*} context - context of canvas
 * @param {*} dot - the Dot object
 * @param {*} color - color of the dot
 */
function draw_dot_1(context, dot, color) {
    context.beginPath();
    context.arc(dot.x, dot.y, dot.r, 0, 2*Math.PI);
    context.fillStyle = color;
    context.fill();
}

function dotEvent(event) {
    var x = event.x;
    var y = event.y;
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    if (x < dots[currDot].right && x > dots[currDot].left && y > dots[currDot].top && y < dots[currDot].bottom) {
        clear_canvas();
        console.log("dot clicked");
        if (currDot !== dots.length - 1) {
            currDot += 1;
            draw_dot_1(context, dots[currDot], "#EEEFF7");
        } else {
            delete_elem("canvas-overlay");
            finish_collection();
        }
    }
}

/************************************
* TASK 2 - TASK-BASED TEST
* Collect data based on specific tasks and tests. 
* Has calibration and validation 
************************************/

