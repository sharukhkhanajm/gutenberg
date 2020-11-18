/**
 * WordPress dependencies
 */
import {
	PostTitle,
	VisualEditorGlobalKeyboardShortcuts,
} from '@wordpress/editor';
import {
	WritingFlow,
	BlockList,
	__unstableUseBlockSelectionClearer as useBlockSelectionClearer,
	__unstableUseTypewriter as useTypewriter,
	__unstableUseClipboardHandler as useClipboardHandler,
	__unstableUseTypingObserver as useTypingObserver,
	__unstableUseScrollMultiSelectionIntoView as useScrollMultiSelectionIntoView,
	__experimentalBlockSettingsMenuFirstItem,
	__experimentalUseResizeCanvas as useResizeCanvas,
	__unstableEditorStyles as EditorStyles,
	Iframe,
} from '@wordpress/block-editor';
import { Popover, DropZoneProvider } from '@wordpress/components';
import { useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockInspectorButton from './block-inspector-button';
import { useSelect } from '@wordpress/data';

function Canvas( { settings } ) {
	const ref = useRef();

	useScrollMultiSelectionIntoView( ref );
	useBlockSelectionClearer( ref );
	useTypewriter( ref );
	useClipboardHandler( ref );
	useTypingObserver( ref );

	return (
		<div tabIndex="-1" ref={ ref }>
			<DropZoneProvider>
				<EditorStyles styles={ settings.styles } />
				<WritingFlow>
					<div className="edit-post-visual-editor__post-title-wrapper">
						<PostTitle />
					</div>
					<BlockList />
				</WritingFlow>
			</DropZoneProvider>
		</div>
	);
}

export default function VisualEditor( { settings } ) {
	const deviceType = useSelect( ( select ) => {
		return select( 'core/edit-post' ).__experimentalGetPreviewDeviceType();
	}, [] );
	const inlineStyles = useResizeCanvas( deviceType );

	return (
		<div className="edit-post-visual-editor" style={ { height: '100%' } }>
			<VisualEditorGlobalKeyboardShortcuts />
			<Popover.Slot name="block-toolbar" />
			<Iframe style={ inlineStyles } head={ window.__editorStyles.html }>
				<Canvas settings={ settings } />
			</Iframe>
			<__experimentalBlockSettingsMenuFirstItem>
				{ ( { onClose } ) => (
					<BlockInspectorButton onClick={ onClose } />
				) }
			</__experimentalBlockSettingsMenuFirstItem>
		</div>
	);
}
