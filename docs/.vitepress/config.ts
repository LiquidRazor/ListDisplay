import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'ListDisplay',
    description: 'Docs for @liquidrazor/list-display',
    base: '/ListDisplay/',

    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/' },               // if you have one; if not, remove
            { text: 'API', link: '/reference/api' }
        ],

        sidebar: [
            {
                text: 'API Overview',
                collapsed: false,
                items: [
                    { text: 'API Home', link: '/reference/api/' },
                    { text: 'Component', link: '/reference/component/' }
                ]
            },

            {
                text: 'Core',
                collapsed: false,
                items: [
                    { text: 'Context', link: '/reference/core/context/' },
                    { text: 'Data', link: '/reference/core/data/' },
                    { text: 'Store', link: '/reference/core/store/' }
                ]
            },

            {
                text: 'Features',
                collapsed: false,
                items: [
                    { text: 'Filtering', link: '/reference/features/filtering/' },
                    { text: 'Sorting', link: '/reference/features/sorting/' },
                    { text: 'Pagination', link: '/reference/features/pagination/' },
                    { text: 'Selection', link: '/reference/features/selection/' },
                    { text: 'Actions', link: '/reference/features/actions/' },
                    { text: 'Modals', link: '/reference/features/modals/' }
                ]
            },

            {
                text: 'UI',
                collapsed: true,
                items: [
                    { text: 'Slots', link: '/reference/ui/slots/' }
                ]
            },

            {
                text: 'Everything Else',
                collapsed: true,
                items: [
                    { text: 'Misc API', link: '/reference/api/' } // yes, dumb name. see below.
                ]
            }
        ]
    }
})
