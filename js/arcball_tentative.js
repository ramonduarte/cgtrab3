window.requestAnimationFrame =
window.requestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.msRequestAnimationFrame ||
window.oRequestAnimationFrame ||
function(callback) {
    setTimeout(function() {
        callback(Date.now());
    }, 1000 / 60);
};

function setUpMouseHander(element, mouseDownFunc, mouseDragFunc, mouseUpFunc) {
    /*
        element -- either the element itself or a string with the id of the element
        mouseDownFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
        mouseDragFunc(x,y,evt,prevX,prevY,startX,startY)
        mouseUpFunc(x,y,evt,prevX,prevY,startX,startY)
    */
    // if (typeof element == "string") {
    //     element = document.getElementById(element);
    // }
    var dragging = false;
    var startX, startY;
    var prevX, prevY;

    function doMouseDown(evt) {
        if (dragging) {
            return;
        }
        var r = element.getBoundingClientRect();
        var x = evt.clientX - r.left;
        var y = evt.clientY - r.top;
        prevX = startX = x;
        prevY = startY = y;
        dragging = mouseDownFunc(x, y, evt);
        if (dragging) {
            document.addEventListener("mousemove", doMouseMove);
            document.addEventListener("mouseup", doMouseUp);
        }
    }

    function doMouseMove(evt) {
        if (dragging) {
            if (mouseDragFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                mouseDragFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            prevX = x;
            prevY = y;
        }
    }

    function doMouseUp(evt) {
        if (dragging) {
            document.removeEventListener("mousemove", doMouseMove);
            document.removeEventListener("mouseup", doMouseUp);
            if (mouseUpFunc) {
                var r = element.getBoundingClientRect();
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                mouseUpFunc(x, y, evt, prevX, prevY, startX, startY);
            }
            dragging = false;
        }
    }
    element.addEventListener("mousedown", doMouseDown);
}
