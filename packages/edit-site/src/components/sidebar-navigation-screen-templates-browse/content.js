/**
 * WordPress dependencies
 */
import { useEntityRecords } from '@wordpress/core-data';
import { useMemo } from '@wordpress/element';
import { __experimentalItemGroup as ItemGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import DataViewItem from '../sidebar-dataviews/dataview-item';
import { useAddedBy } from '../page-templates/hooks';
import { layout } from '@wordpress/icons';
import { TEMPLATE_POST_TYPE } from '../../utils/constants';

const EMPTY_ARRAY = [];

function TemplateDataviewItem( { template, isActive } ) {
	const { text, icon } = useAddedBy( template.type, template.id );
	return (
		<DataViewItem
			key={ text }
			slug={ text }
			title={ text }
			icon={ icon }
			isActive={ isActive }
			isCustom={ false }
		/>
	);
}

export default function DataviewsTemplatesSidebarContent( {
	activeView,
	title,
} ) {
	const { records } = useEntityRecords( 'postType', '_wp_static_template', {
		per_page: -1,
	} );
	console.log( records );
	const firstItemPerAuthorText = useMemo( () => {
		const firstItemPerAuthor = records?.reduce( ( acc, template ) => {
			const author = template.author_text;
			if ( author && ! acc[ author ] ) {
				acc[ author ] = template;
			}
			return acc;
		}, {} );
		return (
			( firstItemPerAuthor && Object.values( firstItemPerAuthor ) ) ??
			EMPTY_ARRAY
		);
	}, [ records ] );

	return (
		<ItemGroup>
			<DataViewItem
				slug="user"
				title={ __( 'User templates' ) }
				icon={ layout }
				isActive={ activeView === 'user' }
				isCustom={ false }
			/>
			{ firstItemPerAuthorText.map( ( template ) => {
				return (
					<TemplateDataviewItem
						key={ template.author_text }
						template={ template }
						isActive={ activeView === template.author_text }
					/>
				);
			} ) }
		</ItemGroup>
	);
}
