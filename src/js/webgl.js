// @ts-check

export class WebGL {

  /**
   * @param {number} width
   * @param {number} height
   * @param {string} vertexShaderPath
   * @param {string} fragmentShaderPath
   */
  constructor(width, height, vertexShaderPath, fragmentShaderPath) {
    const thisApp = this;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.webgl = this.canvas.getContext('webgl2');

    this.loadShader(vertexShaderPath, fragmentShaderPath).then(shaderSources => {

      const vertices = new Float32Array([
          -1.0, 1.0,  0.0,
          -1.0, -1.0, 0.0,
          1.0,  1.0,  0.0,
          -1.0, -1.0, 0.0,
          1.0,  -1.0, 0.0,
          1.0,  1.0,  0.0
      ]);

      const colors = new Float32Array([
          1.0, 0.0, 0.0, 1.0,
          0.0, 1.0, 0.0, 1.0,
          0.0, 0.0, 1.0, 1.0,
          0.0, 1.0, 0.0, 1.0,
          0.0, 0.0, 0.0, 1.0,
          0.0, 0.0, 1.0, 1.0
      ]);

      const VERTEX_SIZE = 3;
      const COLOR_SIZE = 4;
      const program = thisApp.createProgram(shaderSources[0], shaderSources[1]);

      this.createBuffer(program, 'vertexPosition', vertices, VERTEX_SIZE);
      this.createBuffer(program, 'color', colors, COLOR_SIZE);

      const VERTEX_NUMS = 6;
      const uniformTime = thisApp.webgl.getUniformLocation(program, 'u_time');
      const uniformResolution = thisApp.webgl.getUniformLocation(program, 'u_resolution');

      function loop( timestamp ) {

        // set uniform params
        thisApp.webgl.uniform1f( uniformTime, timestamp * 0.001 );
        thisApp.webgl.uniform2fv( uniformResolution, [thisApp.canvas.width, thisApp.canvas.height] );

        // draw
        thisApp.webgl.clear( thisApp.webgl.COLOR_BUFFER_BIT | thisApp.webgl.DEPTH_BUFFER_BIT );
        thisApp.webgl.drawArrays( thisApp.webgl.TRIANGLES, 0, VERTEX_NUMS );
        thisApp.webgl.flush();

        window.requestAnimationFrame(loop);
      }

      window.requestAnimationFrame(loop);
    });
  }

  /**
   * @param {string} vertexShaderPath
   * @param {string} fragmentShaderPath
   * @return {Promise<string|Array<string>>}
   */
  loadShader(vertexShaderPath, fragmentShaderPath) {
    return Promise.all(
      new Array(vertexShaderPath, fragmentShaderPath).map( glslFile => fetch(glslFile) )
    ).then(
      responses => Promise.all( responses.map( response => response.text() ) )
    );
  }

  /**
   * Compile shader
   * @param   {WebGLShader}   shader  WebGL Shader.
   * @param   {string}        source  shader source.
   * @return  {any}
   */
  compileShader(shader, source) {

    // Compile
    this.webgl.shaderSource(shader, source);
    this.webgl.compileShader(shader);

    // Check compile status
    const shaderCompileStatus = this.webgl.getShaderParameter(shader, this.webgl.COMPILE_STATUS);
    if(!shaderCompileStatus) console.log( this.webgl.getShaderInfoLog(shader) );
    return shaderCompileStatus;
  }

  /**
   * @param {string} vertexShaderSource Vertex shader source.
   * @param {string} fragmentShaderSource Fragment shader source.
   * @return {WebGLProgram}
   */
  createProgram(vertexShaderSource, fragmentShaderSource){

    // Compile vertexShader and fragmentShader
    const vertexShader = this.webgl.createShader(this.webgl.VERTEX_SHADER);
    const fragmentShader = this.webgl.createShader(this.webgl.FRAGMENT_SHADER);
    this.compileShader(vertexShader, vertexShaderSource);
    this.compileShader(fragmentShader, fragmentShaderSource);

    // Create program
    const program = this.webgl.createProgram();
    this.webgl.attachShader(program, vertexShader);
    this.webgl.attachShader(program, fragmentShader);
    this.webgl.linkProgram(program);

    // Link check
    const linkStatus = this.webgl.getProgramParameter(program, this.webgl.LINK_STATUS);
    if(!linkStatus) console.log( this.webgl.getProgramInfoLog(program) );

    this.webgl.useProgram(program);

    return program;
  }

  /**
   * @param {WebGLProgram} program
   * @param {string} type 'color' or 'vertexPosition'
   * @param {Float32Array} data
   * @param {number} size
   */
  createBuffer(program, type, data, size){
    const buffer = this.webgl.createBuffer();
    const attribLocation  = this.webgl.getAttribLocation(program, type);

    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, buffer);
    this.webgl.enableVertexAttribArray(attribLocation);
    this.webgl.vertexAttribPointer(attribLocation, size, this.webgl.FLOAT, false, 0, 0);
    this.webgl.bindBuffer(this.webgl.ARRAY_BUFFER, buffer);
    this.webgl.bufferData(this.webgl.ARRAY_BUFFER, data, this.webgl.STATIC_DRAW);
  }
}
