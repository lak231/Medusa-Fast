
//global var
var dots = [];
var currDot = 0;
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

// delete the overlay used for calibration and validation

function create_form() {
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

                                "<button class=\"form__button\" type=\"button\" onclick=\"create_calibration()\">Next ></button>" +
                            "</form>";
    form.style.zIndex = 11;
    document.body.appendChild(form);
}

function delete_elem(name) {
    var elem = document.getElementById(name);
    elem.parentNode.removeChild(elem);
}
function create_calibration() {
    if ($("#consent-yes").is(':checked')) {
        var canvas = document.getElementById("canvas-overlay");
        delete_elem("consent_form");
        set_calibration_instruction();
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
}

function set_calibration_instruction() {
    var instruction = document.createElement("div");
    instruction.id = "instruction";
    instruction.className += "overlay-div";
    instruction.style.zIndex = 12;
    instruction.innerHTML += "<header class=\"form__header\">" +
                                "<h2 class=\"form__title\">Thank you for participating. </br> Please click at the dots while looking at them.</h2>" +
                             "</header>" +
                             "<button class=\"form__button\" type=\"button\" onclick=\"start_calibration()\">Start ></button>";
    document.body.appendChild(instruction);
}

function start_calibration() {
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    delete_elem("instruction");
    draw_dot(context, dots[0], "#EEEFF7");
    // initiate data collection process
    collect_data();
    // create a table in the server
    createGazersTable();
}
function draw_dot(context, dot, color) {
    context.beginPath();
    context.arc(dot.x, dot.y, dot.r, 0, 2*Math.PI);
    context.fillStyle = color;
    context.fill();
}

var Dot = function (x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.left = x - r;
    this.top = y - r;
    this.right = x + r;
    this.bottom = y + r;
};

function clear_canvas () {
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
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