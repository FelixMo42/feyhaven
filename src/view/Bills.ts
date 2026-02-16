import "pixi.js"
import "@pixi/layout"

import { Container } from 'pixi.js';
import { LayoutContainer, Text } from "@pixi/layout/components";

export function Bills() {
    const container = new Container({
        layout: {
            flex: 1,
            flexDirection: 'column',
            gap: 20,
        }
    })

    container.addChild(
        new Text({
            text: "Receipt",
            layout: {
                alignSelf: "center",
            }
        }),
        new LayoutContainer({
            layout: {
                flex: 1,
                backgroundColor: "gray",
                borderRadius: 10,
            }
        }),
        new LayoutContainer({
            layout: {
                flex: 1,
                backgroundColor: "gray",
                borderRadius: 10,
            }
        }),
        new LayoutContainer({
            layout: {
                flex: 1,
                backgroundColor: "gray",
                borderRadius: 10,
            }
        }),
    )

    return container
}
