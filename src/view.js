export function card_view(card) {
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
    bg_el.style.setProperty("background-image", `url(res/${bg}.jpg)`)

    return view
}

function rand(max, min=0) {
    return Math.random() * (max - min) + min
}

/**
 * 
 * @param {string} tag 
 * @returns 
 */
export function m(tag, ...children) {
    const [tagName, ...classes] = tag.split(".")
    const e = document.createElement(tagName)
    e.classList.add(...classes)
    e.replaceChildren(...children)
    return e
}
