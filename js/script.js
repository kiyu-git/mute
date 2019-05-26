

onload = function(){

  // canvasエレメントを取得
  var canvas = document.getElementById('canvas');
  var m = document.getElementById('mainVisual');

  canvas.width = m.clientWidth;
  canvas.height = m.clientHeight;
  // webglコンテキストを取得
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // canvasを黒でクリア(初期化)する
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 頂点シェーダとフラグメントシェーダの生成
  var v_shader = create_shader(loadFile("shaders/shader.vert"), gl.VERTEX_SHADER);
  var f_shader = create_shader(loadFile("shaders/shader.frag"), gl.FRAGMENT_SHADER);
  // プログラムオブジェクトの生成とリンク
  var program = create_program(v_shader, f_shader);

  // make vbo
  var vertexData = new Float32Array([
    -1.0,  1.0, // top left
    -1.0, -1.0, // bottom left
    1.0,  1.0, // top right
    1.0, -1.0, // bottom right
  ]);
  var vertexDataBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

  // attribute setup
  var attLocation = gl.getAttribLocation(program, 'position');
  // attribute属性を有効にする
  gl.enableVertexAttribArray(attLocation);
  // attribute属性を登録
  var FSIZE = vertexData.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(attLocation, 2, gl.FLOAT, false, 2*FSIZE, 0);

  // uniform setup
  var u_timeLocation = gl.getUniformLocation(program, 'u_time');
  var u_resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  var u_mouseLocation = gl.getUniformLocation(program, 'u_mouse');
  var mouseX = -10000;
  var mouseY = -10000;

  var startTime = new Date().getTime();
  var framecount = 0;
  // 恒常ループ
  (function loop(){
    // ループのために再帰呼び出し
    requestAnimationFrame( loop );
    framecount ++;
    // フレーム数が２で割り切れなければ描画しない
    if (framecount % 2 == 0) {
      return;
    }

    // 時間管理
    var time = (new Date().getTime() - startTime) * 0.001;
    // send the data to the GPU
    gl.uniform1f(u_timeLocation, time);
    gl.uniform2f(u_resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(u_mouseLocation, mouseX, mouseY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


  })();


  // シェーダを生成する関数
  function create_shader(data ,shaderType){
    // シェーダを格納する変数
    var shader;

    shader = gl.createShader(shaderType);

    // 生成されたシェーダにソースを割り当てる
    gl.shaderSource(shader, data);
    // シェーダをコンパイルする
    gl.compileShader(shader);
    // シェーダが正しくコンパイルされたかチェック
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
      // 成功していたらシェーダを返して終了
      return shader;
    }else{
      // 失敗していたらエラーログをアラートする
      alert(gl.getShaderInfoLog(shader));
    }
  }

  // プログラムオブジェクトを生成しシェーダをリンクする関数
  function create_program(vs, fs){
    // プログラムオブジェクトの生成
    var program = gl.createProgram();

    // プログラムオブジェクトにシェーダを割り当てる
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    // シェーダをリンク
    gl.linkProgram(program);

    // シェーダのリンクが正しく行なわれたかチェック
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){

      // 成功していたらプログラムオブジェクトを有効にする
      gl.useProgram(program);

      // プログラムオブジェクトを返して終了
      return program;
    }else{

      // 失敗していたらエラーログをアラートする
      alert(gl.getProgramInfoLog(program));
    }
  }

  // リサイズイベント発生時に実行
  function onResize() {

    canvas.width = m.clientWidth;
    canvas.height = m.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

  }
  window.addEventListener('resize', onResize);


  function mouseMove(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
  }
  window.addEventListener("mousemove", mouseMove, false);

  function touching(event){
    // TouchList オブジェクトを取得
    mouseX = event.changedTouches[0].pageX;
    mouseY = event.changedTouches[0].pageY;
  }
  canvas.addEventListener("touchmove", touching, false);
  canvas.addEventListener("touchstart", touching, false);

  function canceled(event){
    mouseX = -10000;
    mouseY = -10000;
  }
  m.addEventListener("touchend", canceled, false);
  m.addEventListener("touchcancel", canceled, false);
  m.addEventListener("mouseleave", canceled, false);

  //読み込み用XMR
  function loadFile(url) {
    // Set up an asynchronous request
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    var data;

    // Hook the event that gets called as the request progresses
    request.onreadystatechange = function () {
      // If the request is "DONE" (completed or failed)
      if (request.readyState == 4) {
        // If we got HTTP status 200 (OK)
        if (request.status == 200) {
          data = request.responseText;
        } else { // Failed
          failedXHR(url);
        }
      }
    };

    request.send(null);
    return data;
  }

  function failedXHR(url) {
    alert('Failed to download "' + url + '"');
  }

};
