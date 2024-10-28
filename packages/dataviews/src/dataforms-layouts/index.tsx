/**
 * Internal dependencies
 */
import FormRegular, { FormRegularField } from './regular';
import FormPanel, { FormPanelField } from './panel';
import { FormInlineField } from './inline';

const FORM_LAYOUTS = [
	{
		type: 'regular',
		component: FormRegular,
	},
	{
		type: 'panel',
		component: FormPanel,
	},
];

export function getFormLayout( type: string ) {
	return FORM_LAYOUTS.find( ( layout ) => layout.type === type );
}

const FORM_FIELD_LAYOUTS = [
	{
		type: 'regular',
		component: FormRegularField,
	},
	{
		type: 'panel',
		component: FormPanelField,
	},
	{
		type: 'inline',
		component: FormInlineField,
	},
];

export function getFormFieldLayout( type: string ) {
	return FORM_FIELD_LAYOUTS.find( ( layout ) => layout.type === type );
}
