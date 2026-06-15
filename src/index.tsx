import { render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import './style.css';
import profileImage from './assets/profile.png';
import cardsCsv from './cards.csv?raw';

interface HandCard {
	name: string;
	tags: string[];
	desc: string;
	joy: () => number;
	playLabel: string;
	playEffect: (state: GameState) => GameState;
	gainTag?: string | null;
	isPlaying?: boolean;
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
	startX: number;
	startY: number;
	clientX: number;
	clientY: number;
	offsetX: number;
	offsetY: number;
};

type GainChoiceState = {
	tag: string;
	options: HandCard[];
};

type GainDragState = DragState & {
	card: HandCard;
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

function drawCards(state: GameState, count: number) {
	const nextHand = [...state.hand];
	const nextDeck = [...state.deck];

	for (let index = 0; index < count; index += 1) {
		const emptySlotIndex = nextHand.findIndex((card) => card === undefined);

		if (emptySlotIndex === -1 || nextDeck.length === 0) {
			break;
		}

		const drawnCard = nextDeck.shift();

		if (drawnCard) {
			nextHand[emptySlotIndex] = drawnCard;
		}
	}

	return {
		...state,
		hand: nextHand,
		deck: nextDeck,
	};
}

function createPlayLabel(effect: string) {
	const trimmedEffect = effect.trim();
	const drawMatch = trimmedEffect.match(/\bdraw\s+(\d+)\b/i);
	if (drawMatch) {
		return `Draw ${drawMatch[1]}`;
	}

	const moneyMatch = trimmedEffect.match(/\b(?:money|gain)\s+(\d+)\b/i);
	if (moneyMatch) {
		return `Gain $${moneyMatch[1]}`;
	}

	const gainTagMatch = trimmedEffect.match(/\bgain\s+([a-z][a-z0-9-]*)\b/i);
	if (gainTagMatch) {
		return `Gain ${gainTagMatch[1]}`;
	}

	return trimmedEffect.length > 0 ? trimmedEffect : 'No effect';
}

function createGainTag(effect: string) {
	const trimmedEffect = effect.trim();
	const moneyMatch = trimmedEffect.match(/\b(?:money|gain)\s+(\d+)\b/i);
	if (moneyMatch) {
		return null;
	}

	const gainTagMatch = trimmedEffect.match(/\bgain\s+([a-z][a-z0-9-]*)\b/i);
	return gainTagMatch ? gainTagMatch[1].toLowerCase() : null;
}

function createPlayEffect(effect: string) {
	const normalizedEffect = effect.trim().toLowerCase();

	return (state: GameState) => {
		let nextState = state;
		const drawMatch = normalizedEffect.match(/\bdraw\s+(\d+)\b/);
		const moneyMatch = normalizedEffect.match(/\b(?:money|gain)\s+(\d+)\b/);

		if (drawMatch) {
			nextState = drawCards(nextState, Number.parseInt(drawMatch[1], 10));
		}

		if (moneyMatch) {
			nextState = {
				...nextState,
				money: nextState.money + Number.parseInt(moneyMatch[1], 10),
			};
		}

		return nextState;
	};
}

function cloneCard(card: HandCard) {
	return {
		...card,
		isPlaying: false,
		organicTransform: createOrganicTransform(),
	};
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

function makeCard(card: CardRow): HandCard {
	return {
		name: card.name,
		tags: card.tags,
		desc: card.effect === '____' ? '' : card.effect,
		joy: () => card.joy,
		playLabel: createPlayLabel(card.effect),
		playEffect: createPlayEffect(card.effect),
		gainTag: createGainTag(card.effect),
		isPlaying: false,
		organicTransform: 'translate(0px, 0px) rotate(0deg)',
	};
}

function getGainOptions(tag: string, count = 3) {
	return shuffleCards(allCards.filter((card) => card.tags.includes(tag))).slice(0, count);
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
	isOpaque = false,
	onPointerDown,
	onClick,
}: {
	card: HandCard;
	isDragging?: boolean;
	isOpaque?: boolean;
	onPointerDown?: (event: PointerEvent) => void;
	onClick?: (event: MouseEvent) => void;
}) {
	return (
		<div
			data-card-face="true"
			class={`card-face pointer-events-auto touch-none select-none rounded-[0.9rem] border-2 border-black p-2 shadow-sm transition-all duration-300 ease-out ${
				isDragging
					? 'cursor-grabbing bg-white shadow-2xl'
					: isOpaque
						? 'cursor-grab bg-white'
						: 'cursor-grab bg-[rgba(255,255,255,0.92)]'
			} ${card.isPlaying ? 'card-face--playing' : ''}`}
			style={!isDragging ? { transform: card.organicTransform } : undefined}
			onPointerDown={(event) => {
				event.stopPropagation();
				onPointerDown?.(event as PointerEvent);
			}}
			onClick={(event) => {
				event.preventDefault();
				event.stopPropagation();
				onClick?.(event as MouseEvent);
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
					<div class="text-[0.68rem] uppercase tracking-[0.25em] text-slate-500">Play</div>
					<div class="text-[0.72rem] font-semibold tabular-nums text-slate-900">{card.playLabel}</div>
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
	onClick,
}: {
	card?: HandCard;
	index: number;
	isDragging?: boolean;
	onPointerDown: (index: number, event: PointerEvent) => void;
	onClick: (index: number) => void;
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
						onClick={() => onClick(index)}
					/>
				</div>
			) : null}
		</div>
	);
}

export function App() {
	const [gameState, setGameState] = useState<GameState>(initialGameState);
	const [dragIntent, setDragIntent] = useState<DragState | null>(null);
	const [dragging, setDragging] = useState<DragState | null>(null);
	const [pendingGainChoice, setPendingGainChoice] = useState<GainChoiceState | null>(null);
	const [gainDragIntent, setGainDragIntent] = useState<GainDragState | null>(null);
	const [gainDragging, setGainDragging] = useState<GainDragState | null>(null);
	const lastClickRef = useRef<{ index: number; time: number } | null>(null);
	const gainChoiceRef = useRef<GainChoiceState | null>(null);

	function placeGainCardInHand(card: HandCard, pointX: number, pointY: number, requireHandArea = false) {
		let placedInHand = false;

		setGameState((currentState) => {
			const nextHand = [...currentState.hand];
			const slotElements = Array.from(document.querySelectorAll<HTMLElement>('[data-slot-index]'));
			const handElement = document.getElementById('hand');
			const handRect = handElement?.getBoundingClientRect();
			const insideHandArea = handRect
				? pointX >= handRect.left &&
					pointX <= handRect.right &&
					pointY >= handRect.top &&
					pointY <= handRect.bottom
				: true;

			if (requireHandArea && !insideHandArea) {
				return currentState;
			}

			const emptySlots = slotElements
				.map((slot) => {
					const slotIndex = Number(slot.dataset.slotIndex);
					const rect = slot.getBoundingClientRect();
					return {
						index: slotIndex,
						centerX: rect.left + rect.width / 2,
						centerY: rect.top + rect.height / 2,
					};
				})
				.filter(({ index }) => Number.isInteger(index) && nextHand[index] === undefined);

			if (emptySlots.length === 0) {
				return {
					...currentState,
					deck: [...currentState.deck, cloneCard(card)],
				};
			}

			const nearestSlot = emptySlots.reduce((best, slot) => {
				const bestDistance = Math.hypot(best.centerX - pointX, best.centerY - pointY);
				const slotDistance = Math.hypot(slot.centerX - pointX, slot.centerY - pointY);
				return slotDistance < bestDistance ? slot : best;
			});

			nextHand[nearestSlot.index] = cloneCard(card);
			placedInHand = true;

			return {
				...currentState,
				hand: nextHand,
			};
		});

		return placedInHand;
	}

	useEffect(() => {
		if (!dragging && !dragIntent && !gainDragging && !gainDragIntent) {
			return;
		}

		function handlePointerMove(event: PointerEvent) {
			if (gainDragging) {
				setGainDragging((current) => {
					if (!current) {
						return current;
					}

					return {
						...current,
						clientX: event.clientX,
						clientY: event.clientY,
					};
				});
				return;
			}

			if (gainDragIntent) {
				const movedDistance = Math.hypot(
					event.clientX - gainDragIntent.startX,
					event.clientY - gainDragIntent.startY,
				);

				if (movedDistance < 5) {
					return;
				}

				setGainDragging({
					...gainDragIntent,
					clientX: event.clientX,
					clientY: event.clientY,
				});
				setGainDragIntent(null);
				setPendingGainChoice(null);
				return;
			}

			if (dragging) {
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
				return;
			}

			if (!dragIntent) {
				return;
			}

			const movedDistance = Math.hypot(event.clientX - dragIntent.startX, event.clientY - dragIntent.startY);
			if (movedDistance < 5) {
				return;
			}

			setDragging({
				...dragIntent,
				clientX: event.clientX,
				clientY: event.clientY,
			});
			setDragIntent(null);
		}

		function handlePointerUp(event: PointerEvent) {
			if (gainDragging) {
				const currentGainChoice = gainChoiceRef.current;
				const placedInHand = placeGainCardInHand(
					gainDragging.card,
					event.clientX,
					event.clientY,
					true,
				);

				setGainDragging(null);
				setGainDragIntent(null);
				if (placedInHand) {
					gainChoiceRef.current = null;
					setPendingGainChoice(null);
				} else if (currentGainChoice) {
					setPendingGainChoice(currentGainChoice);
				}
				return;
			}

			if (gainDragIntent) {
				setGainDragIntent(null);
				return;
			}

			if (!dragging) {
				setDragIntent(null);
				return;
			}

			setGameState((currentState) => {
				const nextHand = [...currentState.hand];
				const originIndex = dragging.index;
				const movedCard = nextHand[originIndex];
				const pointX = event.clientX;
				const pointY = event.clientY;
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
			setDragIntent(null);
		}

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp, { once: true });

		return () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
		};
	}, [dragging, dragIntent, gainDragging, gainDragIntent]);

	function beginDrag(index: number, event: PointerEvent) {
		if (pendingGainChoice || gainDragging || gainDragIntent) {
			return;
		}

		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		setDragIntent({
			index,
			startX: event.clientX,
			startY: event.clientY,
			clientX: event.clientX,
			clientY: event.clientY,
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top,
		});
	}

	function beginGainDrag(card: HandCard, event: PointerEvent) {
		if (!pendingGainChoice || gainDragging || gainDragIntent) {
			return;
		}

		gainChoiceRef.current = pendingGainChoice;

		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		setGainDragIntent({
			card,
			index: -1,
			startX: event.clientX,
			startY: event.clientY,
			clientX: event.clientX,
			clientY: event.clientY,
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top,
		});
	}

	function chooseGainCard(card: HandCard, event: MouseEvent) {
		placeGainCardInHand(card, event.clientX, event.clientY);
		setPendingGainChoice(null);
		gainChoiceRef.current = null;
		setGainDragging(null);
		setGainDragIntent(null);
	}

	function playCard(index: number) {
		setGameState((currentState) => {
			const playedCard = currentState.hand[index];

			if (!playedCard) {
				return currentState;
			}

			const nextHand = [...currentState.hand];
			nextHand[index] = {
				...playedCard,
				isPlaying: true,
			};

			window.setTimeout(() => {
				setGameState((latestState) => {
					const latestCard = latestState.hand[index];

					if (!latestCard) {
						return latestState;
					}

					const nextState = {
						...latestState,
						hand: [...latestState.hand],
						used: [...latestState.used, latestCard],
					};

					nextState.hand[index] = undefined;

					if (latestCard.gainTag) {
						const gainOptions = getGainOptions(latestCard.gainTag);

						if (gainOptions.length === 0) {
							return latestCard.playEffect(nextState);
						}

						setPendingGainChoice({
							tag: latestCard.gainTag,
							options: gainOptions,
						});
						return nextState;
					}

					return latestCard.playEffect(nextState);
				});
			}, 300);

			return {
				...currentState,
				hand: nextHand,
			};
		});
	}

	function handleCardClick(index: number) {
		if (pendingGainChoice || gainDragging || gainDragIntent) {
			return;
		}

		const now = Date.now();
		const lastClick = lastClickRef.current;

		if (lastClick && lastClick.index === index && now - lastClick.time < 300) {
			lastClickRef.current = null;
			playCard(index);
			return;
		}

		lastClickRef.current = { index, time: now };
		window.setTimeout(() => {
			if (lastClickRef.current?.index === index && lastClickRef.current.time === now) {
				lastClickRef.current = null;
			}
		}, 300);
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
							onClick={(slotIndex) => handleCardClick(slotIndex)}
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
			{pendingGainChoice ? (
				<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-6">
					<div class="grid w-full max-w-6xl grid-cols-3 gap-6 place-items-center">
						{pendingGainChoice.options.map((card) => (
							<div class="w-fit">
								<CardFace
									card={card}
									isOpaque
									onPointerDown={(event) => beginGainDrag(card, event)}
									onClick={(event) => chooseGainCard(card, event as MouseEvent)}
								/>
							</div>
						))}
					</div>
				</div>
			) : null}
			{gainDragging ? (
				<div
					class="card-drag-layer pointer-events-none fixed left-0 top-0 z-50 select-none"
					style={{
						transform: `translate3d(${gainDragging.clientX - gainDragging.offsetX}px, ${gainDragging.clientY - gainDragging.offsetY}px, 0)`,
					}}
				>
					<CardFace
						card={gainDragging.card}
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
		game board
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
