import {vec3, vec2} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import Mesh from './geometry/Mesh';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import {Grid} from "./grid"
import {readTextFile} from './globals';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  population: false,
  seed: 0.0
};

let square: Square;
let screenQuad: ScreenQuad;
let cube: Cube;
let time: number = 0.0;
let grid: Grid;
let building: Cube;
let building2: Cube;
let mesh: Mesh;
let mesh2: Mesh;
let seed: vec3;

function rng(x: vec3) {
    let n: number = x[0] * 137 + x[1] * 122237 + x[2] * 13;
  var result = Math.abs(Math.sin(n) * 43758.5453123) - Math.floor(Math.abs(Math.sin(n) * 43758.5453123));
  x[0] ++;
  return result;
}

function loadScene() {

  let n: number = 50.0;
  grid = new Grid(vec3.fromValues(controls.seed, 0.0, 0.0), n);

  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();
  cube = new Cube();
  cube.create();
  building = new Cube();
  building.create();

  building2 = new Cube();
  building2.create();

  let obj0: string = readTextFile('./resources/tree.obj');
  mesh = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  mesh.create();

  let obj1: string = readTextFile('./resources/tree3.obj');
  mesh2 = new Mesh(obj1, vec3.fromValues(0, 0, 0));
  mesh2.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
  let streetOffsetsArray = [];
  let streetColorsArray = [];
  let colorsArray = [];
  let scalesArray = [];

  let buildingOffsetArray = [];
  let buildingColorsArray = [];
  let buildingScalesArray= [];
  let buildingCount: number = 0.0;

  let building2OffsetArray = [];
  let building2ColorsArray = [];
  let building2ScalesArray= [];
  let building2Count: number = 0.0;

  let streetCount: number = 0.0;

  let treeOffsetArray = [];
  let treeRotationArray = [];
  let treeColorArray = [];
  let treeScaleArray = [];
  let treeCount: number = 0.0;

  let tree2OffsetArray = [];
  let tree2RotationArray = [];
  let tree2ColorArray = [];
  let tree2ScaleArray = [];
  let tree2Count: number = 0.0;

  for(let i = -n/2; i < n/2; i++) {
    for(let j = -n/2; j < n/2; j++) {
      var point = vec2.fromValues(i, j);
      var road = grid.isRoad(point);
      var c = grid.height(point);      
      var p = grid.population(point);
      var b = grid.isBuilding(point);

      if (controls.population) {
              if (c == 0.0) {
      offsetsArray.push(i);
      offsetsArray.push(0.5);
      offsetsArray.push(j);
      }
      else {
        offsetsArray.push(i);
        offsetsArray.push(1.0);
        offsetsArray.push(j);
      }

            // population view
      if (c == 0.0 || road) {
      scalesArray.push(1.0);
      scalesArray.push(1.0);
      scalesArray.push(1.0);
      } 
      else {
        scalesArray.push(1.0);
        scalesArray.push((1.0 + p * 50.0) - 3.0);
        scalesArray.push(1.0);
      }

      if (road && c != 0) {
                  colorsArray.push(0.0);
          colorsArray.push(0.0);
          colorsArray.push(1.0);
          colorsArray.push(0.8); // Alpha channel
      } 
      else if (c == 0) {
                          colorsArray.push(0.0);
          colorsArray.push(0.0);
          colorsArray.push(1.0);
          colorsArray.push(0.8); // Alpha channel
      }
      else {
        // population view
        colorsArray.push(Math.sqrt(p));
        colorsArray.push(0.0);
        colorsArray.push(0.0);
        colorsArray.push(1.0); // Alpha channel
      }
      }
      else {

      if (b && !road) {
        buildingCount++;

        buildingOffsetArray.push(i);
        buildingOffsetArray.push(3.0);
        buildingOffsetArray.push(j);

        building2Count++;
        building2OffsetArray.push(i);
        building2OffsetArray.push(3.0);
        building2OffsetArray.push(j);

        var top = Math.floor(1.0 + p * 50.0);
        if (top % 5 != 0) {
          top -= top % 5;
        }
        buildingScalesArray.push(1.0);
        buildingScalesArray.push(top);
        buildingScalesArray.push(1.0);

        buildingColorsArray.push(1.0);
        buildingColorsArray.push(1.0);
        buildingColorsArray.push(1.0);
        buildingColorsArray.push(0.5); // Alpha channel

        building2ScalesArray.push(0.75);
        building2ScalesArray.push(top - rng(seed) * 2.0);
        building2ScalesArray.push(0.75);

        building2ColorsArray.push(0.0);
        building2ColorsArray.push(0.0);
        building2ColorsArray.push(1.0);
        building2ColorsArray.push(0.4); // Alpha channel

      }
      if (road && c != 0) {
          streetOffsetsArray.push(i);
          streetOffsetsArray.push(1.50);
          streetOffsetsArray.push(j);

          streetColorsArray.push(0.0);
          streetColorsArray.push(0.0);
          streetColorsArray.push(1.0);
          streetColorsArray.push(0.5); // Alpha channel

          streetCount++;
      }

      if (c == 0.0) {
      offsetsArray.push(i);
      offsetsArray.push(0.5);
      offsetsArray.push(j);
      }
      else {
        offsetsArray.push(i);
        offsetsArray.push(1.0);
        offsetsArray.push(j);
      }

      if (grid.isTree(point) && !b && !road) {
        var random = rng(seed);
        if (random > 0.7) {
        treeCount++;
        treeOffsetArray.push(-1.0 + i);
        //treeOffsetArray.push(0.0 + i);
        treeOffsetArray.push(1.5);
        treeOffsetArray.push(0 + j);

        treeScaleArray.push(0.04);
        treeScaleArray.push(0.04);
        treeScaleArray.push(0.04);

        treeColorArray.push(1.0);
        treeColorArray.push(1.0);
        treeColorArray.push(1.0);
        treeColorArray.push(0.4);

        treeRotationArray.push(0.0);
        treeRotationArray.push(0.0);
        treeRotationArray.push(0.0);
        treeRotationArray.push(rng(seed) * 3.0);
      }
      else {
        tree2Count++;
        tree2OffsetArray.push(0.0 + i);
        tree2OffsetArray.push(1.5);
        tree2OffsetArray.push(0 + j);

        tree2ScaleArray.push(0.04);
        tree2ScaleArray.push(0.04);
        tree2ScaleArray.push(0.04);

        tree2ColorArray.push(1.0);
        tree2ColorArray.push(1.0);
        tree2ColorArray.push(1.0);
        tree2ColorArray.push(0.4);

        tree2RotationArray.push(0.0);
        tree2RotationArray.push(1.0);
        tree2RotationArray.push(0.0);
        tree2RotationArray.push(rng(seed) * 3.0);
      }
    }

      scalesArray.push(1.0);
      scalesArray.push(1.0);
      scalesArray.push(1.0);

      if (p == 0.0) {
                  colorsArray.push(0.0);
          colorsArray.push(0.0);
          colorsArray.push(1.0);
          colorsArray.push(0.8); // Alpha channel
      }
      else {
              if (road && c != 0) {
                  colorsArray.push(0.0);
          colorsArray.push(0.0);
          colorsArray.push(1.0);
          colorsArray.push(0.8); // Alpha channel
      } else {
        if (grid.isBuilding(point)) {
                      
                  colorsArray.push(0.0);
          colorsArray.push(0.0);
          colorsArray.push(1.0);
          colorsArray.push(0.8); // Alpha channel
        }
        else {
          colorsArray.push(141 / 255);
          colorsArray.push(175 / 255);
          colorsArray.push(117 / 255); 
          colorsArray.push(1.0);// Alpha channel
      }
      }
    }
        }
    }
  }



  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  let scales: Float32Array = new Float32Array(scalesArray);

  let streetoffsets: Float32Array = new Float32Array(streetOffsetsArray);
  let streetcolors: Float32Array = new Float32Array(streetColorsArray);

  let buildingoffsets: Float32Array = new Float32Array(buildingOffsetArray);
  let buildingcolors: Float32Array = new Float32Array(buildingColorsArray);
  let buildingscales: Float32Array = new Float32Array(buildingScalesArray);
  
  let building2offsets: Float32Array = new Float32Array(building2OffsetArray);
  let building2colors: Float32Array = new Float32Array(building2ColorsArray);
  let building2scales: Float32Array = new Float32Array(building2ScalesArray);
 
  let treeoffsets: Float32Array = new Float32Array(treeOffsetArray);
  let treecolors: Float32Array = new Float32Array(treeColorArray);
  let treescales: Float32Array = new Float32Array(treeScaleArray);
  let treerotations: Float32Array = new Float32Array(treeRotationArray);

  let tree2offsets: Float32Array = new Float32Array(tree2OffsetArray);
  let tree2colors: Float32Array = new Float32Array(tree2ColorArray);
  let tree2scales: Float32Array = new Float32Array(tree2ScaleArray);
  let tree2rotations: Float32Array = new Float32Array(tree2RotationArray);

  square.setInstanceVBOs(streetoffsets, streetcolors);
  square.setNumInstances(streetCount); // grid of "particles"
  cube.setInstanceVBOs(offsets, colors, scales);
  cube.setNumInstances(n * n);
  building.setInstanceVBOs(buildingoffsets, buildingcolors, buildingscales);
  building.setNumInstances(buildingCount);

  building2.setInstanceVBOs(building2offsets, building2colors, building2scales);
  building2.setNumInstances(building2Count);


  mesh.setInstanceVBOs(treeoffsets, treecolors, treerotations, treescales);
  mesh.setNumInstances(treeCount);

  mesh2.setInstanceVBOs(tree2offsets, tree2colors, tree2rotations, tree2scales);
  mesh2.setNumInstances(tree2Count);
}

function main() {
  // Initial display for framerate

  seed = vec3.fromValues(0.0, 0.0, 0.0);
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  var guiP = gui.add(controls, 'population');
  var guiS = gui.add(controls, 'seed', 0.0, 10.0);
  guiS.onChange(function(value: number) {
    loadScene();
  });
    guiP.onChange(function(value: number) {
    loadScene();
  });

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2', {premultipliedAlpha: false});
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0.0, 11.5, 0.0), vec3.fromValues(0, 0, 0));
  camera.position = vec3.fromValues(2.0, 11.5, 47);

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Additive blending
  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.BACK);

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
     mesh, 
     mesh2,
     square, cube, building2, building
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
