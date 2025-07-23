import TrackerSDK from '../lib/index'

TrackerSDK?.init?.('browser', {
  config: {
    baseUrl: 'http://192.168.31.103:8003',
    src: '/api/Browser/AddBrowser',
    debug: true,
    client: 'web',
  },
  app_id: 'yisa',
  app_version: '1.2.3',
  userInfo: {
    userId: '0',
    userName: '测试',
  },
})

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    net-event-pilot

    <a href="http://localhost:5199/222" target="_blank">测试链接跳转</a>
  </div>
`
