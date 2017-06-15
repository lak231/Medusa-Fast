
/************************************
* CONSTANTS
************************************/
const TABLE_NAME = "Gazers"; // name of table in database
const DEFAULT_DOT_RADIUS = 25;
const SAMPLING_RATE = 1000;   // number of call to function once webgazer got data per second
const DATA_COLLECTION_RATE = 1000;    // number of data collected per second.

/************************************
* VARIABLES
************************************/
var gazer_id = "";  // id of user
var session_time = "";  // time of current webgazer session
// data variable. Used as a template for the type of data we send to the database. May add other attributes
var store_data = {
    url: "",   // url of website
    task: "",   // the current performing task
    canvasWidth: "",    // the width of the canvas
    canvasHeight: "",   // the height of the canvas
    caliration_position_array: [],  // the array of all calibration positions
    validation_position_array: [],  // the array of all validation positions
    simple_position_array: [],  // the array of all simple positions
    pursuit_position_array: [], // the array of all pursuit positions
    description: "",    // a description of the task. Depends on the type of task
    elapsedTime: [], // time since webgazer.begin() is called
    object_x: [], // x position of whatever object the current task is using
    object_y: [],    // y position of whatever object the current task is using
    gaze_x: [], // x position of gaze
    gaze_y: [] // y position of gaze
};

var time_stamp;  // current time. For functions that requires time delta for animation or controlling sampling rate.
var webgazer_time_stamp;    // time stamp. Used specifically to control the sampling rate of webgazer
var elem_array = [];    // array of elements gazed
var current_task = "instruction";    // current running task.
var curr_object = null;     // current object on screen. Can be anything. Used to check collision
var objects_array = [];    //array of dots
var num_objects_shown = 0; //number of objects shown
var paradigm = "simple";  // the paradigm to use for the test
var possible_paradigm = ["simple","pursuit","freeview","heatmap"];
var screen_timeout = 3000;
var cam_width = 320;
var cam_height = 240;
var background_color = "#D8CAA8";
var font_color = "#363942";
var dark_color = "#284907";
var light_color = "#5C832F";

/************************************
* CALIBRATION PARAMETERS
************************************/
var calibration_settings = {
    duration: 5,  // duration of a a singe position sampled
    method: "watch",    // calibration method, either watch or click.
    num_dots: 39,  // the number of dots used for calibration
    distance: 200,  // radius of acceptable gaze data around calibration dot
    position_array: [[0.2,0.2],[0.8,0.2],[0.2,0.5],[0.5,0.5],[0.8,0.5],[0.2,0.8],[0.5,0.8],[0.8,0.8],[0.35,0.35],[0.65,0.35],[0.35,0.65],[0.65,0.65],[0.5,0.2]]  // array of possible positions
};

/************************************
* VALIDATION PARAMETERS
************************************/
var validation_settings = {
    duration: 20000,  // duration of a a singe position sampled in ms
    num_dots: 10,  // the number of dots used for validation
    position_array: [[0.2,0.2],[0.8,0.2],[0.2,0.5],[0.5,0.5],[0.8,0.5],[0.2,0.8],[0.5,0.8],[0.8,0.8],[0.35,0.35],[0.65,0.35],[0.35,0.65],[0.65,0.65],[0.5,0.2]],  // array of possible positions
    // array of possible positions
    distance: 200,  // radius of acceptable gaze data around validation dot
    hit_count: 20,
    listener: false
};

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
* SIMPLE_PARADIGM PARAMETERS
************************************/
simple_paradigm_settings = {
    position_array:[[0.5,0.2],[0.8,0.2],[0.2,0.5],[0.8,0.5],[0.2,0.8],[0.5,0.8],[0.8,0.8]],
    num_trials: 5,
    target_show_time: 1500, // amount of time 'target' will appear on screen with each trial, in ms
    dot_show_time: 3000    // amount of time dot will appear on screen with each trial, in ms

};

/************************************
* PURSUIT_PARADIGM PARAMETERS
************************************/
pursuit_paradigm_settings = {
    position_array:[
        {x: "20%", y: "20%", tx: "80%", ty: "20%"},
        {x: "20%", y: "20%", tx: "20%", ty: "80%"},
        {x: "20%", y: "20%", tx: "80%", ty: "80%"},

        {x: "80%", y: "20%", tx: "20%", ty: "20%"},
        {x: "80%", y: "20%", tx: "20%", ty: "80%"},
        {x: "80%", y: "20%", tx: "80%", ty: "80%"},

        {x: "20%", y: "80%", tx: "20%", ty: "20%"},
        {x: "20%", y: "80%", tx: "80%", ty: "20%"},
        {x: "20%", y: "80%", tx: "80%", ty: "80%"},

        {x: "80%", y: "80%", tx: "20%", ty: "20%"},
        {x: "80%", y: "80%", tx: "80%", ty: "20%"},
        {x: "80%", y: "80%", tx: "20%", ty: "80%"}
    ],
    num_trials: 5,
    dot_show_time: 2000,
    target_show_time: 1500
};

/************************************
* FREEVIEW_PARADIGM PARAMETERS
************************************/
freeview_paradigm_settings = {
    num_trials: 5,
    image_show_time: 2000,
    target_show_time: 1500,
    image_array: [] //url array for images
};

/************************************
* COMMON FUNCTIONS
************************************/

/**
 * The only function needed to call when deploy. Simple call this function when you want to start up the program
 */
function start_medusa(parad){
    paradigm = (typeof parad !== "undefined") ? parad : "simple";
    if (!paradigm in possible_paradigm) {
        paradigm = "simple";
    }
    create_consent_form();    
}


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
 * Get the distance between two points with position (x1,y1) and (x2,y2)
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 */
function distance(x1,y1,x2,y2){
    var a = x1 - x2;
    var b = y1 - y2;
    return parseInt(Math.sqrt(a*a + b*b));
}

/**
 * create the overlay over the website
 * Creates overlay over website
 */
function create_overlay(){
    var canvas = document.createElement('canvas');
    canvas.id     = "canvas-overlay";
    canvas.addEventListener("mousedown", canvas_on_click, false);
    // style the newly created canvas
    canvas.style.zIndex   = 10;
    canvas.style.position = "fixed";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.backgroundColor = background_color;
    // add the canvas to web page
    window.addEventListener("resize", function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    document.body.appendChild(canvas);
}

/**
 * Clear content of canvas
 */
function clear_canvas () {
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Gets html element from a point
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
 * Deletes an element with id
 * @param {*} id - id of the element
 */
function delete_elem(id) {
    var elem = document.getElementById(id);
    if (elem){
        elem.parentNode.removeChild(elem);
    }
}

/**
 * Dot object
 * @param {*} x - x_coordinate of the center
 * @param {*} y - y_coordinate of the center
 * @param {*} r - radius
 */
var Dot = function (x, y, r) {
    r = (typeof r !== "undefined") ? r : DEFAULT_DOT_RADIUS;
    this.x = x;
    this.y = y;
    this.r = r;
    this.left = x - r;
    this.top = y - r;
    this.right = x + r;
    this.bottom = y + r;
    this.hit_count = 0;
};

/**
 * Creates an array of dots from an array of positions, then shuffles it
 * @param {*} pos_array - array of positions
 * @param {*} radius - the radius of the dots
 * @return{*} dot_array - the array of dots
 */
function create_dot_array(pos_array, radius){
    var canvas = document.getElementById("canvas-overlay");
    radius = (typeof radius !== "undefined") ? radius : DEFAULT_DOT_RADIUS;
    var dot_array = [];
    for (var dot_pos in pos_array){
        dot_array.push(new Dot(canvas.width * pos_array[dot_pos][0], canvas.height * pos_array[dot_pos][1], radius));
    }
    dot_array = shuffle(dot_array);
    return dot_array;
}

/**
 * Draws a dot
 * @param {*} context - context of canvas
 * @param {*} dot - the Dot object
 * @param {*} color - color of the dot
 */
function draw_dot(context, dot, color) {
    if (current_task === "calibration") {
        time_stamp = new Date().getTime();
        draw_dot_countdown(context, dot, color);
    } else if (current_task === "validation") {
        draw_dot_countup(context, dot, color);
    } else{
        context.beginPath();
        context.arc(dot.x, dot.y, dot.r, 0, 2*Math.PI);
        context.strokeStyle = color;
        context.fillStyle = color;
        context.fill();
    }
}

function draw_track(context, dot, color) {
    context.beginPath();
    context.arc(dot.x, dot.y, dot.r, 0, 2*Math.PI);
    context.strokeStyle = color;
    context.lineWidth = 1;
    context.stroke();
}

function draw_dot_countup(context, dot, color) {
    clear_canvas();

    //base circle
    draw_track(context, dot, color);

    //animated circle
    context.lineWidth = 7;
    context.beginPath();
    context.strokeStyle = color;
    context.arc(
        dot.x,
        dot.y,
        dot.r,
        Math.PI/-2,
        (Math.PI * 2) * (dot.hit_count / validation_settings.hit_count) + Math.PI/-2,
        false
    );
    context.stroke();

    //draw countup number
    context.font = "20px Source Sans Pro";
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(dot.hit_count.toString(), dot.x, dot.y);
}

function draw_dot_countdown(context, dot, color) {
    var time = new Date().getTime();
    var delta = time - time_stamp;
    var arc_len = delta * Math.PI * 2 / (1000 * calibration_settings.duration);
    clear_canvas();
    //base circle
    draw_track(context, dot, color);
    //animated circle
    context.lineWidth = 7;
    context.beginPath();
    context.strokeStyle = color;
    context.arc(
        dot.x,
        dot.y,
        dot.r,
        Math.PI/-2,
        Math.PI * 3/2-arc_len,
        false
    );
    context.stroke();

    //draw countdown number
    context.font = "20px Source Sans Pro";
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(calibration_settings.duration - Math.floor(delta / 1000), dot.x, dot.y);
    //animation
    request_anim_frame(function () {
        if (delta >= calibration_settings.duration * 1000) {
            create_new_dot_calibration();
            return;
        }
        draw_dot_countdown(context, dot, color);
    });
}

/**
 * reset the data sent to server. Should be called after each step to reduce the amount of data needed 
 * to send to server each time. 
 */
function reset_store_data(){
     store_data = {
    url: "",   // url of website
    task: "",   // the current performing task
    description: "",    // a description of the task. Depends on the type of task
    elapsedTime: [], // time since webgazer.begin() is called
    object_x: [], // x position of whatever object the current task is using
    object_y: [],    // y position of whatever object the current task is using
    gaze_x: [], // x position of gaze
    gaze_y: [] // y position of gaze
};

}
/**
 * Checks if an object collides with a mouse click
 * @param {*} mouse 
 * @param {*} object 
 */
function collide_mouse(mouse, object) {
    return (mouse.x < object.right && mouse.x > object.left && mouse.y > object.top && mouse.y < object.bottom);
}

/**
 * Handles clicks on canvas
 * @param {*} event 
 */
function canvas_on_click(event) {
    var canvas = document.getElementById("canvas-overlay");
    var x = event.x;
    var y = event.y;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    var mouse = {x:x,y:y};
    if (collide_mouse(mouse, curr_object) === false) return;
    // switch(current_task) {
    // case "calibration":
    //     if (calibration_settings.method === 'click'){
    //         create_new_dot_calibration();
    //     }
    //     break;
    // case "validation":
    //     if (validation_settings.method === 'click'){
    //         create_new_dot_validation();
    //     }
    //     break;
    // }
}

/**
 * A backward compatibility version of request animation frame
 * @author http://www.html5canvastutorials.com/advanced/html5-canvas-animation-stage/
 */
window.request_anim_frame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
      })();

window.cancel_anim_frame = (function() {
    return window.cancelCancelRequestAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        window.clearTimeout;
})();

/**
 * draw a target in the middle of the screen
 */
function draw_target() {
    clear_canvas();
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    var midX = canvas.width*0.5;
    var midY = canvas.height*0.5;
    context.strokeStyle = font_color;
    context.lineWidth = 5;
    //draw horizontal line
    context.beginPath();
    context.moveTo(midX - 15, midY);
    context.lineTo(midX + 15, midY);
    context.stroke();
    //draw vertical line
    context.beginPath();
    context.moveTo(midX, midY - 15);
    context.lineTo(midX, midY + 15);
    context.stroke();
}

/************************************
* MAIN FUNCTIONS
************************************/
/**
 * Creates unique ID from time + RNG. Loads the ID from local storage if it's already there.
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
 * Loads Webgazer. Once loaded, starts the collect data procedure
 */
function load_webgazer() {
    $.getScript("js/webgazer.js")
        .done(function( script, textStatus ) {
            initiate_webgazer();
        })  
        .fail(function( jqxhr, settings, exception ) {
            $( "div.log" ).text( "Triggered ajaxError handler." );
        });
}

/**
 * Starts WebGazer and collects data
 */
function initiate_webgazer(){
    webgazer_time_stamp = 0;
    webgazer.clearData()
        .setRegression('ridge') 
  	    .setTracker('clmtrackr')
        .setGazeListener(function(data, elapsedTime) {        
            if (data === null) return;          
            if (elapsedTime - webgazer_time_stamp < 1000 / SAMPLING_RATE) return;
            else if (current_task === "validation"){
                validation_event_handler(data);
            }
            if (current_task === "calibration"){
                 webgazer.addWatchListener(curr_object.x, curr_object.y);
            }
            if (elapsedTime - webgazer_time_stamp < 1000 / DATA_COLLECTION_RATE) return;
            webgazer_time_stamp = elapsedTime;
            store_data.elapsedTime.push(elapsedTime);
            store_data.gaze_x.push(data.x);
            store_data.gaze_y.push(data.y);
            store_data.object_x.push(curr_object.x);
            store_data.object_y.push(curr_object.y);
        })
    	.begin()
        .showPredictionPoints(true); /* shows a square every 100 milliseconds where current prediction is */
    // setInterval(function(){ record_gaze_location() }, 1000);
    check_webgazer_status();
}

/**
 * Checks if webgazer is successfully initiated. If yes, then start carrying out tasks.
 */
function check_webgazer_status() {
    if (webgazer.isReady()) {
        console.log('webgazer is ready.');
        // Create database
        createID();
        create_calibration_instruction(); 
        create_gazer_database_table();
    } else {
        setTimeout(check_webgazer_status, 100);
    }
}

/**
 * Creates data table in the database if it hasn't already existed
 */
function create_gazer_database_table() {
    var params = {
        TableName : TABLE_NAME,
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
 * Sends data to database. necessary data are collected before sending. 
 * Some data are set along the calculation.
 */
function send_data_to_database(callback){
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    store_data.url  = window.location.href;
    store_data.canvasWidth = canvas.width;
    store_data.canvasHeight = canvas.height;
    store_data.caliration_position_array = calibration_settings.position_array;
    store_data.validation_position_array = validation_settings.position_array;
    store_data.simple_position_array = simple_paradigm_settings.position_array;
    store_data.pursuit_position_array = pursuit_paradigm_settings.position_array;
    console.log(store_data);
    var params = {
        TableName :TABLE_NAME,
        Item: {
            "gazer_id": gazer_id,
            "time_collected":session_time,
            "info":store_data
        }
    };
    docClient.put(params, function(err, data) {
        reset_store_data();
        if (err) {
            console.log("Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2));
        } else {
            console.log("PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2));   
            store_data.object_x = [];
            store_data.object_y = [];
            store_data.gaze_x = [];
            store_data.gaze_y = [];
            if (typeof callback !== "undefined") {
                callback();         
            }
        }
    });
}

/************************************
* CALIBRATION
************************************/
/**
 * Shows consent form before doing calibration
 */
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

                                "<button class=\"form__button\" type=\"button\" onclick=\"load_webgazer() \">Next ></button>" +
                            "</form>";
    form.style.zIndex = 11;
    document.body.appendChild(form);
}

/**
 * Shows calibration instruction
 */
function create_calibration_instruction() {
     if ($("#consent-yes").is(':checked')) {
        var instruction = document.createElement("div");
        delete_elem("consent_form");
        instruction.id = "instruction";
        instruction.className += "overlay-div";
        instruction.style.zIndex = 12;
        instruction.innerHTML += "<header class=\"form__header\">" +
                                    "<h2 class=\"form__title\">Thank you for participating. </br> Instruction blah blah blah.</h2>" +
                                "</header>" +
                                "<button class=\"form__button\" type=\"button\" onclick=\"start_calibration()\">Start ></button>";
        document.body.appendChild(instruction);
        show_video_feed();
    }
 
}

/**
 * Start the calibration
 */
function start_calibration() {
    var gazeDot = document.getElementById("gazeDot");
    gazeDot.style.zIndex = 14;
    gazeDot.style.display = "block";
    hide_face_tracker();
    webgazer.resume();
    session_time = (new Date).getTime().toString();
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    clear_canvas();
    delete_elem("instruction");    
    current_task = 'calibration';
    store_data.task = current_task;
    store_data.description = calibration_settings.method;
    create_new_dot_calibration();
}

/**
 * Create a new dot for calibration
 */
function create_new_dot_calibration(){
    if (num_objects_shown >= calibration_settings.num_dots) {
        finish_calibration();
        return;
    }
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    clear_canvas();
    // if run out of dots, create a new dots array
    if (objects_array.length === 0) {
        objects_array = create_dot_array(calibration_settings.position_array);
    }
    curr_object = objects_array.pop();
    webgazer.addWatchListener(curr_object.x, curr_object.y);
    time_stamp = new Date().getTime();
    draw_dot(context, curr_object, dark_color);
    num_objects_shown++;
}

/**
 * Triggered once the calibration process finishes. Clean up things and go on to next step
 */
function finish_calibration(){
    objects_array = [];
    num_objects_shown = 0;
    store_data.current_task = "calibration";
    webgazer.pause();
    send_data_to_database(create_validation_instruction);
}

/************************************
* VALIDATION
************************************/
function create_validation_instruction() {
    clear_canvas();
    var instruction = document.createElement("div");
    instruction.id = "instruction";
    instruction.className += "overlay-div";
    instruction.style.zIndex = 12;
    instruction.innerHTML += "<header class=\"form__header\">" +
        "<h2 class=\"form__title\">Validation...</h2>" +
        "</header>";
    document.body.appendChild(instruction);
    setTimeout(function() {
        start_validation();
    }, screen_timeout);
}

/**
 * Prepares validation process
 */
function start_validation(){
    clear_canvas();
    delete_elem("instruction");
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    current_task = 'validation';
    store_data.description = validation_settings;
    webgazer.resume();
    create_new_dot_validation();
    var gazeDot = document.getElementById("gazeDot");
    gazeDot.style.zIndex = 14;
    gazeDot.style.display = "block";
}

/**
 * Create new dots for validation
 */
function create_new_dot_validation(){
    if (num_objects_shown >= validation_settings.num_dots) {
        finish_validation(true);
        return;
    }
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    clear_canvas();
    // if run out of dots, create a new dots array
    if (objects_array.length === 0) {
        objects_array = create_dot_array(validation_settings.position_array);
    }
    curr_object = objects_array.pop();
    draw_dot(context, curr_object, dark_color);
    webgazer.addWatchListener(curr_object.x, curr_object.y);
    validation_settings.listener = true;
    time_stamp = new Date().getTime();
    num_objects_shown++;
}

/**
 * Handler for 'watch' procedure. 
 * @param {*} data 
 */
function validation_event_handler(data) {
    if (validation_settings.listener === false) {return}
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    var dist = distance(data.x,data.y,curr_object.x,curr_object.y);
    if (dist < validation_settings.distance) {
        if (curr_object.hit_count <= validation_settings.hit_count) {
            draw_dot(context, curr_object, dark_color);
            curr_object.hit_count += 1;
        } else {
            create_new_dot_validation();
        }
    }
    else{
        var now = new Date().getTime();
        if (now - time_stamp > validation_settings.duration){
            finish_validation(false);
        }
    }
}

/**
 * Triggered when validation ends
 */
function finish_validation(succeed){
    validation_settings.listener = false;
    var gazeDot = document.getElementById("gazeDot");
    gazeDot.style.display = "none";
    success = (typeof succeed !== "undefined") ? succeed : true;
    objects_array = [];
    num_objects_shown = 0;
    store_data.task = "validation";
    webgazer.pause();
    if (succeed === false) {
        store_data.description = "fail";
        send_data_to_database(create_validation_fail_screen);
        
    }
    else{
        store_data.description = "success";
        create_validation_success_screen();
        setTimeout( function () {
            switch (paradigm){
                case "simple":
                    send_data_to_database(loop_simple_paradigm);
                    break;
                case "pursuit":
                    send_data_to_database(loop_pursuit_paradigm);
                    break;
                case "freeview":
                    send_data_to_database(create_validation_fail_screen());
                    break;
                case "heatmap":
                    send_data_to_database(create_validation_fail_screen());
                default:
                    start_heatmap_paradigm();
            }
        }, screen_timeout);
    }
}

function create_validation_fail_screen() {
    clear_canvas();
    var instruction = document.createElement("div");
    instruction.id = "instruction";
    instruction.className += "overlay-div";
    instruction.style.zIndex = 12;
    instruction.innerHTML += "<header class=\"form__header\">" +
        "<h2 class=\"form__title\">Validation failed. </br> Restarting calibration.</h2>" +
        "</header>";
    document.body.appendChild(instruction);
    setTimeout(function() {
        start_calibration();
    }, screen_timeout);
}

function create_validation_success_screen() {
    clear_canvas();
    var instruction = document.createElement("div");
    instruction.id = "instruction";
    instruction.className += "overlay-div";
    instruction.style.zIndex = 12;
    instruction.innerHTML += "<header class=\"form__header\">" +
        "<h2 class=\"form__title\">Task...</h2>" +
        "</header>";
    document.body.appendChild(instruction);
    setTimeout(function() {
        delete_elem("instruction");
    }, screen_timeout);
}

/************************************
 * SIMPLE DOT VIEWING PARADIGM
 * If you want to introduce your own paradigms, follow the same structure and extend the design array above.
 ************************************/
function loop_simple_paradigm() {
    // if we don't have dot-positions any more, refill the array
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    webgazer.resume();
    clear_canvas();
    current_task = 'simple_paradigm';
     if (objects_array.length === 0) {
        objects_array = create_dot_array(simple_paradigm_settings.position_array);
    }
    curr_object = objects_array.pop();
    num_objects_shown ++;
    if (num_objects_shown > simple_paradigm_settings.num_trials) {
        finish_simple_paradigm();
    }
    else{
        draw_target();
        setTimeout(function(){clear_canvas(); draw_dot(context, curr_object, dark_color);},simple_paradigm_settings.target_show_time);
        setTimeout("loop_simple_paradigm();",simple_paradigm_settings.dot_show_time);
    }
}

function finish_simple_paradigm(){
    objects_array = [];
    num_objects_shown = 0;
    store_data.task = "simple";
    store_data.description = "success";
    send_data_to_database(create_survey);
    webgazer.pause();
    // create_survey();
}

/************************************
 * SMOOTH PURSUIT PARADIGM
 ************************************/
function loop_pursuit_paradigm() {
     if (num_objects_shown >= pursuit_paradigm_settings.num_trials) {
        finish_pursuit_paradigm();
    }
    // if we don't have dot-positions any more, refill the array
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    webgazer.resume();
    clear_canvas();
    current_task = 'pursuit_paradigm';
    if (objects_array.length === 0) {
        objects_array = shuffle(pursuit_paradigm_settings.position_array);
        for (var i=0; i < objects_array.length; i++) {
        objects_array[i].x = canvas.width * parseFloat(objects_array[i].x) / 100.0;
        objects_array[i].tx = canvas.width * parseFloat(objects_array[i].tx) / 100.0;
        objects_array[i].y = canvas.height * parseFloat(objects_array[i].y) / 100.0;
        objects_array[i].ty = canvas.height * parseFloat(objects_array[i].ty) / 100.0;
        }
    }
    curr_object = objects_array.pop();
    curr_object.cx = curr_object.x;
    curr_object.cy = curr_object.y;
    num_objects_shown ++;
    var dot = {
        x: curr_object.cx,
        y: curr_object.cy,
        r: DEFAULT_DOT_RADIUS
    };
    draw_dot(context, dot, light_color);
    setTimeout( function () {
        time_stamp = null;
        draw_moving_dot();
    }, pursuit_paradigm_settings.target_show_time);

}

function draw_moving_dot(){
    var now = new Date().getTime(), dt = now - (time_stamp || now);
    time_stamp = now;
    var angle = Math.atan2(curr_object.ty - curr_object.y, curr_object.tx - curr_object.x);
    var dist_per_frame = distance(curr_object.x,curr_object.y,curr_object.tx,curr_object.ty) /pursuit_paradigm_settings.dot_show_time * dt;
    var x_dist_per_frame = Math.cos(angle) * dist_per_frame;
    var y_dist_per_frame = Math.sin(angle) * dist_per_frame;
    curr_object.cx = curr_object.cx + x_dist_per_frame;
    curr_object.cy = curr_object.cy + y_dist_per_frame;
    var dot = {
        x: curr_object.cx,
        y: curr_object.cy,
        r: DEFAULT_DOT_RADIUS
    };
    if (distance(curr_object.cx,curr_object.cy,curr_object.tx,curr_object.ty) < 20){
        loop_pursuit_paradigm();
    }
    else{
        var canvas = document.getElementById("canvas-overlay");
        var context = canvas.getContext("2d");      
        clear_canvas();
        draw_dot(context, dot, light_color);
        webgazer.addWatchListener(curr_object.cx, curr_object.cy);
        request_anim_frame(draw_moving_dot);    
    }
}

function finish_pursuit_paradigm(){
    objects_array = [];
    num_objects_shown = 0;
    store_data.task = "pursuit";
    store_data.description = "success";
    send_data_to_database(create_survey);
    webgazer.pause();
}

/************************************
 * FREE VIEWING PARADIGM
 ************************************/
function loop_freeview_paradigm() {
    var canvas = document.getElementById("canvas-overlay");
    current_task = "freeview_paradigm";
    webgazer.resume();
    clear_canvas();
    if (objects_array.length === 0) {
        objects_array = shuffle(freeview_paradigm_settings.image_array);
    }
    curr_object = objects_array.pop();
    num_objects_shown ++;
    if (num_objects_shown > freeview_paradigm_settings.num_trials) {
        end_freeview_paradigm();
    } else {
        draw_target();
        setTimeout("draw_freeview_image();", freeview_paradigm_settings.target_show_time);
        setTimeout("loop_freeview_paradigm();", freeview_paradigm_settings.image_show_time);
    }

}

function draw_freeview_image(pos) {
    var pos = Math.random() >= 0.5 ? "left" : "right";
    clear_canvas();
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    if (pos === "left") {
        context.drawImage(curr_object, 0.25*width, 0.25*height);
    } else {
        context.drawImage(curr_object, 0.75*width, 0.25*height);
    }
}

function end_freeview_paradigm() {
    objects_array = [];
    num_objects_shown = 0;
    //TODO
}

/************************************
 * HEATMAP PARADIGM
 ************************************/
function start_heatmap_paradigm(){
    //TODO: 
}

function end_heatmap_paradigm(){
    //TODO: 
}


/************************************
 * WAITING FOR REFRACTORING
 ************************************/

function create_survey() {
    var survey = document.createElement("div");
    delete_elem("consent_form");
    survey.id = "survey";
    survey.className += "overlay-div";
    survey.style.zIndex = 12;
    survey.innerHTML += "<select required>" +
                            "<option value=\"\" disabled selected>Question 1</option>" +
                        "</select>" +
                        "</br>" +
                        "<select required>" +
                            "<option value=\"\" disabled selected>Question 1</option>" +
                        "</select>" +
                        "</br>" +
                        "<select required>" +
                        "<option value=\"\" disabled selected>Question 1</option>" +
                        "</select>" +
                        "</br>" +
                        "<button class=\"form__button\" type=\"button\"> Next > </button>";
      document.body.appendChild(survey);

}

function show_video_feed () {
    var video = document.getElementById('webgazerVideoFeed');
    video.style.display = 'block';
    video.style.position = 'absolute';
    video.style.top = "50%";
    video.style.left = "calc(50% - " + (cam_width/2).toString() + "px)";
    video.width = cam_width;
    video.height = cam_height;
    video.style.margin = '0px';
    video.style.zIndex = 13;

    webgazer.params.imgWidth = cam_width;
    webgazer.params.imgHeight = cam_height;

    var overlay = document.createElement('canvas');
    overlay.id = 'face_tracker';
    overlay.style.position = 'absolute';
    overlay.width = cam_width;
    overlay.height = cam_height;
    overlay.style.top = "50%";
    overlay.style.left = "calc(50% - " + (cam_width/2).toString() + "px)";
    overlay.style.margin = '0px';
    overlay.style.zIndex = 14;

    document.body.appendChild(overlay);

    draw_face_tracker();
}


function draw_face_tracker() {
    if (current_task !== "instruction") {
        return;
    }
    requestAnimFrame(draw_face_tracker);
    var overlay = document.getElementById('face_tracker');
    var cl = webgazer.getTracker().clm;
    overlay.getContext('2d').clearRect(0,0, cam_width, cam_height);
    if (cl.getCurrentPosition()) {
        cl.draw(overlay);
    }
}

function hide_face_tracker() {
    delete_elem("face_tracker");
    var video = document.getElementById('webgazerVideoFeed');
    video.style.display = "None";

}