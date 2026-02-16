import { Container } from 'pixi.js';
import { LayoutContainer, Text } from "@pixi/layout/components";
import { game, _ } from "../game/Game"
import { shuffle } from '../game/Reserve';

const t = () => shuffle([
    "I've bills to pay",
    "I got 99 problems",
    "Livin’ On A Prayer",
    "Un manoir à Neuchâtel",
    "Get your work up!",
    "The house of the rising sun",
])[0]

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
            text: `############################\n${t()}\n############################`,
            layout: {
                alignSelf: "center",
            },
            style: {
                align: "center",
            }
        }),
        ...game.bill.map((bill) =>
            new LayoutContainer({
                layout: {
                    flex: 1,
                    flexDirection: "column",
                },
                children: [
                    T(() => bill.name, () => `-${bill.amount}$`),
                ]
            }),
        ),
        new Text({ text: `###########################`, layout: true }),
        T(() => "Savings", () => `${game.$$$$}$`),
        T(() => "Expenses", () => `-${game.expenses}$`),
        T(() => "Total", () => `${game.$$$$ - game.expenses}$`),
    )

    return container
}

function T(cb1: () => string, cb2: () => string) {
    return new Container({
        layout: {
            flexDirection: "row",
            justifyContent: "space-between"
        },
        children: [
            _(new Text({
                text: cb1(),
                layout: true,
            }), (view: Text) => {
                view.text = cb1()
            }),
            _(new Text({
                text: cb2(),
                layout: true,
            }), (view: Text) => {
                view.text = cb2()
            }),
        ]
    })
}