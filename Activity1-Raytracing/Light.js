
//import { vec4 } from "../lib/glmatrix";

class Light {
    constructor(x, y, z) {
        if (x != null && y != null && z != null) {
            this.position = vec4.fromValues(x, y, z, 1);
        } else {
            this.position = vec4.fromValues(0, 0, 20, 1);
        }
    }

    findShade(out, rayHitPt, allObjects, cont) {
        var RAY_EPSILON = 1.0E-15;

        var myRay = new Ray();

        var rayHit = new Hit();

        myRay.origin = vec4.clone(rayHitPt.hitPt);


        myRay.origin[0] += rayHitPt.surfNorm[0] * RAY_EPSILON;
        myRay.origin[1] += rayHitPt.surfNorm[1] * RAY_EPSILON;
        myRay.origin[2] += rayHitPt.surfNorm[2] * RAY_EPSILON;

        vec4.subtract(myRay.dir, this.position, myRay.origin);

        rayHit.init();

        for (var i = 0; i < allObjects.length; i++) {
            allObjects[i].traceMe(myRay, rayHit);
        }

        //For Debugging

        //if (rayHit.hitList.length != 0) {
        //    if (rayHit.hitList[0].shapeType == 1) {
        //        console.log(myRay);
        //        console.log(rayHit);
        //        console.log(rayHit.hitList);
        //        cont = false;
        //    }
        //    return;
        //}

        if (rayHit.hitList.length == 0) {
            return;
        } else {
            out[0] = 0.0;
            out[1] = 0.0;
            out[2] = 0.0;
            out[3] = 1.0;
        }
        
    }

   

}