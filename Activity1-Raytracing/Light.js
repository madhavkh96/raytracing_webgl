//import { vec4 } from "../lib/glmatrix";

//import { vec4 } from "../lib/glmatrix";

class Light {
    constructor(x, y, z) {
        if (x != null && y != null && z != null) {
            this.position = vec4.fromValues(x, y, z, 1);
        } else {
            this.position = vec4.fromValues(0, 0, 5, 1);
        }
    }

    findShade(out, rayHitPt, allObjects) {
        var RAY_EPSILON = 1.0E-15;

        var myRay = new Ray();

        vec4.copy(myRay.origin, rayHitPt.hitPt);

        vec4.subtract(myRay.dir, this.position, rayHitPt.hitPt);

        //console.log(myRay.dir);

        myRay.origin[0] += RAY_EPSILON;
        myRay.origin[1] += RAY_EPSILON;
        myRay.origin[2] += RAY_EPSILON;

        var rayHit = new Hit();

        rayHit.init();

        for (var i = 0; i < allObjects.length; i++) {
            allObjects[i].traceMe(myRay, rayHit);
        }

        if (rayHit.hitPtList.length == 0) {
            return;
        } else {
            out[0] = 0.0;
            out[1] = 0.0;
            out[2] = 0.0;
            out[3] = 0.0;
        }
        
    }

}