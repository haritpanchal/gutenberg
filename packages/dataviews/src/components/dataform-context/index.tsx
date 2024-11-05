/**
 * WordPress dependencies
 */
import { createContext, useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { FormField, NormalizedField } from '../../types';

type DataFormContextType< Item > = {
	getFieldDefinition: (
		field: FormField | string
	) => NormalizedField< Item > | undefined;
};

const DataFormContext = createContext< DataFormContextType< any > >( {
	getFieldDefinition: () => undefined,
} );

export function DataFormProvider< Item >( {
	fields,
	children,
}: React.PropsWithChildren< { fields: NormalizedField< Item >[] } > ) {
	const getFieldDefinition = useCallback(
		( field: FormField | string ) => {
			const fieldId = typeof field === 'string' ? field : field.id;

			const definition = fields.find(
				( fieldDefinition ) => fieldDefinition.id === fieldId
			);
			if ( definition ) {
				return {
					...definition,
					label:
						typeof field !== 'string' && field.label
							? field.label
							: definition.label,
				};
			}
			return undefined;
		},
		[ fields ]
	);

	return (
		<DataFormContext.Provider value={ { getFieldDefinition } }>
			{ children }
		</DataFormContext.Provider>
	);
}

export default DataFormContext;
