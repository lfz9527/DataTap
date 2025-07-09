import Tracker from '../lib/index'

Tracker?.init?.()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    net-event-pilot
  </div>
`
