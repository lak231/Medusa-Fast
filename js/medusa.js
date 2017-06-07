
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
        prepare_calibration();
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
* CALIBRATION AND VALIDATION
************************************/
var dots = [];
var currDot = 0;

/**
 * Prepare the calibration of task 1
 */
function prepare_calibration() {
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
    start_calibration();
}

/**
 * start the calibration process
 */
function start_calibration() {
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    delete_elem("instruction");
    draw_dot(context, dots[0], "#EEEFF7");
}

/**
 * Draw the dots for calibration and validation of task 1
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
            draw_dot(context, dots[currDot], "#EEEFF7");
        } else {
            delete_elem("canvas-overlay");
            finish_collection();
        }
    }
}

/************************************
 * SIMPLE DOT VIEWING PARADIGM
 * If you want to introduce your own paradigms, follow the same structure and extend the design array above.
 ************************************/
var tSimple = {};
tSimple.positions = [];
function simpleStart() {
    // if we don't have dot-positions any more, refill the array
    if (tSimple.positions.length == 0) {
        tSimple.positions = shuffle([
            {x: "20%", y: "20%"},
            {x: "50%", y: "20%"},
            {x: "80%", y: "20%"},
            {x: "20%", y: "50%"},
            {x: "80%", y: "50%"},
            {x: "20%", y: "80%"},
            {x: "50%", y: "80%"},
            {x: "80%", y: "80%"}
        ]);
    }
    var pos = tSimple.positions.pop();
    $('#stimuli_dot').css({
        'top': pos.y,
        'left': pos.x
    });
    data_current.task = 'simple';
    data_current.x = pos.x;
    data_current.y = pos.y;
    data_current.condition = 'dot_' + pos.x + '_' + pos.y;

    cam.recording = 1;
    setTimeout('$("#stimuli_fixation").hide(); status = "fixation_offset";', 1500);
    setTimeout('simpleShowdot();', 2000);
}

function simpleShowdot() {
    status = "stimulus_onset";
    $("#stimuli_dot").show();
    setTimeout('status = "stimulus_offset"; endTrial();',  2000);
}


/************************************
 * POSNER VIEWING PARADIGM
 ************************************/
function posnerStart() {
    var p = Math.random() >= 0.5 ? '&gt;&gt;&gt;' : '&lt;&lt;&lt;';
    $('#stimuli_prime').html(p);

    var t = Math.random() >= 0.5 ? 'X' : 'N';
    $('#stimuli_target').html(t);

    var cond = Math.random() >= 0.7 ? 'incongruent' : 'congruent';

    var tpos = 'left';
    if ((cond == 'incongruent' && p == '&lt;&lt;&lt;') || ((cond == 'congruent' && p == '&gt;&gt;&gt;'))) {
        tpos = 'right';
    }

    var pos = {};
    if (tpos == 'left') {
        pos.x = '20%';
        pos.y = '30%';
    } else {
        pos.x = '80%';
        pos.y = '30%';
    }


    $('#stimuli_target').css({
        'top': pos.x,
        'left': pos.y
    });


    data_current.task = 'posner';
    data_current.x = pos.x;
    data_current.y = pos.y;
    data_current.condition = 'posner_' + pos.x + '_' + pos.y + '_' + tpos;

    cam.recording = 1;
    setTimeout("$('#stimuli_fixation').hide();", 1000);
    setTimeout('posnerShowprime();', 1500);
}
 
function posnerShowprime() {
    $('#stimuli_prime').show();
    setTimeout("posnerShowTarget();", 300);
}

function posnerShowTarget() {
    $('#stimuli_prime').hide();
    $('#stimuli_target').show();
    setTimeout("endTrial();", 1500);
}


/************************************
 * SMOOTH PURSUIT PARADIGM
 ************************************/
var tPursuit = {};
function pursuitStart() {
    $('#stimuli_fixation').hide();
    var pos_possible = shuffle([
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
    ]);
    var pos = pos_possible[0];
    $s = $('#stimuli_dot');
    $s.css({
        'top': pos.y,
        'left': pos.x
    });

    $s.css({
        'background-color': '#000'
    });


    data_current.task = 'pursuit';
    data_current.x = pos.x;
    data_current.y = pos.y;
    data_current.condition = 'pursuit_' + pos.x + '_' + pos.y + '_' + pos.tx + '_' + pos.ty;

    cam.recording = 1;
    $s.show();
    setTimeout(function() {
        status = "pursuit_start";
        $('#stimuli_dot').css({
            'background-color': '#dd494b'
        }).animate({ "left": pos.tx, "top": pos.ty },
            2000,
            'linear',
        function() {
            status = "pursuit_end";
            setTimeout("endTrial();", 500);
        });
    }, 1500);
}



/************************************
 * FREE VIEWING PARADIGM
 ************************************/
var tFreeview = {};
tFreeview.stimuli = [];
function freeviewStart() {
    if (tFreeview.stimuli.length == 0) {
        for (var k = 1; k <= 30; k++) {
            if (k < 10) {
                tFreeview.stimuli.push("stimuli/tolcam_face_0" + k + ".png");
            } else {
                tFreeview.stimuli.push("stimuli/tolcam_face_" + k + ".png");
            }
        }
        tFreeview.stimuli = shuffle(tFreeview.stimuli);
    }
    var img = tFreeview.stimuli.pop();
    $('#stimuli_fixation').css({
        'top': '50%',
        'left': '50%'
    });
    var type = Math.random() >= 0.5 ? "left" : "right";

    $('#stimuli_img').css({
        "left": type == "left" ? "25%" : "75%",
        "width": "50%",
        "background-image": "url("+img+")"
    });


    data_current.task = 'freeviewing';
    data_current.x = $('#stimuli_img').css('left');
    data_current.y = "0%";
    data_current.condition = 'view_' + img + '_' + type;


    cam.recording = 1;
    setTimeout("$('#stimuli_fixation').hide(); status = 'fixation_offset';", 1000);
    setTimeout("freeviewShow();", 1500);
}

function freeviewShow() {
    status = 'stimulus_onset';
    $('#stimuli_img').show();
    setTimeout("status = 'stimulus_offset'; endTrial();", 3000);
}