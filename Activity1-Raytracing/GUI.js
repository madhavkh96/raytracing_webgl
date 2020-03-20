// Contains all of the User Interaction Functions

class GUI {
    constructor() {
        this.isDrag = false;

        this.xCVV = 1.0;
        this.yCVV = 0.0;

        this.xMpos = 0.0;
        this.yMpos = 0.0;

        this.xMdragTot = 0.0;
        this.yMdragTot = 0.0;


        this.RayTracerGUI = function () {
            this.anti_aliasing = 1;
            this.isJittered = false;
            this.recursions = 1;

            this.setValues = function () {
                g_AAcode = parseInt(this.anti_aliasing);
                g_recusrionsNum = this.recursions;
                if (this.isJittered)
                    g_isJitter = 1;
                else
                    g_isJitter = 0;

                this.xMpos = this.xCVV;                                 
                this.yMpos = this.yCVV;
                //console.log(g_AAcode);
                //g_myScene.makeRayTracedImage();
                //raytracedView.switchToMe();
                //raytracedView.reload();
                //drawAll();
            }
        }

        this.WorldLightGUI = function () {
            this.lightIntensity = 1;
            this.light_diffuse = [255, 255, 255];
            this.light_ambient = [255, 255, 255];
            this.light_specular = [255, 255, 255];
            this.x_Position = 0;
            this.y_Position = 5;
            this.z_Position = 20;

            this.reloadLight = function () {
                g_Light_intensity = this.lightIntensity;
                //Diffuse
                this.light_diffuse[0] /= 255;
                this.light_diffuse[1] /= 255;
                this.light_diffuse[2] /= 255;

                //Ambient
                this.light_ambient[0] /= 255;
                this.light_ambient[1] /= 255;
                this.light_ambient[2] /= 255;

                //Specular
                this.light_specular[0] /= 255;
                this.light_specular[1] /= 255;
                this.light_specular[2] /= 255;


                //Update Values
                g_myScene.worldLight.ChangeIntensity(g_Light_intensity);
                g_myScene.worldLight.ChangeDiffuse(this.light_diffuse);
                g_myScene.worldLight.ChangeSpecular(this.light_specular);
                g_myScene.worldLight.ChangeAmbient(this.light_ambient);
                g_myScene.worldLight.UpdatePosition(this.x_Position, this.y_Position, this.z_Position);

                this.light_diffuse = [255, 255, 255];
                this.light_ambient = [255, 255, 255];
                this.light_specular = [255, 255, 255];
            }
        }

        this.HeadLightGUI = function () {
            this.enable = false;
            this.lightIntensity = 1;
            this.light_diffuse = [255, 255, 255];
            this.light_ambient = [255, 255, 255];
            this.light_specular = [255, 255, 255];
            this.x_Position = 0;
            this.y_Position = -5;
            this.z_Position = 20;

            this.reloadLight = function () {

                g_headLightOn = this.enable;

                g_headLight_intensity = this.lightIntensity;
                //Diffuse
                this.light_diffuse[0] /= 255;
                this.light_diffuse[1] /= 255;
                this.light_diffuse[2] /= 255;

                //Ambient
                this.light_ambient[0] /= 255;
                this.light_ambient[1] /= 255;
                this.light_ambient[2] /= 255;

                //Specular
                this.light_specular[0] /= 255;
                this.light_specular[1] /= 255;  
                this.light_specular[2] /= 255;


                //Update Values
                g_myScene.headLight.ChangeIntensity(g_headLight_intensity);
                g_myScene.headLight.ChangeDiffuse(this.light_diffuse);
                g_myScene.headLight.ChangeSpecular(this.light_specular);
                g_myScene.headLight.ChangeAmbient(this.light_ambient);
                g_myScene.headLight.UpdatePosition(this.x_Position, this.y_Position, this.z_Position);

                this.light_diffuse = [255, 255, 255];
                this.light_ambient = [255, 255, 255];
                this.light_specular = [255, 255, 255];
            }
        }
    }

    init() {
         var events = this;    // (local) reference to the current GUIbox object;
        // used in anonymous functions to restore simple
        // expected behavior of 'this' inside GUIbox functions. 
        window.addEventListener("mousedown",
            function (mev) { return events.mouseDown(mev); });
        // (after each 'mousedown' event, browser calls this anonymous method events
        //    does nothing but return the 'events' object's mousedown() method.
        //    why? to ensure proper operation of 'this' within the mousedown() fcn.)
        window.addEventListener("mousemove",
            function (mev) { return events.mouseMove(mev); });
        window.addEventListener("mouseup",
            function (mev) { return events.mouseUp(mev); });

        // Next, register all keyboard events found within our HTML webpage window:
        //window.addEventListener("keydown",
        //    function (kev) { return events.keyDown(kev); }, false);
        //// After each 'keydown' event, call the 'myKeyDown()' function; 'false'
        //// (default) means event handler executed in  'bubbling', not 'capture')
        //// ( https://www.w3schools.com/jsref/met_document_addeventlistener.asp )
        //window.addEventListener("keyup",
        //    function (kev) { return events.keyUp(kev); }, false);
        //// The 'keyDown' and 'keyUp' events respond to ALL keys on the keyboard,
        ////      including shift,alt,ctrl,arrow, pgUp, pgDn,f1,f2...f12 etc. 
        ////		  I use them for the arrow keys; insert/delete; home/end, etc.
        window.addEventListener("keypress",
            function (kev) { return events.keyPress(kev); }, false);
        // The 'keyPress' events respond ONLY to alpha-numeric keys, and sense any 
        //  		modifiers such as shift, alt, or ctrl.  I use these for single-
        //      number and single-letter inputs events include SHIFT,CTRL,ALT.
        // END Mouse & Keyboard Event-Handlers----------------------------------------

        window.onload = this.showDatGUI();

        // Camera-Navigation:----------------------------------
        // Initialize our camera aiming parameters using yaw-pitch sphere method.
        // Camera aiming point stays on a unit-radius sphere centered at the camera's
        // eye point, specified by:
        // --'yaw' angle(longitude) increasing CCW in xy plane measured from +x axis;
        // --'pitch' angle(latitude) increasing upwards above horizon.
        // This is BETTER than 'glass tube' because it lets us pitch camera up/down
        // in equal-angle increments, and even go past +/-90 degrees if we wish.
        // I limited 'pitch' to +/- 90 deg (+/- PI/2 radians) to avoid confusing
        // counter-intuitive images possible with past-vertical pitch.
        // (see GUIbox.mouseMove() function )
        this.camYaw = Math.PI / 2.0;              // (initially I aim in +y direction)
        // Yaw angle (radians) measured from world +x 
        // direction to the x,y components of the camera's
        // aiming direction.
        // HORIZONTAL mouse-drag increases/decreases this.
        this.camYawInit = this.camYaw;  // save initial value for use in mouseMove().
        //  this.camPitch = -Math.PI/2;             // (initially I look straight down)
        this.camPitch = 0.0;        // Initially aim at horizon; level with xy plane 
        // Pitch angle (radians) measured upwards from the 
        // horizon (the xy plane at camera's eyepoint z)
        // upwards to the camera's aiming direction.
        // VERTICAL mouse-drag increases/decreases this.
        this.camPitchInit = this.camPitch;  // save initial value for mouseMove().
        //  this.camEyePt = vec4.fromValues(0,0,0,1); // initial camera position: origin
        this.camEyePt = vec4.fromValues(0, -8, 2, 1);  // initial camera position
        this.camAimPt = vec4.fromValues(       // point on yaw-pitch sphere around eye:
            this.camEyePt[0] + Math.cos(this.camYaw) * Math.cos(this.camPitch), // x
            this.camEyePt[1] + Math.sin(this.camYaw) * Math.cos(this.camPitch), // y
            this.camEyePt[2] + Math.sin(this.camPitch), // z
            1.0);  // w 
        // Yaw & pitch angles let us specify an 'up' vector always perpendicular to
        // the camera aiming direction. (same yaw, but increase pitch by +90 degrees)
        this.camUpVec = vec4.fromValues(   // +90deg == Math.PI/2
            Math.cos(this.camYaw) * Math.cos(this.camPitch + Math.PI / 2),
            Math.sin(this.camYaw) * Math.cos(this.camPitch + Math.PI / 2),
            Math.sin(this.camPitch + Math.PI / 2),
            0.0);   // w=0 for vectors, =1 for points.
        this.camSpeed = 0.5;	      // world-space distance moved per keystroke

        // Set initial Camera Lens (intrinsics)-----------------------  
        this.camFovy = 45.0;   // vertical field-of-view in degrees, measured from
        // bottom to top of camera image.
        this.camAspect = 1.0;   // camera-image width/height (sets horizontal FOV)
        this.camNear = 1.0;     // distance from Center of Projection to viewing plane
        // (where we define left,bot,top values from Fovy & aspect)
        this.camFar = 10000;    // distance to frustum's outermost clipping plane
                          // (for WebGL camera only--ignored by ray-tracer)
    }

    mouseDown(mev) {
        this.mouseToCVV(mev);									// convert to CVV coordinates:
        this.xMpos = this.xCVV;                                 // save current position, and...
        this.yMpos = this.yCVV;
        this.isDrag = true;						  		        // set our mouse-dragging flag
    }

    mouseMove(mev) {
        if (this.isDrag == false) return;		// IGNORE all mouse-moves except 'dragging'

        this.mouseToCVV(mev);							// convert to CVV coordinates:

        this.xMdragTot += (this.xCVV - this.xMpos); // Accumulate change-in-mouse-position,&
        this.yMdragTot += (this.yCVV - this.yMpos);
        this.xMpos = this.xCVV;	                    // Make next drag-measurement from here.
        this.yMpos = this.yCVV;

        this.camYaw = this.camYawInit + this.xMdragTot * 1.0; // Horiz drag in radians
        this.camPitch = this.camPitchInit - this.yMdragTot * 1.0; // Vert drag in radians
        if (this.camYaw < -Math.PI) {  // keep yaw angle values between +/- PI
            this.camYaw += 2 * Math.PI;
        }
        else if (this.camYaw > Math.PI) {
            this.camYaw -= 2 * Math.PI;
        }
        if (this.camPitch < -Math.PI / 2) {    // don't let pitch go below -90deg 
            this.camPitch = -Math.PI / 2;       // (-Z aiming direction)
        }
        else if (this.camPitch > Math.PI / 2) {  // don't let pitch go above +90deg
            this.camPitch = Math.PI / 2;          // (+Z aiming direction)
        }

        // update camera aim point: using spherical coords:
        this.camAimPt[0] = this.camEyePt[0] + Math.cos(this.camYaw) * Math.cos(this.camPitch);  // x
        this.camAimPt[1] = this.camEyePt[1] + Math.sin(this.camYaw) * Math.cos(this.camPitch);  // y
        this.camAimPt[2] = this.camEyePt[2] + Math.sin(this.camPitch); // z
        // update the 'up' vector too (pitch an additional +90 degrees)
        this.camUpVec[0] = Math.cos(this.camYaw) * Math.cos(this.camPitch + Math.PI / 2);
        this.camUpVec[1] = Math.sin(this.camYaw) * Math.cos(this.camPitch + Math.PI / 2);
        this.camUpVec[2] = Math.sin(this.camPitch + Math.PI / 2);

        drawAll();
    }

    mouseUp(mev) {
        this.mouseToCVV(mev);               // CONVERT event to CVV coord system 
        this.isDrag = false;								// CLEAR our mouse-dragging flag, and
        // accumulate any final portion of mouse-dragging we did:
        this.xMdragTot += (this.xCVV - this.xMpos);
        this.yMdragTot += (this.yCVV - this.yMpos);
        this.xMpos = this.xCVV;             // RECORD this latest mouse-position.
        this.yMpos = this.yCVV;
    }

    mouseToCVV(mev) {
        var rect = g_canvasID.getBoundingClientRect(); // get canvas corners in pixels
        var xp = mev.clientX - rect.left;						   // x==0 at canvas left edge
        var yp = g_canvasID.height - (mev.clientY - rect.top);
        // y==0 at canvas bottom edge
        //  console.log('GUIbox.mousetoCVV()--in pixel coords: xp,yp=\t',xp,',\t',yp);
        // Convert to Canonical View Volume (CVV) coordinates too:
        this.xCVV = (xp - g_canvasID.width / 2) /  // move origin to center of canvas and
            (g_canvasID.width / 2);	  // normalize canvas to -1 <= x < +1,
        this.yCVV = (yp - g_canvasID.height / 2) /  //							 -1 <= y < +1.
            (g_canvasID.height / 2);
    }

    keyPress(kev) {
        var myChar = kev.key.charAt(0); // get the char held in 'key' String

        switch (myChar) {
            //------------------Ray Tracing----------------------
            case 't':
            case 'T':
                g_myScene.makeRayTracedImage(); // run the ray-tracer		
                raytracedView.switchToMe(); // be sure OUR VBO & shaders are in use, then
                raytracedView.reload();     // re-transfer VBO contents and texture-map contents
                drawAll();            // redraw BOTH viewports
                break;

            case 'c':
            case 'C':
                //			console.log("CLEAR the ray-traced image buffer.\n");
                g_myPic.setTestPattern(1);      // solid orange.
                g_sceneNum = 1;       // (re-set onScene() button-handler, too)
                raytracedView.switchToMe(); // be sure OUR VBO & shaders are in use, then
                raytracedView.reload();     // re-transfer VBO contents and texture-map contents
                drawAll();
                break;
            //------------------WASD navigation-----------------
            case 'a':
            case 'A':
                //			console.log("a/A key: Strafe LEFT!\n");
                this.camStrafe_L();
                break;
            case 'd':
            case 'D':
                //			console.log("d/D key: Strafe RIGHT!\n");
                this.camStrafe_R();
                break;
            case 's':
            case 'S':
                //			console.log("s/S key: Move REV!\n");
                this.camRev();
                break;
            case 'w':
            case 'W':
                //			console.log("w/W key: Move FWD!\n");
                this.camFwd();
                break;
            case 'L':
            case 'l':
                console.log(g_Light_intensity);
                break;
            default:
                console.log('GUIbox.keyPress(): Ignored key: ' + myChar);
                // Report EVERYTHING about this pressed key in the webpage 
                // in the <div> element with id='Result':r 
                break;
        }
    }

    camFwd() {
        var fwd = vec4.create();
        vec4.sub(fwd, this.camAimPt, this.camEyePt);   // Eye-to-Aim point vector
        vec4.normalize(fwd, fwd);                     // make it unit-length
        // (careful! normalize includes w)
        vec4.scale(fwd, fwd, this.camSpeed);          // scale length to set velocity
        vec4.add(this.camAimPt, this.camAimPt, fwd);  // add to BOTH points.
        vec4.add(this.camEyePt, this.camEyePt, fwd);
        drawAll();
    }

    camRev() {
        var rev = vec4.create();
        vec4.sub(rev, this.camEyePt, this.camAimPt);   // Aim-to-Eye point vector
        vec4.normalize(rev, rev);                      // make it unit-length
        // (careful! normalize includes w)
        vec4.scale(rev, rev, this.camSpeed);          // scale length to set velocity
        vec4.add(this.camAimPt, this.camAimPt, rev);  // add to BOTH points.
        vec4.add(this.camEyePt, this.camEyePt, rev);
        drawAll();
    }

    camStrafe_L() {
        var rtSide = vec4.fromValues(Math.sin(this.camYaw), // x
            -Math.cos(this.camYaw), // y
            0, 0); // z, w
        // rtSide is already unit length; no need to normalize.
        vec4.scale(rtSide, rtSide, -this.camSpeed);  // scale length to set velocity,
        vec4.add(this.camAimPt, this.camAimPt, rtSide);  // add to BOTH points.
        vec4.add(this.camEyePt, this.camEyePt, rtSide);
        drawAll();
    }

    camStrafe_R() {
        var rtSide = vec4.fromValues(Math.sin(this.camYaw), // x
            -Math.cos(this.camYaw), // y
            0, 0); // z,w  (vector, not point; w=0)
        // rtSide is already unit length; no need to normalize.
        vec4.scale(rtSide, rtSide, this.camSpeed);  // scale length to set velocity,
        vec4.add(this.camAimPt, this.camAimPt, rtSide);  // add to BOTH points.
        vec4.add(this.camEyePt, this.camEyePt, rtSide);
        drawAll();
    }

    
    showDatGUI = function () {

        var gui = new dat.GUI();
        var RTFolder = new this.RayTracerGUI();
        var WorldLightFolder = new this.WorldLightGUI();
        var HeadLightFolder = new this.HeadLightGUI();

        var RT = gui.addFolder('Ray Tracer Settings');
        RT.add(RTFolder, 'anti_aliasing', { One_X_One: 1, Two_X_Two: 2, Three_X_Three: 3, Four_X_Four: 4 });
        RT.add(RTFolder, 'isJittered');
        RT.add(RTFolder, 'recursions', { None: 1, One: 2, Two: 3, Three: 4, Four: 5 });
        RT.add(RTFolder, 'setValues');

        var WorldLight = gui.addFolder('World Light Settings');
        var worldLightPos = WorldLight.addFolder('Light Position');
        worldLightPos.add(WorldLightFolder, 'x_Position').min(-100).max(100).step(0.25);
        worldLightPos.add(WorldLightFolder, 'y_Position').min(-100).max(100).step(0.25);
        worldLightPos.add(WorldLightFolder, 'z_Position').min(1).max(100).step(0.25);

        var worldLightColor = WorldLight.addFolder('Light Color');
        worldLightColor.addColor(WorldLightFolder, 'light_diffuse');
        worldLightColor.addColor(WorldLightFolder, 'light_ambient');
        worldLightColor.addColor(WorldLightFolder, 'light_specular');
        worldLightColor.add(WorldLightFolder, 'lightIntensity', 0, 5);

        worldLightColor.open();
        worldLightPos.open();

        WorldLight.add(WorldLightFolder, 'reloadLight');

        var HeadLight = gui.addFolder('Portable Light Settings');
        HeadLight.add(HeadLightFolder, 'enable');

        var headLightPos = HeadLight.addFolder('Light Position');
        headLightPos.add(HeadLightFolder, 'x_Position').min(-100).max(100).step(0.25);
        headLightPos.add(HeadLightFolder, 'y_Position').min(-100).max(100).step(0.25);
        headLightPos.add(HeadLightFolder, 'z_Position').min(1).max(100).step(0.25);

        var headLightColor = HeadLight.addFolder('Light Color');
        headLightColor.addColor(HeadLightFolder, 'light_diffuse');
        headLightColor.addColor(HeadLightFolder, 'light_ambient');
        headLightColor.addColor(HeadLightFolder, 'light_specular');
        headLightColor.add(HeadLightFolder, 'lightIntensity', 0, 5);

        headLightColor.open();
        headLightPos.open();

        HeadLight.add(HeadLightFolder, 'reloadLight');


    }
}
