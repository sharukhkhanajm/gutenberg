/**
 * Internal dependencies
 */
import { canvas } from './canvas';

/**
 * Gets the active frame.
 */
export async function activeFrame() {
	const isCanvasActive = await page.evaluate(
		() => document.activeElement.name === 'editor-canvas'
	);
	return isCanvasActive ? await canvas() : page;
}
