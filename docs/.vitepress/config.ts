import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'ListDisplay',
    description: 'Docs for @liquidrazor/list-display',

    // IMPORTANT for GitHub Pages project sites:
    // https://<user>.github.io/<repo>/
    base: '/LiquidRazor/ListDisplay/',

    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'API', link: '/api/list-display' }
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
                    { text: 'Api', link: '/api/list-display' }
                ]
            }
        ]
    }
})
