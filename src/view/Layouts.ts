import { Container, ContainerChild } from "pixi.js"

export function Col(children: ContainerChild[], gap: number = 0) {
    const container = new Container({
        layout: {
            flexDirection: 'column',
            gap,
        }
    })

    container.addChild(...children)

    return container
}

export function Row(children: ContainerChild[]) {
    const container = new Container({
        layout: {
            flexDirection: 'row',
        }
    })

    container.addChild(...children)

    return container
}
