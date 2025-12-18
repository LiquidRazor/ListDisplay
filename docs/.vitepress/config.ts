import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'ListDisplay',
    description: 'Docs for @liquidrazor/list-display',

    // IMPORTANT for GitHub Pages project sites:
    // https://<user>.github.io/<repo>/
    base: '/ListDisplay/',

    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'API', link: '/api/' }
        ],

        sidebar: [
            {
                text: 'Docs',
                items: [
                    { text: 'Home', link: '/' }
                ]
            },
            {
                text: 'API Reference',
                items: [
                    { text: 'API Index', link: '/api/' },
                    { text: 'Package: @liquidrazor/list-display', link: '/api/list-display' }
                ]
            }
        ]
    }
})
