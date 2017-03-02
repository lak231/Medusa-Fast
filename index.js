      WebFont.load({
        google: {
          families: ['Roboto Slab']
        }
      });

// do the lines
      //declare constants and variables
      var canvas = document.getElementById('headline');
      var context = canvas.getContext('2d') ;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width =  canvas.width;
      canvas.style.height = canvas.height;
      var size_percent = 0.25;
      var BUTTON_WIDTH = canvas.height * size_percent;
      var BUTTON_HEIGHT = canvas.height * size_percent;
      var MAIN_SIZE_RATIO = 1.1;
      var SUB_SIZE_RATIO = 0.9;
      var main_button = null;
      var top_left_button = null;
      var top_right_button = null;
      var bottom_left_button = null;
      var bottom_right_button = null;

      //the resize event
      function resize() {
        var width = window.innerWidth;
        var ratio = 0.25;
        var height = width * ratio;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width+'px';
        canvas.style.height = height+'px';
        BUTTON_WIDTH = height * size_percent;
        BUTTON_HEIGHT = height *  size_percent;
        for (var i in buttons){
          buttons[i].resize();
        }
      }
      window.addEventListener('load', resize, false);
      window.addEventListener('resize', resize, false);

      //the click event on object
      canvas.addEventListener('click', function(event){
        var x = event.pageX;
        var y = event.pageY;
        buttons.forEach(function(element) {
       if (y > element.y && y < element.y + element.height * 1.2
           && x > element.x && x < element.x + element.width * 1.2) {
           alert('clicked an element');
       }
   });
      });
      //button prototype
      function button(x,y,name){
        this.name = name;
        this.x_per = x;
        this.y_per = y;
        this.x_center = canvas.width * this.x_per / 100;
        this.y_center = canvas.height * this.y_per / 100;
        this.x = this.x_center- this.width/2;
        this.y = this.y_center- this.height/2;
        this.is_main = false;
        this.size_ratio = SUB_SIZE_RATIO;
        this.width = BUTTON_WIDTH * this.size_ratio;
        this.height = BUTTON_HEIGHT * this.size_ratio;

        this.degree = 0;
        this.rotation_speed = 0.002 + Math.PI/360 * Math.random();

        this.make_main = function(){
          this.is_main = true;
          this.size_ratio = MAIN_SIZE_RATIO;
          main_button = this;
        }

        this.change_position = function(x,y){
          this.x_per = x;
          this.y_per = y;
          this.x_center = canvas.width * this.x_per / 100;
          this.y_center = canvas.height * this.y_per / 100;
          this.x = this.x_center- this.width/2;
          this.y = this.y_center- this.height/2;
        }

        this.resize = function(){
          this.width = BUTTON_WIDTH * this.size_ratio;
          this.height = BUTTON_HEIGHT * this.size_ratio;
          this.x_center = canvas.width * this.x_per / 100;
          this.y_center = canvas.height * this.y_per / 100;
          this.x = this.x_center- this.width/2;
          this.y = this.y_center- this.height/2;

        }
        //draw the button
        this.draw = function(x,y){
          context.clearRect(x,y,this.width,this.height);
          context.beginPath();
          context.moveTo(x, y+this.height / 8);
          context.lineTo(x,y + 3 * this.height/8 );
          context.lineTo(x-this.width/8,y + 4 * this.height/8);
          context.lineTo(x,y + 5 * this.height/8 );
          context.lineTo(x,y + 7 * this.height/8 );
          context.lineTo(x+this.width/8,y + 7/8*this.height);
          context.lineTo(x+this.width/8,y + this.height);
          context.lineTo(x+this.width * 3/8, y + this.height);
          context.lineTo(x+this.width*4/8,y+this.height*9/8);
          context.lineTo(x+this.width * 5/8, y + this.height);
          context.lineTo(x+this.width * 7/8, y + this.height);
          context.lineTo(x+this.width * 7/8, y + this.height * 7/8);
          context.lineTo(x+this.width,y + this.height * 7/8);
          context.lineTo(x+this.width, y + this.height * 5/8);
          context.lineTo(x+this.width * 9/8, y+this.height * 4/8);
          context.lineTo(x+this.width, y+this.height * 3/8);
          context.lineTo(x+this.width,y+this.height * 1/8);
          context.lineTo(x+this.width * 7/8,y+this.height * 1/8);
          context.lineTo(x+this.width * 7/8,y);
          context.lineTo(x+this.width * 5/8, y);
          context.lineTo(x+this.width*4/8,y-this.height*1/8);
          context.lineTo(x+this.width*3/8,y);
          context.lineTo(x+this.width*1/8,y);
          context.lineTo(x+this.width * 1/8,y+this.height * 1/8);
          context.lineTo(x,y+this.height * 1/8);
          context.moveTo(x+this.width/16,y + this.height/16);
          context.lineTo(x+this.width * 6/16,y + this.height * 1/16);
          context.moveTo(x+this.width * 10/16,y + this.height * 1/16);
          context.lineTo(x+this.width * 15/16,y+this.height * 1/16);
          context.lineTo(x+this.width * 15/16,y + this.height * 6/16);
          context.moveTo(x+this.width * 15/16,y + this.height * 10/16);
          context.lineTo(x+this.width*15/16,y+this.height * 15/16);
          context.lineTo(x+this.width * 10/16,y + this.height * 15/16);
          context.moveTo(x+this.width * 6/16,y + this.height * 15/16);
          context.lineTo(x + this.width * 1/16, y + this.height * 15/16);
          context.lineTo(x + this.width * 1/16, y + this.height * 10/16);
          context.moveTo(x + this.width * 1/16, y + this.height * 6/16);
          context.lineTo(x+this.width/16,y + this.height/16);
          context.stroke();
        }
        //rotate the button
        // this.rotate = function(){
        //   context.save();
        //   context.translate(this.x_center, this.y_center);
        //   this.degree += this.rotation_speed;
        //   context.rotate(this.degree);
        //   this.draw(-this.width/2,-this.height/2);
        //   context.restore();
        //   context.textAlign = "center";
        //   context.textBaseline="middle"
        //   context.font = this.height/5.5 +"pt Roboto Slab"
        //   context.fillText(this.name,this.x_center,this.y_center);
        // }
        this.rotate = function(degree){
          context.save();
          context.translate(this.x_center, this.y_center);
          this.degree = degree;
          context.rotate(this.degree);
          this.draw(-this.width/2,-this.height/2);
          context.restore();
          context.textAlign = "center";
          context.textBaseline="middle"
          context.font = this.height/5.5 +"pt Roboto Slab"
          context.fillText(this.name,this.x_center,this.y_center);
        }
      }
      // Draw a line betwene two points with scale ratio.

      var about_button = new button(30,40,'ABOUT');
      var game_button = new button(38,10,'GAME');
      var vis_button = new button (10,10,'VIS');
      var write_button = new button(57,10,'BLOG');
      var code_button = new button(57,65,'CODE');
      vis_button.make_main();
      bottom_left_button = about_button;
      bottom_right_button = code_button;
      top_left_button = game_button;
      top_right_button = write_button;
      main_button.change_position(50,50);
      bottom_left_button.change_position(43,78);
      top_left_button.change_position(43,22);
      bottom_right_button.change_position(57,78);
      top_right_button.change_position(57,22);


      var buttons = [vis_button,about_button,game_button,write_button,code_button];
      var ratio = 0;
      var curr_line = 1;
      var prev_x = 0;
      var prev_y = 0;
      var x = 0;
      var y = 0;
      prev_lines_list = [];
      var speed = 0;
      function draw_star_map(){
        context.beginPath();
        context.moveTo(main_button.x,main_button.y);
        context.lineTo(top_left_button.x + top_left_button.width,top_left_button.y+ top_left_button.height);
        context.moveTo(main_button.x + main_button.width,main_button.y);
        context.lineTo(top_right_button.x,top_right_button.y+ top_right_button.height);
        context.moveTo(main_button.x,main_button.y + main_button.height);
        context.lineTo(bottom_left_button.x + bottom_left_button.width,bottom_left_button.y);
        context.moveTo(main_button.x + main_button.width,main_button.y+ main_button.height);
        context.lineTo(bottom_right_button.x, bottom_right_button.y);
        context.moveTo(main_button.x_center-300,main_button.y_center);
        var size_percent = 1/3;
        context.moveTo(top_left_button.x_center - top_left_button.width * size_percent, top_left_button.y + (1+size_percent) * top_left_button.height);
        context.lineTo(main_button.x_center - 1.6 * main_button.width, main_button.y_center );
        context.lineTo(bottom_left_button.x_center - bottom_left_button.width * size_percent, bottom_left_button.y - size_percent * bottom_left_button.height);

        context.moveTo(top_right_button.x_center + top_right_button.width * size_percent, top_right_button.y + (1+size_percent) * top_right_button.height);
        context.lineTo(main_button.x_center + 1.6 * main_button.width, main_button.y_center );
        context.lineTo(bottom_right_button.x_center + bottom_right_button.width * size_percent, bottom_left_button.y - size_percent * bottom_left_button.height);

        context.moveTo(top_left_button.x + top_left_button.width * (1+size_percent), top_left_button.y_center - top_left_button.height * size_percent);
        context.lineTo(main_button.x_center, main_button.y_center - 1.6 * main_button.height);
        context.lineTo(top_right_button.x - top_right_button.width * size_percent, top_right_button.y_center - top_right_button.height * size_percent);

        context.moveTo(bottom_left_button.x + top_left_button.width * (1+size_percent), bottom_left_button.y_center + bottom_left_button.height * size_percent);
        context.lineTo(main_button.x_center, main_button.y_center + 1.6 * main_button.height);
        context.lineTo(bottom_right_button.x - bottom_right_button.width * size_percent, bottom_right_button.y_center + bottom_right_button.height * size_percent);

        context.moveTo(top_left_button.x, top_left_button.y);
        context.lineTo(top_left_button.x - top_left_button.width * size_percent/2, top_left_button.y - top_left_button.height * size_percent/2);
        context.moveTo(top_right_button.x + top_right_button.width, top_right_button.y);
        context.lineTo(top_right_button.x + top_right_button.width * (1 + size_percent/2), top_right_button.y - top_right_button.height * size_percent/2);
        context.moveTo(bottom_left_button.x, bottom_left_button.y + bottom_left_button.height);
        context.lineTo(bottom_left_button.x - bottom_left_button.width * size_percent/2, bottom_left_button.y + bottom_left_button.height * (1+size_percent/2));
        context.moveTo(bottom_right_button.x + bottom_right_button.width, bottom_right_button.y + bottom_right_button.height);
        context.lineTo(bottom_right_button.x + bottom_right_button.width * (1+size_percent/2), bottom_right_button.y + bottom_right_button.height * (1+size_percent/2));

        context.moveTo(canvas.width * 0.05,main_button.y_center);
        context.lineTo(canvas.width * 0.12,main_button.y_center);
        context.moveTo(canvas.width * 0.28,main_button.y_center);
        context.lineTo(canvas.width * 0.35,main_button.y_center);
        context.textAlign = "center";
        context.textBaseline="middle"
        context.font = canvas.width * 0.04 +"pt Roboto Slab"
        context.fillText("KHAI",canvas.width * 0.2,main_button.y_center);
        context.moveTo(canvas.width * 0.65,main_button.y_center);
        context.lineTo(canvas.width * 0.68,main_button.y_center);
        context.moveTo(canvas.width * 0.92,main_button.y_center);
        context.lineTo(canvas.width * 0.95,main_button.y_center);
        context.textAlign = "center";
        context.textBaseline="middle"
        context.font = canvas.width * 0.04 +"pt Roboto Slab"
        context.fillText("NGUYEN",canvas.width * 0.8,main_button.y_center);
          context.stroke();
      }
      // function draw_star_map(prev_list,x1,y1,x2,y2,ratio){
      //   context.beginPath();
      //   if (prev_list.length > 0) context.moveTo(prev_list[0][0].x_center,prev_list[0][0].y_center);
      //   else context.moveTo(x1,y1);
      //   for (var i in prev_list){
      //     context.moveTo(prev_list[i][0].x_center,prev_list[i][0].y_center);
      //     context.lineTo(prev_list[i][1].x_center,prev_list[i][1].y_center);
      //   }
      //   context.lineTo(x1+(x2-x1)*ratio,y1+(y2-y1)*ratio);
      //   context.stroke();
      // }

    //   function draw(){
    //     //clear the screen
    //     context.lineWidth = 1;
    //     context.strokeStyle = '#0CF0F5';
    //     context.fillStyle = '#0CF0F5';
    //     context.clearRect(0,0,context.canvas.width,context.canvas.height);
    //     draw_star_map(prev_lines_list,prev_x,prev_y,x,y,ratio);
    //     for (var i =0; i< curr_line; i++){
    //       buttons[i].rotate();
    //     // }
    //     prev_x = buttons[curr_line-1].x_center;
    //     prev_y = buttons[curr_line-1].y_center;
    //     prev_x = main_button.x_center;
    //     prev_y = main_button.y_center;
    //     x = buttons[curr_line].x_center;
    //     y = buttons[curr_line].y_center;
    //     //draw the animating line
    //
    //     if (curr_line < 3) speed += (0.0015*curr_line);
    //     else  speed *= 0.964;
    //     ratio += speed;
    //
    //     //once finish drawing, draw the next line
    //     if (ratio >= 1) {
    //       prev_lines_list.push([buttons[curr_line-1],buttons[curr_line]])
    //       curr_line += 1;
    //       ratio = 0;
    //       prev_x = x;
    //       prev_y = y;
    //     }
    //       if (curr_line > (buttons.length-1)){
    //         cancelAnimationFrame(draw);
    //         requestAnimationFrame(auto_rotation);
    //         buttons[curr_line-1].rotate();
    //       }else {
    //         x = buttons[curr_line].x_center;
    //         y = buttons[curr_line].y_center;
    //         requestAnimationFrame(draw);
    //       }
    //   }
    //   draw();
    auto_rotation();
      function auto_rotation(){
            context.strokeStyle = '#0CF0F5';
            context.fillStyle = '#0CF0F5';
        context.clearRect(0,0,context.canvas.width,context.canvas.height);
        draw_star_map();
        for (var i =0; i< buttons.length; i++){
          buttons[i].rotate(Math.PI/4);
        }
        requestAnimationFrame(auto_rotation);
    }
