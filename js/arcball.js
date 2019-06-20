window.onload = setTimeout(function() {
    function onDocumentMouseDown(event) {
        event.preventDefault();
        switch (event.which) {
            case 1: // left mouse click
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                mouse.unproject( camera );

                // projector.unproject(vector, camera);

                var ray = new THREE.Raycaster(camera.position, 
                                        mouse.sub(camera.position).normalize());

                var intersects = ray.intersectObjects(scene.children);

                if (intersects.length > 0) {
                    intersects[0].object.materials[0].color.setHex(Math.random() * 0xffffff);
                    var particle = new THREE.Particle(particleMaterial);
                    particle.position = intersects[0].point;
                    particle.scale.x = particle.scale.y = 8;
                    scene.add(particle);

                    console.log(mouse);
                }
                break;
            
            default:
                break;
        }
    }

    function rotateObject(event) {
        event.preventDefault();
        switch (event.which) {
            case 1: // left mouse click
                mouse.x = (event.clientX/window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY/window.innerHeight) * 2 + 1;

                cube.rotation.x += (mousePrevious.x - mouse.x);
                cube.rotation.y += (mousePrevious.y - mouse.y);

                mousePrevious.copy(mouse);
                console.log("botão esquerdo");
                
                break;
            
            default:
                break;
        }
        
    }


	function doMouseDown(x, y) {
		if (mouseAction == ROTATE) {
			return true;
		}
		var a = 2 * x / document.body.width - 1;
		var b = 1 - 2 * y / document.body.height;
		raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
		intersects = raycaster.intersectObjects(cube); // no need for recusion since all objects are top-level
		if (intersects.length == 0) {
			return false;
		}
		var item = intersects[0];
		var objectHit = item.object;
		switch (mouseAction) {
			case DRAG:
				if (objectHit == sphere) {
					return false;
				} else {
					dragItem = objectHit;
					render();
					return true;
				}
			case ADD:
				if (objectHit == sphere) {
					var locationX = item.point.x; // Gives the point of intersection in world coords
					var locationZ = item.point.z;
					var coords = new THREE.Vector3(locationX, 0, locationZ);
					cube.worldToLocal(coords); // to add cylider in correct position, neew local coords for the world object
					addCylinder(coords.x, coords.z);
					render();
				}
				return false;
			default: // DELETE
				if (objectHit != sphere) {
					cube.remove(objectHit);
					render();
				}
				return false;
		}
	}

	function doMouseMove(x, y, event, prevX, prevY) {
		if (mouseAction == ROTATE) {
			var dx = x - prevX;
			cube.rotateY(dx / 200);
			render();
		} else { // drag
			var a = 2 * x / document.body.width - 1;
			var b = 1 - 2 * y / document.body.height;
			raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
			intersects = raycaster.intersectObject(cube);
			if (intersects.length == 0) {
				return;
			}
			var locationX = intersects[0].point.x;
			var locationZ = intersects[0].point.z;
			var coords = new THREE.Vector3(locationX, 0, locationZ);
			cube.worldToLocal(coords);
			a = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
			b = Math.min(19, Math.max(-19, coords.z));
			dragItem.position.set(a, 3, b);
			render();
		}
    }
    
    function doChangeMouseAction() {
		if (document.getElementById("mouseRotate").checked) {
			mouseAction = ROTATE;
		} else if (document.getElementById("mouseDrag").checked) {
			mouseAction = DRAG;
		} else if (document.getElementById("mouseAdd").checked) {
			mouseAction = ADD;
		} else {
			mouseAction = DELETE;
		}
    }
    
    function setUpMouseHander(element, mouseDownFunc, mouseDragFunc, mouseUpFunc) {
        /*
               element -- either the element itself or a string with the id of the element
               mouseDownFunc(x,y,event) -- should return a boolean to indicate whether to start a drag operation
               mouseDragFunc(x,y,event,prevX,prevY,startX,startY)
               mouseUpFunc(x,y,event,prevX,prevY,startX,startY)
           */
        if (!element || !mouseDownFunc || !(typeof mouseDownFunc == "function")) {
            throw "Illegal arguments in setUpMouseHander";
        }
        if (typeof element == "string") {
            element = document.getElementById(element);
        }
        if (!element || !element.addEventListener) {
            throw "first argument in setUpMouseHander is not a valid element";
        }
        var dragging = false;
        var startX, startY;
        var prevX, prevY;
    
        function doMouseDown(event) {
            if (dragging) {
                return;
            }
            var r = element.getBoundingClientRect();
            var x = event.clientX - r.left;
            var y = event.clientY - r.top;
            prevX = startX = x;
            prevY = startY = y;
            dragging = mouseDownFunc(x, y, event);
            if (dragging) {
                document.addEventListener("mousemove", doMouseMove);
                document.addEventListener("mouseup", doMouseUp);
            }
        }
    
        function doMouseMove(event) {
            if (dragging) {
                if (mouseDragFunc) {
                    var r = element.getBoundingClientRect();
                    var x = event.clientX - r.left;
                    var y = event.clientY - r.top;
                    mouseDragFunc(x, y, event, prevX, prevY, startX, startY);
                }
                prevX = x;
                prevY = y;
            }
        }
    
        function doMouseUp(event) {
            if (dragging) {
                document.removeEventListener("mousemove", doMouseMove);
                document.removeEventListener("mouseup", doMouseUp);
                if (mouseUpFunc) {
                    var r = element.getBoundingClientRect();
                    var x = event.clientX - r.left;
                    var y = event.clientY - r.top;
                    mouseUpFunc(x, y, event, prevX, prevY, startX, startY);
                }
                dragging = false;
            }
        }
        element.addEventListener("mousedown", doMouseDown);
    }
    
    function setUpTouchHander(element, touchStartFunc, touchMoveFunc, touchEndFunc, touchCancelFunc) {
        /*
               element -- either the element itself or a string with the id of the element
               touchStartFunc(x,y,event) -- should return a boolean to indicate whether to start a drag operation
               touchMoveFunc(x,y,event,prevX,prevY,startX,startY)
               touchEndFunc(event,prevX,prevY,startX,startY)
               touchCancelFunc()   // no parameters
           */
        if (!element || !touchStartFunc || !(typeof touchStartFunc == "function")) {
            throw "Illegal arguments in setUpTouchHander";
        }
        if (typeof element == "string") {
            element = document.getElementById(element);
        }
        if (!element || !element.addEventListener) {
            throw "first argument in setUpTouchHander is not a valid element";
        }
        var dragging = false;
        var startX, startY;
        var prevX, prevY;
    
        function doTouchStart(event) {
            if (event.touches.length != 1) {
                doTouchEnd(event);
                return;
            }
            event.preventDefault();
            if (dragging) {
                doTouchEnd();
            }
            var r = element.getBoundingClientRect();
            var x = event.touches[0].clientX - r.left;
            var y = event.touches[0].clientY - r.top;
            prevX = startX = x;
            prevY = startY = y;
            dragging = touchStartFunc(x, y, event);
            if (dragging) {
                element.addEventListener("touchmove", doTouchMove);
                element.addEventListener("touchend", doTouchEnd);
                element.addEventListener("touchcancel", doTouchCancel);
            }
        }
    
        function doTouchMove(event) {
            if (dragging) {
                if (event.touches.length != 1) {
                    doTouchEnd(event);
                    return;
                }
                event.preventDefault();
                if (touchMoveFunc) {
                    var r = element.getBoundingClientRect();
                    var x = event.touches[0].clientX - r.left;
                    var y = event.touches[0].clientY - r.top;
                    touchMoveFunc(x, y, event, prevX, prevY, startX, startY);
                }
                prevX = x;
                prevY = y;
            }
        }
    
        function doTouchCancel() {
            if (touchCancelFunc) {
                touchCancelFunc();
            }
        }
    
        function doTouchEnd(event) {
            if (dragging) {
                dragging = false;
                element.removeEventListener("touchmove", doTouchMove);
                element.removeEventListener("touchend", doTouchEnd);
                element.removeEventListener("touchcancel", doTouchCancel);
                if (touchEndFunc) {
                    touchEndFunc(event, prevX, prevY, startX, startY);
                }
            }
        }
        element.addEventListener("touchstart", doTouchStart);
    }

    // Firing it up
    var scene = new THREE.Scene();
    var mouse = new THREE.Vector3( 0, 0, 0.5);
    var mousePrevious = new THREE.Vector3( 0, 0, 0.5);
    var raycaster = new THREE.Raycaster();
    try {
        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild(renderer.domElement);
    } catch (e) {
        document.body.innerHTML = "<p><b>Sorry, an error occurred:<br>" +
            e + "</b></p>";
        return true;
    }

    // Camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    // var projector = new THREE.Projector();
    var orbit = new THREE.OrbitControls( camera, renderer.domElement );
    orbit.enableZoom = true;
    orbit.enableRotate = false;

    // Event handlers
    var flag = 0;
    var ROTATE = 1;
    var DRAG = 2;
	var ADD = 3;
	var DELETE = 4;
    var mouseAction = DRAG;

    document.getElementById("mouseDrag").checked = true;
    document.getElementById("mouseRotate").onchange = doChangeMouseAction;
    document.getElementById("mouseDrag").onchange = doChangeMouseAction;
    document.getElementById("mouseAdd").onchange = doChangeMouseAction;
    document.getElementById("mouseDelete").onchange = doChangeMouseAction;
    setUpMouseHander(document.body, doMouseDown, doMouseMove);
    setUpTouchHander(document.body, doMouseDown, doMouseMove);
    // document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', rotateObject, false);
    document.addEventListener("mousedown", function(){ flag = 0; }, false);
    document.addEventListener("mousemove", function(){ flag = 1; }, false);

    // CUBE
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );

    // CUBE LINES
    var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, transparent: true, opacity: 1.0});
    var lines = new THREE.LineSegments( geometry, lineMaterial )

    // SPHERE
    var sphereGeometry = new THREE.SphereGeometry( 1, 32, 32 );
    var sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0.2} );
    var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );

    // Building the scene
    scene.add(cube);
    scene.add(lines);
    scene.add(sphere);
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5));
    camera.position.z = 5;

    var animate = function () {
        requestAnimationFrame(animate);



        // cube.rotation.x += 0.01;
        // cube.rotation.x += 0.01;
        // lines.rotation.y += 0.01;
        // lines.rotation.y += 0.01;

        renderer.render(scene, camera);
    };

    console.log(scene);

    animate();
}, 10);