/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useContext, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { normalizeFields } from '../../normalize-fields';
import { getVisibleFields } from '../get-visible-fields';
import type { DataFormProps, FormField } from '../../types';
import FormFieldVisibility from '../../components/form-field-visibility';
import DataFormContext from '../../components/dataform-context';

interface FormFieldProps< Item > {
	data: Item;
	field: FormField;
	onChange: ( value: any ) => void;
	hideLabelFromVision?: boolean;
}

export function FormRegularField< Item >( {
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

export default function FormRegular< Item >( {
	data,
	fields,
	form,
	onChange,
}: DataFormProps< Item > ) {
	const visibleFields = useMemo(
		() =>
			normalizeFields( getVisibleFields< Item >( fields, form.fields ) ),
		[ fields, form.fields ]
	);

	return (
		<VStack spacing={ 4 }>
			{ visibleFields.map( ( field ) => {
				return (
					<FormFieldVisibility
						key={ field.id }
						data={ data }
						field={ field }
					>
						<field.Edit
							data={ data }
							field={ field }
							onChange={ onChange }
						/>
					</FormFieldVisibility>
				);
			} ) }
		</VStack>
	);
}
