var gl;

var g_canvasID;

var gui = new GUI();

var webGLView = new WebGLView();

var raytracedView = new RayTracedView();

var g_myPic = new ImageBuffer(512, 512);

var g_myScene = new Scene();

var g_SceneNum = 0;

var G_SCENE_MAX = 3;

var g_AAcode = 1;  // -1, -2, -3, -4 == No Jitter Super Sampled

var g_isJitter = 0;

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
    g_AAcode += 1;
    if (g_AAcode > G_AA_MAX) g_AAcode = 1; 
    if (g_AAcode == 1) {
        if (g_isJitter == 0) {
            document.getElementById('AAreport').innerHTML =
                "1 sample/pixel. No jitter.";
            console.log("1 sample/pixel. No Jitter.");
        }
        else {
            document.getElementById('AAreport').innerHTML =
                "1 sample/pixel, but jittered.";
            console.log("1 sample/pixel, but jittered.")
        }
    }
    else { // g_AAcode !=1
        if (g_isJitter == 0) {
            document.getElementById('AAreport').innerHTML =
                g_AAcode + "x" + g_AAcode + " Supersampling. No jitter.";
            console.log(g_AAcode, "x", g_AAcode, "Supersampling. No Jitter.");
        }
        else {
            document.getElementById('AAreport').innerHTML =
                g_AAcode + "x" + g_AAcode + " JITTERED Supersampling";
            console.log(g_AAcode, "x", g_AAcode, " JITTERED Supersampling.");
        }
    }
}
function onJitterButton() {
    //=============================================================================
    console.log('ON-JITTER button!!');
    if (g_isJitter == 0) g_isJitter = 1;
    else g_isJitter = 0;

    if (g_AAcode == 1) {
        if (g_isJitter == 0) {
            document.getElementById('AAreport').innerHTML =
                "1 sample/pixel. No jitter.";
            console.log("1 sample/pixel. No Jitter.");
        }
        else {
            document.getElementById('AAreport').innerHTML =
                "1 sample/pixel, but jittered.";
            console.log("1 sample/pixel, but jittered.")
        }
    }
    else { // g_AAcode !=0
        if (g_isJitter == 0) {
            document.getElementById('AAreport').innerHTML =
                g_AAcode + "x" + g_AAcode + " Supersampling. No jitter.";
            console.log(g_AAcode, "x", g_AAcode, "Supersampling. No Jitter.");
        }
        else {
            document.getElementById('AAreport').innerHTML =
                g_AAcode + "x" + g_AAcode + " JITTERED Supersampling";
            console.log(g_AAcode, "x", g_AAcode, " JITTERED Supersampling.");
        }
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