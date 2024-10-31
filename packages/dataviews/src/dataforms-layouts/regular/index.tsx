/**
 * WordPress dependencies
 */
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
	hideLabelFromVision?: boolean;
}

export default function FormRegularField< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
}: FormFieldProps< Item > ) {
	const { getFieldDefinition } = useContext( DataFormContext );
	const fieldDefinition = getFieldDefinition(
		typeof field === 'string' ? field : field.id
	);
	if ( ! fieldDefinition ) {
		return null;
	}
	return (
		<fieldDefinition.Edit
			data={ data }
			field={ fieldDefinition }
			onChange={ onChange }
			hideLabelFromVision={ hideLabelFromVision }
		/>
	);
}
