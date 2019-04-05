import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Cube extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  offsets: Float32Array; // Data for bufTranslate
  scales: Float32Array;


  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3,

                                   // back face
                             4, 5, 6,
                             4, 6, 7,

                             // top face
                             8, 9, 10,
                             8, 10, 11,

                             // bottom face
                             12, 13, 14,
                             12, 14, 15,

                             // right face
                             16, 17, 18,
                             16, 18, 19,

                             // left face
                             20, 21, 22,
                             20, 22, 23]);

  this.normals = new Float32Array([

                                  // front face
                                  0, 0, 1, 0,
                                  0, 0, 1, 0,
                                  0, 0, 1, 0,
                                  0, 0, 1, 0,

                                  // back face
                                  0, 0, -1, 0,
                                  0, 0, -1, 0,
                                  0, 0, -1, 0,
                                  0, 0, -1, 0,

                                // top face
                                  0, 1, 0, 0,
                                  0, 1, 0, 0,
                                  0, 1, 0, 0,
                                  0, 1, 0, 0,

                                // bottom face
                                0, -1, 0, 0,
                                0, -1, 0, 0,
                                0, -1, 0, 0,
                                0, -1, 0, 0,

                                // right face
                                1, 0, 0, 0,
                                1, 0, 0, 0,
                                1, 0, 0, 0,
                                1, 0, 0, 0,

                                // left face
                                -1, 0, 0, 0,
                                -1, 0, 0, 0,
                                -1, 0, 0, 0,
                                -1, 0, 0, 0]);

  this.positions = new Float32Array([

                                    // front face
                                     -0.5, -0.5, 0.5, 1,
                                     0.5, -0.5, 0.5, 1,
                                     0.5, 0.5, 0.5, 1,
                                     -0.5, 0.5, 0.5, 1,

                                    // back face
                                    -0.5, -0.5, -0.5, 1,
                                    -0.5, 0.5, -0.5, 1,
                                    0.5, 0.5, -0.5, 1,
                                    0.5, -0.5, -0.5, 1, 

                                    // top face
                                    -0.5, 0.5, -0.5, 1,
                                    -0.5, 0.5, 0.5, 1,
                                    0.5, 0.5, 0.5, 1,
                                    0.5, 0.5, -0.5, 1,

                                    // bottom face
                                    -0.5, -0.5, -0.5, 1, 
                                    0.5, -0.5, -0.5, 1,
                                    0.5, -0.5, 0.5, 1,
                                    -0.5, -0.5, 0.5, 1,

                                    // right face
                                    0.5, -0.5, -0.5, 1,
                                    0.5, 0.5, -0.5, 1,
                                    0.5, 0.5, 0.5, 1,
                                    0.5, -0.5, 0.5, 1,

                                    // left face
                                    -0.5, -0.5, -0.5, 1,
                                    -0.5, -0.5, 0.5, 1, 
                                    -0.5, 0.5, 0.5, 1,
                                    -0.5, 0.5, -0.5, 1]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    this.generateNor();
    this.generateTranslate();
    this.generateScale();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    console.log(`Created cube`);
  }

  setInstanceVBOs(offsets: Float32Array, colors: Float32Array, 
                  scales: Float32Array) {
    this.colors = colors;
    this.offsets = offsets;
    this.scales = scales;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufScale);
    gl.bufferData(gl.ARRAY_BUFFER, this.scales, gl.STATIC_DRAW);
  }
};

export default Cube;
