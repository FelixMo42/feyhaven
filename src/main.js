import cards from "./list.js"
import {
    on, log, init,
    pool, hand, deck, used, data, 
    gain, take, draw, end_turn, discard, shuffle, play,
    calculate_joy_gain,
} from "./core.js"
import { card_view, m, rand } from "./view.js"

function update() {
    console.log("Update")

    document.getElementById("joy_bar").style.height = `${data.joy/365*100}%`
    document.getElementById("joy_bar_gain").style.height = `${calculate_joy_gain()/365*100}%`

    document.getElementById("joy").innerText = data.joy
    document.getElementById("joy_gain").innerText = calculate_joy_gain()

    document.getElementById("turn").innerText = data.turn + 1
    document.getElementById("deck_count").innerText = deck.length
    document.getElementById("used_count").innerText = used.length
}

document.getElementById("end_turn").onclick = () => {
    end_turn()
    update()
}

const drag = {}
const double_click = {
    card: null,
    time: 0,
}
const DOUBLE_CLICK_MS = 300
const DRAG_THRESHOLD = 5

on("draw_card", card => {
    const view = card_view(card)

    document.getElementById(`card_${card.slot}`).replaceChildren(view)

    view.onmousedown = _event => {
        view.style.setProperty("--offset-x", 0)
        view.style.setProperty("--offset-y", 0)
        view.style.setProperty("--rotation", 0)

        drag.view = view
        drag.card = card
        drag.x = _event.clientX
        drag.y = _event.clientY
        drag.moved = false
        drag.ignore_click = false

        view.classList.add("dragging")
    }

    view.onclick = _event => {
        if (drag.ignore_click) {
            drag.ignore_click = false
            return
        }

        const now = Date.now()
        const is_double_click =
            double_click.card === card &&
            now - double_click.time <= DOUBLE_CLICK_MS

        if (is_double_click) {
            double_click.card = null
            double_click.time = 0
            play(card)
            update()
            return
        }

        double_click.card = card
        double_click.time = now
    }
})

function is_slot_empty(slot) {
    for (const card of hand) {
        if (card.slot == slot) return false
    }
    return true
}

document.addEventListener("mouseup", event => {
    if (!drag.view) return

    // move card
    const slot = get_slot_under_point(event.clientX, event.clientY)
    if (slot) {
        const slot_id = Number(slot.id.split("_")[1])
        if (is_slot_empty(slot_id)) {
            drag.card.slot = slot_id
            slot.replaceChildren(drag.view)
        }
    }

    // reset random offset
    drag.view.style.setProperty("--offset-x", rand(2, -5))
    drag.view.style.setProperty("--offset-y", rand(2, -5))
    drag.view.style.setProperty("--rotation", rand(1, -1))

    if (drag.moved) {
        drag.ignore_click = true
    }

    // we are no longer dragging this
    drag.view.classList.remove("dragging")
    drag.view = null
    drag.card = null
})

document.addEventListener("mousemove", event => {
    if (!drag.view) return

    drag.view.style.setProperty("--offset-x", event.clientX - drag.x)
    drag.view.style.setProperty("--offset-y", event.clientY - drag.y)

    if (!drag.moved) {
        const distance = Math.hypot(event.clientX - drag.x, event.clientY - drag.y)
        if (distance > DRAG_THRESHOLD) {
            drag.moved = true
        }
    }
})

on("pick", ({ options }) => {
    openPopup(
        m("div.row.g.center",
            ...options.map((card) => {
                const view = card_view(card)

                view.onclick = () => {
                    gain(card)
                    closePopup("hide")
                    update()
                }

                return m("div.card_slot", view)
            })
        )
    )
})

on("find", tag => {
    const options = shuffle(deck.filter(card =>
        card.tags.includes(tag)
    ))

    openPopup(
        m("div.row.g.center",
            ...options.map((card) => {
                const view = card_view(card)

                view.onclick = () => {
                    take(card)
                    closePopup("hide")
                    update()
                }

                return m("div.card_slot", view)
            })
        )
    )
})

on("log", text => {
    console.log(text)
    document.getElementById("log").prepend(m("div.log", text))
})

on("turn", () => {
    for (let i = 0; i < 8; i++) {
        document.getElementById(`card_${i}`).replaceChildren()
    }
})

function openPopup(view) {
    document.getElementById("popup").classList.remove("hide")
    document.getElementById("popup").replaceChildren(view)
}

function closePopup() {
    document.getElementById("popup").classList.add("hide")
}

{
    init(cards)

    // refresh screen
    update()
}

function get_slot_under_point(x, y) {
    return document.elementsFromPoint(x, y).find(el =>
        el.classList?.contains("card_slot")
    ) ?? null
}
