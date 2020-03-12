
//import { vec3 } from "../lib/glmatrix";

class Light {
    constructor(x, y, z) {
        if (x != null && y != null && z != null) {
            this.position = vec4.fromValues(x, y, z, 1);
        } else {
            this.position = vec4.fromValues(0, 0, 20, 1);
        }

        this.lightAmbi = vec4.fromValues(0.5, 0.5, 0.5, 1);
        this.lightDiff = vec4.fromValues(1, 1, 1, 1);
        this.lightSpec = vec4.fromValues(1, 1, 1, 1);

        //particular hitpoint dir
        this.hitPointDir = vec4.create();
        this.flag = false;
    }

    phong(out, rayHit, eyeRay, objects) {
        var shadowFeeler = new Ray();
        var shadowHit = new Hit();
        var viewVector = vec4.create();

        vec4.negate(viewVector, eyeRay.dir);

        //Calculating and adding emissive and ambient colors
        var emissive = vec4.clone(rayHit.surfaceProperties.emiss_I);

        var ambient = vec4.create();
        vec4.multiply(ambient, rayHit.surfaceProperties.ambi_I, this.lightAmbi);

        out[0] = emissive[0] + ambient[0];
        out[1] = emissive[1] + ambient[1];
        out[2] = emissive[2] + ambient[2];
        out[3] = 1.0;

        //Setting up the shadow feeler ray
        shadowFeeler.origin = vec4.clone(rayHit.hitPt);

        shadowFeeler.origin[0] += viewVector[0] * RAY_EPSILON;
        shadowFeeler.origin[1] += viewVector[1] * RAY_EPSILON;
        shadowFeeler.origin[2] += viewVector[2] * RAY_EPSILON;

        vec4.subtract(shadowFeeler.dir, this.position, shadowFeeler.origin);
        
        shadowHit.init();

        for (var i = 0; i < objects.length; i++) {
            objects[i].traceShape(shadowFeeler, shadowHit, true);
        }

        if (shadowHit.shadow) {
            return;
        } else {

            //Calculating Attenuation;
            var dist = this.distanceToLight(rayHit.hitPt);

            var att = 1 / dist;

            var diffuse = vec4.create();
            vec4.multiply(diffuse, rayHit.surfaceProperties.diff_I, this.lightDiff);
            vec4.scale(diffuse, diffuse, att * Math.max(0, vec4.dot(rayHit.surfNorm, shadowFeeler.dir)));

            var specular = vec4.create();

            //Compute R.V
            var reflectedRay = vec4.create();
            this.reflect(reflectedRay, rayHit.surfNorm, shadowFeeler.dir);
            var RdotV = 0;
            vec4.dot(RdotV, reflectedRay, viewVector);
            vec4.multiply(specular, rayHit.surfaceProperties.spec_I, this.lightSpec);
            vec4.scale(specular, specular, att * Math.pow(RdotV, rayHit.surfaceProperties.shine));

            out[0] += diffuse[0] + specular[0];
            out[1] += diffuse[1] + specular[1];
            out[2] += diffuse[2] + specular[2];
        }
    }


    reflect(out, normal, lightVector) {

        //Make Lightvector Unit Length
        vec4.normalize(lightVector, lightVector);

        //Find C
        var C = vec4.create();
        C = vec4.multiply(C, normal, vec4.dot(lightVector, normal));

        //Find R
        var R = vec4.create();
        R = vec4.subtract(R, vec4.scale(C, C, 2), lightVector);

        
        out[0] = R[0];
        out[1] = R[1];
        out[2] = R[2];
        out[3] = R[3];

        return out;
    }
   

    distanceToLight(hitPosn) {
        var distance = 0;

        distance = Math.sqrt(Math.pow(hitPosn[0] - this.position[0], 2) +
            Math.pow(hitPosn[1] - this.position[1], 2) +
            Math.pow(hitPosn[2] - this.position[2], 2));

        return distance;
    }

}