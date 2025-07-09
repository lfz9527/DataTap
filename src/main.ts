import TrackerSDK from '../lib/index'

TrackerSDK?.init?.({
  config: {
    url: '',
    debug: true,
    platform: 'browser',
  },
  app_id: 'yisa',
  userInfo: {
    userId: '0',
  },
})

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    net-event-pilot
  </div>
`
