
var g_t0_MAX = 1.23E16; // The farthest possible hit point distance

class Hit {
    constructor() {

        this.hitGeom = null; // The Geometery object we hit with the ray in the scene.

        this.hitNum = -1;    // Default: SKY color

        this.t0 = g_t0_MAX;  // default is the farthest point that the ray hits

        this.hitPt = vec4.create();

        this.surfNorm = vec4.create();

        this.viewN = vec4.create();

        this.isEntering = true;
        this.modelHitPt = vec4.create();
        this.colr = vec4.clone(g_myScene.skyColor);
    }

    init() {
        this.hitGeom = -1;
        this.hitNum = -1;
        this.t0 = g_t0_MAX;

        vec4.set(this.hitPt, this.t0, 0, 0, 1);

        vec4.set(this.surfNorm, -1, 0, 0, 0);

        vec4.set(this.viewN, -1, 0, 0, 0);

        vec4.copy(this.modelHitPt, this.hitPt);
    }


    //Why? we need this. we already have items[] in the Scene Class.

    hitList() {
        //=============================================================================
        // Holds ALL ray/object intersection results from tracing a single ray(CRay)
        // sent through ALL shape-defining objects (CGeom) in in the item[] array in 
        // our scene (CScene).  A CHitList object ALWAYS holds at least one valid CHit 
        // 'hit-point', as we initialize the pierce[0] object to the CScene's 
        //  background color.  Otherwise, each CHit element in the 'pierce[]' array
        // describes one point on the ray where it enters or leaves a CGeom object.
        // (each point is in front of the ray, not behind it; t>0).
        //  -- 'iEnd' index selects the next available CHit object at the end of
        //      our current list in the pierce[] array. if iEnd=0, the list is empty.
        //  -- 'iNearest' index selects the CHit object nearest the ray's origin point.
    }
}

class Scene {
    constructor() {
        this.RAY_EPSILON = 1.0E-15;

        this.imgBuf = g_myPic;

        this.eyeRay = new Ray();
        this.rayCamera = new Camera();

        this.item = [];
    }

    setImgBuf(nuImg) {
        this.rayCamera.setSize(nuImg.xSize, nuImg.ySize);
        this.imgBuf = nuImg;
    }

    initScene(num) {
        if (num == undefined) num = 0;

        this.rayCamera.rayPerspective(gui.camFovy, gui.camAspect, gui.camNear);
        this.rayCamera.rayLookAt(gui.camEyePt, gui.camAimPt, gui.camUpVec);
        this.setImgBuf(g_myPic);

        this.skyColor = vec4.fromValues(0.0, 0.0, 0.55, 1.0);

        this.item.length = 0;

        switch (num) {
            case 0:
                this.item.push(new Geometery(RT_GNDPLANE));
                break;
            case 1:
                break;
            default:
                this.init(0);
                break;
        }
    }

    makeRayTracedImage() {

        this.rayCamera.rayPerspective(gui.camFovy, gui.camAspect, gui.camNear);
        this.rayCamera.rayLookAt(gui.camEyePt, gui.camAimPt, gui.camUpVec);

        this.setImgBuf(this.imgBuf);

        var colr = vec4.create();
        var idx = 0;
        var i, j;
        var k;

        var final_colr = vec4.create();

        var n_pixels = 0;

        this.pixFlag = 0;

        var myHit = new Hit();
        var factor = 0;
        for (j = 0; j < this.imgBuf.ySize; j++) {
            for (i = 0; i < this.imgBuf.xSize; i++) {
                for (var a = 0; a < g_AAcode; a++) {

                    switch (g_AAcode) {
                        case 1:
                            if (g_isJitter == 0) {
                                factor = 0.5;
                            } else {
                                factor = 0.5 * Math.random();
                            }
                            break;
                        case 2:
                            if (g_isJitter == 0) {
                                factor = 0.33;
                            } else {
                                factor = 0.33 * Math.random();
                            }
                            break;
                        case 3:
                            if (g_isJitter == 0) {
                                factor = 0.25;
                            } else {
                                factor = 0.25 * Math.random();
                            }
                            break;
                        case 4:
                            if (g_isJitter == 0) {
                                factor = .20;
                            } else {
                                factor = 0.20 * Math.random();
                            }
                            break;
                    }

                this.rayCamera.setEyeRay(this.eyeRay, i + (a * factor), j + (a * factor));
                //this.rayCamera.setEyeRay(this.eyeRay, i, j);
                    myHit.init();

                    for (k = 0; k < this.item.length; k++) {
                        this.item[k].traceShape(this.eyeRay, myHit);
                    }

                    // Find eyeRay color from myHit----------------------------------------
                    if (myHit.hitNum == 0) {  // use myGrid tracing to determine color
                        vec4.copy(colr, myHit.hitGeom.gapColor);
                    }
                    else if (myHit.hitNum == 1) {
                        vec4.copy(colr, myHit.hitGeom.lineColor);
                    }
                    else { // if myHit.hitNum== -1)
                        vec4.copy(colr, this.skyColor);
                    }

                    final_colr[0] += colr[0];
                    final_colr[1] += colr[1];
                    final_colr[2] += colr[2];
                }
                    //this.eyeRay.origin = vec4.fromValues(0, 0, 0, 1);

                final_colr[0] /= g_AAcode;
                final_colr[1] /= g_AAcode;
                final_colr[2] /= g_AAcode;

                var idx = (j * this.imgBuf.xSize + i) * this.imgBuf.pixSize;	// Array index at pixel (i,j) 

                this.imgBuf.fBuf[idx] = final_colr[0];
                this.imgBuf.fBuf[idx + 1] = final_colr[1];
                this.imgBuf.fBuf[idx + 2] = final_colr[2];

                final_colr = vec4.fromValues(0, 0, 0, 0);
            }
        }
        
        console.log(this.rayCamera.ufrac);
        this.imgBuf.float2int();
        console.log(n_pixels);
    }
}