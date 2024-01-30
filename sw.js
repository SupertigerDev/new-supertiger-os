import fs from './fs.js';



const getFile = async (pathname) => {
  const file = await fs.readFile(pathname)
  return file
}

self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  const pathname = new URL(url).pathname;

  if (!url.startsWith(location.origin)) return;

  if (!pathname.startsWith("/hdd")) return;
  
  event.respondWith( (async () => {
      const blob = await getFile(pathname.substring(4))
      if (!blob) {
        return new Response("Not found", {status: 404})
      }
      return new Response(blob)
    })())
})