/**
 * WordPress dependencies
 */
import { useSelect, useRegistry } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';

/**
 * Component that:
 *
 * - Displays a 'Edit your template to edit this block' notification when the
 *   user is focusing on editing page content and clicks on a disabled template
 *   block.
 * - Displays a 'Edit your template to edit this block' dialog when the user
 *   is focusing on editing page conetnt and double clicks on a disabled
 *   template block.
 *
 * @param {Object}                                 props
 * @param {import('react').RefObject<HTMLElement>} props.contentRef Ref to the block
 *                                                                  editor iframe canvas.
 */
export default function EditTemplateBlocksNotification( { contentRef } ) {
	const registry = useRegistry();
	const { onNavigateToEntityRecord, templateId } = useSelect( ( select ) => {
		const { getEditorSettings, getCurrentTemplateId } =
			select( editorStore );

		return {
			onNavigateToEntityRecord:
				getEditorSettings().onNavigateToEntityRecord,
			templateId: getCurrentTemplateId(),
		};
	}, [] );

	const canEditTemplate = useSelect(
		( select ) =>
			!! select( coreStore ).canUser( 'create', {
				kind: 'postType',
				name: 'wp_template',
			} ),
		[]
	);

	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	useEffect( () => {
		const handleDblClick = ( event ) => {
			if ( ! canEditTemplate ) {
				return;
			}

			if (
				! event.target.classList.contains( 'is-root-container' ) ||
				event.target.dataset?.type === 'core/template-part'
			) {
				return;
			}

			if ( ! event.defaultPrevented ) {
				event.preventDefault();
				setIsDialogOpen( true );
			}
		};

		const canvas = contentRef.current;
		canvas?.addEventListener( 'dblclick', handleDblClick );
		return () => {
			canvas?.removeEventListener( 'dblclick', handleDblClick );
		};
	}, [ contentRef, canEditTemplate ] );

	if ( ! canEditTemplate ) {
		return null;
	}

	return (
		<ConfirmDialog
			isOpen={ isDialogOpen }
			confirmButtonText={ __( 'Edit template' ) }
			onConfirm={ async () => {
				setIsDialogOpen( false );
				if ( templateId && typeof templateId === 'string' ) {
					onNavigateToEntityRecord( {
						postId: templateId,
						postType: 'wp_template',
					} );
				} else {
					const currentPost = registry
						.select( editorStore )
						.getCurrentPost();
					const newPost = await registry
						.dispatch( coreStore )
						.saveEntityRecord( 'postType', 'wp_template', {
							...currentPost,
							id: undefined,
							type: 'wp_template',
							status: 'draft',
						} );
					onNavigateToEntityRecord( {
						postId: newPost.id,
						postType: 'wp_template',
						focusMode: false,
					} );
				}
			} }
			onCancel={ () => setIsDialogOpen( false ) }
			size="medium"
		>
			{ __(
				'You’ve tried to select a block that is part of a template, which may be used on other posts and pages. Would you like to edit the template?'
			) }
		</ConfirmDialog>
	);
}
