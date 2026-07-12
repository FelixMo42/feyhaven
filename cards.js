import {
    count,
    discard_all,
    draw,
} from "./core.js"

export default cards = [
    {
        name: "The Apartment",
        text: "+1 joy per 📦",
        tags: ["place", "starter"],
        
        base: 2,
        gain: () => count("possession")
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
        }
    },
    {
        name: "Mushroom Guide",
        text: "+1 joy per place",
        tags: ["possession"],
        base: 1,
        gain: () => count("place")
    }
]