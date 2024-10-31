/**
 * Internal dependencies
 */
import type { Field, FormField } from '../types';

export function getVisibleFields< Item >(
	fields: Field< Item >[],
	formFields: FormField[] = []
): Field< Item >[] {
	const visibleFields: Array< Field< Item > > = [ ...fields ];
	return formFields
		.map( ( fieldId ) =>
			visibleFields.find( ( { id } ) => id === fieldId )
		)
		.filter( ( field ): field is Field< Item > => !! field );
}
