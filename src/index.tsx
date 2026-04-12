import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import './style.css';
import profileImage from './assets/profile.png';

type CardType = "place" | "person" | "possession";

interface HandCard {
	name: string;
	tags: CardType[];
	desc: string;
	joy: () => number;
	value: () => number;
	organicTransform: string;
}

const initialHand: (HandCard | undefined)[] = [
	{
		name: 'Ivan, the kindly stranger',
		tags: ["person"],
		desc: "pick place",
		joy: () => 1,
		value: () => 0,
		organicTransform: 'translate(0px, 0px) rotate(0deg)'
	},
	{
		name: "Beth, the girl next door",
		tags: ["possession"],
		desc: "draw 2 cards",
		joy: () => 2,
		value: () => 10,
		organicTransform: 'translate(0px, 0px) rotate(0deg)'
	},
	undefined,
	undefined,
	undefined,
	undefined,
	undefined,
	undefined,
];

type DragState = {
	index: number;
	clientX: number;
	clientY: number;
	offsetX: number;
	offsetY: number;
};

function createOrganicTransform() {
	const translateX = Math.round((Math.random() - 0.5) * 10);
	const translateY = Math.round((Math.random() - 0.5) * 8);
	const rotation = (Math.random() - 0.5) * 4;

	return `translate(${translateX}px, ${translateY}px) rotate(${rotation.toFixed(2)}deg)`;
}

function CardFace({
	card,
	isDragging = false,
	onPointerDown,
}: {
	card: HandCard;
	isDragging?: boolean;
	onPointerDown?: (event: PointerEvent) => void;
}) {
	return (
		<div
			class={`card-face touch-none select-none rounded-[0.9rem] border-2 border-black p-2 shadow-sm ${
				isDragging
					? 'cursor-grabbing bg-white shadow-2xl'
					: 'cursor-grab bg-[rgba(255,255,255,0.92)]'
			}`}
			style={!isDragging ? { transform: card.organicTransform } : undefined}
			onPointerDown={(event) => onPointerDown?.(event as PointerEvent)}
		>
			<div class="flex h-full flex-col justify-between">
				<div class="flex items-start justify-between gap-2">
					<div class="text-[0.68rem] uppercase tracking-[0.25em] text-slate-500">Joy</div>
					<div class="text-[0.72rem] font-semibold tabular-nums text-slate-900">{card.joy()}</div>
				</div>
				<div class="flex-1 py-2 text-sm font-medium leading-tight text-slate-900">
					{card.name}
					<div class="mt-2 text-[0.68rem] font-normal leading-snug text-slate-600">
						{card.desc}
					</div>
				</div>
				<div class="flex items-end justify-between gap-2">
					<div class="text-[0.68rem] uppercase tracking-[0.25em] text-slate-500">Value</div>
					<div class="text-[0.72rem] font-semibold tabular-nums text-slate-900">${card.value()}</div>
				</div>
			</div>
		</div>
	);
}

function Slot({
	card,
	index,
	onPointerDown,
	isDragging = false,
}: {
	card?: HandCard;
	index: number;
	onPointerDown: (index: number, event: PointerEvent) => void;
	isDragging?: boolean;
}) {
	return (
		<div
			data-slot-index={index}
			class="card-slot relative"
		>
			<div class="card-slot-shell pointer-events-none absolute inset-0 rounded-[0.9rem] border-2 border-dashed border-slate-500/70" />
			{card ? (
				<div class="card-slot-card absolute inset-[2px]">
					<CardFace
						card={card}
						isDragging={isDragging}
						onPointerDown={(event) => onPointerDown(index, event)}
					/>
				</div>
			) : null}
		</div>
	);
}

export function App() {
	const [hand, setHand] = useState<(HandCard | undefined)[]>(initialHand);
	const [dragging, setDragging] = useState<DragState | null>(null);

	useEffect(() => {
		if (!dragging) {
			return;
		}

		function handlePointerMove(event: PointerEvent) {
			setDragging((current) => {
				if (!current) {
					return current;
				}

				return {
					...current,
					clientX: event.clientX,
					clientY: event.clientY,
				};
			});
		}

		function handlePointerUp(event: PointerEvent) {
			setHand((currentHand) => {
				const nextHand = [...currentHand];
				const originIndex = dragging.index;
				const targetElement = document
					.elementFromPoint(event.clientX, event.clientY)
					?.closest<HTMLElement>('[data-slot-index]');
				const targetIndex = targetElement
					? Number(targetElement.dataset.slotIndex)
					: Number.NaN;

				if (
					Number.isNaN(targetIndex) ||
					targetIndex === originIndex ||
					nextHand[targetIndex] !== undefined
				) {
					return nextHand;
				}

				const movedCard = nextHand[originIndex];
				nextHand[targetIndex] = movedCard
					? {
						...movedCard,
						organicTransform: createOrganicTransform(),
					}
					: movedCard;
				nextHand[originIndex] = undefined;
				return nextHand;
			});

			setDragging(null);
		}

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp, { once: true });

		return () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
		};
	}, [dragging]);

	function beginDrag(index: number, event: PointerEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		setDragging({
			index,
			clientX: event.clientX,
			clientY: event.clientY,
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top,
		});
	}

	return (
		<div class="flex h-screen w-screen overflow-hidden gap-4 p-4">
			<div class="flex flex-1 flex-col gap-4">
				<Header />
				<div id="hand" class="grid flex-1 min-h-0 w-full grid-cols-4 grid-rows-2 gap-2">
					{hand.map((card, index) => (
						<Slot
							key={index}
							index={index}
							card={card && dragging?.index !== index ? card : undefined}
							onPointerDown={(slotIndex, event) => beginDrag(slotIndex, event)}
							isDragging={dragging?.index === index}
						/>
					))}
				</div>
			</div>
			<div class="w-[400px] bg-red-100" id="board">
			</div>
			<div class="w-15 shrink-0 bg-gray-400" id="progress">
			</div>
			{dragging && hand[dragging.index] ? (
				<div
					class="card-drag-layer pointer-events-none fixed left-0 top-0 z-50 select-none"
					style={{
						transform: `translate3d(${dragging.clientX - dragging.offsetX}px, ${dragging.clientY - dragging.offsetY}px, 0)`,
					}}
				>
					<CardFace
						card={hand[dragging.index] as HandCard}
						isDragging
					/>
				</div>
			) : null}
		</div>
	);
}

function Header() {
	return (
		<div id="header" class="flex flex-row gap-5">
			<img
				src={profileImage}
				alt="profile"
				class="h-[140px]"
			/>
			<div class="flex flex-1 flex-col gap-2">
				<div class="bg-blue-200 flex-1 p-5">
					hi
				</div>
				<div>
					hi
				</div>
			</div>
		</div>
	)
}

render(<App />, document.getElementById('app'));
