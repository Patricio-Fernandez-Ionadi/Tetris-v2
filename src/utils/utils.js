// --- --- ---
// CANVAS
export function getCanvas({ on, size }) {
	let element = on || document.querySelector('body')

	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')

	// style
	canvas.style.backgroundColor = 'green'
	canvas.style.position = 'absolute'
	canvas.style.top = '50%'
	canvas.style.left = '50%'
	canvas.style.transform = 'translate(-50%, -50%)'
	canvas.width = size ? size.width : window.innerWidth
	canvas.height = size ? size.height : window.innerHeight

	// create
	element.appendChild(canvas)

	return { canvas, context }
}

export function applySquareShadow(ctx) {
	ctx.shadowOffsetX = -1
	ctx.shadowOffsetY = -1
	ctx.shadowBlur = 5
	ctx.shadowColor = 'rgba(120, 120, 120, 0.2)'
}

// --- --- ---
// TIMERS
const gts = () => {
	let lts = 1
	return (ts) => {
		const deltaTime = ts - lts
		lts = ts
		return deltaTime
	}
}
export const getDeltaTime = gts()

// --- --- ---
// OTHERS

/* Genera un color aleatorio en sistema Hexadecimal
 * returns String hex color ('#f8d9b0')
 */
export function getRandomColor() {
	const caracteres = [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
		'0',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
	]
	let color = ''
	for (let i = 1; i < 7; i++) {
		const random = Math.floor(Math.random() * caracteres.length)
		color += caracteres[random]
	}
	return '#' + color
}
