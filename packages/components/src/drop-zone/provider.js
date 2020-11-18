/**
 * External dependencies
 */
import { find, some, filter, includes, throttle } from 'lodash';

/**
 * WordPress dependencies
 */
import { createContext, useEffect, useRef } from '@wordpress/element';
import { getFilesFromDataTransfer } from '@wordpress/dom';

export const Context = createContext();

const { Provider } = Context;

function getDragEventType( { dataTransfer } ) {
	if ( dataTransfer ) {
		if ( getFilesFromDataTransfer( dataTransfer ).size > 0 ) {
			return 'file';
		}

		// Use lodash `includes` here as in the Edge browser `types` is implemented
		// as a DomStringList, whereas in other browsers it's an array. `includes`
		// happily works with both types.
		if ( includes( dataTransfer.types, 'text/html' ) ) {
			return 'html';
		}
	}

	return 'default';
}

function isTypeSupportedByDropZone( type, dropZone ) {
	return (
		( type === 'file' && dropZone.onFilesDrop ) ||
		( type === 'html' && dropZone.onHTMLDrop ) ||
		( type === 'default' && dropZone.onDrop )
	);
}

function isWithinElementBounds( element, x, y ) {
	const rect = element.getBoundingClientRect();
	/// make sure the rect is a valid rect
	if ( rect.bottom === rect.top || rect.left === rect.right ) {
		return false;
	}

	return (
		x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
	);
}

function getPosition( event ) {
	// In some contexts, it may be necessary to capture and redirect the
	// drag event (e.g. atop an `iframe`). To accommodate this, you can
	// create an instance of CustomEvent with the original event specified
	// as the `detail` property.
	//
	// See: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
	const detail =
		window.CustomEvent && event instanceof window.CustomEvent
			? event.detail
			: event;

	return { x: detail.clientX, y: detail.clientY };
}

function getHoveredDropZone( dropZones, position, dragEventType ) {
	const hoveredDropZones = filter(
		Array.from( dropZones.current ),
		( dropZone ) =>
			isTypeSupportedByDropZone( dragEventType, dropZone ) &&
			isWithinElementBounds(
				dropZone.element.current,
				position.x,
				position.y
			)
	);

	// Find the leaf dropzone not containing another dropzone
	return find( hoveredDropZones, ( zone ) => {
		const container = zone.isRelative
			? zone.element.current.parentElement
			: zone.element.current;

		return ! some(
			hoveredDropZones,
			( subZone ) =>
				subZone !== zone &&
				container.contains( subZone.element.current )
		);
	} );
}

export default function DropZoneProvider( { children, forwardedRef } ) {
	const dropZones = useRef( new Set( [] ) );
	const fallbackRef = useRef();
	const ref = forwardedRef || fallbackRef;

	useEffect( () => {
		const { ownerDocument } = ref.current;
		const { defaultView } = ownerDocument;

		let lastRelative;

		function updateDragZones( event ) {
			if ( lastRelative && lastRelative.contains( event.target ) ) {
				return;
			}

			const dragEventType = getDragEventType( event );
			const position = getPosition( event );
			const hoveredDropZone = getHoveredDropZone(
				dropZones,
				position,
				dragEventType
			);

			if ( hoveredDropZone && hoveredDropZone.isRelative ) {
				lastRelative = hoveredDropZone.element.current.offsetParent;
			} else {
				lastRelative = null;
			}

			// Notifying the dropzones
			dropZones.current.forEach( ( dropZone ) => {
				const isDraggingOverDropZone = dropZone === hoveredDropZone;
				dropZone.setState( {
					isDraggingOverDocument: isTypeSupportedByDropZone(
						dragEventType,
						dropZone
					),
					isDraggingOverElement: isDraggingOverDropZone,
					position:
						isDraggingOverDropZone && dropZone.withPosition
							? position
							: null,
					type: isDraggingOverDropZone ? dragEventType : null,
				} );
			} );
		}

		const throttledUpdateDragZones = throttle( updateDragZones, 200 );

		function onDragOver( event ) {
			throttledUpdateDragZones( event );
			event.preventDefault();
		}

		function resetDragState() {
			// Avoid throttled drag over handler calls
			throttledUpdateDragZones.cancel();

			dropZones.current.forEach( ( dropZone ) =>
				dropZone.setState( {
					isDraggingOverDocument: false,
					isDraggingOverElement: false,
					position: null,
					type: null,
				} )
			);
		}

		function onDrop( event ) {
			// This seemingly useless line has been shown to resolve a Safari
			// issue where files dragged directly from the dock are not
			// recognized.
			// eslint-disable-next-line no-unused-expressions
			event.dataTransfer && event.dataTransfer.files.length;

			const dragEventType = getDragEventType( event );
			const position = getPosition( event );
			const hoveredDropZone = getHoveredDropZone(
				dropZones,
				position,
				dragEventType
			);

			resetDragState();

			if ( hoveredDropZone ) {
				switch ( dragEventType ) {
					case 'file':
						hoveredDropZone.onFilesDrop(
							[
								...getFilesFromDataTransfer(
									event.dataTransfer
								),
							],
							position
						);
						break;
					case 'html':
						hoveredDropZone.onHTMLDrop(
							event.dataTransfer.getData( 'text/html' ),
							position
						);
						break;
					case 'default':
						hoveredDropZone.onDrop( event, position );
				}
			}

			event.stopPropagation();
			event.preventDefault();
		}

		defaultView.addEventListener( 'drop', onDrop );
		defaultView.addEventListener( 'dragover', onDragOver );
		defaultView.addEventListener( 'mouseup', resetDragState );
		// Note that `dragend` doesn't fire consistently for file and HTML drag
		// events where the drag origin is outside the browser window.
		// In Firefox it may also not fire if the originating node is removed.
		defaultView.addEventListener( 'dragend', resetDragState );

		return () => {
			defaultView.removeEventListener( 'drop', onDrop );
			defaultView.removeEventListener( 'dragover', onDragOver );
			defaultView.removeEventListener( 'mouseup', resetDragState );
			defaultView.removeEventListener( 'dragend', resetDragState );
		};
	}, [] );

	const provider = (
		<Provider value={ dropZones.current }>{ children }</Provider>
	);

	if ( forwardedRef ) {
		return provider;
	}

	return (
		<div ref={ ref } className="components-drop-zone__provider">
			{ provider }
		</div>
	);
}
