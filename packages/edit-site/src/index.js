/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import '@wordpress/notices';
import {
	registerCoreBlocks,
	__experimentalRegisterExperimentalCoreBlocks,
} from '@wordpress/block-library';
import { render } from '@wordpress/element';
/**
 * External dependencies
 */
import { BrowserRouter, Route } from 'react-router-dom';
/**
 * Internal dependencies
 */
import './plugins';
import './hooks';
import registerEditSiteStore from './store';
import Editor from './components/editor';
import { findTemplate } from './utils';
import PostRouter from './components/post-router';
import {
	BASE_ROUTE,
	POST_ROUTER_ROUTE,
} from './components/post-router/constants';

const fetchLinkSuggestions = ( search, { perPage = 20 } = {} ) =>
	apiFetch( {
		path: addQueryArgs( '/wp/v2/search', {
			per_page: perPage,
			search,
			type: 'post',
			subtype: 'post',
		} ),
	} )
		.then( ( posts ) =>
			Promise.all(
				posts.map( ( post ) =>
					apiFetch( { url: post._links.self[ 0 ].href } )
				)
			)
		)
		.then( ( posts ) =>
			posts.map( ( post ) => ( {
				url: post.link,
				type: post.type,
				id: post.id,
				slug: post.slug,
				title: post.title.rendered || __( '(no title)' ),
			} ) )
		);

function RoutedEditor() {
	return (
		<BrowserRouter>
			<Route path={ BASE_ROUTE } component={ Editor } />
			<Route path={ POST_ROUTER_ROUTE } component={ PostRouter } />
		</BrowserRouter>
	);
}

/**
 * Initializes the site editor screen.
 *
 * @param {string} id       ID of the root element to render the screen in.
 * @param {Object} settings Editor settings.
 */
export function initialize( id, settings ) {
	findTemplate.siteUrl = settings.siteUrl;
	settings.__experimentalFetchLinkSuggestions = fetchLinkSuggestions;
	settings.__experimentalSpotlightEntityBlocks = [ 'core/template-part' ];

	registerEditSiteStore( { settings } );

	registerCoreBlocks();
	if ( process.env.GUTENBERG_PHASE === 2 ) {
		__experimentalRegisterExperimentalCoreBlocks( true );
	}

	render( <RoutedEditor />, document.getElementById( id ) );
}

export { default as __experimentalNavigationToggle } from './components/navigation-sidebar/navigation-toggle';
