
/**
 * Save webgazer data to csv.
 */
function save_to_csv(){
    var data = [];
    data.push(store_data.elapsedTime, store_data.gaze_x,store_data.gaze_y,store_data.object_x,store_data.object_y);
    var csv_content = "data:text/csv;charset=utf-8,";
    data.forEach(function(infoArray, index){
        dataString = infoArray.join(",");
        csv_content += index < data.length ? dataString+ "\n" : dataString;
    });
    el = encodeURI(csv_content);
    el.setAttribute("href", "data:"+data);
    el.setAttribute("download", iframe_link + ".csv");
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
    switch(current_task) {
    case "calibration":
        if (calibration_settings.method === 'click'){
            create_new_dot_calibration();
        }
        break;
    case "validation":
        if (validation_settings.method === 'click'){
            create_new_dot_validation();
        }
        break;
    }
}

/************************************
 * IFRAME
 ************************************/
/**
 * iframe containment. Create an iframe to contain another website
 */
function create_iframe_testable(){
    var iframe = document.createElement("iframe");
    iframe.source = iframe_link;
    iframe.id = "iframe";
    var innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
    document.appendChild(iframe);
}


/************************************
 * IFRAME PARADIGM
 * If you want to introduce your own paradigms, follow the same structure and extend the design array above.
 ************************************/

/**
 * Create an iframe to contain other websites, and then monitor the usage of the websites
 */
function loop_iframe_paradigm(){
    var canvas = document.getElementById("canvas-overlay");
    var context = canvas.getContext("2d");
    collect_data = true;
    webgazer.resume();
    clear_canvas();
    current_task = "iframe";
}

function finish_iframe_paradigm(){
    objects_array = [];
    num_objects_shown = 0;
    store_data.task = iframe_link;
    store_data.description = "success";
    webgazer.pause();
    collect_data = false;
    send_gaze_data_to_database(navigate_tasks);
}