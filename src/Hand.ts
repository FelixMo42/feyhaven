import { Container } from "pixi.js"
import { Card } from "./Card"

export class Hand extends Container<Card> {
    cards: Card[] = []

    gap = 20
    paddingBottom = 20
    paddingSides = 20
    jiggle = 10

    constructor(cards: Card[]) {
        super()
        this.cards = cards
        this.addChild(...cards)
        this.layout()
    }

    layout() {
        let cx = this.paddingSides
        let cy = this.cards[0].height + this.paddingBottom
        let dx = this.cards[0].width + this.gap
        let dy = this.cards[0].height + this.gap

        for (const [i, card] of this.cards.entries()) {
            card.x = i % 4 * dx + cx
            card.y = window.innerHeight - Math.floor(i / 4) * dy - cy

            // if (card.draggable) {
            //     card.x += (Math.random() - 0.5) * this.jiggle
            //     card.y += (Math.random() - 0.5) * this.jiggle
            // }
        }
    }
}