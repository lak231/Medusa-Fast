
/************************************
* CONSTANTS
************************************/
const TABLE_NAME = "Gazers"; // name of table in database
const DEFAULT_DOT_RADIUS = 10;
const SAMPLING_RATE = 300;   //number of data collected per second.

/************************************
* VARIABLES
************************************/
var gazer_id = "";  // id of user
var time = "";  // time of current webgazer session
// data variable. Used as a template for the type of data we send to the database. May add other attributes
var store_data = {
    url: "",   // url of website
    task: "",   // the current performing task
    description: "",    // a description of the task. Depends on the type of task
    elapsedTime: [], // time since webgazer.begin() is called
    object_x: [], // x position of whatever object the current task is using
    object_y: [],    // y position of whatever object the current task is using
    gaze_x: [], // x position of gaze
    gaze_y: [] // y position of gaze
};

var time_stamp;  // current time. For functions that requires time delta for animation or controlling sampling rate.
var elem_array = [];    // array of elements gazed
var current_task = "calibration";    // current running task.
var curr_object = null;     // current object on screen. Can be anything. Used to check collision
var objects_array = [];    //array of dots
var num_objects_shown = 0; //number of objects shown
var paradigm = "pursuit";  // the paradigm to use for the test

/************************************
* CALIBRATION PARAMETERS
************************************/
var calibration_settings = {
    duration: 20,  // duration of a a singe position sampled
    num_dots: 2,  // the number of dots used for calibration
    distance: 200,  // radius of acceptable gaze data around calibration dot
    position_array: [[0.2,0.2],[0.8,0.2],[0.2,0.5],[0.5,0.5],[0.8,0.5],[0.2,0.8],[0.5,0.8],[0.8,0.8],[0.35,0.35],[0.65,0.35],[0.35,0.65],[0.65,0.65],[0.5,0.2]]  // array of possible positions
};

/************************************
* VALIDATION PARAMETERS
************************************/
var validation_settings = {
    duration: 5000,  // duration of a a singe position sampled in ms
    num_dots: 2,  // the number of dots used for validation
    position_array: [[0.2,0.2],[0.8,0.2],[0.2,0.5],[0.5,0.5],[0.8,0.5],[0.2,0.8],[0.5,0.8],[0.8,0.8],[0.35,0.35],[0.65,0.35],[0.35,0.65],[0.65,0.65],[0.5,0.2]],  // array of possible positions
    // array of possible positions
    distance: 200,  // radius of acceptable gaze data around validation dot
    hit_count: 20
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
    dot_show_time: 2000,     // amount of time dot will appear on screen with each trial, in ms
    target_show_time: 1500 // amount of time 'target' will appear on screen with each trial, in ms
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
    canvas.style.backgroundColor = "#1c1d21";
    // add the canvas to web page
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
    elem.parentNode.removeChild(elem);
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
    context.beginPath();
    context.arc(dot.x, dot.y, dot.r, 0, 2*Math.PI);
    context.fillStyle = color;
    context.fill();
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


/**
 * draw a target in the middle of the screen
 */
function draw_target() {
    clear_canvas();
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    var midX = canvas.width*0.5;
    var midY = canvas.height*0.5;
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
    time_stamp = 0;
    webgazer.clearData()
        .setRegression('ridge') 
  	    .setTracker('clmtrackr')
        .setGazeListener(function(data, elapsedTime) {
            if (data === null) return;          
            if (current_task === "calibration"){
                calibration_event_handler(data);
            }
            else if (current_task === "validation"){
                validation_event_handler(data);
            }
            if (elapsedTime - time_stamp < 1000 / SAMPLING_RATE) return;      
            time_stamp = elapsedTime;
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
        store_data.url  = window.location.href;
        time = (new Date).getTime().toString();
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
 * Sends data to server
 */
function send_data_to_database(){
    var params = {
        TableName :TABLE_NAME,
        Item: {
            "gazer_id": gazer_id,
            "time_collected":time,
            "info":store_data
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

/**
 * Cleans up webgazer and sends data to server
 * Must call once validation ends
 */
function end_experiment(){
    // end web gazer 
    // webgazer.end(); 
    // send data to server
    sendGazerToServer();
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
                                    "<h2 class=\"form__title\">Thank you for participating. </br> Please click at the dots while looking at them.</h2>" +
                                "</header>" +
                                "<button class=\"form__button\" type=\"button\" onclick=\"start_calibration()\">Start ></button>";
        document.body.appendChild(instruction);    
    }
 
}

/**
 * Start the calibration
 */
function start_calibration() {
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
    draw_dot(context, curr_object, "#EEEFF7");
    num_objects_shown++;
}

/**
 * Handler for 'watch' procedure. 
 * @param {*} data 
 */
function calibration_event_handler(data) {
    var dist = distance(data.x,data.y,curr_object.x,curr_object.y);
    if (dist < calibration_settings.distance) {
        if (curr_object.hit_count < calibration_settings.duration) {
            curr_object.hit_count += 1;
        } else {
            create_new_dot_calibration();
        }
    }
}

/**
 * Triggered once the calibration process finishes. Clean up things and go on to next step
 */
function finish_calibration(){
    objects_array = [];
    num_objects_shown = 0;
    send_data_to_database();
    start_validation();
}

/************************************
* VALIDATION
************************************/
/**
 * Prepares validation process
 */
function start_validation(){
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    clear_canvas();
    objects_array = [];
    num_objects_shown = 0;
    current_task = 'validation';
    store_data.task = current_task;
    store_data.description = validation_settings;
    create_new_dot_validation();
}

/**
 * Create new dots for validation
 */
function create_new_dot_validation(){
    time_stamp = new Date().getTime();
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
    draw_dot(context, curr_object, "#FFFFFF");
    webgazer.addWatchListener(curr_object.x, curr_object.y);
    time_stamp = new Date().getTime();
    num_objects_shown++;
}

/**
 * Handler for 'watch' procedure. 
 * @param {*} data 
 */
function validation_event_handler(data) {
    var dist = distance(data.x,data.y,curr_object.x,curr_object.y);
    if (dist < validation_settings.distance) {
        if (curr_object.hit_count < validation_settings.hit_count) {
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
    current_task = "task_" + paradigm;
    success = (typeof succeed !== "undefined") ? succeed : true;
    objects_array = [];
    num_objects_shown = 0;
    if (succeed === false) {
        store_data.description = "fail"
        send_data_to_database();
        
    }
    else{
        store_data.description = "success";
        send_data_to_database();
        switch (paradigm){
            case "simple":
                start_simple_paradigm();
                break;
            case "pursuit":
                start_pursuit_paradigm();
                break;
            case "freeview":
                start_freeview_paradigm();
                break;
            case "heatmap":
                start_heatmap_paradigm();
            default:
                start_heatmap_paradigm();
        }
    }
}

/************************************
 * SIMPLE DOT VIEWING PARADIGM
 * If you want to introduce your own paradigms, follow the same structure and extend the design array above.
 ************************************/
function start_simple_paradigm() {
    // if we don't have dot-positions any more, refill the array
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    clear_canvas();
    current_task = 'simple_paradigm';
     if (objects_array.length === 0) {
        objects_array = create_dot_array(simple_paradigm_settings.position_array);
    }
    curr_object = objects_array.pop();
    num_objects_shown ++;
    if (num_objects_shown > simple_paradigm_settings.num_trials) {
        end_simple_paradigm();
    }
    else{
        draw_target();
        setTimeout(function(){clear_canvas(); draw_dot(context, curr_object, "#EEEFF7");},simple_paradigm_settings.target_show_time);
        setTimeout("start_simple_paradigm();",simple_paradigm_settings.dot_show_time);
    }
}
function end_simple_paradigm(){
    //TODO: finish this function
    objects_array = [];
    num_objects_shown = 0;
}

/************************************
 * SMOOTH PURSUIT PARADIGM
 ************************************/
function start_pursuit_paradigm() {
    // if we don't have dot-positions any more, refill the array
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    clear_canvas();
    current_task = 'pursuit_paradigm';
    if (objects_array.length === 0) {
        objects_array = shuffle(pursuit_paradigm_settings.position_array);
    }
    curr_object = objects_array.pop();
    curr_object.cx = curr_object.x;
    curr_object.cy = curr_object.y;
    num_objects_shown ++;
    if (num_objects_shown > pursuit_paradigm_settings.num_trials) {
        end_pursuit_paradigm();
    }
}


function draw_moving_dot(){
    var now = new Date().getTime(),
        dt = now - (time_stamp || now);
    time_stamp = now;
    var angle = Math.atan2(curr_object.ty - curr_object.y, curr_object.tx - curr_object.x);
    var dist_per_frame = distance(curr_object.x,curr_object.y,curr_object.tx,curr_object.ty) /pursuit_paradigm_settings.dot_show_time * dt;
    var x_dist_per_frame = Math.cos(angle) * dist_per_frame;
    var y_dist_per_frame = Math.sin(angle) * dist_per_frame;
    curr_object.cx = cx + x_dist_per_frame;
    curr_object.cy = xy + y_dist_per_frame;
    var dot = {
        x: curr_object.cx,
        y: curr_object.cy,
        r: DEFAULT_DOT_RADIUS
    };
    if (((curr_object.tx - curr_object.x)/(curr_object.tx - curr_object.cx) < 0) || ((curr_object.ty - curr_object.y)/(curr_object.ty - curr_object.cxy < 0))){
        end_pursuit_paradigm();
    }
    else{
        var canvas = document.getElementById("canvas-overlay");
        var context = canvas.getContext("2d");
        clear_canvas();
        draw_dot(context, dot, "#EEEFF7");
        request_anim_frame(draw_moving_dot);    
    }
    draw_dot(context, dot, "#EEEFF7"); 
}

function end_pursuit_paradigm(){
    //TODO: 
    objects_array = [];
    num_objects_shown = 0;
}

/************************************
 * FREE VIEWING PARADIGM
 ************************************/
function start_freeview_paradigm() {
    var canvas = document.getElementById("canvas-overlay");
    current_task = "freeview_paradigm";
    clear_canvas();
    var pos = Math.random() >= 0.5 ? "left" : "right";
    if (objects_array.length === 0) {
        objects_array = shuffle(freeview_paradigm_settings.image_array);
    }
    curr_object = objects_array.pop();
    num_objects_shown ++;
    if (num_objects_shown > freeview_paradigm_settings.num_trials) {
        end_freeview_paradigm();
    } else {
        draw_target();
        setTimeout("draw_freeview_image(pos);", freeview_paradigm_settings.target_show_time);
        setTimeout("start_freeview_paradigm();", freeview_paradigm_settings.image_show_time);
    }

}

function draw_freeview_image(pos) {
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
