import { allCards, Card, shuffle } from "./Reserve"

class Game {
    deck = shuffle(allCards.filter(card => card.default))
    hand = [] as Card[]
    used = [] as Card[]

    turn = 0
    life = 0
    $$$$ = 1500

    bill = [
        {
            name: "Rent",
            amount: 700,
        },
        {
            name: "Groceries",
            amount: 150,
        },
        {
            name: "Dentist appointment",
            amount: 210,
        },
    ]

    constructor() {
        this.draw(7)
    }

    get expenses() {
        return this.bill.reduce((acc, bill) => acc + bill.amount, 0)
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

    getJoyGain() {
        let happiness = 0
        for (const card of this.hand) {
            happiness += card.joyGain()
        }
        return happiness
    }

    nextTurn() {
        this.life += this.getJoyGain()
        this.$$$$ -= this.expenses
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
