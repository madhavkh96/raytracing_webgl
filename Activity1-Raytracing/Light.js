
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
    }
}