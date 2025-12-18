import { Application } from "pixi.js";
import { ParticleSystem } from "./ParticleSystem.js";

(async () => {
    // Инициализация
    const app = new Application();

    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: false,
        preference: "webgl",
    });

    document.querySelector("#canvas-container").appendChild(app.canvas);

    // Стартовые значения
    const INITIAL_PARTICLE_COUNT = 2500;
    const INITIAL_SPEED = 0.6;
    const INITIAL_TRAIL = 0.88;
    const INITIAL_SCALE = 80;

    // Создаём систему частиц с начальным количеством
    const particleSystem = new ParticleSystem(app, INITIAL_PARTICLE_COUNT);
    particleSystem.speed = INITIAL_SPEED;
    particleSystem.trailAlpha = INITIAL_TRAIL;
    particleSystem.flowField.scale = INITIAL_SCALE;

    // UI Controls
    const particleSlider = document.getElementById("particles");
    const speedSlider = document.getElementById("speed");
    const trailSlider = document.getElementById("trail");
    const scaleSlider = document.getElementById("scale");
    const resetBtn = document.getElementById("reset");
    const modeButtons = document.querySelectorAll(".mode-btn");

    // Синхронизируем UI с начальными значениями
    particleSlider.value = INITIAL_PARTICLE_COUNT;
    document.getElementById("particle-value").textContent =
        INITIAL_PARTICLE_COUNT;

    speedSlider.value = INITIAL_SPEED;
    document.getElementById("speed-value").textContent =
        INITIAL_SPEED.toFixed(1);

    trailSlider.value = INITIAL_TRAIL;
    document.getElementById("trail-value").textContent =
        INITIAL_TRAIL.toFixed(2);

    scaleSlider.value = INITIAL_SCALE;
    document.getElementById("scale-value").textContent = INITIAL_SCALE;

    // Обработка слайдеров
    particleSlider.addEventListener("input", (e) => {
        const value = parseInt(e.target.value);
        document.getElementById("particle-value").textContent = value;
        particleSystem.setParticleCount(value);
    });

    speedSlider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById("speed-value").textContent = value.toFixed(1);
        particleSystem.speed = value;
    });

    trailSlider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById("trail-value").textContent = value.toFixed(2);
        particleSystem.trailAlpha = value;
    });

    scaleSlider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        document.getElementById("scale-value").textContent = value;
        particleSystem.flowField.scale = value;
    });

    resetBtn.addEventListener("click", () => {
        particleSystem.reset();
    });

    // Обработка режимов
    const modeConfig = {
        chaos: { name: "Chaos Field", icon: "⚡" },
        flow: { name: "Flow Field", icon: "🖇" },
        galaxy: { name: "Galaxy Field", icon: "🌌" },
        vortex: { name: "Vortex Field", icon: "🌀" },
        wave: { name: "Wave Field", icon: "🌊" },
        magnetic: { name: "Magnetic Field", icon: "🧲" },
    };

    const updateModeTitle = (mode) => {
        const config = modeConfig[mode];
        document.querySelector(".mode-icon").textContent = config.icon;
        document.getElementById("mode-text").textContent = config.name;
    };

    // Устанавливаем начальный режим (chaos)
    particleSystem.setMode("chaos");
    updateModeTitle("chaos");

    modeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            modeButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const mode = btn.dataset.mode;
            particleSystem.setMode(mode);
            updateModeTitle(mode);
        });
    });

    // Обработка мыши
    let mouseX = app.screen.width / 2;
    let mouseY = app.screen.height / 2;
    let isMouseDown = false;

    const cursor = document.getElementById("cursor");

    app.canvas.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursor.style.left = mouseX + "px";
        cursor.style.top = mouseY + "px";

        particleSystem.setMousePosition(mouseX, mouseY);
    });

    app.canvas.addEventListener("mousedown", () => {
        isMouseDown = true;
        cursor.classList.add("active");
        particleSystem.setMousePressed(true);
    });

    app.canvas.addEventListener("mouseup", () => {
        isMouseDown = false;
        cursor.classList.remove("active");
        particleSystem.setMousePressed(false);
    });

    app.canvas.addEventListener("mouseleave", () => {
        cursor.style.display = "none";
    });

    app.canvas.addEventListener("mouseenter", () => {
        cursor.style.display = "block";
    });

    // Touch support
    app.canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        isMouseDown = true;
        particleSystem.setMousePosition(mouseX, mouseY);
        particleSystem.setMousePressed(true);
    });

    app.canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        particleSystem.setMousePosition(mouseX, mouseY);
    });

    app.canvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        isMouseDown = false;
        particleSystem.setMousePressed(false);
    });

    // FPS counter
    let lastTime = performance.now();
    let frames = 0;

    app.ticker.add(() => {
        particleSystem.update();

        // Update FPS
        frames++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
            document.getElementById("fps").textContent = frames;
            frames = 0;
            lastTime = currentTime;
        }
    });

    // Resize handling
    window.addEventListener("resize", () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        particleSystem.resize(window.innerWidth, window.innerHeight);
    });

    console.log("🎨 Particle Flow Field initialized!");
})();
