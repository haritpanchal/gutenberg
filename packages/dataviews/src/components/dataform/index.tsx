/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { DataFormProps } from '../../types';
import { DataFormProvider } from '../dataform-context';
import { normalizeFields } from '../../normalize-fields';
import { DataFormLayout } from '../../dataforms-layouts/data-form-layout';

export default function DataForm< Item >( {
	form,
	...props
}: DataFormProps< Item > ) {
	const normalizedFields = useMemo(
		() => normalizeFields( props.fields ),
		[ props.fields ]
	);

	if ( ! form.fields ) {
		return null;
	}

	return (
		<DataFormProvider fields={ normalizedFields }>
			<DataFormLayout
				defaultLayout={ form.type }
				data={ props.data }
				fields={ form.fields }
				onChange={ props.onChange }
			/>
		</DataFormProvider>
	);
}
