import { Application, ContainerChild } from "pixi.js";

export const app = new Application()

export async function init(children: ContainerChild[]) {
    await app.init({ background: '#1099bb', resizeTo: window })
    document.body.appendChild(app.canvas)
    app.stage.addChild(...children)
    return app
}