/**
 * Internal dependencies
 */
import FormRegularField from './regular';
import FormPanelField from './panel';
import FormInlineField from './inline';

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
