/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { FormField, SimpleFormField } from '../types';
import { getFormFieldLayout } from './index';
import DataFormContext from '../components/dataform-context';
import { isCombinedField } from './is-combined-field';

export function DataFormLayout< Item >( {
	defaultLayout,
	data,
	fields,
	onChange,
	children,
}: {
	defaultLayout?: string;
	data: Item;
	fields: Array< FormField | string >;
	onChange: ( value: any ) => void;
	children?: (
		FieldLayout: ( props: {
			data: Item;
			field: FormField;
			onChange: ( value: any ) => void;
			hideLabelFromVision?: boolean;
		} ) => React.JSX.Element | null,
		field: FormField
	) => React.JSX.Element;
} ) {
	const { fields: fieldDefinitions } = useContext( DataFormContext );

	function getFieldDefinition( field: SimpleFormField | string ) {
		const fieldId = typeof field === 'string' ? field : field.field;

		return fieldDefinitions.find(
			( fieldDefinition ) => fieldDefinition.id === fieldId
		);
	}

	return (
		<VStack spacing={ 2 }>
			{ fields.map( ( field ) => {
				const formField: FormField =
					typeof field !== 'string'
						? field
						: {
								field,
						  };
				const fieldLayoutId = formField.layout
					? formField.layout
					: defaultLayout;
				const FieldLayout = getFormFieldLayout(
					fieldLayoutId ?? 'regular'
				)?.component;

				if ( ! FieldLayout ) {
					return null;
				}

				const fieldDefinition = ! isCombinedField( formField )
					? getFieldDefinition( formField )
					: undefined;

				if (
					fieldDefinition &&
					fieldDefinition.isVisible &&
					! fieldDefinition.isVisible( data )
				) {
					return null;
				}

				if ( children ) {
					return children( FieldLayout, formField );
				}

				const key = isCombinedField( formField )
					? formField.id
					: formField.field;
				return (
					<FieldLayout
						key={ key }
						data={ data }
						field={ formField }
						onChange={ onChange }
					/>
				);
			} ) }
		</VStack>
	);
}
