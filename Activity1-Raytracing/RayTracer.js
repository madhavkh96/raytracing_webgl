
var gl;

var g_canvasID;

var gui = new GUI();

var webGLView = new WebGLView();

var raytracedView = new RayTracedView();

var g_myPic = new ImageBuffer(512, 512);

var g_myScene = new Scene();

var g_SceneNum = 0;

var G_SCENE_MAX = 3;

var g_AAcode = -1;  // -1, -2, -3, -4 == No Jitter Super Sampled

var G_AA_MAX = 4;

function main() {

    g_canvasID = document.getElementById('webgl');

    gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true });

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.clearColor(0.2, 0.2, 0.2, 1);	  // set RGBA color for clearing <canvas>
    gl.enable(gl.DEPTH_TEST); 

    gui.init();
    g_myScene.initScene(0);

    webGLView.init();
    raytracedView.init();

    onBrowserResize();

    drawAll();

    g_myScene.makeRayTracedImage();
    raytracedView.switchToMe();
    raytracedView.reload();
    drawAll();
}

function drawAll() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Left ViewPort
    gl.viewport(0, 0, gl.drawingBufferWidth * 0.5, gl.drawingBufferHeight);

    webGLView.switchToMe();
    webGLView.adjust();
    webGLView.draw();

    //Right ViewPort
    gl.viewport(gl.drawingBufferWidth * 0.5, 0, gl.drawingBufferWidth * 0.5, gl.drawingBufferHeight);

    raytracedView.switchToMe();
    raytracedView.adjust();
    raytracedView.draw();
}


function onSuperSampleButton() {
    //=============================================================================
    //console.log('ON-SuperSample BUTTON!');
    if (g_AAcode < 0) {  // next-lower antialiasing code, but >= -G_AA_MAX.
        g_AAcode = -g_AAcode;							// remove the negative sign.
        g_AAcode = 1 + (g_AAcode % G_AA_MAX); // 1,2,3,4,1,2,3,4,1,2, etc
        g_AAcode = -g_AAcode;							// restore the negative sign.
        // Display results on-screen:
        console.log(-g_AAcode + 'x' + -g_AAcode + ' Supersampling; NO jitter.');
        document.getElementById('AAreport').innerHTML =
            -g_AAcode + 'x' + -g_AAcode + ' Supersampling, NO jitter.';
    }
    else {		// next-higher antialiasing code, but <= G_AA_MAX
        g_AAcode = 1 + (g_AAcode % G_AA_MAX);	// 1,2,3,4,1,2,3,4, etc.
        // Display results on-screen:
        console.log('Jittered ' + g_AAcode + 'x' + g_AAcode + ' Supersampling.');
        document.getElementById('AAreport').innerHTML =
            'Jittered ' + g_AAcode + 'x' + g_AAcode + ' Supersampling.';
    }

    //Increase the Image Buffer Size Approach
    //g_myPic = new ImageBuffer(2**9 * (2**-g_AAcode), 2**9 * (2**-g_AAcode));
    //raytracedView.init();
    //g_myScene.initScene(0);
    //g_myScene.makeRayTracedImage();
    //drawAll();
    //raytracedView.switchToMe();
    //raytracedView.reload();
    //drawAll();
}
function onJitterButton() {
    //=============================================================================
    console.log('ON-JITTER button!!');
    g_AAcode = -g_AAcode;		// flip the sign:
    if (g_AAcode < 0) {  	// Revise on-screen report
        console.log(-g_AAcode, 'x', -g_AAcode, ' Supersampling; NO jitter.');
        document.getElementById('AAreport').innerHTML =
            -g_AAcode + 'x' + -g_AAcode + ' Supersampling, NO jitter.';
    }
    else {
        console.log('Jittered ', g_AAcode, 'x', g_AAcode, ' Supersampling.');
        document.getElementById('AAreport').innerHTML =
            'Jittered ' + g_AAcode + 'x' + g_AAcode + ' Supersampling.';
    }
}

function onSceneButton() {
    //=============================================================================
    console.log('ON-SCENE BUTTON!');
    g_SceneNum = g_SceneNum + 1;   // increment scene number, and
    if (g_SceneNum < 0) g_SceneNum = G_SCENE_MAX - 1;     // keep it in-range.
    else if (g_SceneNum >= G_SCENE_MAX) g_SceneNum = 0;
    document.getElementById('SceneReport').innerHTML =
        'Show Scene Number' + g_SceneNum;
    // Change g_myPic contents:
    g_myPic.setTestPattern(g_SceneNum);
    // transfer g_myPic's new contents to the GPU;
    rayView.switchToMe(); // be sure OUR VBO & shaders are in use, then
    rayView.reload();     // re-transfer VBO contents and texture-map contents
    drawAll();
}

function onBrowserResize() {

    if (innerWidth > 2 * innerHeight) {  // fit to brower-window height
        g_canvasID.width = 2 * innerHeight - 20;  // (with 20-pixel margin)
        g_canvasID.height = innerHeight - 20;   // (with 20-pixel margin_
    }
    else {	// fit canvas to browser-window width
        g_canvasID.width = innerWidth - 20;       // (with 20-pixel margin)
        g_canvasID.height = 0.5 * innerWidth - 20;  // (with 20-pixel margin)
    }

    drawAll();     // re-draw browser contents using the new size.
}