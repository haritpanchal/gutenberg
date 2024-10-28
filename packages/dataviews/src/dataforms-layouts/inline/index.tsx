/**
 * WordPress dependencies
 */
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { FormField } from '../../types';
import DataFormContext from '../../components/dataform-context';

interface FormFieldProps< Item > {
	data: Item;
	field: FormField;
	onChange: ( value: any ) => void;
}

export function FormInlineField< Item >( {
	data,
	field,
	onChange,
}: FormFieldProps< Item > ) {
	const { getFieldDefinition } = useContext( DataFormContext );
	const fieldDefinition = getFieldDefinition(
		typeof field === 'string' ? field : field.id
	);
	if ( ! fieldDefinition ) {
		return null;
	}
	return (
		<HStack className="dataforms-layouts-panel__field">
			<div className="dataforms-layouts-panel__field-label">
				{ fieldDefinition.label }
			</div>
			<div>
				<fieldDefinition.Edit
					key={ fieldDefinition.id }
					data={ data }
					field={ fieldDefinition }
					onChange={ onChange }
					hideLabelFromVision
				/>
			</div>
		</HStack>
	);
}
