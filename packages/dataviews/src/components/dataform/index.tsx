/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { DataFormProps } from '../../types';
import { getFormLayout } from '../../dataforms-layouts';
import { DataFormProvider } from '../dataform-context';
import { normalizeFields } from '../../normalize-fields';

export default function DataForm< Item >( {
	form,
	...props
}: DataFormProps< Item > ) {
	const layout = getFormLayout( form.type ?? 'regular' );

	const normalizedFields = useMemo(
		() => normalizeFields( props.fields ),
		[ props.fields ]
	);

	if ( ! layout ) {
		return null;
	}

	return (
		<DataFormProvider fields={ normalizedFields }>
			<layout.component form={ form } { ...props } />{ ' ' }
		</DataFormProvider>
	);
}
