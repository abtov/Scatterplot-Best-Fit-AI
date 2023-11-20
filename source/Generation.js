var controls_list = [
    document.getElementById("start"),
    document.getElementById("stop"),
    document.getElementById("reset"),
    document.getElementById("save"),
    document.getElementById("best_display"),
  ]
  
  controls_list[0].onclick = (() => stop = false);
  controls_list[1].onclick = (() => stop = true);
  controls_list[2].onclick = (() => generation.reset());
  controls_list[4].onclick = (() => {
    best_display = best_display ? false : true;
    if(best_display) {
        // activation code
        return controls_list[4].innerText = "Show All";
    }
    controls_list[4].innerText = "Show Best"
  });
  
  var input_length = 50;
  var start = true, stop = false;
  var best_display = false;
  var all_simulation = new Set();
  var best_simulation = null;

class Generate {
  constructor() {
    this.dots = [];
    this.generation = 1;
    this.seperation = 40 + Math.round(Math.random() * 50);
    this.max = 500;

    this.new();
  }

  new() {
    this.dots = [];
    this.plane = null;

    this.start = [ Math.round(Math.random() * (-1 * this.max)), Math.round(Math.random() * this.max * 2) - this.max ]
    this.end = [ Math.round(Math.random() * this.max), Math.round(Math.random() * this.max * 2) - this.max ]

    log("——————————")
    log(`Generation: ${this.generation}`)
    log(`start: (${this.start[0]}, ${this.start[1]})\nend: (${this.end[0]}, ${this.end[1]})`)

    for(let i = 0; i < input_length; i++) {
      let ratio = 1 / input_length;
      this.num_x = lerp(this.start[0], this.end[0], ratio * i);
      this.num_y = lerp(this.start[1], this.end[1], ratio * i);
      this.spread = lerp(this.num_y - this.seperation, this.num_y + this.seperation, Math.random().toFixed(2));

      this.dots.push([ this.num_x.toFixed(2), this.spread.toFixed(2) ])
    }

    this.plane = new Plane(this.dots);
    this.generation++;
  }

  reset() {
    return this.new();
  }
}

var gen_list = [];
var gen = new Generate();
var ie = 0;
var previous = {
  total: Infinity,
  neural: null
}
function Frame() {
  //if(ie > 0) return;
  consoles.innerText = MsgConsole;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  var inputs = [];
  gen.dots.forEach(([x, y]) => inputs.push(x, y))

  if(previous.neural == null) {
    var neural = new NeuralNetwork([inputs.length, input_length * (3 / 2) + 2, input_length * (3 / 2) + 2, 2]) 
  }

  if(previous.neural != null) {
    var neural = previous.neural;
    neural = neural.mutate(neural, 0.5);
  }

  let outputs = NeuralNetwork.feedForward(inputs, neural);
  gen.plane.render(gen.start, gen.end, outputs);
  
  var total = 0;
  for(let i = 0; i < 10; i++) {
    for(let i = 0; i < gen.dots.length; i++) { 
      let trans = {
          x: (gen.dots[i][0] * gen.plane.ratio.x) + gen.plane.start.x, 
          y: (gen.dots[i][1] * -1 * gen.plane.ratio.y) + gen.plane.start.y
      };
      //let px = lerp(gen.plane.lpbf_s_x, gen.plane.lpbf_e_x, i * 0.1);
      //let py = lerp(gen.plane.lpbf_s_y, gen.plane.lpbf_e_y, i * 0.1);

      let px = lerp(gen.plane.s_x, gen.plane.e_x, i * 0.1);
      let py = lerp(gen.plane.s_y, gen.plane.e_y, i * 0.1);

      let distance = Math.abs(Math.sqrt(Math.pow(px - trans.x, 2) + Math.pow(py - trans.y, 2)));
      total += distance;
    }
  }
  if(previous.total > total) {
    previous.total = total;
    previous.neural = neural;
    log('new best: ' + total)
  }
  ie++;
}
var app = new App("Scatterplot", Frame)
app.runLoop();