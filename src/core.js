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
    $$$: 3000,
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
    shuffle()

    // draw starting hand
    draw()

    log("You've arrived in Feyhaven!")
}

export function discard(card) {
    document.getElementById(`card_${card.slot}`).replaceChildren()
    hand.splice(hand.indexOf(card), 1)
    used.push(card)
}

export function discard_all() {
    while (hand.length > 0) {
        discard(hand[0])
    }
}

export function pick(tag, num=3) {
    const options = shuffle(pool.filter(card =>
        card.tags.includes(tag) && 
        !card.has
    )).slice(0, num)

    if (options.length == 0) return false

    fire("pick", { tag, num, options })
}

export function shuffle(arr=deck) {
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
        fire("draw_card", card)
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
    fire("draw_card", card)
}

export function play(card) {
    if (!("used" in card)) return
    discard(card)
    card.used()
    if ("logs" in card) {
        log(card.logs[Math.floor(Math.random() * card.logs.length)])
    }
}

export function find(tag) {
    fire("find", tag)
}

export function gain(card) {
    deck.unshift(card)
    card.has = true
}

export function end_turn() {
    // add joy
    data.joy += calculate_joy_gain()

    // reset the deck
    deck.push(...used)
    deck.push(...hand)
    shuffle()
    used.length = 0
    hand.length = 0

    // redraw
    draw()

    // next turn!
    data.turn += 1
}