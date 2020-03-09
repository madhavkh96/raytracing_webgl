
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

        this.hitList = [];

        this.colr = vec4.clone(g_myScene.skyColor);
    }

    init() {
        this.hitGeom = -1;

        this.hitNum = -1;

        this.t0 = g_t0_MAX;

        this.hitList = [];

        vec4.set(this.hitPt, this.t0, 0, 0, 1);

        vec4.set(this.surfNorm, -1, 0, 0, 0);

        vec4.set(this.viewN, -1, 0, 0, 0);

        vec4.copy(this.modelHitPt, this.hitPt);
    }


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
        this.worldLight = new Light();

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

        var iNow = -1;

        switch (num) {
            case 0:
                //Ground Plane
                this.item.push(new Geometery(RT_GNDPLANE));
                iNow = this.item.length - 1;

                //Add the disk
                this.item.push(new Geometery(RT_DISK));
                iNow = this.item.length - 1;

                //Add the transformations as done in WebGL Build
                this.item[iNow].setIdentity();
                this.item[iNow].rayTranslate(0, 0, 2.0);
                this.item[iNow].rayRotate(0.25 * Math.PI, 1, 0, 0);

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


        this.pixFlag = 0;
        var cont = true;
        var myHit = new Hit();

        var x_factor = 0;
        var y_factor = 0;

        for (j = 0; j < this.imgBuf.ySize; j++) {
            for (i = 0; i < this.imgBuf.xSize; i++) {
                for (var a = 0; a < g_AAcode; a++) {

                    switch (g_AAcode) {
                        case 1:
                            if (g_isJitter == 0) {
                                x_factor = 0.5;
                                y_factor = 0.5;
                            } else {
                                x_factor = 0.5 * Math.random();
                                y_factor = 0.5;
                            }
                            break;
                        case 2:
                            if (g_isJitter == 0) {
                                x_factor = 0.33;
                                y_factor = 0.33;
                            } else {
                                x_factor = 0.33 * Math.random();
                                y_factor = 0.33;
                            }
                            break;
                        case 3:
                            if (g_isJitter == 0) {
                                x_factor = 0.25;
                                y_factor = 0.25;
                            } else {
                                x_factor = 0.25 * Math.random();
                                y_factor = 0.25;
                            }
                            break;
                        case 4:
                            if (g_isJitter == 0) {
                                x_factor = 0.20;
                                y_factor = 0.20;
                            } else {
                                x_factor = 0.20 * Math.random();
                                y_factor = 0.20;
                            }
                            break;
                    }

                    this.rayCamera.setEyeRay(this.eyeRay, i + (a * x_factor), j + (a * y_factor));

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

                    this.worldLight.findShade(colr, myHit, this.item, cont);

                    final_colr[0] += colr[0];
                    final_colr[1] += colr[1];
                    final_colr[2] += colr[2];
                }

                if (!cont)
                    break;

                final_colr[0] /= g_AAcode;
                final_colr[1] /= g_AAcode;
                final_colr[2] /= g_AAcode;


                if (i == this.imgBuf.xSize / 2 && j == this.imgBuf.ySize / 4) {
                    console.log(myHit.hitGeom);
                    console.log(myHit.t0);
                    //this.worldLight.findShade(colr, myHit, this.item);
                    console.log(myHit.hitList);
                    console.log(myHit.hitPt);
                }
                var idx = (j * this.imgBuf.xSize + i) * this.imgBuf.pixSize;	// Array index at pixel (i,j) 

                this.imgBuf.fBuf[idx] = final_colr[0];
                this.imgBuf.fBuf[idx + 1] = final_colr[1];
                this.imgBuf.fBuf[idx + 2] = final_colr[2];

                final_colr = vec4.fromValues(0, 0, 0, 0);
            }
            if (!cont)
                break;
        }
        this.imgBuf.float2int();
    }
}