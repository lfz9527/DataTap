import TrackerSDK from '../lib/index'

TrackerSDK?.init?.('browser', {
  config: {
    baseUrl: 'http://localhost:7899',
    src: '/api/track',
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
