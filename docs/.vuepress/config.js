const path =
module.exports = {
  title: 'Node API文档',
  description: '',
  head: [
    ['link', { rel: 'icon', href: '/images/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/images/logo.svg',
    displayAllHeaders: true,

    sidebarDepth: 2,
    sidebar: {
      '/api': [
        {
          title: 'Node API文档',
          collapsable: false,
          children: [
            ['/api/assert','assert 断言'],
          ]
        }
      ]
    }
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@img': '/images'
      }
    }
  }
}