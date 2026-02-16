import { Container } from "pixi.js"
import { Card, cardHeight, cardWidth, EmptyCardSlot } from "./Card"
import { _, game } from "../game/Game"

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

        _(undefined, this.update.bind(this))
        this.update()
    }

    update() {
        for (const c of this.cards) {
            if (!game.hand.find(card => card == c.info)) {
                const empty = new EmptyCardSlot()
                this.replaceChild(c, empty)
                c.destroy()
                this.cards[this.cards.indexOf(c)] = empty
            }
        }

        for (const c of game.hand) {
            if (!this.cards.find(card => card.info === c)) {
                const card = new Card(c)
                const slot = this.findEmptySlot()
                this.cards[this.cards.indexOf(slot)] = card
                this.replaceChild(slot, card)
            }
        }

        this.setup()
    }

    findEmptySlot() {
        for (const card of this.cards) {
            if (!card.info) return card
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
