
//import { vec3, mat4 } from "../lib/glmatrix";

// VBO BOX 

class WebGLView {
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

        this.vboContents = new Float32Array([         // Array of vertex attribute values we will
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

        this.bgnDisk = this.vboVerts;
        this.appendDisk(2);

        this.bgnSphere = this.vboVerts;
        this.appendSphere();

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
            for (var i = 0; i < vertsPerLine; i++ , v++ , idx += this.floatsPerVertex) { // for every vertex in this line,  find x,y,z,w;  r,g,b,a;
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

    appendDisk(radius) {
        if (radius == undefined) radius = 3;
        this.xyMax = radius;
        this.xCount = 11;
        this.yCount = 11;	

        var vertsPerLine = 2; 
        this.floatsPerVertex = 8;

        var vertCount = (this.xCount + this.yCount) * vertsPerLine;
        var vertSet = new Float32Array(vertCount * this.floatsPerVertex); 

        var xColr = vec4.fromValues(1.0, 1.0, 0.3, 1.0);
        var yColr = vec4.fromValues(0.3, 1.0, 1.0, 1.0);

        var xgap = 2 * this.xyMax / (this.xCount - 2);
        var ygap = 2 * this.xyMax / (this.yCount - 2);

        var xNow;
        var yNow;
        var diff;
        var line = 0;

        var v = 0;
        var idx = 0;    

        for (line = 0; line < this.xCount; line++) {
            xNow = -this.xyMax + (line + 0.5) * xgap;
            diff = Math.sqrt(radius * radius - xNow * xNow);
            for (var i = 0; i < vertsPerLine; i++ , v++ , idx += this.floatsPerVertex) { // for every vertex in this line,  find x,y,z,w;  r,g,b,a;
                // and store them sequentially in vertSet[] array.
                // we already know the xNow value for this vertex; find the yNow:
                if (i == 0) yNow = -diff;  // line start
                else yNow = diff;       // line end.
                // set all values for this vertex:
                vertSet[idx] = xNow;            // x value
                vertSet[idx + 1] = yNow;            // y value
                vertSet[idx + 2] = 0.0;             // z value
                vertSet[idx + 3] = 1.0;             // w;
                vertSet[idx + 4] = xColr[0];  // r
                vertSet[idx + 5] = xColr[1];  // g
                vertSet[idx + 6] = xColr[2];  // b
                vertSet[idx + 7] = xColr[3];  // a;
            }
        }

        for (line = 0; line < this.yCount; line++) {   // for every line of constant y,
            yNow = -this.xyMax + (line + 0.5) * ygap;       // find the y-value of this line,  
            diff = Math.sqrt(radius * radius - yNow * yNow);  // find +/- y-value of this line,  
            for (var i = 0; i < vertsPerLine; i++ , v++ , idx += this.floatsPerVertex) { // for every vertex in this line,  find x,y,z,w;  r,g,b,a;
                // and store them sequentially in vertSet[] array.
                // We already know  yNow; find the xNow:
                if (i == 0) xNow = -diff;  // line start
                else xNow = diff;       // line end.
                // Set all values for this vertex:
                vertSet[idx] = xNow;            // x value
                vertSet[idx + 1] = yNow;            // y value
                vertSet[idx + 2] = 0.0;             // z value
                vertSet[idx + 3] = 1.0;             // w;
                vertSet[idx + 4] = yColr[0];  // r
                vertSet[idx + 5] = yColr[1];  // g
                vertSet[idx + 6] = yColr[2];  // b
                vertSet[idx + 7] = yColr[3];  // a;
            }
        }
        // Now APPEND this to existing VBO contents:
        // Make a new array (local) big enough to hold BOTH vboContents & vertSet:
        var tmp = new Float32Array(this.vboContents.length + vertSet.length);
        tmp.set(this.vboContents, 0);     // copy old VBOcontents into tmp, and
        tmp.set(vertSet, this.vboContents.length); // copy new vertSet just after it.
        this.vboVerts += vertCount;       // find number of verts in both.
        this.vboContents = tmp;   
    }

    appendSphere(NScount) {
        if (NScount == undefined) NScount = 13;    // default value.
        if (NScount < 3) NScount = 3;              // enforce minimums
        var EWcount = 2 * (NScount);
        console.log("VBObox0.appendLineSphere() EWcount, NScount:", EWcount, ", ", NScount);

        //Set vertex contents:----------------------------------------
        /*  ALREADY SET in VBObox0 constructor
            this.floatsPerVertex = 8;  // x,y,z,w;  r,g,b,a values.
        */

        //Create (local) vertSet[] array-----------------------------
        var vertCount = 2 * EWcount * NScount;
        var vertSet = new Float32Array(vertCount * this.floatsPerVertex);
        // This array holds two sets of vertices:
        // --the NScount rings of EWcount vertices each, where each ring
        //    forms a circle of constant z (NSfrac determines the z value), and
        // --the EWcount arcs of NScount vertices each, where each arc 
        //    forms a half-circle from south-pole to north-pole at constant EWfrac
        //console.log("VBObox0.appendLineSphere() vertCount, floatsPerVertex:", vertCount, ", ", this.floatsPerVertex);

        // Set Vertex Colors--------------------------------------
        // The sphere consists of horizontal rings and vertical half-circle arcs.
        // Each North-to-South arc has constant fracEW and constant color, but that
        // color varies linearly from EWbgnColr found at fracEW==0 up to EWendColr 
        // found at fracEW==0.5 and then back down to EWbgnColr at fracEW==1.
        // Each East-West ring has constant fracNS and constant color, but that 
        // color varies linearly from NSbgnColr found at fracNS==0 (e.g. south pole)
        // up to NSendColr found at fracNS==1 (north pole).
        this.EWbgnColr = vec4.fromValues(1.0, 0.5, 0.0, 1.0);	  // Orange
        this.EWendColr = vec4.fromValues(0.0, 0.5, 1.0, 1.0);   // Cyan
        this.NSbgnColr = vec4.fromValues(1.0, 1.0, 1.0, 1.0);	  // White
        this.NSendColr = vec4.fromValues(0.0, 1.0, 0.5, 1.0);   // White

        // Compute how much the color changes between 1 arc (or ring) and the next:
        var EWcolrStep = vec4.create();  // [0,0,0,0]
        var NScolrStep = vec4.create();

        vec4.subtract(EWcolrStep, this.EWendColr, this.EWbgnColr); // End - Bgn
        vec4.subtract(NScolrStep, this.NSendColr, this.NSbgnColr);
        vec4.scale(EWcolrStep, EWcolrStep, 2.0 / (EWcount - 1)); // double-step for arc colors
        vec4.scale(NScolrStep, NScolrStep, 1.0 / (NScount - 1)); // single-step for ring colors

        // Local vars for vertex-making loops-------------------
        var EWgap = 1.0 / (EWcount - 1);		  // vertex spacing in each ring of constant NS 
        // (be sure last vertex doesn't overlap 1st)
        var NSgap = 1.0 / (NScount - 1);		// vertex spacing in each North-South arc
        // (1st vertex at south pole; last at north pole)
        var EWint = 0;        // east/west integer (0 to EWcount) for current vertex,
        var NSint = 0;        // north/south integer (0 to NScount) for current vertex.
        var v = 0;          // vertex-counter, used for the entire sphere;
        var idx = 0;        // vertSet[] array index.
        var pos = vec4.create();    // vertex position.
        var colrNow = vec4.create();   // color of the current arc or ring.

        //----------------------------------------------------------------------------
        // 1st BIG LOOP: makes all horizontal rings of constant NSfrac.
        for (NSint = 0; NSint < NScount; NSint++) { // for every ring of constant NSfrac,
            colrNow = vec4.scaleAndAdd(               // find the color of this ring;
                colrNow, this.NSbgnColr, NScolrStep, NSint);
            for (EWint = 0; EWint < EWcount; EWint++ , v++ , idx += this.floatsPerVertex) {
                // for every vertex in this ring, find x,y,z,w;  r,g,b,a;
                // and store them sequentially in vertSet[] array.
                // Find vertex position from normalized lattitude & longitude:
                this.polar2xyz(pos, // vec4 that holds vertex position in world-space x,y,z;
                    EWint * EWgap,  // normalized East/west longitude (from 0 to 1)
                    NSint * NSgap); // normalized North/South lattitude (from 0 to 1)      
                // now set the vertex values in the array:
                vertSet[idx] = pos[0];            // x value
                vertSet[idx + 1] = pos[1];            // y value
                vertSet[idx + 2] = pos[2];            // z value
                vertSet[idx + 3] = 1.0;               // w (it's a point, not a vector)
                vertSet[idx + 4] = colrNow[0];  // r
                vertSet[idx + 5] = colrNow[1];  // g
                vertSet[idx + 6] = colrNow[2];  // b
                vertSet[idx + 7] = colrNow[3];  // a;
            }
        }

        //----------------------------------------------------------------------------
        // 2nd BIG LOOP: makes all vertical arcs of constant EWfrac.
        for (EWint = 0; EWint < EWcount; EWint++) { // for every arc of constant EWfrac,
            // find color of the arc:
            if (EWint < EWcount / 2) {   // color INCREASES for first hemisphere of arcs:        
                colrNow = vec4.scaleAndAdd(
                    colrNow, this.EWbgnColr, EWcolrStep, EWint);
            }
            else {  // color DECREASES for second hemisphere of arcs:
                colrNow = vec4.scaleAndAdd(
                    colrNow, this.EWbgnColr, EWcolrStep, EWcount - EWint);
            }
            for (NSint = 0; NSint < NScount; NSint++ , v++ , idx += this.floatsPerVertex) {
                // for every vertex in this arc, find x,y,z,w;  r,g,b,a;
                // and store them sequentially in vertSet[] array.
                // Find vertex position from normalized lattitude & longitude:
                this.polar2xyz(pos, // vec4 that holds vertex position in world-space x,y,z;
                    EWint * EWgap,  // normalized East/west longitude (from 0 to 1)
                    NSint * NSgap); // normalized North/South lattitude (from 0 to 1)      
                // now set the vertex values in the array:
                vertSet[idx] = pos[0];            // x value
                vertSet[idx + 1] = pos[1];            // y value
                vertSet[idx + 2] = pos[2];            // z value
                vertSet[idx + 3] = 1.0;               // w (it's a point, not a vector)
                vertSet[idx + 4] = colrNow[0];  // r
                vertSet[idx + 5] = colrNow[1];  // g
                vertSet[idx + 6] = colrNow[2];  // b
                vertSet[idx + 7] = colrNow[3];  // a;
            }
        }

        var tmp = new Float32Array(this.vboContents.length + vertSet.length);
        tmp.set(this.vboContents, 0);     // copy old VBOcontents into tmp, and
        tmp.set(vertSet, this.vboContents.length); // copy new vertSet just after it.
        this.vboVerts += vertCount;       // find number of verts in both.
        this.vboContents = tmp;           // REPLACE old vboContents with tmp
    }

    polar2xyz(out4, fracEW, fracNS) {
        var sEW = Math.sin(2.0 * Math.PI * fracEW);
        var cEW = Math.cos(2.0 * Math.PI * fracEW);
        var sNS = Math.sin(Math.PI * fracNS);
        var cNS = Math.cos(Math.PI * fracNS);
        vec4.set(out4, cEW * sNS,      // x = cos(EW)sin(NS);
            sEW * sNS,      // y = sin(EW)sin(NS);
            cNS, 1.0);      // z =        cos(NS); w=1.0  (point, not vec)
    }

    init() {
        this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
        if (!this.shaderLoc) {
            console.log(this.constructor.name +
                '.init() failed to create executable Shaders on the GPU. Bye!');
            return;
        }

        gl.program = this.shaderLoc;

        this.vboLoc = gl.createBuffer();

        if (!this.vboLoc) {
            console.log(this.constructor.name +
                '.init() failed to create VBO in GPU. Bye!');
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

        gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);

        this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
        if (this.a_PositionLoc < 0) {
            console.log(this.constructor.name +
                'init() failed to get GPU location of attribute a_Position');
            return -1;
        }

        this.a_ColorLoc = gl.getAttribLocation(this.shaderLoc, 'a_Color');
        if (this.a_ColorLoc < 0) {
            console.log(this.constructor.name +
                '.init() failed to get the GPU location of attribute a_Color');
        }

        this.u_mvpMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_mvpMat');
        if (!this.u_mvpMatLoc) {
            console.log(this.constructor.name +
                '.init() failed to get GPU location for u_mvpMat uniform');
            return;
        }  
    }

    switchToMe() {
        gl.useProgram(this.shaderLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

        gl.vertexAttribPointer(this.a_PositionLoc, this.vboFcount_a_Position, gl.FLOAT,
            false, this.vboStride, this.vboOffset_a_Position);

        gl.vertexAttribPointer(this.a_ColorLoc, this.vboFcount_a_Color, gl.FLOAT,
            false, this.vboStride, this.vboOffset_a_Color);

        gl.enableVertexAttribArray(this.a_PositionLoc);
        gl.enableVertexAttribArray(this.a_ColorLoc);
    }

    isReady() {
        var isOk = true;

        if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
            console.log(this.constructor.name +
                '.isReady() false: shader program at this.shaderLoc not in use!');
            isOk = false;
        }
        if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
            console.log(this.constructor.name +
                '.isReady() false: vbo at this.vboLoc not in use!');
            isOK = false;
        }
        return isOk;
    }

    adjust() {
        if (this.isReady() == false) {
            console.log('ERROR! before' + this.constructor.name +
                '.adjust() call you needed to call this.switchToMe()!!');
        }  

        var camProj = mat4.create();
        mat4.perspective(camProj,
            glMatrix.toRadian(gui.camFovy),
            gui.camAspect,
            gui.camNear,
            gui.camFar);                   

        var camView = mat4.create();
        mat4.lookAt(camView, gui.camEyePt, gui.camAimPt, gui.camUpVec);
        mat4.multiply(this.mvpMat, camProj, camView);

        gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);
    }

    draw() {
        if (this.isReady() == false) {
            console.log('ERROR! before' + this.constructor.name +
                '.draw() call you needed to call this.switchToMe()!!');
        }
        switch (g_SceneNum) {
            case 1:
                //Ground Grid
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);

                mat4.copy(this.mvpMat, temp);
                gl.drawArrays(gl.LINES, 0, this.bgnDisk);

                //Disk
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                mat4.translate(this.mvpMat, this.mvpMat, vec3.fromValues(0.0, 0.0, 2.0));
                mat4.rotate(this.mvpMat, this.mvpMat, 0.25 * Math.PI, vec3.fromValues(1, 0, 0));

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);
                mat4.copy(this.mvpMat, temp);

                gl.drawArrays(gl.LINES, this.bgnDisk, this.bgnSphere - this.bgnDisk);

                //Sphere
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                mat4.translate(this.mvpMat, this.mvpMat, vec3.fromValues(0.0, 0.0, 6.0));

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);
                mat4.copy(this.mvpMat, temp);

                gl.drawArrays(gl.LINES, this.bgnSphere, this.vboVerts - this.bgnSphere);
                break;
            case 0:
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);

                mat4.copy(this.mvpMat, temp);
                gl.drawArrays(gl.LINES, 0, this.bgnDisk);

                //sphere 1
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                mat4.translate(this.mvpMat, this.mvpMat, vec3.fromValues(0.0, 0.0, 1.0));

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);
                mat4.copy(this.mvpMat, temp);

                gl.drawArrays(gl.LINES, this.bgnSphere, this.vboVerts - this.bgnSphere);

                //sphere 2
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                mat4.translate(this.mvpMat, this.mvpMat, vec3.fromValues(-1.0, 5.0, 5.0));
                mat4.scale(this.mvpMat, this.mvpMat, vec3.fromValues(2.0, 2.0, 2.0));

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);
                mat4.copy(this.mvpMat, temp);

                gl.drawArrays(gl.LINES, this.bgnSphere, this.vboVerts - this.bgnSphere);

                //Sphere 3

                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                mat4.translate(this.mvpMat, this.mvpMat, vec3.fromValues(-3.0, 0.0, 3.0));
                mat4.scale(this.mvpMat, this.mvpMat, vec3.fromValues(2.0, 0.5, 3.0));


                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);
                mat4.copy(this.mvpMat, temp);

                gl.drawArrays(gl.LINES, this.bgnSphere, this.vboVerts - this.bgnSphere);

                break;
            case 2:

                //Ground Plane
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);

                mat4.copy(this.mvpMat, temp);
                gl.drawArrays(gl.LINES, 0, this.bgnDisk);

                //Disk 1
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                mat4.translate(this.mvpMat, this.mvpMat, vec3.fromValues(0.0, 0.0, 2.0));
                mat4.rotate(this.mvpMat, this.mvpMat, 0.25 * Math.PI, vec3.fromValues(1, 0, 0));

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);
                mat4.copy(this.mvpMat, temp);

                gl.drawArrays(gl.LINES, this.bgnDisk, this.bgnSphere - this.bgnDisk);

                //Disk 2
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                mat4.translate(this.mvpMat, this.mvpMat, vec3.fromValues(0.0, -1.0, 2.0));
                mat4.rotate(this.mvpMat, this.mvpMat, 0.75 * Math.PI, vec3.fromValues(1, 0, 0));

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);
                mat4.copy(this.mvpMat, temp);

                gl.drawArrays(gl.LINES, this.bgnDisk, this.bgnSphere - this.bgnDisk);


                //Sphere
                var temp = mat4.create();
                mat4.copy(temp, this.mvpMat);

                mat4.translate(this.mvpMat, this.mvpMat, vec3.fromValues(0.0, -0.5, 3.5));
                mat4.scale(this.mvpMat, this.mvpMat, vec3.fromValues(0.4, 0.4, 0.4));

                gl.uniformMatrix4fv(this.u_mvpMatLoc, false, this.mvpMat);
                mat4.copy(this.mvpMat, temp);

                gl.drawArrays(gl.LINES, this.bgnSphere, this.vboVerts - this.bgnSphere);

                break;
        }

    }

    reload() {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vboContents);
    }
}

class RayTracedView {

    constructor() {
        this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
            'attribute vec4 a_Position;\n' +
            'attribute vec2 a_TexCoord;\n' +
            'varying vec2 v_TexCoord;\n' +
            //
            'void main() {\n' +
            '  gl_Position = a_Position;\n' +
            '  v_TexCoord = a_TexCoord;\n' +
            '}\n';

        this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
            'precision mediump float;\n' +							// set default precision
            //
            'uniform sampler2D u_Sampler;\n' +
            'varying vec2 v_TexCoord;\n' +
            //
            'void main() {\n' +
            '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
            '}\n';

        this.vboContents = //--------------------- 
            new Float32Array([					// Array of vertex attribute values we will
                // transfer to GPU's vertex buffer object (VBO);
                // Quad vertex coordinates(x,y in CVV); texture coordinates tx,ty
                -1.00, 1.00, 0.0, 1.0,			// upper left corner  (borderless)
                -1.00, -1.00, 0.0, 0.0,			// lower left corner,
                1.00, 1.00, 1.0, 1.0,			// upper right corner,
                1.00, -1.00, 1.0, 0.0,			// lower left corner.
            ]);

        this.vboVerts = 4;	

        this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;

        this.vboBytes = this.vboContents.length * this.FSIZE; 
        this.vboStride = this.vboBytes / this.vboVerts;
        this.vboFcount_a_Position = 2; 
        this.vboFcount_a_TexCoord = 2;

        console.assert((this.vboFcount_a_Position +     // check the size of each and
            this.vboFcount_a_TexCoord) *   // every attribute in our VBO
            this.FSIZE == this.vboStride, // for agreeement with'stride'
            "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");

        this.vboOffset_a_Position = 0;
        this.vboOffset_a_TexCoord = (this.vboFcount_a_Position) * this.FSIZE; 
        this.vboLoc;
        this.shaderLoc;
        this.a_PositionLoc;
        this.a_TexCoordLoc;
        this.u_TextureLoc;
        this.u_SamplerLoc;
    }

    init() {
        this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
        if (!this.shaderLoc) {
            console.log(this.constructor.name +
                '.init() failed to create executable Shaders on the GPU. Bye!');
            return;
        }

        gl.program = this.shaderLoc;

        this.vboLoc = gl.createBuffer();

        if (!this.vboLoc) {
            console.log(this.constructor.name +
                '.init() failed to create VBO in GPU. Bye!');
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

        gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);

        this.u_TextureLoc = gl.createTexture();

        if (!this.u_TextureLoc) {
            console.log(this.constructor.name +
                '.init() Failed to create the texture object on the GPU');
            return -1;	// error exit.
        }

        var u_SamplerLoc = gl.getUniformLocation(this.shaderLoc, 'u_Sampler');
        if (!u_SamplerLoc) {
            console.log(this.constructor.name +
                '.init() Failed to find GPU location for texture u_Sampler');
            return -1;	// error exit.
        }

        g_myPic.setTestPattern(0);

        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, this.u_TextureLoc);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, g_myPic.xSize, g_myPic.ySize, 0, gl.RGB, gl.UNSIGNED_BYTE, g_myPic.iBuf);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.uniform1i(this.u_SamplerLoc, 0);

        this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
        if (this.a_PositionLoc < 0) {
            console.log(this.constructor.name +
                '.init() Failed to get GPU location of attribute a_Position');
            return -1;	// error exit.
        }
        this.a_TexCoordLoc = gl.getAttribLocation(this.shaderLoc, 'a_TexCoord');
        if (this.a_TexCoordLoc < 0) {
            console.log(this.constructor.name +
                '.init() failed to get the GPU location of attribute a_TexCoord');
            return -1;	// error exit.
        }
    }

    switchToMe() {
        gl.useProgram(this.shaderLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);

        gl.vertexAttribPointer(this.a_PositionLoc, this.vboFcount_a_Position, gl.FLOAT, false, this.vboStride, this.vboOffset_a_Position);

        gl.vertexAttribPointer(this.a_TexCoordLoc, this.vboFcount_a_TexCoord, gl.FLOAT, false, this.vboStride, this.vboOffset_a_TexCoord);

        gl.enableVertexAttribArray(this.a_PositionLoc);
        gl.enableVertexAttribArray(this.a_TexCoordLoc);
    }

    isReady() {
        var isOK = true;

        if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
            console.log(this.constructor.name +
                '.isReady() false: shader program at this.shaderLoc not in use!');
            isOK = false;
        }
        if (gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
            console.log(this.constructor.name +
                '.isReady() false: vbo at this.vboLoc not in use!');
            isOK = false;
        }
        return isOK;
    }

    adjust() {
        if (this.isReady() == false) {
            console.log('ERROR! before' + this.constructor.name +
                '.adjust() call you needed to call this.switchToMe()!!');
        }
    }

    draw() {
        if (this.isReady() == false) {
            console.log('ERROR! before' + this.constructor.name +
                '.draw() call you needed to call this.switchToMe()!!');
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vboVerts);
    }

    reload() {
        if (this.isReady() == false) {
            console.log('ERROR! before' + this.constructor.name +
                '.reload() call you needed to call this.switchToMe()!!');
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vboContents);

        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, g_myPic.xSize, g_myPic.ySize, gl.RGB, gl.UNSIGNED_BYTE, g_myPic.iBuf);
    }
}


