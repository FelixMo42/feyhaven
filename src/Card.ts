import { Graphics } from 'pixi.js'
import Draggable, { DropTarget } from './Draggable'
import { Hand } from './Hand'

export const cardWidth = 200
export const cardHeight = 300

export class Card extends Draggable implements DropTarget {
    graphic = new Graphics()
    parent: Hand | null = null

    constructor() {
        super()

        this.draw()
        this.addChild(this.graphic)

        this.on("mouseover", this.startHover.bind(this))
        this.on("mouseleave", this.stopHover.bind(this))
    }

    draw() {
        this.graphic.filletRect(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            cardWidth,
            cardHeight,
            10
        )
        this.graphic.fill('teal')
        this.graphic.stroke("black")
    }

    startHover() {
        this.graphic.y = -10
    }

    stopHover() {
        this.graphic.y = 0
    }

    onDrop(card: Card) {
        return false
    }
}

export class EmptyCardSlot extends Card {
    draggable = false
    cursor = "default"

    draw() {
        this.graphic.filletRect(0, 0, cardWidth, cardHeight, 10)
        this.graphic.stroke({
            color: "white",
            alpha: 0
        })
        this.graphic.fill({
            color: "white",
            alpha: 0,
        })
    }

    onDrop(card: Card) {
        const a = card.parent!.cards.indexOf(this)
        const b = card.parent!.cards.indexOf(card)

        card.parent!.cards[a] = card
        card.parent!.cards[b] = this

        card.parent!.layout()

        return true
    }

    startHover() {}
    stopHover() {}
}
