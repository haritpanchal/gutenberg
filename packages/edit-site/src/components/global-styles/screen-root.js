/**
 * WordPress dependencies
 */
import {
	__experimentalItemGroup as ItemGroup,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	FlexItem,
	CardBody,
	Card,
	CardDivider,
	CardMedia,
} from '@wordpress/components';
import { isRTL, __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { IconWithCurrentColor } from './icon-with-current-color';
import { NavigationButtonAsItem } from './navigation-button';
import RootMenu from './root-menu';
import PreviewStyles from './preview-styles';
import { store as editSiteStore } from '../../store';
import { unlock } from '../../lock-unlock';

function ScreenRoot() {
	const { hasVariations, canEditCSS } = useSelect( ( select ) => {
		const {
			getEntityRecord,
			__experimentalGetCurrentGlobalStylesId,
			__experimentalGetCurrentThemeGlobalStylesVariations,
		} = select( coreStore );

		const globalStylesId = __experimentalGetCurrentGlobalStylesId();
		const globalStyles = globalStylesId
			? getEntityRecord( 'root', 'globalStyles', globalStylesId )
			: undefined;

		return {
			hasVariations:
				!! __experimentalGetCurrentThemeGlobalStylesVariations()
					?.length,
			canEditCSS: !! globalStyles?._links?.[ 'wp:action-edit-css' ],
		};
	}, [] );

	const { setEditorCanvasContainerView } = unlock(
		useDispatch( editSiteStore )
	);
	const loadAdditionalCSSView = () => {
		setEditorCanvasContainerView( 'global-styles-css' );
	};

	return (
		<Card
			size="small"
			className="edit-site-global-styles-screen-root"
			isRounded={ false }
		>
			<CardBody>
				<VStack spacing={ 4 }>
					<Card className="edit-site-global-styles-screen-root__active-style-tile">
						<CardMedia className="edit-site-global-styles-screen-root__active-style-tile-preview">
							<PreviewStyles />
						</CardMedia>
					</Card>
					{ hasVariations && (
						<ItemGroup>
							<NavigationButtonAsItem path="/variations">
								<HStack justify="space-between">
									<FlexItem>
										{ __( 'Browse styles' ) }
									</FlexItem>
									<IconWithCurrentColor
										icon={
											isRTL() ? chevronLeft : chevronRight
										}
									/>
								</HStack>
							</NavigationButtonAsItem>
						</ItemGroup>
					) }
					<RootMenu />
				</VStack>
			</CardBody>

			<CardDivider />

			<CardBody>
				<ItemGroup isBordered isSeparated>
					<NavigationButtonAsItem path="/blocks">
						<HStack justify="space-between">
							<FlexItem>{ __( 'Blocks' ) }</FlexItem>
							<IconWithCurrentColor
								icon={ isRTL() ? chevronLeft : chevronRight }
							/>
						</HStack>
					</NavigationButtonAsItem>
					{ canEditCSS && (
						<NavigationButtonAsItem
							path="/css"
							onClick={ loadAdditionalCSSView }
						>
							<HStack justify="space-between">
								<FlexItem>{ __( 'Additional CSS' ) }</FlexItem>
								<IconWithCurrentColor
									icon={
										isRTL() ? chevronLeft : chevronRight
									}
								/>
							</HStack>
						</NavigationButtonAsItem>
					) }
				</ItemGroup>
			</CardBody>
		</Card>
	);
}

export default ScreenRoot;
