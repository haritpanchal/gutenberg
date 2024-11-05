/**
 * WordPress dependencies
 */
import { useContext, useMemo } from '@wordpress/element';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { FormField } from '../../types';
import DataFormContext from '../../components/dataform-context';
import { DataFormLayout } from '../data-form-layout';

interface FormFieldProps< Item > {
	data: Item;
	field: FormField;
	onChange: ( value: any ) => void;
	hideLabelFromVision?: boolean;
	defaultLayout?: string;
}

function Header( { title }: { title: string } ) {
	return (
		<VStack className="dataforms-layouts-regular__header" spacing={ 4 }>
			<HStack alignment="center">
				<Heading level={ 2 } size={ 13 }>
					{ title }
				</Heading>
				<Spacer />
			</HStack>
		</VStack>
	);
}

export default function FormRegularField< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
	defaultLayout,
}: FormFieldProps< Item > ) {
	const { getFieldDefinition } = useContext( DataFormContext );
	const fieldDefinition = getFieldDefinition( field );
	const labelPosition =
		typeof field !== 'string' && field.labelPosition
			? field.labelPosition
			: 'top';
	const childrenFields = useMemo( () => {
		if ( typeof field !== 'string' && field.children ) {
			return field.children;
		}
		return [];
	}, [ field ] );

	if ( ! fieldDefinition ) {
		return null;
	}

	if ( childrenFields.length > 0 ) {
		return (
			<>
				{ ! hideLabelFromVision && (
					<Header title={ fieldDefinition.label } />
				) }
				<DataFormLayout
					data={ data }
					fields={ childrenFields }
					onChange={ onChange }
					defaultLayout={ defaultLayout }
				/>
			</>
		);
	}

	if ( labelPosition === 'side' ) {
		return (
			<HStack className="dataforms-layouts-regular__field">
				<div className="dataforms-layouts-regular__field-label">
					{ fieldDefinition.label }
				</div>
				<div className="dataforms-layouts-regular__field-control">
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

	return (
		<fieldDefinition.Edit
			data={ data }
			field={ fieldDefinition }
			onChange={ onChange }
			hideLabelFromVision={ hideLabelFromVision }
		/>
	);
}
