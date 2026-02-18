import { ExpressAdapter } from "@bull-board/express"

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/api/v1/admin/queues')

export default serverAdapter