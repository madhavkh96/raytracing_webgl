// VBO BOX Structure

class GroundPlane{
    constructor() {
        this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
            'attribute vec4 a_Position;\n' +
            'attribute vec4 a_Color;\n' +
            'uniform mat4 u_mvpMat;\n' +
            'varying vec4 v_colr;\n' +
            'void main() {\n' +
            '  gl_Position = u_mvpMat * a_Position;\n' +
            '  v_colr = a_Color;\n' +
            '}\n';

        this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
            'precision mediump float;\n' +          // req'd for floats in frag shader
            'varying vec4 v_colr;\n' +
            'void main() {\n' +
            '	 	 gl_FragColor = v_colr; \n' +
            '}\n';

        new Float32Array([         // Array of vertex attribute values we will
            //Draw the Axes.
            // Red X axis:
            0.00, 0.00, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,	// x,y,z,w; r,g,b,a (RED)
            1.00, 0.00, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0,	// x,y,z,w; r,g,b,a (RED)
            // green Y axis:
            0.00, 0.00, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            0.00, 1.00, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0,
            // blue Z axis:
            0.00, 0.00, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            0.00, 0.00, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0,
        ]);

        this.vboVerts = 6;

        this.bgnGrid = this.vboVerts;     // remember starting vertex for 'grid'
        this.appendGroundGrid();          // (see fcn below)

        this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
        this.vboBytes = this.vboContents.length * this.FSIZE;
        this.vboStride = this.vboBytes / this.vboVerts; 

        this.vboFcount_a_Position = 4;// # of floats in the VBO needed to store the
        this.vboFcount_a_Color = 4;   // # of floats for this attrib (r,g,b,a values) 

        //----------------------Attribute offsets  
        this.vboOffset_a_Position = 0;// # of bytes from START of vbo to the START
        // of 1st a_Position attrib value in vboContents[]
        this.vboOffset_a_Color = this.vboFcount_a_Position * this.FSIZE;
        // (4 floats * bytes/float) 
        // # of bytes from START of vbo to the START
        // of 1st a_Colr0 attrib value in vboContents[]
        //-----------------------GPU memory locations:
        this.vboLoc;									// GPU Location for Vertex Buffer Object, 
        // returned by gl.createBuffer() function call
        this.shaderLoc;								// GPU Location for compiled Shader-program  
        // set by compile/link of VERT_SRC and FRAG_SRC.
        //------Attribute locations in our shaders:
        this.a_PositionLoc;						// GPU location for 'a_Position' attribute
        this.a_ColorLoc;							// GPU location for 'a_Color' attribute

        this.mvpMat = mat4.create();  // Transforms CVV axes to model axes.
        this.u_mvpMatLoc;							// GPU location for u_ModelMat uniform
    }

    appendGroundGrid() {
        this.xyMax = 50.0;
        this.xCount = 101;
        this.yCount = 101;	

        var vertsPerLine = 8;      // # vertices stored in vertSet[] for each line;

        //Set vertex contents:----------------------------------------
        this.floatsPerVertex = 8;  // x,y,z,w;  r,g,b,a values.

        //Create (local) vertSet[] array-----------------------------
        var vertCount = (this.xCount + this.yCount) * vertsPerLine;
        var vertSet = new Float32Array(vertCount * this.floatsPerVertex);
        // This array will hold (xCount+yCount) lines, kept as
        // (xCount+yCount)*vertsPerLine vertices, kept as
        // (xCount+yCount)*vertsPerLine*floatsPerVertex array elements (floats).

        // Set Vertex Colors--------------------------------------
        // Each line's color is constant, but set by the line's position in the grid.
        //  For lines of constant-x, the smallest (or most-negative) x-valued line 
        //    gets color xBgnColr; the greatest x-valued line gets xEndColr, 
        //  Similarly, constant-y lines get yBgnColr for smallest, yEndColr largest y.
        this.xBgnColr = vec4.fromValues(1.0, 0.0, 0.0, 1.0);	  // Red
        this.xEndColr = vec4.fromValues(0.0, 1.0, 1.0, 1.0);    // Cyan
        this.yBgnColr = vec4.fromValues(0.0, 1.0, 0.0, 1.0);	  // Green
        this.yEndColr = vec4.fromValues(1.0, 0.0, 1.0, 1.0);    // Magenta

        // Compute how much the color changes between 1 line and the next:
        var xColrStep = vec4.create();  // [0,0,0,0]
        var yColrStep = vec4.create();
        vec4.subtract(xColrStep, this.xEndColr, this.xBgnColr); // End - Bgn
        vec4.subtract(yColrStep, this.yEndColr, this.yBgnColr);
        vec4.scale(xColrStep, xColrStep, 1.0 / (this.xCount - 1)); // scale by # of lines
        vec4.scale(yColrStep, yColrStep, 1.0 / (this.yCount - 1));

        // Local vars for vertex-making loops-------------------
        var xgap = 2 * this.xyMax / (this.xCount - 1);		// Spacing between lines in x,y;
        var ygap = 2 * this.xyMax / (this.yCount - 1);		// (why 2*xyMax? grid spans +/- xyMax).
        var xNow;           // x-value of the current line we're drawing
        var yNow;           // y-value of the current line we're drawing.
        var line = 0;       // line-number (we will draw xCount or yCount lines, each
        // made of vertsPerLine vertices),
        var v = 0;          // vertex-counter, used for the entire grid;
        var idx = 0;        // vertSet[] array index.
        var colrNow = vec4.create();   // color of the current line we're drawing.

        //----------------------------------------------------------------------------
        // 1st BIG LOOP: makes all lines of constant-x
        for (line = 0; line < this.xCount; line++) {   // for every line of constant x,
            colrNow = vec4.scaleAndAdd(             // find the color of this line,
                colrNow, this.xBgnColr, xColrStep, line);
            xNow = -this.xyMax + (line * xgap);       // find the x-value of this line,    
            for (i = 0; i < vertsPerLine; i++ , v++ , idx += this.floatsPerVertex) { // for every vertex in this line,  find x,y,z,w;  r,g,b,a;
                // and store them sequentially in vertSet[] array.
                // We already know  xNow; find yNow:
                switch (i) { // find y coord value for each vertex in this line:
                    case 0: yNow = -this.xyMax; break;  // start of 1st line-segment;
                    case 1:                               // end of 1st line-segment, and
                    case 2: yNow = -this.xyMax / 2; break;  // start of 2nd line-segment;
                    case 3:                               // end of 2nd line-segment, and
                    case 4: yNow = 0.0; break;  // start of 3rd line-segment;
                    case 5:                               // end of 3rd line-segment, and
                    case 6: yNow = this.xyMax / 2; break;  // start of 4th line-segment;
                    case 7: yNow = this.xyMax; break;  // end of 4th line-segment.
                    default:
                        console.log("VBObox0.appendGroundGrid() !ERROR! **X** line out-of-bounds!!\n\n");
                        break;
                } // set all values for this vertex:
                vertSet[idx] = xNow;            // x value
                vertSet[idx + 1] = yNow;            // y value
                vertSet[idx + 2] = 0.0;             // z value
                vertSet[idx + 3] = 1.0;             // w;
                vertSet[idx + 4] = colrNow[0];  // r
                vertSet[idx + 5] = colrNow[1];  // g
                vertSet[idx + 6] = colrNow[2];  // b
                vertSet[idx + 7] = colrNow[3];  // a;
            }
        }
        //----------------------------------------------------------------------------
        // 2nd BIG LOOP: makes all lines of constant-y
        for (line = 0; line < this.yCount; line++) {   // for every line of constant y,
            colrNow = vec4.scaleAndAdd(             // find the color of this line,
                colrNow, this.yBgnColr, yColrStep, line);
            yNow = -this.xyMax + (line * ygap);       // find the y-value of this line,    
            for (i = 0; i < vertsPerLine; i++ , v++ , idx += this.floatsPerVertex) { // for every vertex in this line,  find x,y,z,w;  r,g,b,a;
                // and store them sequentially in vertSet[] array.
                // We already know  yNow; find xNow:
                switch (i) { // find y coord value for each vertex in this line:
                    case 0: xNow = -this.xyMax; break;  // start of 1st line-segment;
                    case 1:                               // end of 1st line-segment, and
                    case 2: xNow = -this.xyMax / 2; break;  // start of 2nd line-segment;
                    case 3:                               // end of 2nd line-segment, and
                    case 4: xNow = 0.0; break;  // start of 3rd line-segment;
                    case 5:                               // end of 3rd line-segment, and
                    case 6: xNow = this.xyMax / 2; break;  // start of 4th line-segment;
                    case 7: xNow = this.xyMax; break;  // end of 4th line-segment.
                    default:
                        console.log("VBObox0.appendGroundGrid() !ERROR! **Y** line out-of-bounds!!\n\n");
                        break;
                } // Set all values for this vertex:
                vertSet[idx] = xNow;            // x value
                vertSet[idx + 1] = yNow;            // y value
                vertSet[idx + 2] = 0.0;             // z value
                vertSet[idx + 3] = 1.0;             // w;
                vertSet[idx + 4] = colrNow[0];  // r
                vertSet[idx + 5] = colrNow[1];  // g
                vertSet[idx + 6] = colrNow[2];  // b
                vertSet[idx + 7] = colrNow[3];  // a;
            }
        }

        /*
         // SIMPLEST-POSSIBLE vertSet[] array:
          var vertSet = new Float32Array([    // a vertSet[] array of just 1 green line:
              -1.00, 0.50, 0.0, 1.0,  	0.0, 1.0, 0.0, 1.0,	// GREEN
               1.00, 0.50, 0.0, 1.0,  	0.0, 1.0, 0.0, 1.0,	// GREEN
             ], this.vboContents.length);
          vertCount = 2;
        */
        // Now APPEND this to existing VBO contents:
        // Make a new array (local) big enough to hold BOTH vboContents & vertSet:
        var tmp = new Float32Array(this.vboContents.length + vertSet.length);
        tmp.set(this.vboContents, 0);     // copy old VBOcontents into tmp, and
        tmp.set(vertSet, this.vboContents.length); // copy new vertSet just after it.
        this.vboVerts += vertCount;       // find number of verts in both.
        this.vboContents = tmp;           // REPLACE old vboContents with tmp
    }


}


