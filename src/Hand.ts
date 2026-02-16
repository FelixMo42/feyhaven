import { Container } from "pixi.js"
import { Card, EmptyCardSlot } from "./Card"
import { deck } from "./Deck"

export class Hand extends Container<Card> {
    cards: Card[] = []

    gap = 20
    paddingBottom = 20
    paddingSides = 20
    jiggle = 10

    constructor() {
        super()

        this.cards = [
            new EmptyCardSlot(),
            new EmptyCardSlot(),
            new EmptyCardSlot(),
            new EmptyCardSlot(),
            new EmptyCardSlot(),
            new EmptyCardSlot(),
            new EmptyCardSlot(),
            new EmptyCardSlot(),
        ]
        this.addChild(...this.cards)
        this.layout()
    }

    draw(number: number) {
        for (let i = 0; i < number; i++) {
            const card = new Card(deck.pick())
            const slot = this.findEmptySlot()
            this.cards[this.cards.indexOf(slot)] = card
            this.replaceChild(slot, card)
        }

        return this
    }

    findEmptySlot() {
        for (const card of this.cards) {
            if (card.info.name == "[[empty]]") {
                return card
            }
        }

        throw new Error("No more empty slots!")
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