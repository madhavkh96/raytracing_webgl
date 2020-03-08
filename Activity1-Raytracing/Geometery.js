// Available Geometery for the current Raytracer
const RT_GNDPLANE = 0;
const RT_DISK = 1;
const RT_SPHERE = 2;
const RT_BOX = 3;
const RT_CYLINDER = 4;
const RT_TRIANGLE = 5;
const RT_BLOBBY = 6;

class Geometery{
    constructor(selectedShape) {

        if (selectedShape == undefined) selectedShape = RT_GNDPLANE;
        this.shapeType = selectedShape;

        this.traceMe = function (inR, hit) { this.traceShape(inR, hit) }

        this.worldRay2model = mat4.create();

        this.normal2World = mat4.create();


        this.xgap = 1.0;	// line-to-line spacing
        this.ygap = 1.0;
        this.lineWidth = 0.1;	// fraction of xgap used for grid-line width
        this.lineColor = vec4.fromValues(0.1, 0.1, 0.1, 1.0);  // RGBA green(A==opacity)
        this.gapColor = vec4.fromValues(0.9, 0.9, 0.9, 1.0);  // near-white
        this.skyColor = vec4.fromValues(0.3, 1.0, 1.0, 1.0);  // cyan/bright blue
    }

    setIdentity() {
        mat4.identity(this.worldRay2model);
        mat4.identity(this.normal2World);
    }

    rayTranslate(x, y, z) {
        var a = mat4.create();
        a[12] = -x;
        a[13] = -y;
        a[14] = -z;
        mat4.multiply(this.worldRay2model, a, this.worldRay2model);
        mat4.transpose(this.normal2World, this.worldRay2model);
    }

    rayRotate(rad, ax, ay, az) {
        var x = ax, y = ay, z = az,
            len = Math.sqrt(x * x + y * y + z * z),
            s, c, t,
            b00, b01, b02,
            b10, b11, b12,
            b20, b21, b22;
        if (Math.abs(len) < glMatrix.GLMAT_EPSILON) {
            console.log("CGeom.rayRotate() ERROR!!! zero-length axis vector!!");
            return null;
        }
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        s = Math.sin(-rad);
        c = Math.cos(-rad);
        t = 1 - c;

        // Construct the elements of the 3x3 rotation matrix. b_rowCol
        b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
        b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
        b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
        var b = mat4.create();  // build 4x4 rotation matrix from these
        b[0] = b00; b[4] = b01; b[8] = b02; b[12] = 0.0; // row0
        b[1] = b10; b[5] = b11; b[9] = b12; b[13] = 0.0; // row1
        b[2] = b20; b[6] = b21; b[10] = b22; b[14] = 0.0; // row2
        b[3] = 0.0; b[7] = 0.0; b[11] = 0.0; b[15] = 1.0; // row3

        mat4.multiply(this.worldRay2model, b, this.worldRay2model);
        mat4.transpose(this.normal2World, this.worldRay2model); // model normals->world
    }

    rayScale(sx, sy, sz) {
        if (Math.abs(sx) < glMatrix.GLMAT_EPSILON ||
            Math.abs(sy) < glMatrix.GLMAT_EPSILON ||
            Math.abs(sz) < glMatrix.GLMAT_EPSILON) {
            console.log("CGeom.rayScale() ERROR!! zero-length scale!!!");
            return null;
        }
        var c = mat4.create();
        c[0] = 1 / sx;
        c[5] = 1 / sy;
        c[10] = 1 / sz;

        mat4.multiply(this.worldRay2model, c, this.worldRay2model);
        mat4.transpose(this.normal2World, this.worldRay2model);
    }

    traceShape(inRay, hit) {

        //Default values for gap and line width
        this.d_xgap = 1.0;	// line-to-line spacing
        this.d_ygap = 1.0;
        this.d_linewidth = 0.1;

        var rayT = new Ray();
        vec4.copy(rayT.origin, inRay.origin);
        vec4.copy(rayT.dir, inRay.dir);

        switch (this.shapeType) {
            case RT_GNDPLANE:
                this.xgap = this.d_xgap;
                this.ygap = this.d_ygap;
                // 'Line-grid' defaults:------------------------------------------------------
                this.lineWidth = this.d_linewidth;	// fraction of xgap used for grid-line width
                this.lineColor = vec4.fromValues(0.1, 0.1, 0.1, 1.0);  // RGBA green(A==opacity)
                this.gapColor = vec4.fromValues(0.9, 0.9, 0.9, 1.0);  // near-white
                this.skyColor = vec4.fromValues(0.3, 1.0, 1.0, 1.0);  // cyan/bright blue
                break
            case RT_DISK:
                // 2D Disk defaults:----------------------------------------------------------
                // uses many of the same parameters as Ground-plane grid, except:
                this.diskRad = 1.5;   // radius of disk centered at origin

                vec4.transformMat4(rayT.origin, inRay.origin, this.worldRay2model);

                vec4.transformMat4(rayT.dir, inRay.dir, this.worldRay2model);

                this.lineColor = vec4.fromValues(0.6, 0.1, 0.0, 1.0);

                this.xgap = this.d_xgap * 61 / 107;
                this.ygap = this.d_ygap * 61 / 107;
                this.lineWidth = this.d_linewidth * 3.0;//this.lineWidth*3.0;
                break;
            default:
                console.log("Geometery.TraceFn INVALUE SHAPE INPUT");

        }

        //Find the t0 value == where ray hits the shape at z=0;
        var t0 = (-rayT.origin[2]) / rayT.dir[2];


        //point is behind camera or further away than the already hit point. Hence no need to update 
        //the value for that point.
        if (t0 < 0 || t0 > hit.t0) {
            return;
        }

        //Check for the hit to geometery
        switch (this.shapeType) {
            case RT_GNDPLANE:
                hit.hitPtList.push(t0);

                hit.t0 = t0;

                hit.hitGeom = this;

                vec4.scaleAndAdd(hit.modelHitPt, rayT.origin, rayT.dir, hit.t0);

                vec4.copy(hit.hitPt, hit.modelHitPt);

                vec4.negate(hit.viewN, inRay.dir);

                vec4.normalize(hit.viewN, hit.viewN);

                vec4.set(hit.surfNorm, 0, 0, 1, 0);
                break;
            case RT_DISK:
                var modelHit = vec4.create();
                vec4.scaleAndAdd(modelHit, rayT.origin, rayT.dir, t0);
                if (modelHit[0] * modelHit[0] + modelHit[1] * modelHit[1] > this.diskRad * this.diskRad) {
                    return;
                }

                hit.hitPtList.push(t0);

                hit.t0 = t0;

                hit.hitGeom = this;

                vec4.copy(hit.hitPt, hit.modelHitPt);

                vec4.scaleAndAdd(hit.modelHitPt, rayT.origin, rayT.dir, hit.t0);

                vec4.negate(hit.viewN, inRay.dir);

                vec4.transformMat4(hit.surfNorm, vec4.fromValues(0, 0, 1, 0), this.normal2World);

                vec4.normalize(hit.surfNorm, hit.surfNorm);
                break;
            default:
                //No Transformations
                break;
        }

        

   

        //For x-gap
        var loc = hit.modelHitPt[0] / this.xgap;
        if (hit.modelHitPt[0] < 0) loc = -loc;
        if (loc % 1 < this.lineWidth) {
            hit.hitNum = 1;                     // Hits
            return;
        }

        //For y-gap
        loc = hit.modelHitPt[1] / this.ygap;
        if (hit.modelHitPt[1] < 0) loc = -loc;
        if (loc % 1 < this.lineWidth) {
            hit.hitNum = 1;                     // Hits
            return;
        }

        hit.hitNum = 0;                         // Doesn't Hit
        return;
    }


}