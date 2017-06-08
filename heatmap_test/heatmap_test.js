/**
 * Created by Khoi Le on 06-Jun-17.
 */

var randomElements = [];
var indexArr = [];
var ctx;
var canvas;

$(document).ready(function() {
    generateRandomPoints();
    getCtx();
    requestAnimationFrame(mainLoop);

    function generateRandomPoints() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        for (i = 0; i < 100; i++) {
            var x = Math.floor(Math.random() * width + 10);
            var y = Math.floor(Math.random() * height + 10);
            var elem = document.elementFromPoint(x, y);
            if (elem !== null && !(elem instanceof HTMLHtmlElement)) {
                var index = randomElements.indexOf(elem);
                if (index === -1) {
                    randomElements.push(elem);
                    indexArr.push(1);
                } else {
                    indexArr[index] += 1;
                }
            }
        }
    }

    function drawHeatmap() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (i = 0; i < randomElements.length; i ++) {
            var elem = randomElements[i].getBoundingClientRect();
            ctx.beginPath();
            ctx.lineWidth="5";
            ctx.strokeStyle="blue";
            ctx.rect(elem.left, elem.top, elem.width, elem.height);
            ctx.stroke();
        }
    }

    function getCtx() {
        canvas = document.createElement('canvas');
        canvas.id = "canvas-overlay";
        canvas.style.zIndex = 1000;
        canvas.style.position = "fixed";
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d");
    }

    function mainLoop() {
        drawHeatmap();
        requestAnimationFrame(mainLoop);
    }
});
