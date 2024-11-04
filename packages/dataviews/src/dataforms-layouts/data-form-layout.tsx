/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { FormField } from '../types';
import { getFormFieldLayout } from './index';
import DataFormContext from '../components/dataform-context';

export function DataFormLayout< Item >( {
	defaultLayout,
	data,
	fields,
	onChange,
	children,
}: {
	defaultLayout?: string;
	data: Item;
	fields: FormField[];
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
	const { getFieldDefinition } = useContext( DataFormContext );

	return (
		<VStack spacing={ 2 }>
			{ fields.map( ( field ) => {
				const fieldLayoutId =
					typeof field !== 'string' && field.layout
						? field.layout
						: defaultLayout;
				const FieldLayout = getFormFieldLayout(
					fieldLayoutId ?? 'regular'
				)?.component;

				if ( ! FieldLayout ) {
					return null;
				}

				const fieldId = typeof field === 'string' ? field : field.id;
				const fieldDefinition = getFieldDefinition( fieldId );

				if (
					! fieldDefinition ||
					( fieldDefinition.isVisible &&
						! fieldDefinition.isVisible( data ) )
				) {
					return null;
				}

				if ( children ) {
					return children( FieldLayout, field );
				}

				return (
					<FieldLayout
						key={ fieldId }
						data={ data }
						field={ field }
						onChange={ onChange }
					/>
				);
			} ) }
		</VStack>
	);
}
