/**
 * The block toolbar is not always visible while typing.
 * Call this function to reveal it.
 */
export async function showBlockToolbar() {
	const iframe = await page.$( 'iframe[name="editor-canvas"]' );
	const iframeRect = await iframe.boundingBox();
	// Move the mouse to disable the isTyping mode
	await page.mouse.move( iframeRect.x + 50, iframeRect.y + 50 );
	await page.mouse.move( iframeRect.x + 100, iframeRect.y + 100 );
}
