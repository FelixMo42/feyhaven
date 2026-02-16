import { LayoutContainer, Text } from "@pixi/layout/components"
import { Button } from "@pixi/ui"
import { Container, Graphics } from "pixi.js"

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
            backgroundColor: "gray",
            borderRadius: 10,
        }
    })

    container.addChild(
        new Text({
            text: `+ 10`
        })
    )

    return container
}

function NextTurnButton() {
    const container = new LayoutContainer({
        anchor: 0.5,
        center: 0.5,
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

    new Button(container)

    return container
}