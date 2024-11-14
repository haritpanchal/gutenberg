/**
 * WordPress dependencies
 */
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';

const { useHistory } = unlock( routerPrivateApis );

export default function useNavigateToEntityRecord() {
	const history = useHistory();

	const onNavigateToEntityRecord = useCallback(
		( params ) => {
			const _params = { ...params, focusMode: true, canvas: 'edit' };
			if ( params.focusMode === false ) {
				delete _params.focusMode;
			}
			history.push( _params );
		},
		[ history ]
	);

	return onNavigateToEntityRecord;
}
