import cards from "./cards.js"
import {
    on, log, init,
    hand, deck, used, data, 
    gain, take, draw, end_turn, discard, shuffle, use,
    calculate_joy_gain,
} from "./core.js"

function update() {
    document.getElementById("joy").innerText = data.joy
    document.getElementById("turn").innerText = data.turn
    document.getElementById("joy_gain").innerText = calculate_joy_gain()
    document.getElementById("deck_count").innerText = deck.length
    document.getElementById("used_count").innerText = used.length
}

document.getElementById("end_turn").onclick = () => {
    end_turn()
    update()
}

function card_view(card) {
    const bg_el = m(`div.card_image`)
    const view = m(`div.card`,
        m("div.row",
            m(`div.card_name.flex`, card.name),
            m(`div.card_joy`, card.base),
        ),
        bg_el,
        m(`div.card_text`, card.text)
    )

    // set random offset
    view.style.setProperty("--offset-x", rand(2, -5))
    view.style.setProperty("--offset-y", rand(2, -5))
    view.style.setProperty("--rotation", rand(1, -1))

    // set background image
    const bg = card.name.toLowerCase().replaceAll(" ", "_")
    bg_el.style.setProperty("background-image", `url(res/${bg}.png)`)

    return view
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
            activate_card(card)
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

on("pick", ({ tag, num }) => {
    const options = shuffle(cards.filter(card =>
        card.tags.includes(tag) && 
        !card.has
    )).slice(0, num)

    openPopup(
        m("div.row.g.center",
            ...options.map((card) => {
                const view = card_view(card)

                view.onclick = () => {
                    gain(card)
                    closePopup("hide")
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
                }

                return m("div.card_slot", view)
            })
        )
    )
})

on("log", text => {
    console.log(text)
    document.getElementById("log").appendChild(m("div.log", text))
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

function rand(max, min=0) {
    return Math.random() * (max - min) + min
}

function activate_card(card) {
    if (!("used" in card)) return

    discard(card)
    card.used()
    update()
}

function get_slot_under_point(x, y) {
    return document.elementsFromPoint(x, y).find(el =>
        el.classList?.contains("card_slot")
    ) ?? null
}

/**
 * 
 * @param {string} tag 
 * @returns 
 */
function m(tag, ...children) {
    const [tagName, ...classes] = tag.split(".")
    const e = document.createElement(tagName)
    e.classList.add(...classes)
    e.replaceChildren(...children)
    return e
}
