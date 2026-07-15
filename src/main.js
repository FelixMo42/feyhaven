import cards from "./list.js"
import {
    on as recv, log, init,
    pool, hand, deck, used, data, 
    gain, take, draw, turn, drop, shuf, play,
    calculate_joy_gain, is_slot_empty,
} from "./core.js"
import { card_view, m, rand } from "./view.js"

/* UI HOOKS */

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

document.getElementById("end_turn").onclick = () => turn() + update()
document.getElementById("action_show_deck").onclick = () => show(deck)
document.getElementById("action_show_used").onclick = () => show(used)

/* GAME HOOKS */

recv("draw", card => {
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

recv("pick", ({ options }) => {
    show(options, gain)
})

recv("find", ({ options }) => {
    show(options, take)
})

recv("turn", () => {
    for (let i = 0; i < 8; i++) {
        document.getElementById(`card_${i}`).replaceChildren()
    }
})

recv("log", text => {
    document.getElementById("log").prepend(m("div.log", text))
})

function show(list, func) {
    openPopup(m("div.row.g.vp.center.wrap",
        ...list.map((card) => {
            const view = card_view(card)

            if (func) view.onclick = () => {
                hidePopup("hide")
                func(card)
                update()
            }

            return m("div.card_slot", view)
        })
    )).onclick = () => {
        if (!func) hidePopup()
    }
}

/* DRAG AND DROP HANDLING */

const DOUBLE_CLICK_MS = 300
const DRAG_THRESHOLD = 5

const drag = {}
const double_click = {
    card: null,
    time: 0,
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

    function get_slot_under_point(x, y) {
        return document.elementsFromPoint(x, y).find(el =>
            el.classList?.contains("card_slot")
        ) ?? null
    }
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

/* POP UP HANDING */

function openPopup(view) {
    const popup = document.getElementById("popup")
    popup.classList.remove("hide")
    popup.replaceChildren(view)
    return popup
}

function hidePopup() {
    document.getElementById("popup").classList.add("hide")
}

/* START THE GAME */

{
    // TODO: this should be a deep copy if we want to be able to replay
    init(cards)

    // refresh screen
    update()
}
