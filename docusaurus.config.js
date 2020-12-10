module.exports = {
  title: 'Flywheel Developer Docs',
  tagline: 'Resources for interacting with the Flywheel SDK',
  url: 'https://emilytrudeau.gitlab.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'Flywheel.io', // Usually your GitHub org/user name.
  projectName: 'SDK', // Usually your repo name.
  themeConfig: {
    prism: {
    additionalLanguages: ['matlab'],
    },
  algolia: {
    apiKey: 'PDYQBMT4Z7',
    indexName: 'SDK_docs',
        },
  scripts: [
    {
      src:
        'https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js',
      async: false,
    },
  ],
    navbar: {
      title: 'SDK',
      logo: {
        alt: 'Flywheel SDK',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
        to: "/reference",
        activeBasePath: "api",
        label: "API reference",
        position: "left",
        },
        {to: 'blog', label: 'Blog', position: 'left'},
        {
         href: 'https://docs.flywheel.io/hc/en-us',
         label: 'Knowledge Base',
         position: 'left',
        },
        {
          href: 'https://gitlab.com/flywheel-io',
          label: 'Gitlab',
          position: 'right',
        },
      ],
    },
     "colorMode": {
      "defaultMode": "light",
      "disableSwitch": true,
      "respectPrefersColorScheme": false,
      "switchConfig": {
        "darkIcon": "🌜",
        "darkIconStyle": {},
        "lightIcon": "🌞",
        "lightIconStyle": {}
      }
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'docs/',
            },
            {
              label: 'API Reference',
              to: 'reference/',
            },
            {
              label: 'Knowledge Base',
              href: 'https://docs.flywheel.io/hc/en-us',
            },
          ],
        },
        {
          title: 'Company',
          items: [
            {
              label: 'Flywheel.io',
              href: 'https://www.flywheel.io',
            },
            {
              label: 'Contact Support',
              href: 'https://docs.flywheel.io/hc/en-us/requests/new',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Flywheel Gear Exchange',
              href: 'https://flywheel.io/gear-exchange/',
            },
            {
              label: 'GitLab',
              href: 'https://gitlab.com/flywheel-io',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/flywheelio',
            },
            {
              label: 'Youtube',
              href: 'https://www.youtube.com/channel/UCFUZJp3LrLzS10uiUKNZJqg',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Flywheel Exchange, LLC.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        }
    ],
  ],
};
