import type { Application } from "pixi.js";

/**
 * Режимы работы flow field
 */
export type FlowFieldMode =
    | "flow"
    | "galaxy"
    | "vortex"
    | "chaos"
    | "wave"
    | "magnetic";

/**
 * Вектор силы (2D)
 */
export interface Vector2D {
    x: number;
    y: number;
}

/**
 * Точка в истории частицы
 */
export interface HistoryPoint {
    x: number;
    y: number;
}

/**
 * Конфигурация режима
 */
export interface ModeConfig {
    name: string;
    icon: string;
}

/**
 * Настройки приложения
 */
export interface AppSettings {
    particleCount: number;
    speed: number;
    trailAlpha: number;
    scale: number;
}

/**
 * Интерфейс для классов, которые можно ресайзить
 */
export interface Resizable {
    resize(width: number, height: number): void;
}

/**
 * Интерфейс для обновляемых объектов
 */
export interface Updatable {
    update(deltaTime?: number): void;
}

/**
 * Тип для Pixi Application (для удобства)
 */
export type PixiApp = Application;
