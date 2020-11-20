/**
 * External dependencies
 */
import { BrowserRouter, Route } from 'react-router-dom';
/**
 * Internal dependencies
 */
import Editor from '../editor';
import PostRouter from '../post-router';
import { BASE_ROUTE } from '../post-router/constants';

export default function RoutedEditor() {
	return (
		<BrowserRouter>
			<Route path={ BASE_ROUTE }>
				<Editor />
				<PostRouter />
			</Route>
		</BrowserRouter>
	);
}
