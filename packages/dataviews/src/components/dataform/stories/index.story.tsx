/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import DataForm from '../index';
import type { Field, Form } from '../../../types';

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
			options: [ 'regular', 'panel', 'inline' ],
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

export const Default = ( {
	type,
}: {
	type: 'panel' | 'regular' | 'inline';
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

	const form = {
		fields: [
			'title',
			'order',
			{
				id: 'sticky',
				layout: type === 'regular' ? 'regular' : 'inline',
			},
			'author',
			'reviewer',
			'password',
			'date',
			'birthdate',
		],
	} as Form;

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
}: {
	type: 'panel' | 'regular' | 'inline';
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

	const form = {
		fields: [
			'title',
			...( type === 'regular'
				? [ 'status', 'password' ]
				: [
						{
							id: 'status',
							layout: 'panel',
							children: [ 'status', 'password' ],
						},
				  ] ),
			'order',
			'author',
		],
	} as Form;

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
