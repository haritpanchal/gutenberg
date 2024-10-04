/**
 * WordPress dependencies
 */
import { createContext } from '@wordpress/element';

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
	// const context = useContext( DataFormContext );

	function getFieldDefinition( field: string ) {
		return fields.find(
			( fieldDefinition ) => fieldDefinition.id === field
		);
	}

	return (
		<DataFormContext.Provider value={ { getFieldDefinition } }>
			{ children }
		</DataFormContext.Provider>
	);
}

export default DataFormContext;
