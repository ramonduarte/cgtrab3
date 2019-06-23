window.onload = setTimeout(function() {
    function translateObject(event) {
        event.preventDefault();
        switch (event.which) {
            case 1: // left click

                // TODO: this is just a quick patch 2019-06-21 21:52:13
                var dx = event.clientX - mousePrevious.x;
                var dy = event.clientY - mousePrevious.y;
                cube.translateY(dx);
                cube.translateX(dy);
                renderer.render(scene, camera);
                mousePrevious.copy(mouse);

                return;

                var a = 2 * event.x / document.body.width - 1;
                var b = 1 - 2 * event.y / document.body.height;
                cube.updateMatrixWorld()
                // raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
                raycaster.setFromCamera(new THREE.Vector2(event.x, event.y), camera);
                intersects = raycaster.intersectObject(cube);
                if (intersects.length == 0) {
                    console.log(intersects);
                    return false;
                }
                var item = intersects[0];
                var objectHit = item.object;

                mouse.x = event.clientX;
                mouse.y = event.clientY;

                cube.translateX(-(mousePrevious.x - mouse.x)/200);
                cube.translateY((mousePrevious.y - mouse.y)/200);

                mousePrevious.copy(mouse);
                console.log(mousePrevious, mouse);
                
                break;
            
            default:
                break;
        }
        
    }

	function doMouseDown(x, y) {
		if (mouseAction == ROTATE) {
			return true;
        }
        if (targetForDragging.parent == scene) {
			scene.remove(targetForDragging);  // I don't want to check for hits on targetForDragging
		}

		var a = 2 * x / document.body.width - 1;
		var b = 1 - 2 * y / document.body.height;
        var raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(new THREE.Vector2(a, b), camera);
		intersects = raycaster.intersectObjects(scene.children);
		if (intersects.length == 0) {
			return false;
        }

		var item = intersects[0];
        var objectHit = item.object;
        // if (objectHit == sphere) {
        if (objectHit == null) {
            return false;
        } else {
            dragItem = objectHit;
            scene.add(targetForDragging);
            targetForDragging.position.set(0, item.point.y, 0);
            renderer.render(scene, camera);
            return true;
        }
	}

	function doMouseMove(x, y, event, prevX, prevY) {
        var a = 2 * x / document.body.width - 1;
        var b = 1 - 2 * y / document.body.height;
        // projector.unprojectVector(new THREE.Vector3(a, b, 1), camera);
        // var raycaster = new THREE.Raycaster(camera.position,
                                            // new THREE.Vector3(x, y, 1)
                                            // .sub(camera.position).normalize());
        // var raycaster = new THREE.Raycaster(new THREE.Vector3(x, y, 0.5),
                                            // camera.position);
        var raycaster = new THREE.Raycaster();

        raycaster.setFromCamera(new THREE.Vector3(x, y, 0.5), camera);
        // intersects = raycaster.intersectObjects(solids.children);
        scene.updateMatrixWorld(true);
        // intersects = raycaster.intersectObjects(cube.children);
        intersects = raycaster.intersectObject(targetForDragging);
        if (intersects.length == 0) {
            // console.log("intersect empty: ", solids);
            console.log("intersect empty: ", mesh);
            console.log(x, y);
            console.log(camera.position);
            
            return;
        } else {console.log("intersect got smth", intersects);}
        var locationX = intersects[0].point.x;
        var locationY = intersects[0].point.y;
        var coords = new THREE.Vector3(locationX, locationY, 0);
        scene.worldToLocal(coords);
        // a = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
        // b = Math.min(19, Math.max(-19, coords.z));
        dragItem.position.set(coords.x, coords.y, coords.z);
		if (mouseAction == ROTATE) {
			var dx = x - prevX;
			var dy = y - prevY;
			intersects[0].object.rotateY(dy/200);
			intersects[0].object.rotateX(dx/200);
			renderer.render(scene, camera);
        } else { // drag
            console.log("dragging");

            // TODO: this is just a quick patch 2019-06-21 21:52:13
            var dx = x - prevX;
			var dy = y - prevY;
			intersects[0].object.translateY(-dy / 200);
			intersects[0].object.translateX(dx / 200);
            renderer.render(scene, camera);
        }
    }
    
    function doChangeMouseAction() {
		if (document.getElementById("mouseRotate").checked) {
            mouseAction = ROTATE;
		} else {
            mouseAction = DRAG;
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
    scene.background = new THREE.Color("skyblue");
    var solids = new THREE.Group()
    var mouse = new THREE.Vector3( 0, 0, 0.5);
    var mousePrevious = new THREE.Vector3( 0, 0, 0.5);
    try {
        var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        // renderer.setClearColor( 0xffff00, 0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
    } catch (e) {
        document.body.innerHTML = "<p><b>Sorry, an error occurred:<br>" +
            e + "</b></p>";
        return true;
    }
    var intersects;

    // Camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.add(new THREE.PointLight(0xffffff,0.7));
    // var projector = new THREE.Projector();
    var orbit = new THREE.OrbitControls( camera, renderer.domElement );
    orbit.enableZoom = true;
    orbit.enableRotate = false;
    // camera.position.z = 60;
    // camera.position.y = 30;
    // camera.lookAt( new THREE.Vector3(0,0,0) );

    // Event handlers
    var ROTATE = 1;
    var DRAG = 2;
    var mouseAction = ROTATE;

    document.getElementById("mouseRotate").checked = true;
    document.getElementById("mouseRotate").onchange = doChangeMouseAction;
    document.getElementById("mouseDrag").onchange = doChangeMouseAction;
    setUpMouseHander(document.body, doMouseDown, doMouseMove);
    setUpTouchHander(document.body, doMouseDown, doMouseMove);
    // document.addEventListener('mousedown', onDocumentMouseDown, false);
    // document.addEventListener('mouseup', translateObject, false);

    // CUBES
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    material.shadowSide = THREE.DoubleSide;
    // var material = new THREE.MeshDepthMaterial({color: 0x00ff00});
    var mesh = new THREE.Mesh(geometry, material);
    // var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial( {color:"yellow"}));
    // var cube = new THREE.Object3D();
    // cube.add(mesh);

    // targetForDragging = new THREE.Mesh(
    //     new THREE.BoxGeometry(100,0.01,100),
    //     new THREE.MeshBasicMaterial({color: 0xff0000})
    // );
    // targetForDragging.material.visible = true;
    // // targetForDragging.material.transparent = true;
    // targetForDragging.material.opacity = 0.2;
    // cube.add(targetForDragging);

    // var meshArray = [];
    // meshArray.push(mesh);


    // var geometry2 = new THREE.BoxGeometry(1, 2, 1);
    // var material2 = new THREE.MeshBasicMaterial({color: 0x0000ff});
    // material2.shadowSide = THREE.DoubleSide;
    // // var material = new THREE.MeshDepthMaterial({color: 0x00ff00});
    // var mesh2 = new THREE.Mesh(geometry2, material2);
    // // var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color:"yellow"}));
    // mesh2.position.x = -2.5;
    // var cube2 = new THREE.Object3D();
    // cube2.add(mesh2);

    // var geometry3 = new THREE.BoxGeometry(2, 1, 1);
    // var material3 = new THREE.MeshBasicMaterial({color: 0xff0000});
    // material3.shadowSide = THREE.DoubleSide;
    // // var material = new THREE.MeshDepthMaterial({color: 0x00ff00});
    // var mesh3 = new THREE.Mesh(geometry3, material3);
    // // var mesh3 = new THREE.Mesh(geometry3, new THREE.MeshLambertMaterial({color:"red"}));
    // mesh3.position.x = 2.5;
    // var cube3 = new THREE.Object3D();
    // cube3.add(mesh3);

    // CUBE LINES
    // var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000, transparent: true, opacity: 1.0});
    // var lines = new THREE.LineSegments(geometry, lineMaterial);
    // cube.add(lines);
    // solids.add(cube);

    // var lineMaterial2 = new THREE.LineBasicMaterial({color: 0x000000, transparent: true, opacity: 1.0});
    // var lines2 = new THREE.LineSegments(geometry2, lineMaterial2);
    // lines2.position.x = -2.5;
    // cube2.add(lines2);
    // solids.add(cube2);

    // var lineMaterial3 = new THREE.LineBasicMaterial({color: 0x000000, transparent: true, opacity: 1.0});
    // var lines3 = new THREE.LineSegments(geometry3, lineMaterial3);
    // lines3.position.x = 2.5;
    // cube3.add(lines3);
    // solids.add(cube3)

    // SPHERE
    // var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    // var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, transparent: true, opacity: 0.2});
    // var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // Material for raycasting
    targetForDragging = new THREE.Mesh(
        new THREE.BoxGeometry(100,0.01,100),
        new THREE.MeshBasicMaterial({color: "black"})
    );
    targetForDragging.material.visible = true;
    targetForDragging.material.transparent = true;
    targetForDragging.material.opacity = 0.1;
    scene.add(targetForDragging);

    // Building the scene
    // scene.add(solids);
    scene.add(mesh);
    // scene.add(lines);
    // scene.add(sphere);
    // scene.add(new THREE.DirectionalLight(0x0000ff, 1));
    camera.position.z = 5;

    var animate = function () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    console.log(scene);

    animate();
}, 10);