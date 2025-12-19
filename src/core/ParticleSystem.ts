import { Graphics, RenderTexture, Sprite } from "pixi.js";
import { Particle } from "./Particle";
import { FlowField } from "./FlowField";
import type { PixiApp, FlowFieldMode, Resizable, Updatable } from "../types";

/**
 * ParticleSystem - управляет всеми частицами и их рендерингом
 */
export class ParticleSystem implements Resizable, Updatable {
    private app: PixiApp;
    private width: number;
    private height: number;
    private particleCount: number;
    private particles: Particle[] = [];
    private graphics: Graphics;
    private fadeOverlay: Graphics;
    private trailTexture: RenderTexture;
    private trailSprite: Sprite;

    public speed: number = 1.0;
    public trailAlpha: number = 0.95;
    public flowField: FlowField;

    constructor(app: PixiApp, particleCount: number) {
        this.app = app;
        this.width = app.screen.width;
        this.height = app.screen.height;
        this.particleCount = particleCount;

        this.flowField = new FlowField(this.width, this.height, "flow");
        this.initParticles();

        this.trailTexture = RenderTexture.create({
            width: this.width,
            height: this.height,
        });

        this.trailSprite = new Sprite(this.trailTexture);
        this.app.stage.addChild(this.trailSprite);

        this.graphics = new Graphics();
        this.fadeOverlay = new Graphics();
        this.updateFadeOverlay();
    }

    /**
     * Инициализация частиц
     */
    private initParticles(): void {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            this.particles.push(new Particle(x, y, this.width, this.height));
        }
        console.log(`✨ Created ${this.particleCount} particles`);
    }

    /**
     * Обновление fade overlay
     */
    private updateFadeOverlay(): void {
        this.fadeOverlay.clear();
        this.fadeOverlay.rect(0, 0, this.width, this.height);
        this.fadeOverlay.fill({ color: 0x000000, alpha: 1 - this.trailAlpha });
    }

    /**
     * Главный цикл обновления
     */
    public update(): void {
        this.flowField.update();

        // Применяем fade
        this.app.renderer.render({
            container: this.fadeOverlay,
            target: this.trailTexture,
            clear: false,
        });

        // Очищаем graphics
        this.graphics.clear();

        // Обновляем и рисуем частицы
        this.renderParticles();

        // Рендерим graphics на trail texture
        this.app.renderer.render({
            container: this.graphics,
            target: this.trailTexture,
            clear: false,
        });
    }

    /**
     * Рендеринг частиц
     */
    private renderParticles(): void {
        for (const particle of this.particles) {
            const force = this.flowField.getVector(particle.x, particle.y);
            particle.update(force, this.speed);

            const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
            const speedRatio = speed / particle.maxSpeed;
            const hue = speedRatio * 180;
            const color = this.hslToHex(hue, 100, 50);

            // Рисуем точку
            this.graphics.circle(particle.x, particle.y, 1.5);
            this.graphics.fill({ color, alpha: 0.8 });

            // Рисуем линию (trail)
            if (particle.history.length > 0) {
                const prev = particle.history[particle.history.length - 1];
                const dx = particle.x - prev.x;
                const dy = particle.y - prev.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 50) {
                    this.graphics.moveTo(prev.x, prev.y);
                    this.graphics.lineTo(particle.x, particle.y);
                    this.graphics.stroke({ width: 1, color, alpha: 0.3 });
                }
            }
        }
    }

    /**
     * HSL в HEX конвертация
     */
    private hslToHex(h: number, s: number, l: number): number {
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;

        let r = 0,
            g = 0,
            b = 0;

        if (h >= 0 && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (h >= 60 && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (h >= 180 && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (h >= 240 && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else if (h >= 300 && h < 360) {
            r = c;
            g = 0;
            b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return (r << 16) | (g << 8) | b;
    }

    /**
     * Установить количество частиц
     */
    public setParticleCount(count: number): void {
        if (count > this.particleCount) {
            const toAdd = count - this.particleCount;
            for (let i = 0; i < toAdd; i++) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                this.particles.push(
                    new Particle(x, y, this.width, this.height)
                );
            }
        } else if (count < this.particleCount) {
            this.particles = this.particles.slice(0, count);
        }
        this.particleCount = count;
        console.log(`✨ Updated to ${count} particles`);
    }

    /**
     * Сброс всех частиц
     */
    public reset(): void {
        this.graphics.clear();
        this.graphics.rect(0, 0, this.width, this.height);
        this.graphics.fill(0x000000);
        this.app.renderer.render({
            container: this.graphics,
            target: this.trailTexture,
            clear: true,
        });
        this.graphics.clear();

        this.particles.forEach((p) => p.reset(this.width, this.height));
        console.log("🔄 Reset particles");
    }

    /**
     * Установить режим
     */
    public setMode(mode: FlowFieldMode): void {
        this.flowField.setMode(mode);
        console.log(`🎨 Mode changed to: ${mode}`);
    }

    /**
     * Установить позицию мыши
     */
    public setMousePosition(x: number, y: number): void {
        this.flowField.setMousePosition(x, y);
    }

    /**
     * Установить состояние мыши
     */
    public setMousePressed(pressed: boolean): void {
        this.flowField.setMousePressed(pressed);
    }

    /**
     * Ресайз
     */
    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;

        this.trailTexture.destroy();
        this.trailTexture = RenderTexture.create({ width, height });
        this.trailSprite.texture = this.trailTexture;

        this.updateFadeOverlay();
        this.flowField.resize(width, height);

        this.particles.forEach((p) => {
            p.width = width;
            p.height = height;
        });

        console.log(`📐 Resized to ${width}x${height}`);
    }
}
