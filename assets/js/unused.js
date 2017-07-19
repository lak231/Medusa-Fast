
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



function create_pikachu_img(){
    var img_content = new Image();
    img_content.src = "../assets/images/gif/sprite/infernape.png";
    img_content.onload = function () {
    var img = {
        'content': img_content,    
        'current_frame': 0,
        'total_frames': 133,
        'width': 80,
        'height': 73,
        'x': 0,
        'y': 0,
        'render_rate': 1,
        'render_count': 0
        };
        pikachu_img = img
    }
}

// function create_img_array () {
//     var width = 0;
//     var width_array = [];
//     var height = 0;
//     var height_array = [];
//     var big_img_width_array = [];
//     var total_frames = 0;
//     var total_frames_array = [];
//     var curr_sprite_array = [];
//     var original_img;
//     var img;
//     var img_content;
//     switch(calibration_settings.current_round) {
//         case 1:
//             curr_sprite_array = calibration_sprite_1;
//             break;
//         case 2:
//             curr_sprite_array = calibration_sprite_2;
//             break;
//         case 3:
//             curr_sprite_array = calibration_sprite_2;
//             break;
//         default:
//             curr_sprite_array = calibration_sprite_1;
//             break;
//     }

//     for (i = 0; i < curr_sprite_array.length; i ++) {
//         original_img = new Image();
//         original_img.src = "../assets/images/gif/" + calibration_current_round.toString() + "/" + curr_sprite_array[num_objects_shown] + ".gif";
//         original_img.onload = function () {
//             img_content = new Image();
//             img_content.src = "../assets/images/gif/sprite/" + curr_sprite_array[num_objects_shown] + ".png";
//             img_content.onload = function () {
//                 img = {
//                     'content': img_content,
//                     'current_frame': 0,
//                     'total_frames': img_content.width/original_img.width,
//                     'width': original_img.width,
//                     'height': original_img.height,
//                     'x': 0,
//                     'y': 0,
//                     'render_rate': 3,
//                     'render_count': 0
//                 };
//                 img_array.push(img);
//             };
//         };
//     }
// }


  sprite_array_1 : ['bulbasaur', 'charmander', 'chikorita', 'chimchar', 'cyndaquil', 'mudkip', 'pikachu', 'piplup', 'squirtle', 'torchic', 'totodile', 'treecko', 'turtwig'],
    sprite_array_2: ['bayleef', 'charmeleon', 'combusken', 'croconaw', 'grotle', 'grovyle', 'ivysaur', 'marshtomp', 'monferno', 'pikachu', 'prinplup', 'quilava', 'wartortle'],
    sprite_array_3: ['blastoise', 'blaziken', 'charizard', 'empoleon', 'feraligatr', 'infernape', 'meganium', 'pikachu', 'sceptile', 'swampert', 'torterra', 'typhlosion', 'venusaur']


function draw_gif(context, img) {
    var time = new Date().getTime();
    var delta = time - time_stamp;
    clear_canvas();
    if (img.render_count === img.render_rate - 1) {
        img.current_frame = (img.current_frame + 1) % img.total_frames;
    }
    img.render_count = (img.render_count + 1) % img.render_rate;
    img.onload = context.drawImage(img.content, img.current_frame * img.width, 0,
        img.width, img.height,
        img.x - img.width / 2, img.y - img.height / 2, img.width, img.height);

    //animation
    request_anim_frame(function () {
        if (delta >= calibration_settings.duration * 1000) {   
            if (num_objects_shown === Math.floor(calibration_settings.num_dots / 3) ||num_objects_shown === Math.floor(calibration_settings.num_dots *2 / 3))  {
                heatmap_data_x = store_data.gaze_x.slice(0);
                heatmap_data_y = store_data.gaze_y.slice(0);
                clear_canvas();
                calibration_current_round += 1;
                draw_heatmap("create_calibration_break_form");
                return;
            }
            else{
                create_new_dot_calibration();
                return;
            }
        }
        draw_gif(context, img);
    });
}

