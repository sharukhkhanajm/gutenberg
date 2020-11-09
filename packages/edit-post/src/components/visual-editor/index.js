/**
 * WordPress dependencies
 */
import {
	VisualEditorGlobalKeyboardShortcuts,
	PostTitle,
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
} from '@wordpress/block-editor';
import { Popover } from '@wordpress/components';
import { useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockInspectorButton from './block-inspector-button';
import { useSelect } from '@wordpress/data';

export default function VisualEditor() {
	const ref = useRef();
	const { deviceType, templateZoomOut } = useSelect( ( select ) => {
		const { isFeatureActive, __experimentalGetPreviewDeviceType } = select(
			'core/edit-post'
		);
		return {
			deviceType: __experimentalGetPreviewDeviceType(),
			templateZoomOut: isFeatureActive( 'templateZoomOut' ),
		};
	}, [] );
	const inlineStyles = useResizeCanvas( deviceType );

	useScrollMultiSelectionIntoView( ref );
	useBlockSelectionClearer( ref );
	useTypewriter( ref );
	useClipboardHandler( ref );
	useTypingObserver( ref );

	return (
		<div className="edit-post-visual-editor">
			<VisualEditorGlobalKeyboardShortcuts />
			<Popover.Slot name="block-toolbar" />
			<div
				ref={ ref }
				className="editor-styles-wrapper"
				tabIndex="-1"
				style={ inlineStyles }
			>
				<WritingFlow>
					{ ! templateZoomOut && (
						<div className="edit-post-visual-editor__post-title-wrapper">
							<PostTitle />
						</div>
					) }
					<BlockList />
				</WritingFlow>
			</div>
			<__experimentalBlockSettingsMenuFirstItem>
				{ ( { onClose } ) => (
					<BlockInspectorButton onClick={ onClose } />
				) }
			</__experimentalBlockSettingsMenuFirstItem>
		</div>
	);
}
