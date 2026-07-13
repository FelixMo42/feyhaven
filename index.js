import cards from "./cards.js"
import { log, hand, deck, used, gain, take, data, end_turn, calculate_joy_gain, discard, on, draw, shuffle } from "./core.js"

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

on("draw_card", card => {
    const view = card_view(card)

    document.getElementById(`card_${card.slot}`).replaceChildren(view)

    view.onclick = () => {
        if ("used" in card) {
            discard(card)
            card.used()
            update()
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
    // set initial cards
    for (const card of cards) {
        if (card.tags.includes("starter")) gain(card)
    }
    shuffle()

    // draw starting hand
    draw()

    log("You've arrived in Feyhaven!")

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
