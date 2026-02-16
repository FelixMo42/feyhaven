import { allCards } from "./Reserve"

interface ActiveEffect {
    desc: string
}

interface PassiveEffect {
    desc: string,
    func: () => number
}

export interface CardInfo {
    name: string,
    active?: ActiveEffect,
    passive?: PassiveEffect,
    default: boolean,
}

class Deck {
    cards = allCards
    deck = []

    pick(): CardInfo {
        return this.deck.pop()!
    }
}

export const deck = new Deck()