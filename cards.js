import {
    count,
    pick,
    hand,
    used,
    discard_all,
    draw,
    find,
    log,
} from "./core.js"

export default cards = [
    {
        name: "The Apartment",
        text: "+1 joy per 📦 and 👤",
        tags: ["place", "starter"],

        base: 2,
        gain: () => count("possession") + count("person")
    },
    {
        name: "Salvation Navy",
        text: "pick a random 📦",
        tags: ["place", "starter"],
        base: 1,
        used: () => pick("possession")
    },
    {
        name: "The Office",
        text: "draw 3 cards",
        tags: ["place", "starter"],
        base: -4,
        used: () => draw(3),
    },
    {
        name: "The Skanky Marmot",
        text: "Liny et al, hangout out spot",
        tags: ["place"],
        base: 3,
        gain: () => 3 * count("liny"),
    },
    {
        name: "The sidewalk",
        text: "pick a random 🗺️ & draw a card",
        tags: ["place"],
        base: 1,
        used: () => pick("place") + draw(1)
    },
    {
        name: "The Arcade",
        text: "fun!",
        tags: ["place"],
        base: 10,
    },
    {
        name: "The Bank",
        text: "2x your cards!",
        tags: ["place"],
        base: 0,
        used: () => draw(hand.length),
    },
    {
        name: "The Lotto",
        text: "Change of drawing max cards",
        tags: ["place"],
        base: 1,
        used: () => draw(1),
    },
    {
        name: "The Public Library",
        text: "+1 joy per used card",
        tags: ["place"],
        base: 1,
        gain: () => used.length,
    },
    {
        name: "The Döner Party",
        text: "draw 3 cards",
        tags: ["place"],
        base: 5,
        used: () => draw(3),
    },

    {
        name: "A Kindly Stranger",
        text: "find a 🗺️",
        tags: ["person", "starter"],
        base: 1,
        used: () => find("place")
    },
    {
        name: "The Girl Next Door",
        text: "pick a random 🗺️",
        tags: ["person", "starter"],
        base: 5,
        used: () => pick("place")
    },
    {
        name: "Cousin Liny",
        text: "meet one of his friend",
        tags: ["person", "starter"],
        base: 5,
        gain: () => 2 * count("liny"),
        used: () => pick("liny")
    },
    {
        name: "Chad the Dad",
        text: "draw 2 cards",
        tags: ["person", "liny"],
        base: 5,
        used: () => draw(2),
    },
    

    {
        name: "Teddy Bear",
        text: "💖 💖 💖",
        tags: ["possession", "starter"],
        base: 9
    },
    {
        name: "2016 Honda Civic",
        text: "draw new hand",
        tags: ["possession", "starter"],
        base: 4,
        used: () => {
            discard_all()
            draw()
            log(`vroom vroom!`)
        }
    },
    {
        name: "iPhone 16 mini",
        tags: ["possession", "starter"],
        text: "find a 👤",
        base: -3,
        used: () => find("person")
    },
    {
        name: "Mushroom Guide",
        text: "+1 joy per 🗺️",
        tags: ["possession"],
        base: 1,
        gain: () => count("place")
    },
    {
        name: "AirTag",
        text: "find a 📦",
        tags: ["possession"],
        base: 1,
        used: () => find("possession")
    },
    {
        name: "A Credit Card",
        text: "draw 3 cards",
        tags: ["possession"],
        base: 1,
        used: () => draw(3),
    }
]