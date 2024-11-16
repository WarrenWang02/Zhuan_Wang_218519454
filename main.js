// Template code for A2 Fall 2021 -- DO NOT DELETE THIS LINE

var canvas;
var gl;

var program ;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

//new material
var redC = 0;
var greenC = 1;
var materialRed = vec4(1.0, 0.0, 0.0, 1.0);
var materialChanging = vec4(redC, greenC, 0.0, 1.0);


var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix ;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye = vec3(5, 5, 10);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var fov = 90;

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var TIME = 0.0 ; // Realtime
var resetTimerFlag = true ;
var animFlag = false ;
var prevTime = 0.0 ;
var useTextures = 1 ; //always open now


//new codes

//let currentTexture = 0; // Default texture index

// ------------ Animate control stuff --------------
let recoilTime = 0;
let animPhase = 0;
let recoilRotation = 0;
let personRotation = 0;

//Bullet
let bulletExist = 0;
let bulletPos = 0;            // Current position of the bullet
let bulletStartTime = 0;      // Time when bullet animation starts

//person
let leftArmRotation = -150;         // Upper left arm rotation angle ||change: -150 > -70
let leftForearmRotation = -20;     // Lower left arm rotation angle Up and down ||change: -20 > -30
let leftForearmRotation2 = 0;    // Lower left arm rotation angle Left and right ||change: -20 > -30

// Variables for frame rate calculation
let frameCount = 0;                // Frame counter
let fps = 0;                       // Current frame rate
let lastFPSUpdateTime = 0;         // Last time FPS was updated (using TIME)

//Range
let rangeStart = 0;
let rangeMove = 0; //control range things raise
let rangeMove2 = 10; //control range things drop


// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i =0; i<texSize; i++)  image1[i] = new Array();
for (var i =0; i<texSize; i++)
for ( var j = 0; j < texSize; j++)
image1[i][j] = new Float32Array(4);
for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

for ( var i = 0; i < texSize; i++ )
for ( var j = 0; j < texSize; j++ )
for(var k =0; k<4; k++)
image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];


var textureArray = [] ;



function isLoaded(im) {
    if (im.complete) {
        console.log("loaded") ;
        return true ;
    }
    else {
        console.log("still not loaded!!!!") ;
        return false ;
    }
}

function loadFileTexture(tex, filename)
{
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename ;
    tex.isTextureReady = false ;
    tex.image.onload = function() { handleTextureLoaded(tex); }
    // The image is going to be loaded asyncronously (lazy) which could be
    // after the program continues to the next functions. OUCH!
}

function loadImageTexture(tex, image) {
    tex.textureWebGL  = gl.createTexture();
    tex.image = new Image();
    //tex.image.src = "CheckerBoard-from-Memory" ;
    
    gl.bindTexture( gl.TEXTURE_2D, tex.textureWebGL );
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true ;

}

function initTextures() {
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"sunset.bmp") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"woodtexture.png") ;
    
    textureArray.push({}) ;
    loadFileTexture(textureArray[textureArray.length-1],"floortexture.png") ;
    
    
}

//new
function setTexture(textureIndex, useTextures) {
    gl.uniform1i(gl.getUniformLocation(program, "currentTexture"), textureIndex);
    gl.uniform1i( gl.getUniformLocation(program, "useTextures"), useTextures);
}



function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src) ;
    
    textureObj.isTextureReady = true ;
}

//----------------------------------------------------------------

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}



function toggleTextures() {
    useTextures = 1 - useTextures ;
    gl.uniform1i( gl.getUniformLocation(program, "useTextures"), useTextures );
    /*
    if (useTextures === 1) {
        currentTexture = (currentTexture + 1) % textureArray.length; // Cycle through textures
    }
    */
}

function waitForTextures1(tex) {
    setTimeout( function() {
    console.log("Waiting for: "+ tex.image.src) ;
    wtime = (new Date()).getTime() ;
    if( !tex.isTextureReady )
    {
        console.log(wtime + " not ready yet") ;
        waitForTextures1(tex) ;
    }
    else
    {
        console.log("ready to render") ;
        window.requestAnimFrame(render);
    }
               },5) ;
    
}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout( function() {
               var n = 0 ;
               for ( var i = 0 ; i < texs.length ; i++ )
               {
                    console.log("boo"+texs[i].image.src) ;
                    n = n+texs[i].isTextureReady ;
               }
               wtime = (new Date()).getTime() ;
               if( n != texs.length )
               {
               console.log(wtime + " not ready yet") ;
               waitForTextures(texs) ;
               }
               else
               {
               console.log("ready to render") ;
               window.requestAnimFrame(render);
               }
               },5) ;
    
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    //new! init currentTexture value
    gl.uniform1i(gl.getUniformLocation(program, "currentTexture"), 2);
 
    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    gl.uniform1i( gl.getUniformLocation(program, "useTextures"), useTextures ); //useTextures full control

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // set a default material
    setColor(materialDiffuse) ;

    
    
    // set the callbacks for the UI elements
    document.getElementById("sliderXi").oninput = function() {
        RX = this.value ;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };
    
    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
    };
    
    document.getElementById("textureToggleButton").onclick = function() {
        toggleTextures() ;
        window.requestAnimFrame(render);
    };

    var controller = new CameraController(canvas);
    controller.onchange = function(xRot,yRot) {
        RX = xRot ;
        RY = yRot ;
        window.requestAnimFrame(render); };
    
    // load and initialize the textures
    initTextures() ;
    
    // Recursive wait for the textures to load
    waitForTextures(textureArray) ;
    //setTimeout (render, 100) ;
    
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

function render() {
    let timePause = 0; //pauseTime
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    frameCount++;
    
    if (timePause){
        eye = vec3(30, 10, 15); //origin 5 5 10 > 2 1 0
        //eye = vec3(15, 15, 30);

        //modify at and up
        at = vec3(18.0, 0.0, 0.0); // origin 0 0 0 >20 0 0
        //up = vec3(0.0, 1.0, 0.0);
        //fov = 45;
    }
        
   
    // set the projection matrix
    projectionMatrix = perspective(fov, canvas.width / canvas.height, 0.1, 1000);
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
    
    // initialize the modeling matrix stack
    MS= [] ;
    modelMatrix = mat4() ;
    
    // apply the slider rotations
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    // send all the matrices to the shaders
    setAllMatrices() ;

    ///*
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[1].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture2"), 1);
    
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[2].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture3"), 2);
    //*/

    //=======================================================================
    //Here's my main code
    
    gPush(); //basic floor
    gTranslate(0, -5, 0);
    gScale(10, 0.3, 10);
    setColor(vec4(0.2, 0.2, 0.2, 1.0));
    setTexture(2, 1);
    drawCube();
    setTexture(0, 0);
    gPop();

    gPush();
        gRotate(personRotation, 0, 1, 0);
        drawSimplePerson();
            //bullet spawn
            gPush();
            gTranslate(5, 0.6, 0);
            gScale(0.5, 0.5, 0.5);
            setColor(materialAmbient);
            drawBullet();
            gPop();
    gPop();

    drawRange();
    
    gPush();
    gTranslate(30, 0, 0);
    materialChanging = vec4(redC, greenC, 0.0, 1.0);
    setColor(materialChanging);
    drawSphere();
    gPop();

    
    // get real time
    var curTime ;
    if( animFlag )
    {
        if (!timePause){
            curTime = (new Date()).getTime() /1000 ;
            if( resetTimerFlag ) {
                prevTime = curTime ;
                resetTimerFlag = false ;
            }
            TIME = TIME + curTime - prevTime ;
            prevTime = curTime ;
        } else {
            TIME = 2; //set TIME when pausing
        }
        

        //ANIMES
        // 0 - 5 sec
        if (TIME >= 0 && TIME <= 5) {
            if (TIME >= 0 && TIME <= 2) {
                leftArmRotation = animateVariable(0, 2, -150, -40, TIME);
            }
            if (TIME > 2 && TIME <= 3.5) {
                leftArmRotation = animateVariable(2, 3.5, -40, -70, TIME);
            }
            
            if (TIME >= 0 && TIME <= 2) {
                leftForearmRotation = animateVariable(0, 2, -20, -70, TIME);
            }
            if (TIME > 2 && TIME <= 3.5) {
                leftForearmRotation = animateVariable(2, 3.5, -70, -30, TIME);
            }
        }

        // 3 - 8 sec
        if (TIME >= 3 && TIME <= 8) {
            eye[0] = animateVariable(3, 8, 5, 2, TIME);
            eye[1] = animateVariable(3, 8, 5, 1, TIME);
            eye[2] = animateVariable(3, 8, 10, 0, TIME);
            at[0] = animateVariable(3, 8, 0, 20, TIME);
        }

        // 4 - 9 sec
        if (TIME >= 4 && TIME <= 5) {
            leftForearmRotation2 = animateVariable(4, 5, -10, 10, TIME);
        }
        if (TIME >= 5 && TIME <= 6) {
            leftForearmRotation2 = animateVariable(5, 6, 10, -10, TIME);
        }
        if (TIME >= 6 && TIME <= 7) {
            leftForearmRotation2 = animateVariable(6, 7, -10, 10, TIME);
        }
        if (TIME >= 7 && TIME <= 8) {
            leftForearmRotation2 = animateVariable(7, 8, 10, -10, TIME);
        }
        if (TIME >= 8 && TIME <= 9) {
            leftForearmRotation2 = animateVariable(8, 9, -10, 10, TIME);
        }
            
        
        // 9 - 10 sec
        if (TIME >= 9 && TIME <= 10) {
            leftForearmRotation2 = animateVariable(9, 10, 10, 0, TIME);
        }

        // 10 sec: gunShoot() starts
        if (TIME >= 10 && TIME <= 10.65) {
            recoilRotation = animateVariable(10, 10.5, 0, 20, TIME) ||
                             animateVariable(10.5, 10.65, 20, 0, TIME);
        }

        if (TIME >= 10 && TIME <= 11) {
            bulletExist = 1;
            bulletPos = animateVariable(10, 11, 0, 50, TIME);
            eye[0] = animateVariable(10, 11, 2, 20, TIME);
            eye[1] = animateVariable(10, 11, 2, 0, TIME);
            eye[2] = animateVariable(10, 11, 0, 0, TIME);
        }

        // Sec 11 - 14: Camera and FOV changes
        if (TIME >= 11 && TIME <= 14) {
            bulletExist = 0; //bulletDisappear
            redC = 1.0;    // Set red component of an object
            eye[0] = animateVariable(11, 14, eye[0], 40, TIME); 
            eye[1] = animateVariable(11, 14, eye[1], 30, TIME); 
            eye[2] = animateVariable(11, 14, eye[2], 20, TIME); 
            at[0] = animateVariable(11, 14, at[0], 15, TIME);   
            at[1] = at[1];                                      // Y unchanged
            at[2] = at[2];                                      // Z unchanged
            fov = animateVariable(11, 14, 90, 45, TIME);        // Field of View (FOV)
        }

        // Sec 14 - 20: Camera, FOV, and at changes
        if (TIME >= 14 && TIME <= 20) {
            eye[0] = animateVariable(14, 20, eye[0], 30, TIME); 
            eye[1] = animateVariable(14, 20, eye[1], 10, TIME); 
            eye[2] = animateVariable(14, 20, eye[2], 15, TIME); 
            at[0] = animateVariable(14, 20, at[0], 18, TIME);   
            fov = animateVariable(14, 20, 45, 90, TIME);        
        }

        // Sec 14 - 17: Non-linear rangeMove and rangeStart
        if (TIME >= 14 && TIME <= 17) {
            let t = (TIME - 14) / (17 - 14); // Normalized time (0 to 1)
            rangeMove = 10 * Math.sin(t * Math.PI / 2); // Easing with sine for smooth transition
            rangeStart = 1; // Set to 1 at the start of this range
        }

        // Sec 17 - 20: rangeMove2 linearly decreases
        if (TIME >= 17 && TIME <= 20) {
            rangeMove2 = animateVariable(17, 20, 30, 0, TIME); // Linearly decreases
        }

    }
    window.requestAnimFrame(render);


    //show fps, time and animflag value in console every 2 seconds
    if (TIME - lastFPSUpdateTime >= 2.0) {
        fps = Math.round(frameCount / (TIME - lastFPSUpdateTime));
        lastFPSUpdateTime = TIME;  // Update last FPS update time
        frameCount = 0;            // Reset frame count

        // Output FPS, TIME, and animFlag values to the console
        console.log(`FPS: ${fps}, TIME: ${TIME.toFixed(2)}, animFlag: ${animFlag}, monitoring: ${redC}`);
    }

}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;
    
    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };
    
    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
        controller.dragging = false;
    };
    
    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}


function drawSimplePerson() {
    gPush();
    {
        // Body
        gPush();
        setColor(materialDiffuse);
        gTranslate(0, -1.5, 0);
        gScale(0.7, 1.8, 0.5);
        drawCube();
        gPop();
        
        // Head
        gPush();
        setColor(materialRed);
        gTranslate(0, 1.0, 0);
        gScale(0.6, 0.6, 0.6);
        drawSphere();
        gPop();
        
        // Left Arm (Upper and Lower - Movable)
        gPush();
        gTranslate(1, 0.5, 0);  // Position the upper arm to the left side
        gTranslate(0, -0.4, 0); // Move to the top of the upper arm (shoulder joint)
        gRotate(leftArmRotation, 0, 0, 1);  // Rotate upper arm around the shoulder >>leftArmRotation
        gTranslate(0, 0.4, 0);  // Move back to center of upper arm
        gPush();
        {
            // Upper Arm
            gPush();
            gScale(0.3, 0.8, 0.3);
            drawCube();
            gPop();

            // Lower Arm - Attached to Upper Arm
            gPush();
            gTranslate(0, 1.2, 0);  // Move to the end of the upper arm (elbow joint)
            gTranslate(0, -0.6, 0);  // Adjust to the top of the lower arm
            gRotate(leftForearmRotation, 0, 0, 1);  // Rotate lower arm around the elbow >>leftForearmRotation
            gRotate(leftForearmRotation2, 0, 1, 0);  // shaking arm
            gTranslate(0, 0.6, 0); // Move back to center of lower arm
                gPush();
                {
                    // Lower Arm
                    gPush();
                    gScale(0.2, 0.6, 0.2);
                    drawCube();
                    gPop();

                    // Attach gun and bullet to the end of the lower arm
                    gTranslate(0.4, 1.1, 0);
                    gScale(0.3, 0.3, 0.3);
                    drawGun();    // Draw gun at the end of the left arm
                }
                gPop();
            gPop();
        }
        gPop();
        gPop();
        
        // Right Arm (Static, Relaxed Position)
        gPush();
        setColor(vec4(1.0, 0.0, 0.0, 1.0));
        gTranslate(-1.2, -0.8, 0);
        gTranslate(0, -0.4, 0);
        gRotate(-20, 0, 0, 1);
        gTranslate(0, 0.4, 0);
        gScale(0.3, 1.2, 0.3);
        drawCube();
        gPop();
    }
    gPop();
}

function drawGun() {
    gPush();
    setColor(vec4(0.0, 0.0, 0.0, 1.0));
    gTranslate(-3, 0, 0); // Position of the gun
    gTranslate(-0.3, 0, 0);
    gRotate(recoilRotation +100, 0, 0, 1); // Gun angle for recoil >>recoilRotation
    gTranslate(0.3, 0, 0);
    gPush();
    {
        // Main body of the gun
        gPush();
        gScale(1, 0.5, 0.4);
        drawCube();
        gPop();

        // Grip of the gun
        gPush();
        gTranslate(-1.5, -0.5, 0);
        gScale(0.5, 1, 0.4);
        drawCube();
        gPop();
    }
    gPop();
    gPop();
}

function drawBullet() {
    if (bulletExist) {
        gPush();
        gTranslate(-2, 0, 0); // Initial bullet position
        gTranslate(bulletPos, 0, 0); // Dynamic bullet movement
        gPush();
        {
            gRotate(90, 0, 1, 0); // Rotate for proper orientation
            gScale(0.3, 0.3, 0.5);
            drawCylinder(); // Main bullet body

            // Bullet tip
            gRotate(180, 0, 1, 0);
            gScale(0.5, 0.5, 0.3);
            gTranslate(0, 0, 2.2);
            drawCone(); // Front tip
            gTranslate(0, 0, -2.2);
            drawCone(); // Back tip
        }
        gPop();
        gPop();
    }
}

// Animation Function Template
function animateVariable(startTime, endTime, startValue, endValue, currentTime) {
    if (currentTime < startTime || currentTime > endTime) {
        return null; // Animation hasn't started
    } else if (currentTime >= startTime && currentTime <= endTime) {
        let t = (currentTime - startTime) / (endTime - startTime); // Normalized time (0 to 1)
        return startValue + t * (endValue - startValue); // Interpolated value
    } else if (currentTime > endTime) {
        return endValue; // Return end value after animation ends
    } else {
        return startValue; // Return start value before animation begins
    }
}

function drawRange(){
    if (rangeStart){
        //>>here start a new texture for all the range
        setTexture(1, 1);

        //from bottom raise
        gPush();
        gTranslate(0, rangeMove - 10, 0);
            gPush();
            gTranslate(10, -3, 0);
            gScale(1, 2, 10);
            drawCube();
            gPop();

            gPush();
            gTranslate(20, -2, -6);
            gScale(1, 5, 2);
            drawCube();
            gPop();

            gPush();
            gTranslate(20, -2, 6);
            gScale(1, 5, 2);
            drawCube();
            gPop();

            gPush();
            gTranslate(15, -2, -14);
            gScale(1, 5, 2);
            drawCube();
            gPop();

            gPush();
            gTranslate(15, -2, 14);
            gScale(1, 5, 2);
            drawCube();
            gPop();
        gPop();

        setTexture(1, 0); //before is the barricates that is wood

        //from top drop
        gPush();
        gTranslate(0, rangeMove2, 0);

        gPush();
        gTranslate(30, 0, -11);
        materialChanging = vec4(redC, greenC, 0.0, 1.0);
        setColor(materialChanging);
        drawSphere();
        gPop();

        gPush();
        gTranslate(30, 0, 11);
        materialChanging = vec4(redC, greenC, 0.0, 1.0);
        setColor(materialChanging);
        drawSphere();
        gPop();

        gPop();
        
    }
    
}
