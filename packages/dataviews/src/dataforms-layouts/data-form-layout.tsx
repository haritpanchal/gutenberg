/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { FormField } from '../types';
import { getFormFieldLayout } from './index';

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
	return (
		<VStack spacing={ 2 }>
			{ fields.map( ( field ) => {
				const fieldLayoutId =
					typeof field === 'string' ? defaultLayout : field.layout;
				const FieldLayout = getFormFieldLayout(
					fieldLayoutId ?? 'regular'
				)?.component;

				if ( ! FieldLayout ) {
					return null;
				}

				if ( children ) {
					return children( FieldLayout, field );
				}

				return (
					<FieldLayout
						key={ typeof field === 'string' ? field : field.id }
						data={ data }
						field={ field }
						onChange={ onChange }
					/>
				);
			} ) }
		</VStack>
	);
}
