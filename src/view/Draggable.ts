import { Container, EventBoundary, EventMode, FederatedPointerEvent } from 'pixi.js'
import { app } from '../main'

const dragState = {
    target: undefined as (Container | undefined),
    offset: { x: 0, y: 0 },
    start: { x: 0, y: 0 }
}

window.addEventListener("mousemove", (event: MouseEvent) => {
    if (dragState.target) {
        dragState.target.x = event.x - dragState.offset.x
        dragState.target.y = event.y - dragState.offset.y
    }
})

window.addEventListener("mouseup", (event: MouseEvent) => {
    if (!dragState.target) return

    const boundary = new EventBoundary(app.stage)
    const dropZone = boundary.hitTest(event.x, event.y)

    if (!isDropTarget(dropZone) || !dropZone.onDrop(dragState.target)) {
        dragState.target.x = dragState.start.x
        dragState.target.y = dragState.start.y
    }

    dragState.target.eventMode = "static"
    dragState.target = undefined
})

function startDrag(event: FederatedPointerEvent, target: Draggable) {
    if (!target.draggable) return

    dragState.target = target

    dragState.offset.x = event.global.x - target.x
    dragState.offset.y = event.global.y - target.y

    dragState.start.x = target.x
    dragState.start.y = target.y

    target.parent!.setChildIndex(target, target.parent!.children.length - 1)

    target.eventMode = "none"
}

export default class Draggable extends Container {
    draggable = true
    dragging = false
    cursor = "pointer"
    eventMode = "static" as EventMode

    constructor() {
        super()

        this.on("mousedown", (e: FederatedPointerEvent) => startDrag(e, this))
    }
}

export interface DropTarget extends Container {
    onDrop(item: Container): boolean;
}

function isDropTarget(c: Container): c is DropTarget {
    if (!c) return false 
    return "onDrop" in c
}