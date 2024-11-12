/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useMemo, useCallback, useEffect } from '@wordpress/element';
import { privateApis as corePrivateApis } from '@wordpress/core-data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { privateApis as routerPrivateApis } from '@wordpress/router';
import { privateApis as editorPrivateApis } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import Page from '../page';
import AddNewTemplate from '../add-new-template';
import {
	TEMPLATE_POST_TYPE,
	OPERATOR_IS_ANY,
	LAYOUT_GRID,
	LAYOUT_TABLE,
	LAYOUT_LIST,
} from '../../utils/constants';
import { unlock } from '../../lock-unlock';
import {
	useEditPostAction,
	useSetActiveTemplateAction,
	useSetInactiveTemplateAction,
} from '../dataviews-actions';
import {
	authorField,
	descriptionField,
	previewField,
	titleField,
	activeField,
} from './fields';

const { usePostActions } = unlock( editorPrivateApis );
const { useHistory, useLocation } = unlock( routerPrivateApis );
const { useEntityRecordsWithPermissions } = unlock( corePrivateApis );

const EMPTY_ARRAY = [];

const defaultLayouts = {
	[ LAYOUT_TABLE ]: {
		fields: [ 'template', 'author', 'active' ],
		layout: {
			primaryField: 'title',
			combinedFields: [
				{
					id: 'template',
					label: __( 'Template' ),
					children: [ 'title', 'description' ],
					direction: 'vertical',
				},
			],
			styles: {
				template: {
					maxWidth: 400,
					minWidth: 320,
				},
				preview: {
					width: '1%',
				},
				author: {
					width: '1%',
				},
			},
		},
	},
	[ LAYOUT_GRID ]: {
		fields: [ 'title', 'description', 'author', 'active' ],
		layout: {
			mediaField: 'preview',
			primaryField: 'title',
			columnFields: [ 'description' ],
		},
	},
	[ LAYOUT_LIST ]: {
		fields: [ 'title', 'description', 'author', 'active' ],
		layout: {
			primaryField: 'title',
		},
	},
};

const DEFAULT_VIEW = {
	type: LAYOUT_GRID,
	search: '',
	page: 1,
	perPage: 20,
	sort: {
		field: 'title',
		direction: 'asc',
	},
	fields: defaultLayouts[ LAYOUT_GRID ].fields,
	layout: defaultLayouts[ LAYOUT_GRID ].layout,
	filters: [],
};

export default function PageTemplates() {
	const { params } = useLocation();
	const { activeView = 'user', layout, postId } = params;
	const [ selection, setSelection ] = useState( [ postId ] );
	const defaultView = useMemo( () => {
		const usedType = layout ?? DEFAULT_VIEW.type;
		return {
			...DEFAULT_VIEW,
			type: usedType,
			layout: defaultLayouts[ usedType ].layout,
			fields: defaultLayouts[ usedType ].fields,
			filters:
				activeView !== 'user'
					? [
							{
								field: 'author',
								operator: 'isAny',
								value: [ activeView ],
							},
					  ]
					: [],
		};
	}, [ layout, activeView ] );
	const [ view, setView ] = useState( defaultView );
	useEffect( () => {
		setView( ( currentView ) => ( {
			...currentView,
			filters:
				activeView !== 'user'
					? [
							{
								field: 'author',
								operator: OPERATOR_IS_ANY,
								value: [ activeView ],
							},
					  ]
					: [],
		} ) );
	}, [ activeView ] );

	const kind =
		activeView === 'user' ? TEMPLATE_POST_TYPE : '_wp_static_template';

	const { records, isResolving: isLoadingData } =
		useEntityRecordsWithPermissions( 'postType', kind, {
			// To do: for user templates, we want server side pagination.
			per_page: -1,
			status: 'publish,draft',
		} );

	const history = useHistory();
	const onChangeSelection = useCallback(
		( items ) => {
			setSelection( items );
			if ( view?.type === LAYOUT_LIST ) {
				history.push( {
					...params,
					postId: items.length === 1 ? items[ 0 ] : undefined,
				} );
			}
		},
		[ history, params, view?.type ]
	);

	const authors = useMemo( () => {
		if ( ! records ) {
			return EMPTY_ARRAY;
		}
		const authorsSet = new Set();
		records.forEach( ( template ) => {
			authorsSet.add( template.author_text );
		} );
		return Array.from( authorsSet ).map( ( author ) => ( {
			value: author,
			label: author,
		} ) );
	}, [ records ] );

	const fields = useMemo( () => {
		const _fields = [
			previewField,
			titleField,
			descriptionField,
			{
				...authorField,
				elements: authors,
			},
		];
		if ( activeView === 'user' ) {
			_fields.push( activeField );
		}
		return _fields;
	}, [ authors, activeView ] );

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( records, view, fields );
	}, [ records, view, fields ] );

	const postTypeActions = usePostActions( {
		postType: TEMPLATE_POST_TYPE,
		context: 'list',
	} );
	const editAction = useEditPostAction();
	const setActiveTemplateAction = useSetActiveTemplateAction();
	const setInactiveTemplateAction = useSetInactiveTemplateAction();
	const actions = useMemo(
		() =>
			activeView === 'user'
				? [
						setActiveTemplateAction,
						setInactiveTemplateAction,
						editAction,
						...postTypeActions,
				  ]
				: [ setActiveTemplateAction, ...postTypeActions ],
		[
			postTypeActions,
			setActiveTemplateAction,
			setInactiveTemplateAction,
			editAction,
			activeView,
		]
	);

	const onChangeView = useCallback(
		( newView ) => {
			if ( newView.type !== view.type ) {
				history.push( {
					...params,
					layout: newView.type,
				} );
			}

			setView( newView );
		},
		[ view.type, setView, history, params ]
	);

	return (
		<Page
			className="edit-site-page-templates"
			title={ __( 'Templates' ) }
			actions={ <AddNewTemplate /> }
		>
			<DataViews
				key={ activeView }
				paginationInfo={ paginationInfo }
				fields={ fields }
				actions={ actions }
				data={ data }
				isLoading={ isLoadingData }
				view={ view }
				onChangeView={ onChangeView }
				onChangeSelection={ onChangeSelection }
				selection={ selection }
				defaultLayouts={ defaultLayouts }
			/>
		</Page>
	);
}
