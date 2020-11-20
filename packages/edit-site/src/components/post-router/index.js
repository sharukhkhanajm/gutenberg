/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import useQuery from './use-query';
import getEntityRoute from './get-entity-route';
/**
 * External dependencies
 */
import { useHistory } from 'react-router-dom';

export default function PostRouter() {
	const history = useHistory();
	const query = useQuery();
	const { templateId, templatePartId, templateType, page } = useSelect(
		( select ) => {
			const {
				getTemplateId,
				getTemplatePartId,
				getTemplateType,
				getPage,
			} = select( 'core/edit-site' );

			return {
				templateId: getTemplateId(),
				templatePartId: getTemplatePartId(),
				templateType: getTemplateType(),
				page: getPage(),
			};
		}
	);
	const { setTemplate, setTemplatePart, showHomepage, setPage } = useDispatch(
		'core/edit-site'
	);

	// Set correct entity on load.
	useEffect( () => {
		const contextType = query.get( 'contextType' );
		const id = query.get( 'id' );
		const content = query.get( 'content' );

		if ( 'content' === contextType && content ) {
			setPage( JSON.parse( content ) );
		} else if ( 'wp_template' === contextType && id ) {
			setTemplate( id );
		} else if ( 'wp_template_part' === contextType && id ) {
			setTemplatePart( id );
		} else {
			showHomepage();
		}
	}, [] );

	// Upadte URL when context changes.
	useEffect( () => {
		if ( page ) {
			history.replace(
				getEntityRoute( 'content', JSON.stringify( page ) )
			);
		} else if ( templateType && ( templateId || templatePartId ) ) {
			history.replace(
				getEntityRoute( templateType, templateId || templatePartId )
			);
		}
	}, [ templateId, templatePartId, templateType, page ] );

	return null;
}
