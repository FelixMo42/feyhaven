import "pixi.js"
import "@pixi/layout"

import { Application, Container } from 'pixi.js'

import { Hand } from './view/Hand'
import { ProgressBar } from "./view/ProgressBar"
import { Bills } from "./view/Bills"
import { Dialog } from "./view/Dialog"

export const app = new Application()

async function main() {
    await app.init({ background: '#1099bb', resizeTo: window })
    document.body.appendChild(app.canvas)

    app.stage.layout = {
        width: window.innerWidth,
        height: window.innerHeight,
        flexDirection: 'row-reverse',
        padding: 20,
        gap: 20,
    }

    app.stage.addChild(
        ProgressBar(),
        Bills(),
        new Container({
            layout: {
                flexDirection: 'column',
                gap: 20,
            },
            children: [
                Dialog(),
                new Hand(),
            ]
        }),
    )
}

main()
