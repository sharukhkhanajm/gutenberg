/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
/**
 * Internal dependencies
 */
import useQuery from './use-query';

export default function PostRouter() {
	const query = useQuery();
	const postType = query.get( 'postType' );
	const id = query.get( 'id' );

	const { setTemplate, setTemplatePart } = useDispatch( 'core/edit-site' );

	useEffect( () => {
		if ( 'wp_template' === postType ) {
			setTemplate( id );
		} else if ( 'wp_template_part' === postType ) {
			setTemplatePart( id );
		}
	}, [ postType, id ] );
	return null;
}
