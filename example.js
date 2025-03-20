let song;
let canvas;

let startBool = false;

let fft;
let smoothing = 0.8;
let bins = 512;
let waveform = [];
let r = 100;
let spectrum;

function preload() {
  song = loadSound("song.mp3");
}

function setup() {
  canvas = createCanvas(bins, bins);
  canvas.style("display", "none");
  fft = new p5.FFT(smoothing, bins);
}

function start() {
  document.getElementById("startScreen").style.display = "none";
  startBool = true;
  song.play();
}

function draw() {
  if(startBool) {
    background(220);
    canvas.style("display", "block");

    waveform = fft.waveform();
    spectrum = fft.analyze();

    let vol = fft.getEnergy(20, 140); //amplitude

    if(vol > 250) {
      stroke(255, 0, 0);
    }
    else {
      stroke(0);
    }

    for (let i = 0; i < spectrum.length; i++) {
      let y = map(spectrum[i],0, 255, 0, height);
      line(i, height ,i, height - y);
    }

/*     //time domain graph
    for (let i = 0; i < waveform.length; i++) {
      let y =  height/2 + map(waveform[i], -1, 1, -r, r);
      ellipse(i, y, 1, 1)
    } */
  }
}

