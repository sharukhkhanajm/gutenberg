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
	const { templateId, templatePartId, templateType } = useSelect(
		( select ) => {
			const {
				getTemplateId,
				getTemplatePartId,
				getTemplateType,
			} = select( 'core/edit-site' );

			return {
				templateId: getTemplateId(),
				templatePartId: getTemplatePartId(),
				templateType: getTemplateType(),
			};
		}
	);
	const { setTemplate, setTemplatePart, showHomepage } = useDispatch(
		'core/edit-site'
	);

	// Set correct entity on load.
	useEffect( () => {
		const postType = query.get( 'postType' );
		const id = query.get( 'id' );

		if ( ! postType || ! id ) {
			showHomepage();
		} else if ( 'wp_template' === postType ) {
			setTemplate( id );
		} else if ( 'wp_template_part' === postType ) {
			setTemplatePart( id );
		}
	}, [] );

	// Upadte URL when context changes.
	useEffect( () => {
		const entityIds = {
			wp_template: templateId,
			wp_template_part: templatePartId,
		};
		history.push(
			getEntityRoute( templateType, entityIds[ templateType ] )
		);
	}, [ templateId, templatePartId, templateType ] );

	return null;
}
