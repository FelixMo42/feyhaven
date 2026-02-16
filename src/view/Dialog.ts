import { LayoutContainer, Text } from "@pixi/layout/components"
import { Container } from "pixi.js"

import { game, _ } from "../game/Game"

export function Dialog() {
    const container = new Container({
        layout: {
            flex: 1,
            flexDirection: 'row',
            gap: 20,
        }
    })

    container.addChild(
        new LayoutContainer({
            layout: {
                backgroundColor: "green",
                aspectRatio: 3/4,
                padding: 20,
            },
            children: [
                new Text({
                    text: "Bust\nof\nAnna",
                    layout: true,
                    style: {
                        align: "center",
                    }
                })
            ]
        })
    )

    container.addChild(new Container({
        layout: {
            flexDirection: 'column',
            gap: 10,
            flex: 1,
        },
        children: [
            new LayoutContainer({
                layout: {
                    flex: 1,
                    backgroundColor: "gray",
                    padding: 20,
                },
                children: [
                    new Text({
                        text: "\"Something funny\"",
                        layout: true,
                    })
                ]
            }),
            new LayoutContainer({
                layout: {
                    flexDirection: 'row',
                },
                children: [
                    new LayoutContainer({ layout: { flex: 1 } }),
                    _(new Text({
                        text: `${game.deck.length}/${game.cardCount} in deck`,
                        layout: true,
                    }), (view: Text) => {
                        view.text = `${game.deck.length}/${game.cardCount} in deck`
                    }),
                ]
            })
        ]
    }))

    return container
}
