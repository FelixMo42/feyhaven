import { init } from './app'
import { Card, EmptyCardSlot } from './Card'
import { Hand } from './Hand'

async function main() {
    await init([
        new Hand().draw(7)
    ])
}

main()