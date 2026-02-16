import { Container } from "pixi.js"
import { Card, cardHeight, cardWidth, EmptyCardSlot } from "./Card"
import { deck } from "./Deck"

export class Hand extends Container {
    cards: Card[] = []

    gap = 20
    jiggle = 10

    constructor() {
        super()

        this.layout = {
            width: 2 + this.gap * 3 + cardWidth * 4,
            height: this.gap + cardHeight * 2,
        }

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
        this.setup()
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

    getHappiness() {
        let happiness = 0
    
        for (const card of this.cards) {
            happiness += card.getHappiness()
        }

        return happiness
    }

    setup() {
        let dx = cardWidth + this.gap
        let dy = cardHeight + this.gap

        for (const [i, card] of this.cards.entries()) {
            card.x = i % 4 * dx
            card.y = Math.floor(i / 4) * dy
        }
    }
}
