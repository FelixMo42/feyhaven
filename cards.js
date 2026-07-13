import {
    count,
    pick,
    discard_all,
    draw,
    find,
    log,
} from "./core.js"

export default cards = [
    {
        name: "The Apartment",
        text: "+1 joy per 📦|person",
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
        text: "make some $$$",
        tags: ["place", "starter"],
        base: -4,
        used: () => { /* MONEY? */ }
    },



    {
        name: "A Kindly Stranger",
        text: "pick a random place",
        tags: ["person", "starter"],
        base: 1,
        used: () => pick("place")
    },
    {
        name: "The Girl Next Door",
        text: "find a 📦",
        tags: ["person", "starter"],
        base: 5,
        used: () => find("possession")
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
        name: "Teddy Bear",
        text: "<3 <3 <3",
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
        text: "find a person",
        base: -3,
        used: () => find("person")
    },



    {
        name: "Mushroom Guide",
        text: "+1 joy per place",
        tags: ["possession"],
        base: 1,
        gain: () => count("place")
    },
]