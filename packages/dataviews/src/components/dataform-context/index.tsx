/**
 * WordPress dependencies
 */
import { createContext, useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { NormalizedField } from '../../types';

type DataFormContextType< Item > = {
	getFieldDefinition: (
		field: string
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
		( field: string ) => {
			return fields.find(
				( fieldDefinition ) => fieldDefinition.id === field
			);
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
