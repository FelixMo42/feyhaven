import csv from "../../cards.csv" with { type: "text" }

interface ActiveEffect {
    desc: string
}

interface PassiveEffect {
    desc: string,
    func: () => number
}

export class Card {
    name: string
    active?: ActiveEffect
    passive?: PassiveEffect
    default: boolean

    constructor(name: string, active?: ActiveEffect, passive?: PassiveEffect, def: boolean = false) {
        this.name = name
        this.active = active
        this.passive = passive
        this.default = def
    }

    joyGain() {
        return this.passive?.func() ?? 0
    }
}

function load_cards(): Card[] {
    return (csv as string)
        .split('\n')
        .slice(1)
        .filter((line) => line.trim().length > 0)
        .map((line) => line.split(',').map((cell) => cell.trim()))
        .map(([value, name, effect, tags, inStartDeck]) => new Card(
            name,
            {
                desc: effect,
            },
            {
                desc: `+ ${value} joy`,
                func: () => Number(value),
            },
            inStartDeck === '1',
        ))
}

export const allCards = load_cards()

export function shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

