class Ray{
    constructor() {
        //Always construct with default values as origin and going downwards.
        this.origin = vec4.fromValues(0, 0, 0, 1);
        this.dir = vec4.fromValues(0, 0, -1, 0);
    }

    debugRay(name) {
        if (name == undefined) name = '[CRay]';
        var res = 3;  // # of digits to display
        console.log(name + '.orig:' +
            this.orig[0].toFixed(res) + ',\t' + this.orig[1].toFixed(res) + ',\t' +
            this.orig[2].toFixed(res) + ',\t' + this.orig[3].toFixed(res) + '\n' +
            name + '.dir :' +
            this.dir[0].toFixed(res) + ',\t ' + this.dir[1].toFixed(res) + ',\t ' +
            this.dir[2].toFixed(res) + ',\t ' + this.dir[3].toFixed(res) +
            '\n------------------------');
    }

}

class Camera {
    constructor() {
        this.eyePt = vec4.fromValues(0, 0, 0, 1);
        this.uAxis = vec4.fromValues(1, 0, 0, 0);
        this.vAxis = vec4.fromValues(0, 1, 0, 0);
        this.nAxis = vec4.fromValues(0, 0, 1, 0);

        this.iLeft = -1.0;
        this.iRight = 1.0;
        this.iBot = -1.0;
        this.iTop = 1.0;
        this.iNear = 1.0;

        this.xmax = 512;
        this.ymax = 512;

        this.ufrac = (this.iRight - this.iLeft) / this.xmax;
        this.vfrac = (this.iTop - this.iBot) / this.ymax;
    }

    setSize(nuXmax, nuYmax) {
        // Re-adjust the camera for a different output-image size:
        this.xmax = nuXmax;
        this.ymax = nuYmax;

        this.ufrac = (this.iRight - this.iLeft) / this.xmax;	// pixel tile's width
        this.vfrac = (this.iTop - this.iBot) / this.ymax;	    // pixel tile's height.
    }

    rayFrustrum(left, right, bot, top, near) {
        this.iLeft = left;
        this.iRight = right;
        this.iBot = bot;
        this.iTop = top;
        this.iNear = near;
    }

    rayPerspective(fovy, aspect, zNear) {
        this.iNear  = zNear;
        this.iTop   = zNear * Math.tan(0.5 * fovy * (Math.PI / 180.0));
        this.iBot   = -this.iTop;
        this.iRight = this.iTop * aspect;
        this.iLeft  = -this.iRight;
    }

    rayLookAt(nuEyePt, nuAimPt, nuUpVec) {
        this.eyePt = nuEyePt;
        vec4.subtract(this.nAxis, this.eyePt, nuAimPt);
        vec4.normalize(this.nAxis, this.nAxis);
        vec3.cross(this.uAxis, nuUpVec, this.nAxis);    // U-axis == upVec cross N-axis
        vec4.normalize(this.uAxis, this.uAxis);         // make it unit-length.
        vec3.cross(this.vAxis, this.nAxis, this.uAxis); // V-axis == N-axis cross U-axis
    }

    setEyeRay(myRay, xpos, ypos) {
        var posU = this.iLeft + xpos * this.ufrac; 	// U coord,
        var posV = this.iBot + ypos * this.vfrac;	// V coord,
        var xyzPos = vec4.create();    // make vector 0,0,0,0.	
        vec4.scaleAndAdd(xyzPos, xyzPos, this.uAxis, posU); // xyzPos += Uaxis*posU;
        vec4.scaleAndAdd(xyzPos, xyzPos, this.vAxis, posV); // xyzPos += Vaxis*posU;
        vec4.scaleAndAdd(xyzPos, xyzPos, this.nAxis, -this.iNear); 
        vec4.copy(myRay.origin, this.eyePt);
        vec4.copy(myRay.dir, xyzPos);
    }

}