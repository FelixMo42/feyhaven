import { m } from "./view.js"

// callbacks
const cbs = new Map()
export function on(event, cb) {
    if (!cbs.has(event)) cbs.set(event, [])
    cbs.get(event).push(cb)
}
function fire(event, data) {
    cbs.get(event).forEach(cb => cb(data))
}

// data
export const pool = []
export const deck = []
export const hand = []
export const used = []
export const data = {
    joy: 0,
    turn: 0,
}

export function log(text) {
    fire("log", text)
}

export function count(tag) {
    return hand.filter(card => card.tags.includes(tag)).length
}

export function calculate_joy_gain() {
    let joy_gain = 0

    for (const card of hand) {
        joy_gain += card.base

        if ("gain" in card) {
            joy_gain += card.gain()
        }
    }

    return joy_gain
}

export function init(cards) {
    // add all cards to the pool
    pool.push(...cards)

    // add initial cards to the deck
    for (const card of cards) {
        if (card.tags.includes("starter")) gain(card)
    }
    shuf()

    // draw starting hand
    draw()

    log("You've arrived in Feyhaven!")
}

export function drop(card) {
    document.getElementById(`card_${card.slot}`).replaceChildren()
    hand.splice(hand.indexOf(card), 1)
    used.push(card)
}

export function discard_all() {
    while (hand.length > 0) {
        drop(hand[0])
    }
}

export function pick(tag, num=3) {
    const options = shuf(pool.filter(card =>
        card.tags.includes(tag) && 
        !card.has
    )).slice(0, num)

    if (options.length == 0) {
        const fail
            = data?.card?.fail
            || `You have all the ${tag} already. You can't play this card.`

        const el = m("b", fail)
        el.style.setProperty("color", "red")
        log(el)

        return false
    }

    fire("pick", { tag, num, options })
}

export function find(tag) {
    const options = shuf(deck.filter(card =>
        card.tags.includes(tag)
    ))

    if (options.length == 0) {
        const fail
            = data?.card?.fail
            || `There are no more ${tag} in your deck! `
            + `You can't play this card.`

        const el = m("b", fail)
        el.style.setProperty("color", "red")
        log(el)

        return false
    }

    fire("find", { tag, options })
}

export function shuf(arr=deck) {
    for (let index = arr.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[arr[index], arr[swapIndex]] = [arr[swapIndex], arr[index]];
	}
    return arr
}

export function move(card, slot) {
    card.slot = slot
}

export function draw(num=6) {
    for (let i = 0; i < num; i++) {
        if (deck.length == 0) return
        if (hand.length == 8) return

        const card = deck.pop()
        card.slot = get_empty_slot()
        hand.push(card)
        fire("draw", card)
    }
}

function get_empty_slot() {
    const offset = 0 // Math.floor(Math.random() * 8)

    for (let i = 0; i < 8; i++) {
        let slot = (i + offset) % 8
        if (!has_card_in_slot(slot)) return slot
    }

    function has_card_in_slot(slot) {
        for (const card of hand) {
            if (card.slot == slot) return true
        }
        return false
    }
}

export function take(card) {
    deck.splice(deck.indexOf(card), 1)
    card.slot = get_empty_slot()
    hand.push(card)
    fire("draw", card)
}

export function play(card) {
    // is this card playable?
    if (!("used" in card || "post" in card)) return

    // store the current card being played
    data.card = card
    
    // check if their is a play effect, and if it succeeds
    if ("used" in card && card.used() === false) return

    // remove the card from the hand
    drop(card)

    // post discard effects. We need this for card draw
    if ("post" in card) card.post()

    // add the event to the action log
    if ("logs" in card) log(card.logs[Math.floor(Math.random() * card.logs.length)])
}

export function gain(card) {
    deck.unshift(card)
    card.has = true
}

export function turn() {
    // add joy
    data.joy += calculate_joy_gain()

    // reset the deck
    deck.push(...used)
    deck.push(...hand)
    shuf()
    used.length = 0
    hand.length = 0
    fire("turn")

    // redraw
    draw()

    // next turn!
    data.turn += 1
}

export function is_slot_empty(slot) {
    for (const card of hand) {
        if (card.slot == slot) return false
    }
    return true
}