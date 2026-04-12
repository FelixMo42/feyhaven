import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import './style.css';
import profileImage from './assets/profile.png';
import cardsCsv from './cards.csv?raw';

interface HandCard {
	name: string;
	tags: string[];
	desc: string;
	joy: () => number;
	value: () => number;
	organicTransform: string;
}

interface GameState {
	hand: (HandCard | undefined)[];
	deck: HandCard[];
	used: HandCard[];
	joy: number;
	turn: number;
	money: number;
}

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

function shuffleCards(cards: HandCard[]) {
	const nextCards = [...cards];

	for (let index = nextCards.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[nextCards[index], nextCards[swapIndex]] = [nextCards[swapIndex], nextCards[index]];
	}

	return nextCards;
}

interface CardRow {
	joy: number;
	name: string;
	effect: string;
	tags: string[];
	inStartDeck: boolean;
}

function parseCsvRows(csvText: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = '';
	let inQuotes = false;

	for (let index = 0; index < csvText.length; index += 1) {
		const char = csvText[index];
		const nextChar = csvText[index + 1];

		if (char === '"' && inQuotes && nextChar === '"') {
			cell += '"';
			index += 1;
			continue;
		}

		if (char === '"') {
			inQuotes = !inQuotes;
			continue;
		}

		if (char === ',' && !inQuotes) {
			row.push(cell.trim());
			cell = '';
			continue;
		}

		if ((char === '\n' || char === '\r') && !inQuotes) {
			if (char === '\r' && nextChar === '\n') {
				index += 1;
			}

			row.push(cell.trim());
			cell = '';

			if (row.some((field) => field.length > 0)) {
				rows.push(row);
			}

			row = [];
			continue;
		}

		cell += char;
	}

	if (cell.length > 0 || row.length > 0) {
		row.push(cell.trim());
		if (row.some((field) => field.length > 0)) {
			rows.push(row);
		}
	}

	return rows;
}

function parseCardsFromCsv(csvText: string): CardRow[] {
	const rows = parseCsvRows(csvText);
	const [headerRow, ...dataRows] = rows;

	if (!headerRow) {
		return [];
	}

	const headerIndex = new Map(headerRow.map((column, index) => [column.trim().toLowerCase(), index] as const));

	return dataRows
		.map((row) => {
			const joyCell = row[headerIndex.get('joy') ?? -1] ?? '0';
			const nameCell = row[headerIndex.get('name') ?? -1] ?? '';
			const effectCell = row[headerIndex.get('effect') ?? -1] ?? '';
			const tagsCell = row[headerIndex.get('tags') ?? -1] ?? '';
			const inCell = row[headerIndex.get('in') ?? -1] ?? '';

			return {
				joy: Number.parseInt(joyCell, 10) || 0,
				name: nameCell.trim(),
				effect: effectCell.trim(),
				tags: tagsCell
					.split(/\s+/)
					.map((tag) => tag.trim())
					.filter(Boolean),
				inStartDeck: inCell.trim() === '1',
			};
		})
		.filter((card) => card.name.length > 0);
}

function createValueForEffect(effect: string) {
	const moneyMatch = effect.match(/\b(?:money|gain)\s+(\d+)\b/i);
	return moneyMatch ? Number.parseInt(moneyMatch[1], 10) : 0;
}

function makeCard(card: CardRow): HandCard {
	return {
		name: card.name,
		tags: card.tags,
		desc: card.effect === '____' ? '' : card.effect,
		joy: () => card.joy,
		value: () => createValueForEffect(card.effect),
		organicTransform: 'translate(0px, 0px) rotate(0deg)',
	};
}

const cardRows = parseCardsFromCsv(cardsCsv);
const allCards = cardRows.map(makeCard);
const startingDeck = cardRows
	.filter((card) => card.inStartDeck)
	.map(makeCard);
const startingHandSize = 4;
const drawHandSize = 4;
const handSlotCount = 8;

const initialGameState: GameState = {
	hand: [
		...startingDeck.slice(0, startingHandSize),
		...Array.from(
			{ length: Math.max(0, handSlotCount - startingHandSize) },
			() => undefined,
		),
	],
	deck: startingDeck.slice(startingHandSize),
	used: [],
	joy: 0,
	turn: 1,
	money: 0,
};

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
			data-card-face="true"
			class={`card-face pointer-events-auto touch-none select-none rounded-[0.9rem] border-2 border-black p-2 shadow-sm ${
				isDragging
					? 'cursor-grabbing bg-white shadow-2xl'
					: 'cursor-grab bg-[rgba(255,255,255,0.92)]'
			}`}
			style={!isDragging ? { transform: card.organicTransform } : undefined}
			onPointerDown={(event) => {
				event.preventDefault();
				event.stopPropagation();
				(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
				onPointerDown?.(event as PointerEvent);
			}}
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
	isDragging = false,
	onPointerDown,
}: {
	card?: HandCard;
	index: number;
	isDragging?: boolean;
	onPointerDown: (index: number, event: PointerEvent) => void;
}) {
	return (
		<div
			data-slot-index={index}
			class="card-slot relative"
		>
			<div class="card-slot-shell pointer-events-none absolute inset-0 rounded-[0.9rem] border-2 border-dashed border-slate-500/70" />
			{card ? (
				<div class="card-slot-card pointer-events-none absolute inset-[2px]">
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
	const [gameState, setGameState] = useState<GameState>(initialGameState);
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
			setGameState((currentState) => {
				const nextHand = [...currentState.hand];
				const originIndex = dragging.index;
				const movedCard = nextHand[originIndex];
				const pointX = event.clientX;
				const pointY = event.clientY;
				const boardElement = document
					.querySelector<HTMLElement>('[data-drop-zone="board"]');
				const targetSlot = Array.from(
					document.querySelectorAll<HTMLElement>('[data-slot-index]'),
				).find((slot) => {
					const rect = slot.getBoundingClientRect();
					return pointX >= rect.left && pointX <= rect.right && pointY >= rect.top && pointY <= rect.bottom;
				});
				const targetIndex = targetSlot
					? Number(targetSlot.dataset.slotIndex)
					: Number.NaN;

				if (!movedCard) {
					return currentState;
				}

				if (boardElement) {
					const boardRect = boardElement.getBoundingClientRect();
					const droppedOnBoard =
						pointX >= boardRect.left &&
						pointX <= boardRect.right &&
						pointY >= boardRect.top &&
						pointY <= boardRect.bottom;

					if (!droppedOnBoard) {
						// fall through to the hand-slot logic
					} else {
						nextHand[originIndex] = undefined;
						return {
							...currentState,
							hand: nextHand,
							used: [...currentState.used, movedCard],
							money: currentState.money + movedCard.value(),
						};
					}
				}

				if (
					Number.isNaN(targetIndex) ||
					targetIndex === originIndex ||
					nextHand[targetIndex] !== undefined
				) {
					return currentState;
				}

				nextHand[targetIndex] = movedCard
					? {
						...movedCard,
						organicTransform: createOrganicTransform(),
					}
					: movedCard;
				nextHand[originIndex] = undefined;
				return {
					...currentState,
					hand: nextHand,
				};
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
				<Header gameState={gameState} />
				<div id="hand" class="grid flex-1 min-h-0 w-full grid-cols-4 grid-rows-2 gap-2">
					{gameState.hand.map((card, index) => (
						<Slot
							key={index}
							index={index}
							card={card && dragging?.index !== index ? card : undefined}
							isDragging={dragging?.index === index}
							onPointerDown={(slotIndex, event) => beginDrag(slotIndex, event)}
						/>
					))}
				</div>
			</div>
			<Board gameState={gameState} />
			<ProgressBar
				gameState={gameState}
				onEndTurn={() => {
					setGameState((currentState) => {
						const handCards = currentState.hand.filter((card): card is HandCard => Boolean(card));
						const recycledDeck = shuffleCards([...currentState.deck, ...currentState.used]);
						const drawnHand = recycledDeck.slice(0, drawHandSize);
						const nextDeck = recycledDeck.slice(drawHandSize);

						return {
							...currentState,
							hand: [
								...drawnHand,
								...Array.from(
									{ length: Math.max(0, currentState.hand.length - drawnHand.length) },
									() => undefined,
								),
							],
							deck: nextDeck,
							used: handCards,
							joy: currentState.joy + handCards.reduce((total, card) => total + card.joy(), 0),
							money: currentState.money - 500,
							turn: currentState.turn + 1,
						};
					});
				}}
			/>
			{dragging && gameState.hand[dragging.index] ? (
				<div
					class="card-drag-layer pointer-events-none fixed left-0 top-0 z-50 select-none"
					style={{
						transform: `translate3d(${dragging.clientX - dragging.offsetX}px, ${dragging.clientY - dragging.offsetY}px, 0)`,
					}}
				>
					<CardFace
						card={gameState.hand[dragging.index] as HandCard}
						isDragging
					/>
				</div>
			) : null}
		</div>
	);
}

function ProgressBar({ gameState, onEndTurn }: { gameState: GameState; onEndTurn: () => void }) {
	return (
		<div class="flex w-30 shrink-0 flex-col bg-gray-400 p-3" id="progress">
			<div class="flex-1" />
			<button
				type="button"
				class="mt-auto rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
				onClick={onEndTurn}
			>
				End Turn
			</button>
		</div>
	);
}

function Board({ gameState }: { gameState: GameState }) {
	return <div class="w-[400px] bg-red-100" id="board" data-drop-zone="board">
	</div>
}

function Header({ gameState }: { gameState: GameState }) {
	return (
		<div id="header" class="flex flex-row gap-5">
			<img
				src={profileImage}
				alt="profile"
				class="h-[140px]"
			/>
			<div class="flex flex-1 flex-col gap-2">
				<Dialog />
				<Info gameState={gameState} />
			</div>
		</div>
	)
}

function Dialog() {
	return <div class="bg-blue-200 flex-1 p-5">
		hi
	</div>
}

function Info({ gameState }: { gameState: GameState }) {
	return (
			<div class="flex items-center gap-6 text-sm uppercase tracking-[0.25em] text-slate-600">
				<div class="flex items-baseline gap-2">
					<span>Joy</span>
					<span class="text-base font-semibold tracking-normal text-slate-950">{gameState.joy}</span>
				</div>
				<div class="flex items-baseline gap-2">
					<span>Money</span>
					<span class="text-base font-semibold tracking-normal text-slate-950">${gameState.money}</span>
				</div>
				<div class="flex items-baseline gap-2">
					<span>Deck</span>
					<span class="text-base font-semibold tracking-normal text-slate-950">{gameState.deck.length}</span>
				</div>
				<div class="flex items-baseline gap-2">
					<span>Used</span>
					<span class="text-base font-semibold tracking-normal text-slate-950">{gameState.used.length}</span>
				</div>
			</div>
	)
}

render(<App />, document.getElementById('app'));
