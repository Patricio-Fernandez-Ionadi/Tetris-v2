import { bh, blockSize, bw } from './src/utils/global.js'
import {
	applySquareShadow,
	getCanvas,
	getDeltaTime,
	getRandomColor,
} from './src/utils/utils.js'
/* ----------------------------------- */
// ------------------------------------//
/* ----------------------------------- */
const { canvas, context: ctx } = getCanvas({
	on: document.getElementById('root'),
	size: {
		width: bw,
		height: bh,
	},
})

function randomBetweenZero(to) {
	return Math.floor(Math.random() * to)
}

// const velocity = 0.001
// const velocity = 0.01
// const velocity = 0.1
const velocity = 1

class Block {
	constructor({ index, color }) {
		this.index = {
			x: index.x,
			y: index.y,
		}
		this.size = blockSize
		this.color = color || '#222'
		//
		this.position = {
			x: this.index.x * this.size,
			y: this.index.y * this.size,
		}

		this.placed = false
	}

	// PUBLIC
	draw() {
		ctx.save()
		applySquareShadow(ctx)
		ctx.fillStyle = this.color
		ctx.fillRect(this.position.x, this.position.y, blockSize, blockSize)
		ctx.restore()
	}

	moveLeft() {
		this.index.x -= 1
		this.position = {
			...this.position,
			x: this.index.x * this.size,
		}
	}
	moveRight() {
		this.index.x += 1
		this.position = {
			...this.position,
			x: this.index.x * this.size,
		}
	}
	updateY() {
		this.index.y += 1
		this.position = {
			...this.position,
			y: this.index.y * this.size,
		}
	}
}

class Board {
	#slots = []
	#rowsToDelete = []
	constructor() {
		this.data = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		]
		this.width = 11
		this.height = 23
		this.maxYposition = new Array(12).fill(this.height)
		this.maxXposition = this.width
		//
		this.#init()
	}

	// PUBLIC
	draw() {
		// tablero limpio
		this.#slots.forEach((s) => s.draw())

		// piezas colocadas
		this.data.forEach((row) => {
			row.forEach((slot) => {
				if (slot === 0) return
				else slot.draw()
			})
		})
	}

	update(piece) {
		if (piece) this.#putPiece(piece)

		if (this.#handleCompletedRows()) {
			this.data.reverse().forEach((row) => {
				row.forEach((slot) => {
					if (slot === 0) return
					else slot.updateY()
				})
			})
			this.data.reverse()
		}
	}

	// PRIVATE
	#init() {
		// colocacion de "slots"
		this.data.forEach((y, row) => {
			y.forEach((_, column) => {
				this.#slots.push(
					new Block({
						index: {
							x: column,
							y: row,
						},
					})
				)
			})
		})
	}

	// colocar pieza en el tablero
	#putPiece(piece) {
		this.data[piece.index.y][piece.index.x] = piece
	}

	// controlador lineas completas
	#handleCompletedRows() {
		this.data.forEach((ROW, ROW_INDEX) => {
			let complete = ROW.filter((e) => e !== 0)
			if (complete.length === 12) this.#rowsToDelete.push(ROW_INDEX)
		})

		// si hubo lineas que remover
		if (this.#rowsToDelete.length > 0) {
			this.#removeCompletedRows()
			return true
		} else return false
	}

	// remover lineas completas
	#removeCompletedRows() {
		this.#rowsToDelete.forEach((row) => {
			this.#removeOneRow(row)
			this.#incrementYposition()
		})

		this.#rowsToDelete = []
	}

	// incrementar la altura maxima de colocacion de piezas
	#incrementYposition() {
		this.maxYposition.forEach((value, index) => {
			this.maxYposition[index] = value + 1
		})
	}
	#removeOneRow(index) {
		this.data = this.data.filter((_, i) => i !== index)
		this.data.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
	}
}

class Game {
	constructor() {
		// juego
		this.difficult = velocity
		this.timer = {
			apsCounter: 0,
			aps: 0,
			fpsCounter: 0,
			fps: 0,
			counter: 0,
			tick: this.difficult * 1000,
			tickUpdate: false,
			tickCounter: 0,
		}

		// tablero
		this.board = new Board()

		// piezas
		this.currentPiece = null

		// keyboard
		this.keyPressed = ''
		window.addEventListener('keydown', (e) => {
			const { key } = e
			if (key === 'ArrowLeft') {
				this.keyPressed = 'left'
			} else if (key === 'ArrowRight') {
				this.keyPressed = 'right'
			} else if (key === 'ArrowDown') {
				this.keyPressed = 'down'
			}
		})
		window.addEventListener('keyup', (e) => {
			this.keyPressed = ''
		})
	}

	// PUBLIC
	play(deltaTime) {
		this.#handleTimers(deltaTime)
		this.#update()
		this.#draw()
	}

	// PRIVATE
	#draw() {
		this.timer.fpsCounter++

		// board
		this.board.draw()

		// pieza en juego
		this.currentPiece?.draw()
	}
	#update() {
		this.timer.apsCounter++

		if (!this.currentPiece) this.#newPiece()
		else if (this.currentPiece.placed) {
			this.board.update(this.currentPiece)
			this.#newPiece()
		}

		this.#movementPiece()
		this.#tickUpdate()
	}
	#movementPiece() {
		/* MOVIMIENTO HORIZONTAL */
		// ayudas visuales

		// casilla a la izquieda de la pieza
		let boardToLeft =
			this.board.data[this.currentPiece.index.y][this.currentPiece.index.x - 1]

		// casilla a la derecha de la pieza
		let boardToRight =
			this.board.data[this.currentPiece.index.y][this.currentPiece.index.x + 1]

		if (this.keyPressed === 'left' && this.timer.counter % 20 === 0) {
			if (boardToLeft === 0) {
				this.currentPiece.moveLeft()
			}
		} else if (this.keyPressed === 'right' && this.timer.counter % 20 === 0) {
			if (boardToRight === 0) {
				this.currentPiece.moveRight()
			}
		} else if (this.keyPressed === 'down') {
			if (
				this.currentPiece.index.y <
				this.board.maxYposition[this.currentPiece.index.x]
			) {
				this.currentPiece.updateY()
			}
		}
	}
	#tickUpdate() {
		if (this.timer.tickUpdate) {
			// ayudas visuales
			let piece = this.currentPiece
			let pieceY = piece.index.y
			let pieceX = piece.index.x

			/* MOVIMIENTO VERTICAL AUTOMATICO*/
			// mientras que la pieza este por abajo del maximo en Y
			if (pieceY < this.board.maxYposition[pieceX]) {
				// actualizar pieza
				piece.updateY()
			}
			// la pieza esta en la posicion mas baja posible
			else if (pieceY === this.board.maxYposition[pieceX]) {
				// ya no debe bajar

				// actualizamos la posicion maxima
				this.board.maxYposition[pieceX] = pieceY - 1

				// la seteamos como colocada para poder generar otra
				piece.placed = true
				return
			}
			// ERROR
			else {
				console.log('juego terminado')
			}
		}
	}
	#newPiece() {
		this.currentPiece = new Block({
			index: {
				x: Math.floor(Math.random() * 12),
				y: 0,
			},
			color: getRandomColor(),
		})
	}
	#handleTimers(deltaTime) {
		// control por tick
		if (this.timer.tickCounter > this.timer.tick) {
			this.timer.tickUpdate = true
			this.timer.tickCounter = 0
		} else {
			this.timer.tickUpdate = false
			this.timer.tickCounter += deltaTime
		}

		// control por segundo
		if (this.timer.counter > 1000) {
			this.timer.fps = this.timer.fpsCounter
			this.timer.aps = this.timer.apsCounter
			this.timer.fpsCounter = 0
			this.timer.apsCounter = 0
			this.timer.counter = 0
			// console.log(`FPS: ${this.timer.fps} || APS: ${this.timer.aps}`)
		} else {
			this.timer.counter += deltaTime
		}
	}
}
/*  */
class Piece {
	constructor() {
		this.index = { x: 0, y: 0 }
		this.position = {
			x: 0,
			y: 0,
		}
		this.orientation = ['top', 'left', 'bottom', 'right']
		this.shapeCodes = {
			pyramid: {
				name: 'pyramid',
				top: {
					direction: 'top',
					shapeCode: [
						[0, 0, 0],
						[0, 1, 0],
						[1, 1, 1],
					],
					maxX: 9,
					minX: 0,
				},
				right: {
					direction: 'right',
					shapeCode: [
						[1, 0, 0],
						[1, 1, 0],
						[1, 0, 0],
					],
					maxX: 10,
					minX: 0,
				},
				bottom: {
					direction: 'bottom',
					shapeCode: [
						[1, 1, 1],
						[0, 1, 0],
						[0, 0, 0],
					],
					maxX: 9,
					minX: 0,
				},
				left: {
					direction: 'left',
					shapeCode: [
						[0, 0, 1],
						[0, 1, 1],
						[0, 0, 1],
					],
					maxX: 9,
					minX: -1,
				},
			},
			cube: {
				name: 'cube',
				top: {
					direction: 'top',
					shapeCode: [
						[1, 1],
						[1, 1],
					],
					maxX: 10,
				},
				right: {
					direction: 'right',
					shapeCode: [
						[1, 1],
						[1, 1],
					],
					maxX: 10,
				},
				bottom: {
					direction: 'bottom',
					shapeCode: [
						[1, 1],
						[1, 1],
					],
					maxX: 10,
				},
				left: {
					direction: 'left',
					shapeCode: [
						[1, 1],
						[1, 1],
					],
					maxX: 10,
				},
			},
			stick: {
				name: 'stick',
				top: {
					direction: 'top',
					shapeCode: [
						[1, 1, 1, 1, 1],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
					],
					maxX: 7,
				},
				right: {
					direction: 'right',
					shapeCode: [
						[0, 0, 0, 0, 1],
						[0, 0, 0, 0, 1],
						[0, 0, 0, 0, 1],
						[0, 0, 0, 0, 1],
						[0, 0, 0, 0, 1],
					],
					maxX: 11,
				},
				bottom: {
					direction: 'bottom',
					shapeCode: [
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0],
						[1, 1, 1, 1, 1],
					],
					maxX: 7,
				},
				left: {
					direction: 'left',
					shapeCode: [
						[1, 0, 0, 0, 0],
						[1, 0, 0, 0, 0],
						[1, 0, 0, 0, 0],
						[1, 0, 0, 0, 0],
						[1, 0, 0, 0, 0],
					],
					maxX: 11,
				},
			},
		}
		this.color = getRandomColor()
	}

	draw() {
		let posibleFigures = Object.keys(this.shapeCodes)
		// [pyramid, cube, stick, ...]

		let randomFigureIndex = randomBetweenZero(posibleFigures.length)

		let randomOrientation =
			this.orientation[randomBetweenZero(this.orientation.length)]
		// top, left, bottom, right

		// figure object
		let randomFigureObject = this.shapeCodes[posibleFigures[randomFigureIndex]]
		let figureName = randomFigureObject.name
		let figureOrientation = randomFigureObject[randomOrientation]

		// console.log({ figureName, figureOrientation, randomFigureObject })

		figureOrientation.shapeCode.forEach((codeRow, indexCodeRow) => {
			codeRow.forEach((codeCol, indexCodeCol) => {
				if (codeCol !== 0) {
					console.log({
						x: this.index * indexCodeCol,
						y: this.index * indexCodeRow,
					})
				}
			})

			console.log(codeRow)
		})
	}

	chooseRandomOrientation() {
		// 0 - 3
		return Math.floor(Math.random() * this.orientation.length)
	}
}
/*  */
const game = new Game()
/*  */
const piece = new Piece()
piece.draw()
// -------------- -------------- */
// -------------- -------------- */
// -------------- -------------- */
function animate(timeStamp) {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	// ------------------------------
	let deltaTime = getDeltaTime(timeStamp)
	game.play(deltaTime)
	// ------------------------------
	requestAnimationFrame(animate)
}

animate(0)
