/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { edit } from '@wordpress/icons';
import { useMemo } from '@wordpress/element';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { PATTERN_TYPES } from '../../utils/constants';
import { unlock } from '../../lock-unlock';

const { useHistory } = unlock( routerPrivateApis );

export const useSetActiveTemplateAction = () => {
	const { editEntityRecord, saveEditedEntityRecord } =
		useDispatch( coreStore );
	return useMemo(
		() => ( {
			id: 'set-active-template',
			label: __( 'Activate' ),
			isPrimary: true,
			icon: edit,
			isEligible( post ) {
				return post.status !== 'publish';
			},
			async callback( [ item ] ) {
				await editEntityRecord(
					'postType',
					'wp_template',
					item.id,
					{
						status: 'publish',
						meta: {
							origin: 'theme',
						},
					},
					{ throwOnError: true }
				);
				await saveEditedEntityRecord(
					'postType',
					'wp_template',
					item.id
				);
			},
		} ),
		[ editEntityRecord, saveEditedEntityRecord ]
	);
};

export const useSetInactiveTemplateAction = () => {
	const { editEntityRecord, saveEditedEntityRecord } =
		useDispatch( coreStore );
	return useMemo(
		() => ( {
			id: 'set-active-template',
			label: __( 'Deactivate' ),
			isPrimary: true,
			icon: edit,
			isEligible( post ) {
				return post.status === 'publish';
			},
			async callback( [ item ] ) {
				await editEntityRecord(
					'postType',
					'wp_template',
					item.id,
					{
						status: 'draft',
					},
					{ throwOnError: true }
				);
				await saveEditedEntityRecord(
					'postType',
					'wp_template',
					item.id
				);
			},
		} ),
		[ editEntityRecord, saveEditedEntityRecord ]
	);
};

export const useEditPostAction = () => {
	const history = useHistory();
	return useMemo(
		() => ( {
			id: 'edit-post',
			label: __( 'Edit' ),
			isPrimary: true,
			icon: edit,
			isEligible( post ) {
				if ( post.status === 'trash' ) {
					return false;
				}
				// It's eligible for all post types except theme patterns.
				return post.type !== PATTERN_TYPES.theme;
			},
			callback( items ) {
				const post = items[ 0 ];
				history.push( {
					postId: post.id,
					postType: post.type,
					canvas: 'edit',
				} );
			},
		} ),
		[ history ]
	);
};
