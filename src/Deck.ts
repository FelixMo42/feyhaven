import csv from "./cards.csv" with { type: "text" }

interface ActiveEffect {
    desc: string
}

interface PassiveEffect {
    desc: string
}

export interface CardInfo {
    name: string,
    active?: ActiveEffect,
    passive?: PassiveEffect,
    default: boolean,
}

class Deck {
    cards = load_cards()
    deck = shuffle(this.cards.filter(card => card.default))

    pick(): CardInfo {
        return this.deck.pop()!
    }
}

function load_cards(): CardInfo[] {
    return csv
        .split('\n')
        .slice(1)
        .filter((line) => line.trim().length > 0)
        .map((line) => line.split(',').map((cell) => cell.trim()))
        .map(([value, name, effect, tags, inStartDeck]) => ({
            name,
            active: {
                desc: effect,
            },
            default: inStartDeck === '1',
        } as CardInfo))
}

function shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        // Swap elements
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

export const deck = new Deck()