import { allCards, Card, shuffle } from "./Reserve"

class Game {
    deck = shuffle(allCards.filter(card => card.default))
    hand = [] as Card[]
    used = [] as Card[]

    turn = 0
    life = 0
    $$$$ = 1500

    constructor() {
        this.draw(7)
    }

    get cardCount() {
        return (
            this.deck.length +
            this.hand.length +
            this.used.length
        )
    }

    draw(number: number) {
        for (let i = 0; i < number; i++) {
            const card = this.deck.pop()
            if (card) this.hand.push(card)
        }
    }

    nextTurn() {
        this.turn++
        this.deck = shuffle([
            ...this.deck,
            ...this.hand,
            ...this.used,
        ])
        this.hand = []
        this.used = []
        this.draw(7)
        cbs.forEach(cb => cb())
    }
}

export const game = new Game()

const cbs = [] as (() => void)[]
export function _<T>(view: T, update: (view: T) => void): T {
    cbs.push(() => update(view))
    return view
}
