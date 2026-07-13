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
export const hand = []
export const deck = []
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
    fire("pick", { tag, num })
}

export function shuffle(arr=deck) {
    for (let index = arr.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[arr[index], arr[swapIndex]] = [arr[swapIndex], arr[index]];
	}
    return arr
}

export function draw(num=6) {
    for (let i = 0; i < num; i++) {
        if (deck.length == 0) return

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