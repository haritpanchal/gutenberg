/**
 * WordPress dependencies
 */
import { useSelect, useRegistry } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { __experimentalBlockPatternsList as BlockPatternsList } from '@wordpress/block-editor';
import { serialize } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';
import { useAvailablePatterns } from './hooks';
import {
	TEMPLATE_POST_TYPE,
	TEMPLATE_PART_POST_TYPE,
} from '../../store/constants';

function TemplatesList( { availableTemplates, onSelect } ) {
	if ( ! availableTemplates || availableTemplates?.length === 0 ) {
		return null;
	}

	return (
		<BlockPatternsList
			label={ __( 'Templates' ) }
			blockPatterns={ availableTemplates }
			onClickPattern={ onSelect }
			showTitlesAsTooltip
		/>
	);
}

function PostTransform() {
	const registry = useRegistry();
	const { record, postType, postId, onNavigateToEntityRecord } = useSelect(
		( select ) => {
			const { getCurrentPostType, getCurrentPostId, getEditorSettings } =
				select( editorStore );
			const { getEditedEntityRecord } = select( coreStore );
			const type = getCurrentPostType();
			const id = getCurrentPostId();
			return {
				postType: type,
				postId: id,
				record: getEditedEntityRecord( 'postType', type, id ),
				onNavigateToEntityRecord:
					getEditorSettings().onNavigateToEntityRecord,
			};
		},
		[]
	);
	const availablePatterns = useAvailablePatterns( record );
	const onTemplateSelect = async ( selectedTemplate ) => {
		const currentPost = await registry
			.resolveSelect( coreStore )
			.getEntityRecord( 'postType', postType, postId );
		const newPost = await registry
			.dispatch( coreStore )
			.saveEntityRecord( 'postType', 'wp_template', {
				...currentPost,
				id: undefined,
				type: 'wp_template',
				blocks: selectedTemplate.blocks,
				content: serialize( selectedTemplate.blocks ),
				status: 'draft',
			} );
		onNavigateToEntityRecord( {
			postId: newPost.id,
			postType: 'wp_template',
			focusMode: false,
		} );
	};
	if ( ! availablePatterns?.length ) {
		return null;
	}

	return (
		<PanelBody
			title={ __( 'Design' ) }
			initialOpen={ record.type === TEMPLATE_PART_POST_TYPE }
		>
			<TemplatesList
				availableTemplates={ availablePatterns }
				onSelect={ onTemplateSelect }
			/>
		</PanelBody>
	);
}

export default function PostTransformPanel() {
	const { postType } = useSelect( ( select ) => {
		const { getCurrentPostType } = select( editorStore );
		return {
			postType: getCurrentPostType(),
		};
	}, [] );

	if (
		! [
			TEMPLATE_PART_POST_TYPE,
			TEMPLATE_POST_TYPE,
			'_wp_static_template',
		].includes( postType )
	) {
		return null;
	}

	return <PostTransform />;
}
