//import { color } from "../lib/build/dat.gui.module";

var g_t0_MAX = 1.23E16; // The farthest possible hit point distance


class SurfaceDetails{
    constructor() {
        this.ambi_I = vec4.fromValues(0.1, 0.1, 0.55, 1);
        this.diff_I = vec4.fromValues(0.0, 0.0, 0.55, 1);
        this.spec_I = vec4.fromValues(0.6, 0.6, 0.6, 1);
        this.emiss_I = vec4.fromValues(0, 0, 0, 1);
        this.shine = 100;
    }
}

class Hit {
    constructor() {

        this.hitGeom = null; // The Geometery object we hit with the ray in the scene.

        this.hitNum = -1;    // Default: SKY color

        this.t0 = g_t0_MAX;  // default is the farthest point that the ray hits

        this.hitPt = vec4.create();

        this.surfNorm = vec4.create();

        this.viewN = vec4.create();

        this.surfaceProperties = new SurfaceDetails();

        this.isEntering = true;

        this.modelHitPt = vec4.create();

        this.hitList = [];

        this.shadow = false;

        this.colr = vec4.clone(g_myScene.skyColor);
    }

    init() {
        this.hitGeom = -1;

        this.hitNum = -1;

        this.t0 = g_t0_MAX;

        this.hitList = [];

        this.surfaceProperties = new SurfaceDetails();

        this.shadow = false;

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
        this.headLight = new Light();

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
            case 1:
                //Ground Plane
                this.item.push(new Geometery(RT_GNDPLANE));
                iNow = this.item.length - 1;


                this.item[iNow].setEmissive(0.0, 0.0, 0.0);
                this.item[iNow].setAmbient(0.4, 0.1, 0.1);
                this.item[iNow].setDiffuse(0.6, 0.0, 0.0);
                this.item[iNow].setSpecular(0.2, 0.2, 0.2);
                this.item[iNow].setShine(100.0);

                //Add the disk
                this.item.push(new Geometery(RT_DISK));
                iNow = this.item.length - 1;

                //Add the transformations as done in WebGL Build
                this.item[iNow].setIdentity();
                this.item[iNow].rayTranslate(0, 0, 2.0);
                this.item[iNow].rayRotate(0.25 * Math.PI, 1, 0, 0);

                //Add the material 
                this.item[iNow].setEmissive(0.0, 0.0, 0.0);
                this.item[iNow].setAmbient(0.05, 0.05, 0.05);
                this.item[iNow].setDiffuse(0.0, 0.6, 0.0);
                this.item[iNow].setSpecular(0.2, 0.2, 0.2);
                this.item[iNow].setShine(100.0);

                //Add Sphere
                this.item.push(new Geometery(RT_SPHERE));
                iNow = this.item.length - 1;

                this.item[iNow].setIdentity();
                this.item[iNow].rayTranslate(0, 0, 6.0);

                //Add the material 
                this.item[iNow].setEmissive(0.0, 0.5, 0.0);
                this.item[iNow].setAmbient(0.05, 0.05, 0.05);
                this.item[iNow].setDiffuse(0.0, 0.6, 0.0);
                this.item[iNow].setSpecular(0.6, 0.6, 0.6);
                this.item[iNow].setShine(100.0);

                break;
            case 0:
                this.item.push(new Geometery(RT_GNDPLANE));
                iNow = this.item.length - 1;


                this.item[iNow].setEmissive(0.0, 0.0, 0.0);
                this.item[iNow].setAmbient(0.4, 0.4, 0.0);
                this.item[iNow].setDiffuse(0.8, 0.8, 0.0);
                this.item[iNow].setSpecular(0.02, 0.02, 0.02);
                this.item[iNow].setShine(100.0);

                this.item.push(new Geometery(RT_SPHERE));
                iNow = this.item.length - 1;

                this.item[iNow].setIdentity();
                this.item[iNow].rayTranslate(0, 0, 1.0);

                //Add the material 
                this.item[iNow].setEmissive(0.0, 0.0, 0.0);
                this.item[iNow].setAmbient(0.05, 0.3, 0.05);
                this.item[iNow].setDiffuse(0.0, 0.6, 0.0);
                this.item[iNow].setSpecular(0.2, 0.2, 0.2);
                this.item[iNow].setShine(60.0);

                this.item.push(new Geometery(RT_SPHERE));
                iNow = this.item.length - 1;

                this.item[iNow].setIdentity();
                this.item[iNow].rayTranslate(-1.0, 2.5, 1.0);

                //Add the material 
                this.item[iNow].setEmissive(0.0, 0.0, 0.0);
                this.item[iNow].setAmbient(0.05, 0.3, 0.05);
                this.item[iNow].setDiffuse(0.0, 0.6, 0.0);
                this.item[iNow].setSpecular(0.2, 0.2, 0.2);
                this.item[iNow].setShine(60.0);

                this.item.push(new Geometery(RT_SPHERE));
                iNow = this.item.length - 1;

                this.item[iNow].setIdentity();
                this.item[iNow].rayTranslate(-3.0, 0.0, 3.0);
                this.item[iNow].rayScale(1.0, 0.5, 3.0);

                //Add the material 
                this.item[iNow].setEmissive(0.0, 0.0, 0.0);
                this.item[iNow].setAmbient(0.05, 0.3, 0.05);
                this.item[iNow].setDiffuse(0.0, 0.6, 0.0);
                this.item[iNow].setSpecular(0.2, 0.2, 0.2);
                this.item[iNow].setShine(60.0);

                break;
            case 2:
                this.item.push(new Geometery(RT_GNDPLANE));
                iNow = this.item.length - 1;

                this.item[iNow].setEmissive(0.0, 0.0, 0.0);
                this.item[iNow].setAmbient(0.0, 0.4, 0.4);
                this.item[iNow].setDiffuse(0.0, 0.6, 0.6);
                this.item[iNow].setSpecular(0.2, 0.2, 0.2);
                this.item[iNow].setShine(60.0);

                //Add the disk
                this.item.push(new Geometery(RT_DISK));
                iNow = this.item.length - 1;

                //Add the transformations as done in WebGL Build
                this.item[iNow].setIdentity();
                this.item[iNow].rayTranslate(0, 0, 2.0);
                this.item[iNow].rayRotate(0.25 * Math.PI, 1, 0, 0);

                //Add the material 
                this.item[iNow].setEmissive(0.0, 0.0, 0.0);
                this.item[iNow].setAmbient(0.0, 0.1, 0.4);
                this.item[iNow].setDiffuse(0.0, 0.2, 0.8);
                this.item[iNow].setSpecular(0.2, 0.2, 0.2);
                this.item[iNow].setShine(100.0);

                //Add the disk
                this.item.push(new Geometery(RT_DISK));
                iNow = this.item.length - 1;

                //Add the transformations as done in WebGL Build
                this.item[iNow].setIdentity();
                this.item[iNow].rayTranslate(0, -1.0, 2.0);
                this.item[iNow].rayRotate(0.75 * Math.PI, 1, 0, 0);

                //Add the material 
                this.item[iNow].setEmissive(0.125, 0.05, 0.2);
                this.item[iNow].setAmbient(0.25, 0.1, 0.4);
                this.item[iNow].setDiffuse(0.5, 0.2, 0.8);
                this.item[iNow].setSpecular(0.2, 0.2, 0.2);
                this.item[iNow].setShine(100.0);

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
                        this.item[k].traceShape(this.eyeRay, myHit, false);
                    }

                   
                    //// Find eyeRay color from myHit----------------------------------------
                    //if (myHit.hitNum == 0) {  // use myGrid tracing to determine color
                    //    vec4.copy(colr, myHit.hitGeom.gapColor);
                    //}
                    //else if (myHit.hitNum == 1) {
                    //    vec4.copy(colr, myHit.hitGeom.lineColor);
                    //}
                    //else { // if myHit.hitNum== -1)
                    //    vec4.copy(colr, this.skyColor);
                    //}

                    this.phong(colr, myHit, this.item, 2, this.worldLight, 2);

                    final_colr[0] += colr[0];
                    final_colr[1] += colr[1];
                    final_colr[2] += colr[2];

                    colr = vec4.fromValues(0, 0, 0, 1);
                }

                if (!cont)
                    break;

                final_colr[0] /= g_AAcode;
                final_colr[1] /= g_AAcode;
                final_colr[2] /= g_AAcode;

                //if (i == g_myScene.imgBuf.xSize / 2 && j == g_myScene.imgBuf.ySize / 2) {
                //    console.log(myHit.surfNorm);
                //    reflection = vec4.create();
                //    this.reflect(reflection, myHit.surfNorm, )
                //}


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

    phong(out, rayHit, objects, recursion, light, initial_recur) {

        if (recursion == 0)
            return;

        var shadowFeeler = new Ray();
        var shadowHit = new Hit();
        var viewVector = vec4.create();
        var reflectedRay = new Ray();
        var reflectedHit = new Hit();
        var color_percent = vec4.create();

        if (recursion == initial_recur) {
            color_percent = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
        } else {
        vec4.copy(color_percent, rayHit.surfaceProperties.spec_I);
        }

        vec4.copy(viewVector, rayHit.viewN);

        //Calculating and adding emissive and ambient colors
        var emissive = vec4.clone(rayHit.surfaceProperties.emiss_I);

        var ambient = vec4.create();

        vec4.multiply(ambient, rayHit.surfaceProperties.ambi_I, light.lightAmbi);

        out[0] += (emissive[0] + ambient[0]) * color_percent[0];
        out[1] += (emissive[1] + ambient[1]) * color_percent[1];
        out[2] += (emissive[2] + ambient[2]) * color_percent[2];
        out[3] = 1.0;

        //Setting up the shadow feeler ray
        shadowFeeler.origin = vec4.clone(rayHit.hitPt);

        shadowFeeler.origin[0] += viewVector[0] * RAY_EPSILON;
        shadowFeeler.origin[1] += viewVector[1] * RAY_EPSILON;
        shadowFeeler.origin[2] += viewVector[2] * RAY_EPSILON;


        reflectedRay.origin = vec4.clone(shadowFeeler.origin);

        vec4.subtract(shadowFeeler.dir, light.position, shadowFeeler.origin);

        shadowHit.init();

        reflectedHit.init();

        for (var i = 0; i < objects.length; i++) {
            objects[i].traceShape(shadowFeeler, shadowHit, true);
        }



        if (shadowHit.shadow && initial_recur == recursion) {
            this.reflect(reflectedRay.dir, rayHit.surfNorm, rayHit.viewN);

        } else {
            //Calculating Attenuation;
            var dist = this.distanceToLight(rayHit.hitPt, light);

            var att = 1 / dist;

            var diffuse = vec4.create();
            vec4.multiply(diffuse, rayHit.surfaceProperties.diff_I, light.lightDiff);
            vec4.scale(diffuse, diffuse, att * Math.max(0, vec4.dot(rayHit.surfNorm, shadowFeeler.dir)));


            var lightReflection = vec4.create();
            //Compute R.V
            var specular = vec4.create();
            this.reflect(lightReflection, rayHit.surfNorm, shadowFeeler.dir);
            var RdotV = 0;
            vec4.dot(RdotV, lightReflection, viewVector);
            vec4.multiply(specular, rayHit.surfaceProperties.spec_I, light.lightSpec);
            vec4.scale(specular, specular, att * Math.pow(RdotV, rayHit.surfaceProperties.shine));

            this.reflect(reflectedRay.dir, rayHit.surfNorm, rayHit.viewN);

            out[0] += (diffuse[0] + specular[0]) * color_percent[0];
            out[1] += (diffuse[1] + specular[1])* color_percent[1];
            out[2] += (diffuse[2] + specular[2])* color_percent[2];
        }

        recursion--;


        for (var i = 0; i < objects.length; i++) {
            objects[i].traceShape(reflectedRay, reflectedHit, false);
        }

        this.phong(out, reflectedHit, objects, recursion, light, initial_recur);
    }

    //Helper Functions
    reflect(out, normal, lightVector) {

        //Make Lightvector Unit Length
        vec4.normalize(lightVector, lightVector);

        //Find C
        var C = vec4.create();
        var NdotL = vec4.dot(lightVector, normal);

        vec4.scale(C, normal, NdotL);

        //Find R
        var R = vec4.create();
        var C_2 = vec4.create();

        vec4.scale(C_2, C, 2);

        vec4.subtract(R, C_2, lightVector);


        out[0] = R[0];
        out[1] = R[1];
        out[2] = R[2];
        out[3] = 0.0;

        return out;
    }

    distanceToLight(hitPosn, light) {
        var distance = 0;

        distance = Math.sqrt(Math.pow(hitPosn[0] - light.position[0], 2) +
            Math.pow(hitPosn[1] - light.position[1], 2) +
            Math.pow(hitPosn[2] - light.position[2], 2));

        return distance;
    }
}