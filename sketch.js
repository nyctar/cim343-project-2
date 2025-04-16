let size = 120;
let num = 10;
let min = 150;
let grid = [];
let centerDist = [];

// modifiers
let pulseIntensity = 0.75;
let startingColor;
let EndingColor;
let gradientIntensity = 0.8;
let sizeModifier = 1.3;

// modifiers (not intended for user)
let power = 10;

// start tracker
let startBool = false;

// angle
let angleY = 0;
let rotationSpeedY = 0.005;

let angleX = 0;
let rotationSpeedX = 0.005;

// music processing
let song;
let fft;
let spectrum = [];

// default music
let defaultSongs = ["song1.mp3", "song2.mp3"];
let chosenSong;

//UI
let resetButton;
let playButton;
let pulseIntensitySlider;
let gradientIntensitySlider;
let sizeModifierSlider;
let startingColorPicker;
let endingColorPicker;
let volumeSlider;

function preload() {
    chosenSong = random(defaultSongs);
    song = loadSound(chosenSong);
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.style("display", "none");
    fft = new p5.FFT();

    // hide controls at the start
    document.getElementById("controlsContainer").style.display = "none";

    // UI functionality
    pulseIntensitySlider = select('#pulseIntensitySlider');
    gradientIntensitySlider = select('#gradientIntensitySlider');
    sizeModifierSlider = select('#sizeModifierSlider');
    startingColorPicker = select('#startingColorPicker');
    endingColorPicker = select('#endingColorPicker');
    volumeSlider = select('#volumeSlider');

    pulseIntensitySlider.input(function() {
        pulseIntensity = float(pulseIntensitySlider.value());
    });

    gradientIntensitySlider.input(function() {
        gradientIntensity = float(gradientIntensitySlider.value());
    });

    sizeModifierSlider.input(function() {
        sizeModifier = float(sizeModifierSlider.value());
    });

    startingColorPicker.input(function() {
        startingColor = color(startingColorPicker.value());
    });

    endingColorPicker.input(function() {
        endingColor = color(endingColorPicker.value());
    });

    volumeSlider.input(function() {
        song.setVolume(volumeSlider.value());
    });

    // song listener
    let uploadSongInput = select('#uploadSong');
    uploadSongInput.changed(handleSongUpload);

    resetButton = select('#resetButton');
    playButton = select('#playButton');

    resetButton.mousePressed(resetSong);
    playButton.mousePressed(togglePlayback);

    startingColor = color(255, 0, 0);
    endingColor = color(0, 0, 255);  

    let radius = num * size / 2;

    for (let i = 0; i < num; i++) {
        grid[i] = [];
        for (let j = 0; j < num; j++) {
            grid[i][j] = [];
            for (let k = 0; k < num; k++) {
                grid[i][j][k] = floor(random(2));

                let x = (i - num / 2) * size;
                let y = (j - num / 2) * size;
                let z = (k - num / 2) * size;

                let distance = dist(x, y, z, 0, 0, 0);
                if (distance < radius) {
                    centerDist.push({i, j, k, distance});
                }
            }
        }
    }

    centerDist.sort(compareDistance);
}

function start() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("controlsContainer").style.display = "block";
    startBool = true;
    song.play();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function compareDistance(a, b) {
    return a.distance - b.distance;
}

function draw() {
    if (startBool) {

        canvas.style("display", "block");

        orbitControl();

        spectrum = fft.analyze();
        
        let vol = fft.getEnergy(20, 140);

        background(lerpColor(startingColor, endingColor, vol / 255));
        
        // color
        let totalObj = centerDist.length;
        for (let i = 0; i < totalObj; i++) {
            let pos = centerDist[i];
            let c = map(spectrum[i % spectrum.length], 0, 255, min, 255);

            c *= pulseIntensity;

            grid[pos.i][pos.j][pos.k] = c;
        }

        let radius = num * size / 2;
        noFill();

        rotateX(angleX);
        rotateY(angleY);
        angleX += rotationSpeedX;
        angleY += rotationSpeedY;

        ambientLight(150);
        pointLight(255, 255, 255, 0, 0, 200);

        for (let i = 0; i < totalObj; i++) {
            let pos = centerDist[i];
            
            // position of spheres
            let x = (pos.i - num / 2) * size;
            let y = (pos.j - num / 2) * size;
            let z = (pos.k - num / 2) * size;

            // normalized distance
            let maxDistance = dist(0, 0, 0, (num / 2) * size, (num / 2) * size, (num / 2) * size);
            let normalizedDistance = pos.distance / maxDistance;
            let amplifiedDistance = pow(normalizedDistance, gradientIntensity);

            // interpolate color based on distance
            let interColor = lerpColor(startingColor, endingColor, amplifiedDistance);

            // fill the sphere if it meets the intensity threshold
            if (grid[pos.i][pos.j][pos.k] > min) {
                fill(interColor);
                stroke(interColor);
            } else {
                noFill();
                noStroke();
            }

            let sphereSize = (size - size/sizeModifier) * (1 + pow(vol / 255, power)); 

            push();
            translate(x, y, z);
            texture
            sphere(sphereSize);
            pop();
        }
    }
}

// UI logic
function handleSongUpload() {
    let file = select('#uploadSong').elt.files[0];
    if (file) {
        song.stop(); // Stop the current song if there's an upload
        song = loadSound(URL.createObjectURL(file), () => song.play()); // Play uploaded song
    }
}

function resetSong() {
    song.stop();
    song.jump(0);
    if(!song.isPlaying()) {
        song.play();
        playButton.html("Pause");  // Change button text to 'Pause'
    }
}

function togglePlayback() {
    if (song.isPlaying()) {
        song.pause();  // Pause the song if it's playing
        playButton.html("Play");  // Change button text to 'Play'
    } else {
        song.play();  // Play the song if it's paused
        playButton.html("Pause");  // Change button text to 'Pause'
    }
}