import { LayoutContainer, Text } from "@pixi/layout/components"
import { Button } from "@pixi/ui"
import { Container, Graphics } from "pixi.js"
import { game } from "../game/Game"

export function ProgressBar() {
    const container = new Container({
        layout: {
            gap: 20,
            flexDirection: 'column',
        }
    })

    container.addChild(
        HappinessIsAWarmGun(),
        NextTurnButton()
    )

    return container
}

function HappinessIsAWarmGun() {
    const container = new LayoutContainer({
        layout: {
            flex: 1,
            // backgroundColor: "gray",
            borderRadius: 10,
            flexDirection: 'column',
            gap: 5,
        }
    })

    for (let i = 0; i < 6; i++)
        container.addChild(new LayoutContainer({
            layout: {
                flex: 1,
                borderWidth: 2,
                borderColor: "black",
                backgroundColor: "grey",
                borderRadius: 10,
            }
        }))

    return container
}

function NextTurnButton() {
    const container = new LayoutContainer({
        layout: {
            width: 120,
            height: 120,
            justifyContent: "center",
            alignItems: "center",
        }
    })

    container.addChild(
        new Graphics()
            .circle(60, 60, 60)
            .fill("grey")
    )
    container.addChild(
        new Text({
            text: "NEXT\nTURN",
            anchor: 0.5,
            layout: true,
            style: {
                align: "center",
            }
        })
    )

    new Button(container).onPress.connect(() => {
        game.nextTurn()
    })

    return container
}