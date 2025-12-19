import type { Vector2D, HistoryPoint } from "../types";

/**
 * Particle - одна частица в системе
 *
 * Каждая частица:
 * - Имеет позицию (x, y)
 * - Имеет скорость (vx, vy)
 * - Имеет историю позиций для trail эффекта
 * - Следует векторному полю
 */
export class Particle {
    public x: number;
    public y: number;
    public vx: number = 0;
    public vy: number = 0;
    public width: number;
    public height: number;
    public maxSpeed: number = 2;
    public hue: number;
    public history: HistoryPoint[] = [];
    public maxHistory: number = 20;

    constructor(x: number, y: number, width: number, height: number) {
        // Добавляем небольшой отступ от краёв при инициализации
        const padding = 50;
        this.x = padding + Math.random() * (width - padding * 2);
        this.y = padding + Math.random() * (height - padding * 2);
        this.width = width;
        this.height = height;
        this.hue = Math.random() * 360;
    }

    /**
     * Обновление частицы
     */
    public update(force: Vector2D, speed: number): void {
        // Применяем силу к скорости (F = ma, у нас m = 1)
        this.vx += force.x * 0.3;
        this.vy += force.y * 0.3;

        // Ограничиваем максимальную скорость
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > this.maxSpeed) {
            this.vx = (this.vx / currentSpeed) * this.maxSpeed;
            this.vy = (this.vy / currentSpeed) * this.maxSpeed;
        }

        // Сохраняем текущую позицию в историю
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        // Обновляем позицию на основе скорости
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Отскок от границ
        this.handleBoundaries();

        // Обновляем цвет на основе скорости
        const speedRatio = currentSpeed / this.maxSpeed;
        this.hue = speedRatio * 120; // От 0 (красный) до 120 (зелёный)
    }

    /**
     * Обработка границ (отскок)
     */
    private handleBoundaries(): void {
        let bounced = false;
        const damping = 0.7;
        const margin = 2;

        // X границы
        if (this.x < margin) {
            this.x = margin;
            this.vx = Math.abs(this.vx) * damping;
            bounced = true;
        } else if (this.x > this.width - margin) {
            this.x = this.width - margin;
            this.vx = -Math.abs(this.vx) * damping;
            bounced = true;
        }

        // Y границы
        if (this.y < margin) {
            this.y = margin;
            this.vy = Math.abs(this.vy) * damping;
            bounced = true;
        } else if (this.y > this.height - margin) {
            this.y = this.height - margin;
            this.vy = -Math.abs(this.vy) * damping;
            bounced = true;
        }

        // Если отскочили - очищаем историю
        if (bounced) {
            this.history = [];
        }
    }

    /**
     * Сброс частицы на случайную позицию
     */
    public reset(width: number, height: number): void {
        const padding = 50;
        this.x = padding + Math.random() * (width - padding * 2);
        this.y = padding + Math.random() * (height - padding * 2);
        this.vx = 0;
        this.vy = 0;
        this.history = [];
        this.width = width;
        this.height = height;
    }
}
