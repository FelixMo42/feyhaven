import { Graphics, Text } from 'pixi.js'
import Draggable, { DropTarget } from './Draggable'
import { Hand } from './Hand'
import { CardInfo } from './Deck'

export const cardWidth = 200
export const cardHeight = 300

export class Card extends Draggable implements DropTarget {
    graphic = new Graphics()
    parent: Hand | null = null
    info: CardInfo

    constructor(info: CardInfo) {
        super()

        this.info = info

        this.draw()
        this.addChild(this.graphic)

        this.on("mouseover", this.startHover.bind(this))
        this.on("mouseleave", this.stopHover.bind(this))
    }

    draw() {
        this.graphic.filletRect(
            0,
            0,
            cardWidth,
            cardHeight,
            10
        )
        this.graphic.fill('teal')
        this.graphic.stroke("black")

        this.graphic.addChild(new Text({
            text: this.info.name,
            x: 10,
            y: 10,
            style: {
                fontSize: 20,
            }
        }))

        if (this.info.active) {
            this.graphic.addChild(new Text({
                text: "Ability: " + this.info.active.desc,
                x: 10,
                y: cardHeight - 50,
                style: {
                    fontSize: 20,
                }
            }))
        }
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

    constructor() {
        super({
            name: "[[empty]]",
        })
    }

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
