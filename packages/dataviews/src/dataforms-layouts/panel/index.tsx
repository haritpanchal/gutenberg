/**
 * WordPress dependencies
 */
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	Dropdown,
	Button,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { useState, useMemo, useContext } from '@wordpress/element';
import { closeSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { normalizeFields } from '../../normalize-fields';
import { getVisibleFields } from '../get-visible-fields';
import type { DataFormProps } from '../../types';
import FormFieldVisibility from '../../components/form-field-visibility';
import DataFormContext from '../../components/dataform-context';
import { DataFormLayout } from '../data-form-layout';

interface FormFieldProps< Item > {
	data: Item;
	field: FormField;
	onChange: ( value: any ) => void;
}

function DropdownHeader( {
	title,
	onClose,
}: {
	title: string;
	onClose: () => void;
} ) {
	return (
		<VStack
			className="dataforms-layouts-panel__dropdown-header"
			spacing={ 4 }
		>
			<HStack alignment="center">
				<Heading level={ 2 } size={ 13 }>
					{ title }
				</Heading>
				<Spacer />
				{ onClose && (
					<Button
						label={ __( 'Close' ) }
						icon={ closeSmall }
						onClick={ onClose }
						size="small"
					/>
				) }
			</HStack>
		</VStack>
	);
}

export function FormPanelField< Item >( {
	data,
	field,
	onChange,
}: FormFieldProps< Item > ) {
	const { getFieldDefinition } = useContext( DataFormContext );
	const fieldDefinition = getFieldDefinition(
		typeof field === 'string' ? field : field.id
	);
	const childrenFields = useMemo( () => {
		if ( typeof field !== 'string' && field.fields ) {
			return field.fields;
		}
		return [ field ];
	}, [ field ] );
	// Use internal state instead of a ref to make sure that the component
	// re-renders when the popover's anchor updates.
	const [ popoverAnchor, setPopoverAnchor ] = useState< HTMLElement | null >(
		null
	);
	// Memoize popoverProps to avoid returning a new object every time.
	const popoverProps = useMemo(
		() => ( {
			// Anchor the popover to the middle of the entire row so that it doesn't
			// move around when the label changes.
			anchor: popoverAnchor,
			placement: 'left-start',
			offset: 36,
			shift: true,
		} ),
		[ popoverAnchor ]
	);

	if ( ! fieldDefinition ) {
		return null;
	}

	return (
		<HStack
			ref={ setPopoverAnchor }
			className="dataforms-layouts-panel__field"
		>
			<div className="dataforms-layouts-panel__field-label">
				{ fieldDefinition.label }
			</div>
			<div>
				<Dropdown
					contentClassName="dataforms-layouts-panel__field-dropdown"
					popoverProps={ popoverProps }
					focusOnMount
					toggleProps={ {
						size: 'compact',
						variant: 'tertiary',
						tooltipPosition: 'middle left',
					} }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<Button
							className="dataforms-layouts-panel__field-control"
							size="compact"
							variant="tertiary"
							aria-expanded={ isOpen }
							aria-label={ sprintf(
								// translators: %s: Field name.
								__( 'Edit %s' ),
								fieldDefinition.label
							) }
							onClick={ onToggle }
						>
							<fieldDefinition.render item={ data } />
						</Button>
					) }
					renderContent={ ( { onClose } ) => (
						<>
							<DropdownHeader
								title={ fieldDefinition.label }
								onClose={ onClose }
							/>
							<DataFormLayout
								data={ data }
								fields={ childrenFields }
								onChange={ onChange }
							>
								{ ( FieldLayout, nestedField ) => (
									<FieldLayout
										key={
											typeof nestedField === 'string'
												? nestedField
												: nestedField.id
										}
										data={ data }
										field={ nestedField }
										onChange={ onChange }
									/>
								) }
							</DataFormLayout>
						</>
					) }
				/>
			</div>
		</HStack>
	);
}

export default function FormPanel< Item >( {
	data,
	fields,
	form,
	onChange,
}: DataFormProps< Item > ) {
	const visibleFields = useMemo(
		() =>
			normalizeFields(
				getVisibleFields< Item >(
					fields,
					form.fields,
					form.combinedFields
				)
			),
		[ fields, form.fields, form.combinedFields ]
	);

	return (
		<VStack spacing={ 2 }>
			{ visibleFields.map( ( field ) => {
				return (
					<FormFieldVisibility
						key={ field.id }
						data={ data }
						field={ field }
					>
						<FormField
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
