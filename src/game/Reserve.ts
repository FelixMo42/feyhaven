import csv from "../../cards.csv" with { type: "text" }

interface ActiveEffect {
    desc: string
}

interface PassiveEffect {
    desc: string,
    func: () => number
}

export interface Card {
    name: string,
    active?: ActiveEffect,
    passive?: PassiveEffect,
    default: boolean,
}

function load_cards(): Card[] {
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
            passive: {
                desc: `+ ${value} joy`,
                func: () => Number(value),
            },
            default: inStartDeck === '1',
        } as Card))
}

export const allCards = load_cards()

export function shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}
