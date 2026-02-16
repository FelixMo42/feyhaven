import { Application } from "pixi.js";

export const app = new Application()

export async function init() {
    await app.init({ background: '#1099bb', resizeTo: window })
    document.body.appendChild(app.canvas)
    return app
}