import cards from "./cards.js"
import { hand, deck, used, data, end_turn, calculate_joy_gain, discard, on, draw, shuffle } from "./core.js"

function update() {
    document.getElementById("joy").innerText = data.joy
    document.getElementById("joy_gain").innerText = calculate_joy_gain()
    document.getElementById("deck_count").innerText = deck.length
    document.getElementById("used_count").innerText = used.length
}

document.getElementById("end_turn").onclick = () => {
    end_turn()
    update()
}

on("draw_card", card => {
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

    document.getElementById(`card_${card.slot}`).replaceChildren(view)

    view.onclick = () => {
        if ("used" in card) {
            discard(card)
            card.used()
            update()
        }
    }
})



{
    // set initial cards
    for (const card of cards) {
        if (card.tags.includes("starter")) deck.push(card)
    }
    shuffle()

    // draw starting hand
    draw()

    // refresh screen
    update()
}

function rand(max, min=0) {
    return Math.random() * (max - min) + min
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
