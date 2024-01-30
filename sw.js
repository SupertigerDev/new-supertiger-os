import fs from './fs.js';



const getFile = async (pathname) => {
  const file = await fs.readFile(pathname)
  return file
}

self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  const pathname = new URL(url).pathname;

  console.log("pathname debug", pathname)
  
  console.log("origin debug", url, location.origin)
  if (!url.startsWith(location.origin)) return;
  
  
  const basePath = "/new-supertiger-os"
  // const basePath = ""
  
  if (!pathname.startsWith(basePath + "/hdd")) return;
  
  event.respondWith((async () => {
      console.log("full path debug", pathname.substring(4 + basePath.length))
      const blob = await getFile(pathname.substring(4 + basePath.length))
      if (!blob) {
        return new Response("Not found", {status: 404})
      }
      return new Response(blob)
    })())
})