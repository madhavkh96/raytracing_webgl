
class ImageBuffer {

    constructor(wide, tall) {
        this.xSize = wide;              // width in pixels
        this.ySize = tall;              // height in pixels
        this.pixSize = 3;               // 3 For RGB, 4 for RGBA
        this.iBuf = new Uint8Array(this.xSize * this.ySize * this.pixSize);
        this.fBuf = new Float32Array(this.xSize * this.ySize * this.pixSize);
    }

    setTestPattern(pattNum) {
        var PATT_MAX = 4;
        if (pattNum < 0 || pattNum >= PATT_MAX)
            pattNum %= PATT_MAX;

        for (var j = 0; j < this.ySize; j++) {
            for (var i = 0; i < this.xSize; i++) {
                var idx = (j * this.xSize + i) * this.pixSize;
                switch (pattNum) {
                    case 0:
                        //================(Colorful L-shape)===========================
                        if (i < this.xSize / 4 || j < this.ySize / 4) {
                            this.iBuf[idx] = i;
                            this.iBuf[idx + 1] = j;
                        }
                        else {
                            this.iBuf[idx] = 0;
                            this.iBuf[idx + 1] = 0;
                        }
                        this.iBuf[idx + 2] = 255 - i - j;
                        break;
                    case 1:
                        //================(bright orange)==============================
                        this.iBuf[idx] = 255;
                        this.iBuf[idx + 1] = 128;
                        this.iBuf[idx + 2] = 0;
                        break;
                    case 2:
                        //=================(Vertical Blue/yellow)=====================
                        if (i > 5 * this.xSize / 7 && j > 4 * this.ySize / 5) {
                            this.iBuf[idx] = 200;
                            this.iBuf[idx + 1] = 200;
                            this.iBuf[idx + 2] = 200;
                        } else {
                            this.iBuf[idx] = 255 - j;
                            this.iBuf[idx + 1] = 255 - j;
                            this.iBuf[idx + 2] = j;
                        }
                        break;
                    case 3:
                        //================(Diagonal YRed/Cyan)========================
                        this.iBuf[idx] = 255 - (i + j) / 2;
                        this.iBuf[idx + 1] = 255 - j;
                        this.iBuf[idx + 2] = 255 - j;
                        break;
                    default:
                        console.log("imgBuf.setTestPattern() says: WHUT!?");
                        break;
                }
            }
        }

        this.int2float();
    }

    int2float() {
        for (var j = 0; j < this.xSize; j++) {
            for (var i = 0; i < this.ySize; i++) {
                var idx = (j * this.xSize + i) * this.pixSize;

                this.fBuf[idx] = this.iBuf[idx] / 255.0;
                this.fBuf[idx + 1] = this.iBuf[idx + 1] / 255.0;
                this.fBuf[idx + 2] = this.iBuf[idx + 2] / 255.0;
            }
        }
    }

    float2int() {

        for (var j = 0; j < this.ySize; j++) {
            for (var i = 0; i < this.xSize; i++) {
                var idx = (j * this.xSize + i) * this.pixSize;
                var rval = Math.min(1.0, Math.max(0.0, this.fBuf[idx]));
                var gval = Math.min(1.0, Math.max(0.0, this.fBuf[idx + 1]));
                var bval = Math.min(1.0, Math.max(0.0, this.fBuf[idx + 2]));
                this.iBuf[idx] = Math.min(255, Math.floor(rval * 256.0));
                this.iBuf[idx + 1] = Math.min(255, Math.floor(gval * 256.0));
                this.iBuf[idx + 2] = Math.min(255, Math.floor(bval * 256.0));
            }
        }
    }

}