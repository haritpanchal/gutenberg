<?php

/**
 * Preload necessary resources for the editors.
 *
 * @param array                   $paths   REST API paths to preload.
 * @param WP_Block_Editor_Context $context Current block editor context
 *
 * @return array Filtered preload paths.
 */
function gutenberg_block_editor_preload_paths_6_8( $paths, $context ) {
	if ( 'core/edit-site' === $context->name ) {
		if ( ! empty( $_GET['postId'] ) ) {
			$route_for_post = rest_get_route_for_post( $_GET['postId'] );
			if ( $route_for_post ) {
				$paths[] = add_query_arg( 'context', 'edit', $route_for_post );
			}
		}

		$paths[] = '/wp/v2/settings';
		$paths[] = array( '/wp/v2/settings', 'OPTIONS' );
		$paths[] = '/?_fields=' . implode(
			',',
			// @see packages/core-data/src/entities.js
			array(
				'description',
				'gmt_offset',
				'home',
				'name',
				'site_icon',
				'site_icon_url',
				'site_logo',
				'timezone_string',
				'url',
			)
		);
		// $paths[] = '/wp/v2/templates/lookup?slug=front-page';
		// $paths[] = '/wp/v2/templates/lookup?slug=home';

		// remove /wp/v2/templates?context=edit&per_page=-1
		$paths = array_filter( $paths, function( $path ) {
			return $path !== '/wp/v2/templates?context=edit&per_page=-1';
		} );
	}

	// Preload theme and global styles paths.
	if ( 'core/edit-site' === $context->name || 'core/edit-post' === $context->name ) {
		$global_styles_id = WP_Theme_JSON_Resolver_Gutenberg::get_user_global_styles_post_id();
		$excluded_paths   = array();
		/*
		 * Removes any edit or view context paths originating from Core,
		 * or elsewhere, e.g., gutenberg_block_editor_preload_paths_6_6().
		 * Aside from not preloading unnecessary contexts, it also ensures there no duplicates,
		 * leading to a small optimization: block_editor_rest_api_preload() does not dedupe,
		 * and will fire off a WP_REST_Request for every path. In the case of
		 * `/wp/v2/global-styles/*` this will create a new WP_Theme_JSON() instance.
		 */
		$excluded_paths[] = '/wp/v2/global-styles/' . $global_styles_id . '?context=view';
		// Removes any edit context path originating from gutenberg_block_editor_preload_paths_6_6().
		$excluded_paths[] = '/wp/v2/global-styles/' . $global_styles_id . '?context=edit';
		foreach ( $paths as $key => $path ) {
			if ( in_array( $path, $excluded_paths, true ) ) {
				unset( $paths[ $key ] );
			}
		}

		/*
		 * Preload the global styles path with the correct context based on user caps.
		 * NOTE: There is an equivalent conditional check in the client-side code to fetch
		 * the global styles entity using the appropriate context value.
		 * See the call to `canUser()`, under `useGlobalStylesUserConfig()` in `packages/edit-site/src/components/use-global-styles-user-config/index.js`.
		 * Please ensure that the equivalent check is kept in sync with this preload path.
		 */
		$context = current_user_can( 'edit_theme_options' ) ? 'edit' : 'view';
		$paths[] = "/wp/v2/global-styles/$global_styles_id?context=$context";
	}
	return $paths;
}
add_filter( 'block_editor_rest_api_preload_paths', 'gutenberg_block_editor_preload_paths_6_8', 10, 2 );

// How does this work?
// 1. For wp_template, we remove the custom templates controller, so it becomes
// and normals posts endpoint.

function gutenberg_modify_wp_template_post_type_args( $args, $post_type ) {
	if ( 'wp_template' === $post_type ) {
		$args['rest_base']                       = 'wp_template';
		$args['rest_controller_class']           = 'WP_REST_Posts_Controller';
		$args['autosave_rest_controller_class']  = null;
		$args['revisions_rest_controller_class'] = null;
		register_meta(
			$post_type,
			'origin',
			array(
				'show_in_rest' => true,
				'single'       => true,
				'type'         => 'string',
			)
		);
	}
	return $args;
}

add_filter( 'register_post_type_args', 'gutenberg_modify_wp_template_post_type_args', 10, 2 );

// 2. We maintain the routes for /templates and /templates/lookup. I think we'll
// need to deprecate /templates eventually, but we'll still want to be able to
// lookup the active template for a specific slug, and probably get a list of
// all _active_ templates. For that we can keep /lookup.

function gutenberg_maintain_templates_routes() {
	// This should later be changed in core so we don't need initialise
	// WP_REST_Templates_Controller with a post type.
	global $wp_post_types;
	$wp_post_types['wp_template']->rest_base = 'templates';
	$controller                              = new WP_REST_Templates_Controller( 'wp_template' );
	$wp_post_types['wp_template']->rest_base = 'wp_template';
	$controller->register_routes();
}
add_action( 'rest_api_init', 'gutenberg_maintain_templates_routes' );

// 3. Even though this doesn't need to exist as a post type, we need routes to
// get that raw static templates from themes and plugins. I did not want to
// templates for back-compat. Also I registered these as a post type route
// because right now the EditorProvider assumes templates are posts.

function gutenberg_setup_static_template() {
	global $wp_post_types;
	$wp_post_types['_wp_static_template']                          = clone $wp_post_types['wp_template'];
	$wp_post_types['_wp_static_template']->name =                  '_wp_static_template';
	$wp_post_types['_wp_static_template']->rest_base =             '_wp_static_template';
	$wp_post_types['_wp_static_template']->rest_controller_class = 'Gutenberg_REST_Static_Templates_Controller';
}
add_action( 'init', 'gutenberg_setup_static_template' );

class Gutenberg_REST_Static_Templates_Controller extends WP_REST_Templates_Controller {
	public function __construct( $post_type ) {
		parent::__construct( $post_type );
	}

	public function register_routes() {
		// Lists all templates.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		// Lists/updates a single template based on the given id.
		register_rest_route(
			$this->namespace,
			// The route.
			sprintf(
				'/%s/(?P<id>%s%s)',
				$this->rest_base,
				/*
				 * Matches theme's directory: `/themes/<subdirectory>/<theme>/` or `/themes/<theme>/`.
				 * Excludes invalid directory name characters: `/:<>*?"|`.
				 */
				'([^\/:<>\*\?"\|]+(?:\/[^\/:<>\*\?"\|]+)?)',
				// Matches the template name.
				'[\/\w%-]+'
			),
			array(
				'args'   => array(
					'id' => array(
						'description'       => __( 'The id of a template' ),
						'type'              => 'string',
						'sanitize_callback' => array( $this, '_sanitize_template_id' ),
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'context' => $this->get_context_param( array( 'default' => 'view' ) ),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	public function get_items( $request ) {
		$template_files        = _get_block_templates_files( 'wp_template', $query );
		foreach ( $template_files as $template_file ) {
			$query_result[] = _build_block_template_result_from_file( $template_file, 'wp_template' );
		}

		$templates = array();
		foreach ( $query_result as $template ) {
			$data        = $this->prepare_item_for_response( $template, $request );
			$templates[] = $this->prepare_response_for_collection( $data );
		}

		return rest_ensure_response( $templates );
	}

	public function get_item( $request ) {
		$template = get_block_file_template( $request['id'], 'wp_template' );

		if ( ! $template ) {
			return new WP_Error( 'rest_template_not_found', __( 'No templates exist with that id.' ), array( 'status' => 404 ) );
		}

		return $this->prepare_item_for_response( $template, $request );
	}
}

function gutenberg_set_active_template_theme( $post_id ) {
	// Get the post object
	$post = get_post( $post_id );

	// Until we refactor core, we must set the wp_theme to the active theme when
	// activating a template.
	if ( $post->post_type === 'wp_template' ) {
		if ( $post->post_status === 'publish' ) {
			wp_set_post_terms( $post_id, get_stylesheet(), 'wp_theme' );
			// Unpublish all other templates for slug
			$other_templates = get_posts( array(
				'post_type' => 'wp_template',
				'post_status' => 'publish',
				'name' => $post->post_name,
			) );
			foreach ( $other_templates as $other_template ) {
				if ( $other_template->ID !== $post_id ) {
					wp_update_post( array(
						'ID' => $other_template->ID,
						'post_status' => 'draft',
					) );
				}
			}
		} else {
			// remove all wp_theme terms
			$terms = wp_get_post_terms( $post_id, 'wp_theme' );
			foreach ( $terms as $term ) {
				wp_remove_object_terms( $post_id, $term->term_id, 'wp_theme' );
			}
		}
	}
}

add_action( 'save_post', 'gutenberg_set_active_template_theme' );

function gutenberg_allow_template_slugs_to_be_duplicated( $override, $slug, $post_id, $post_status, $post_type ) {
	return $post_type === 'wp_template' ? $slug : $override;
}

add_filter( 'pre_wp_unique_post_slug', 'gutenberg_allow_template_slugs_to_be_duplicated', 10, 5 );
