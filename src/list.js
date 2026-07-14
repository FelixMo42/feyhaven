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

export default [
    {
        name: "The Apartment",
        text: "+1 ☺️ per 📦 and 👤",
        tags: ["place", "starter"],
        base: 2,
        gain: () => count("possession") + count("person"),
        arts: "The Apartment by Felix Moses"
    },
    {
        name: "Salvation Navy",
        text: "gain an 📦",
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
        arts: "New office by Phillie Casablanca"
    },
    {
        name: "The Skanky Marmot",
        text: "+3 😂 per Liny et al",
        tags: ["place"],
        base: 3,
        gain: () => 3 * count("liny"),
        arts: "Peasants before an Inn by Jan Steen"
    },
    {
        name: "The sidewalk",
        text: "gain a 🗺️ & draw a 🃏",
        tags: ["place"],
        base: 1,
        used: () => pick("place") + draw(1),
        arts: "Flagstone Sidewalk, Portsmouth, New Hampshire by Childe Hassam"
    },
    {
        name: "The Flip",
        text: "A Pinball Museum!",
        tags: ["place"],
        base: 10,
    },
    {
        name: "The Bank",
        text: "2x your cards!",
        tags: ["place"],
        base: 0,
        used: () => draw(hand.length),
        arts: "The banking and stock exchange building in the Lord, Vienna by Rudolf von Alt"
    },
    {
        name: "The Lotto",
        text: "'big payouts!'",
        tags: ["place"],
        base: 1,
        used: () => draw(1),
    },
    {
        name: "The Public Library",
        text: "+1 joy per used 🃏",
        tags: ["place"],
        base: 1,
        gain: () => used.length,
        arts: "Nautilus Library Nemo Aronnax by Edouard Riou"
    },
    {
        name: "The Döner Party",
        text: "draw 3 🃏s",
        tags: ["place"],
        base: 5,
        used: () => draw(3),
    },

    {
        name: "A Kindly Stranger",
        text: "find a 🗺️",
        tags: ["person", "starter"],
        base: 1,
        used: () => find("place"),
        arts: "Self-Portrait by Niko Pirosmani"
    },
    {
        name: "The Girl Next Door",
        text: "pick a random 🗺️",
        tags: ["person", "starter"],
        base: 5,
        used: () => pick("place"),
        arts: "Les enfants by Boris Grigoriev",
    },
    {
        name: "Cousin Liny",
        text: "meet one of his friend",
        tags: ["person", "starter"],
        base: 5,
        gain: () => 2 * count("liny"),
        used: () => pick("liny"),
        arts: "The Geographer by Johannes Vermeer",
    },
    {
        name: "Chad the Dad",
        text: "draw 2 cards",
        tags: ["person", "liny"],
        base: 5,
        used: () => draw(2),
        arts: "The Wife's Remonstrance by James Campbell",
    },
    

    {
        name: "Teddius Rex",
        text: "💖 💖 💖",
        tags: ["possession", "starter"],
        base: 9,
        arts: "Archaeologist by Dean Moses"
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