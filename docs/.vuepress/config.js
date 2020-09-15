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
              ['/api/addons', 'addons'],
              ['/api/assert', 'assert 断言'],
              ['/api/async_hooks', 'async_hooks'],
              ['/api/buffer', 'buffer'],
              ['/api/child_process', 'child_process 子进程'],
              ['/api/cli', 'cli'],
              ['/api/cluster', 'cluster'],
              ['/api/console', 'console'],
              ['/api/crypto', 'crypto'],
              ['/api/debugger', 'debugger'],
              ['/api/deprecations', 'deprecations'],
              ['/api/dgram', 'dgram'],
              ['/api/dns', 'dns'],
              ['/api/documentation', 'documentation'],
              ['/api/domain', 'domain'],
              ['/api/embedding', 'embedding'],
              ['/api/errors', 'errors'],
              ['/api/esm', 'esm'],
              ['/api/events', 'events'],
              ['/api/fs', 'fs'],
              ['/api/http', 'http'],
              ['/api/http2', 'http2'],
              ['/api/https', 'https'],
              ['/api/inspector', 'inspector'],
              ['/api/modules', 'modules'],
              ['/api/n-api', 'n-api'],
              ['/api/net', 'net'],
              ['/api/os', 'os'],
              ['/api/path', 'path'],
              ['/api/perf_hooks', 'perf_hooks'],
              ['/api/policy', 'policy'],
              ['/api/punycode', 'punycode'],
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