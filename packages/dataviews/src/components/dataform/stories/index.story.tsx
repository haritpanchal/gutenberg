/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DataForm from '../index';
import type { Field, Form, FormField } from '../../../types';

type SamplePost = {
	title: string;
	order: number;
	author: number;
	status: string;
	reviewer: string;
	date: string;
	birthdate: string;
	password?: string;
};

const meta = {
	title: 'DataViews/DataForm',
	component: DataForm,
	argTypes: {
		type: {
			control: { type: 'select' },
			description:
				'Chooses the default layout of each field. "regular" is the default layout.',
			options: [ 'regular', 'panel' ],
		},
		labelPosition: {
			control: { type: 'select' },
			description: 'Chooses the label position of the layout.',
			options: [ 'default', 'top', 'side' ],
		},
	},
};
export default meta;

const fields = [
	{
		id: 'title',
		label: 'Title',
		type: 'text' as const,
	},
	{
		id: 'order',
		label: 'Order',
		type: 'integer' as const,
	},
	{
		id: 'date',
		label: 'Date',
		type: 'datetime' as const,
	},
	{
		id: 'birthdate',
		label: 'Date as options',
		type: 'datetime' as const,
		elements: [
			{ value: '1970-02-23T12:00:00', label: "Jane's birth date" },
			{ value: '1950-02-23T12:00:00', label: "John's birth date" },
		],
	},
	{
		id: 'author',
		label: 'Author',
		type: 'integer' as const,
		elements: [
			{ value: 1, label: 'Jane' },
			{ value: 2, label: 'John' },
		],
	},
	{
		id: 'reviewer',
		label: 'Reviewer',
		type: 'text' as const,
		Edit: 'radio' as const,
		elements: [
			{ value: 'fulano', label: 'Fulano' },
			{ value: 'mengano', label: 'Mengano' },
			{ value: 'zutano', label: 'Zutano' },
		],
	},
	{
		id: 'status',
		label: 'Status',
		type: 'text' as const,
		elements: [
			{ value: 'draft', label: 'Draft' },
			{ value: 'published', label: 'Published' },
			{ value: 'private', label: 'Private' },
		],
	},
	{
		id: 'password',
		label: 'Password',
		type: 'text' as const,
		isVisible: ( item: SamplePost ) => {
			return item.status !== 'private';
		},
	},
	{
		id: 'sticky',
		label: 'Sticky',
		type: 'integer',
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
			const { id, getValue } = field;
			return (
				<ToggleControl
					__nextHasNoMarginBottom
					label={ hideLabelFromVision ? '' : field.label }
					checked={ getValue( { item: data } ) }
					onChange={ () =>
						onChange( { [ id ]: ! getValue( { item: data } ) } )
					}
				/>
			);
		},
	},
] as Field< SamplePost >[];

function toFormField(
	formFields: Array< string | FormField >,
	labelPosition: 'default' | 'top' | 'side',
	type: 'panel' | 'regular'
): FormField[] {
	return formFields.map( ( field ) => {
		if ( typeof field === 'string' ) {
			return {
				id: field,
				layout: type,
				labelPosition:
					labelPosition === 'default' ? undefined : labelPosition,
			};
		} else if (
			typeof field !== 'string' &&
			field.children &&
			type !== 'panel'
		) {
			return {
				...field,
				children: toFormField( field.children, labelPosition, type ),
			};
		}
		return field;
	} );
}

export const Default = ( {
	type,
	labelPosition,
}: {
	type: 'panel' | 'regular';
	labelPosition: 'default' | 'top' | 'side';
} ) => {
	const [ post, setPost ] = useState( {
		title: 'Hello, World!',
		order: 2,
		author: 1,
		status: 'draft',
		reviewer: 'fulano',
		date: '2021-01-01T12:00:00',
		birthdate: '1950-02-23T12:00:00',
		sticky: false,
	} );

	const form = useMemo(
		() => ( {
			fields: toFormField(
				[
					'title',
					'order',
					{
						id: 'sticky',
						layout: 'regular',
						labelPosition:
							type === 'regular' && labelPosition !== 'default'
								? labelPosition
								: 'side',
					},
					'author',
					'reviewer',
					'password',
					'date',
					'birthdate',
				],
				labelPosition,
				type
			),
		} ),
		[ type, labelPosition ]
	) as Form;

	return (
		<DataForm< SamplePost >
			data={ post }
			fields={ fields }
			form={ {
				...form,
				type,
			} }
			onChange={ ( edits ) =>
				setPost( ( prev ) => ( {
					...prev,
					...edits,
				} ) )
			}
		/>
	);
};

const CombinedFieldsComponent = ( {
	type = 'regular',
	labelPosition,
}: {
	type: 'panel' | 'regular';
	labelPosition: 'default' | 'top' | 'side';
} ) => {
	const [ post, setPost ] = useState< SamplePost >( {
		title: 'Hello, World!',
		order: 2,
		author: 1,
		status: 'draft',
		reviewer: 'fulano',
		date: '2021-01-01T12:00:00',
		birthdate: '1950-02-23T12:00:00',
	} );

	const form = useMemo(
		() => ( {
			fields: toFormField(
				[
					'title',
					{
						id: 'status',
						label: 'Status & Visibility',
						children: [ 'status', 'password' ],
					},
					'order',
					'author',
				],
				labelPosition,
				type
			),
		} ),
		[ type, labelPosition ]
	) as Form;

	return (
		<DataForm< SamplePost >
			data={ post }
			fields={ fields }
			form={ {
				...form,
				type,
			} }
			onChange={ ( edits ) =>
				setPost( ( prev ) => ( {
					...prev,
					...edits,
				} ) )
			}
		/>
	);
};

export const CombinedFields = {
	title: 'DataViews/CombinedFields',
	render: CombinedFieldsComponent,
	argTypes: {
		...meta.argTypes,
	},
	args: {
		type: 'panel',
	},
};
