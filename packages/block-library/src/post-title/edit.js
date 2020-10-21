/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useEntityProp } from '@wordpress/core-data';
import {
	AlignmentToolbar,
	BlockControls,
	InspectorControls,
	useBlockProps,
	PlainText,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToggleControl,
	TextControl,
	PanelBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import HeadingLevelDropdown from '../heading/heading-level-dropdown';

export default function PostTitleEdit( {
	attributes: { level, textAlign, isLink, rel, linkTarget },
	setAttributes,
	context: { postType, postId },
} ) {
	const TagName = 0 === level ? 'p' : 'h' + level;

	const [ title, setTitle ] = useEntityProp(
		'postType',
		postType,
		'title',
		postId
	);
	const [ link ] = useEntityProp( 'postType', postType, 'title', postId );

	const blockProps = useBlockProps( {
		className: classnames( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
		} ),
	} );

	let titleElement = (
		<PlainText
			tagName={ TagName }
			placeholder={ __( 'No Title' ) }
			{ ...blockProps }
			value={ title }
			onChange={ setTitle }
			__experimentalVersion={ 2 }
		/>
	);

	if ( isLink ) {
		titleElement = (
			<a href={ link } target={ linkTarget } rel={ rel }>
				{ titleElement }
			</a>
		);
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<HeadingLevelDropdown
						selectedLevel={ level }
						onChange={ ( newLevel ) =>
							setAttributes( { level: newLevel } )
						}
					/>
				</ToolbarGroup>
				<AlignmentToolbar
					value={ textAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Link settings' ) }>
					<ToggleControl
						label={ __( 'Make title a link' ) }
						onChange={ () => setAttributes( { isLink: ! isLink } ) }
						checked={ isLink }
					/>
					{ isLink && (
						<>
							<ToggleControl
								label={ __( 'Open in new tab' ) }
								onChange={ ( value ) =>
									setAttributes( {
										linkTarget: value ? '_blank' : '_self',
									} )
								}
								checked={ linkTarget === '_blank' }
							/>
							<TextControl
								label={ __( 'Link rel' ) }
								value={ rel }
								onChange={ ( newRel ) =>
									setAttributes( { rel: newRel } )
								}
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			{ titleElement }
		</>
	);
}
