import type { FlowFieldMode, Vector2D, Resizable } from "../types";

/**
 * FlowField - создаёт векторное поле на основе Perlin Noise
 */
export class FlowField implements Resizable {
    public width: number;
    public height: number;
    public mode: FlowFieldMode;
    public scale: number = 100;
    public time: number = 0;
    public timeSpeed: number = 0.0003;
    public mouseX: number;
    public mouseY: number;
    public mouseRadius: number = 150;
    public mouseForce: number = 0.5;
    public mousePressed: boolean = false;

    private perm: number[] = new Array(512);
    private gradP: number[][] = new Array(512);
    private readonly grad3: number[][] = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1],
    ];

    constructor(width: number, height: number, mode: FlowFieldMode = "flow") {
        this.width = width;
        this.height = height;
        this.mode = mode;
        this.mouseX = width / 2;
        this.mouseY = height / 2;
        this.initPerlin();
    }

    /**
     * Инициализация Perlin Noise
     */
    private initPerlin(): void {
        const p: number[] = [];
        for (let i = 0; i < 256; i++) {
            p[i] = Math.floor(Math.random() * 256);
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
            this.gradP[i] = this.grad3[this.perm[i] % 12];
        }
    }

    /**
     * Fade function для сглаживания
     */
    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Линейная интерполяция
     */
    private lerp(a: number, b: number, t: number): number {
        return (1 - t) * a + t * b;
    }

    /**
     * 2D Perlin Noise
     */
    private noise2D(x: number, y: number): number {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const A = this.perm[X] + Y;
        const AA = this.perm[A];
        const AB = this.perm[A + 1];
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B];
        const BB = this.perm[B + 1];

        return this.lerp(
            this.lerp(
                this.grad(this.perm[AA], x, y),
                this.grad(this.perm[BA], x - 1, y),
                u
            ),
            this.lerp(
                this.grad(this.perm[AB], x, y - 1),
                this.grad(this.perm[BB], x - 1, y - 1),
                u
            ),
            v
        );
    }

    /**
     * Вычисление градиента
     */
    private grad(hash: number, x: number, y: number): number {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * Получить вектор силы в точке (x, y)
     */
    public getVector(x: number, y: number): Vector2D {
        let angle = this.calculateAngle(x, y);
        angle = this.applyMouseInteraction(x, y, angle);

        return {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };
    }

    /**
     * Вычисление угла для разных режимов
     */
    private calculateAngle(x: number, y: number): number {
        switch (this.mode) {
            case "flow":
                return (
                    this.noise2D(x / this.scale, y / this.scale + this.time) *
                    Math.PI *
                    2
                );

            case "galaxy":
                return this.calculateGalaxyAngle(x, y);

            case "vortex":
                return this.calculateVortexAngle(x, y);

            case "chaos":
                return this.calculateChaosAngle(x, y);

            case "wave":
                return this.calculateWaveAngle(x, y);

            case "magnetic":
                return this.calculateMagneticAngle(x, y);

            default:
                return 0;
        }
    }

    private calculateGalaxyAngle(x: number, y: number): number {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const baseAngle = Math.atan2(dy, dx);
        return (
            baseAngle +
            dist * 0.01 +
            this.noise2D(x / this.scale, y / this.scale) * 0.5
        );
    }

    private calculateVortexAngle(x: number, y: number): number {
        const vortexX = this.width / 2;
        const vortexY = this.height / 2;
        const vdx = x - vortexX;
        const vdy = y - vortexY;
        const vdist = Math.sqrt(vdx * vdx + vdy * vdy);
        const angle = Math.atan2(vdy, vdx) + Math.PI / 2 + vdist * 0.005;
        return (
            angle +
            this.noise2D(
                x / (this.scale * 0.5),
                y / (this.scale * 0.5) + this.time
            ) *
                1.5
        );
    }

    private calculateChaosAngle(x: number, y: number): number {
        const angle1 =
            this.noise2D(
                x / (this.scale * 0.3),
                y / (this.scale * 0.3) + this.time * 2
            ) *
            Math.PI *
            4;
        const angle2 =
            this.noise2D(
                x / (this.scale * 0.5),
                y / (this.scale * 0.5) - this.time
            ) *
            Math.PI *
            2;
        return angle1 + angle2;
    }

    private calculateWaveAngle(x: number, y: number): number {
        const waveFreq = 0.01;
        const waveSpeed = this.time * 200;
        const wave1 = Math.sin((y + waveSpeed) * waveFreq) * Math.PI;
        const wave2 = Math.sin((x - waveSpeed * 0.7) * waveFreq) * Math.PI;
        return (
            wave1 +
            wave2 +
            this.noise2D(x / this.scale, y / this.scale + this.time * 0.5) * 0.3
        );
    }

    private calculateMagneticAngle(x: number, y: number): number {
        const pole1X = this.width * 0.3;
        const pole1Y = this.height * 0.5;
        const pole2X = this.width * 0.7;
        const pole2Y = this.height * 0.5;

        const dx1 = x - pole1X;
        const dy1 = y - pole1Y;
        const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) + 1;
        const angle1 = Math.atan2(dy1, dx1);
        const force1 = 100 / dist1;

        const dx2 = x - pole2X;
        const dy2 = y - pole2Y;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) + 1;
        const angle2 = Math.atan2(dy2, dx2);
        const force2 = 100 / dist2;

        const forceX =
            Math.cos(angle1) * force1 - Math.cos(angle2 + Math.PI) * force2;
        const forceY =
            Math.sin(angle1) * force1 - Math.sin(angle2 + Math.PI) * force2;

        return (
            Math.atan2(forceY, forceX) +
            this.noise2D(
                x / (this.scale * 2),
                y / (this.scale * 2) + this.time
            ) *
                0.5
        );
    }

    /**
     * Применение интерактивности мыши
     */
    private applyMouseInteraction(x: number, y: number, angle: number): number {
        if (!this.mousePressed) return angle;

        const dx = x - this.mouseX;
        const dy = y - this.mouseY;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse < this.mouseRadius) {
            const influence = 1 - distToMouse / this.mouseRadius;
            const mouseAngle = Math.atan2(dy, dx) + Math.PI;
            const mixFactor = influence * this.mouseForce;
            return angle * (1 - mixFactor) + mouseAngle * mixFactor;
        }

        return angle;
    }

    /**
     * Обновление поля (анимация)
     */
    public update(): void {
        this.time += this.timeSpeed;
    }

    /**
     * Установить позицию мыши
     */
    public setMousePosition(x: number, y: number): void {
        this.mouseX = x;
        this.mouseY = y;
    }

    /**
     * Установить состояние мыши
     */
    public setMousePressed(pressed: boolean): void {
        this.mousePressed = pressed;
    }

    /**
     * Изменить режим
     */
    public setMode(mode: FlowFieldMode): void {
        this.mode = mode;

        const modeSpeed: Record<FlowFieldMode, number> = {
            flow: 0.0003,
            galaxy: 0.0001,
            vortex: 0.0005,
            chaos: 0.001,
            wave: 0.0002,
            magnetic: 0.0003,
        };

        this.timeSpeed = modeSpeed[mode];
    }

    /**
     * Ресайз
     */
    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.mouseX = width / 2;
        this.mouseY = height / 2;
    }
}
