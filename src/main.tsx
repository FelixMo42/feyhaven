import { Container, ContainerChild, Graphics, Text } from 'pixi.js';
import { hand, Hand } from './Hand'
import { init } from './app'

function Row(...children: ContainerChild[]) {
    const container = new Container()
    container.addChild(...children)
    let x = 0
    for (const child of children) {
        child.x = x
        x += child.width
    }
    return container
}

function Col(...children: ContainerChild[]) {
    const container = new Container()
    container.addChild(...children)
    let y = 0
    for (const child of children) {
        child.y = y
        y += child.height
    }
    return container
}

function SideBar() {
    const container = new Container()

    container.x = window.innerWidth - 80

    const barHeight = window.innerHeight - 40

    const happiness = hand.getHappiness()
    const percent = happiness / 100

    container.addChild(new Graphics())
        .filletRect(0, 20, 60, barHeight, 20)
        .fill("grey")

    container.addChild(new Graphics())
        .filletRect(
            0,
            window.innerHeight - barHeight * percent - 20,
            60,
            barHeight * percent,
            20
        )
        .fill("yellow")

    container.addChild(new Graphics())
        .filletRect(
            0,
            window.innerHeight - 30 - 20,
            60,
            30,
            20
        )
        .fill("orange")

    return container
}

async function main() {
    const app = await init()

    app.stage.addChild(
        hand.draw(7),
        SideBar(),
    )
}

main()