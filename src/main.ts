import "pixi.js"
import "@pixi/layout"

import { Application, Container } from 'pixi.js';
import { LayoutContainer, Text } from "@pixi/layout/components";

import { Hand } from './view/Hand'
import { ProgressBar } from "./view/ProgressBar";
import { Col, Row } from "./view/Layouts";

import { deck } from "./game/Deck";

export const app = new Application()

function Todo() {
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

async function main() {
    await app.init({ background: '#1099bb', resizeTo: window })
    document.body.appendChild(app.canvas)

    app.stage.layout = {
        width: window.innerWidth,
        height: window.innerHeight,
        flexDirection: 'row',
        padding: 20,
        gap: 20,
    }

    app.stage.addChild(
        Col([
            Dialog(),
            new Hand().draw(7),
        ], 20),
        Todo(),
        ProgressBar(),
    )
}

function Dialog() {
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
            }
        })
    ).addChild(new Text({
        text: "Bust\nof\nAnna",
        layout: true,
        style: {
            align: "center",
        }
    }))

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
            Row([
                new LayoutContainer({ layout: { flex: 1 } }),
                new Text({
                    text: `???/${deck.deck.length} in deck`,
                    layout: true,
                }),
            ])
        ]
    }))

    return container
}

main()

