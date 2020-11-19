/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalNavigationItem as NavigationItem,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
/**
 * External dependencies
 */
import { useHistory } from 'react-router-dom';
/**
 * Internal dependencies
 */
import TemplatePreview from './template-preview';
import { NavigationPanelPreviewFill } from '../index';
import { getTemplateInfo } from '../../../utils';
import getEntityRoute from '../../post-router/get-entity-route';

export default function TemplateNavigationItem( { item } ) {
	const history = useHistory();
	const [ isPreviewVisible, setIsPreviewVisible ] = useState( false );

	const { title, description } = getTemplateInfo( item );

	const onActivateItem = () =>
		history.push( getEntityRoute( item.type, item.id ) );

	return (
		<NavigationItem
			className="edit-site-navigation-panel__template-item"
			item={ `${ item.type }-${ item.id }` }
			title={ title }
		>
			<Button
				onClick={ onActivateItem }
				onMouseEnter={ () => setIsPreviewVisible( true ) }
				onMouseLeave={ () => setIsPreviewVisible( false ) }
			>
				{ title }
				{ description && (
					<div className="edit-site-navigation-panel__template-item-description">
						{ description }
					</div>
				) }
			</Button>

			{ isPreviewVisible && (
				<NavigationPanelPreviewFill>
					<TemplatePreview rawContent={ item.content.raw } />
				</NavigationPanelPreviewFill>
			) }
		</NavigationItem>
	);
}
